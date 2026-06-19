"use client";

import {
  Bell,
  Bookmark,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  CircleHelp,
  FileText,
  Flag,
  Globe2,
  HeartHandshake,
  Home,
  ImagePlus,
  Languages,
  Layers,
  LifeBuoy,
  LocateFixed,
  Lock,
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
  Sparkles,
  Star,
  Sun,
  Upload,
  UserRound,
  UsersRound,
  Volume2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Place as FirebasePlace } from "@accessibilitat/shared";
import { listActivePlaces } from "./lib/firebase-actions";
import { loadGoogleMaps, type GoogleMarkerInstance } from "./lib/google-maps";

type Locale = "ca" | "es" | "en";
type ViewId = "home" | "consult" | "contribute" | "support" | "profiles" | "verified";
type SensoryKey = "noise" | "density" | "light" | "wait";

type Place = {
  id: string;
  name: string;
  area: string;
  city: string;
  category: string;
  score: number;
  distance: string;
  description: string;
  quietDb: string;
  position: {
    lat: number;
    lng: number;
  };
};

type Professional = {
  id: string;
  name: string;
  role: string;
  license: string;
  college: string;
  specialty: string;
  initials: string;
};

type Organization = {
  id: string;
  name: string;
  city: string;
  registry: string;
  description: string;
  initials: string;
};

const locales: Record<Locale, string> = {
  ca: "Català",
  es: "Castellano",
  en: "English"
};

const navItems: Array<{ id: ViewId; icon: LucideIcon }> = [
  { id: "home", icon: Home },
  { id: "consult", icon: Search },
  { id: "contribute", icon: Upload },
  { id: "support", icon: CircleHelp },
  { id: "profiles", icon: UsersRound },
  { id: "verified", icon: ShieldCheck }
];

const copy: Record<
  Locale,
  {
    nav: Record<ViewId, string>;
    status: string;
    focus: string;
    focusOn: string;
    darkMode: string;
    lightMode: string;
    greeting: string;
    homeIntro: string;
    sensoryMap: string;
    mapArea: string;
    savedPlaces: string;
    viewAll: string;
    trust: string;
    professionalsAndEntities: string;
    pendingDraft: string;
    continueDraft: string;
    tutorReview: string;
    supportCard: string;
    openSupport: string;
    consultTitle: string;
    consultIntro: string;
    searchPlaceholder: string;
    filters: string[];
    placeDetails: string;
    sensoryState: string;
    reportPlace: string;
    favorite: string;
    contributionTitle: string;
    contributionIntro: string;
    uploadImage: string;
    notes: string;
    notesPlaceholder: string;
    submit: string;
    anonymous: string;
    pendingModeration: string;
    childApproval: string;
    supportTitle: string;
    supportIntro: string;
    supportMessage: string;
    trustedContact: string;
    focusModeTitle: string;
    focusModeBody: string;
    profilesTitle: string;
    profilesIntro: string;
    adultProfile: string;
    tutorProfile: string;
    childProfile: string;
    sensoryProfile: string;
    verifiedTitle: string;
    verifiedIntro: string;
    license: string;
    registry: string;
    contact: string;
    verified: string;
    privateEvidence: string;
  }
