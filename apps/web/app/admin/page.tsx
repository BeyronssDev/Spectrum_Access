"use client";

import { Check, Image as ImageIcon, RefreshCw, ShieldCheck, TriangleAlert, UserCog, X } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { collection, getDocs, getFirestore, limit, query, where, type DocumentData } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { requireFirebaseApp } from "../lib/firebase";

const functionsRegion = "europe-west1";

type PendingImage = {
  id: string;
  placeId: string;
  authorUid: string;
  storagePath: string;
  createdAt: string;
  url?: string;
};

type AccessClaims = {
  superAdmin: boolean;
  admin: boolean;
  moderator: boolean;
};

function readPendingImage(id: string, data: DocumentData): PendingImage | null {
  const storagePath = typeof data.storagePath === "string" ? data.storagePath : "";
  if (!storagePath) {
    return null;
  }

  return {
    id,
    storagePath,
    placeId: typeof data.placeId === "string" ? data.placeId : "",
    authorUid: typeof data.authorUid === "string" ? data.authorUid : "",
    createdAt: typeof data.createdAt?.toDate === "function" ? data.createdAt.toDate().toLocaleString("ca-ES") : ""
  };
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<AccessClaims>({ superAdmin: false, admin: false, moderator: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantModerator, setGrantModerator] = useState(true);
  const [grantAdmin, setGrantAdmin] = useState(false);
  const [grantBusy, setGrantBusy] = useState(false);

  const loadPendingImages = useCallback(async () => {
    const app = requireFirebaseApp();
    const storage = getStorage(app);
    const snapshot = await getDocs(
      query(collection(getFirestore(app), "placeImages"), where("status", "==", "pending"), limit(25))
    );
    const images = await Promise.all(
      snapshot.docs
        .map((doc) => readPendingImage(doc.id, doc.data()))
        .filter((image): image is PendingImage => image !== null)
        .map(async (image) => ({
          ...image,
          url: await getDownloadURL(ref(storage, image.storagePath)).catch(() => undefined)
        }))
    );
    setPendingImages(images);
  }, []);

  const refreshPendingImages = useCallback(async () => {
    setIsRefreshing(true);
    setMessage("");
    try {
      await loadPendingImages();
    } catch {
      setMessage("No s'ha pogut carregar la cua de moderació.");
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPendingImages]);

  useEffect(() => {
    const app = requireFirebaseApp();
    const unsubscribe = onAuthStateChanged(getAuth(app), async (nextUser) => {
      setUser(nextUser);
      setPendingImages([]);

      if (!nextUser) {
        setClaims({ superAdmin: false, admin: false, moderator: false });
        setIsLoading(false);
        return;
      }

      const token = await nextUser.getIdTokenResult(true);
      const superAdmin = token.claims.superAdmin === true;
      const nextClaims = {
        superAdmin,
        admin: superAdmin || token.claims.admin === true,
        moderator: superAdmin || token.claims.moderator === true || token.claims.admin === true
      };
      setClaims(nextClaims);

      if (nextClaims.moderator) {
        await loadPendingImages().catch(() => setMessage("No s'ha pogut carregar la cua de moderació."));
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, [loadPendingImages]);

  async function moderateImage(imageId: string, status: "active" | "rejected") {
    const app = requireFirebaseApp();
    setBusyImageId(imageId);
    setMessage("");
    try {
      const callable = httpsCallable<
        { collectionId: string; targetId: string; status: string; reason?: string },
        { targetId: string; status: string }
      >(getFunctions(app, functionsRegion), "moderateContent");
      await callable({
        collectionId: "placeImages",
        targetId: imageId,
        status,
        ...(status === "rejected" ? { reason: "Rebutjada des del panell d'administració." } : {})
      });
      setPendingImages((current) => current.filter((image) => image.id !== imageId));
      setMessage(status === "active" ? "Imatge aprovada." : "Imatge rebutjada.");
    } catch {
      setMessage("No s'ha pogut actualitzar aquesta imatge.");
    } finally {
      setBusyImageId(null);
    }
  }

  async function grantAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const app = requireFirebaseApp();
    setGrantBusy(true);
    setMessage("");
    try {
      const callable = httpsCallable<
        { email: string; admin: boolean; moderator: boolean },
        { email?: string; roles: string[]; claims: AccessClaims }
      >(getFunctions(app, functionsRegion), "setUserAccessClaims");
      const result = await callable({
        email: grantEmail.trim(),
        admin: grantAdmin,
        moderator: grantModerator || grantAdmin
      });
      setMessage(`${result.data.email ?? grantEmail} actualitzat: ${result.data.roles.join(", ")}.`);
      setGrantEmail("");
      setGrantModerator(true);
      setGrantAdmin(false);
    } catch {
      setMessage("No s'han pogut donar permisos. Comprova que aquest email ja tingui compte.");
    } finally {
      setGrantBusy(false);
    }
  }

  if (isLoading) {
    return (
      <main className="spectrum-app">
        <section className="admin-gate panel">
          <RefreshCw aria-hidden="true" size={30} />
          <h1>Carregant administració</h1>
        </section>
      </main>
    );
  }

  if (!user || !claims.moderator) {
    return (
      <main className="spectrum-app">
        <section className="admin-gate panel">
          <TriangleAlert aria-hidden="true" size={30} />
          <h1>Zona d'administració restringida</h1>
          <p>Inicia sessió amb un compte administrador o moderador per revisar contingut pendent.</p>
          <a className="admin-link" href="/">
            Tornar a Spectrum Access
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="spectrum-app">
      <section className="admin-dashboard">
        <div className="section-intro admin-heading">
          <ShieldCheck aria-hidden="true" size={32} />
          <div>
            <h1>Administració</h1>
            <p>{user.email}</p>
          </div>
          <button className="admin-icon-button" type="button" onClick={refreshPendingImages} disabled={isRefreshing}>
            <RefreshCw aria-hidden="true" size={18} />
            <span>Actualitzar</span>
          </button>
        </div>

        {message ? <p className="admin-message">{message}</p> : null}

        <div className="admin-queue-grid">
          <article className="panel admin-queue-card">
            <p>Imatges pendents</p>
            <strong>{pendingImages.length}</strong>
          </article>
          <article className="panel admin-queue-card">
            <p>Permís actual</p>
            <strong>{claims.superAdmin ? "Super" : claims.admin ? "Admin" : "Mod"}</strong>
          </article>
          <article className="panel admin-queue-card">
            <p>Usuari</p>
            <strong>{user.emailVerified ? "OK" : "Mail"}</strong>
          </article>
        </div>

        <section className="admin-main-grid">
          <div className="panel admin-list-panel">
            <div className="panel-heading">
              <div>
                <span>Cua</span>
                <h3>Fotos per revisar</h3>
              </div>
            </div>
            <div className="admin-image-list">
              {pendingImages.length === 0 ? (
                <p className="admin-empty">No hi ha imatges pendents.</p>
              ) : (
                pendingImages.map((image) => (
                  <article className="admin-image-row" key={image.id}>
                    <div className="admin-thumb">
                      {image.url ? <img src={image.url} alt="" /> : <ImageIcon aria-hidden="true" size={26} />}
                    </div>
                    <div>
                      <strong>{image.storagePath.split("/").at(-1)}</strong>
                      <span>{image.createdAt || image.placeId}</span>
                    </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        onClick={() => moderateImage(image.id, "active")}
                        disabled={busyImageId === image.id}
                        aria-label="Aprovar imatge"
                      >
                        <Check aria-hidden="true" size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateImage(image.id, "rejected")}
                        disabled={busyImageId === image.id}
                        aria-label="Rebutjar imatge"
                      >
                        <X aria-hidden="true" size={18} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {claims.superAdmin ? (
            <form className="panel admin-grant-panel" onSubmit={grantAccess}>
              <div className="panel-heading">
                <div>
                  <span>Permisos</span>
                  <h3>Donar accés</h3>
                </div>
                <UserCog aria-hidden="true" size={24} />
              </div>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={grantEmail}
                  onChange={(event) => setGrantEmail(event.target.value)}
                  placeholder="professional@example.com"
                  required
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={grantModerator}
                  onChange={(event) => setGrantModerator(event.target.checked)}
                />
                Moderador
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={grantAdmin} onChange={(event) => setGrantAdmin(event.target.checked)} />
                Administrador
              </label>
              <button className="auth-submit" type="submit" disabled={grantBusy}>
                Guardar permisos
              </button>
            </form>
          ) : null}
        </section>
      </section>
    </main>
  );
}
