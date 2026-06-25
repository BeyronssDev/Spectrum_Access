import type { Locale, ViewId } from "./types";

export const copy: Record<
  Locale,
  {
    nav: Record<ViewId, string>;
    status: string;
    focus: string;
    focusOn: string;
    darkMode: string;
    lightMode: string;
    notifications: string;
    notificationsEmptyTitle: string;
    notificationsEmptyBody: string;
    notificationsGuestTitle: string;
    notificationsGuestBody: string;
    notificationsFutureNote: string;
    closeNotifications: string;
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
    noPlacesTitle: string;
    noPlacesBody: string;
    noVerifiedProfiles: string;
    noChildProfiles: string;
    noSensoryProfile: string;
    locationRequiredForPlace: string;
    greeting: string;
    homeIntro: string;
    sensoryMap: string;
    mapArea: string;
    savedPlaces: string;
    availablePlaces: string;
    results: string;
    viewAll: string;
    unavailableAction: string;
    trust: string;
    professionalsAndEntities: string;
    tutorReview: string;
    supportCard: string;
    openSupport: string;
    consultTitle: string;
    consultIntro: string;
    searchPlaceholder: string;
    filters: string[];
    placeDetails: string;
    sensoryState: string;
    noSpectrumRatings: string;
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
    trustedContactBody: string;
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
    adminPanel: string;
    roleUser: string;
    roleModerator: string;
    roleAdmin: string;
    roleSuperAdmin: string;
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
    notifications: "Notificacions",
    notificationsEmptyTitle: "No tens notificacions pendents",
    notificationsEmptyBody:
      "Quan es revisin les teves fotos, llocs o aportacions, els avisos apareixeran aquí.",
    notificationsGuestTitle: "Notificacions del compte",
    notificationsGuestBody:
      "Inicia sessió per veure avisos de fotos, llocs nous i canvis de moderació.",
    notificationsFutureNote: "Preparat per mostrar fotos noves, llocs creats i respostes de moderació.",
    closeNotifications: "Tancar notificacions",
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
    noPlacesTitle: "Encara no hi ha llocs publicats",
    noPlacesBody:
      "Quan facis una aportació real, el lloc i les imatges quedaran pendents de moderació abans de publicar-se.",
    noVerifiedProfiles: "Encara no hi ha professionals o entitats verificades.",
    noChildProfiles: "Encara no hi ha perfils tutelats.",
    noSensoryProfile: "Encara no hi ha preferències sensorials guardades.",
    locationRequiredForPlace: "Activa la ubicació per crear un lloc nou amb coordenades reals.",
    greeting: "Benvingut/da",
    homeIntro:
      "Consulta llocs reals, crea aportacions i deixa que la moderació publiqui només contingut validat.",
    sensoryMap: "Mapa Sensorial",
    mapArea: "Llocs publicats",
    savedPlaces: "Llocs desats",
    availablePlaces: "Espais disponibles",
    results: "Resultats",
    viewAll: "Veure tots",
    unavailableAction: "Encara no disponible",
    trust: "Confiança",
    professionalsAndEntities: "Professionals i entitats",
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
    noSpectrumRatings: "Encara sense valoracions Spectrum",
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
    trustedContactBody: "Configura un contacte de confiança al teu perfil.",
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
    adminPanel: "Administració",
    roleUser: "Usuari",
    roleModerator: "Moderador",
    roleAdmin: "Admin",
    roleSuperAdmin: "Super admin",
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
    notifications: "Notificaciones",
    notificationsEmptyTitle: "No tienes notificaciones pendientes",
    notificationsEmptyBody:
      "Cuando se revisen tus fotos, lugares o aportaciones, los avisos aparecerán aquí.",
    notificationsGuestTitle: "Notificaciones de la cuenta",
    notificationsGuestBody:
      "Inicia sesión para ver avisos de fotos, lugares nuevos y cambios de moderación.",
    notificationsFutureNote: "Preparado para mostrar fotos nuevas, lugares creados y respuestas de moderación.",
    closeNotifications: "Cerrar notificaciones",
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
    noPlacesTitle: "Todavía no hay lugares publicados",
    noPlacesBody:
      "Cuando hagas una aportación real, el lugar y las imágenes quedarán pendientes de moderación antes de publicarse.",
    noVerifiedProfiles: "Todavía no hay profesionales o entidades verificadas.",
    noChildProfiles: "Todavía no hay perfiles tutelados.",
    noSensoryProfile: "Todavía no hay preferencias sensoriales guardadas.",
    locationRequiredForPlace: "Activa la ubicación para crear un lugar nuevo con coordenadas reales.",
    greeting: "Bienvenido/a",
    homeIntro:
      "Consulta lugares reales, crea aportaciones y deja que la moderación publique solo contenido validado.",
    sensoryMap: "Mapa Sensorial",
    mapArea: "Lugares publicados",
    savedPlaces: "Lugares guardados",
    availablePlaces: "Espacios disponibles",
    results: "Resultados",
    viewAll: "Ver todos",
    unavailableAction: "Todavía no disponible",
    trust: "Confianza",
    professionalsAndEntities: "Profesionales y entidades",
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
    noSpectrumRatings: "Todavía sin valoraciones Spectrum",
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
    trustedContactBody: "Configura un contacto de confianza en tu perfil.",
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
    adminPanel: "Administración",
    roleUser: "Usuario",
    roleModerator: "Moderador",
    roleAdmin: "Admin",
    roleSuperAdmin: "Super admin",
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
    notifications: "Notifications",
    notificationsEmptyTitle: "You have no pending notifications",
    notificationsEmptyBody:
      "When your photos, places or reports are reviewed, alerts will appear here.",
    notificationsGuestTitle: "Account notifications",
    notificationsGuestBody:
      "Sign in to see photo, new place and moderation updates.",
    notificationsFutureNote: "Ready to show new photos, created places and moderation responses.",
    closeNotifications: "Close notifications",
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
    noPlacesTitle: "No published places yet",
    noPlacesBody:
      "When you make a real contribution, the place and images will stay pending moderation before publication.",
    noVerifiedProfiles: "No verified professionals or entities yet.",
    noChildProfiles: "No tutored profiles yet.",
    noSensoryProfile: "No sensory preferences have been saved yet.",
    locationRequiredForPlace: "Enable location to create a new place with real coordinates.",
    greeting: "Welcome",
    homeIntro:
      "Browse real places, create contributions and let moderation publish only validated content.",
    sensoryMap: "Sensory Map",
    mapArea: "Published places",
    savedPlaces: "Saved places",
    availablePlaces: "Available places",
    results: "Results",
    viewAll: "View all",
    unavailableAction: "Not available yet",
    trust: "Trust",
    professionalsAndEntities: "Professionals and entities",
    tutorReview: "Tutor review",
    supportCard: "Help card",
    openSupport: "Open card",
    consultTitle: "Explore sensory places",
    consultIntro: "Use the map, filter by sensory needs and review the place before going.",
    searchPlaceholder: "Search places, city or category",
    filters: ["Low noise", "Soft light", "Low density", "Clear exit"],
    placeDetails: "Place details",
    sensoryState: "Sensory state",
    noSpectrumRatings: "No Spectrum ratings yet",
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
    trustedContactBody: "Configure a trusted contact in your profile.",
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
    adminPanel: "Administration",
    roleUser: "User",
    roleModerator: "Moderator",
    roleAdmin: "Admin",
    roleSuperAdmin: "Super admin",
    privateEvidence: "Documentary evidence remains private for administration."
  }
};
