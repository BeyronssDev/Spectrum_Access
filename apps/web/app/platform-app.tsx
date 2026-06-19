"use client";

import {
  BadgeCheck,
  Building2,
  Camera,
  Heart,
  Languages,
  LifeBuoy,
  Map,
  MapPin,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Upload,
  UserRound,
  UsersRound
} from "lucide-react";
import { useMemo, useState } from "react";
import { categoryLabels, localeNames, sensoryLabels, type Locale } from "@accessibilitat/shared";
import { dictionary } from "./lib/i18n";
import { organizations, places, professionals } from "./lib/mock-data";

type AppView = "map" | "contributions" | "support" | "profiles" | "verified";

const tabs: Array<{ id: AppView; icon: typeof Map }> = [
  { id: "map", icon: Map },
  { id: "contributions", icon: Upload },
  { id: "support", icon: LifeBuoy },
  { id: "profiles", icon: UsersRound },
  { id: "verified", icon: BadgeCheck }
];

export function PlatformApp() {
  const [locale, setLocale] = useState<Locale>("ca");
  const [activeView, setActiveView] = useState<AppView>("map");
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const t = dictionary[locale];

  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return places;
    }

    return places.filter((place) =>
      [place.name, place.city, place.addressOrArea, categoryLabels[place.category][locale]]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [locale, query]);

  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? places[0];

  return (
    <main className="app-shell bg-[#f7f4ee] text-[#17211b]">
      <header className="border-b border-[#d9d2c4] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#2f6f73] text-white">
              <Map aria-hidden="true" size={24} />
            </div>
            <div>
              <p className="text-sm text-[#66736b]">MVP</p>
              <h1 className="text-xl font-semibold">{t.appName}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-md border border-[#d9d2c4] bg-white px-3 py-2 text-sm">
              <Languages aria-hidden="true" size={18} />
              <select
                className="bg-transparent focus-ring"
                value={locale}
                aria-label="Idioma"
                onChange={(event) => setLocale(event.target.value as Locale)}
              >
                {Object.entries(localeNames).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button className="focus-ring flex items-center gap-2 rounded-md bg-[#1e5558] px-4 py-2 text-sm font-semibold text-white">
              <UserRound aria-hidden="true" size={18} />
              Apple / Google
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[88px_minmax(0,1fr)]">
        <nav aria-label="Navegació principal" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                className={`focus-ring flex min-h-14 min-w-20 flex-col items-center justify-center gap-1 rounded-md border px-3 py-2 text-xs ${
                  isActive
                    ? "border-[#1e5558] bg-[#e7efe9] text-[#1e5558]"
                    : "border-[#d9d2c4] bg-[#fffdf8] text-[#66736b]"
                }`}
                onClick={() => setActiveView(tab.id)}
                title={t[tab.id]}
                aria-pressed={isActive}
              >
                <Icon aria-hidden="true" size={20} />
                <span>{t[tab.id]}</span>
              </button>
            );
          })}
        </nav>

        <section className="min-w-0">
          {activeView === "map" && (
            <MapWorkspace
              locale={locale}
              query={query}
              selectedPlaceId={selectedPlace.id}
              filteredPlaces={filteredPlaces}
              onQueryChange={setQuery}
              onSelectPlace={setSelectedPlaceId}
            />
          )}

          {activeView === "contributions" && (
            <Contributions
              files={pendingFiles}
              comment={comment}
              placeName={selectedPlace.name}
              onFiles={(files) => setPendingFiles(files)}
              onComment={setComment}
              labels={{
                uploadImage: t.uploadImage,
                addComment: t.addComment,
                pendingModeration: t.pendingModeration,
                submitReview: t.submitReview
              }}
            />
          )}

          {activeView === "support" && <SupportCard labels={{ quickCard: t.quickCard, calmMode: t.calmMode }} />}

          {activeView === "profiles" && <Profiles labels={{ childProfile: t.childProfile, tutorReview: t.tutorReview }} />}

          {activeView === "verified" && (
            <VerifiedDirectory labels={{ professionalTrust: t.professionalTrust, verified: t.verified }} />
          )}
        </section>
      </div>
    </main>
  );
}

