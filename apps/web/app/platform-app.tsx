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
  KeyRound,
  Languages,
  Layers,
  LifeBuoy,
  LocateFixed,
  LogOut,
  Lock,
  Mail,
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
  UserPlus,
  UserRound,
  UsersRound,
  Volume2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User } from "firebase/auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppUser, Place as FirebasePlace, SensoryRating } from "@accessibilitat/shared";
import {
  createChildProfile,
  createPlace,
  listActivePlaces,
  loginWithApple,
  loginWithEmailPassword,
  loginWithGoogle,
  logout,
  readCurrentAppUser,
  registerWithEmailPassword,
  requestProfessionalVerification,
  submitReview,
  subscribeToAuthState,
  uploadPlaceImage
} from "./lib/firebase-actions";
import { loadGoogleMaps, type GoogleMarkerInstance } from "./lib/google-maps";

type Locale = "ca" | "es" | "en";
type ViewId = "home" | "consult" | "contribute" | "support" | "profiles" | "verified";
type SensoryKey = "noise" | "density" | "light" | "wait";
type MapLayerId = "roadmap" | "satellite" | "terrain";
type LocationState = "idle" | "locating" | "located" | "denied" | "unsupported" | "error";
type AuthMode = "login" | "register";
type UserLocation = { lat: number; lng: number; accuracy?: number };

type ContributionDraft = {
  createNewPlace: boolean;
  placeName: string;
  city: string;
  addressOrArea: string;
  description: string;
};

const authRequiredViews = new Set<ViewId>(["contribute"]);

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
  filterIds: number[];
};

type Professional = {
  id: string;
  name: string;
  role: string;
  license: string;
  college: string;
  specialty: string;
  city: string;
  distance: string;
  position: {
    lat: number;
    lng: number;
  };
  initials: string;
};

