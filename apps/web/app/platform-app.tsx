"use client";

import {
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  Flag,
  Heart,
  Image as ImageIcon,
  Languages,
  LifeBuoy,
  Map,
  MapPin,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Upload,
  UserRound,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  categoryLabels,
  localeNames,
  sensoryLabels,
  type Locale,
  type Place
} from "@accessibilitat/shared";
import { dictionary } from "./lib/i18n";
import { organizations, places, professionals } from "./lib/mock-data";

type AppView = "map" | "contributions" | "support" | "profiles" | "verified";

const tabs: Array<{ id: AppView; icon: LucideIcon }> = [
  { id: "map", icon: Map },
  { id: "contributions", icon: Upload },
  { id: "support", icon: LifeBuoy },
  { id: "profiles", icon: UsersRound },
  { id: "verified", icon: BadgeCheck }
];

const copy: Record<
  Locale,
  {
    workspace: Record<AppView, string>;
    status: string;
    account: string;
    mapSubtitle: string;
    filters: string;
    quiet: string;
    lowLight: string;
    clearExit: string;
    selectedPlace: string;
    score: string;
    reviews: string;
    images: string;
    favorite: string;
    report: string;
    sensoryReading: string;
    placeQueue: string;
    uploadDrop: string;
    commentPlaceholder: string;
    savedDraft: string;
    childDraft: string;
    publicName: string;
    verificationQueue: string;
    license: string;
    registry: string;
    privacy: string;
    verifiedStrip: string;
    profileSummary: string;
  }
> = {
  ca: {
    workspace: {
      map: "Mapa sensorial",
      contributions: "Aportacions",
      support: "Targeta d'ajuda",
      profiles: "Usuaris",
      verified: "Directori verificat"
    },
    status: "Sessió protegida",
    account: "Entrar",
    mapSubtitle: "Consulta llocs, desa favorits i revisa el context abans d'anar-hi.",
    filters: "Filtres",
    quiet: "Soroll baix",
    lowLight: "Llum suau",
    clearExit: "Sortida clara",
    selectedPlace: "Lloc seleccionat",
    score: "Score",
    reviews: "Valoracions",
    images: "Imatges",
    favorite: "Desar",
    report: "Reportar",
    sensoryReading: "Lectura sensorial",
    placeQueue: "Imatges pendents de moderació",
    uploadDrop: "Arrossega imatges o selecciona fitxers",
    commentPlaceholder: "Escriu el comentari quan estiguis tranquil.",
    savedDraft: "Esborrany guardat al dispositiu",
    childDraft: "Perfil infantil pendent de tutor",
    publicName: "Pseudònim públic",
    verificationQueue: "Revisió manual abans de mostrar-se com a verificat.",
    license: "Núm. col·legiat",
    registry: "Registre",
    privacy: "Documents interns privats",
    verifiedStrip: "Professionals i entitats amb confiança visible",
    profileSummary: "Adults, tutors i perfils identificats comparteixen el mateix accés web i mòbil."
  },
  es: {
    workspace: {
      map: "Mapa sensorial",
      contributions: "Aportaciones",
      support: "Tarjeta de ayuda",
      profiles: "Usuarios",
      verified: "Directorio verificado"
    },
    status: "Sesión protegida",
    account: "Entrar",
    mapSubtitle: "Consulta lugares, guarda favoritos y revisa el contexto antes de ir.",
    filters: "Filtros",
    quiet: "Ruido bajo",
    lowLight: "Luz suave",
    clearExit: "Salida clara",
    selectedPlace: "Lugar seleccionado",
    score: "Score",
    reviews: "Valoraciones",
    images: "Imágenes",
    favorite: "Guardar",
    report: "Reportar",
    sensoryReading: "Lectura sensorial",
    placeQueue: "Imágenes pendientes de moderación",
    uploadDrop: "Arrastra imágenes o selecciona archivos",
    commentPlaceholder: "Escribe el comentario cuando estés tranquilo.",
    savedDraft: "Borrador guardado en el dispositivo",
    childDraft: "Perfil infantil pendiente del tutor",
    publicName: "Seudónimo público",
    verificationQueue: "Revisión manual antes de mostrarse como verificado.",
    license: "Núm. colegiado",
    registry: "Registro",
    privacy: "Documentos internos privados",
    verifiedStrip: "Profesionales y entidades con confianza visible",
    profileSummary: "Adultos, tutores y perfiles identificados comparten el mismo acceso web y móvil."
  },
  en: {
    workspace: {
      map: "Sensory map",
      contributions: "Contributions",
      support: "Help card",
      profiles: "Users",
      verified: "Verified directory"
    },
    status: "Protected session",
    account: "Sign in",
    mapSubtitle: "Review places, save favorites and check context before going.",
    filters: "Filters",
    quiet: "Low noise",
    lowLight: "Soft light",
    clearExit: "Clear exit",
    selectedPlace: "Selected place",
    score: "Score",
    reviews: "Reviews",
    images: "Images",
    favorite: "Save",
    report: "Report",
    sensoryReading: "Sensory reading",
    placeQueue: "Images pending moderation",
    uploadDrop: "Drag images or choose files",
    commentPlaceholder: "Write the comment when you are calm.",
    savedDraft: "Draft saved on device",
    childDraft: "Child profile pending tutor",
    publicName: "Public nickname",
    verificationQueue: "Manual review before showing as verified.",
    license: "License no.",
    registry: "Registry",
    privacy: "Internal documents private",
    verifiedStrip: "Professionals and organizations with visible trust",
    profileSummary: "Adults, tutors and identified profiles share the same web and mobile access."
  }
};

