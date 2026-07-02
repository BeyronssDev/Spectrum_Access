"use client";

import { CalendarDays, Check, Image as ImageIcon, MapPinned, RefreshCw, ShieldCheck, TriangleAlert, UserCog, X } from "lucide-react";
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

type PendingEventExperience = {
  id: string;
  eventSeriesId: string;
  eventEditionId: string;
  eventZoneId: string;
  authorUid: string;
  observedAt: string;
  description: string;
  photoPath: string;
  url?: string;
};

type EventSeriesRow = {
  id: string;
  title: string;
  city: string;
  status: string;
};

type EventEditionRow = {
  id: string;
  eventSeriesId: string;
  title: string;
  status: string;
};

type EventZoneRow = {
  id: string;
  eventEditionId: string;
  name: string;
  status: string;
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

function readPendingExperience(id: string, data: DocumentData): PendingEventExperience | null {
  const photoPath = typeof data.photoPath === "string" ? data.photoPath : "";
  if (!photoPath) {
    return null;
  }

  return {
    id,
    photoPath,
    eventSeriesId: typeof data.eventSeriesId === "string" ? data.eventSeriesId : "",
    eventEditionId: typeof data.eventEditionId === "string" ? data.eventEditionId : "",
    eventZoneId: typeof data.eventZoneId === "string" ? data.eventZoneId : "",
    authorUid: typeof data.authorUid === "string" ? data.authorUid : "",
    observedAt: typeof data.observedAt === "string" ? data.observedAt : "",
    description: typeof data.description === "string" ? data.description : ""
  };
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<AccessClaims>({ superAdmin: false, admin: false, moderator: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [pendingEventExperiences, setPendingEventExperiences] = useState<PendingEventExperience[]>([]);
  const [eventSeries, setEventSeries] = useState<EventSeriesRow[]>([]);
  const [eventEditions, setEventEditions] = useState<EventEditionRow[]>([]);
  const [eventZones, setEventZones] = useState<EventZoneRow[]>([]);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [busyEventExperienceId, setBusyEventExperienceId] = useState<string | null>(null);
  const [busyCatalogItemId, setBusyCatalogItemId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantModerator, setGrantModerator] = useState(true);
  const [grantAdmin, setGrantAdmin] = useState(false);
  const [grantBusy, setGrantBusy] = useState(false);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesCity, setSeriesCity] = useState("");
  const [editionSeriesId, setEditionSeriesId] = useState("");
  const [editionTitle, setEditionTitle] = useState("");
  const [editionYear, setEditionYear] = useState(new Date().getFullYear().toString());
  const [editionStartsAt, setEditionStartsAt] = useState("");
  const [editionEndsAt, setEditionEndsAt] = useState("");
  const [zoneEditionId, setZoneEditionId] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [zoneLatitude, setZoneLatitude] = useState("");
  const [zoneLongitude, setZoneLongitude] = useState("");
  const [zoneRadius, setZoneRadius] = useState("150");

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

  const loadEventAdminData = useCallback(async () => {
    const app = requireFirebaseApp();
    const db = getFirestore(app);
    const storage = getStorage(app);
    const [experienceSnapshot, seriesSnapshot, editionSnapshot, zoneSnapshot] = await Promise.all([
      getDocs(query(collection(db, "eventExperiences"), where("status", "==", "pending"), limit(25))),
      getDocs(query(collection(db, "eventSeries"), where("status", "in", ["active", "pending"]), limit(100))),
      getDocs(query(collection(db, "eventEditions"), where("status", "in", ["active", "pending"]), limit(150))),
      getDocs(query(collection(db, "eventZones"), where("status", "in", ["active", "pending"]), limit(200)))
    ]);
    const experiences = await Promise.all(
      experienceSnapshot.docs
        .map((doc) => readPendingExperience(doc.id, doc.data()))
        .filter((experience): experience is PendingEventExperience => experience !== null)
        .map(async (experience) => ({
          ...experience,
          url: await getDownloadURL(ref(storage, experience.photoPath)).catch(() => undefined)
        }))
    );
    setPendingEventExperiences(experiences);
    setEventSeries(
      seriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: String(doc.data().title ?? ""),
        city: String(doc.data().city ?? ""),
        status: String(doc.data().status ?? "")
      }))
    );
    setEventEditions(
      editionSnapshot.docs.map((doc) => ({
        id: doc.id,
        eventSeriesId: String(doc.data().eventSeriesId ?? ""),
        title: String(doc.data().title ?? ""),
        status: String(doc.data().status ?? "")
      }))
    );
    setEventZones(
      zoneSnapshot.docs.map((doc) => ({
        id: doc.id,
        eventEditionId: String(doc.data().eventEditionId ?? ""),
        name: String(doc.data().name ?? ""),
        status: String(doc.data().status ?? "")
      }))
    );
  }, []);

  const refreshPendingImages = useCallback(async () => {
    setIsRefreshing(true);
    setMessage("");
    try {
      await Promise.all([loadPendingImages(), loadEventAdminData()]);
    } catch {
      setMessage("No s'ha pogut carregar la cua de moderació.");
    } finally {
      setIsRefreshing(false);
    }
  }, [loadEventAdminData, loadPendingImages]);

  useEffect(() => {
    const app = requireFirebaseApp();
    const unsubscribe = onAuthStateChanged(getAuth(app), async (nextUser) => {
      setUser(nextUser);
      setPendingImages([]);
      setPendingEventExperiences([]);

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
        await Promise.all([loadPendingImages(), loadEventAdminData()]).catch(() =>
          setMessage("No s'ha pogut carregar la cua de moderació.")
        );
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, [loadEventAdminData, loadPendingImages]);

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

  async function moderateEventExperience(experienceId: string, status: "active" | "rejected" | "hidden") {
    const app = requireFirebaseApp();
    setBusyEventExperienceId(experienceId);
    setMessage("");
    try {
      const callable = httpsCallable<
        { collectionId: string; targetId: string; status: string; reason?: string },
        { targetId: string; status: string }
      >(getFunctions(app, functionsRegion), "moderateContent");
      await callable({
        collectionId: "eventExperiences",
        targetId: experienceId,
        status,
        ...(status !== "active" ? { reason: "Revisat des del panell d'administració." } : {})
      });
      setPendingEventExperiences((current) => current.filter((experience) => experience.id !== experienceId));
      setMessage(status === "active" ? "Experiència aprovada." : "Experiència actualitzada.");
    } catch {
      setMessage("No s'ha pogut actualitzar aquesta experiència.");
    } finally {
      setBusyEventExperienceId(null);
    }
  }

  async function moderateEventCatalogItem(
    collectionId: "eventSeries" | "eventEditions" | "eventZones",
    targetId: string,
    status: "active" | "rejected"
  ) {
    const app = requireFirebaseApp();
    setBusyCatalogItemId(`${collectionId}:${targetId}`);
    setMessage("");
    try {
      const callable = httpsCallable<
        { collectionId: string; targetId: string; status: string; reason?: string },
        { targetId: string; status: string }
      >(getFunctions(app, functionsRegion), "moderateContent");
      await callable({
        collectionId,
        targetId,
        status,
        ...(status === "rejected" ? { reason: "Catàleg rebutjat des del panell d'administració." } : {})
      });
      await loadEventAdminData();
      setMessage(status === "active" ? "Element del catàleg aprovat." : "Element del catàleg rebutjat.");
    } catch {
      setMessage("No s'ha pogut actualitzar aquest element del catàleg.");
    } finally {
      setBusyCatalogItemId(null);
    }
  }

  async function createSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const app = requireFirebaseApp();
    setCatalogBusy(true);
    setMessage("");
    try {
      const callable = httpsCallable<
        { title: string; category: string; city: string; description?: string },
        { eventSeriesId: string; status: string }
      >(getFunctions(app, functionsRegion), "createEventSeries");
      await callable({
        title: seriesTitle.trim(),
        category: "other",
        city: seriesCity.trim()
      });
      setSeriesTitle("");
      setSeriesCity("");
      await loadEventAdminData();
      setMessage("Esdeveniment creat.");
    } catch {
      setMessage("No s'ha pogut crear l'esdeveniment.");
    } finally {
      setCatalogBusy(false);
    }
  }

  async function createEdition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const app = requireFirebaseApp();
    setCatalogBusy(true);
    setMessage("");
    try {
      const callable = httpsCallable<
        { eventSeriesId: string; title: string; year: number; startsAt: string; endsAt: string },
        { eventEditionId: string; status: string }
      >(getFunctions(app, functionsRegion), "createEventEdition");
      await callable({
        eventSeriesId: editionSeriesId,
        title: editionTitle.trim(),
        year: Number(editionYear),
        startsAt: new Date(editionStartsAt).toISOString(),
        endsAt: new Date(editionEndsAt).toISOString()
      });
      setEditionTitle("");
      setEditionStartsAt("");
      setEditionEndsAt("");
      await loadEventAdminData();
      setMessage("Edició creada.");
    } catch {
      setMessage("No s'ha pogut crear l'edició.");
    } finally {
      setCatalogBusy(false);
    }
  }

  async function createZone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const app = requireFirebaseApp();
    const edition = eventEditions.find((item) => item.id === zoneEditionId);
    setCatalogBusy(true);
    setMessage("");
    try {
      if (!edition) {
        throw new Error("edition-required");
      }
      const callable = httpsCallable<
        {
          eventSeriesId: string;
          eventEditionId: string;
          name: string;
          latitude: number;
          longitude: number;
          radiusMeters?: number;
        },
        { eventZoneId: string; status: string }
      >(getFunctions(app, functionsRegion), "createEventZone");
      await callable({
        eventSeriesId: edition.eventSeriesId,
        eventEditionId: zoneEditionId,
        name: zoneName.trim(),
        latitude: Number(zoneLatitude),
        longitude: Number(zoneLongitude),
        radiusMeters: Number(zoneRadius)
      });
      setZoneName("");
      setZoneLatitude("");
      setZoneLongitude("");
      await loadEventAdminData();
      setMessage("Zona creada.");
    } catch {
      setMessage("No s'ha pogut crear la zona.");
    } finally {
      setCatalogBusy(false);
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

  const pendingCatalogItems = [
    ...eventSeries
      .filter((series) => series.status === "pending")
      .map((series) => ({
        id: series.id,
        collectionId: "eventSeries" as const,
        title: series.title,
        subtitle: series.city
      })),
    ...eventEditions
      .filter((edition) => edition.status === "pending")
      .map((edition) => ({
        id: edition.id,
        collectionId: "eventEditions" as const,
        title: edition.title,
        subtitle: eventSeries.find((series) => series.id === edition.eventSeriesId)?.title ?? "Edició"
      })),
    ...eventZones
      .filter((zone) => zone.status === "pending")
      .map((zone) => ({
        id: zone.id,
        collectionId: "eventZones" as const,
        title: zone.name,
        subtitle: eventEditions.find((edition) => edition.id === zone.eventEditionId)?.title ?? "Zona"
      }))
  ];

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
            <p>Experiències pendents</p>
            <strong>{pendingEventExperiences.length}</strong>
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

          <div className="panel admin-list-panel">
            <div className="panel-heading">
              <div>
                <span>Esdeveniments</span>
                <h3>Experiències per revisar</h3>
              </div>
              <CalendarDays aria-hidden="true" size={24} />
            </div>
            <div className="admin-image-list">
              {pendingEventExperiences.length === 0 ? (
                <p className="admin-empty">No hi ha experiències pendents.</p>
              ) : (
                pendingEventExperiences.map((experience) => {
                  const series = eventSeries.find((item) => item.id === experience.eventSeriesId);
                  const edition = eventEditions.find((item) => item.id === experience.eventEditionId);
                  const zone = eventZones.find((item) => item.id === experience.eventZoneId);
                  return (
                    <article className="admin-image-row" key={experience.id}>
                      <div className="admin-thumb">
                        {experience.url ? <img src={experience.url} alt="" /> : <ImageIcon aria-hidden="true" size={26} />}
                      </div>
                      <div>
                        <strong>{series?.title ?? edition?.title ?? "Experiència"}</strong>
                        <span>{zone?.name ?? experience.observedAt}</span>
                        <p>{experience.description}</p>
                      </div>
                      <div className="admin-actions">
                        <button
                          type="button"
                          onClick={() => moderateEventExperience(experience.id, "active")}
                          disabled={busyEventExperienceId === experience.id}
                          aria-label="Aprovar experiència"
                        >
                          <Check aria-hidden="true" size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moderateEventExperience(experience.id, "rejected")}
                          disabled={busyEventExperienceId === experience.id}
                          aria-label="Rebutjar experiència"
                        >
                          <X aria-hidden="true" size={18} />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          <div className="panel admin-grant-panel">
            <div className="panel-heading">
              <div>
                <span>Catàleg</span>
                <h3>Esdeveniments</h3>
              </div>
              <MapPinned aria-hidden="true" size={24} />
            </div>
            <div className="admin-stacked-form">
              <strong>Catàleg pendent</strong>
              <div className="admin-image-list">
                {pendingCatalogItems.length === 0 ? (
                  <p className="admin-empty">No hi ha elements de catàleg pendents.</p>
                ) : (
                  pendingCatalogItems.map((item) => {
                    const busyId = `${item.collectionId}:${item.id}`;
                    return (
                      <article className="admin-image-row" key={busyId}>
                        <div className="admin-thumb">
                          <MapPinned aria-hidden="true" size={24} />
                        </div>
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.subtitle}</span>
                        </div>
                        <div className="admin-actions">
                          <button
                            type="button"
                            onClick={() => moderateEventCatalogItem(item.collectionId, item.id, "active")}
                            disabled={busyCatalogItemId === busyId}
                            aria-label="Aprovar element del catàleg"
                          >
                            <Check aria-hidden="true" size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moderateEventCatalogItem(item.collectionId, item.id, "rejected")}
                            disabled={busyCatalogItemId === busyId}
                            aria-label="Rebutjar element del catàleg"
                          >
                            <X aria-hidden="true" size={18} />
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
            <form className="admin-stacked-form" onSubmit={createSeries}>
              <strong>Nou esdeveniment</strong>
              <label>
                <span>Nom</span>
                <input value={seriesTitle} onChange={(event) => setSeriesTitle(event.target.value)} required />
              </label>
              <label>
                <span>Ciutat</span>
                <input value={seriesCity} onChange={(event) => setSeriesCity(event.target.value)} required />
              </label>
              <button className="auth-submit" type="submit" disabled={catalogBusy}>
                Crear esdeveniment
              </button>
            </form>
            <form className="admin-stacked-form" onSubmit={createEdition}>
              <strong>Nova edició</strong>
              <label>
                <span>Esdeveniment</span>
                <select value={editionSeriesId} onChange={(event) => setEditionSeriesId(event.target.value)} required>
                  <option value="">Selecciona</option>
                  {eventSeries.map((series) => (
                    <option key={series.id} value={series.id}>
                      {series.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Títol</span>
                <input value={editionTitle} onChange={(event) => setEditionTitle(event.target.value)} required />
              </label>
              <label>
                <span>Any</span>
                <input type="number" value={editionYear} onChange={(event) => setEditionYear(event.target.value)} required />
              </label>
              <label>
                <span>Inici</span>
                <input type="datetime-local" value={editionStartsAt} onChange={(event) => setEditionStartsAt(event.target.value)} required />
              </label>
              <label>
                <span>Final</span>
                <input type="datetime-local" value={editionEndsAt} onChange={(event) => setEditionEndsAt(event.target.value)} required />
              </label>
              <button className="auth-submit" type="submit" disabled={catalogBusy}>
                Crear edició
              </button>
            </form>
            <form className="admin-stacked-form" onSubmit={createZone}>
              <strong>Nova zona</strong>
              <label>
                <span>Edició</span>
                <select value={zoneEditionId} onChange={(event) => setZoneEditionId(event.target.value)} required>
                  <option value="">Selecciona</option>
                  {eventEditions.map((edition) => (
                    <option key={edition.id} value={edition.id}>
                      {edition.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Nom zona</span>
                <input value={zoneName} onChange={(event) => setZoneName(event.target.value)} required />
              </label>
              <label>
                <span>Latitud</span>
                <input value={zoneLatitude} onChange={(event) => setZoneLatitude(event.target.value)} required />
              </label>
              <label>
                <span>Longitud</span>
                <input value={zoneLongitude} onChange={(event) => setZoneLongitude(event.target.value)} required />
              </label>
              <label>
                <span>Radi metres</span>
                <input type="number" value={zoneRadius} onChange={(event) => setZoneRadius(event.target.value)} required />
              </label>
              <button className="auth-submit" type="submit" disabled={catalogBusy}>
                Crear zona
              </button>
            </form>
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