type Organization = {
  id: string;
  name: string;
  city: string;
  registry: string;
  description: string;
  distance: string;
  position: {
    lat: number;
    lng: number;
  };
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
    mapCurrentStatus: string;
    mapLocating: string;
    mapLocated: string;
    mapLocationDenied: string;
    mapLocationUnsupported: string;
    mapLocationError: string;
    mapLayerRoadmap: string;
    mapLayerSatellite: string;
    mapLayerTerrain: string;
    mapFilterAll: string;
    mapFilterControl: string;
    mapLocationControl: string;
    mapLayerControl: string;
    mapYourLocation: string;
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
    mapCurrentStatus: "Estat actual",
    mapLocating: "Buscant ubicació",
    mapLocated: "Ubicació detectada",
    mapLocationDenied: "Permís d'ubicació bloquejat",
    mapLocationUnsupported: "Ubicació no disponible",
    mapLocationError: "No s'ha pogut obtenir la ubicació",
    mapLayerRoadmap: "Mapa",
    mapLayerSatellite: "Satèl·lit",
    mapLayerTerrain: "Terreny",
    mapFilterAll: "Tots els filtres",
    mapFilterControl: "Filtre del mapa",
    mapLocationControl: "Trobar la meva ubicació",
    mapLayerControl: "Canviar capa del mapa",
    mapYourLocation: "La teva ubicació",
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
    mapCurrentStatus: "Estado actual",
    mapLocating: "Buscando ubicación",
    mapLocated: "Ubicación detectada",
    mapLocationDenied: "Permiso de ubicación bloqueado",
    mapLocationUnsupported: "Ubicación no disponible",
    mapLocationError: "No se ha podido obtener la ubicación",
    mapLayerRoadmap: "Mapa",
    mapLayerSatellite: "Satélite",
    mapLayerTerrain: "Terreno",
    mapFilterAll: "Todos los filtros",
    mapFilterControl: "Filtro del mapa",
    mapLocationControl: "Encontrar mi ubicación",
    mapLayerControl: "Cambiar capa del mapa",
    mapYourLocation: "Tu ubicación",
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
    mapCurrentStatus: "Current status",
    mapLocating: "Finding location",
    mapLocated: "Location detected",
    mapLocationDenied: "Location permission blocked",
    mapLocationUnsupported: "Location unavailable",
    mapLocationError: "Could not get location",
    mapLayerRoadmap: "Map",
    mapLayerSatellite: "Satellite",
    mapLayerTerrain: "Terrain",
    mapFilterAll: "All filters",
    mapFilterControl: "Map filter",
    mapLocationControl: "Find my location",
    mapLayerControl: "Change map layer",
    mapYourLocation: "Your location",
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

const authCopy: Record<
  Locale,
  {
    signedOutTitle: string;
    signedOutIntro: string;
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    publicName: string;
    cityOptional: string;
    continueWithGoogle: string;
    continueWithApple: string;
    emailLogin: string;
    emailRegister: string;
    logout: string;
    loadingSession: string;
    guestName: string;
    guestRole: string;
    publicMode: string;
    signInRequiredTitle: string;
    signInRequiredIntro: string;
    signInToContinue: string;
    passwordsMismatch: string;
    authFailed: string;
    emailVerificationSent: string;
    contributionSent: string;
    createNewPlace: string;
    useSelectedPlace: string;
    placeName: string;
    placeCity: string;
    placeAddress: string;
    placeDescription: string;
    childAlias: string;
    childAge: string;
    createChildProfile: string;
    childProfileCreated: string;
    professionalRequestTitle: string;
    professionalName: string;
    licenseNumber: string;
    professionalCollege: string;
    specialty: string;
    requestVerification: string;
    verificationRequested: string;
  }
> = {
  ca: {
    signedOutTitle: "Entra a Spectrum Access",
    signedOutIntro:
      "Consulta el mapa sense compte. Registra't només quan vulguis aportar imatges, crear perfils tutelats o sol·licitar verificació professional.",
    login: "Iniciar sessió",
    register: "Crear compte",
    email: "Email",
    password: "Contrasenya",
    confirmPassword: "Repeteix la contrasenya",
    publicName: "Nom públic",
    cityOptional: "Ciutat opcional",
    continueWithGoogle: "Continuar amb Google",
    continueWithApple: "Continuar amb Apple",
    emailLogin: "Entrar amb email",
    emailRegister: "Registrar amb email",
    logout: "Tancar sessió",
    loadingSession: "Comprovant sessió segura...",
    guestName: "Visitant",
    guestRole: "Consulta pública",
    publicMode: "Mode consulta",
    signInRequiredTitle: "Inicia sessió per continuar",
    signInRequiredIntro:
      "Pots consultar el mapa i la informació bàsica sense compte. Per aportar contingut, veure perfils verificats o gestionar dades personals cal registrar-se.",
    signInToContinue: "Iniciar sessió",
    passwordsMismatch: "Les contrasenyes no coincideixen.",
    authFailed: "No s'ha pogut completar l'autenticació. Revisa Firebase Auth i torna-ho a provar.",
    emailVerificationSent: "Compte creat. T'hem enviat un correu de verificació.",
    contributionSent: "Aportació enviada a moderació.",
    createNewPlace: "Crear lloc nou",
    useSelectedPlace: "Usar el lloc seleccionat",
    placeName: "Nom del lloc",
    placeCity: "Ciutat",
    placeAddress: "Adreça o zona",
    placeDescription: "Descripció opcional",
    childAlias: "Àlies del perfil infantil",
    childAge: "Franja d'edat",
    createChildProfile: "Crear perfil tutelat",
    childProfileCreated: "Perfil tutelat creat.",
    professionalRequestTitle: "Sol·licitar perfil professional",
    professionalName: "Nom professional",
    licenseNumber: "Número de col·legiat/da",
    professionalCollege: "Col·legi professional",
    specialty: "Especialitat",
    requestVerification: "Enviar verificació",
    verificationRequested: "Sol·licitud enviada. Queda pendent de revisió manual."
  },
  es: {
    signedOutTitle: "Entra en Spectrum Access",
    signedOutIntro:
      "Consulta el mapa sin cuenta. Regístrate solo cuando quieras aportar imágenes, crear perfiles tutelados o solicitar verificación profesional.",
    login: "Iniciar sesión",
    register: "Crear cuenta",
    email: "Email",
    password: "Contraseña",
    confirmPassword: "Repite la contraseña",
    publicName: "Nombre público",
    cityOptional: "Ciudad opcional",
    continueWithGoogle: "Continuar con Google",
    continueWithApple: "Continuar con Apple",
    emailLogin: "Entrar con email",
    emailRegister: "Registrar con email",
    logout: "Cerrar sesión",
    loadingSession: "Comprobando sesión segura...",
    guestName: "Visitante",
    guestRole: "Consulta pública",
    publicMode: "Modo consulta",
    signInRequiredTitle: "Inicia sesión para continuar",
    signInRequiredIntro:
      "Puedes consultar el mapa y la información básica sin cuenta. Para aportar contenido, ver perfiles verificados o gestionar datos personales hay que registrarse.",
    signInToContinue: "Iniciar sesión",
    passwordsMismatch: "Las contraseñas no coinciden.",
    authFailed: "No se ha podido completar la autenticación. Revisa Firebase Auth e inténtalo de nuevo.",
    emailVerificationSent: "Cuenta creada. Te hemos enviado un correo de verificación.",
    contributionSent: "Aportación enviada a moderación.",
    createNewPlace: "Crear lugar nuevo",
    useSelectedPlace: "Usar el lugar seleccionado",
    placeName: "Nombre del lugar",
    placeCity: "Ciudad",
    placeAddress: "Dirección o zona",
    placeDescription: "Descripción opcional",
    childAlias: "Alias del perfil infantil",
    childAge: "Franja de edad",
    createChildProfile: "Crear perfil tutelado",
    childProfileCreated: "Perfil tutelado creado.",
    professionalRequestTitle: "Solicitar perfil profesional",
    professionalName: "Nombre profesional",
    licenseNumber: "Número de colegiado/a",
    professionalCollege: "Colegio profesional",
    specialty: "Especialidad",
    requestVerification: "Enviar verificación",
    verificationRequested: "Solicitud enviada. Queda pendiente de revisión manual."
  },
  en: {
    signedOutTitle: "Enter Spectrum Access",
    signedOutIntro:
      "Browse the map without an account. Register only when you want to upload images, create tutored profiles or request professional verification.",
    login: "Sign in",
    register: "Create account",
    email: "Email",
    password: "Password",
    confirmPassword: "Repeat password",
    publicName: "Public name",
    cityOptional: "Optional city",
    continueWithGoogle: "Continue with Google",
    continueWithApple: "Continue with Apple",
    emailLogin: "Sign in with email",
    emailRegister: "Register with email",
    logout: "Sign out",
    loadingSession: "Checking secure session...",
    guestName: "Guest",
    guestRole: "Public browsing",
    publicMode: "Browse mode",
    signInRequiredTitle: "Sign in to continue",
    signInRequiredIntro:
      "You can browse the map and basic place information without an account. To contribute content, view verified profiles or manage personal data, registration is required.",
    signInToContinue: "Sign in",
    passwordsMismatch: "Passwords do not match.",
    authFailed: "Authentication could not be completed. Check Firebase Auth and try again.",
    emailVerificationSent: "Account created. We sent you a verification email.",
    contributionSent: "Contribution sent to moderation.",
    createNewPlace: "Create new place",
    useSelectedPlace: "Use selected place",
    placeName: "Place name",
    placeCity: "City",
    placeAddress: "Address or area",
    placeDescription: "Optional description",
    childAlias: "Child profile alias",
    childAge: "Age range",
    createChildProfile: "Create tutored profile",
    childProfileCreated: "Tutored profile created.",
    professionalRequestTitle: "Request professional profile",
    professionalName: "Professional name",
    licenseNumber: "License number",
    professionalCollege: "Professional college",
    specialty: "Specialty",
    requestVerification: "Send verification",
    verificationRequested: "Request sent. It remains pending manual review."
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
    filterIds: [0, 1, 3],
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
    filterIds: [1, 2, 3],
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
    filterIds: [0, 2],
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
    },
    filterIds: [0, 1, 2, 3]
  };
}

