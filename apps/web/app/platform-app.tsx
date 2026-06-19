"use client";

import {
  Accessibility,
  BadgeCheck,
  BookOpen,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  DoorOpen,
  Filter,
  Flag,
  Hand,
  Heart,
  Image as ImageIcon,
  Languages,
  Layers,
  LifeBuoy,
  Lightbulb,
  LocateFixed,
  Map,
  MapPin,
  MessageSquare,
  Minus,
  Moon,
  Navigation,
  Plus,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  SquareStack,
  Star,
  Sun,
  Upload,
  UserRound,
  Users,
  UsersRound,
  Volume2,
  Wifi
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
    darkMode: string;
    lightMode: string;
    experienceTitle: string;
    experienceSubtitle: string;
    shareExperience: string;
    uploadHint: string;
    experienceQuestion: string;
    starRating: string;
    anonymous: string;
    publish: string;
    verifiedProfessionals: string;
    seeAll: string;
    contact: string;
    aboutPlace: string;
    reviewsTab: string;
    openNow: string;
    until: string;
    rampAccess: string;
    adaptedBathroom: string;
    quietZone: string;
    wifi: string;
  }
> = {
  ca: {
    workspace: {
      map: "Mapa",
      contributions: "Aportacions",
      support: "Targeta d'ajuda",
      profiles: "Usuaris",
      verified: "Directori verificat"
    },
    status: "Sessió protegida",
    mapSubtitle: "Consulta llocs, desa favorits i revisa el context abans d'anar-hi.",
    filters: "Filtres",
    quiet: "Soroll baix",
    lowLight: "Llum suau",
    clearExit: "Sortida clara",
    selectedPlace: "Lloc seleccionat",
    score: "Score",
    reviews: "Valoracions",
    images: "Imatges",
    favorite: "Preferit",
    report: "Informar",
    sensoryReading: "Indicadors sensorials",
    placeQueue: "Contingut pendent de moderació",
    uploadDrop: "Arrossega una imatge o fes clic per pujar",
    commentPlaceholder: "Comparteix detalls que puguin ajudar altres persones...",
    savedDraft: "Esborrany guardat",
    childDraft: "Perfil infantil pendent de tutor",
    publicName: "Pseudònim públic",
    verificationQueue: "Revisió manual abans de mostrar-se com a verificat.",
    license: "Col·legiada",
    registry: "Registre",
    privacy: "Documents interns privats",
    verifiedStrip: "Professionals i entitats amb confiança visible",
    profileSummary: "Adults, tutors i perfils identificats comparteixen el mateix accés web i mòbil.",
    darkMode: "Mode fosc",
    lightMode: "Mode clar",
    experienceTitle: "Aporta la teva experiència",
    experienceSubtitle: "Un punt ràpid",
    shareExperience: "Com ha estat la teva experiència en aquest lloc?",
    uploadHint: "JPG, PNG (màx. 10 MB)",
    experienceQuestion: "Com ha estat la teva experiència?",
    starRating: "La teva valoració global",
    anonymous: "Publica com a anònim",
    publish: "Publica",
    verifiedProfessionals: "Professionals i entitats verificades",
    seeAll: "Veure totes",
    contact: "Contactar",
    aboutPlace: "Sobre el lloc",
    reviewsTab: "Valoracions",
    openNow: "Obert ara",
    until: "Fins a les 20:00",
    rampAccess: "Accés amb rampa",
    adaptedBathroom: "Lavabo adaptat",
    quietZone: "Zona tranquil·la",
    wifi: "Wi‑Fi"
  },
  es: {
    workspace: {
      map: "Mapa",
      contributions: "Aportaciones",
      support: "Tarjeta de ayuda",
      profiles: "Usuarios",
      verified: "Directorio verificado"
    },
    status: "Sesión protegida",
    mapSubtitle: "Consulta lugares, guarda favoritos y revisa el contexto antes de ir.",
    filters: "Filtros",
    quiet: "Ruido bajo",
    lowLight: "Luz suave",
    clearExit: "Salida clara",
    selectedPlace: "Lugar seleccionado",
    score: "Score",
    reviews: "Valoraciones",
    images: "Imágenes",
    favorite: "Favorito",
    report: "Informar",
    sensoryReading: "Indicadores sensoriales",
    placeQueue: "Contenido pendiente de moderación",
    uploadDrop: "Arrastra una imagen o haz clic para subir",
    commentPlaceholder: "Comparte detalles que puedan ayudar a otras personas...",
    savedDraft: "Borrador guardado",
    childDraft: "Perfil infantil pendiente del tutor",
    publicName: "Seudónimo público",
    verificationQueue: "Revisión manual antes de mostrarse como verificado.",
    license: "Colegiada",
    registry: "Registro",
    privacy: "Documentos internos privados",
    verifiedStrip: "Profesionales y entidades con confianza visible",
    profileSummary: "Adultos, tutores y perfiles identificados comparten el mismo acceso web y móvil.",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    experienceTitle: "Aporta tu experiencia",
    experienceSubtitle: "Un punto rápido",
    shareExperience: "¿Cómo ha sido tu experiencia en este lugar?",
    uploadHint: "JPG, PNG (máx. 10 MB)",
    experienceQuestion: "¿Cómo ha sido tu experiencia?",
    starRating: "Tu valoración global",
    anonymous: "Publicar como anónimo",
    publish: "Publicar",
    verifiedProfessionals: "Profesionales y entidades verificadas",
    seeAll: "Ver todas",
    contact: "Contactar",
    aboutPlace: "Sobre el lugar",
    reviewsTab: "Valoraciones",
    openNow: "Abierto ahora",
    until: "Hasta las 20:00",
    rampAccess: "Acceso con rampa",
    adaptedBathroom: "Baño adaptado",
    quietZone: "Zona tranquila",
    wifi: "Wi‑Fi"
  },
  en: {
    workspace: {
      map: "Map",
      contributions: "Contributions",
      support: "Help card",
      profiles: "Users",
      verified: "Verified directory"
    },
    status: "Protected session",
    mapSubtitle: "Review places, save favorites and check context before going.",
    filters: "Filters",
    quiet: "Low noise",
    lowLight: "Soft light",
    clearExit: "Clear exit",
    selectedPlace: "Selected place",
    score: "Score",
    reviews: "Reviews",
    images: "Images",
    favorite: "Favorite",
    report: "Report",
    sensoryReading: "Sensory indicators",
    placeQueue: "Content pending moderation",
    uploadDrop: "Drag an image or click to upload",
    commentPlaceholder: "Share details that could help other people...",
    savedDraft: "Draft saved",
    childDraft: "Child profile pending tutor",
    publicName: "Public nickname",
    verificationQueue: "Manual review before showing as verified.",
    license: "License",
    registry: "Registry",
    privacy: "Internal documents private",
    verifiedStrip: "Professionals and organizations with visible trust",
    profileSummary: "Adults, tutors and identified profiles share the same web and mobile access.",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    experienceTitle: "Share your experience",
    experienceSubtitle: "A quick point",
    shareExperience: "How was your experience in this place?",
    uploadHint: "JPG, PNG (max. 10 MB)",
    experienceQuestion: "How was your experience?",
    starRating: "Your overall rating",
    anonymous: "Post anonymously",
    publish: "Publish",
    verifiedProfessionals: "Verified professionals and organizations",
    seeAll: "View all",
    contact: "Contact",
    aboutPlace: "About the place",
    reviewsTab: "Reviews",
    openNow: "Open now",
    until: "Until 20:00",
    rampAccess: "Ramp access",
    adaptedBathroom: "Adapted bathroom",
    quietZone: "Quiet zone",
    wifi: "Wi‑Fi"
  }
};