const filtersByLocale = (locale: Locale) => [
  copy[locale].quiet,
  copy[locale].lowLight,
  copy[locale].clearExit
];

const pinPositions = [
  { left: "24%", top: "44%" },
  { left: "59%", top: "30%" },
  { left: "73%", top: "64%" }
];

const sensoryScores = [
  { key: "noise", value: 2, tone: "teal" },
  { key: "lighting", value: 3, tone: "sage" },
  { key: "crowd", value: 2, tone: "clay" },
  { key: "exitEase", value: 5, tone: "blue" }
] as const;

export function PlatformApp() {
  const [locale, setLocale] = useState<Locale>("ca");
  const [activeView, setActiveView] = useState<AppView>("map");
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const t = dictionary[locale];
  const c = copy[locale];

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
    <main className="app-shell min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="topbar border-b border-[var(--line)] bg-[rgba(255,252,246,0.88)]">
        <div className="mx-auto flex max-w-[1520px] flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between xl:px-6">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <Map aria-hidden="true" size={23} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--muted)]">MVP</p>
              <h1 className="text-[22px] font-semibold tracking-normal text-[var(--foreground)]">{t.appName}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-medium text-[var(--teal-strong)]">
              <ShieldCheck aria-hidden="true" size={17} />
              {c.status}
            </span>
            <label className="focus-within-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-medium">
              <Languages aria-hidden="true" size={17} className="text-[var(--muted)]" />
              <select
                className="min-w-24 bg-transparent text-[13px] outline-none"
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
            <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--teal-strong)] px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-[rgba(15,93,98,0.22)]">
              <UserRound aria-hidden="true" size={17} />
              Apple / Google
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1520px] gap-5 px-4 py-5 lg:grid-cols-[228px_minmax(0,1fr)] xl:px-6">
        <aside className="min-w-0">
          <nav
            aria-label="Navegació principal"
            className="surface-panel flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-visible"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`focus-ring nav-item ${isActive ? "nav-item-active" : ""}`}
                  onClick={() => setActiveView(tab.id)}
                  title={t[tab.id]}
                  aria-pressed={isActive}
                >
                  <Icon aria-hidden="true" size={19} />
                  <span>{t[tab.id]}</span>
                  <ChevronRight aria-hidden="true" size={16} className="nav-chevron" />
                </button>
              );
            })}
          </nav>

          <div className="mt-4 hidden space-y-4 lg:block">
            <section className="surface-panel p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                {c.publicName}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--sage)] text-[var(--teal-strong)]">
                  <UserRound aria-hidden="true" size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">josep-b</p>
                  <p className="truncate text-[12px] text-[var(--muted)]">Adult registrat</p>
                </div>
              </div>
            </section>

            <section className="surface-panel border-[var(--teal-soft)] bg-[var(--teal-tint)] p-4">
              <div className="flex items-center gap-2 text-[var(--teal-strong)]">
                <Clock3 aria-hidden="true" size={18} />
                <p className="text-[13px] font-semibold">{c.placeQueue}</p>
              </div>
              <p className="mt-2 text-[28px] font-semibold leading-none text-[var(--foreground)]">14</p>
            </section>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[28px] font-semibold leading-tight text-[var(--foreground)]">
                {c.workspace[activeView]}
              </h2>
              <p className="mt-1 max-w-2xl text-[14px] leading-6 text-[var(--muted)]">
                {activeView === "map" ? c.mapSubtitle : c.profileSummary}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filtersByLocale(locale).map((filter) => (
                <button
                  key={filter}
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-semibold text-[var(--foreground)]"
                >
                  <Filter aria-hidden="true" size={15} />
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {activeView === "map" && (
            <MapWorkspace
              locale={locale}
              query={query}
              selectedPlace={selectedPlace}
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
              locale={locale}
              onFiles={(files) => setPendingFiles(files)}
              onComment={setComment}
              labels={{
                uploadImage: t.uploadImage,
                addComment: t.addComment,
                pendingModeration: t.pendingModeration,
                submitReview: t.submitReview,
                uploadDrop: c.uploadDrop,
                commentPlaceholder: c.commentPlaceholder,
                savedDraft: c.savedDraft
              }}
            />
          )}

          {activeView === "support" && <SupportCard labels={{ quickCard: t.quickCard, calmMode: t.calmMode }} />}

          {activeView === "profiles" && (
            <Profiles
              labels={{
                childProfile: t.childProfile,
                tutorReview: t.tutorReview,
                childDraft: c.childDraft
              }}
            />
          )}

          {activeView === "verified" && (
            <VerifiedDirectory
              labels={{
                professionalTrust: t.professionalTrust,
                verified: t.verified,
                verifiedStrip: c.verifiedStrip,
                license: c.license,
                registry: c.registry,
                privacy: c.privacy,
                verificationQueue: c.verificationQueue
              }}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function MapWorkspace({
  locale,
  query,
  selectedPlace,
  selectedPlaceId,
  filteredPlaces,
  onQueryChange,
  onSelectPlace
}: {
  locale: Locale;
  query: string;
  selectedPlace: Place;
  selectedPlaceId: string;
  filteredPlaces: Place[];
  onQueryChange: (value: string) => void;
  onSelectPlace: (id: string) => void;
}) {
  const c = copy[locale];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
      <section className="surface-panel min-h-[690px] p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="focus-within-ring flex min-h-12 flex-1 items-center gap-3 rounded-md border border-[var(--line)] bg-white px-3">
            <Search aria-hidden="true" size={19} className="shrink-0 text-[var(--muted)]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--muted)]"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={dictionary[locale].search}
            />
          </label>

          <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 text-[13px] font-semibold text-[var(--foreground)]">
            <SlidersHorizontal aria-hidden="true" size={17} />
            {c.filters}
          </button>
        </div>

        <div className="map-frame mt-5">
          <div className="map-canvas" aria-label="Mapa visual de llocs sensorials">
            <div className="map-block map-block-a" />
            <div className="map-block map-block-b" />
            <div className="map-block map-block-c" />
            <div className="map-block map-block-d" />
            <div className="map-road map-road-main" />
            <div className="map-road map-road-cross" />
            <div className="map-road map-road-diagonal" />
            <div className="map-green map-green-a" />
            <div className="map-green map-green-b" />
            <div className="map-water" />

            {places.map((place, index) => {
              const active = place.id === selectedPlaceId;
              const position = pinPositions[index % pinPositions.length];
              return (
                <button
                  key={place.id}
                  className={`focus-ring map-pin ${active ? "map-pin-active" : ""}`}
                  style={position}
                  onClick={() => onSelectPlace(place.id)}
                  title={place.name}
                  aria-pressed={active}
                >
                  <MapPin aria-hidden="true" size={19} />
                  <span className="sr-only">{place.name}</span>
                </button>
              );
            })}

            <div className="map-legend">
              <span className="map-legend-dot" />
              {c.selectedPlace}: {selectedPlace.name}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {filteredPlaces.map((place) => {
            const active = place.id === selectedPlaceId;
            return (
              <button
                key={place.id}
                className={`focus-ring place-row ${active ? "place-row-active" : ""}`}
                onClick={() => onSelectPlace(place.id)}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">{place.name}</span>
                  <span className="mt-1 block truncate text-[12px] text-[var(--muted)]">
                    {place.city} · {categoryLabels[place.category][locale]}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--teal-strong)]">
                  <Star aria-hidden="true" size={14} />
                  {place.averageScore.toFixed(1)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="surface-panel overflow-hidden">
        <div className="relative h-44 overflow-hidden">
          <img
            src="/media/calm-place-preview.png"
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md bg-[rgba(255,255,255,0.9)] px-3 py-2 text-[12px] font-semibold text-[var(--teal-strong)] shadow-sm">
            <CheckCircle2 aria-hidden="true" size={15} />
            {categoryLabels[selectedPlace.category][locale]}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                {c.selectedPlace}
              </p>
              <h3 className="mt-1 text-[24px] font-semibold leading-tight">{selectedPlace.name}</h3>
              <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
                {selectedPlace.city} · {selectedPlace.addressOrArea}
              </p>
            </div>
            <button className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--clay)]">
              <Heart aria-hidden="true" size={18} />
              <span className="sr-only">{c.favorite}</span>
            </button>
          </div>

          <p className="mt-4 text-[14px] leading-6 text-[var(--foreground)]">{selectedPlace.description}</p>

          <div className="mt-5 grid grid-cols-3 border-y border-[var(--line)] py-4">
            <Metric label={c.score} value={selectedPlace.averageScore.toFixed(1)} />
            <Metric label={c.reviews} value={String(selectedPlace.ratingCount)} />
            <Metric label={c.images} value={String(selectedPlace.imageCount)} />
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-[15px] font-semibold">{c.sensoryReading}</h4>
              <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[12px] font-semibold text-[var(--muted)]">
                <Flag aria-hidden="true" size={14} />
                {c.report}
              </button>
            </div>
            <div className="space-y-3">
              {sensoryScores.map((score) => (
                <SensoryBar
                  key={score.key}
                  label={sensoryLabels[score.key][locale]}
                  value={score.value}
                  tone={score.tone}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md border border-[var(--teal-soft)] bg-[var(--teal-tint)] p-4">
            <div className="flex items-center gap-2 text-[var(--teal-strong)]">
              <ImageIcon aria-hidden="true" size={17} />
              <p className="text-[13px] font-semibold">{c.placeQueue}</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">{dictionary[locale].pendingModeration}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Contributions({
  placeName,
  locale,
  files,
  comment,
  labels,
  onFiles,
  onComment
}: {
  placeName: string;
  locale: Locale;
  files: string[];
  comment: string;
  labels: Record<
    "uploadImage" | "addComment" | "pendingModeration" | "submitReview" | "uploadDrop" | "commentPlaceholder" | "savedDraft",
    string
  >;
  onFiles: (files: string[]) => void;
  onComment: (comment: string) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="surface-panel p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-[24px] font-semibold">{placeName}</h3>
            <p className="mt-2 text-[14px] text-[var(--muted)]">{labels.pendingModeration}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md bg-[var(--clay-tint)] px-3 py-2 text-[13px] font-semibold text-[var(--clay)]">
            <Clock3 aria-hidden="true" size={16} />
            {labels.savedDraft}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Object.entries(sensoryLabels).map(([key, label]) => (
            <label key={key} className="sensory-control">
              <span className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-semibold">{label[locale]}</span>
                <span className="text-[12px] font-semibold text-[var(--muted)]">3/5</span>
              </span>
              <input className="mt-3 w-full accent-[var(--teal)]" type="range" min="1" max="5" defaultValue="3" />
            </label>
          ))}
        </div>
      </section>

      <aside className="space-y-5">
        <section className="surface-panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <Camera aria-hidden="true" size={20} className="text-[var(--teal)]" />
            <h3 className="text-[16px] font-semibold">{labels.uploadImage}</h3>
          </div>
          <label className="focus-within-ring upload-dropzone">
            <Upload aria-hidden="true" size={24} />
            <span className="text-[14px] font-semibold">{labels.uploadDrop}</span>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => onFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-4 space-y-2 text-[13px] text-[var(--muted)]">
              {files.map((file) => (
                <li key={file} className="flex items-center gap-2 rounded-md bg-[var(--stone)] px-3 py-2">
                  <ImageIcon aria-hidden="true" size={15} />
                  {file}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare aria-hidden="true" size={20} className="text-[var(--teal)]" />
            <h3 className="text-[16px] font-semibold">{labels.addComment}</h3>
          </div>
          <textarea
            className="focus-ring min-h-36 w-full resize-y rounded-md border border-[var(--line)] bg-white p-3 text-[14px] leading-6 outline-none placeholder:text-[var(--muted)]"
            value={comment}
            placeholder={labels.commentPlaceholder}
            onChange={(event) => onComment(event.target.value)}
          />
          <button className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--teal-strong)] px-4 py-3 text-[14px] font-semibold text-white shadow-sm shadow-[rgba(15,93,98,0.22)]">
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
    <section className="surface-panel overflow-hidden">
      <div className="grid min-h-[540px] gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--teal-tint)] text-[var(--teal-strong)]">
              <LifeBuoy aria-hidden="true" />
            </div>
            <h3 className="text-[24px] font-semibold">{labels.quickCard}</h3>
          </div>

          <div className="communication-card">
            <p>
              Soc una persona autista. Ara mateix em costa parlar o respondre. Necessito uns minuts, un lloc tranquil o
              contactar amb una persona de confiança.
            </p>
          </div>

          <button className="focus-ring mt-6 rounded-md bg-[var(--teal-strong)] px-5 py-3 text-[14px] font-semibold text-white shadow-sm shadow-[rgba(15,93,98,0.22)]">
            {labels.calmMode}
          </button>
        </div>

        <div className="calm-panel flex items-end p-6">
          <div className="rounded-md bg-[rgba(255,255,255,0.88)] p-4 shadow-sm">
            <p className="text-[13px] font-semibold text-[var(--teal-strong)]">Contacte de confiança</p>
            <p className="mt-1 text-[20px] font-semibold">Tutor principal</p>
            <p className="mt-2 text-[13px] text-[var(--muted)]">Visible només amb permisos del compte.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Profiles({
  labels
}: {
  labels: Record<"childProfile" | "tutorReview" | "childDraft", string>;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <article className="surface-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--sage)] text-[var(--teal-strong)]">
            <UsersRound aria-hidden="true" size={23} />
          </div>
          <span className="rounded-md bg-[var(--teal-tint)] px-3 py-2 text-[12px] font-semibold text-[var(--teal-strong)]">
            Tutor
          </span>
        </div>
        <h3 className="mt-5 text-[22px] font-semibold">{labels.childProfile}</h3>
        <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
          Perfil infantil tutelat dins el compte del tutor, sense email propi. Les valoracions queden pendents de
          revisió abans d'enviar-se.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-semibold">
            Àlies
          </span>
          <span className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-semibold">
            Preferències sensorials
          </span>
          <span className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-semibold">
            {labels.childDraft}
          </span>
        </div>
        <button className="focus-ring mt-6 rounded-md bg-[var(--teal-strong)] px-4 py-3 text-[14px] font-semibold text-white">
          {labels.tutorReview}
        </button>
      </article>

      <article className="surface-panel p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--clay-tint)] text-[var(--clay)]">
          <Heart aria-hidden="true" size={23} />
        </div>
        <h3 className="mt-5 text-[22px] font-semibold">Perfil sensorial</h3>
        <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
          Preferències funcionals de soroll, llum, afluència, temperatura i espera. No es demana cap diagnòstic per
          utilitzar l'aplicació.
        </p>
        <div className="mt-6 space-y-3">
          <SensoryBar label="Soroll" value={2} tone="teal" />
          <SensoryBar label="Llum" value={3} tone="sage" />
          <SensoryBar label="Afluència" value={4} tone="clay" />
        </div>
      </article>
    </section>
  );
}

function VerifiedDirectory({
  labels
}: {
  labels: Record<
    "professionalTrust" | "verified" | "verifiedStrip" | "license" | "registry" | "privacy" | "verificationQueue",
    string
  >;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="surface-panel p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[var(--teal-strong)]">
              <ShieldCheck aria-hidden="true" size={21} />
              <h3 className="text-[21px] font-semibold text-[var(--foreground)]">{labels.professionalTrust}</h3>
            </div>
            <p className="text-[14px] leading-6 text-[var(--muted)]">{labels.verifiedStrip}</p>
          </div>
          <span className="rounded-md bg-[var(--teal-tint)] px-3 py-2 text-[12px] font-semibold text-[var(--teal-strong)]">
            {labels.verified}
          </span>
        </div>

        {professionals.map((professional) => (
          <article key={professional.id} className="directory-row">
            <img src={professional.photoPath} alt="" className="h-20 w-20 rounded-md object-cover" />
            <div className="min-w-0">
              <h4 className="text-[16px] font-semibold">{professional.professionalName}</h4>
              <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{professional.specialty}</p>
              <p className="mt-3 text-[13px] font-semibold text-[var(--teal-strong)]">
                {labels.license}: {professional.licenseNumber}
              </p>
              <p className="mt-1 text-[12px] text-[var(--muted)]">{professional.professionalCollege}</p>
            </div>
          </article>
        ))}

        <p className="mt-4 rounded-md bg-[var(--stone)] px-3 py-2 text-[12px] font-medium text-[var(--muted)]">
          {labels.privacy}
        </p>
      </div>

      <div className="surface-panel p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[var(--clay)]">
              <Building2 aria-hidden="true" size={21} />
              <h3 className="text-[21px] font-semibold text-[var(--foreground)]">Associacions i centres</h3>
            </div>
            <p className="text-[14px] leading-6 text-[var(--muted)]">{labels.verificationQueue}</p>
          </div>
          <span className="rounded-md bg-[var(--clay-tint)] px-3 py-2 text-[12px] font-semibold text-[var(--clay)]">
            {labels.verified}
          </span>
        </div>

        {organizations.map((organization) => (
          <article key={organization.id} className="directory-row">
            <img src={organization.logoPath} alt="" className="h-20 w-20 rounded-md object-cover" />
            <div className="min-w-0">
              <h4 className="text-[16px] font-semibold">{organization.name}</h4>
              <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{organization.description}</p>
              <p className="mt-3 text-[13px] font-semibold text-[var(--clay)]">
                {labels.registry}: {organization.registryNumber}
              </p>
              <p className="mt-1 text-[12px] text-[var(--muted)]">{organization.city}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[var(--line)] px-3 last:border-r-0 first:pl-0 last:pr-0">
      <p className="text-[12px] font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-semibold leading-none">{value}</p>
    </div>
  );
}

function SensoryBar({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "teal" | "sage" | "clay" | "blue";
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">{label}</p>
        <p className="text-[12px] font-semibold text-[var(--muted)]">{value}/5</p>
      </div>
      <div className="h-2 rounded-full bg-[var(--stone)]">
        <div className={`sensory-fill sensory-fill-${tone}`} style={{ width: `${value * 20}%` }} />
      </div>
    </div>
  );
}