function distanceBetweenKm(origin: UserLocation, destination: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(destination.lat - origin.lat);
  const lngDelta = toRadians(destination.lng - origin.lng);
  const originLat = toRadians(origin.lat);
  const destinationLat = toRadians(destination.lat);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.max(50, Math.round((distanceKm * 1000) / 50) * 50)} m`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }

  return `${Math.round(distanceKm)} km`;
}

function rankPlacesByDistance(source: Place[], userLocation: UserLocation | null) {
  if (!userLocation) {
    return source;
  }

  return source
    .map((place) => ({
      place,
      distanceKm: distanceBetweenKm(userLocation, place.position)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(({ place, distanceKm }) => ({
      ...place,
      distance: formatDistance(distanceKm)
    }));
}

function rankLocatedItemsByDistance<T extends { distance: string; position: { lat: number; lng: number } }>(
  source: T[],
  userLocation: UserLocation | null
) {
  if (!userLocation) {
    return source;
  }

  return source
    .map((item) => ({
      item,
      distanceKm: distanceBetweenKm(userLocation, item.position)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(({ item, distanceKm }) => ({
      ...item,
      distance: formatDistance(distanceKm)
    }));
}

const professionals: Professional[] = [
  {
    id: "marta-gomez",
    name: "Marta Gómez",
    role: "Psicòloga",
    license: "COPC 47145",
    college: "Col·legi Oficial de Psicologia de Catalunya",
    specialty: "Autisme adult i suport familiar",
    city: "Barcelona",
    distance: "0.7 km",
    position: { lat: 41.3891, lng: 2.1706 },
    initials: "MG"
  },
  {
    id: "pau-ferrer",
    name: "Pau Ferrer",
    role: "Psicòleg",
    license: "COPC 50218",
    college: "Col·legi Oficial de Psicologia de Catalunya",
    specialty: "Infància, tutors i regulació sensorial",
    city: "Barcelona",
    distance: "1.4 km",
    position: { lat: 41.3928, lng: 2.1649 },
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
    distance: "1.1 km",
    position: { lat: 41.3878, lng: 2.1602 },
    initials: "CT"
  },
  {
    id: "tea-valles",
    name: "Associació TEA Vallès",
    city: "Sabadell",
    registry: "Reg. E-98765",
    description: "Associació local amb activitats de suport i orientació.",
    distance: "19 km",
    position: { lat: 41.5489, lng: 2.1079 },
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

function toSensoryRating(ratings: Record<SensoryKey, number>): SensoryRating {
  const noise = Math.round(ratings.noise);
  const density = Math.round(ratings.density);
  const light = Math.round(ratings.light);
  const wait = Math.round(ratings.wait);
  const generalRecommendation = Math.round((noise + density + light + wait) / 4);

  return {
    noise,
    crowd: density,
    lighting: light,
    temperature: 3,
    waitingTime: wait,
    staffTreatment: 3,
    quietSpace: Math.max(1, Math.min(5, 6 - noise)),
    exitEase: 3,
    perceivedSafety: 3,
    generalRecommendation
  };
}

export function PlatformApp() {
  const [locale, setLocale] = useState<Locale>("ca");
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>(places);
  const [query, setQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0].id);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSubmittingContribution, setIsSubmittingContribution] = useState(false);
  const [contributionMessage, setContributionMessage] = useState<string | null>(null);
  const [contributionDraft, setContributionDraft] = useState<ContributionDraft>({
    createNewPlace: false,
    placeName: "",
    city: "",
    addressOrArea: "",
    description: ""
  });
  const [ratings, setRatings] = useState<Record<SensoryKey, number>>({
    noise: 2,
    density: 2,
    light: 2,
    wait: 1
  });
  const autoLocationRequestedRef = useRef(false);

  const requestUserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationState("unsupported");
      return;
    }

    setLocationState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationState("located");
      },
      (error) => {
        setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 12000
      }
    );
  }, []);

  useEffect(() => {
    let active = true;

    try {
      const unsubscribe = subscribeToAuthState((user) => {
        if (!active) {
          return;
        }

        setAuthUser(user);
        setAuthMessage(null);
        if (!user) {
          setAppUser(null);
          setAuthChecked(true);
          return;
        }

        readCurrentAppUser()
          .then((profile) => {
            if (active) {
              setAppUser(profile);
            }
          })
          .catch(() => {
            if (active) {
              setAppUser(null);
            }
          })
          .finally(() => {
            if (active) {
              setAuthChecked(true);
            }
          });
      });

      return () => {
        active = false;
        unsubscribe();
      };
    } catch {
      setAuthMessage(authCopy[locale].authFailed);
      setAuthChecked(true);
      return () => {
        active = false;
      };
    }
  }, [locale]);

  useEffect(() => {
    if (autoLocationRequestedRef.current) {
      return;
    }

    autoLocationRequestedRef.current = true;
    requestUserLocation();
  }, [requestUserLocation]);

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
  const rankedPlaces = useMemo(() => rankPlacesByDistance(availablePlaces, userLocation), [availablePlaces, userLocation]);
  const rankedProfessionals = useMemo(
    () => rankLocatedItemsByDistance(professionals, userLocation),
    [userLocation]
  );
  const rankedOrganizations = useMemo(
    () => rankLocatedItemsByDistance(organizations, userLocation),
    [userLocation]
  );
  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rankedPlaces.filter((place) => {
      const matchesQuery =
        !normalized ||
        [place.name, place.area, place.city, place.category]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
      const matchesFilter = selectedFilter === null || place.filterIds.includes(selectedFilter);

      return matchesQuery && matchesFilter;
    });
  }, [rankedPlaces, query, selectedFilter]);

  const selectedPlace = rankedPlaces.find((place) => place.id === selectedPlaceId) ?? rankedPlaces[0] ?? places[0];
  const visibleSelectedPlace =
    filteredPlaces.find((place) => place.id === selectedPlaceId) ?? filteredPlaces[0] ?? selectedPlace;

  useEffect(() => {
    if (!userLocation || rankedPlaces.length === 0) {
      return;
    }

    setSelectedPlaceId(rankedPlaces[0].id);
  }, [rankedPlaces, userLocation]);

  useEffect(() => {
    if (filteredPlaces.length === 0 || filteredPlaces.some((place) => place.id === selectedPlaceId)) {
      return;
    }

    setSelectedPlaceId(filteredPlaces[0].id);
  }, [filteredPlaces, selectedPlaceId]);

  const updateRating = (key: SensoryKey, value: number) => {
    setRatings((current) => ({ ...current, [key]: value }));
  };

  const toggleFilter = (index: number) => {
    setSelectedFilter((current) => (current === index ? null : index));
  };

  const cycleFilter = () => {
    setSelectedFilter((current) => {
      if (current === null) {
        return 0;
      }

      const next = current + 1;
      return next >= c.filters.length ? null : next;
    });
  };

  const refreshAppProfile = async () => {
    const profile = await readCurrentAppUser();
    setAppUser(profile);
  };

  const navigateToView = (view: ViewId) => {
    setActiveView(view);
    if (authRequiredViews.has(view)) {
      setAuthPanelOpen(false);
    }
  };

  const handleEmailRegister = async (input: {
    email: string;
    password: string;
    publicName: string;
    city?: string;
  }) => {
    await registerWithEmailPassword({ ...input, locale });
    await refreshAppProfile();
    setAuthPanelOpen(false);
    setAuthMessage(authCopy[locale].emailVerificationSent);
  };

  const handleEmailLogin = async (input: { email: string; password: string }) => {
    await loginWithEmailPassword({ ...input, locale });
    await refreshAppProfile();
    setAuthPanelOpen(false);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle(locale);
    await refreshAppProfile();
    setAuthPanelOpen(false);
  };

  const handleAppleLogin = async () => {
    await loginWithApple(locale);
    await refreshAppProfile();
    setAuthPanelOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setAuthUser(null);
    setAppUser(null);
    if (authRequiredViews.has(activeView)) {
      setActiveView("home");
    }
  };

  const updateContributionDraft = (patch: Partial<ContributionDraft>) => {
    setContributionDraft((current) => ({ ...current, ...patch }));
  };

  const submitContribution = async () => {
    if (isSubmittingContribution) {
      return;
    }

    if (!authUser) {
      setActiveView("contribute");
      setContributionMessage(authCopy[locale].signInRequiredIntro);
      return;
    }

    setIsSubmittingContribution(true);
    setContributionMessage(null);

    try {
      let placeId = selectedPlace.id;
      if (contributionDraft.createNewPlace) {
        const created = await createPlace({
          name: contributionDraft.placeName.trim(),
          category: "other",
          city: contributionDraft.city.trim(),
          addressOrArea: contributionDraft.addressOrArea.trim(),
          description: contributionDraft.description.trim() || undefined,
          latitude: userLocation?.lat ?? selectedPlace.position.lat,
          longitude: userLocation?.lng ?? selectedPlace.position.lng
        });
        placeId = created.data.placeId;
      }

      await submitReview({
        placeId,
        ratings: toSensoryRating(ratings),
        comment: notes.trim() || undefined
      });

      for (const file of uploadedFiles) {
        await uploadPlaceImage(placeId, file, { [locale]: file.name });
      }

      setNotes("");
      setUploadedFiles([]);
      setContributionDraft({
        createNewPlace: false,
        placeName: "",
        city: "",
        addressOrArea: "",
        description: ""
      });
      setContributionMessage(authCopy[locale].contributionSent);
    } catch {
      setContributionMessage(authCopy[locale].authFailed);
    } finally {
      setIsSubmittingContribution(false);
    }
  };

  const isAuthenticated = Boolean(authUser);
  const sessionStatusLabel = !authChecked
    ? authCopy[locale].loadingSession
    : authUser
      ? c.status
      : authCopy[locale].publicMode;
  const gatedViewNeedsAuth = !isAuthenticated && authRequiredViews.has(activeView);

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
                  onClick={() => navigateToView(item.id)}
                >
                  <Icon aria-hidden="true" size={21} />
                  <span>{c.nav[item.id]}</span>
                  {selected ? <ChevronRight aria-hidden="true" size={15} /> : null}
                </button>
              );
            })}
          </nav>

          <div className="side-footer">
            <div className="member-card">
              <span className="avatar avatar-small">{(appUser?.publicName ?? authUser?.displayName ?? authCopy[locale].guestName).slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{appUser?.publicName ?? authUser?.displayName ?? authUser?.email ?? authCopy[locale].guestName}</strong>
                <span>{authUser ? (appUser?.roles.includes("tutor") ? "Tutor" : "Usuari") : authCopy[locale].guestRole}</span>
              </div>
            </div>
            <div className="security-card">
              <ShieldCheck aria-hidden="true" size={22} />
              <div>
                <span>{c.status}</span>
                <strong>{authUser ? (authUser.emailVerified ? c.verified : "Email pendent") : sessionStatusLabel}</strong>
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
              <span className="health-pill">
                <Check aria-hidden="true" size={15} />
                {sessionStatusLabel}
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
              <button type="button" className="icon-button" aria-label="Notificacions">
                <Bell aria-hidden="true" size={22} />
              </button>
              {authUser ? (
                <button type="button" className="icon-button" aria-label={authCopy[locale].logout} onClick={handleLogout}>
                  <LogOut aria-hidden="true" size={20} />
                </button>
              ) : (
                <button type="button" className="secondary-action top-login-action" onClick={() => setAuthPanelOpen(true)}>
                  <KeyRound aria-hidden="true" size={17} />
                  {authCopy[locale].signInToContinue}
                </button>
              )}
            </div>
          </header>

          {gatedViewNeedsAuth ? (
            <AuthRequiredView
              copy={authCopy[locale]}
              locale={locale}
              darkMode={darkMode}
              message={authMessage}
              onLocale={setLocale}
              onDarkMode={setDarkMode}
              onEmailLogin={handleEmailLogin}
              onEmailRegister={handleEmailRegister}
              onGoogle={handleGoogleLogin}
              onApple={handleAppleLogin}
            />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "home" ? (
            <HomeView
              copy={c}
              authLabels={authCopy[locale]}
              locale={locale}
              places={filteredPlaces}
              selectedFilter={selectedFilter}
              selectedPlace={visibleSelectedPlace}
              locationState={locationState}
              userLocation={userLocation}
              professionals={rankedProfessionals}
              organizations={rankedOrganizations}
              isAuthenticated={isAuthenticated}
              onNavigate={navigateToView}
              onSelectPlace={setSelectedPlaceId}
              onCycleFilter={cycleFilter}
              onLocate={requestUserLocation}
            />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "consult" ? (
            <ConsultView
              copy={c}
              authLabels={authCopy[locale]}
              locale={locale}
              query={query}
              selectedFilter={selectedFilter}
              selectedPlace={visibleSelectedPlace}
              places={filteredPlaces}
              locationState={locationState}
              userLocation={userLocation}
              isAuthenticated={isAuthenticated}
              onQuery={setQuery}
              onFilter={toggleFilter}
              onSelectPlace={setSelectedPlaceId}
              onNavigate={navigateToView}
              onCycleFilter={cycleFilter}
              onLocate={requestUserLocation}
              onRequireAuth={() => setAuthPanelOpen(true)}
            />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "contribute" ? (
            <ContributeView
              copy={c}
              locale={locale}
              ratings={ratings}
              notes={notes}
              anonymous={anonymous}
              uploadedFiles={uploadedFiles}
              draft={contributionDraft}
              statusMessage={contributionMessage}
              isSubmitting={isSubmittingContribution}
              selectedPlace={selectedPlace}
              onRating={updateRating}
              onNotes={setNotes}
              onAnonymous={setAnonymous}
              onFiles={setUploadedFiles}
              onDraft={updateContributionDraft}
              onSubmit={submitContribution}
            />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "support" ? (
            <SupportView copy={c} focusMode={focusMode} onFocus={() => setFocusMode(true)} />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "profiles" ? (
            <ProfilesView
              copy={c}
              authCopy={authCopy[locale]}
              locale={locale}
              appUser={appUser}
              professionals={rankedProfessionals}
              organizations={rankedOrganizations}
              isAuthenticated={isAuthenticated}
              onRequireAuth={() => setAuthPanelOpen(true)}
              onRefreshProfile={refreshAppProfile}
            />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "verified" ? (
            <VerifiedView copy={c} professionals={rankedProfessionals} organizations={rankedOrganizations} />
          ) : null}
        </section>
      </div>

      {!authUser && authPanelOpen ? (
        <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-label={authCopy[locale].signInRequiredTitle}>
          <div className="auth-modal">
            <button type="button" className="auth-modal-close" aria-label="Tancar" onClick={() => setAuthPanelOpen(false)}>
              <Minus aria-hidden="true" size={20} />
            </button>
            <AuthGate
              copy={authCopy[locale]}
              locale={locale}
              darkMode={darkMode}
              message={authMessage}
              variant="inline"
              onLocale={setLocale}
              onDarkMode={setDarkMode}
              onEmailLogin={handleEmailLogin}
              onEmailRegister={handleEmailRegister}
              onGoogle={handleGoogleLogin}
              onApple={handleAppleLogin}
            />
          </div>
        </div>
      ) : null}
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

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

function AppleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" focusable="false">
      <path
        fill="currentColor"
        d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43Zm3.314 11.725c-.048-.096-2.325-1.234-2.113-3.422.212-2.187 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.28Z"
      />
    </svg>
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

function AuthLoading({ copy: c }: { copy: (typeof authCopy)[Locale] }) {
  return (
    <section className="auth-shell">
      <div className="auth-card panel">
        <OfficialLogo size={64} />
        <h1>Spectrum Access</h1>
        <p>{c.loadingSession}</p>
      </div>
    </section>
  );
}

function AuthGate({
  copy: c,
  locale,
  darkMode,
  message,
  variant = "full",
  onLocale,
  onDarkMode,
  onEmailLogin,
  onEmailRegister,
  onGoogle,
  onApple
}: {
  copy: (typeof authCopy)[Locale];
  locale: Locale;
  darkMode: boolean;
  message: string | null;
  variant?: "full" | "inline";
  onLocale: (locale: Locale) => void;
  onDarkMode: (enabled: boolean) => void;
  onEmailLogin: (input: { email: string; password: string }) => Promise<void>;
  onEmailRegister: (input: { email: string; password: string; publicName: string; city?: string }) => Promise<void>;
  onGoogle: () => Promise<void>;
  onApple: () => Promise<void>;
}) {
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [publicName, setPublicName] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const runAuth = async (action: () => Promise<void>) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setLocalMessage(null);
    try {
      await action();
    } catch {
      setLocalMessage(c.authFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEmail = () => {
    void runAuth(async () => {
      if (mode === "register") {
        if (password !== passwordRepeat) {
          setLocalMessage(c.passwordsMismatch);
          return;
        }

        await onEmailRegister({ email, password, publicName, city });
        return;
      }

      await onEmailLogin({ email, password });
    });
  };

  return (
    <section className={`auth-shell ${variant === "inline" ? "auth-shell-inline" : ""}`}>
      <div className="auth-card panel">
        <div className="auth-toolbar">
          <OfficialLogo size={58} />
          <div className="top-actions">
            <label className="select-control">
              <Globe2 aria-hidden="true" size={17} />
              <select aria-label="Idioma" value={locale} onChange={(event) => onLocale(event.target.value as Locale)}>
                {Object.entries(locales).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <ToggleButton
              active={darkMode}
              label={darkMode ? copy[locale].lightMode : copy[locale].darkMode}
              activeIcon={Sun}
              inactiveIcon={Moon}
              onClick={() => onDarkMode(!darkMode)}
            />
          </div>
        </div>
        <div className="auth-copy">
          <h1>{c.signedOutTitle}</h1>
          <p>{c.signedOutIntro}</p>
        </div>
        <div className="auth-mode-tabs" role="tablist" aria-label="Auth mode">
          <button type="button" data-active={mode === "register"} onClick={() => setMode("register")}>
            <UserPlus aria-hidden="true" size={17} />
            {c.register}
          </button>
          <button type="button" data-active={mode === "login"} onClick={() => setMode("login")}>
            <KeyRound aria-hidden="true" size={17} />
            {c.login}
          </button>
        </div>
        <div className="auth-provider-grid">
          <button type="button" className="secondary-action" disabled={isSubmitting} onClick={() => void runAuth(onGoogle)}>
            <GoogleLogo size={18} />
            {c.continueWithGoogle}
          </button>
          <button type="button" className="secondary-action" disabled={isSubmitting} onClick={() => void runAuth(onApple)}>
            <AppleLogo size={18} />
            {c.continueWithApple}
          </button>
        </div>
        <div className="auth-form">
          {mode === "register" ? (
            <label>
              <span>{c.publicName}</span>
              <input value={publicName} onChange={(event) => setPublicName(event.target.value)} />
            </label>
          ) : null}
          <label>
            <span>{c.email}</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>{c.password}</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {mode === "register" ? (
            <>
              <label>
                <span>{c.confirmPassword}</span>
                <input type="password" value={passwordRepeat} onChange={(event) => setPasswordRepeat(event.target.value)} />
              </label>
              <label>
                <span>{c.cityOptional}</span>
                <input value={city} onChange={(event) => setCity(event.target.value)} />
              </label>
            </>
          ) : null}
        </div>
        <button type="button" className="primary-action auth-submit" disabled={isSubmitting} onClick={submitEmail}>
          <Mail aria-hidden="true" size={17} />
          {isSubmitting ? "..." : mode === "register" ? c.emailRegister : c.emailLogin}
        </button>
        {localMessage || message ? <p className="form-status">{localMessage ?? message}</p> : null}
      </div>
    </section>
  );
}

function AuthRequiredView({
  copy: c,
  locale,
  darkMode,
  message,
  onLocale,
  onDarkMode,
  onEmailLogin,
  onEmailRegister,
  onGoogle,
  onApple
}: {
  copy: (typeof authCopy)[Locale];
  locale: Locale;
  darkMode: boolean;
  message: string | null;
  onLocale: (locale: Locale) => void;
  onDarkMode: (enabled: boolean) => void;
  onEmailLogin: (input: { email: string; password: string }) => Promise<void>;
  onEmailRegister: (input: { email: string; password: string; publicName: string; city?: string }) => Promise<void>;
  onGoogle: () => Promise<void>;
  onApple: () => Promise<void>;
}) {
  return (
    <div className="protected-view">
      <section className="panel protected-copy">
        <Lock aria-hidden="true" size={30} />
        <h2>{c.signInRequiredTitle}</h2>
        <p>{c.signInRequiredIntro}</p>
      </section>
      <AuthGate
        copy={c}
        locale={locale}
        darkMode={darkMode}
        message={message}
        variant="inline"
        onLocale={onLocale}
        onDarkMode={onDarkMode}
        onEmailLogin={onEmailLogin}
        onEmailRegister={onEmailRegister}
        onGoogle={onGoogle}
        onApple={onApple}
      />
    </div>
  );
}

function HomeView({
  copy: c,
  authLabels,
  locale,
  places: availablePlaces,
  selectedFilter,
  selectedPlace,
  locationState,
  userLocation,
  professionals: verifiedProfessionals,
  organizations: verifiedOrganizations,
  isAuthenticated,
  onNavigate,
  onSelectPlace,
  onCycleFilter,
  onLocate
}: {
  copy: (typeof copy)[Locale];
  authLabels: (typeof authCopy)[Locale];
  locale: Locale;
  places: Place[];
  selectedFilter: number | null;
  selectedPlace: Place;
  locationState: LocationState;
  userLocation: UserLocation | null;
  professionals: Professional[];
  organizations: Organization[];
  isAuthenticated: boolean;
  onNavigate: (view: ViewId) => void;
  onSelectPlace: (id: string) => void;
  onCycleFilter: () => void;
  onLocate: () => void;
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
        copyText={c}
        places={availablePlaces}
        filters={c.filters}
        selectedFilter={selectedFilter}
        selectedPlace={selectedPlace}
        locationState={locationState}
        userLocation={userLocation}
        onSelectPlace={onSelectPlace}
        onCycleFilter={onCycleFilter}
        onLocate={onLocate}
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

      {isAuthenticated ? (
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
      ) : (
        <section className="panel public-access-panel">
          <Lock aria-hidden="true" size={24} />
          <h3>{authLabels.publicMode}</h3>
          <p>{authLabels.signInRequiredIntro}</p>
          <button type="button" className="primary-action" onClick={() => onNavigate("contribute")}>
            <UserPlus aria-hidden="true" size={17} />
            {authLabels.signInToContinue}
          </button>
        </section>
      )}

      <section className="panel trust-panel">
        <PanelHeading title={`${c.trust} · ${c.professionalsAndEntities}`} action={c.viewAll} onAction={() => onNavigate("verified")} />
        <div className="trust-strip">
          {verifiedProfessionals.slice(0, 1).map((professional) => (
            <VerifiedMiniCard
              key={professional.id}
              title={professional.name}
              meta={`${professional.license} · ${professional.distance}`}
              initials={professional.initials}
            />
          ))}
          {verifiedOrganizations.map((organization) => (
            <VerifiedMiniCard
              key={organization.id}
              title={organization.name}
              meta={`${organization.registry} · ${organization.distance}`}
              initials={organization.initials}
            />
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

      {isAuthenticated ? (
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
      ) : null}
    </div>
  );
}

function ConsultView({
  copy: c,
  authLabels,
  locale,
  query,
  selectedFilter,
  selectedPlace,
  places: visiblePlaces,
  locationState,
  userLocation,
  isAuthenticated,
  onQuery,
  onFilter,
  onSelectPlace,
  onNavigate,
  onCycleFilter,
  onLocate,
  onRequireAuth
}: {
  copy: (typeof copy)[Locale];
  authLabels: (typeof authCopy)[Locale];
  locale: Locale;
  query: string;
  selectedFilter: number | null;
  selectedPlace: Place;
  places: Place[];
  locationState: LocationState;
  userLocation: UserLocation | null;
  isAuthenticated: boolean;
  onQuery: (query: string) => void;
  onFilter: (index: number) => void;
  onSelectPlace: (id: string) => void;
  onNavigate: (view: ViewId) => void;
  onCycleFilter: () => void;
  onLocate: () => void;
  onRequireAuth: () => void;
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
        copyText={c}
        places={visiblePlaces}
        filters={c.filters}
        selectedFilter={selectedFilter}
        selectedPlace={selectedPlace}
        locationState={locationState}
        userLocation={userLocation}
        onSelectPlace={onSelectPlace}
        onCycleFilter={onCycleFilter}
        onLocate={onLocate}
        tall
      />

      <PlaceDetailCard
        copy={c}
        authLabels={authLabels}
        locale={locale}
        place={selectedPlace}
        isAuthenticated={isAuthenticated}
        onRequireAuth={onRequireAuth}
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
  draft,
  statusMessage,
  isSubmitting,
  selectedPlace,
  onRating,
  onNotes,
  onAnonymous,
  onFiles,
  onDraft,
  onSubmit
}: {
  copy: (typeof copy)[Locale];
  locale: Locale;
  ratings: Record<SensoryKey, number>;
  notes: string;
  anonymous: boolean;
  uploadedFiles: File[];
  draft: ContributionDraft;
  statusMessage: string | null;
  isSubmitting: boolean;
  selectedPlace: Place;
  onRating: (key: SensoryKey, value: number) => void;
  onNotes: (notes: string) => void;
  onAnonymous: (anonymous: boolean) => void;
  onFiles: (files: File[]) => void;
  onDraft: (draft: Partial<ContributionDraft>) => void;
  onSubmit: () => void;
}) {
  const ac = authCopy[locale];
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
            <strong>{draft.createNewPlace ? ac.createNewPlace : selectedPlace.name}</strong>
            <span>
              {draft.createNewPlace ? ac.placeAddress : `${selectedPlace.area} · ${selectedPlace.quietDb}`}
            </span>
          </div>
          <em>{c.pendingModeration}</em>
        </div>

        <section className="inline-form-block">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={draft.createNewPlace}
              onChange={(event) => onDraft({ createNewPlace: event.target.checked })}
            />
            <span>{draft.createNewPlace ? ac.createNewPlace : ac.useSelectedPlace}</span>
          </label>
          {draft.createNewPlace ? (
            <div className="compact-form-grid">
              <label>
                <span>{ac.placeName}</span>
                <input value={draft.placeName} onChange={(event) => onDraft({ placeName: event.target.value })} />
              </label>
              <label>
                <span>{ac.placeCity}</span>
                <input value={draft.city} onChange={(event) => onDraft({ city: event.target.value })} />
              </label>
              <label>
                <span>{ac.placeAddress}</span>
                <input value={draft.addressOrArea} onChange={(event) => onDraft({ addressOrArea: event.target.value })} />
              </label>
              <label>
                <span>{ac.placeDescription}</span>
                <input value={draft.description} onChange={(event) => onDraft({ description: event.target.value })} />
              </label>
            </div>
          ) : null}
        </section>

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
          <button type="button" className="primary-action" disabled={isSubmitting} onClick={onSubmit}>
            <Send aria-hidden="true" size={17} />
            {isSubmitting ? "..." : c.submit}
          </button>
        </div>
        {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
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
            onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
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
                <li key={`${file.name}-${file.size}`}>
                  <FileText aria-hidden="true" size={15} />
                  {file.name}
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

function ProfilesView({
  copy: c,
  authCopy: ac,
  locale,
  appUser,
  professionals: verifiedProfessionals,
  organizations: verifiedOrganizations,
  isAuthenticated,
  onRequireAuth,
  onRefreshProfile
}: {
  copy: (typeof copy)[Locale];
  authCopy: (typeof authCopy)[Locale];
  locale: Locale;
  appUser: AppUser | null;
  professionals: Professional[];
  organizations: Organization[];
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onRefreshProfile: () => Promise<void>;
}) {
  const [childAlias, setChildAlias] = useState("");
  const [childAge, setChildAge] = useState<"0-5" | "6-9" | "10-13" | "14-17" | "">("");
  const [childStatus, setChildStatus] = useState<string | null>(null);
  const [professionalForm, setProfessionalForm] = useState({
    professionalName: "",
    licenseNumber: "",
    professionalCollege: "",
    specialty: ""
  });
  const [professionalStatus, setProfessionalStatus] = useState<string | null>(null);
  const [isSavingChild, setIsSavingChild] = useState(false);
  const [isSavingProfessional, setIsSavingProfessional] = useState(false);

  const submitChildProfile = async () => {
    if (isSavingChild) {
      return;
    }

    setIsSavingChild(true);
    setChildStatus(null);
    try {
      await createChildProfile({
        alias: childAlias,
        ageRange: childAge || undefined,
        sensoryPreferences: {}
      });
      setChildAlias("");
      setChildAge("");
      setChildStatus(ac.childProfileCreated);
      await onRefreshProfile();
    } catch {
      setChildStatus(ac.authFailed);
    } finally {
      setIsSavingChild(false);
    }
  };

  const submitProfessionalVerification = async () => {
    if (isSavingProfessional) {
      return;
    }

    setIsSavingProfessional(true);
    setProfessionalStatus(null);
    try {
      await requestProfessionalVerification(professionalForm);
      setProfessionalForm({
        professionalName: "",
        licenseNumber: "",
        professionalCollege: "",
        specialty: ""
      });
      setProfessionalStatus(ac.verificationRequested);
      await onRefreshProfile();
    } catch {
      setProfessionalStatus(ac.authFailed);
    } finally {
      setIsSavingProfessional(false);
    }
  };

  return (
    <div className="profiles-grid">
      <section className="section-intro">
        <h2>{c.profilesTitle}</h2>
        <p>{c.profilesIntro}</p>
      </section>

      <section className="panel profiles-public-trust">
        <PanelHeading title={c.verifiedTitle} action={c.viewAll} />
        <div className="trust-strip">
          {verifiedProfessionals.map((professional) => (
            <VerifiedMiniCard
              key={professional.id}
              title={professional.name}
              meta={`${professional.license} · ${professional.distance}`}
              initials={professional.initials}
            />
          ))}
          {verifiedOrganizations.map((organization) => (
            <VerifiedMiniCard
              key={organization.id}
              title={organization.name}
              meta={`${organization.registry} · ${organization.distance}`}
              initials={organization.initials}
            />
          ))}
        </div>
      </section>

      {!isAuthenticated ? (
        <section className="panel public-access-panel">
          <Lock aria-hidden="true" size={24} />
          <h3>{ac.signInRequiredTitle}</h3>
          <p>{ac.signInRequiredIntro}</p>
          <button type="button" className="primary-action" onClick={onRequireAuth}>
            <KeyRound aria-hidden="true" size={17} />
            {ac.signInToContinue}
          </button>
        </section>
      ) : null}

      {isAuthenticated ? (
        <>
      <ProfileCard icon={UserRound} title={c.adultProfile} meta={`${appUser?.publicName ?? "Spectrum user"} · ${appUser?.city ?? ac.cityOptional}`}>
        <p>{locale === "en" ? "Same account for web and mobile actions." : "Mateix compte per a accions web i mòbil."}</p>
      </ProfileCard>

      <ProfileCard icon={UsersRound} title={c.tutorProfile} meta={appUser?.roles.includes("tutor") ? "Tutor actiu" : "Compte principal"}>
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
        </div>
        <div className="compact-form-grid profile-form">
          <label>
            <span>{ac.childAlias}</span>
            <input value={childAlias} onChange={(event) => setChildAlias(event.target.value)} />
          </label>
          <label>
            <span>{ac.childAge}</span>
            <select value={childAge} onChange={(event) => setChildAge(event.target.value as typeof childAge)}>
              <option value="">-</option>
              <option value="0-5">0-5</option>
              <option value="6-9">6-9</option>
              <option value="10-13">10-13</option>
              <option value="14-17">14-17</option>
            </select>
          </label>
        </div>
        <button type="button" className="primary-action" disabled={isSavingChild} onClick={submitChildProfile}>
          <Plus aria-hidden="true" size={17} />
          {isSavingChild ? "..." : ac.createChildProfile}
        </button>
        {childStatus ? <p className="form-status">{childStatus}</p> : null}
      </section>

      <section className="panel professional-request-panel">
        <PanelHeading title={ac.professionalRequestTitle} />
        <div className="compact-form-grid profile-form">
          <label>
            <span>{ac.professionalName}</span>
            <input
              value={professionalForm.professionalName}
              onChange={(event) => setProfessionalForm((current) => ({ ...current, professionalName: event.target.value }))}
            />
          </label>
          <label>
            <span>{ac.licenseNumber}</span>
            <input
              value={professionalForm.licenseNumber}
              onChange={(event) => setProfessionalForm((current) => ({ ...current, licenseNumber: event.target.value }))}
            />
          </label>
          <label>
            <span>{ac.professionalCollege}</span>
            <input
              value={professionalForm.professionalCollege}
              onChange={(event) => setProfessionalForm((current) => ({ ...current, professionalCollege: event.target.value }))}
            />
          </label>
          <label>
            <span>{ac.specialty}</span>
            <input
              value={professionalForm.specialty}
              onChange={(event) => setProfessionalForm((current) => ({ ...current, specialty: event.target.value }))}
            />
          </label>
        </div>
        <button type="button" className="primary-action" disabled={isSavingProfessional} onClick={submitProfessionalVerification}>
          <ShieldCheck aria-hidden="true" size={17} />
          {isSavingProfessional ? "..." : ac.requestVerification}
        </button>
        {professionalStatus ? <p className="form-status">{professionalStatus}</p> : null}
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
        </>
      ) : null}
    </div>
  );
}

function VerifiedView({
  copy: c,
  professionals: verifiedProfessionals,
  organizations: verifiedOrganizations
}: {
  copy: (typeof copy)[Locale];
  professionals: Professional[];
  organizations: Organization[];
}) {
  return (
    <div className="verified-grid">
      <section className="section-intro">
        <h2>{c.verifiedTitle}</h2>
        <p>{c.verifiedIntro}</p>
      </section>

      <section className="verified-list">
        {verifiedProfessionals.map((professional) => (
          <article key={professional.id} className="panel verified-profile-card">
            <span className="portrait">{professional.initials}</span>
            <div>
              <h3>{professional.name}</h3>
              <p>
                {professional.role} · {professional.city} · {professional.distance}
              </p>
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

        {verifiedOrganizations.map((organization) => (
          <article key={organization.id} className="panel verified-profile-card">
            <span className="portrait entity">{organization.initials}</span>
            <div>
              <h3>{organization.name}</h3>
              <p>
                {organization.city} · {organization.distance}
              </p>
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
  copyText,
  places: visiblePlaces,
  filters,
  selectedFilter,
  selectedPlace,
  locationState,
  userLocation,
  tall = false,
  onSelectPlace,
  onCycleFilter,
  onLocate,
  onOpen
}: {
  title: string;
  subtitle: string;
  copyText: (typeof copy)[Locale];
  places: Place[];
  filters: string[];
  selectedFilter: number | null;
  selectedPlace: Place;
  locationState: LocationState;
  userLocation: UserLocation | null;
  tall?: boolean;
  onSelectPlace: (id: string) => void;
  onCycleFilter: () => void;
  onLocate: () => void;
  onOpen?: () => void;
}) {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const [mapLayer, setMapLayer] = useState<MapLayerId>("roadmap");

  const layerLabels: Record<MapLayerId, string> = {
    roadmap: copyText.mapLayerRoadmap,
    satellite: copyText.mapLayerSatellite,
    terrain: copyText.mapLayerTerrain
  };

  const activeFilterLabel = selectedFilter === null ? null : filters[selectedFilter];
  const mapStatus = getLocationStatus(copyText, locationState);
  const filterControlLabel = `${copyText.mapFilterControl}: ${activeFilterLabel ?? copyText.mapFilterAll}`;
  const locationControlLabel =
    locationState === "idle" ? copyText.mapLocationControl : `${copyText.mapLocationControl} · ${mapStatus}`;
  const layerControlLabel = `${copyText.mapLayerControl}: ${layerLabels[mapLayer]}`;
  const providerLabel = [
    googleMapsKey ? "Google Maps" : "Google Maps key missing",
    activeFilterLabel,
    layerLabels[mapLayer]
  ].filter(Boolean).join(" · ");

  const cycleLayer = () => {
    setMapLayer((current) => {
      if (current === "roadmap") {
        return "satellite";
      }

      if (current === "satellite") {
        return "terrain";
      }

      return "roadmap";
    });
  };

  return (
    <section className="panel map-panel" data-tall={tall}>
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <span>{subtitle}</span>
        </div>
        <div className="map-tools">
          <button
            type="button"
            data-active={selectedFilter !== null}
            data-tooltip={filterControlLabel}
            aria-label={filterControlLabel}
            title={filterControlLabel}
            onClick={onCycleFilter}
          >
            <SlidersHorizontal aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            data-active={locationState === "located" || locationState === "locating"}
            data-tooltip={locationControlLabel}
            aria-label={locationControlLabel}
            title={locationControlLabel}
            onClick={onLocate}
          >
            <LocateFixed aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            data-active={mapLayer !== "roadmap"}
            data-tooltip={layerControlLabel}
            aria-label={layerControlLabel}
            title={layerControlLabel}
            onClick={cycleLayer}
          >
            <Layers aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
      <div className="map-canvas" role="img" aria-label={title}>
        {googleMapsKey ? (
          <GoogleMapCanvas
            apiKey={googleMapsKey}
            label={providerLabel}
            mapLayer={mapLayer}
            places={visiblePlaces}
            selectedPlace={selectedPlace}
            userLocation={userLocation}
            userLocationLabel={copyText.mapYourLocation}
            onSelectPlace={onSelectPlace}
          />
        ) : (
          <FallbackMapCanvas
            places={visiblePlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={onSelectPlace}
            userLocation={userLocation}
            userLocationLabel={copyText.mapYourLocation}
            label={providerLabel}
          />
        )}
        <div className="current-status">
          <span />
          <div>
            <small>{mapStatus}</small>
            <strong>{locationState === "located" ? copyText.mapYourLocation : selectedPlace.area}</strong>
          </div>
          <em>{locationState === "located" ? layerLabels[mapLayer] : selectedPlace.quietDb}</em>
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

function getLocationStatus(copyText: (typeof copy)[Locale], state: LocationState) {
  if (state === "locating") {
    return copyText.mapLocating;
  }

  if (state === "located") {
    return copyText.mapLocated;
  }

  if (state === "denied") {
    return copyText.mapLocationDenied;
  }

  if (state === "unsupported") {
    return copyText.mapLocationUnsupported;
  }

  if (state === "error") {
    return copyText.mapLocationError;
  }

  return copyText.mapCurrentStatus;
}

function GoogleMapCanvas({
  apiKey,
  label,
  mapLayer,
  places: visiblePlaces,
  selectedPlace,
  userLocation,
  userLocationLabel,
  onSelectPlace
}: {
  apiKey: string;
  label: string;
  mapLayer: MapLayerId;
  places: Place[];
  selectedPlace: Place;
  userLocation: UserLocation | null;
  userLocationLabel: string;
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
          mapTypeId: mapLayer,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          styles: mapLayer === "roadmap" ? googleMapStyles : undefined
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

        if (userLocation) {
          const marker = new google.maps.Marker({
            map,
            position: userLocation,
            title: userLocationLabel,
            icon: {
              path: "M 0,0 m -9,0 a 9,9 0 1,0 18,0 a 9,9 0 1,0 -18,0",
              fillColor: "#2f7df6",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
              scale: 1.25
            }
          });
          markers.push(marker);
          map.panTo(userLocation);
          map.setZoom(14);
        } else if (visiblePlaces.length > 1) {
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
  }, [apiKey, mapLayer, visiblePlaces, selectedPlace, userLocation, userLocationLabel, onSelectPlace]);

  if (loadFailed) {
    return (
      <FallbackMapCanvas
        places={visiblePlaces}
        selectedPlace={selectedPlace}
        onSelectPlace={onSelectPlace}
        userLocation={userLocation}
        userLocationLabel={userLocationLabel}
        label="Google Maps load error"
      />
    );
  }

  return (
    <>
      <div ref={mapElementRef} className="google-map-layer" />
      <span className="map-provider-note">{label}</span>
    </>
  );
}

function FallbackMapCanvas({
  places: visiblePlaces,
  selectedPlace,
  onSelectPlace,
  userLocation,
  userLocationLabel,
  label
}: {
  places: Place[];
  selectedPlace: Place;
  onSelectPlace: (id: string) => void;
  userLocation: UserLocation | null;
  userLocationLabel: string;
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
      {userLocation ? <span className="user-location-pin" aria-label={userLocationLabel} /> : null}
      <span className="map-provider-note">{label}</span>
    </>
  );
}

function PlaceDetailCard({
  copy: c,
  authLabels,
  locale,
  place,
  isAuthenticated,
  onRequireAuth,
  onContribute
}: {
  copy: (typeof copy)[Locale];
  authLabels: (typeof authCopy)[Locale];
  locale: Locale;
  place: Place;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
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
      {isAuthenticated ? (
        <>
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
        </>
      ) : (
        <div className="locked-detail">
          <Lock aria-hidden="true" size={18} />
          <p>{authLabels.signInRequiredIntro}</p>
          <button type="button" className="secondary-action" onClick={onRequireAuth}>
            <KeyRound aria-hidden="true" size={17} />
            {authLabels.signInToContinue}
          </button>
        </div>
      )}
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