function MapWorkspace({
  locale,
  query,
  selectedPlaceId,
  filteredPlaces,
  onQueryChange,
  onSelectPlace
}: {
  locale: Locale;
  query: string;
  selectedPlaceId: string;
  filteredPlaces: typeof places;
  onQueryChange: (value: string) => void;
  onSelectPlace: (id: string) => void;
}) {
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? places[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-h-[620px] rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-4">
        <label className="mb-4 flex items-center gap-2 rounded-md border border-[#d9d2c4] bg-white px-3 py-2">
          <Search aria-hidden="true" size={20} className="text-[#66736b]" />
          <input
            className="focus-ring min-w-0 flex-1 bg-transparent text-sm outline-none"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cerca llocs, ciutat o categoria"
          />
        </label>

        <div className="relative h-[520px] overflow-hidden rounded-md border border-[#d9d2c4] bg-[#dce8df]">
          <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(#c2d6cc_1px,transparent_1px),linear-gradient(90deg,#c2d6cc_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute left-[10%] top-[12%] h-[76%] w-[18%] rounded-md bg-[#eef4ef]" />
          <div className="absolute left-[36%] top-[8%] h-[84%] w-[11%] rounded-md bg-[#eef4ef]" />
          <div className="absolute left-[58%] top-[18%] h-[58%] w-[24%] rounded-md bg-[#eef4ef]" />
          <div className="absolute left-0 top-[48%] h-8 w-full bg-[#c3b189]" />
          <div className="absolute left-[48%] top-0 h-full w-8 bg-[#c3b189]" />
          {places.map((place, index) => {
            const active = place.id === selectedPlaceId;
            const positions = [
              { left: "28%", top: "44%" },
              { left: "54%", top: "28%" },
              { left: "72%", top: "62%" }
            ];
            return (
              <button
                key={place.id}
                className={`focus-ring absolute flex h-11 w-11 items-center justify-center rounded-full border-2 text-white shadow ${
                  active ? "border-[#17211b] bg-[#9a5c18]" : "border-white bg-[#2f6f73]"
                }`}
                style={positions[index % positions.length]}
                onClick={() => onSelectPlace(place.id)}
                title={place.name}
              >
                <MapPin aria-hidden="true" size={20} />
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-4">
        <h2 className="text-xl font-semibold">{selectedPlace.name}</h2>
        <p className="mt-1 text-sm text-[#66736b]">
          {selectedPlace.city} · {selectedPlace.addressOrArea} · {categoryLabels[selectedPlace.category][locale]}
        </p>
        <p className="mt-4 text-sm leading-6">{selectedPlace.description}</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric label="Score" value={selectedPlace.averageScore.toFixed(1)} />
          <Metric label="Valoracions" value={String(selectedPlace.ratingCount)} />
          <Metric label="Imatges" value={String(selectedPlace.imageCount)} />
        </div>

        <div className="mt-6 space-y-2">
          {filteredPlaces.map((place) => (
            <button
              key={place.id}
              className={`focus-ring flex w-full items-center justify-between rounded-md border px-3 py-3 text-left ${
                place.id === selectedPlaceId ? "border-[#2f6f73] bg-[#e7efe9]" : "border-[#d9d2c4] bg-white"
              }`}
              onClick={() => onSelectPlace(place.id)}
            >
              <span>
                <span className="block text-sm font-semibold">{place.name}</span>
                <span className="block text-xs text-[#66736b]">{place.city}</span>
              </span>
              <span className="text-sm font-semibold text-[#2f6f73]">{place.averageScore.toFixed(1)}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Contributions({
  placeName,
  files,
  comment,
  labels,
  onFiles,
  onComment
}: {
  placeName: string;
  files: string[];
  comment: string;
  labels: Record<"uploadImage" | "addComment" | "pendingModeration" | "submitReview", string>;
  onFiles: (files: string[]) => void;
  onComment: (comment: string) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-5">
        <h2 className="text-2xl font-semibold">{placeName}</h2>
        <p className="mt-2 text-sm text-[#66736b]">{labels.pendingModeration}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Object.entries(sensoryLabels).map(([key, label]) => (
            <label key={key} className="rounded-md border border-[#d9d2c4] bg-white p-3">
              <span className="block text-sm font-semibold">{label.ca}</span>
              <input className="mt-3 w-full accent-[#2f6f73]" type="range" min="1" max="5" defaultValue="3" />
            </label>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Camera aria-hidden="true" size={20} className="text-[#2f6f73]" />
            <h3 className="font-semibold">{labels.uploadImage}</h3>
          </div>
          <input
            className="focus-ring block w-full text-sm"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => onFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
          />
          {files.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-[#66736b]">
              {files.map((file) => (
                <li key={file} className="rounded-md bg-[#f7f4ee] px-3 py-2">
                  {file}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare aria-hidden="true" size={20} className="text-[#2f6f73]" />
            <h3 className="font-semibold">{labels.addComment}</h3>
          </div>
          <textarea
            className="focus-ring min-h-32 w-full resize-y rounded-md border border-[#d9d2c4] bg-white p-3 text-sm"
            value={comment}
            onChange={(event) => onComment(event.target.value)}
          />
          <button className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#1e5558] px-4 py-3 text-sm font-semibold text-white">
            <Send aria-hidden="true" size={18} />
            {labels.submitReview}
          </button>
        </section>
      </aside>
    </div>
  );
}

function SupportCard({ labels }: { labels: Record<"quickCard" | "calmMode", string> }) {
  return (
    <section className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-6">
      <div className="mb-6 flex items-center gap-3">
        <LifeBuoy aria-hidden="true" className="text-[#2f6f73]" />
        <h2 className="text-2xl font-semibold">{labels.quickCard}</h2>
      </div>
      <div className="max-w-3xl rounded-md border border-[#d9d2c4] bg-white p-6">
        <p className="text-2xl leading-10">
          Soc una persona autista. Ara mateix em costa parlar o respondre. Necessito uns minuts, un lloc tranquil o contactar amb una persona de confiança.
        </p>
      </div>
      <button className="focus-ring mt-5 rounded-md bg-[#2f6f73] px-5 py-3 font-semibold text-white">{labels.calmMode}</button>
    </section>
  );
}

function Profiles({ labels }: { labels: Record<"childProfile" | "tutorReview", string> }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-5">
        <UsersRound aria-hidden="true" className="mb-3 text-[#2f6f73]" />
        <h2 className="text-xl font-semibold">{labels.childProfile}</h2>
        <p className="mt-3 text-sm leading-6 text-[#66736b]">
          Perfil infantil tutelat dins el compte del tutor, sense email propi. Les valoracions queden pendents de revisió del tutor abans d'enviar-se.
        </p>
        <button className="focus-ring mt-5 rounded-md bg-[#1e5558] px-4 py-2 text-sm font-semibold text-white">{labels.tutorReview}</button>
      </article>

      <article className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-5">
        <Heart aria-hidden="true" className="mb-3 text-[#8f2f2f]" />
        <h2 className="text-xl font-semibold">Perfil sensorial</h2>
        <p className="mt-3 text-sm leading-6 text-[#66736b]">
          Preferències funcionals de soroll, llum, afluència, temperatura i espera. No es demana cap diagnòstic.
        </p>
      </article>
    </section>
  );
}

function VerifiedDirectory({ labels }: { labels: Record<"professionalTrust" | "verified", string> }) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="text-[#2f6f73]" />
          <h2 className="text-xl font-semibold">{labels.professionalTrust}</h2>
        </div>
        {professionals.map((professional) => (
          <article key={professional.id} className="flex gap-4 rounded-md border border-[#d9d2c4] bg-white p-4">
            <img src={professional.photoPath} alt="" className="h-20 w-20 rounded-md object-cover" />
            <div>
              <h3 className="font-semibold">{professional.professionalName}</h3>
              <p className="mt-1 text-sm text-[#66736b]">{professional.specialty}</p>
              <p className="mt-2 text-sm font-semibold text-[#1e5558]">{professional.licenseNumber}</p>
              <p className="text-xs text-[#66736b]">{professional.professionalCollege}</p>
              <p className="mt-2 inline-flex rounded-md bg-[#e7efe9] px-2 py-1 text-xs font-semibold text-[#1e5558]">
                {labels.verified}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-md border border-[#d9d2c4] bg-[#fffdf8] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Building2 aria-hidden="true" className="text-[#9a5c18]" />
          <h2 className="text-xl font-semibold">Associacions i centres</h2>
        </div>
        {organizations.map((organization) => (
          <article key={organization.id} className="flex gap-4 rounded-md border border-[#d9d2c4] bg-white p-4">
            <img src={organization.logoPath} alt="" className="h-20 w-20 rounded-md object-cover" />
            <div>
              <h3 className="font-semibold">{organization.name}</h3>
              <p className="mt-1 text-sm text-[#66736b]">{organization.description}</p>
              <p className="mt-2 text-sm font-semibold text-[#9a5c18]">{organization.registryNumber}</p>
              <p className="text-xs text-[#66736b]">{organization.city}</p>
              <p className="mt-2 inline-flex rounded-md bg-[#f1e5d2] px-2 py-1 text-xs font-semibold text-[#9a5c18]">
                {labels.verified}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#d9d2c4] bg-white p-3">
      <p className="text-xs text-[#66736b]">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