> = {
  ca: {
    nav: {
      home: "Inici",
      consult: "Consulta",
      contribute: "Aportacions",
      support: "Ajuda",
      profiles: "Perfils",
      verified: "Verificats"
    },
    status: "Sessió protegida",
    focus: "Mode focus",
    focusOn: "Focus actiu",
    darkMode: "Mode fosc",
    lightMode: "Mode clar",
    greeting: "Bon dia, Josep",
    homeIntro:
      "Basat en el teu perfil sensorial, et suggerim visitar espais amb baixa densitat acústica i sortides clares.",
    sensoryMap: "Mapa Sensorial",
    mapArea: "Barcelona, districtes de pau",
    savedPlaces: "Llocs desats",
    viewAll: "Veure tots",
    trust: "Confiança",
    professionalsAndEntities: "Professionals i entitats",
    pendingDraft: "Esborrany pendent",
    continueDraft: "Continuar esborrany",
    tutorReview: "Revisió del tutor",
    supportCard: "Targeta d'ajuda",
    openSupport: "Obrir targeta",
    consultTitle: "Explora llocs sensorials",
    consultIntro:
      "Consulta el mapa, filtra per necessitats sensorials i revisa la fitxa abans d'anar-hi.",
    searchPlaceholder: "Cerca llocs, ciutat o categoria",
    filters: ["Baix soroll", "Llum suau", "Poca densitat", "Sortida clara"],
    placeDetails: "Fitxa del lloc",
    sensoryState: "Estat sensorial",
    reportPlace: "Reportar",
    favorite: "Desar",
    contributionTitle: "Aportació sensorial",
    contributionIntro:
      "Comparteix l'estat actual del lloc quan ho puguis fer amb calma. Les imatges queden pendents de moderació.",
    uploadImage: "Pujar imatges",
    notes: "Notes atmosfèriques",
    notesPlaceholder: "Descriu soroll, llum, afluència, espera o qualsevol detall útil...",
    submit: "Enviar aportació",
    anonymous: "Publicar com a anònim",
    pendingModeration: "Pendent de moderació",
    childApproval: "Si publica un perfil infantil, el tutor ho revisa abans d'enviar.",
    supportTitle: "Ajuda immediata",
    supportIntro: "Targeta de comunicació, contacte de confiança i focus mode per reduir càrrega cognitiva.",
    supportMessage:
      "Soc una persona autista. Ara mateix em costa parlar o respondre. Necessito uns minuts, un lloc tranquil o contactar amb una persona de confiança.",
    trustedContact: "Contacte de confiança",
    focusModeTitle: "Focus mode",
    focusModeBody: "Redueix informació secundària, manté accions crítiques i fa la navegació més tranquil·la.",
    profilesTitle: "Perfils",
    profilesIntro:
      "Adults, tutors i perfils tutelats conviuen dins el mateix compte sense separar infants com a registre lliure.",
    adultProfile: "Adult o persona identificada",
    tutorProfile: "Tutor principal",
    childProfile: "Perfil infantil tutelat",
    sensoryProfile: "Perfil sensorial",
    verifiedTitle: "Professionals i entitats verificades",
    verifiedIntro:
      "Perfils amb foto o logo, número de col·legiat o registre, i verificació manual abans de mostrar confiança pública.",
    license: "Col·legiat/da",
    registry: "Registre",
    contact: "Contactar",
    verified: "Verificat",
    privateEvidence: "L'evidència documental queda privada per administració."
  },
  es: {
    nav: {
      home: "Inicio",
      consult: "Consulta",
      contribute: "Aportaciones",
      support: "Ayuda",
      profiles: "Perfiles",
      verified: "Verificados"
    },
    status: "Sesión protegida",
    focus: "Modo focus",
    focusOn: "Focus activo",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    greeting: "Buenos días, Josep",
    homeIntro:
      "Según tu perfil sensorial, sugerimos visitar espacios con baja densidad acústica y salidas claras.",
    sensoryMap: "Mapa Sensorial",
    mapArea: "Barcelona, distritos de paz",
    savedPlaces: "Lugares guardados",
    viewAll: "Ver todos",
    trust: "Confianza",
    professionalsAndEntities: "Profesionales y entidades",
    pendingDraft: "Borrador pendiente",
    continueDraft: "Continuar borrador",
    tutorReview: "Revisión del tutor",
    supportCard: "Tarjeta de ayuda",
    openSupport: "Abrir tarjeta",
    consultTitle: "Explora lugares sensoriales",
    consultIntro:
      "Consulta el mapa, filtra por necesidades sensoriales y revisa la ficha antes de ir.",
    searchPlaceholder: "Busca lugares, ciudad o categoría",
    filters: ["Bajo ruido", "Luz suave", "Poca densidad", "Salida clara"],
    placeDetails: "Ficha del lugar",
    sensoryState: "Estado sensorial",
    reportPlace: "Reportar",
    favorite: "Guardar",
    contributionTitle: "Aportación sensorial",
    contributionIntro:
      "Comparte el estado actual del lugar cuando puedas hacerlo con calma. Las imágenes quedan pendientes de moderación.",
    uploadImage: "Subir imágenes",
    notes: "Notas atmosféricas",
    notesPlaceholder: "Describe ruido, luz, afluencia, espera o cualquier detalle útil...",
    submit: "Enviar aportación",
    anonymous: "Publicar como anónimo",
    pendingModeration: "Pendiente de moderación",
    childApproval: "Si publica un perfil infantil, el tutor lo revisa antes de enviar.",
    supportTitle: "Ayuda inmediata",
    supportIntro: "Tarjeta de comunicación, contacto de confianza y focus mode para reducir carga cognitiva.",
    supportMessage:
      "Soy una persona autista. Ahora mismo me cuesta hablar o responder. Necesito unos minutos, un lugar tranquilo o contactar con una persona de confianza.",
    trustedContact: "Contacto de confianza",
    focusModeTitle: "Focus mode",
    focusModeBody: "Reduce información secundaria, mantiene acciones críticas y hace la navegación más tranquila.",
    profilesTitle: "Perfiles",
    profilesIntro:
      "Adultos, tutores y perfiles tutelados conviven en la misma cuenta sin separar menores como registro libre.",
    adultProfile: "Adulto o persona identificada",
    tutorProfile: "Tutor principal",
    childProfile: "Perfil infantil tutelado",
    sensoryProfile: "Perfil sensorial",
    verifiedTitle: "Profesionales y entidades verificadas",
    verifiedIntro:
      "Perfiles con foto o logo, número de colegiado o registro, y verificación manual antes de mostrar confianza pública.",
    license: "Colegiado/a",
    registry: "Registro",
    contact: "Contactar",
    verified: "Verificado",
    privateEvidence: "La evidencia documental queda privada para administración."
  },
  en: {
    nav: {
      home: "Dashboard",
      consult: "Discover",
      contribute: "Report",
      support: "Help",
      profiles: "Profiles",
      verified: "Expert"
    },
    status: "Protected session",
    focus: "Focus mode",
    focusOn: "Focus active",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    greeting: "Good morning, Josep",
    homeIntro:
      "Based on your sensory profile, we suggest spaces with low acoustic density and clear exits.",
    sensoryMap: "Sensory Map",
    mapArea: "Barcelona, calm districts",
    savedPlaces: "Saved places",
    viewAll: "View all",
    trust: "Trust",
    professionalsAndEntities: "Professionals and entities",
    pendingDraft: "Pending draft",
    continueDraft: "Continue draft",
    tutorReview: "Tutor review",
    supportCard: "Help card",
    openSupport: "Open card",
    consultTitle: "Explore sensory places",
    consultIntro: "Use the map, filter by sensory needs and review the place before going.",
    searchPlaceholder: "Search places, city or category",
    filters: ["Low noise", "Soft light", "Low density", "Clear exit"],
    placeDetails: "Place details",
    sensoryState: "Sensory state",
    reportPlace: "Report",
    favorite: "Save",
    contributionTitle: "Sensory report",
    contributionIntro:
      "Share the current state of the place when you can do it calmly. Images stay pending moderation.",
    uploadImage: "Upload images",
    notes: "Atmospheric notes",
    notesPlaceholder: "Describe noise, light, crowding, waiting or any useful detail...",
    submit: "Submit report",
    anonymous: "Post anonymously",
    pendingModeration: "Pending moderation",
    childApproval: "If a child profile publishes, the tutor reviews before sending.",
    supportTitle: "Immediate help",
    supportIntro: "Communication card, trusted contact and focus mode to reduce cognitive load.",
    supportMessage:
      "I am autistic. Right now it is hard for me to speak or answer. I need a few minutes, a quiet place or a trusted contact.",
    trustedContact: "Trusted contact",
    focusModeTitle: "Focus mode",
    focusModeBody: "Reduces secondary information, keeps critical actions and makes navigation calmer.",
    profilesTitle: "Profiles",
    profilesIntro:
      "Adults, tutors and tutored profiles live inside the same account without free child registration.",
    adultProfile: "Adult or identified person",
    tutorProfile: "Main tutor",
    childProfile: "Tutored child profile",
    sensoryProfile: "Sensory profile",
    verifiedTitle: "Verified professionals and entities",
    verifiedIntro:
      "Profiles with photo or logo, license or registry number, and manual verification before showing public trust.",
    license: "License",
    registry: "Registry",
    contact: "Contact",
    verified: "Verified",
    privateEvidence: "Documentary evidence remains private for administration."
  }
};

