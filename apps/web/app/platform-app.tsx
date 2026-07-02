"use client";

import {
  Bell,
  Bookmark,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Flag,
  Globe2,
  HeartHandshake,
  ImagePlus,
  KeyRound,
  Layers,
  LifeBuoy,
  LocateFixed,
  LogOut,
  Lock,
  Mail,
  MapPinned,
  MapPin,
  MessageSquare,
  Minus,
  Moon,
  Plus,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  UserPlus,
  UserRound,
  UsersRound
} from "lucide-react";
import type { User } from "firebase/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { eventCategories, type AppUser, type EventCategory, type EventExperienceCriterion, type EventHistorySearchResult } from "@accessibilitat/shared";
import { disableGoogleAnalytics, initializeGoogleAnalytics } from "./lib/google-analytics";
import {
  createChildProfile,
  createEventEdition,
  createEventSeries,
  createEventZone,
  createPlace,
  listActivePlaces,
  loginWithApple,
  loginWithEmailPassword,
  loginWithGoogle,
  logout,
  readCurrentAppUser,
  readStorageDownloadUrl,
  registerWithEmailPassword,
  requestPasswordReset,
  requestProfessionalVerification,
  resolvePlaceForContribution,
  searchNearbyPlaces,
  searchEventHistory,
  submitEventExperience,
  submitReview,
  subscribeToAuthState,
  uploadPlaceImage,
  uploadEventExperiencePhoto,
  type ProfessionalVerificationInput
} from "./lib/firebase-actions";
import { loadGoogleMaps, type GoogleMarkerInstance } from "./lib/google-maps";
import { readPrivacyConsent, savePrivacyConsent, type PrivacyConsent, type PrivacyConsentChoice } from "./lib/privacy-consent";
import { authCopy } from "./platform/auth-copy";
import { copy } from "./platform/copy";
import {
  childProfiles,
  organizations,
  places,
  professionals,
  sensoryKeys,
  sensoryLabels,
  sensoryWords
} from "./platform/data";
import { rankLocatedItemsByDistance, rankPlacesByDistance } from "./platform/distance";
import { useUserLocation } from "./platform/hooks/use-user-location";
import { googleMapStyles } from "./platform/map-config";
import { toSensoryRating, toUiDiscoveredPlace, toUiPlace } from "./platform/mappers";
import { authRequiredViews, locales, navItems } from "./platform/navigation";
import { PrivacyConsentBanner } from "./platform/privacy-consent-banner";
import { privacyCopy } from "./platform/privacy-copy";
import type {
  AuthMode,
  ContributionDraft,
  Locale,
  LocationState,
  MapLayerId,
  Organization,
  Place,
  Professional,
  RegisterAccountType,
  SensoryKey,
  UserLocation,
  ViewId
} from "./platform/types";
import { AppleLogo, EmptyState, GoogleLogo, OfficialLogo, PanelHeading, ProfileCard, ToggleButton } from "./platform/ui-elements";

const minimumPasswordLength = 12;
const nearbyPlaceSearchLimit = 10;
const nearbyPlaceDisplayLimit = 5;
const eventSearchRadiusMeters = 10000;

const emptyEventHistory: EventHistorySearchResult = {
  series: [],
  editions: [],
  zones: [],
  experiences: []
};

type EventHistoryDraft = {
  eventSeriesId: string;
  eventEditionId: string;
  eventZoneId: string;
  seriesTitle: string;
  seriesCategory: EventCategory;
  seriesCity: string;
  seriesDescription: string;
  editionTitle: string;
  editionYear: number;
  editionStartsAt: string;
  editionEndsAt: string;
  zoneName: string;
  zoneDescription: string;
  zoneRadiusMeters: number;
  observedAt: string;
  description: string;
};

const defaultEventRatings: Record<EventExperienceCriterion, number> = {
  noise: 3,
  crowd: 3,
  lighting: 3,
  waitingTime: 3,
  temperature: 3,
  perceivedSafety: 3,
  exitEase: 3
};

function createEventDraft(): EventHistoryDraft {
  return {
    eventSeriesId: "",
    eventEditionId: "",
    eventZoneId: "",
    seriesTitle: "",
    seriesCategory: "festa_major",
    seriesCity: "",
    seriesDescription: "",
    editionTitle: "",
    editionYear: new Date().getFullYear(),
    editionStartsAt: "",
    editionEndsAt: "",
    zoneName: "",
    zoneDescription: "",
    zoneRadiusMeters: 150,
    observedAt: "",
    description: ""
  };
}

const eventCopy: Record<
  Locale,
  {
    title: string;
    intro: string;
    searchPlaceholder: string;
    refresh: string;
    noEventsTitle: string;
    noEventsBody: string;
    experiences: string;
    createTitle: string;
    catalogTitle: string;
    submit: string;
    submitted: string;
    failed: string;
    photoRequired: string;
    locationRequired: string;
    existingSeries: string;
    existingEdition: string;
    existingZone: string;
    newOption: string;
    photo: string;
    observedAt: string;
    description: string;
    city: string;
    type: string;
    edition: string;
    editions: string;
    year: string;
    startsAt: string;
    endsAt: string;
    zone: string;
    zones: string;
    radiusMeters: string;
    zoneDescription: string;
    categories: Record<EventCategory, string>;
    criteria: Record<EventExperienceCriterion, string>;
  }
> = {
  ca: {
    title: "Històric sensorial d'esdeveniments",
    intro: "Consulta edicions anteriors i aporta evidència amb data, hora, zona, foto i valoració sensorial.",
    searchPlaceholder: "Cerca per ciutat o esdeveniment",
    refresh: "Actualitzar",
    noEventsTitle: "Encara no hi ha esdeveniments publicats",
    noEventsBody: "Quan s'aprovin experiències reals, apareixeran aquí amb foto, zona i hora.",
    experiences: "Experiències",
    createTitle: "Aportar experiència històrica",
    catalogTitle: "Catàleg de l'esdeveniment",
    submit: "Enviar experiència",
    submitted: "Experiència enviada a moderació.",
    failed: "No s'ha pogut enviar l'experiència.",
    photoRequired: "Afegeix una foto del lloc per enviar l'experiència.",
    locationRequired: "Activa la ubicació per proposar una zona nova amb coordenades reals.",
    existingSeries: "Esdeveniment existent",
    existingEdition: "Edició existent",
    existingZone: "Zona existent",
    newOption: "Crear-ne un de nou",
    photo: "Foto del lloc",
    observedAt: "Data i hora observades",
    description: "Informació observada",
    city: "Ciutat",
    type: "Tipus",
    edition: "Edició",
    editions: "edicions",
    year: "Any",
    startsAt: "Inici",
    endsAt: "Final",
    zone: "Zona",
    zones: "zones",
    radiusMeters: "Radi metres",
    zoneDescription: "Descripció zona",
    categories: {
      festa_major: "Festa Major",
      sant_joan: "Sant Joan",
      correfoc: "Correfoc",
      local_festival: "Festa local",
      performance: "Espectacle",
      other: "Altres"
    },
    criteria: {
      noise: "Soroll",
      crowd: "Afluència",
      lighting: "Llum",
      waitingTime: "Espera",
      temperature: "Temperatura",
      perceivedSafety: "Seguretat",
      exitEase: "Sortida"
    }
  },
  es: {
    title: "Histórico sensorial de eventos",
    intro: "Consulta ediciones anteriores y aporta evidencia con fecha, hora, zona, foto y valoración sensorial.",
    searchPlaceholder: "Busca por ciudad o evento",
    refresh: "Actualizar",
    noEventsTitle: "Todavía no hay eventos publicados",
    noEventsBody: "Cuando se aprueben experiencias reales, aparecerán aquí con foto, zona y hora.",
    experiences: "Experiencias",
    createTitle: "Aportar experiencia histórica",
    catalogTitle: "Catálogo del evento",
    submit: "Enviar experiencia",
    submitted: "Experiencia enviada a moderación.",
    failed: "No se ha podido enviar la experiencia.",
    photoRequired: "Añade una foto del lugar para enviar la experiencia.",
    locationRequired: "Activa la ubicación para proponer una zona nueva con coordenadas reales.",
    existingSeries: "Evento existente",
    existingEdition: "Edición existente",
    existingZone: "Zona existente",
    newOption: "Crear uno nuevo",
    photo: "Foto del lugar",
    observedAt: "Fecha y hora observadas",
    description: "Información observada",
    city: "Ciudad",
    type: "Tipo",
    edition: "Edición",
    editions: "ediciones",
    year: "Año",
    startsAt: "Inicio",
    endsAt: "Final",
    zone: "Zona",
    zones: "zonas",
    radiusMeters: "Radio metros",
    zoneDescription: "Descripción zona",
    categories: {
      festa_major: "Fiesta mayor",
      sant_joan: "San Juan",
      correfoc: "Correfoc",
      local_festival: "Fiesta local",
      performance: "Espectáculo",
      other: "Otros"
    },
    criteria: {
      noise: "Ruido",
      crowd: "Afluencia",
      lighting: "Luz",
      waitingTime: "Espera",
      temperature: "Temperatura",
      perceivedSafety: "Seguridad",
      exitEase: "Salida"
    }
  },
  en: {
    title: "Sensory event history",
    intro: "Browse previous editions and contribute evidence with date, time, zone, photo and sensory ratings.",
    searchPlaceholder: "Search by city or event",
    refresh: "Refresh",
    noEventsTitle: "No published events yet",
    noEventsBody: "Approved real experiences will appear here with photo, zone and time.",
    experiences: "Experiences",
    createTitle: "Contribute a historic experience",
    catalogTitle: "Event catalog",
    submit: "Submit experience",
    submitted: "Experience sent to moderation.",
    failed: "Could not submit the experience.",
    photoRequired: "Add a place photo before submitting the experience.",
    locationRequired: "Enable location to propose a new zone with real coordinates.",
    existingSeries: "Existing event",
    existingEdition: "Existing edition",
    existingZone: "Existing zone",
    newOption: "Create a new one",
    photo: "Place photo",
    observedAt: "Observed date and time",
    description: "Observed information",
    city: "City",
    type: "Type",
    edition: "Edition",
    editions: "editions",
    year: "Year",
    startsAt: "Start",
    endsAt: "End",
    zone: "Zone",
    zones: "zones",
    radiusMeters: "Radius meters",
    zoneDescription: "Zone description",
    categories: {
      festa_major: "Main festival",
      sant_joan: "Saint John",
      correfoc: "Fire run",
      local_festival: "Local festival",
      performance: "Performance",
      other: "Other"
    },
    criteria: {
      noise: "Noise",
      crowd: "Crowd",
      lighting: "Light",
      waitingTime: "Waiting",
      temperature: "Temperature",
      perceivedSafety: "Safety",
      exitEase: "Exit"
    }
  }
};

