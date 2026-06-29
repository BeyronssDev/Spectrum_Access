import type { Locale } from "./types";

export const privacyCopy: Record<
  Locale,
  {
    title: string;
    shortTitle: string;
    intro: string;
    necessaryTitle: string;
    necessaryBody: string;
    alwaysActive: string;
    analyticsTitle: string;
    analyticsBody: string;
    analyticsUnavailable: string;
    mapsTitle: string;
    mapsBody: string;
    acceptAll: string;
    rejectOptional: string;
    configure: string;
    save: string;
    close: string;
    manage: string;
    enabled: string;
    disabled: string;
    mapBlockedTitle: string;
    mapBlockedBody: string;
    enableMaps: string;
    mapConsentLabel: string;
  }
> = {
  ca: {
    title: "Privacitat i cookies",
    shortTitle: "Cookies",
    intro:
      "Fem servir només el necessari per mantenir la sessió, protegir Firebase i recordar aquesta decisió. Google Analytics i Google Maps no es carreguen fins que els acceptes.",
    necessaryTitle: "Tècniques i seguretat",
    necessaryBody:
      "Mantenen la sessió, la protecció contra abús, les preferències essencials i el funcionament bàsic de Spectrum Access.",
    alwaysActive: "Sempre actives",
    analyticsTitle: "Google Analytics",
    analyticsBody:
      "Ens ajuda a entendre ús general de la web sense activar publicitat ni personalització d'anuncis.",
    analyticsUnavailable: "Preparat per producció; falta configurar l'ID de mesura en aquest entorn.",
    mapsTitle: "Google Maps",
    mapsBody:
      "Carrega el mapa real, marcadors, capes i serveis de Google Maps per consultar llocs propers.",
    acceptAll: "Acceptar tot",
    rejectOptional: "Rebutjar opcionals",
    configure: "Configurar",
    save: "Desar preferències",
    close: "Tancar",
    manage: "Privacitat",
    enabled: "Actiu",
    disabled: "Inactiu",
    mapBlockedTitle: "Google Maps pendent de consentiment",
    mapBlockedBody:
      "El mapa real no es carrega fins que acceptis la categoria de Google Maps. Mentrestant evitem peticions a Google Maps.",
    enableMaps: "Activar Google Maps",
    mapConsentLabel: "Google Maps bloquejat per consentiment"
  },
  es: {
    title: "Privacidad y cookies",
    shortTitle: "Cookies",
    intro:
      "Usamos solo lo necesario para mantener la sesión, proteger Firebase y recordar esta decisión. Google Analytics y Google Maps no se cargan hasta que los aceptas.",
    necessaryTitle: "Técnicas y seguridad",
    necessaryBody:
      "Mantienen la sesión, la protección contra abuso, las preferencias esenciales y el funcionamiento básico de Spectrum Access.",
    alwaysActive: "Siempre activas",
    analyticsTitle: "Google Analytics",
    analyticsBody:
      "Nos ayuda a entender el uso general de la web sin activar publicidad ni personalización de anuncios.",
    analyticsUnavailable: "Preparado para producción; falta configurar el ID de medición en este entorno.",
    mapsTitle: "Google Maps",
    mapsBody:
      "Carga el mapa real, marcadores, capas y servicios de Google Maps para consultar lugares cercanos.",
    acceptAll: "Aceptar todo",
    rejectOptional: "Rechazar opcionales",
    configure: "Configurar",
    save: "Guardar preferencias",
    close: "Cerrar",
    manage: "Privacidad",
    enabled: "Activo",
    disabled: "Inactivo",
    mapBlockedTitle: "Google Maps pendiente de consentimiento",
    mapBlockedBody:
      "El mapa real no se carga hasta que aceptes la categoría de Google Maps. Mientras tanto evitamos peticiones a Google Maps.",
    enableMaps: "Activar Google Maps",
    mapConsentLabel: "Google Maps bloqueado por consentimiento"
  },
  en: {
    title: "Privacy and cookies",
    shortTitle: "Cookies",
    intro:
      "We only use what is needed to keep your session, protect Firebase and remember this decision. Google Analytics and Google Maps do not load until you accept them.",
    necessaryTitle: "Technical and security",
    necessaryBody:
      "Keeps sessions, abuse protection, essential preferences and the basic Spectrum Access experience working.",
    alwaysActive: "Always active",
    analyticsTitle: "Google Analytics",
    analyticsBody:
      "Helps us understand general website usage without enabling ads or ad personalization.",
    analyticsUnavailable: "Ready for production; the measurement ID is not configured in this environment.",
    mapsTitle: "Google Maps",
    mapsBody:
      "Loads the real map, markers, layers and Google Maps services for nearby place discovery.",
    acceptAll: "Accept all",
    rejectOptional: "Reject optional",
    configure: "Configure",
    save: "Save preferences",
    close: "Close",
    manage: "Privacy",
    enabled: "Enabled",
    disabled: "Disabled",
    mapBlockedTitle: "Google Maps waiting for consent",
    mapBlockedBody:
      "The real map is not loaded until you accept the Google Maps category. Until then, requests to Google Maps are blocked.",
    enableMaps: "Enable Google Maps",
    mapConsentLabel: "Google Maps blocked by consent"
  }
};