const places: Place[] = [
  {
    id: "biblioteca-veridian",
    name: "Biblioteca Veridian",
    area: "Zona silenciosa",
    city: "Barcelona",
    category: "Cultura",
    score: 9.8,
    distance: "0.4 km",
    quietDb: "34dB",
    position: { lat: 41.3867, lng: 2.1699 },
    description:
      "Biblioteca amb llum difusa, plantes baixes tranquil·les i sortida principal visible des de la sala de lectura."
  },
  {
    id: "atrium-garden",
    name: "Jardí Atrium",
    area: "Espai verd",
    city: "Barcelona",
    category: "Exterior",
    score: 9.5,
    distance: "0.8 km",
    quietDb: "38dB",
    position: { lat: 41.3921, lng: 2.1636 },
    description:
      "Pati obert amb recorregut senzill, bancs separats i zones d'ombra. Recomanat en hores de baixa afluència."
  },
  {
    id: "mar-blau",
    name: "Esbeteria Mar Blau",
    area: "Cafeteria tranquil·la",
    city: "Barcelona",
    category: "Cafeteria",
    score: 8.9,
    distance: "1.2 km",
    quietDb: "42dB",
    position: { lat: 41.3815, lng: 2.1871 },
    description:
      "Interior petit amb música baixa al matí, personal amable i una taula lateral amb menys estímuls visuals."
  }
];