export function PlatformApp() {
  const [locale, setLocale] = useState<Locale>("ca");
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>(places);
  const [eventHistory, setEventHistory] = useState<EventHistorySearchResult>(emptyEventHistory);
  const [eventHistoryLoading, setEventHistoryLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [eventPhotoUrls, setEventPhotoUrls] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const { locationState, requestUserLocation, userLocation } = useUserLocation();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState<PrivacyConsent | null>(null);
  const [privacyConsentLoaded, setPrivacyConsentLoaded] = useState(false);
  const [privacyPreferencesOpen, setPrivacyPreferencesOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSubmittingContribution, setIsSubmittingContribution] = useState(false);
  const [isSubmittingEventExperience, setIsSubmittingEventExperience] = useState(false);
  const [contributionMessage, setContributionMessage] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [contributionDraft, setContributionDraft] = useState<ContributionDraft>({
    createNewPlace: true,
    placeName: "",
    city: "",
    addressOrArea: "",
    description: ""
  });
  const [eventDraft, setEventDraft] = useState<EventHistoryDraft>(() => createEventDraft());
  const [eventRatings, setEventRatings] = useState<Record<EventExperienceCriterion, number>>(defaultEventRatings);
  const [eventPhoto, setEventPhoto] = useState<File | null>(null);
  const [ratings, setRatings] = useState<Record<SensoryKey, number>>({
    noise: 2,
    density: 2,
    light: 2,
    wait: 1
  });

  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim() ?? "";

  useEffect(() => {
    setPrivacyConsent(readPrivacyConsent());
    setPrivacyConsentLoaded(true);
  }, []);

  useEffect(() => {
    if (!privacyConsentLoaded) {
      return;
    }

    if (privacyConsent?.analytics && googleAnalyticsId) {
      initializeGoogleAnalytics(googleAnalyticsId);
      return;
    }

    disableGoogleAnalytics(googleAnalyticsId);
  }, [googleAnalyticsId, privacyConsent?.analytics, privacyConsentLoaded]);

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
    let active = true;

    listActivePlaces()
      .then((firebasePlaces) => {
        if (!active) {
          return;
        }

        const mappedPlaces = firebasePlaces.map(toUiPlace);
        setAvailablePlaces(mappedPlaces);
        setSelectedPlaceId((current) =>
          mappedPlaces.some((place) => place.id === current) ? current : (mappedPlaces[0]?.id ?? null)
        );
      })
      .catch(() => {
        if (active) {
          setAvailablePlaces([]);
          setSelectedPlaceId(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!userLocation) {
      return;
    }

    let active = true;
    searchNearbyPlaces({
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      radiusMeters: 1500,
      maxResultCount: nearbyPlaceSearchLimit,
      locale
    })
      .then((result) => {
        if (!active) {
          return;
        }

        const discovered = Array.isArray(result.data) ? result.data : result.data.places;
        const mappedPlaces = discovered.map(toUiDiscoveredPlace);
        setAvailablePlaces(mappedPlaces);
        setSelectedPlaceId((current) =>
          mappedPlaces.some((place) => place.id === current) ? current : (mappedPlaces[0]?.id ?? null)
        );
      })
      .catch(() => {
        if (active) {
          setAvailablePlaces([]);
          setSelectedPlaceId(null);
        }
      });

    return () => {
      active = false;
    };
  }, [locale, userLocation]);

  useEffect(() => {
    let active = true;
    setEventHistoryLoading(true);
    searchEventHistory({
      locale,
      city: eventSearch.trim() || undefined,
      ...(userLocation
        ? {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            radiusMeters: eventSearchRadiusMeters
          }
        : {}),
      maxResultCount: 50
    })
      .then((result) => {
        if (active) {
          setEventHistory(result.data);
        }
      })
      .catch(() => {
        if (active) {
          setEventHistory(emptyEventHistory);
        }
      })
      .finally(() => {
        if (active) {
          setEventHistoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [eventSearch, locale, userLocation]);

  useEffect(() => {
    let active = true;
    const paths = Array.from(new Set(eventHistory.experiences.map((experience) => experience.photoPath).filter(Boolean)));
    if (paths.length === 0) {
      setEventPhotoUrls({});
      return () => {
        active = false;
      };
    }

    Promise.all(
      paths.map(async (path) => {
        const url = await readStorageDownloadUrl(path).catch(() => "");
        return [path, url] as const;
      })
    ).then((entries) => {
      if (active) {
        setEventPhotoUrls(Object.fromEntries(entries.filter((entry) => entry[1])));
      }
    });

    return () => {
      active = false;
    };
  }, [eventHistory.experiences]);

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
  const visibleNearbyPlaces = useMemo(
    () => filteredPlaces.slice(0, nearbyPlaceDisplayLimit),
    [filteredPlaces]
  );

  const selectedPlace = rankedPlaces.find((place) => place.id === selectedPlaceId) ?? rankedPlaces[0] ?? null;
  const visibleSelectedPlace =
    visibleNearbyPlaces.find((place) => place.id === selectedPlaceId) ?? visibleNearbyPlaces[0] ?? null;

  useEffect(() => {
    if (!userLocation || rankedPlaces.length === 0) {
      return;
    }

    setSelectedPlaceId(rankedPlaces[0].id);
  }, [rankedPlaces, userLocation]);

  useEffect(() => {
    if (visibleNearbyPlaces.length === 0 || visibleNearbyPlaces.some((place) => place.id === selectedPlaceId)) {
      return;
    }

    setSelectedPlaceId(visibleNearbyPlaces[0].id);
  }, [visibleNearbyPlaces, selectedPlaceId]);

  const updateRating = (key: SensoryKey, value: number) => {
    setRatings((current) => ({ ...current, [key]: value }));
  };

  const persistPrivacyConsent = (choice: PrivacyConsentChoice) => {
    const savedConsent = savePrivacyConsent(choice);
    setPrivacyConsent(savedConsent);
    setPrivacyPreferencesOpen(false);
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
    setNotificationsOpen(false);
    if (authRequiredViews.has(view)) {
      setAuthPanelOpen(false);
    }
  };

  const handleEmailRegister = async (input: {
    email: string;
    password: string;
    publicName: string;
    city?: string;
    professional?: ProfessionalVerificationInput;
  }) => {
    await registerWithEmailPassword({
      email: input.email,
      password: input.password,
      publicName: input.publicName,
      city: input.city,
      locale
    });
    if (input.professional) {
      await requestProfessionalVerification(input.professional);
    }
    await refreshAppProfile();
    setAuthPanelOpen(false);
    setAuthMessage(input.professional ? authCopy[locale].professionalVerificationSent : authCopy[locale].emailVerificationSent);
  };

  const handleEmailLogin = async (input: { email: string; password: string }) => {
    await loginWithEmailPassword({ ...input, locale });
    await refreshAppProfile();
    setAuthPanelOpen(false);
  };

  const handlePasswordReset = async (input: { email: string }) => {
    await requestPasswordReset({ ...input, locale });
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
    setNotificationsOpen(false);
    if (authRequiredViews.has(activeView)) {
      setActiveView("home");
    }
  };

  const openAuthPanel = () => {
    setNotificationsOpen(false);
    setAuthPanelOpen(true);
  };

  const allowGoogleMaps = () => {
    persistPrivacyConsent({
      analytics: privacyConsent?.analytics ?? false,
      maps: true
    });
  };

  const updateContributionDraft = (patch: Partial<ContributionDraft>) => {
    setContributionDraft((current) => ({ ...current, ...patch }));
  };

  const updateEventDraft = (patch: Partial<EventHistoryDraft>) => {
    setEventDraft((current) => ({ ...current, ...patch }));
  };

  const updateEventRating = (key: EventExperienceCriterion, value: number) => {
    setEventRatings((current) => ({ ...current, [key]: value }));
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
      const shouldCreatePlace = contributionDraft.createNewPlace || !selectedPlace;
      let placeId = selectedPlace?.spectrumPlaceId ?? null;

      if (shouldCreatePlace) {
        const placeName = contributionDraft.placeName.trim();
        const city = contributionDraft.city.trim();
        const addressOrArea = contributionDraft.addressOrArea.trim();

        if (!placeName || !city || !addressOrArea) {
          setContributionMessage(authCopy[locale].requiredFields);
          return;
        }

        if (!userLocation) {
          setContributionMessage(c.locationRequiredForPlace);
          return;
        }

        const created = await createPlace({
          name: placeName,
          category: "other",
          city,
          addressOrArea,
          description: contributionDraft.description.trim() || undefined,
          latitude: userLocation.lat,
          longitude: userLocation.lng
        });
        placeId = created.data.placeId;
      } else if (!placeId && selectedPlace?.googlePlaceId) {
        if (!userLocation) {
          setContributionMessage(c.locationRequiredForPlace);
          return;
        }

        const resolved = await resolvePlaceForContribution({
          googlePlaceId: selectedPlace.googlePlaceId,
          locale,
          name: selectedPlace.name,
          category: selectedPlace.category,
          city: selectedPlace.city,
          addressOrArea: selectedPlace.area,
          description: selectedPlace.description || undefined,
          latitude: selectedPlace.position.lat,
          longitude: selectedPlace.position.lng,
          contributorPosition: {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            ...(userLocation.accuracy ? { accuracyMeters: userLocation.accuracy } : {})
          }
        });
        placeId = resolved.data.placeId;
      }

      if (!placeId) {
        setContributionMessage(authCopy[locale].requiredFields);
        return;
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
        createNewPlace: availablePlaces.length === 0,
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

  const submitEventHistoryExperience = async () => {
    if (isSubmittingEventExperience) {
      return;
    }

    if (!authUser) {
      setActiveView("events");
      setEventMessage(authCopy[locale].signInRequiredIntro);
      return;
    }

    const labels = eventCopy[locale];
    if (!eventPhoto) {
      setEventMessage(labels.photoRequired);
      return;
    }

    if (!eventDraft.observedAt || !eventDraft.description.trim()) {
      setEventMessage(authCopy[locale].requiredFields);
      return;
    }

    setIsSubmittingEventExperience(true);
    setEventMessage(null);

    try {
      let eventSeriesId = eventDraft.eventSeriesId;
      if (!eventSeriesId) {
        if (!eventDraft.seriesTitle.trim() || !eventDraft.seriesCity.trim()) {
          setEventMessage(authCopy[locale].requiredFields);
          return;
        }

        const created = await createEventSeries({
          title: eventDraft.seriesTitle.trim(),
          category: eventDraft.seriesCategory,
          city: eventDraft.seriesCity.trim(),
          description: eventDraft.seriesDescription.trim() || undefined
        });
        eventSeriesId = created.data.eventSeriesId;
      }

      let eventEditionId = eventDraft.eventEditionId;
      if (!eventEditionId) {
        if (!eventDraft.editionTitle.trim() || !eventDraft.editionStartsAt || !eventDraft.editionEndsAt) {
          setEventMessage(authCopy[locale].requiredFields);
          return;
        }

        const created = await createEventEdition({
          eventSeriesId,
          title: eventDraft.editionTitle.trim(),
          year: eventDraft.editionYear,
          startsAt: new Date(eventDraft.editionStartsAt).toISOString(),
          endsAt: new Date(eventDraft.editionEndsAt).toISOString()
        });
        eventEditionId = created.data.eventEditionId;
      }

      let eventZoneId = eventDraft.eventZoneId;
      if (!eventZoneId) {
        if (!eventDraft.zoneName.trim()) {
          setEventMessage(authCopy[locale].requiredFields);
          return;
        }

        if (!userLocation) {
          setEventMessage(labels.locationRequired);
          return;
        }

        const created = await createEventZone({
          eventSeriesId,
          eventEditionId,
          name: eventDraft.zoneName.trim(),
          description: eventDraft.zoneDescription.trim() || undefined,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radiusMeters: eventDraft.zoneRadiusMeters
        });
        eventZoneId = created.data.eventZoneId;
      }

      const experienceId = crypto.randomUUID();
      const photoPath = await uploadEventExperiencePhoto(experienceId, eventPhoto);
      await submitEventExperience({
        experienceId,
        eventSeriesId,
        eventEditionId,
        eventZoneId,
        observedAt: new Date(eventDraft.observedAt).toISOString(),
        ratings: eventRatings,
        description: eventDraft.description.trim(),
        photoPath
      });

      setEventDraft(createEventDraft());
      setEventRatings(defaultEventRatings);
      setEventPhoto(null);
      setEventMessage(labels.submitted);
    } catch {
      setEventMessage(labels.failed);
    } finally {
      setIsSubmittingEventExperience(false);
    }
  };

  const isAuthenticated = Boolean(authUser);
  const mapsConsentGranted = Boolean(privacyConsent?.maps);
  const sessionStatusLabel = !authChecked
    ? authCopy[locale].loadingSession
    : authUser
      ? c.status
      : authCopy[locale].publicMode;
  const gatedViewNeedsAuth = !isAuthenticated && authRequiredViews.has(activeView);
  const notificationItems: Array<{ id: string; title: string; body: string; meta?: string }> = [];
  const appUserRoles = appUser?.roles ?? [];
  const canAccessAdmin = appUserRoles.some((role) => role === "super_admin" || role === "admin" || role === "moderator");
  const accountRoleLabel = appUserRoles.includes("super_admin")
    ? c.roleSuperAdmin
    : appUserRoles.includes("admin")
      ? c.roleAdmin
      : appUserRoles.includes("moderator")
        ? c.roleModerator
        : appUserRoles.includes("tutor")
          ? "Tutor"
          : c.roleUser;

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
            <div className="brand-copy">
              <div className="brand-title-row">
                <strong>Spectrum Access</strong>
                <span className="beta-badge">{c.betaLabel}</span>
                <span className="mobile-screen-title" aria-hidden="true">
                  {c.nav[activeView]}
                </span>
              </div>
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
                <span>{authUser ? accountRoleLabel : authCopy[locale].guestRole}</span>
              </div>
            </div>
            {canAccessAdmin ? (
              <a className="admin-entry-card" href="/admin">
                <ShieldCheck aria-hidden="true" size={22} />
                <div>
                  <span>{accountRoleLabel}</span>
                  <strong>{c.adminPanel}</strong>
                </div>
              </a>
            ) : null}
            <div className="security-card">
              <ShieldCheck aria-hidden="true" size={22} />
              <div>
                <span>{c.status}</span>
                <strong>{authUser ? (authUser.emailVerified ? c.verified : "Email pendent") : sessionStatusLabel}</strong>
              </div>
            </div>
            <button type="button" className="privacy-manage-action" onClick={() => setPrivacyPreferencesOpen(true)}>
              <FileText aria-hidden="true" size={16} />
              {privacyCopy[locale].manage}
            </button>
          </div>
        </aside>

        <section className="work-area">
          <header className="topbar">
            <div>
              <p className="screen-label">Spectrum Access</p>
              <h1>{c.nav[activeView]}</h1>
            </div>

            <div className="top-actions">
              {canAccessAdmin ? (
                <a className="secondary-action admin-top-action" href="/admin">
                  <ShieldCheck aria-hidden="true" size={17} />
                  {c.adminPanel}
                </a>
              ) : null}
              <span className="health-pill">
                <Check aria-hidden="true" size={15} />
                {sessionStatusLabel}
              </span>
              <label className="select-control top-language-control">
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
                className="top-focus-toggle"
                onClick={() => setFocusMode((value) => !value)}
              />
              <ToggleButton
                active={darkMode}
                label={darkMode ? c.lightMode : c.darkMode}
                activeIcon={Sun}
                inactiveIcon={Moon}
                className="top-theme-toggle"
                onClick={() => setDarkMode((value) => !value)}
              />
              <button
                type="button"
                className="icon-button privacy-top-action"
                aria-label={privacyCopy[locale].title}
                title={privacyCopy[locale].title}
                onClick={() => setPrivacyPreferencesOpen(true)}
              >
                <FileText aria-hidden="true" size={20} />
              </button>
              <div className="notification-menu">
                <button
                  type="button"
                  className="icon-button notification-trigger"
                  aria-label={c.notifications}
                  aria-controls="notification-panel"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <Bell aria-hidden="true" size={22} />
                </button>
                {notificationsOpen ? (
                  <section id="notification-panel" className="notification-popover panel" aria-label={c.notifications}>
                    <div className="notification-heading">
                      <div>
                        <span>{c.notifications}</span>
                        <strong>{notificationItems.length}</strong>
                      </div>
                      <button type="button" className="icon-button" aria-label={c.closeNotifications} onClick={() => setNotificationsOpen(false)}>
                        <Minus aria-hidden="true" size={18} />
                      </button>
                    </div>

                    {notificationItems.length > 0 ? (
                      <div className="notification-list">
                        {notificationItems.map((item) => (
                          <article key={item.id} className="notification-item">
                            <strong>{item.title}</strong>
                            <p>{item.body}</p>
                            {item.meta ? <span>{item.meta}</span> : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="notification-empty">
                        <Bell aria-hidden="true" size={24} />
                        <strong>{authUser ? c.notificationsEmptyTitle : c.notificationsGuestTitle}</strong>
                        <p>{authUser ? c.notificationsEmptyBody : c.notificationsGuestBody}</p>
                        {authUser ? (
                          <span>{c.notificationsFutureNote}</span>
                        ) : (
                          <button type="button" className="secondary-action" onClick={openAuthPanel}>
                            <KeyRound aria-hidden="true" size={16} />
                            {authCopy[locale].signInToContinue}
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                ) : null}
              </div>
              {authUser ? (
                <button type="button" className="icon-button" aria-label={authCopy[locale].logout} onClick={handleLogout}>
                  <LogOut aria-hidden="true" size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  className="secondary-action top-login-action"
                  aria-label={authCopy[locale].signInToContinue}
                  title={authCopy[locale].signInToContinue}
                  onClick={openAuthPanel}
                >
                  <UserRound aria-hidden="true" size={17} />
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
              onPasswordReset={handlePasswordReset}
              onGoogle={handleGoogleLogin}
              onApple={handleAppleLogin}
            />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "home" ? (
            <HomeView
              copy={c}
              authLabels={authCopy[locale]}
              locale={locale}
              places={visibleNearbyPlaces}
              selectedFilter={selectedFilter}
              selectedPlace={visibleSelectedPlace}
              locationState={locationState}
              userLocation={userLocation}
              mapsConsentGranted={mapsConsentGranted}
              professionals={rankedProfessionals}
              organizations={rankedOrganizations}
              isAuthenticated={isAuthenticated}
              onNavigate={navigateToView}
              onSelectPlace={setSelectedPlaceId}
              onCycleFilter={cycleFilter}
              onLocate={requestUserLocation}
              onAcceptMaps={allowGoogleMaps}
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
              places={visibleNearbyPlaces}
              locationState={locationState}
              userLocation={userLocation}
              mapsConsentGranted={mapsConsentGranted}
              isAuthenticated={isAuthenticated}
              onQuery={setQuery}
              onFilter={toggleFilter}
              onSelectPlace={setSelectedPlaceId}
              onNavigate={navigateToView}
              onCycleFilter={cycleFilter}
              onLocate={requestUserLocation}
              onAcceptMaps={allowGoogleMaps}
              onRequireAuth={() => setAuthPanelOpen(true)}
            />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "events" ? (
            <EventHistoryView
              locale={locale}
              history={eventHistory}
              loading={eventHistoryLoading}
              query={eventSearch}
              photoUrls={eventPhotoUrls}
              draft={eventDraft}
              ratings={eventRatings}
              photo={eventPhoto}
              statusMessage={eventMessage}
              isSubmitting={isSubmittingEventExperience}
              isAuthenticated={isAuthenticated}
              userLocation={userLocation}
              onQuery={setEventSearch}
              onDraft={updateEventDraft}
              onRating={updateEventRating}
              onPhoto={setEventPhoto}
              onSubmit={submitEventHistoryExperience}
              onRequireAuth={() => setAuthPanelOpen(true)}
              onLocate={requestUserLocation}
            />
          ) : null}

          {!gatedViewNeedsAuth && activeView === "contribute" ? (
            <ContributeView
              copy={c}
              locale={locale}
              ratings={ratings}
              notes={notes}
              uploadedFiles={uploadedFiles}
              draft={contributionDraft}
              statusMessage={contributionMessage}
              isSubmitting={isSubmittingContribution}
              selectedPlace={selectedPlace}
              onRating={updateRating}
              onNotes={setNotes}
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
              onNavigate={navigateToView}
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
              onPasswordReset={handlePasswordReset}
              onGoogle={handleGoogleLogin}
              onApple={handleAppleLogin}
            />
          </div>
        </div>
      ) : null}

      {privacyConsentLoaded && (!privacyConsent || privacyPreferencesOpen) ? (
        <PrivacyConsentBanner
          locale={locale}
          consent={privacyConsent}
          analyticsConfigured={Boolean(googleAnalyticsId)}
          preferencesOpen={privacyPreferencesOpen}
          onAcceptAll={() => persistPrivacyConsent({ analytics: true, maps: true })}
          onRejectOptional={() => persistPrivacyConsent({ analytics: false, maps: false })}
          onSave={persistPrivacyConsent}
          onClosePreferences={() => setPrivacyPreferencesOpen(false)}
        />
      ) : null}
    </main>
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
  onPasswordReset,
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
  onEmailRegister: (input: {
    email: string;
    password: string;
    publicName: string;
    city?: string;
    professional?: ProfessionalVerificationInput;
  }) => Promise<void>;
  onPasswordReset: (input: { email: string }) => Promise<void>;
  onGoogle: () => Promise<void>;
  onApple: () => Promise<void>;
}) {
  const [mode, setMode] = useState<AuthMode>("register");
  const [accountType, setAccountType] = useState<RegisterAccountType>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [publicName, setPublicName] = useState("");
  const [city, setCity] = useState("");
  const [professionalForm, setProfessionalForm] = useState<ProfessionalVerificationInput>({
    professionalName: "",
    licenseNumber: "",
    professionalCollege: "",
    specialty: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const isValidEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

  const runAuth = async (action: () => Promise<void>, errorMessage = c.authFailed) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setLocalMessage(null);
    try {
      await action();
    } catch {
      setLocalMessage(errorMessage);
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

        if (password.length < minimumPasswordLength) {
          setLocalMessage(c.passwordMinLength);
          return;
        }

        const professional =
          accountType === "professional"
            ? {
                professionalName: professionalForm.professionalName.trim(),
                licenseNumber: professionalForm.licenseNumber.trim(),
                professionalCollege: professionalForm.professionalCollege.trim(),
                specialty: professionalForm.specialty.trim()
              }
            : undefined;

        if (professional && Object.values(professional).some((value) => !value)) {
          setLocalMessage(c.professionalFieldsRequired);
          return;
        }

        await onEmailRegister({ email, password, publicName, city, professional });
        return;
      }

      await onEmailLogin({ email, password });
    });
  };

  const submitPasswordReset = () => {
    void runAuth(async () => {
      const normalizedEmail = email.trim();
      if (!normalizedEmail) {
        setLocalMessage(c.requiredFields);
        return;
      }

      if (!isValidEmail(normalizedEmail)) {
        setLocalMessage(c.invalidEmail);
        return;
      }

      await onPasswordReset({ email: normalizedEmail });
      setLocalMessage(c.passwordResetSent);
    }, c.passwordResetFailed);
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
            <>
              <div className="auth-field-group">
                <span>{c.accountType}</span>
                <div className="auth-mode-tabs account-type-tabs" role="radiogroup" aria-label={c.accountType}>
                  <button type="button" data-active={accountType === "user"} onClick={() => setAccountType("user")}>
                    <UserRound aria-hidden="true" size={17} />
                    {c.registerAsUser}
                  </button>
                  <button
                    type="button"
                    data-active={accountType === "professional"}
                    onClick={() => setAccountType("professional")}
                  >
                    <ShieldCheck aria-hidden="true" size={17} />
                    {c.registerAsProfessional}
                  </button>
                </div>
              </div>
              <label>
                <span>{c.publicName}</span>
                <input value={publicName} onChange={(event) => setPublicName(event.target.value)} />
              </label>
            </>
          ) : null}
          <label>
            <span>{c.email}</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>{c.password}</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {mode === "login" ? (
            <button
              type="button"
              className="auth-link-action"
              disabled={isSubmitting}
              onClick={submitPasswordReset}
            >
              <KeyRound aria-hidden="true" size={15} />
              {c.forgotPassword}
            </button>
          ) : null}
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
              {accountType === "professional" ? (
                <div className="auth-professional-fields">
                  <span>{c.professionalRegistrationTitle}</span>
                  <div className="compact-form-grid">
                    <label>
                      <span>{c.professionalName}</span>
                      <input
                        value={professionalForm.professionalName}
                        onChange={(event) =>
                          setProfessionalForm((current) => ({ ...current, professionalName: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>{c.licenseNumber}</span>
                      <input
                        value={professionalForm.licenseNumber}
                        onChange={(event) =>
                          setProfessionalForm((current) => ({ ...current, licenseNumber: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>{c.professionalCollege}</span>
                      <input
                        value={professionalForm.professionalCollege}
                        onChange={(event) =>
                          setProfessionalForm((current) => ({ ...current, professionalCollege: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>{c.professionalType}</span>
                      <input
                        value={professionalForm.specialty}
                        onChange={(event) => setProfessionalForm((current) => ({ ...current, specialty: event.target.value }))}
                      />
                    </label>
                  </div>
                </div>
              ) : null}
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
  onPasswordReset,
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
  onPasswordReset: (input: { email: string }) => Promise<void>;
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
        onPasswordReset={onPasswordReset}
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
  mapsConsentGranted,
  professionals: verifiedProfessionals,
  organizations: verifiedOrganizations,
  isAuthenticated,
  onNavigate,
  onSelectPlace,
  onCycleFilter,
  onLocate,
  onAcceptMaps
}: {
  copy: (typeof copy)[Locale];
  authLabels: (typeof authCopy)[Locale];
  locale: Locale;
  places: Place[];
  selectedFilter: number | null;
  selectedPlace: Place | null;
  locationState: LocationState;
  userLocation: UserLocation | null;
  mapsConsentGranted: boolean;
  professionals: Professional[];
  organizations: Organization[];
  isAuthenticated: boolean;
  onNavigate: (view: ViewId) => void;
  onSelectPlace: (id: string) => void;
  onCycleFilter: () => void;
  onLocate: () => void;
  onAcceptMaps: () => void;
}) {
  return (
    <div className="dashboard-grid">
      <section className="hero-copy">
        <h2>{c.greeting}</h2>
        <p>{c.homeIntro}</p>
      </section>

      <div className="home-layout">
        <div className="home-map-column">
          <MapPanel
            title={c.sensoryMap}
            subtitle={c.mapArea}
            locale={locale}
            copyText={c}
            places={availablePlaces}
            filters={c.filters}
            selectedFilter={selectedFilter}
            selectedPlace={selectedPlace}
            locationState={locationState}
            userLocation={userLocation}
            mapsConsentGranted={mapsConsentGranted}
            onSelectPlace={onSelectPlace}
            onCycleFilter={onCycleFilter}
            onLocate={onLocate}
            onAcceptMaps={onAcceptMaps}
            onOpen={() => onNavigate("consult")}
          />

          {isAuthenticated ? (
            <section className="panel draft-panel">
              <PanelHeading title={c.contributionTitle} action={c.nav.contribute} onAction={() => onNavigate("contribute")} />
              <div className="draft-layout">
                <PlaceSymbol large />
                <div>
                  <h3>{c.noPlacesTitle}</h3>
                  <p>{c.noPlacesBody}</p>
                  <span>
                    <ShieldCheck aria-hidden="true" size={15} />
                    {c.tutorReview}
                  </span>
                </div>
              </div>
              <button type="button" className="primary-action" onClick={() => onNavigate("contribute")}>
                {c.nav.contribute}
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
              {verifiedProfessionals.length > 0 || verifiedOrganizations.length > 0 ? (
                <>
                  {verifiedProfessionals.slice(0, 1).map((professional) => (
                    <VerifiedMiniCard
                      key={professional.id}
                      title={professional.name}
                      meta={`${professional.license} · ${professional.distance}`}
                      initials={professional.initials}
                      label={c.verified}
                    />
                  ))}
                  {verifiedOrganizations.map((organization) => (
                    <VerifiedMiniCard
                      key={organization.id}
                      title={organization.name}
                      meta={`${organization.registry} · ${organization.distance}`}
                      initials={organization.initials}
                      label={c.verified}
                    />
                  ))}
                </>
              ) : (
                <EmptyState icon={ShieldCheck} title={c.verifiedTitle} body={c.noVerifiedProfiles} />
              )}
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
        </div>

        <div className="home-side-column">
          <section className="panel saved-panel">
            <PanelHeading title={c.availablePlaces} action={c.viewAll} onAction={() => onNavigate("consult")} />
            <div className="saved-list">
              {availablePlaces.length > 0 ? (
                availablePlaces.map((place) => (
                  <button key={place.id} type="button" className="saved-row" onClick={() => onNavigate("consult")}>
                    <PlaceSymbol />
                    <span>
                      <strong>{place.name}</strong>
                      <small>
                        <span className="saved-place-area">{place.area}</span>
                        <span className="saved-place-separator"> · </span>
                        <span className="saved-place-distance">{place.distance}</span>
                      </small>
                    </span>
                    <em>{place.hasSpectrumData ? place.score.toFixed(1) : "Spectrum"}</em>
                    <ChevronRight aria-hidden="true" size={16} />
                  </button>
                ))
              ) : (
                <EmptyState icon={MapPin} title={c.noPlacesTitle} body={c.noPlacesBody} />
              )}
            </div>
          </section>

          {isAuthenticated ? (
            <section className="panel profile-panel">
              <PanelHeading title={c.profilesTitle} action={c.nav.profiles} onAction={() => onNavigate("profiles")} />
              <div className="child-list">
                {childProfiles.length > 0 ? (
                  childProfiles.map((profile) => (
                    <div key={profile.alias} className="child-chip">
                      <span className="avatar">{profile.alias.slice(0, 1)}</span>
                      <div>
                        <strong>{profile.alias}</strong>
                        <small>
                          {profile.age} · {profile.state}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={UsersRound} title={c.childProfile} body={c.noChildProfiles} />
                )}
              </div>
              <p className="fineprint">{locale === "en" ? c.childApproval : c.childApproval}</p>
            </section>
          ) : null}
        </div>
      </div>
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
  mapsConsentGranted,
  isAuthenticated,
  onQuery,
  onFilter,
  onSelectPlace,
  onNavigate,
  onCycleFilter,
  onLocate,
  onAcceptMaps,
  onRequireAuth
}: {
  copy: (typeof copy)[Locale];
  authLabels: (typeof authCopy)[Locale];
  locale: Locale;
  query: string;
  selectedFilter: number | null;
  selectedPlace: Place | null;
  places: Place[];
  locationState: LocationState;
  userLocation: UserLocation | null;
  mapsConsentGranted: boolean;
  isAuthenticated: boolean;
  onQuery: (query: string) => void;
  onFilter: (index: number) => void;
  onSelectPlace: (id: string) => void;
  onNavigate: (view: ViewId) => void;
  onCycleFilter: () => void;
  onLocate: () => void;
  onAcceptMaps: () => void;
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
        locale={locale}
        copyText={c}
        places={visiblePlaces}
        filters={c.filters}
        selectedFilter={selectedFilter}
        selectedPlace={selectedPlace}
        locationState={locationState}
        userLocation={userLocation}
        mapsConsentGranted={mapsConsentGranted}
        onSelectPlace={onSelectPlace}
        onCycleFilter={onCycleFilter}
        onLocate={onLocate}
        onAcceptMaps={onAcceptMaps}
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
        <PanelHeading title={c.results} />
        <div className="saved-list">
          {visiblePlaces.length > 0 ? (
            visiblePlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                className="saved-row"
                data-active={selectedPlace?.id === place.id}
                onClick={() => onSelectPlace(place.id)}
              >
                <PlaceSymbol />
                <span>
                  <strong>{place.name}</strong>
                  <small>
                    <span className="saved-place-area">{place.city}</span>
                    <span className="saved-place-separator"> · </span>
                    <span className="saved-place-distance">{place.distance}</span>
                  </small>
                </span>
                <em>{place.score.toFixed(1)}</em>
              </button>
            ))
          ) : (
            <EmptyState icon={MapPin} title={c.noPlacesTitle} body={c.noPlacesBody} />
          )}
        </div>
      </section>
    </div>
  );
}

function formatEventDate(locale: Locale, value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function EventHistoryView({
  locale,
  history,
  loading,
  query,
  photoUrls,
  draft,
  ratings,
  photo,
  statusMessage,
  isSubmitting,
  isAuthenticated,
  userLocation,
  onQuery,
  onDraft,
  onRating,
  onPhoto,
  onSubmit,
  onRequireAuth,
  onLocate
}: {
  locale: Locale;
  history: EventHistorySearchResult;
  loading: boolean;
  query: string;
  photoUrls: Record<string, string>;
  draft: EventHistoryDraft;
  ratings: Record<EventExperienceCriterion, number>;
  photo: File | null;
  statusMessage: string | null;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  userLocation: UserLocation | null;
  onQuery: (value: string) => void;
  onDraft: (patch: Partial<EventHistoryDraft>) => void;
  onRating: (key: EventExperienceCriterion, value: number) => void;
  onPhoto: (file: File | null) => void;
  onSubmit: () => void;
  onRequireAuth: () => void;
  onLocate: () => void;
}) {
  const labels = eventCopy[locale];
  const seriesById = useMemo(() => new Map(history.series.map((series) => [series.id, series])), [history.series]);
  const editionsById = useMemo(() => new Map(history.editions.map((edition) => [edition.id, edition])), [history.editions]);
  const zonesById = useMemo(() => new Map(history.zones.map((zone) => [zone.id, zone])), [history.zones]);
  const filteredEditions = draft.eventSeriesId
    ? history.editions.filter((edition) => edition.eventSeriesId === draft.eventSeriesId)
    : history.editions;
  const filteredZones = draft.eventEditionId
    ? history.zones.filter((zone) => zone.eventEditionId === draft.eventEditionId)
    : history.zones;

  return (
    <div className="event-history-grid">
      <section className="event-history-main">
        <div className="event-module-header">
          <div className="event-module-title">
            <CalendarDays aria-hidden="true" size={28} />
            <div>
              <span>{labels.experiences}</span>
              <h2>{labels.title}</h2>
              <p>{labels.intro}</p>
            </div>
          </div>
          <div className="event-search-row">
            <label className="event-search-control">
              <Search aria-hidden="true" size={18} />
              <input value={query} placeholder={labels.searchPlaceholder} onChange={(event) => onQuery(event.target.value)} />
            </label>
            <button type="button" className="secondary-action event-refresh-action" onClick={onLocate}>
              <LocateFixed aria-hidden="true" size={16} />
              {userLocation ? labels.refresh : copy[locale].mapLocationControl}
            </button>
          </div>
        </div>

        {history.series.length === 0 ? (
          <EmptyState icon={CalendarDays} title={loading ? copy[locale].mapLocating : labels.noEventsTitle} body={labels.noEventsBody} />
        ) : (
          <div className="event-card-list">
            {history.series.map((series) => {
              const seriesEditions = history.editions.filter((edition) => edition.eventSeriesId === series.id);
              const seriesZones = history.zones.filter((zone) => zone.eventSeriesId === series.id);
              const seriesExperiences = history.experiences.filter((experience) => experience.eventSeriesId === series.id);
              return (
                <article className="panel event-series-card" key={series.id}>
                  <div className="event-card-heading">
                    <div>
                      <span>{labels.categories[series.category]}</span>
                      <h3>{series.title}</h3>
                      <p>{series.city}</p>
                    </div>
                    <strong>{seriesExperiences.length}</strong>
                  </div>
                  {series.description ? <p>{series.description}</p> : null}
                  <div className="event-meta-row">
                    <span>{seriesEditions.length} {labels.editions}</span>
                    <span>{seriesZones.length} {labels.zones}</span>
                    <span>{seriesExperiences.length} {labels.experiences.toLowerCase()}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {history.experiences.length > 0 ? (
          <div className="event-experience-list">
            <PanelHeading title={labels.experiences} />
            {history.experiences.map((experience) => {
              const series = seriesById.get(experience.eventSeriesId);
              const edition = editionsById.get(experience.eventEditionId);
              const zone = zonesById.get(experience.eventZoneId);
              const photoUrl = photoUrls[experience.photoPath];
              return (
                <article className="panel event-experience-card" key={experience.id}>
                  <div className="event-photo-frame">
                    {photoUrl ? <img src={photoUrl} alt="" /> : <Camera aria-hidden="true" size={28} />}
                  </div>
                  <div className="event-experience-copy">
                    <span>
                      <Clock3 aria-hidden="true" size={14} />
                      {formatEventDate(locale, experience.observedAt)}
                    </span>
                    <h3>{series?.title ?? edition?.title ?? labels.title}</h3>
                    <p>{zone?.name ?? edition?.title ?? ""}</p>
                    <p>{experience.description}</p>
                    <div className="event-rating-row">
                      {(Object.entries(labels.criteria) as Array<[EventExperienceCriterion, string]>).map(([key, label]) => (
                        <span key={key}>
                          {label}: {experience.ratings[key]}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="panel event-form-panel">
        <PanelHeading title={labels.createTitle} />
        <div className="report-form">
          <div className="event-form-section">
            <label>
              <span>{labels.existingSeries}</span>
              <select
                value={draft.eventSeriesId}
                onChange={(event) => onDraft({ eventSeriesId: event.target.value, eventEditionId: "", eventZoneId: "" })}
              >
                <option value="">{labels.newOption}</option>
                {history.series.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.title}
                  </option>
                ))}
              </select>
            </label>
            {!draft.eventSeriesId ? (
              <div className="compact-form-grid event-creation-grid">
                <label>
                  <span>{labels.catalogTitle}</span>
                  <input value={draft.seriesTitle} onChange={(event) => onDraft({ seriesTitle: event.target.value })} />
                </label>
                <label>
                  <span>{labels.city}</span>
                  <input value={draft.seriesCity} onChange={(event) => onDraft({ seriesCity: event.target.value })} />
                </label>
                <label>
                  <span>{labels.type}</span>
                  <select
                    value={draft.seriesCategory}
                    onChange={(event) => onDraft({ seriesCategory: event.target.value as EventCategory })}
                  >
                    {eventCategories.map((category) => (
                      <option key={category} value={category}>
                        {labels.categories[category]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{labels.description}</span>
                  <input value={draft.seriesDescription} onChange={(event) => onDraft({ seriesDescription: event.target.value })} />
                </label>
              </div>
            ) : null}
          </div>

          <div className="event-form-section">
            <label>
              <span>{labels.existingEdition}</span>
              <select
                value={draft.eventEditionId}
                onChange={(event) => onDraft({ eventEditionId: event.target.value, eventZoneId: "" })}
              >
                <option value="">{labels.newOption}</option>
                {filteredEditions.map((edition) => (
                  <option key={edition.id} value={edition.id}>
                    {edition.title}
                  </option>
                ))}
              </select>
            </label>
            {!draft.eventEditionId ? (
              <div className="compact-form-grid event-creation-grid">
                <label>
                  <span>{labels.edition}</span>
                  <input value={draft.editionTitle} onChange={(event) => onDraft({ editionTitle: event.target.value })} />
                </label>
                <label>
                  <span>{labels.year}</span>
                  <input
                    type="number"
                    min={1900}
                    max={2200}
                    value={draft.editionYear}
                    onChange={(event) => onDraft({ editionYear: Number(event.target.value) })}
                  />
                </label>
                <label className="span-two">
                  <span>{labels.startsAt}</span>
                  <input
                    type="datetime-local"
                    value={draft.editionStartsAt}
                    onChange={(event) => onDraft({ editionStartsAt: event.target.value })}
                  />
                </label>
                <label className="span-two">
                  <span>{labels.endsAt}</span>
                  <input type="datetime-local" value={draft.editionEndsAt} onChange={(event) => onDraft({ editionEndsAt: event.target.value })} />
                </label>
              </div>
            ) : null}
          </div>

          <div className="event-form-section">
            <label>
              <span>{labels.existingZone}</span>
              <select value={draft.eventZoneId} onChange={(event) => onDraft({ eventZoneId: event.target.value })}>
                <option value="">{labels.newOption}</option>
                {filteredZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </label>
            {!draft.eventZoneId ? (
              <div className="compact-form-grid event-creation-grid">
                <label>
                  <span>{labels.zone}</span>
                  <input value={draft.zoneName} onChange={(event) => onDraft({ zoneName: event.target.value })} />
                </label>
                <label>
                  <span>{labels.radiusMeters}</span>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={draft.zoneRadiusMeters}
                    onChange={(event) => onDraft({ zoneRadiusMeters: Number(event.target.value) })}
                  />
                </label>
                <label className="span-two">
                  <span>{labels.zoneDescription}</span>
                  <input value={draft.zoneDescription} onChange={(event) => onDraft({ zoneDescription: event.target.value })} />
                </label>
              </div>
            ) : null}
          </div>

          <div className="event-form-section">
            <label>
              <span>{labels.observedAt}</span>
              <input type="datetime-local" value={draft.observedAt} onChange={(event) => onDraft({ observedAt: event.target.value })} />
            </label>
            <label>
              <span>{labels.description}</span>
              <textarea value={draft.description} onChange={(event) => onDraft({ description: event.target.value })} />
            </label>
            <label className="file-input-label">
              <Camera aria-hidden="true" size={18} />
              <span>{photo?.name ?? labels.photo}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => onPhoto(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="rating-stack">
            {(Object.entries(labels.criteria) as Array<[EventExperienceCriterion, string]>).map(([key, label]) => (
              <label className="report-slider" key={key}>
                <span>{label}</span>
                <strong>{ratings[key]}</strong>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={ratings[key]}
                  onChange={(event) => onRating(key, Number(event.target.value))}
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            className="primary-action"
            disabled={isSubmitting}
            onClick={isAuthenticated ? onSubmit : onRequireAuth}
          >
            <Send aria-hidden="true" size={17} />
            {isSubmitting ? "..." : isAuthenticated ? labels.submit : authCopy[locale].signInToContinue}
          </button>
          {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
          {!userLocation ? (
            <button type="button" className="secondary-action" onClick={onLocate}>
              <MapPinned aria-hidden="true" size={16} />
              {copy[locale].mapLocationControl}
            </button>
          ) : null}
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
  uploadedFiles,
  draft,
  statusMessage,
  isSubmitting,
  selectedPlace,
  onRating,
  onNotes,
  onFiles,
  onDraft,
  onSubmit
}: {
  copy: (typeof copy)[Locale];
  locale: Locale;
  ratings: Record<SensoryKey, number>;
  notes: string;
  uploadedFiles: File[];
  draft: ContributionDraft;
  statusMessage: string | null;
  isSubmitting: boolean;
  selectedPlace: Place | null;
  onRating: (key: SensoryKey, value: number) => void;
  onNotes: (notes: string) => void;
  onFiles: (files: File[]) => void;
  onDraft: (draft: Partial<ContributionDraft>) => void;
  onSubmit: () => void;
}) {
  const ac = authCopy[locale];
  const isCreatingNewPlace = draft.createNewPlace || !selectedPlace;

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
            <strong>{isCreatingNewPlace ? ac.createNewPlace : (selectedPlace?.name ?? ac.createNewPlace)}</strong>
            <span>
              {isCreatingNewPlace ? ac.placeAddress : `${selectedPlace?.area ?? ""} · ${selectedPlace?.quietDb ?? ""}`}
            </span>
          </div>
          <em>{c.pendingModeration}</em>
        </div>

        <section className="inline-form-block">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isCreatingNewPlace}
              disabled={!selectedPlace}
              onChange={(event) => onDraft({ createNewPlace: event.target.checked })}
            />
            <span>{isCreatingNewPlace ? ac.createNewPlace : ac.useSelectedPlace}</span>
          </label>
          {isCreatingNewPlace ? (
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
  const [cardOpen, setCardOpen] = useState(false);

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
        <button type="button" className="primary-action" onClick={() => setCardOpen(true)}>
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
        <p>{c.trustedContactBody}</p>
        <button type="button" className="secondary-action" disabled title={c.unavailableAction}>
          {c.contact}
        </button>
      </section>
      {cardOpen ? (
        <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-label={c.supportCard}>
          <div className="auth-modal support-card-dialog">
            <LifeBuoy aria-hidden="true" size={30} />
            <h3>{c.supportCard}</h3>
            <blockquote>{c.supportMessage}</blockquote>
            <button type="button" className="secondary-action" onClick={() => setCardOpen(false)}>
              {c.closeNotifications}
            </button>
          </div>
        </div>
      ) : null}
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
  onNavigate,
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
  onNavigate: (view: ViewId) => void;
  onRefreshProfile: () => Promise<void>;
}) {
  const [childAlias, setChildAlias] = useState("");
  const [childAge, setChildAge] = useState<"0-5" | "6-9" | "10-13" | "14-17" | "">("");
  const [childStatus, setChildStatus] = useState<string | null>(null);
  const [isSavingChild, setIsSavingChild] = useState(false);

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

  return (
    <div className="profiles-grid">
      <section className="section-intro">
        <h2>{c.profilesTitle}</h2>
        <p>{c.profilesIntro}</p>
      </section>

      <section className="panel profiles-public-trust">
        <PanelHeading title={c.verifiedTitle} action={c.viewAll} onAction={() => onNavigate("verified")} />
        <div className="trust-strip">
          {verifiedProfessionals.length > 0 || verifiedOrganizations.length > 0 ? (
            <>
              {verifiedProfessionals.map((professional) => (
                <VerifiedMiniCard
                  key={professional.id}
                  title={professional.name}
                  meta={`${professional.license} · ${professional.distance}`}
                  initials={professional.initials}
                  label={c.verified}
                />
              ))}
              {verifiedOrganizations.map((organization) => (
                <VerifiedMiniCard
                  key={organization.id}
                  title={organization.name}
                  meta={`${organization.registry} · ${organization.distance}`}
                  initials={organization.initials}
                  label={c.verified}
                />
              ))}
            </>
          ) : (
            <EmptyState icon={ShieldCheck} title={c.verifiedTitle} body={c.noVerifiedProfiles} />
          )}
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
          {childProfiles.length > 0 ? (
            childProfiles.map((profile) => (
              <article key={profile.alias} className="child-chip">
                <span className="avatar">{profile.alias.slice(0, 1)}</span>
                <div>
                  <strong>{profile.alias}</strong>
                  <small>
                    {profile.age} anys · {profile.state}
                  </small>
                </div>
              </article>
            ))
          ) : (
            <EmptyState icon={UsersRound} title={c.childProfile} body={c.noChildProfiles} />
          )}
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

      <section className="panel sensory-profile-panel">
        <PanelHeading title={c.sensoryProfile} />
        <EmptyState icon={SlidersHorizontal} title={c.sensoryProfile} body={c.noSensoryProfile} />
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
        {verifiedProfessionals.length > 0 || verifiedOrganizations.length > 0 ? (
          <>
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
                <button type="button" className="secondary-action" disabled title={c.unavailableAction}>
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
                <button type="button" className="secondary-action" disabled title={c.unavailableAction}>
                  {c.contact}
                </button>
              </article>
            ))}
          </>
        ) : (
          <article className="panel verified-profile-card">
            <EmptyState icon={ShieldCheck} title={c.verifiedTitle} body={c.noVerifiedProfiles} />
          </article>
        )}
      </section>

      <aside className="panel evidence-panel">
        <Lock aria-hidden="true" size={24} />
        <h3>{c.privateEvidence}</h3>
        <p>{c.verifiedIntro}</p>
      </aside>
    </div>
  );
}

function MapPanel({
  title,
  subtitle,
  locale,
  copyText,
  places: visiblePlaces,
  filters,
  selectedFilter,
  selectedPlace,
  locationState,
  userLocation,
  mapsConsentGranted,
  tall = false,
  onSelectPlace,
  onCycleFilter,
  onLocate,
  onAcceptMaps,
  onOpen
}: {
  title: string;
  subtitle: string;
  locale: Locale;
  copyText: (typeof copy)[Locale];
  places: Place[];
  filters: string[];
  selectedFilter: number | null;
  selectedPlace: Place | null;
  locationState: LocationState;
  userLocation: UserLocation | null;
  mapsConsentGranted: boolean;
  tall?: boolean;
  onSelectPlace: (id: string) => void;
  onCycleFilter: () => void;
  onLocate: () => void;
  onAcceptMaps: () => void;
  onOpen?: () => void;
}) {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const privacyLabels = privacyCopy[locale];
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
    !mapsConsentGranted ? privacyLabels.mapConsentLabel : googleMapsKey ? "Google Maps" : "Google Maps key missing",
    activeFilterLabel,
    layerLabels[mapLayer]
  ].filter(Boolean).join(" · ");
  const hasMapAnchor = Boolean(selectedPlace || userLocation || visiblePlaces.length > 0);

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
      <div className="map-canvas" role="region" aria-label={title}>
        {!mapsConsentGranted ? (
          <MapConsentCanvas
            title={privacyLabels.mapBlockedTitle}
            body={privacyLabels.mapBlockedBody}
            action={privacyLabels.enableMaps}
            label={providerLabel}
            onAcceptMaps={onAcceptMaps}
          />
        ) : googleMapsKey ? (
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
        ) : !hasMapAnchor ? (
          <EmptyMapCanvas body={copyText.noPlacesBody} label={providerLabel} />
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
            <strong>{locationState === "located" ? copyText.mapYourLocation : (selectedPlace?.area ?? copyText.noPlacesTitle)}</strong>
          </div>
          <em>{locationState === "located" ? layerLabels[mapLayer] : (selectedPlace?.quietDb ?? layerLabels[mapLayer])}</em>
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

function MapConsentCanvas({
  title,
  body,
  action,
  label,
  onAcceptMaps
}: {
  title: string;
  body: string;
  action: string;
  label: string;
  onAcceptMaps: () => void;
}) {
  return (
    <>
      <div className="map-consent-layer">
        <MapPin aria-hidden="true" size={34} />
        <div>
          <strong>{title}</strong>
          <p>{body}</p>
        </div>
        <button type="button" className="primary-action map-consent-action" onClick={onAcceptMaps}>
          {action}
        </button>
      </div>
      <span className="map-provider-note">{label}</span>
    </>
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
  selectedPlace: Place | null;
  userLocation: UserLocation | null;
  userLocationLabel: string;
  onSelectPlace: (id: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const markers: GoogleMarkerInstance[] = [];

    setLoadFailed(false);
    loadGoogleMaps(apiKey)
      .then((google) => {
        if (cancelled || !mapElementRef.current) {
          return;
        }

        const map = new google.maps.Map(mapElementRef.current, {
          center: userLocation ?? selectedPlace?.position ?? { lat: 41.3851, lng: 2.1734 },
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
          const active = selectedPlace?.id === place.id;
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
        } else if (selectedPlace) {
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
  selectedPlace: Place | null;
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
          data-active={selectedPlace?.id === place.id}
          style={pinLayout[index % pinLayout.length]}
          aria-label={place.name}
          aria-pressed={selectedPlace?.id === place.id}
          onClick={() => onSelectPlace(place.id)}
        />
      ))}
      {userLocation ? <span className="user-location-pin" aria-label={userLocationLabel} /> : null}
      <span className="map-provider-note">{label}</span>
    </>
  );
}

function EmptyMapCanvas({ body, label }: { body: string; label: string }) {
  return (
    <>
      <div className="empty-map-layer">
        <MapPin aria-hidden="true" size={34} />
        <p>{body}</p>
      </div>
      <span className="map-provider-note">{label}</span>
    </>
  );
}

function criterionValueForUi(place: Place, key: SensoryKey) {
  const criterion = key === "density" ? "crowd" : key === "light" ? "lighting" : key === "wait" ? "waitingTime" : "noise";
  const value = place.criterionAverages?.[criterion];
  return typeof value === "number" ? Math.max(1, Math.min(5, Math.round(value))) : null;
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
  place: Place | null;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onContribute: () => void;
}) {
  if (!place) {
    return (
      <aside className="panel place-detail">
        <PlaceSymbol large />
        <h3>{c.noPlacesTitle}</h3>
        <p>{c.noPlacesBody}</p>
        {isAuthenticated ? (
          <button type="button" className="primary-action" onClick={onContribute}>
            <Plus aria-hidden="true" size={17} />
            {c.nav.contribute}
          </button>
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

  return (
    <aside className="panel place-detail">
      <PlaceSymbol large />
      <h3>{place.name}</h3>
      <p>
        {place.area} · {place.city}
      </p>
      {place.hasSpectrumData ? (
        <div className="score-line">
          <strong>{place.score.toFixed(1)}</strong>
          <RatingStars value={Math.round(place.score)} />
        </div>
      ) : (
        <div className="score-line no-spectrum-score">
          <strong>{c.noSpectrumRatings}</strong>
        </div>
      )}
      {place.description ? <p>{place.description}</p> : null}
      {isAuthenticated ? (
        <>
          {place.hasSpectrumData ? (
            <div className="metric-list">
              {sensoryKeys.map((item) => {
                const value = criterionValueForUi(place, item.key);
                return (
                  <div key={item.key}>
                    <span>{sensoryLabels[locale][item.key]}</span>
                    <strong>{value ? sensoryWords[locale][item.key][value - 1] : c.noSpectrumRatings}</strong>
                  </div>
                );
              })}
            </div>
          ) : null}
          <div className="detail-actions">
            <button type="button" className="secondary-action" disabled title={c.unavailableAction}>
              <Bookmark aria-hidden="true" size={17} />
              {c.favorite}
            </button>
            <button type="button" className="secondary-action" disabled title={c.unavailableAction}>
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

function VerifiedMiniCard({ title, meta, initials, label }: { title: string; meta: string; initials: string; label: string }) {
  return (
    <article className="verified-mini">
      <span className="avatar">{initials}</span>
      <strong>{title}</strong>
      <small>{meta}</small>
      <VerifiedBadge label={label} />
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