const filtersByLocale = (locale: Locale) => [
  copy[locale].quiet,
  copy[locale].lowLight,
  copy[locale].clearExit
];

const pinPositions = [
  { left: "45%", top: "43%" },
  { left: "27%", top: "58%" },
  { left: "72%", top: "72%" }
];

const sensoryScores = [
  { key: "noise", value: 2, tone: "teal", Icon: Volume2, level: { ca: "Baix", es: "Bajo", en: "Low" } },
  { key: "lighting", value: 3, tone: "amber", Icon: Lightbulb, level: { ca: "Mitjà", es: "Medio", en: "Medium" } },
  { key: "crowd", value: 2, tone: "teal", Icon: Users, level: { ca: "Baixa", es: "Baja", en: "Low" } },
  { key: "quietSpace", value: 2, tone: "sage", Icon: Hand, level: { ca: "Baix", es: "Bajo", en: "Low" } },
  { key: "exitEase", value: 5, tone: "blue", Icon: DoorOpen, level: { ca: "Alta", es: "Alta", en: "High" } }
] as const;

export function PlatformApp() {
  const [locale, setLocale] = useState<Locale>("ca");
  const [activeView, setActiveView] = useState<AppView>("map");
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [rating, setRating] = useState(0);
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
    <main
      data-theme={isDarkMode ? "dark" : "light"}
      className="app-shell min-h-screen bg-[var(--background)] text-[var(--foreground)]"
    >
      <header className="topbar border-b border-[var(--line)]">
        <div className="topbar-inner mx-auto grid max-w-[1520px] gap-4 px-4 py-4 xl:grid-cols-[220px_minmax(320px,1fr)_auto_auto_auto] xl:items-center xl:px-6">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <Map aria-hidden="true" size={23} />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold leading-tight tracking-normal text-[var(--teal-strong)]">
                {t.appName}
              </h1>
            </div>
          </div>

          <label className="focus-within-ring top-search flex min-h-12 items-center gap-3 rounded-md border border-[var(--line)] bg-white px-4">
            <Search aria-hidden="true" size={19} className="shrink-0 text-[var(--muted)]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--muted)]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dictionary[locale].search}
            />
          </label>

          <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-white px-4 text-[14px] font-semibold text-[var(--foreground)]">
            <SlidersHorizontal aria-hidden="true" size={17} />
            {c.filters}
          </button>

          <label className="focus-within-ring inline-flex min-h-12 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-[14px] font-medium">
            <Languages aria-hidden="true" size={17} className="text-[var(--muted)]" />
            <select
              className="min-w-24 bg-transparent text-[14px] outline-none"
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

          <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--teal-strong)] px-4 text-[14px] font-semibold text-white shadow-sm shadow-[rgba(15,93,98,0.22)]">
            <UserRound aria-hidden="true" size={17} />
            Apple / Google
          </button>
        </div>
      </header>

      <div className="mx-auto grid min-w-0 max-w-[1520px] gap-0 px-4 lg:grid-cols-[190px_minmax(0,1fr)] xl:px-6">
        <aside className="left-rail min-w-0 border-r border-[var(--line)] bg-[var(--panel)] lg:min-h-[calc(100vh-81px)]">
          <nav aria-label="Navegació principal" className="flex max-w-full gap-2 overflow-x-auto p-4 lg:flex-col lg:overflow-visible">
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
                  <Icon aria-hidden="true" size={20} />
                  <span>{t[tab.id]}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden px-4 pb-5 lg:mt-auto lg:block">
            <section className="account-card">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--teal)] text-white">
                <UserRound aria-hidden="true" size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">Laia M.</p>
                <p className="truncate text-[12px] text-[var(--muted)]">Usuària</p>
              </div>
              <ChevronRight aria-hidden="true" size={15} className="ml-auto text-[var(--muted)]" />
            </section>

            <button
              className="focus-ring mode-toggle"
              aria-pressed={isDarkMode}
              aria-label={isDarkMode ? c.lightMode : c.darkMode}
              onClick={() => setIsDarkMode((value) => !value)}
            >
              {isDarkMode ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
              <span>{isDarkMode ? c.lightMode : c.darkMode}</span>
              <span className="mode-switch" data-on={isDarkMode} />
            </button>
          </div>
        </aside>

        <section className="min-w-0 py-4 pl-0 lg:pl-4">
          {activeView === "map" && (
            <MapWorkspace
              locale={locale}
              selectedPlace={selectedPlace}
              selectedPlaceId={selectedPlace.id}
              filteredPlaces={filteredPlaces}
              experienceOpen={experienceOpen}
              files={pendingFiles}
              comment={comment}
              rating={rating}
              anonymous={anonymous}
              onSelectPlace={setSelectedPlaceId}
              onToggleExperience={() => setExperienceOpen((value) => !value)}
              onFiles={(files) => setPendingFiles(files)}
              onComment={setComment}
              onRating={setRating}
              onAnonymous={setAnonymous}
              onOpenVerified={() => setActiveView("verified")}
            />
          )}

          {activeView !== "map" && (
            <>
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-[28px] font-semibold leading-tight text-[var(--foreground)]">
                    {c.workspace[activeView]}
                  </h2>
                  <p className="mt-1 max-w-2xl text-[14px] leading-6 text-[var(--muted)]">{c.profileSummary}</p>
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
                    verificationQueue: c.verificationQueue,
                    contact: c.contact
                  }}
                />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function MapWorkspace({
  locale,
  selectedPlace,
  selectedPlaceId,
  filteredPlaces,
  experienceOpen,
  files,
  comment,
  rating,
  anonymous,
  onSelectPlace,
  onToggleExperience,
  onFiles,
  onComment,
  onRating,
  onAnonymous,
  onOpenVerified
}: {
  locale: Locale;
  selectedPlace: Place;
  selectedPlaceId: string;
  filteredPlaces: Place[];
  experienceOpen: boolean;
  files: string[];
  comment: string;
  rating: number;
  anonymous: boolean;
  onSelectPlace: (id: string) => void;
  onToggleExperience: () => void;
  onFiles: (files: string[]) => void;
  onComment: (comment: string) => void;
  onRating: (rating: number) => void;
  onAnonymous: (anonymous: boolean) => void;
  onOpenVerified: () => void;
}) {
  return (
    <div className="reference-workspace">
      <section className="map-stage surface-panel">
        <div className="map-canvas reference-map" aria-label="Mapa visual de llocs sensorials">
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

          <div className="map-tools" aria-label="Controls del mapa">
            <button className="focus-ring" aria-label="Apropar">
              <Plus aria-hidden="true" size={18} />
            </button>
            <button className="focus-ring" aria-label="Allunyar">
              <Minus aria-hidden="true" size={18} />
            </button>
            <button className="focus-ring" aria-label="Ubicació">
              <LocateFixed aria-hidden="true" size={18} />
            </button>
            <button className="focus-ring" aria-label="Capes">
              <Layers aria-hidden="true" size={18} />
            </button>
          </div>

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

          <div className="map-scale">200 m</div>
        </div>

      </section>

      <PlaceDetailsPanel locale={locale} selectedPlace={selectedPlace} />

      <ExperienceDock
        locale={locale}
        open={experienceOpen}
        files={files}
        comment={comment}
        rating={rating}
        anonymous={anonymous}
        onToggle={onToggleExperience}
        onFiles={onFiles}
        onComment={onComment}
        onRating={onRating}
        onAnonymous={onAnonymous}
        onOpenVerified={onOpenVerified}
      />
    </div>
  );
}

function PlaceDetailsPanel({ locale, selectedPlace }: { locale: Locale; selectedPlace: Place }) {
  const c = copy[locale];

  return (
    <aside className="place-detail-panel surface-panel overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div className="flex min-w-0 gap-4">
            <div className="detail-place-icon">
              <BookOpen aria-hidden="true" size={28} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[27px] font-semibold leading-tight">{selectedPlace.name}</h2>
              <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
                Carrer del Comte Borrell, 44 · {selectedPlace.city}
              </p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-[var(--teal-tint)] px-2 py-1 text-[12px] font-semibold text-[var(--teal-strong)]">
                <CheckCircle2 aria-hidden="true" size={14} />
                {c.openNow} · {c.until}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[32px] font-semibold leading-none">{selectedPlace.averageScore.toFixed(1)}</span>
              <RatingStars value={4} />
            </div>
            <p className="mt-1 text-[12px] text-[var(--muted)]">({selectedPlace.ratingCount} {c.reviews.toLowerCase()})</p>
          </div>
          <div className="flex gap-2">
            <button className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-[13px] font-semibold">
              <Heart aria-hidden="true" size={17} />
              {c.favorite}
            </button>
            <button className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-[13px] font-semibold">
              <Flag aria-hidden="true" size={17} />
              {c.report}
            </button>
          </div>
        </div>

        <div className="place-gallery mt-4">
          <img src="/media/calm-place-preview.png" alt="" className="place-gallery-main" loading="eager" />
          <img src="/media/calm-place-preview.png" alt="" className="place-gallery-side" loading="eager" />
          <div className="place-gallery-more">+ 5 fotos</div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-semibold">{c.sensoryReading}</h3>
            <button className="focus-ring inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--teal-strong)]">
              <CircleHelp aria-hidden="true" size={15} />
              Què signifiquen?
            </button>
          </div>
          <div className="space-y-3.5">
            {sensoryScores.map((score) => (
              <DetailedSensoryIndicator
                key={score.key}
                label={sensoryLabels[score.key][locale]}
                value={score.value}
                tone={score.tone}
                Icon={score.Icon}
                level={score.level[locale]}
              />
            ))}
          </div>
        </div>

        <div className="detail-tabs mt-6">
          <button className="detail-tab-active">{c.aboutPlace}</button>
          <button>
            {c.reviewsTab} ({selectedPlace.ratingCount})
          </button>
        </div>

        <p className="mt-4 text-[14px] leading-6 text-[var(--foreground)]">
          Biblioteca pública amb espais d'estudi, zona infantil i activitats culturals. {selectedPlace.description}
        </p>

        <div className="amenity-grid mt-5">
          <Amenity icon={Accessibility} label={c.rampAccess} />
          <Amenity icon={Wifi} label={c.wifi} />
          <Amenity icon={SquareStack} label={c.adaptedBathroom} />
          <Amenity icon={Navigation} label={c.quietZone} />
        </div>
      </div>
    </aside>
  );
}

function ExperienceDock({
  locale,
  open,
  files,
  comment,
  rating,
  anonymous,
  onToggle,
  onFiles,
  onComment,
  onRating,
  onAnonymous,
  onOpenVerified
}: {
  locale: Locale;
  open: boolean;
  files: string[];
  comment: string;
  rating: number;
  anonymous: boolean;
  onToggle: () => void;
  onFiles: (files: string[]) => void;
  onComment: (comment: string) => void;
  onRating: (rating: number) => void;
  onAnonymous: (anonymous: boolean) => void;
  onOpenVerified: () => void;
}) {
  const c = copy[locale];
  const verifiedCards = [
    {
      id: professionals[0]?.id ?? "professional",
      name: professionals[0]?.professionalName ?? "Clara Ferrer",
      kind: locale === "ca" ? "Psicòloga verificada" : locale === "es" ? "Psicóloga verificada" : "Verified psychologist",
      image: professionals[0]?.photoPath,
      detail: `${c.license}: ${professionals[0]?.licenseNumber ?? "24678"}`
    },
    {
      id: organizations[0]?.id ?? "organization",
      name: organizations[0]?.name ?? "Centre TEA Catalunya",
      kind: locale === "ca" ? "Entitat verificada" : locale === "es" ? "Entidad verificada" : "Verified organization",
      image: organizations[0]?.logoPath,
      detail: `${c.registry}: ${organizations[0]?.registryNumber ?? "AS-0312/2018"}`
    }
  ];

  return (
    <section className="experience-dock surface-panel">
      <button className="focus-ring experience-toggle" onClick={onToggle} aria-expanded={open}>
        <div className="experience-toggle-icon">
          <Plus aria-hidden="true" size={19} />
        </div>
        <div className="min-w-0 text-left">
          <h3>{c.experienceTitle}</h3>
          <p>{c.experienceSubtitle}</p>
        </div>
        <ChevronRight aria-hidden="true" size={18} className={open ? "rotate-90" : ""} />
      </button>

      {open && (
        <div className="experience-content">
          <div className="experience-form">
            <label className="focus-within-ring upload-mini">
              <ImageIcon aria-hidden="true" size={28} />
              <span>{c.uploadDrop}</span>
              <small>{c.uploadHint}</small>
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => onFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
              />
            </label>

            <div className="experience-comment">
              <p className="text-[12px] font-semibold text-[var(--muted)]">{c.shareExperience}</p>
              <textarea
                className="focus-ring mt-2 min-h-[104px] w-full resize-y rounded-md border border-[var(--line)] bg-white p-3 text-[13px] leading-5 outline-none placeholder:text-[var(--muted)]"
                value={comment}
                placeholder={c.commentPlaceholder}
                onChange={(event) => onComment(event.target.value)}
              />
              <p className="mt-1 text-right text-[11px] text-[var(--muted)]">{comment.length}/600</p>
            </div>

            <div className="experience-actions">
              <p className="text-[12px] font-semibold text-[var(--muted)]">{c.starRating}</p>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`focus-ring rating-button ${rating >= star ? "rating-button-active" : ""}`}
                    onClick={() => onRating(star)}
                    aria-pressed={rating >= star}
                    aria-label={`${star}/5`}
                  >
                    <Star aria-hidden="true" size={18} />
                  </button>
                ))}
              </div>
              <label className="mt-4 flex items-center gap-2 text-[12px] font-medium text-[var(--muted)]">
                <input
                  className="accent-[var(--teal)]"
                  type="checkbox"
                  checked={anonymous}
                  onChange={(event) => onAnonymous(event.target.checked)}
                />
                {c.anonymous}
              </label>
              <button className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--teal-strong)] px-4 py-3 text-[13px] font-semibold text-white">
                <Send aria-hidden="true" size={16} />
                {c.publish}
              </button>
            </div>
          </div>

          <div className="verified-strip">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3>{c.verifiedProfessionals}</h3>
              <button className="focus-ring text-link" onClick={onOpenVerified}>
                {c.seeAll}
              </button>
            </div>
            <div className="verified-strip-grid">
              {verifiedCards.map((card) => (
                <article key={card.id} className="verified-card">
                  <img src={card.image} alt="" className="h-14 w-14 rounded-md object-cover" />
                  <h4>{card.name}</h4>
                  <p className="verified-kind">
                    <ShieldCheck aria-hidden="true" size={13} />
                    {card.kind}
                  </p>
                  <p>{card.detail}</p>
                  <button className="focus-ring">{c.contact}</button>
                </article>
              ))}
            </div>
          </div>

          {files.length > 0 && (
            <ul className="experience-files">
              {files.map((file) => (
                <li key={file}>
                  <ImageIcon aria-hidden="true" size={15} />
                  {file}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
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
    | "professionalTrust"
    | "verified"
    | "verifiedStrip"
    | "license"
    | "registry"
    | "privacy"
    | "verificationQueue"
    | "contact",
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
              <button className="focus-ring mt-3 rounded-md border border-[var(--teal-soft)] px-3 py-2 text-[13px] font-semibold text-[var(--teal-strong)]">
                {labels.contact}
              </button>
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
              <button className="focus-ring mt-3 rounded-md border border-[var(--line)] px-3 py-2 text-[13px] font-semibold text-[var(--foreground)]">
                {labels.contact}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Amenity({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px] font-medium text-[var(--muted)]">
      <Icon aria-hidden="true" size={20} className="text-[var(--blue)]" />
      {label}
    </div>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5 text-[var(--amber)]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          size={18}
          fill={star <= value ? "currentColor" : "transparent"}
          className={star <= value ? "" : "text-[var(--line-strong)]"}
        />
      ))}
    </div>
  );
}

function DetailedSensoryIndicator({
  label,
  value,
  tone,
  Icon,
  level
}: {
  label: string;
  value: number;
  tone: "teal" | "sage" | "clay" | "blue" | "amber";
  Icon: LucideIcon;
  level: string;
}) {
  return (
    <div className="sensory-indicator">
      <Icon aria-hidden="true" size={18} />
      <span>{label}</span>
      <div className="sensory-spectrum" aria-hidden="true">
        <div className={`sensory-marker sensory-marker-${tone}`} style={{ left: `${value * 20}%` }} />
      </div>
      <strong>{level}</strong>
    </div>
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