const googleMapStyles: Array<Record<string, unknown>> = [
  { elementType: "geometry", stylers: [{ color: "#f6f3f2" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#44474a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fcf8f8" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c5c6ca" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e5e2e1" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d5e0f7" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#ddd9d9" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#ebe7e7" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#bcc7dd" }] }
];

function toUiPlace(place: FirebasePlace): Place {
  return {
    id: place.id,
    name: place.name,
    area: place.addressOrArea || place.category,
    city: place.city,
    category: place.category,
    score: place.averageScore || 0,
    distance: "Live",
    quietDb: place.ratingCount > 0 ? `${place.ratingCount} reviews` : "New",
    description: place.description,
    position: {
      lat: place.position.latitude,
      lng: place.position.longitude
    }
  };
}

const professionals: Professional[] = [
  {
    id: "marta-gomez",
    name: "Marta Gómez",
    role: "Psicòloga",
    license: "COPC 47145",
    college: "Col·legi Oficial de Psicologia de Catalunya",
    specialty: "Autisme adult i suport familiar",
    initials: "MG"
  },
  {
    id: "pau-ferrer",
    name: "Pau Ferrer",
    role: "Psicòleg",
    license: "COPC 50218",
    college: "Col·legi Oficial de Psicologia de Catalunya",
    specialty: "Infància, tutors i regulació sensorial",
    initials: "PF"
  }
];

const organizations: Organization[] = [
  {
    id: "centre-tea",
    name: "Centre TEA Catalunya",
    city: "Barcelona",
    registry: "Reg. E-12345",
    description: "Centre d'acompanyament per a persones autistes i famílies.",
    initials: "CT"
  },
  {
    id: "tea-valles",
    name: "Associació TEA Vallès",
    city: "Sabadell",
    registry: "Reg. E-98765",
    description: "Associació local amb activitats de suport i orientació.",
    initials: "TV"
  }
];

const childProfiles = [
  { alias: "Aina", age: "8", state: "Aportació pendent" },
  { alias: "Pau", age: "11", state: "Preferències actualitzades" }
];

const sensoryKeys: Array<{ key: SensoryKey; low: string; high: string }> = [
  { key: "noise", low: "Silenci", high: "Actiu" },
  { key: "density", low: "Privat", high: "Social" },
  { key: "light", low: "Suau", high: "Vibrant" },
  { key: "wait", low: "Ràpid", high: "Llarg" }
];

const sensoryLabels: Record<Locale, Record<SensoryKey, string>> = {
  ca: { noise: "Soroll", density: "Densitat", light: "Impacte visual", wait: "Espera" },
  es: { noise: "Ruido", density: "Densidad", light: "Impacto visual", wait: "Espera" },
  en: { noise: "Noise", density: "Density", light: "Visual impact", wait: "Waiting" }
};

const sensoryWords: Record<Locale, Record<SensoryKey, string[]>> = {
  ca: {
    noise: ["Silenciós", "Suau", "Moderat", "Actiu", "Intens"],
    density: ["Aïllat", "Tranquil", "Mitjà", "Social", "Ple"],
    light: ["Calma", "Serena", "Clara", "Viva", "Saturada"],
    wait: ["Immediat", "Curt", "Moderat", "Llarg", "Molt llarg"]
  },
  es: {
    noise: ["Silencioso", "Suave", "Moderado", "Activo", "Intenso"],
    density: ["Aislado", "Tranquilo", "Medio", "Social", "Lleno"],
    light: ["Calma", "Serena", "Clara", "Viva", "Saturada"],
    wait: ["Inmediato", "Corto", "Moderado", "Largo", "Muy largo"]
  },
  en: {
    noise: ["Silent", "Muted", "Moderate", "Active", "Intense"],
    density: ["Secluded", "Quiet", "Medium", "Social", "Full"],
    light: ["Calm", "Serene", "Clear", "Vivid", "Saturated"],
    wait: ["Immediate", "Short", "Moderate", "Long", "Very long"]
  }
};

export function PlatformApp() {
  const [locale, setLocale] = useState<Locale>("ca");
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>(places);
  const [query, setQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0].id);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [anonymous, setAnonymous] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [ratings, setRatings] = useState<Record<SensoryKey, number>>({
    noise: 2,
    density: 2,
    light: 2,
    wait: 1
  });

  useEffect(() => {
    let active = true;

    listActivePlaces()
      .then((firebasePlaces) => {
        if (!active || firebasePlaces.length === 0) {
          return;
        }

        const mappedPlaces = firebasePlaces.map(toUiPlace);
        setAvailablePlaces(mappedPlaces);
        setSelectedPlaceId((current) =>
          mappedPlaces.some((place) => place.id === current) ? current : mappedPlaces[0].id
        );
      })
      .catch(() => {
        if (active) {
          setAvailablePlaces(places);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const c = copy[locale];
  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return availablePlaces;
    }

    return availablePlaces.filter((place) =>
      [place.name, place.area, place.city, place.category]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [availablePlaces, query]);

  const selectedPlace = availablePlaces.find((place) => place.id === selectedPlaceId) ?? availablePlaces[0];

  const updateRating = (key: SensoryKey, value: number) => {
    setRatings((current) => ({ ...current, [key]: value }));
  };

  return (
    <main
      className="spectrum-app"
      data-theme={darkMode ? "dark" : "light"}
      data-focus={focusMode ? "true" : "false"}
    >
      <div className="app-frame">
        <aside className="side-rail" aria-label="Spectrum Access">
          <div className="brand-block">
            <OfficialLogo size={54} />
            <div>
              <strong>Spectrum Access</strong>
              <span>Sensory Accessibility</span>
            </div>
          </div>

          <nav className="primary-nav" aria-label="Navegació principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="nav-button"
                  data-active={selected}
                  aria-pressed={selected}
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon aria-hidden="true" size={21} />
                  <span>{c.nav[item.id]}</span>
                  {selected ? <ChevronRight aria-hidden="true" size={15} /> : null}
                </button>
              );
            })}
          </nav>

          <div className="side-footer focus-hide">
            <div className="member-card">
              <span className="avatar avatar-small">JB</span>
              <div>
                <strong>Josep B.</strong>
                <span>Tutor</span>
              </div>
            </div>
            <div className="security-card">
              <ShieldCheck aria-hidden="true" size={22} />
              <div>
                <span>{c.status}</span>
                <strong>{c.verified}</strong>
              </div>
            </div>
          </div>
        </aside>

        <section className="work-area">
          <header className="topbar">
            <div>
              <p className="screen-label">Spectrum Access</p>
              <h1>{c.nav[activeView]}</h1>
            </div>

            <div className="top-actions">
              <span className="health-pill focus-hide">
                <Check aria-hidden="true" size={15} />
                {c.status}
              </span>
              <label className="select-control">
                <Globe2 aria-hidden="true" size={17} />
                <select
                  aria-label="Idioma"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as Locale)}
                >
                  {Object.entries(locales).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <ToggleButton
                active={focusMode}
                label={focusMode ? c.focusOn : c.focus}
                activeIcon={Sparkles}
                inactiveIcon={Sparkles}
                onClick={() => setFocusMode((value) => !value)}
              />
              <ToggleButton
                active={darkMode}
                label={darkMode ? c.lightMode : c.darkMode}
                activeIcon={Sun}
                inactiveIcon={Moon}
                onClick={() => setDarkMode((value) => !value)}
              />
              <button type="button" className="icon-button focus-hide" aria-label="Notificacions">
                <Bell aria-hidden="true" size={22} />
              </button>
            </div>
          </header>

          {focusMode ? <FocusNotice copy={c} onOpenSupport={() => setActiveView("support")} /> : null}

          {activeView === "home" ? (
            <HomeView
              copy={c}
              locale={locale}
              places={availablePlaces}
              selectedPlace={selectedPlace}
              onNavigate={setActiveView}
              onSelectPlace={setSelectedPlaceId}
            />
          ) : null}

          {activeView === "consult" ? (
            <ConsultView
              copy={c}
              locale={locale}
              query={query}
              selectedFilter={selectedFilter}
              selectedPlace={selectedPlace}
              places={filteredPlaces}
              onQuery={setQuery}
              onFilter={setSelectedFilter}
              onSelectPlace={setSelectedPlaceId}
              onNavigate={setActiveView}
            />
          ) : null}

          {activeView === "contribute" ? (
            <ContributeView
              copy={c}
              locale={locale}
              ratings={ratings}
              notes={notes}
              anonymous={anonymous}
              uploadedFiles={uploadedFiles}
              selectedPlace={selectedPlace}
              onRating={updateRating}
              onNotes={setNotes}
              onAnonymous={setAnonymous}
              onFiles={setUploadedFiles}
            />
          ) : null}

          {activeView === "support" ? (
            <SupportView copy={c} focusMode={focusMode} onFocus={() => setFocusMode(true)} />
          ) : null}

          {activeView === "profiles" ? <ProfilesView copy={c} locale={locale} /> : null}

          {activeView === "verified" ? <VerifiedView copy={c} /> : null}
        </section>
      </div>
    </main>
  );
}

function OfficialLogo({ size }: { size: number }) {
  return (
    <img
      src="/brand/accessibilitat-logo.svg"
      width={size}
      height={size}
      alt="Spectrum Access"
      className="official-logo"
    />
  );
}

function ToggleButton({
  active,
  label,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
  onClick
}: {
  active: boolean;
  label: string;
  activeIcon: LucideIcon;
  inactiveIcon: LucideIcon;
  onClick: () => void;
}) {
  const Icon = active ? ActiveIcon : InactiveIcon;

  return (
    <button type="button" className="toggle-button" data-active={active} aria-pressed={active} onClick={onClick}>
      <Icon aria-hidden="true" size={17} />
      <span>{label}</span>
      <span className="switch" />
    </button>
  );
}

function FocusNotice({ copy: c, onOpenSupport }: { copy: (typeof copy)[Locale]; onOpenSupport: () => void }) {
  return (
    <section className="focus-notice" aria-live="polite">
      <div>
        <strong>{c.focusModeTitle}</strong>
        <span>{c.focusModeBody}</span>
      </div>
      <button type="button" onClick={onOpenSupport}>
        {c.openSupport}
        <ChevronRight aria-hidden="true" size={17} />
      </button>
    </section>
  );
}

function HomeView({
  copy: c,
  locale,
  places: availablePlaces,
  selectedPlace,
  onNavigate,
  onSelectPlace
}: {
  copy: (typeof copy)[Locale];
  locale: Locale;
  places: Place[];
  selectedPlace: Place;
  onNavigate: (view: ViewId) => void;
  onSelectPlace: (id: string) => void;
}) {
  return (
    <div className="dashboard-grid">
      <section className="hero-copy">
        <h2>{c.greeting}</h2>
        <p>{c.homeIntro}</p>
      </section>

      <MapPanel
        title={c.sensoryMap}
        subtitle={c.mapArea}
        places={availablePlaces}
        selectedPlace={selectedPlace}
        onSelectPlace={onSelectPlace}
        onOpen={() => onNavigate("consult")}
      />

      <section className="panel saved-panel">
        <PanelHeading title={c.savedPlaces} action={c.viewAll} onAction={() => onNavigate("consult")} />
        <div className="saved-list">
          {availablePlaces.map((place) => (
            <button key={place.id} type="button" className="saved-row" onClick={() => onNavigate("consult")}>
              <PlaceSymbol />
              <span>
                <strong>{place.name}</strong>
                <small>
                  {place.area} · {place.distance}
                </small>
              </span>
              <em>{place.score.toFixed(1)}</em>
              <ChevronRight aria-hidden="true" size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="panel draft-panel">
        <PanelHeading title={c.pendingDraft} action={c.continueDraft} onAction={() => onNavigate("contribute")} />
        <div className="draft-layout">
          <PlaceSymbol large />
          <div>
            <h3>Esbeteria Mar Blau</h3>
            <p>Avinguda del Mar, 25 · Barcelona</p>
            <span>
              <CalendarCheck aria-hidden="true" size={15} />
              Creat: 18/06/2026
            </span>
            <span>
              <Lock aria-hidden="true" size={15} />
              {c.tutorReview}
            </span>
          </div>
        </div>
        <button type="button" className="primary-action" onClick={() => onNavigate("contribute")}>
          {c.continueDraft}
        </button>
      </section>

      <section className="panel trust-panel">
        <PanelHeading title={`${c.trust} · ${c.professionalsAndEntities}`} action={c.viewAll} onAction={() => onNavigate("verified")} />
        <div className="trust-strip">
          {professionals.slice(0, 1).map((professional) => (
            <VerifiedMiniCard key={professional.id} title={professional.name} meta={professional.license} initials={professional.initials} />
          ))}
          {organizations.map((organization) => (
            <VerifiedMiniCard key={organization.id} title={organization.name} meta={organization.registry} initials={organization.initials} />
          ))}
        </div>
      </section>

      <section className="panel support-panel">
        <div>
          <h3>{c.supportCard}</h3>
          <p>{c.supportIntro}</p>
        </div>
        <button type="button" className="primary-action" onClick={() => onNavigate("support")}>
          {c.openSupport}
        </button>
      </section>

      <section className="panel profile-panel">
        <PanelHeading title={c.profilesTitle} action={c.nav.profiles} onAction={() => onNavigate("profiles")} />
        <div className="child-list">
          {childProfiles.map((profile) => (
            <div key={profile.alias} className="child-chip">
              <span className="avatar">{profile.alias.slice(0, 1)}</span>
              <div>
                <strong>{profile.alias}</strong>
                <small>
                  {profile.age} · {profile.state}
                </small>
              </div>
            </div>
          ))}
        </div>
        <p className="fineprint">{locale === "en" ? c.childApproval : c.childApproval}</p>
      </section>
    </div>
  );
}

function ConsultView({
  copy: c,
  locale,
  query,
  selectedFilter,
  selectedPlace,
  places: visiblePlaces,
  onQuery,
  onFilter,
  onSelectPlace,
  onNavigate
}: {
  copy: (typeof copy)[Locale];
  locale: Locale;
  query: string;
  selectedFilter: number;
  selectedPlace: Place;
  places: Place[];
  onQuery: (query: string) => void;
  onFilter: (index: number) => void;
  onSelectPlace: (id: string) => void;
  onNavigate: (view: ViewId) => void;
}) {
  return (
    <div className="consult-grid">
      <section className="section-intro">
        <h2>{c.consultTitle}</h2>
        <p>{c.consultIntro}</p>
      </section>

      <section className="panel search-panel">
        <label className="search-box">
          <Search aria-hidden="true" size={18} />
          <input value={query} placeholder={c.searchPlaceholder} onChange={(event) => onQuery(event.target.value)} />
        </label>
        <div className="filter-row" aria-label="Filtres">
          {c.filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              data-active={selectedFilter === index}
              onClick={() => onFilter(index)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <MapPanel
        title={c.sensoryMap}
        subtitle={c.mapArea}
        places={visiblePlaces}
        selectedPlace={selectedPlace}
        onSelectPlace={onSelectPlace}
        tall
      />

      <PlaceDetailCard
        copy={c}
        locale={locale}
        place={selectedPlace}
        onContribute={() => onNavigate("contribute")}
      />

      <section className="panel results-panel">
        <PanelHeading title={c.savedPlaces} />
        <div className="saved-list">
          {visiblePlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              className="saved-row"
              data-active={selectedPlace.id === place.id}
              onClick={() => onSelectPlace(place.id)}
            >
              <PlaceSymbol />
              <span>
                <strong>{place.name}</strong>
                <small>
                  {place.city} · {place.distance}
                </small>
              </span>
              <em>{place.score.toFixed(1)}</em>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContributeView({
  copy: c,
  locale,
  ratings,
  notes,
  anonymous,
  uploadedFiles,
  selectedPlace,
  onRating,
  onNotes,
  onAnonymous,
  onFiles
}: {
  copy: (typeof copy)[Locale];
  locale: Locale;
  ratings: Record<SensoryKey, number>;
  notes: string;
  anonymous: boolean;
  uploadedFiles: string[];
  selectedPlace: Place;
  onRating: (key: SensoryKey, value: number) => void;
  onNotes: (notes: string) => void;
  onAnonymous: (anonymous: boolean) => void;
  onFiles: (files: string[]) => void;
}) {
  return (
    <div className="report-grid">
      <section className="section-intro report-intro">
        <h2>{c.contributionTitle}</h2>
        <p>{c.contributionIntro}</p>
      </section>

      <section className="panel report-form">
        <div className="place-context">
          <PlaceSymbol />
          <div>
            <strong>{selectedPlace.name}</strong>
            <span>
              {selectedPlace.area} · {selectedPlace.quietDb}
            </span>
          </div>
          <em>{c.pendingModeration}</em>
        </div>

        <div className="slider-stack">
          {sensoryKeys.map((item) => (
            <SensorySlider
              key={item.key}
              label={sensoryLabels[locale][item.key]}
              low={item.low}
              high={item.high}
              word={sensoryWords[locale][item.key][ratings[item.key] - 1]}
              value={ratings[item.key]}
              onChange={(value) => onRating(item.key, value)}
            />
          ))}
        </div>

        <label className="notes-field">
          <span>{c.notes}</span>
          <textarea value={notes} placeholder={c.notesPlaceholder} onChange={(event) => onNotes(event.target.value)} />
        </label>

        <div className="form-footer">
          <label className="checkbox-row">
            <input type="checkbox" checked={anonymous} onChange={(event) => onAnonymous(event.target.checked)} />
            <span>{c.anonymous}</span>
          </label>
          <button type="button" className="primary-action">
            <Send aria-hidden="true" size={17} />
            {c.submit}
          </button>
        </div>
      </section>

      <aside className="side-stack">
        <label className="panel upload-panel">
          <ImagePlus aria-hidden="true" size={34} />
          <strong>{c.uploadImage}</strong>
          <span>JPG · PNG · WebP</span>
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => onFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
          />
        </label>

        <section className="panel approval-panel">
          <Lock aria-hidden="true" size={24} />
          <h3>{c.tutorReview}</h3>
          <p>{c.childApproval}</p>
        </section>

        {uploadedFiles.length > 0 ? (
          <section className="panel file-panel">
            <PanelHeading title={c.uploadImage} />
            <ul>
              {uploadedFiles.map((file) => (
                <li key={file}>
                  <FileText aria-hidden="true" size={15} />
                  {file}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

function SupportView({
  copy: c,
  focusMode,
  onFocus
}: {
  copy: (typeof copy)[Locale];
  focusMode: boolean;
  onFocus: () => void;
}) {
  return (
    <div className="support-grid">
      <section className="section-intro">
        <h2>{c.supportTitle}</h2>
        <p>{c.supportIntro}</p>
      </section>

      <section className="panel communication-panel">
        <LifeBuoy aria-hidden="true" size={30} />
        <h3>{c.supportCard}</h3>
        <blockquote>{c.supportMessage}</blockquote>
        <button type="button" className="primary-action">
          <MessageSquare aria-hidden="true" size={17} />
          {c.openSupport}
        </button>
      </section>

      <section className="panel focus-panel">
        <Sparkles aria-hidden="true" size={30} />
        <h3>{c.focusModeTitle}</h3>
        <p>{c.focusModeBody}</p>
        <button type="button" className="secondary-action" disabled={focusMode} onClick={onFocus}>
          {focusMode ? c.focusOn : c.focus}
        </button>
      </section>

      <section className="panel trusted-panel">
        <HeartHandshake aria-hidden="true" size={30} />
        <h3>{c.trustedContact}</h3>
        <p>Tutor principal · Josep B.</p>
        <button type="button" className="secondary-action">
          {c.contact}
        </button>
      </section>
    </div>
  );
}

function ProfilesView({ copy: c, locale }: { copy: (typeof copy)[Locale]; locale: Locale }) {
  return (
    <div className="profiles-grid">
      <section className="section-intro">
        <h2>{c.profilesTitle}</h2>
        <p>{c.profilesIntro}</p>
      </section>

      <ProfileCard icon={UserRound} title={c.adultProfile} meta="Josep B. · pseudònim públic editable">
        <p>{locale === "en" ? "Same account for web and mobile actions." : "Mateix compte per a accions web i mòbil."}</p>
      </ProfileCard>

      <ProfileCard icon={UsersRound} title={c.tutorProfile} meta="Compte principal">
        <p>{c.childApproval}</p>
      </ProfileCard>

      <section className="panel child-flow-panel">
        <PanelHeading title={c.childProfile} />
        <div className="child-list child-list-large">
          {childProfiles.map((profile) => (
            <article key={profile.alias} className="child-chip">
              <span className="avatar">{profile.alias.slice(0, 1)}</span>
              <div>
                <strong>{profile.alias}</strong>
                <small>
                  {profile.age} anys · {profile.state}
                </small>
              </div>
            </article>
          ))}
          <button type="button" className="add-child">
            <Plus aria-hidden="true" size={20} />
            Afegir
          </button>
        </div>
      </section>

      <section className="panel sensory-profile-panel">
        <PanelHeading title={c.sensoryProfile} />
        <div className="preference-bars">
          <PreferenceBar label={sensoryLabels[locale].noise} value={35} />
          <PreferenceBar label={sensoryLabels[locale].density} value={28} />
          <PreferenceBar label={sensoryLabels[locale].light} value={42} />
          <PreferenceBar label={sensoryLabels[locale].wait} value={25} />
        </div>
      </section>
    </div>
  );
}

function VerifiedView({ copy: c }: { copy: (typeof copy)[Locale] }) {
  return (
    <div className="verified-grid">
      <section className="section-intro">
        <h2>{c.verifiedTitle}</h2>
        <p>{c.verifiedIntro}</p>
      </section>

      <section className="verified-list">
        {professionals.map((professional) => (
          <article key={professional.id} className="panel verified-profile-card">
            <span className="portrait">{professional.initials}</span>
            <div>
              <h3>{professional.name}</h3>
              <p>{professional.role}</p>
              <strong>
                {c.license}: {professional.license}
              </strong>
              <span>{professional.college}</span>
              <em>{professional.specialty}</em>
            </div>
            <VerifiedBadge label={c.verified} />
            <button type="button" className="secondary-action">
              {c.contact}
            </button>
          </article>
        ))}

        {organizations.map((organization) => (
          <article key={organization.id} className="panel verified-profile-card">
            <span className="portrait entity">{organization.initials}</span>
            <div>
              <h3>{organization.name}</h3>
              <p>{organization.city}</p>
              <strong>
                {c.registry}: {organization.registry}
              </strong>
              <span>{organization.description}</span>
            </div>
            <VerifiedBadge label={c.verified} />
            <button type="button" className="secondary-action">
              {c.contact}
            </button>
          </article>
        ))}
      </section>

      <aside className="panel evidence-panel">
        <Lock aria-hidden="true" size={24} />
        <h3>{c.privateEvidence}</h3>
        <p>{c.verifiedIntro}</p>
      </aside>
    </div>
  );
}

function PanelHeading({
  title,
  action,
  onAction
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="panel-heading">
      <h3>{title}</h3>
      {action ? (
        <button type="button" onClick={onAction}>
          {action}
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      ) : null}
    </div>
  );
}

function MapPanel({
  title,
  subtitle,
  places: visiblePlaces,
  selectedPlace,
  tall = false,
  onSelectPlace,
  onOpen
}: {
  title: string;
  subtitle: string;
  places: Place[];
  selectedPlace: Place;
  tall?: boolean;
  onSelectPlace: (id: string) => void;
  onOpen?: () => void;
}) {
  const googleMapsKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ||
    "";

  return (
    <section className="panel map-panel" data-tall={tall}>
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <span>{subtitle}</span>
        </div>
        <div className="map-tools">
          <button type="button" aria-label="Filtres">
            <SlidersHorizontal aria-hidden="true" size={18} />
          </button>
          <button type="button" aria-label="Centrar mapa">
            <LocateFixed aria-hidden="true" size={18} />
          </button>
          <button type="button" aria-label="Capes">
            <Layers aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
      <div className="map-canvas" role="img" aria-label={title}>
        {googleMapsKey ? (
          <GoogleMapCanvas
            apiKey={googleMapsKey}
            places={visiblePlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={onSelectPlace}
          />
        ) : (
          <FallbackMapCanvas
            places={visiblePlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={onSelectPlace}
            label="Google Maps key missing"
          />
        )}
        <div className="current-status">
          <span />
          <div>
            <small>Current status</small>
            <strong>{selectedPlace.area}</strong>
          </div>
          <em>{selectedPlace.quietDb}</em>
        </div>
      </div>
      {onOpen ? (
        <button type="button" className="text-action" onClick={onOpen}>
          Obrir mapa complet
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      ) : null}
    </section>
  );
}

function GoogleMapCanvas({
  apiKey,
  places: visiblePlaces,
  selectedPlace,
  onSelectPlace
}: {
  apiKey: string;
  places: Place[];
  selectedPlace: Place;
  onSelectPlace: (id: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const markers: GoogleMarkerInstance[] = [];

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (cancelled || !mapElementRef.current) {
          return;
        }

        const map = new google.maps.Map(mapElementRef.current, {
          center: selectedPlace.position,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          styles: googleMapStyles
        });
        const bounds = new google.maps.LatLngBounds();

        visiblePlaces.forEach((place) => {
          bounds.extend(place.position);
          const active = selectedPlace.id === place.id;
          const marker = new google.maps.Marker({
            map,
            position: place.position,
            title: place.name,
            icon: {
              path: "M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0",
              fillColor: active ? "#cca730" : "#545f72",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
              scale: active ? 1.35 : 1
            }
          });
          marker.addListener("click", () => onSelectPlace(place.id));
          markers.push(marker);
        });

        if (visiblePlaces.length > 1) {
          map.fitBounds(bounds);
        } else {
          map.panTo(selectedPlace.position);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [apiKey, visiblePlaces, selectedPlace, onSelectPlace]);

  if (loadFailed) {
    return (
      <FallbackMapCanvas
        places={visiblePlaces}
        selectedPlace={selectedPlace}
        onSelectPlace={onSelectPlace}
        label="Google Maps load error"
      />
    );
  }

  return (
    <>
      <div ref={mapElementRef} className="google-map-layer" />
      <span className="map-provider-note">Google Maps</span>
    </>
  );
}

function FallbackMapCanvas({
  places: visiblePlaces,
  selectedPlace,
  onSelectPlace,
  label
}: {
  places: Place[];
  selectedPlace: Place;
  onSelectPlace: (id: string) => void;
  label: string;
}) {
  const pinLayout = [
    { left: "38%", top: "42%" },
    { left: "58%", top: "31%" },
    { left: "67%", top: "62%" },
    { left: "29%", top: "65%" },
    { left: "72%", top: "36%" }
  ];

  return (
    <>
      <span className="map-region map-region-a" />
      <span className="map-region map-region-b" />
      <span className="map-region map-region-c" />
      <span className="map-road map-road-a" />
      <span className="map-road map-road-b" />
      <span className="map-road map-road-c" />
      <span className="map-water" />
      {visiblePlaces.map((place, index) => (
        <button
          key={place.id}
          type="button"
          className="map-pin"
          data-active={selectedPlace.id === place.id}
          style={pinLayout[index % pinLayout.length]}
          aria-label={place.name}
          aria-pressed={selectedPlace.id === place.id}
          onClick={() => onSelectPlace(place.id)}
        />
      ))}
      <span className="map-provider-note">{label}</span>
    </>
  );
}

function PlaceDetailCard({
  copy: c,
  locale,
  place,
  onContribute
}: {
  copy: (typeof copy)[Locale];
  locale: Locale;
  place: Place;
  onContribute: () => void;
}) {
  return (
    <aside className="panel place-detail">
      <PlaceSymbol large />
      <h3>{place.name}</h3>
      <p>
        {place.area} · {place.city}
      </p>
      <div className="score-line">
        <strong>{place.score.toFixed(1)}</strong>
        <RatingStars value={5} />
      </div>
      <p>{place.description}</p>
      <div className="metric-list">
        {sensoryKeys.map((item, index) => (
          <div key={item.key}>
            <span>{sensoryLabels[locale][item.key]}</span>
            <strong>{sensoryWords[locale][item.key][index]}</strong>
          </div>
        ))}
      </div>
      <div className="detail-actions">
        <button type="button" className="secondary-action">
          <Bookmark aria-hidden="true" size={17} />
          {c.favorite}
        </button>
        <button type="button" className="secondary-action">
          <Flag aria-hidden="true" size={17} />
          {c.reportPlace}
        </button>
      </div>
      <button type="button" className="primary-action" onClick={onContribute}>
        <Plus aria-hidden="true" size={17} />
        {c.nav.contribute}
      </button>
    </aside>
  );
}

function SensorySlider({
  label,
  low,
  high,
  word,
  value,
  onChange
}: {
  label: string;
  low: string;
  high: string;
  word: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="report-slider">
      <span>
        <strong>{label}</strong>
        <em>{word}</em>
      </span>
      <input type="range" min="1" max="5" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <small>
        <span>{low}</span>
        <span>{high}</span>
      </small>
    </label>
  );
}

function ProfileCard({
  icon: Icon,
  title,
  meta,
  children
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <article className="panel profile-card">
      <Icon aria-hidden="true" size={28} />
      <h3>{title}</h3>
      <strong>{meta}</strong>
      {children}
    </article>
  );
}

function PreferenceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="preference-row">
      <span>{label}</span>
      <div>
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function VerifiedMiniCard({ title, meta, initials }: { title: string; meta: string; initials: string }) {
  return (
    <article className="verified-mini">
      <span className="avatar">{initials}</span>
      <strong>{title}</strong>
      <small>{meta}</small>
      <VerifiedBadge label="Verificat" />
    </article>
  );
}

function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="verified-badge">
      <ShieldCheck aria-hidden="true" size={14} />
      {label}
    </span>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <span className="rating-stars" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} aria-hidden="true" size={16} fill="currentColor" />
      ))}
    </span>
  );
}

function PlaceSymbol({ large = false }: { large?: boolean }) {
  return (
    <span className="place-symbol" data-large={large}>
      <MapPin aria-hidden="true" size={large ? 28 : 20} />
    </span>
  );
}
