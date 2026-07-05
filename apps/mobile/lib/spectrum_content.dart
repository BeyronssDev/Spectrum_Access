import 'package:flutter/material.dart';

enum LocaleOption {
  ca('CA'),
  es('ES'),
  en('EN');

  const LocaleOption(this.label);
  final String label;
}

enum MobileTab { consult, events, contribute, support, profiles, admin }

enum SensoryKey { noise, density, light, wait }

enum EventSensoryKey {
  noise,
  crowd,
  lighting,
  waitingTime,
  temperature,
  perceivedSafety,
  exitEase,
}

class PlaceSummary {
  const PlaceSummary({
    required this.id,
    required this.source,
    required this.name,
    required this.area,
    required this.city,
    required this.category,
    required this.score,
    required this.distance,
    required this.quietDb,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.criterionAverages = const {},
    this.spectrumPlaceId,
    this.googlePlaceId,
    this.hasSpectrumData = true,
  });

  final String id;
  final String source;
  final String? spectrumPlaceId;
  final String? googlePlaceId;
  final String name;
  final String area;
  final String city;
  final String category;
  final double score;
  final String distance;
  final String quietDb;
  final String description;
  final double latitude;
  final double longitude;
  final Map<SensoryKey, double> criterionAverages;
  final bool hasSpectrumData;

  PlaceSummary copyWith({
    String? distance,
    Map<SensoryKey, double>? criterionAverages,
    String? spectrumPlaceId,
  }) {
    return PlaceSummary(
      id: id,
      source: source,
      spectrumPlaceId: spectrumPlaceId ?? this.spectrumPlaceId,
      googlePlaceId: googlePlaceId,
      name: name,
      area: area,
      city: city,
      category: category,
      score: score,
      distance: distance ?? this.distance,
      quietDb: quietDb,
      description: description,
      latitude: latitude,
      longitude: longitude,
      criterionAverages: criterionAverages ?? this.criterionAverages,
      hasSpectrumData: hasSpectrumData,
    );
  }
}

class VerifiedProfile {
  const VerifiedProfile({
    required this.name,
    required this.kind,
    required this.identifier,
    required this.detail,
    required this.distance,
    required this.latitude,
    required this.longitude,
    required this.initials,
    required this.icon,
  });

  final String name;
  final String kind;
  final String identifier;
  final String detail;
  final String distance;
  final double latitude;
  final double longitude;
  final String initials;
  final IconData icon;

  VerifiedProfile copyWith({String? distance}) {
    return VerifiedProfile(
      name: name,
      kind: kind,
      identifier: identifier,
      detail: detail,
      distance: distance ?? this.distance,
      latitude: latitude,
      longitude: longitude,
      initials: initials,
      icon: icon,
    );
  }
}

class EventSeriesSummary {
  const EventSeriesSummary({
    required this.id,
    required this.title,
    required this.category,
    required this.city,
    required this.description,
  });

  final String id;
  final String title;
  final String category;
  final String city;
  final String description;
}

class EventEditionSummary {
  const EventEditionSummary({
    required this.id,
    required this.eventSeriesId,
    required this.title,
    required this.year,
    required this.startsAt,
    required this.endsAt,
  });

  final String id;
  final String eventSeriesId;
  final String title;
  final int year;
  final String startsAt;
  final String endsAt;
}

class EventZoneSummary {
  const EventZoneSummary({
    required this.id,
    required this.eventSeriesId,
    required this.eventEditionId,
    required this.name,
    required this.description,
    required this.latitude,
    required this.longitude,
    required this.radiusMeters,
  });

  final String id;
  final String eventSeriesId;
  final String eventEditionId;
  final String name;
  final String description;
  final double latitude;
  final double longitude;
  final double radiusMeters;
}

class EventExperienceSummary {
  const EventExperienceSummary({
    required this.id,
    required this.eventSeriesId,
    required this.eventEditionId,
    required this.eventZoneId,
    required this.observedAt,
    required this.ratings,
    required this.description,
    required this.photoPath,
  });

  final String id;
  final String eventSeriesId;
  final String eventEditionId;
  final String eventZoneId;
  final String observedAt;
  final Map<EventSensoryKey, double> ratings;
  final String description;
  final String photoPath;
}

class EventHistorySummary {
  const EventHistorySummary({
    this.series = const [],
    this.editions = const [],
    this.zones = const [],
    this.experiences = const [],
  });

  final List<EventSeriesSummary> series;
  final List<EventEditionSummary> editions;
  final List<EventZoneSummary> zones;
  final List<EventExperienceSummary> experiences;
}

class ChildProfile {
  const ChildProfile({
    required this.alias,
    required this.age,
    required this.state,
  });

  final String alias;
  final String age;
  final String state;
}

class AppCopy {
  const AppCopy({
    required this.appName,
    required this.subtitle,
    required this.betaLabel,
    required this.home,
    required this.consult,
    required this.events,
    required this.contribute,
    required this.support,
    required this.profiles,
    required this.greeting,
    required this.homeIntro,
    required this.sessionStatus,
    required this.darkMode,
    required this.lightMode,
    required this.focusMode,
    required this.focusActive,
    required this.nearbyMap,
    required this.savedPlaces,
    required this.availablePlaces,
    required this.pendingDraft,
    required this.continueDraft,
    required this.helpCard,
    required this.openHelpCard,
    required this.openFullMap,
    required this.verifiedProfessionals,
    required this.viewAll,
    required this.close,
    required this.search,
    required this.filters,
    required this.placeDetails,
    required this.save,
    required this.report,
    required this.sensoryReport,
    required this.reportIntro,
    required this.uploadImages,
    required this.takePhoto,
    required this.chooseFromGallery,
    required this.selectedImages,
    required this.heicNotice,
    required this.uploadReady,
    required this.removeImage,
    required this.uploadAuthRequired,
    required this.submitSuccess,
    required this.submitFailed,
    required this.notes,
    required this.notesHint,
    required this.submit,
    required this.anonymous,
    required this.pendingModeration,
    required this.tutorReview,
    required this.helpTitle,
    required this.helpIntro,
    required this.communicationMessage,
    required this.trustedContact,
    required this.focusBody,
    required this.profilesTitle,
    required this.profilesIntro,
    required this.adultProfile,
    required this.editUserProfile,
    required this.profilePhoto,
    required this.profileAddress,
    required this.profilePhone,
    required this.profileSaved,
    required this.profileSaveFailed,
    required this.profileNameRequired,
    required this.saveProfile,
    required this.tutorProfile,
    required this.tutorProfileBody,
    required this.childProfile,
    required this.sensoryProfile,
    required this.sensoryProfileBody,
    required this.trustedContactBody,
    required this.license,
    required this.registry,
    required this.contact,
    required this.verified,
    required this.actionUnavailable,
    required this.noSpectrumRatings,
    required this.noPlacesTitle,
    required this.noPlacesBody,
    required this.noVerifiedProfiles,
    required this.noChildProfiles,
    required this.createPlace,
    required this.placeName,
    required this.placeCity,
    required this.placeAddress,
    required this.placeDescription,
    required this.locationRequiredForPlace,
    required this.eventHistoryTitle,
    required this.eventHistoryIntro,
    required this.noEventsTitle,
    required this.noEventsBody,
    required this.eventExperienceTitle,
    required this.eventSeriesName,
    required this.eventEditionName,
    required this.eventZoneName,
    required this.eventObservedAt,
    required this.eventPhoto,
    required this.eventDescription,
    required this.eventPhotoRequired,
    required this.eventLocationRequired,
    required this.eventSubmitSuccess,
    required this.eventSubmitFailed,
  });

  final String appName;
  final String subtitle;
  final String betaLabel;
  final String home;
  final String consult;
  final String events;
  final String contribute;
  final String support;
  final String profiles;
  final String greeting;
  final String homeIntro;
  final String sessionStatus;
  final String darkMode;
  final String lightMode;
  final String focusMode;
  final String focusActive;
  final String nearbyMap;
  final String savedPlaces;
  final String availablePlaces;
  final String pendingDraft;
  final String continueDraft;
  final String helpCard;
  final String openHelpCard;
  final String openFullMap;
  final String verifiedProfessionals;
  final String viewAll;
  final String close;
  final String search;
  final List<String> filters;
  final String placeDetails;
  final String save;
  final String report;
  final String sensoryReport;
  final String reportIntro;
  final String uploadImages;
  final String takePhoto;
  final String chooseFromGallery;
  final String selectedImages;
  final String heicNotice;
  final String uploadReady;
  final String removeImage;
  final String uploadAuthRequired;
  final String submitSuccess;
  final String submitFailed;
  final String notes;
  final String notesHint;
  final String submit;
  final String anonymous;
  final String pendingModeration;
  final String tutorReview;
  final String helpTitle;
  final String helpIntro;
  final String communicationMessage;
  final String trustedContact;
  final String focusBody;
  final String profilesTitle;
  final String profilesIntro;
  final String adultProfile;
  final String editUserProfile;
  final String profilePhoto;
  final String profileAddress;
  final String profilePhone;
  final String profileSaved;
  final String profileSaveFailed;
  final String profileNameRequired;
  final String saveProfile;
  final String tutorProfile;
  final String tutorProfileBody;
  final String childProfile;
  final String sensoryProfile;
  final String sensoryProfileBody;
  final String trustedContactBody;
  final String license;
  final String registry;
  final String contact;
  final String verified;
  final String actionUnavailable;
  final String noSpectrumRatings;
  final String noPlacesTitle;
  final String noPlacesBody;
  final String noVerifiedProfiles;
  final String noChildProfiles;
  final String createPlace;
  final String placeName;
  final String placeCity;
  final String placeAddress;
  final String placeDescription;
  final String locationRequiredForPlace;
  final String eventHistoryTitle;
  final String eventHistoryIntro;
  final String noEventsTitle;
  final String noEventsBody;
  final String eventExperienceTitle;
  final String eventSeriesName;
  final String eventEditionName;
  final String eventZoneName;
  final String eventObservedAt;
  final String eventPhoto;
  final String eventDescription;
  final String eventPhotoRequired;
  final String eventLocationRequired;
  final String eventSubmitSuccess;
  final String eventSubmitFailed;
}

class AuthCopy {
  const AuthCopy({
    required this.authTitle,
    required this.authIntro,
    required this.login,
    required this.register,
    required this.personalAccount,
    required this.professionalAccount,
    required this.organizationAccount,
    required this.professionalRegisterIntro,
    required this.organizationRegisterIntro,
    required this.email,
    required this.password,
    required this.confirmPassword,
    required this.showPassword,
    required this.hidePassword,
    required this.birthDate,
    required this.birthDateHint,
    required this.adultGateRequired,
    required this.adultGateUnderage,
    required this.publicName,
    required this.cityOptional,
    required this.continueWithGoogle,
    required this.continueWithApple,
    required this.emailLogin,
    required this.emailRegister,
    required this.signOut,
    required this.publicMode,
    required this.guestName,
    required this.signInRequiredTitle,
    required this.signInRequiredIntro,
    required this.signInToContinue,
    required this.requiredFields,
    required this.invalidEmail,
    required this.passwordMinLength,
    required this.passwordsMismatch,
    required this.forgotPassword,
    required this.passwordResetSent,
    required this.passwordResetFailed,
    required this.professionalFieldsRequired,
    required this.organizationFieldsRequired,
    required this.authFailed,
    required this.authCancelled,
    required this.authProviderDisabled,
    required this.authConfigurationError,
    required this.verificationSent,
    required this.professionalRegistrationSent,
    required this.organizationRegistrationSent,
    required this.verificationRequestFailed,
    required this.retryVerification,
    required this.childAlias,
    required this.childAge,
    required this.createChildProfile,
    required this.childCreated,
    required this.professionalRequestTitle,
    required this.professionalPublicName,
    required this.professionalName,
    required this.licenseNumber,
    required this.professionalCollege,
    required this.specialty,
    required this.organizationName,
    required this.organizationCity,
    required this.organizationDescription,
    required this.organizationWebsite,
    required this.organizationRegistryNumber,
    required this.requestVerification,
    required this.verificationRequested,
  });

  final String authTitle;
  final String authIntro;
  final String login;
  final String register;
  final String personalAccount;
  final String professionalAccount;
  final String organizationAccount;
  final String professionalRegisterIntro;
  final String organizationRegisterIntro;
  final String email;
  final String password;
  final String confirmPassword;
  final String showPassword;
  final String hidePassword;
  final String birthDate;
  final String birthDateHint;
  final String adultGateRequired;
  final String adultGateUnderage;
  final String publicName;
  final String cityOptional;
  final String continueWithGoogle;
  final String continueWithApple;
  final String emailLogin;
  final String emailRegister;
  final String signOut;
  final String publicMode;
  final String guestName;
  final String signInRequiredTitle;
  final String signInRequiredIntro;
  final String signInToContinue;
  final String requiredFields;
  final String invalidEmail;
  final String passwordMinLength;
  final String passwordsMismatch;
  final String forgotPassword;
  final String passwordResetSent;
  final String passwordResetFailed;
  final String professionalFieldsRequired;
  final String organizationFieldsRequired;
  final String authFailed;
  final String authCancelled;
  final String authProviderDisabled;
  final String authConfigurationError;
  final String verificationSent;
  final String professionalRegistrationSent;
  final String organizationRegistrationSent;
  final String verificationRequestFailed;
  final String retryVerification;
  final String childAlias;
  final String childAge;
  final String createChildProfile;
  final String childCreated;
  final String professionalRequestTitle;
  final String professionalPublicName;
  final String professionalName;
  final String licenseNumber;
  final String professionalCollege;
  final String specialty;
  final String organizationName;
  final String organizationCity;
  final String organizationDescription;
  final String organizationWebsite;
  final String organizationRegistryNumber;
  final String requestVerification;
  final String verificationRequested;
}

const appCopies = {
  LocaleOption.ca: AppCopy(
    appName: 'Spectrum Access',
    subtitle: 'Sensory Accessibility',
    betaLabel: 'Beta',
    home: 'Inici',
    consult: 'Consulta',
    events: 'Esdeveniments',
    contribute: 'Aportacions',
    support: 'Ajuda',
    profiles: 'Perfils',
    greeting: 'Benvingut/da',
    homeIntro:
        'Basat en el teu perfil sensorial, et suggerim espais amb baixa densitat acústica i sortides clares.',
    sessionStatus: 'Sessió protegida',
    darkMode: 'Mode fosc',
    lightMode: 'Mode clar',
    focusMode: 'Focus mode',
    focusActive: 'Focus actiu',
    nearbyMap: 'Mapa Sensorial',
    savedPlaces: 'Llocs desats',
    availablePlaces: 'Espais disponibles',
    pendingDraft: 'Esborrany pendent',
    continueDraft: 'Continuar esborrany',
    helpCard: 'Targeta d’ajuda',
    openHelpCard: 'Obrir targeta',
    openFullMap: 'Obrir mapa complet',
    verifiedProfessionals: 'Professionals i associacions verificades',
    viewAll: 'Veure tots',
    close: 'Tancar',
    search: 'Cerca llocs, ciutat o categoria',
    filters: ['Baix soroll', 'Llum suau', 'Poca densitat'],
    placeDetails: 'Fitxa del lloc',
    save: 'Desar',
    report: 'Reportar',
    sensoryReport: 'Aportació sensorial',
    reportIntro:
        'Comparteix l’estat actual del lloc quan ho puguis fer amb calma.',
    uploadImages: 'Pujar imatges',
    takePhoto: 'Càmera',
    chooseFromGallery: 'Galeria',
    selectedImages: 'Imatges seleccionades',
    heicNotice:
        'Les fotos HEIC/HEIF d’iPhone es conservaran amb el seu format i quedaran pendents de moderació.',
    uploadReady: 'Preparada per enviar',
    removeImage: 'Eliminar imatge',
    uploadAuthRequired: 'Has d’iniciar sessió per pujar fotos.',
    submitSuccess: 'Aportació enviada a moderació.',
    submitFailed: 'No s’ha pogut enviar l’aportació. Torna-ho a provar.',
    notes: 'Notes atmosfèriques',
    notesHint: 'Descriu soroll, llum, afluència o espera...',
    submit: 'Enviar aportació',
    anonymous: 'Publicar com a anònim',
    pendingModeration: 'Pendent de moderació',
    tutorReview: 'Revisió del tutor',
    helpTitle: 'Ajuda immediata',
    helpIntro: 'Targeta de comunicació i contacte de confiança.',
    communicationMessage:
        'Soc una persona autista. Ara mateix em costa parlar o respondre. Necessito uns minuts, un lloc tranquil o contactar amb una persona de confiança.',
    trustedContact: 'Contacte de confiança',
    focusBody:
        'Redueix informació secundària i manté només les accions crítiques.',
    profilesTitle: 'Perfils',
    profilesIntro: 'Gestiona les teves dades personals i la foto del perfil.',
    adultProfile: 'El meu perfil',
    editUserProfile: 'Editar perfil',
    profilePhoto: 'Foto de perfil',
    profileAddress: 'Adreça',
    profilePhone: 'Telèfon',
    profileSaved: 'Perfil actualitzat.',
    profileSaveFailed: 'No s’ha pogut actualitzar el perfil.',
    profileNameRequired: 'El nom públic és obligatori.',
    saveProfile: 'Guardar perfil',
    tutorProfile: 'Tutor principal',
    tutorProfileBody:
        'Compte principal que revisa aportacions dels perfils infantils.',
    childProfile: 'Perfil infantil tutelat',
    sensoryProfile: 'Perfil sensorial',
    sensoryProfileBody:
        'Preferències de soroll, llum, afluència i temps d’espera.',
    trustedContactBody: 'Configura un contacte de confiança al teu perfil.',
    license: 'Col·legiat/da',
    registry: 'Registre',
    contact: 'Contactar',
    verified: 'Verificat',
    actionUnavailable: 'Encara no disponible',
    noSpectrumRatings: 'Encara sense valoracions Spectrum',
    noPlacesTitle: 'Encara no hi ha llocs publicats',
    noPlacesBody:
        'Quan facis una aportació real, el lloc i les imatges quedaran pendents de moderació.',
    noVerifiedProfiles:
        'Encara no hi ha professionals o associacions verificades.',
    noChildProfiles: 'Encara no hi ha perfils tutelats.',
    createPlace: 'Crear lloc nou',
    placeName: 'Nom del lloc',
    placeCity: 'Ciutat',
    placeAddress: 'Adreça o zona',
    placeDescription: 'Descripció opcional',
    locationRequiredForPlace:
        'Activa la ubicació per crear un lloc nou des del mòbil.',
    eventHistoryTitle: 'Històric d’esdeveniments',
    eventHistoryIntro:
        'Consulta edicions anteriors i aporta data, hora, foto i estat sensorial.',
    noEventsTitle: 'Encara no hi ha esdeveniments publicats',
    noEventsBody:
        'Quan s’aprovin experiències reals, apareixeran aquí amb zona, foto i hora.',
    eventExperienceTitle: 'Aportar experiència',
    eventSeriesName: 'Nom de l’esdeveniment',
    eventEditionName: 'Edició',
    eventZoneName: 'Zona o plaça',
    eventObservedAt: 'Data i hora',
    eventPhoto: 'Foto del lloc',
    eventDescription: 'Informació observada',
    eventPhotoRequired: 'Afegeix una foto del lloc.',
    eventLocationRequired:
        'Activa la ubicació per proposar la zona amb coordenades reals.',
    eventSubmitSuccess: 'Experiència enviada a moderació.',
    eventSubmitFailed: 'No s’ha pogut enviar l’experiència.',
  ),
  LocaleOption.es: AppCopy(
    appName: 'Spectrum Access',
    subtitle: 'Sensory Accessibility',
    betaLabel: 'Beta',
    home: 'Inicio',
    consult: 'Consulta',
    events: 'Eventos',
    contribute: 'Aportaciones',
    support: 'Ayuda',
    profiles: 'Perfiles',
    greeting: 'Bienvenido/a',
    homeIntro:
        'Según tu perfil sensorial, sugerimos espacios con baja densidad acústica y salidas claras.',
    sessionStatus: 'Sesión protegida',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    focusMode: 'Focus mode',
    focusActive: 'Focus activo',
    nearbyMap: 'Mapa Sensorial',
    savedPlaces: 'Lugares guardados',
    availablePlaces: 'Espacios disponibles',
    pendingDraft: 'Borrador pendiente',
    continueDraft: 'Continuar borrador',
    helpCard: 'Tarjeta de ayuda',
    openHelpCard: 'Abrir tarjeta',
    openFullMap: 'Abrir mapa completo',
    verifiedProfessionals: 'Profesionales y asociaciones verificadas',
    viewAll: 'Ver todos',
    close: 'Cerrar',
    search: 'Busca lugares, ciudad o categoría',
    filters: ['Bajo ruido', 'Luz suave', 'Poca densidad'],
    placeDetails: 'Ficha del lugar',
    save: 'Guardar',
    report: 'Reportar',
    sensoryReport: 'Aportación sensorial',
    reportIntro:
        'Comparte el estado actual del lugar cuando puedas hacerlo con calma.',
    uploadImages: 'Subir imágenes',
    takePhoto: 'Cámara',
    chooseFromGallery: 'Galería',
    selectedImages: 'Imágenes seleccionadas',
    heicNotice:
        'Las fotos HEIC/HEIF de iPhone se conservarán con su formato y quedarán pendientes de moderación.',
    uploadReady: 'Preparada para enviar',
    removeImage: 'Eliminar imagen',
    uploadAuthRequired: 'Debes iniciar sesión para subir fotos.',
    submitSuccess: 'Aportación enviada a moderación.',
    submitFailed: 'No se ha podido enviar la aportación. Inténtalo de nuevo.',
    notes: 'Notas atmosféricas',
    notesHint: 'Describe ruido, luz, afluencia o espera...',
    submit: 'Enviar aportación',
    anonymous: 'Publicar como anónimo',
    pendingModeration: 'Pendiente de moderación',
    tutorReview: 'Revisión del tutor',
    helpTitle: 'Ayuda inmediata',
    helpIntro: 'Tarjeta de comunicación y contacto de confianza.',
    communicationMessage:
        'Soy una persona autista. Ahora mismo me cuesta hablar o responder. Necesito unos minutos, un lugar tranquilo o contactar con una persona de confianza.',
    trustedContact: 'Contacto de confianza',
    focusBody:
        'Reduce información secundaria y mantiene solo las acciones críticas.',
    profilesTitle: 'Perfiles',
    profilesIntro: 'Gestiona tus datos personales y la foto del perfil.',
    adultProfile: 'Mi perfil',
    editUserProfile: 'Editar perfil',
    profilePhoto: 'Foto de perfil',
    profileAddress: 'Dirección',
    profilePhone: 'Teléfono',
    profileSaved: 'Perfil actualizado.',
    profileSaveFailed: 'No se ha podido actualizar el perfil.',
    profileNameRequired: 'El nombre público es obligatorio.',
    saveProfile: 'Guardar perfil',
    tutorProfile: 'Tutor principal',
    tutorProfileBody:
        'Cuenta principal que revisa aportaciones de los perfiles infantiles.',
    childProfile: 'Perfil infantil tutelado',
    sensoryProfile: 'Perfil sensorial',
    sensoryProfileBody:
        'Preferencias de ruido, luz, afluencia y tiempo de espera.',
    trustedContactBody: 'Configura un contacto de confianza en tu perfil.',
    license: 'Colegiado/a',
    registry: 'Registro',
    contact: 'Contactar',
    verified: 'Verificado',
    actionUnavailable: 'Todavía no disponible',
    noSpectrumRatings: 'Todavía sin valoraciones Spectrum',
    noPlacesTitle: 'Todavía no hay lugares publicados',
    noPlacesBody:
        'Cuando hagas una aportación real, el lugar y las imágenes quedarán pendientes de moderación.',
    noVerifiedProfiles:
        'Todavía no hay profesionales o asociaciones verificadas.',
    noChildProfiles: 'Todavía no hay perfiles tutelados.',
    createPlace: 'Crear lugar nuevo',
    placeName: 'Nombre del lugar',
    placeCity: 'Ciudad',
    placeAddress: 'Dirección o zona',
    placeDescription: 'Descripción opcional',
    locationRequiredForPlace:
        'Activa la ubicación para crear un lugar nuevo desde el móvil.',
    eventHistoryTitle: 'Histórico de eventos',
    eventHistoryIntro:
        'Consulta ediciones anteriores y aporta fecha, hora, foto y estado sensorial.',
    noEventsTitle: 'Todavía no hay eventos publicados',
    noEventsBody:
        'Cuando se aprueben experiencias reales, aparecerán aquí con zona, foto y hora.',
    eventExperienceTitle: 'Aportar experiencia',
    eventSeriesName: 'Nombre del evento',
    eventEditionName: 'Edición',
    eventZoneName: 'Zona o plaza',
    eventObservedAt: 'Fecha y hora',
    eventPhoto: 'Foto del lugar',
    eventDescription: 'Información observada',
    eventPhotoRequired: 'Añade una foto del lugar.',
    eventLocationRequired:
        'Activa la ubicación para proponer la zona con coordenadas reales.',
    eventSubmitSuccess: 'Experiencia enviada a moderación.',
    eventSubmitFailed: 'No se ha podido enviar la experiencia.',
  ),
  LocaleOption.en: AppCopy(
    appName: 'Spectrum Access',
    subtitle: 'Sensory Accessibility',
    betaLabel: 'Beta',
    home: 'Dashboard',
    consult: 'Discover',
    events: 'Events',
    contribute: 'Report',
    support: 'Help',
    profiles: 'Profiles',
    greeting: 'Welcome',
    homeIntro:
        'Based on your sensory profile, we suggest spaces with low acoustic density and clear exits.',
    sessionStatus: 'Protected session',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    focusMode: 'Focus mode',
    focusActive: 'Focus active',
    nearbyMap: 'Sensory Map',
    savedPlaces: 'Saved places',
    availablePlaces: 'Available places',
    pendingDraft: 'Pending draft',
    continueDraft: 'Continue draft',
    helpCard: 'Help card',
    openHelpCard: 'Open card',
    openFullMap: 'Open full map',
    verifiedProfessionals: 'Verified professionals and associations',
    viewAll: 'View all',
    close: 'Close',
    search: 'Search places, city or category',
    filters: ['Low noise', 'Soft light', 'Low density'],
    placeDetails: 'Place details',
    save: 'Save',
    report: 'Report',
    sensoryReport: 'Sensory report',
    reportIntro:
        'Share the current state of the place when you can do it calmly.',
    uploadImages: 'Upload images',
    takePhoto: 'Camera',
    chooseFromGallery: 'Gallery',
    selectedImages: 'Selected images',
    heicNotice:
        'iPhone HEIC/HEIF photos keep their format and remain pending moderation.',
    uploadReady: 'Ready to submit',
    removeImage: 'Remove image',
    uploadAuthRequired: 'You must sign in to upload photos.',
    submitSuccess: 'Contribution sent to moderation.',
    submitFailed: 'The contribution could not be submitted. Try again.',
    notes: 'Atmospheric notes',
    notesHint: 'Describe noise, light, crowding or waiting...',
    submit: 'Submit report',
    anonymous: 'Post anonymously',
    pendingModeration: 'Pending moderation',
    tutorReview: 'Tutor review',
    helpTitle: 'Immediate help',
    helpIntro: 'Communication card and trusted contact.',
    communicationMessage:
        'I am autistic. Right now it is hard for me to speak or answer. I need a few minutes, a quiet place or a trusted contact.',
    trustedContact: 'Trusted contact',
    focusBody: 'Reduces secondary information and keeps only critical actions.',
    profilesTitle: 'Profiles',
    profilesIntro: 'Manage your personal details and profile photo.',
    adultProfile: 'My profile',
    editUserProfile: 'Edit profile',
    profilePhoto: 'Profile photo',
    profileAddress: 'Address',
    profilePhone: 'Phone',
    profileSaved: 'Profile updated.',
    profileSaveFailed: 'Profile could not be updated.',
    profileNameRequired: 'Public name is required.',
    saveProfile: 'Save profile',
    tutorProfile: 'Main tutor',
    tutorProfileBody:
        'Main account that reviews contributions from child profiles.',
    childProfile: 'Tutored child profile',
    sensoryProfile: 'Sensory profile',
    sensoryProfileBody: 'Noise, light, crowding and waiting-time preferences.',
    trustedContactBody: 'Configure a trusted contact in your profile.',
    license: 'License',
    registry: 'Registry',
    contact: 'Contact',
    verified: 'Verified',
    actionUnavailable: 'Not available yet',
    noSpectrumRatings: 'No Spectrum ratings yet',
    noPlacesTitle: 'No published places yet',
    noPlacesBody:
        'When you make a real contribution, the place and images will stay pending moderation.',
    noVerifiedProfiles: 'No verified professionals or associations yet.',
    noChildProfiles: 'No tutored profiles yet.',
    createPlace: 'Create new place',
    placeName: 'Place name',
    placeCity: 'City',
    placeAddress: 'Address or area',
    placeDescription: 'Optional description',
    locationRequiredForPlace:
        'Enable location to create a new place from the phone.',
    eventHistoryTitle: 'Event history',
    eventHistoryIntro:
        'Browse previous editions and add date, time, photo and sensory state.',
    noEventsTitle: 'No published events yet',
    noEventsBody:
        'Approved real experiences will appear here with zone, photo and time.',
    eventExperienceTitle: 'Contribute experience',
    eventSeriesName: 'Event name',
    eventEditionName: 'Edition',
    eventZoneName: 'Zone or square',
    eventObservedAt: 'Date and time',
    eventPhoto: 'Place photo',
    eventDescription: 'Observed information',
    eventPhotoRequired: 'Add a place photo.',
    eventLocationRequired:
        'Enable location to propose the zone with real coordinates.',
    eventSubmitSuccess: 'Experience sent to moderation.',
    eventSubmitFailed: 'Could not submit the experience.',
  ),
};

const authCopies = {
  LocaleOption.ca: AuthCopy(
    authTitle: 'Entra a Spectrum Access',
    authIntro:
        'Consulta el mapa sense compte. Registra’t quan vulguis aportar imatges, valorar llocs o gestionar el teu perfil.',
    login: 'Entrar',
    register: 'Crear compte',
    personalAccount: 'Usuari',
    professionalAccount: 'Professional',
    organizationAccount: 'Associació',
    professionalRegisterIntro:
        'El compte es crearà ara, però la verificació professional quedarà pendent fins que un administrador l’aprovi.',
    organizationRegisterIntro:
        'El compte es crearà ara, però la verificació de l’associació quedarà pendent fins que un administrador l’aprovi.',
    email: 'Email',
    password: 'Contrasenya',
    confirmPassword: 'Repeteix la contrasenya',
    showPassword: 'Mostra contrasenya',
    hidePassword: 'Amaga contrasenya',
    birthDate: 'Data de naixement',
    birthDateHint: 'AAAA-MM-DD',
    adultGateRequired: 'Introdueix una data de naixement vàlida.',
    adultGateUnderage:
        'No es pot crear un compte autònom si ets menor de 18 anys.',
    publicName: 'Nom públic',
    cityOptional: 'Ciutat opcional',
    continueWithGoogle: 'Continuar amb Google',
    continueWithApple: 'Continuar amb Apple',
    emailLogin: 'Entrar amb email',
    emailRegister: 'Registrar amb email',
    signOut: 'Tancar sessió',
    publicMode: 'Mode consulta',
    guestName: 'Visitant',
    signInRequiredTitle: 'Inicia sessió per continuar',
    signInRequiredIntro:
        'Pots consultar el mapa i la informació bàsica sense compte. Per aportar contingut o gestionar dades personals cal registrar-se.',
    signInToContinue: 'Iniciar sessió',
    requiredFields: 'Omple els camps obligatoris.',
    invalidEmail: 'Introdueix un email vàlid.',
    passwordMinLength: 'La contrasenya ha de tenir com a mínim 12 caràcters.',
    passwordsMismatch: 'Les contrasenyes no coincideixen.',
    forgotPassword: 'Has oblidat la teva contrasenya?',
    passwordResetSent:
        'Si aquest correu està registrat, rebràs un enllaç per restablir la contrasenya.',
    passwordResetFailed:
        'No s’ha pogut enviar el correu de restabliment. Torna-ho a provar.',
    professionalFieldsRequired:
        'Omple les dades del professional per enviar la verificació.',
    organizationFieldsRequired:
        'Omple el nom, la ciutat i la descripció de l’associació.',
    authFailed: 'No s’ha pogut completar l’autenticació.',
    authCancelled: 'Has cancel·lat l’autenticació.',
    authProviderDisabled: 'No s’ha pogut completar l’autenticació.',
    authConfigurationError: 'No s’ha pogut completar l’autenticació.',
    verificationSent: 'Compte creat. Revisa el correu de verificació.',
    professionalRegistrationSent:
        'Compte creat. La verificació professional queda pendent de revisió.',
    organizationRegistrationSent:
        'Compte creat. La verificació de l’associació queda pendent de revisió.',
    verificationRequestFailed:
        'El compte s’ha creat, però no s’ha pogut enviar la sol·licitud de verificació. Revisa les dades i torna-ho a provar.',
    retryVerification: 'Reintentar verificació',
    childAlias: 'Àlies infantil',
    childAge: 'Franja d’edat',
    createChildProfile: 'Crear perfil tutelat',
    childCreated: 'Perfil tutelat creat.',
    professionalRequestTitle: 'Sol·licitar perfil professional',
    professionalPublicName: 'Nom professional públic',
    professionalName: 'Nom professional',
    licenseNumber: 'Acreditació o número de col·legiat/da',
    professionalCollege: 'Col·legi o entitat professional',
    specialty: 'Especialitat o àmbit',
    organizationName: 'Nom de l’associació',
    organizationCity: 'Ciutat',
    organizationDescription: 'Descripció de l’associació',
    organizationWebsite: 'Web opcional',
    organizationRegistryNumber: 'Número de registre opcional',
    requestVerification: 'Enviar verificació',
    verificationRequested: 'Sol·licitud enviada a revisió.',
  ),
  LocaleOption.es: AuthCopy(
    authTitle: 'Entra en Spectrum Access',
    authIntro:
        'Consulta el mapa sin cuenta. Regístrate cuando quieras aportar imágenes, valorar lugares o gestionar tu perfil.',
    login: 'Entrar',
    register: 'Crear cuenta',
    personalAccount: 'Usuario',
    professionalAccount: 'Profesional',
    organizationAccount: 'Asociación',
    professionalRegisterIntro:
        'La cuenta se creará ahora, pero la verificación profesional quedará pendiente hasta que un administrador la apruebe.',
    organizationRegisterIntro:
        'La cuenta se creará ahora, pero la verificación de la asociación quedará pendiente hasta que un administrador la apruebe.',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Repite la contraseña',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    birthDate: 'Fecha de nacimiento',
    birthDateHint: 'AAAA-MM-DD',
    adultGateRequired: 'Introduce una fecha de nacimiento válida.',
    adultGateUnderage:
        'No se puede crear una cuenta autónoma si eres menor de 18 años.',
    publicName: 'Nombre público',
    cityOptional: 'Ciudad opcional',
    continueWithGoogle: 'Continuar con Google',
    continueWithApple: 'Continuar con Apple',
    emailLogin: 'Entrar con email',
    emailRegister: 'Registrar con email',
    signOut: 'Cerrar sesión',
    publicMode: 'Modo consulta',
    guestName: 'Visitante',
    signInRequiredTitle: 'Inicia sesión para continuar',
    signInRequiredIntro:
        'Puedes consultar el mapa y la información básica sin cuenta. Para aportar contenido o gestionar datos personales hay que registrarse.',
    signInToContinue: 'Iniciar sesión',
    requiredFields: 'Rellena los campos obligatorios.',
    invalidEmail: 'Introduce un email válido.',
    passwordMinLength: 'La contraseña debe tener como mínimo 12 caracteres.',
    passwordsMismatch: 'Las contraseñas no coinciden.',
    forgotPassword: '¿Has olvidado tu contraseña?',
    passwordResetSent:
        'Si este correo está registrado, recibirás un enlace para restablecer la contraseña.',
    passwordResetFailed:
        'No se ha podido enviar el correo de restablecimiento. Inténtalo de nuevo.',
    professionalFieldsRequired:
        'Rellena los datos del profesional para enviar la verificación.',
    organizationFieldsRequired:
        'Rellena el nombre, la ciudad y la descripción de la asociación.',
    authFailed: 'No se ha podido completar la autenticación.',
    authCancelled: 'Has cancelado la autenticación.',
    authProviderDisabled: 'No se ha podido completar la autenticación.',
    authConfigurationError: 'No se ha podido completar la autenticación.',
    verificationSent: 'Cuenta creada. Revisa el correo de verificación.',
    professionalRegistrationSent:
        'Cuenta creada. La verificación profesional queda pendiente de revisión.',
    organizationRegistrationSent:
        'Cuenta creada. La verificación de la asociación queda pendiente de revisión.',
    verificationRequestFailed:
        'La cuenta se ha creado, pero no se ha podido enviar la solicitud de verificación. Revisa los datos e inténtalo de nuevo.',
    retryVerification: 'Reintentar verificación',
    childAlias: 'Alias infantil',
    childAge: 'Franja de edad',
    createChildProfile: 'Crear perfil tutelado',
    childCreated: 'Perfil tutelado creado.',
    professionalRequestTitle: 'Solicitar perfil profesional',
    professionalPublicName: 'Nombre profesional público',
    professionalName: 'Nombre profesional',
    licenseNumber: 'Acreditación o número de colegiado/a',
    professionalCollege: 'Colegio o entidad profesional',
    specialty: 'Especialidad o ámbito',
    organizationName: 'Nombre de la asociación',
    organizationCity: 'Ciudad',
    organizationDescription: 'Descripción de la asociación',
    organizationWebsite: 'Web opcional',
    organizationRegistryNumber: 'Número de registro opcional',
    requestVerification: 'Enviar verificación',
    verificationRequested: 'Solicitud enviada a revisión.',
  ),
  LocaleOption.en: AuthCopy(
    authTitle: 'Enter Spectrum Access',
    authIntro:
        'Browse the map without an account. Register when you want to upload images, rate places or manage your profile.',
    login: 'Sign in',
    register: 'Create account',
    personalAccount: 'User',
    professionalAccount: 'Professional',
    organizationAccount: 'Association',
    professionalRegisterIntro:
        'The account will be created now, but professional verification stays pending until an administrator approves it.',
    organizationRegisterIntro:
        'The account will be created now, but association verification stays pending until an administrator approves it.',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Repeat password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    birthDate: 'Date of birth',
    birthDateHint: 'YYYY-MM-DD',
    adultGateRequired: 'Enter a valid date of birth.',
    adultGateUnderage:
        'You cannot create an independent account if you are under 18.',
    publicName: 'Public name',
    cityOptional: 'Optional city',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    emailLogin: 'Sign in with email',
    emailRegister: 'Register with email',
    signOut: 'Sign out',
    publicMode: 'Browse mode',
    guestName: 'Guest',
    signInRequiredTitle: 'Sign in to continue',
    signInRequiredIntro:
        'You can browse the map and basic place information without an account. To contribute content or manage personal data, registration is required.',
    signInToContinue: 'Sign in',
    requiredFields: 'Fill in the required fields.',
    invalidEmail: 'Enter a valid email.',
    passwordMinLength: 'Password must be at least 12 characters.',
    passwordsMismatch: 'Passwords do not match.',
    forgotPassword: 'Forgot your password?',
    passwordResetSent:
        'If this email is registered, you will receive a password reset link.',
    passwordResetFailed: 'We could not send the reset email. Please try again.',
    professionalFieldsRequired:
        'Fill in the professional details before sending verification.',
    organizationFieldsRequired:
        'Fill in the association name, city and description.',
    authFailed: 'Authentication could not be completed.',
    authCancelled: 'Authentication was cancelled.',
    authProviderDisabled: 'Authentication could not be completed.',
    authConfigurationError: 'Authentication could not be completed.',
    verificationSent: 'Account created. Check the verification email.',
    professionalRegistrationSent:
        'Account created. Professional verification is pending review.',
    organizationRegistrationSent:
        'Account created. Association verification is pending review.',
    verificationRequestFailed:
        'The account was created, but the verification request could not be sent. Review the details and try again.',
    retryVerification: 'Retry verification',
    childAlias: 'Child alias',
    childAge: 'Age range',
    createChildProfile: 'Create tutored profile',
    childCreated: 'Tutored profile created.',
    professionalRequestTitle: 'Request professional profile',
    professionalPublicName: 'Public professional name',
    professionalName: 'Professional name',
    licenseNumber: 'Credential or license number',
    professionalCollege: 'Professional college or entity',
    specialty: 'Specialty or field',
    organizationName: 'Association name',
    organizationCity: 'City',
    organizationDescription: 'Association description',
    organizationWebsite: 'Optional website',
    organizationRegistryNumber: 'Optional registry number',
    requestVerification: 'Send verification',
    verificationRequested: 'Request sent for review.',
  ),
};

class AdminCopy {
  const AdminCopy({
    required this.administration,
    required this.adminIntro,
    required this.refresh,
    required this.currentPermission,
    required this.photosTitle,
    required this.experiencesTitle,
    required this.catalogTitle,
    required this.permissionsTitle,
    required this.noPendingImages,
    required this.noPendingExperiences,
    required this.noPendingCatalog,
    required this.approve,
    required this.reject,
    required this.createEvent,
    required this.createEdition,
    required this.createZone,
    required this.eventName,
    required this.city,
    required this.edition,
    required this.title,
    required this.year,
    required this.startsAt,
    required this.endsAt,
    required this.zoneName,
    required this.latitude,
    required this.longitude,
    required this.radiusMeters,
    required this.grantAccess,
    required this.email,
    required this.moderator,
    required this.administrator,
    required this.savePermissions,
    required this.loadFailed,
    required this.actionFailed,
    required this.imageApproved,
    required this.imageRejected,
    required this.experienceApproved,
    required this.experienceRejected,
    required this.catalogApproved,
    required this.catalogRejected,
    required this.eventCreated,
    required this.editionCreated,
    required this.zoneCreated,
    required this.permissionsSaved,
    required this.superAdminRole,
    required this.adminRole,
    required this.moderatorRole,
  });

  final String administration;
  final String adminIntro;
  final String refresh;
  final String currentPermission;
  final String photosTitle;
  final String experiencesTitle;
  final String catalogTitle;
  final String permissionsTitle;
  final String noPendingImages;
  final String noPendingExperiences;
  final String noPendingCatalog;
  final String approve;
  final String reject;
  final String createEvent;
  final String createEdition;
  final String createZone;
  final String eventName;
  final String city;
  final String edition;
  final String title;
  final String year;
  final String startsAt;
  final String endsAt;
  final String zoneName;
  final String latitude;
  final String longitude;
  final String radiusMeters;
  final String grantAccess;
  final String email;
  final String moderator;
  final String administrator;
  final String savePermissions;
  final String loadFailed;
  final String actionFailed;
  final String imageApproved;
  final String imageRejected;
  final String experienceApproved;
  final String experienceRejected;
  final String catalogApproved;
  final String catalogRejected;
  final String eventCreated;
  final String editionCreated;
  final String zoneCreated;
  final String permissionsSaved;
  final String superAdminRole;
  final String adminRole;
  final String moderatorRole;
}

const adminCopies = {
  LocaleOption.ca: AdminCopy(
    administration: 'Administració',
    adminIntro: 'Revisa contingut pendent i gestiona permisos des del mòbil.',
    refresh: 'Actualitzar',
    currentPermission: 'Permís actual',
    photosTitle: 'Fotos per revisar',
    experiencesTitle: 'Experiències per revisar',
    catalogTitle: 'Catàleg pendent',
    permissionsTitle: 'Permisos',
    noPendingImages: 'No hi ha imatges pendents.',
    noPendingExperiences: 'No hi ha experiències pendents.',
    noPendingCatalog: 'No hi ha elements de catàleg pendents.',
    approve: 'Aprovar',
    reject: 'Rebutjar',
    createEvent: 'Crear esdeveniment',
    createEdition: 'Crear edició',
    createZone: 'Crear zona',
    eventName: 'Nom de l’esdeveniment',
    city: 'Ciutat',
    edition: 'Edició',
    title: 'Títol',
    year: 'Any',
    startsAt: 'Inici',
    endsAt: 'Final',
    zoneName: 'Nom zona',
    latitude: 'Latitud',
    longitude: 'Longitud',
    radiusMeters: 'Radi metres',
    grantAccess: 'Donar accés',
    email: 'Email',
    moderator: 'Moderador',
    administrator: 'Administrador',
    savePermissions: 'Guardar permisos',
    loadFailed: 'No s’ha pogut carregar la cua de moderació.',
    actionFailed: 'No s’ha pogut completar l’acció.',
    imageApproved: 'Imatge aprovada.',
    imageRejected: 'Imatge rebutjada.',
    experienceApproved: 'Experiència aprovada.',
    experienceRejected: 'Experiència rebutjada.',
    catalogApproved: 'Element del catàleg aprovat.',
    catalogRejected: 'Element del catàleg rebutjat.',
    eventCreated: 'Esdeveniment creat.',
    editionCreated: 'Edició creada.',
    zoneCreated: 'Zona creada.',
    permissionsSaved: 'Permisos actualitzats.',
    superAdminRole: 'Super',
    adminRole: 'Admin',
    moderatorRole: 'Mod',
  ),
  LocaleOption.es: AdminCopy(
    administration: 'Administración',
    adminIntro:
        'Revisa contenido pendiente y gestiona permisos desde el móvil.',
    refresh: 'Actualizar',
    currentPermission: 'Permiso actual',
    photosTitle: 'Fotos por revisar',
    experiencesTitle: 'Experiencias por revisar',
    catalogTitle: 'Catálogo pendiente',
    permissionsTitle: 'Permisos',
    noPendingImages: 'No hay imágenes pendientes.',
    noPendingExperiences: 'No hay experiencias pendientes.',
    noPendingCatalog: 'No hay elementos de catálogo pendientes.',
    approve: 'Aprobar',
    reject: 'Rechazar',
    createEvent: 'Crear evento',
    createEdition: 'Crear edición',
    createZone: 'Crear zona',
    eventName: 'Nombre del evento',
    city: 'Ciudad',
    edition: 'Edición',
    title: 'Título',
    year: 'Año',
    startsAt: 'Inicio',
    endsAt: 'Final',
    zoneName: 'Nombre zona',
    latitude: 'Latitud',
    longitude: 'Longitud',
    radiusMeters: 'Radio metros',
    grantAccess: 'Dar acceso',
    email: 'Email',
    moderator: 'Moderador',
    administrator: 'Administrador',
    savePermissions: 'Guardar permisos',
    loadFailed: 'No se ha podido cargar la cola de moderación.',
    actionFailed: 'No se ha podido completar la acción.',
    imageApproved: 'Imagen aprobada.',
    imageRejected: 'Imagen rechazada.',
    experienceApproved: 'Experiencia aprobada.',
    experienceRejected: 'Experiencia rechazada.',
    catalogApproved: 'Elemento del catálogo aprobado.',
    catalogRejected: 'Elemento del catálogo rechazado.',
    eventCreated: 'Evento creado.',
    editionCreated: 'Edición creada.',
    zoneCreated: 'Zona creada.',
    permissionsSaved: 'Permisos actualizados.',
    superAdminRole: 'Super',
    adminRole: 'Admin',
    moderatorRole: 'Mod',
  ),
  LocaleOption.en: AdminCopy(
    administration: 'Administration',
    adminIntro: 'Review pending content and manage access from mobile.',
    refresh: 'Refresh',
    currentPermission: 'Current access',
    photosTitle: 'Photos to review',
    experiencesTitle: 'Experiences to review',
    catalogTitle: 'Pending catalog',
    permissionsTitle: 'Permissions',
    noPendingImages: 'No pending images.',
    noPendingExperiences: 'No pending experiences.',
    noPendingCatalog: 'No pending catalog items.',
    approve: 'Approve',
    reject: 'Reject',
    createEvent: 'Create event',
    createEdition: 'Create edition',
    createZone: 'Create zone',
    eventName: 'Event name',
    city: 'City',
    edition: 'Edition',
    title: 'Title',
    year: 'Year',
    startsAt: 'Starts at',
    endsAt: 'Ends at',
    zoneName: 'Zone name',
    latitude: 'Latitude',
    longitude: 'Longitude',
    radiusMeters: 'Radius meters',
    grantAccess: 'Grant access',
    email: 'Email',
    moderator: 'Moderator',
    administrator: 'Administrator',
    savePermissions: 'Save permissions',
    loadFailed: 'The moderation queue could not be loaded.',
    actionFailed: 'The action could not be completed.',
    imageApproved: 'Image approved.',
    imageRejected: 'Image rejected.',
    experienceApproved: 'Experience approved.',
    experienceRejected: 'Experience rejected.',
    catalogApproved: 'Catalog item approved.',
    catalogRejected: 'Catalog item rejected.',
    eventCreated: 'Event created.',
    editionCreated: 'Edition created.',
    zoneCreated: 'Zone created.',
    permissionsSaved: 'Permissions updated.',
    superAdminRole: 'Super',
    adminRole: 'Admin',
    moderatorRole: 'Mod',
  ),
};

String localizedPlaceArea(LocaleOption locale, PlaceSummary place) {
  return place.area;
}

String localizedPlaceDescription(LocaleOption locale, PlaceSummary place) {
  return place.description;
}

String localizedChildState(LocaleOption locale, ChildProfile profile) {
  return switch (profile.state) {
    'Aportació pendent' => switch (locale) {
      LocaleOption.ca => 'Aportació pendent',
      LocaleOption.es => 'Aportación pendiente',
      LocaleOption.en => 'Pending contribution',
    },
    'Preferències actualitzades' => switch (locale) {
      LocaleOption.ca => 'Preferències actualitzades',
      LocaleOption.es => 'Preferencias actualizadas',
      LocaleOption.en => 'Preferences updated',
    },
    _ => profile.state,
  };
}

String localizedChildAgeLine(LocaleOption locale, ChildProfile profile) {
  final ageLabel = switch (locale) {
    LocaleOption.ca => '${profile.age} anys',
    LocaleOption.es => '${profile.age} años',
    LocaleOption.en => '${profile.age} years',
  };

  return '$ageLabel · ${localizedChildState(locale, profile)}';
}

String sensoryLabel(LocaleOption locale, SensoryKey key) {
  switch (locale) {
    case LocaleOption.ca:
      return switch (key) {
        SensoryKey.noise => 'Soroll',
        SensoryKey.density => 'Densitat',
        SensoryKey.light => 'Impacte visual',
        SensoryKey.wait => 'Espera',
      };
    case LocaleOption.es:
      return switch (key) {
        SensoryKey.noise => 'Ruido',
        SensoryKey.density => 'Densidad',
        SensoryKey.light => 'Impacto visual',
        SensoryKey.wait => 'Espera',
      };
    case LocaleOption.en:
      return switch (key) {
        SensoryKey.noise => 'Noise',
        SensoryKey.density => 'Density',
        SensoryKey.light => 'Visual impact',
        SensoryKey.wait => 'Waiting',
      };
  }
}

String sensoryWord(LocaleOption locale, SensoryKey key, int value) {
  final index = value.clamp(1, 5).toInt() - 1;
  final words = switch (locale) {
    LocaleOption.ca => switch (key) {
      SensoryKey.noise => ['Silenciós', 'Suau', 'Moderat', 'Actiu', 'Intens'],
      SensoryKey.density => ['Aïllat', 'Tranquil', 'Mitjà', 'Social', 'Ple'],
      SensoryKey.light => ['Calma', 'Serena', 'Clara', 'Viva', 'Saturada'],
      SensoryKey.wait => ['Immediat', 'Curt', 'Moderat', 'Llarg', 'Molt llarg'],
    },
    LocaleOption.es => switch (key) {
      SensoryKey.noise => [
        'Silencioso',
        'Suave',
        'Moderado',
        'Activo',
        'Intenso',
      ],
      SensoryKey.density => [
        'Aislado',
        'Tranquilo',
        'Medio',
        'Social',
        'Lleno',
      ],
      SensoryKey.light => ['Calma', 'Serena', 'Clara', 'Viva', 'Saturada'],
      SensoryKey.wait => [
        'Inmediato',
        'Corto',
        'Moderado',
        'Largo',
        'Muy largo',
      ],
    },
    LocaleOption.en => switch (key) {
      SensoryKey.noise => ['Silent', 'Muted', 'Moderate', 'Active', 'Intense'],
      SensoryKey.density => ['Secluded', 'Quiet', 'Medium', 'Social', 'Full'],
      SensoryKey.light => ['Calm', 'Serene', 'Clear', 'Vivid', 'Saturated'],
      SensoryKey.wait => [
        'Immediate',
        'Short',
        'Moderate',
        'Long',
        'Very long',
      ],
    },
  };
  return words[index];
}

String eventSensoryLabel(LocaleOption locale, EventSensoryKey key) {
  switch (locale) {
    case LocaleOption.ca:
      return switch (key) {
        EventSensoryKey.noise => 'Soroll',
        EventSensoryKey.crowd => 'Gent',
        EventSensoryKey.lighting => 'Llum',
        EventSensoryKey.waitingTime => 'Espera',
        EventSensoryKey.temperature => 'Calor',
        EventSensoryKey.perceivedSafety => 'Seguretat percebuda',
        EventSensoryKey.exitEase => 'Sortida fàcil',
      };
    case LocaleOption.es:
      return switch (key) {
        EventSensoryKey.noise => 'Ruido',
        EventSensoryKey.crowd => 'Gente',
        EventSensoryKey.lighting => 'Luz',
        EventSensoryKey.waitingTime => 'Espera',
        EventSensoryKey.temperature => 'Calor',
        EventSensoryKey.perceivedSafety => 'Seguridad percibida',
        EventSensoryKey.exitEase => 'Salida fácil',
      };
    case LocaleOption.en:
      return switch (key) {
        EventSensoryKey.noise => 'Noise',
        EventSensoryKey.crowd => 'Crowd',
        EventSensoryKey.lighting => 'Light',
        EventSensoryKey.waitingTime => 'Waiting',
        EventSensoryKey.temperature => 'Heat',
        EventSensoryKey.perceivedSafety => 'Perceived safety',
        EventSensoryKey.exitEase => 'Easy exit',
      };
  }
}

String eventSensoryWord(LocaleOption locale, EventSensoryKey key, int value) {
  final index = value.clamp(1, 5).toInt() - 1;
  final words = switch (locale) {
    LocaleOption.ca => switch (key) {
      EventSensoryKey.noise => [
        'Molt baix',
        'Baix',
        'Mitjà',
        'Alt',
        'Molt alt',
      ],
      EventSensoryKey.crowd => [
        'Buida',
        'Tranquil·la',
        'Mitjana',
        'Plena',
        'Molt plena',
      ],
      EventSensoryKey.lighting => [
        'Suau',
        'Baixa',
        'Mitjana',
        'Forta',
        'Intensa',
      ],
      EventSensoryKey.waitingTime => [
        'Sense espera',
        'Curta',
        'Mitjana',
        'Llarga',
        'Molt llarga',
      ],
      EventSensoryKey.temperature => [
        'Fresca',
        'Suau',
        'Normal',
        'Calor',
        'Molta calor',
      ],
      EventSensoryKey.perceivedSafety => [
        'Molt baixa',
        'Baixa',
        'Mitjana',
        'Alta',
        'Molt alta',
      ],
      EventSensoryKey.exitEase => [
        'Molt difícil',
        'Difícil',
        'Mitjana',
        'Fàcil',
        'Molt fàcil',
      ],
    },
    LocaleOption.es => switch (key) {
      EventSensoryKey.noise => [
        'Muy bajo',
        'Bajo',
        'Medio',
        'Alto',
        'Muy alto',
      ],
      EventSensoryKey.crowd => [
        'Vacía',
        'Tranquila',
        'Media',
        'Llena',
        'Muy llena',
      ],
      EventSensoryKey.lighting => [
        'Suave',
        'Baja',
        'Media',
        'Fuerte',
        'Intensa',
      ],
      EventSensoryKey.waitingTime => [
        'Sin espera',
        'Corta',
        'Media',
        'Larga',
        'Muy larga',
      ],
      EventSensoryKey.temperature => [
        'Fresca',
        'Suave',
        'Normal',
        'Calor',
        'Mucho calor',
      ],
      EventSensoryKey.perceivedSafety => [
        'Muy baja',
        'Baja',
        'Media',
        'Alta',
        'Muy alta',
      ],
      EventSensoryKey.exitEase => [
        'Muy difícil',
        'Difícil',
        'Media',
        'Fácil',
        'Muy fácil',
      ],
    },
    LocaleOption.en => switch (key) {
      EventSensoryKey.noise => [
        'Very low',
        'Low',
        'Medium',
        'High',
        'Very high',
      ],
      EventSensoryKey.crowd => ['Empty', 'Calm', 'Medium', 'Full', 'Very full'],
      EventSensoryKey.lighting => [
        'Soft',
        'Low',
        'Medium',
        'Bright',
        'Intense',
      ],
      EventSensoryKey.waitingTime => [
        'No wait',
        'Short',
        'Medium',
        'Long',
        'Very long',
      ],
      EventSensoryKey.temperature => [
        'Cool',
        'Mild',
        'Normal',
        'Hot',
        'Very hot',
      ],
      EventSensoryKey.perceivedSafety => [
        'Very low',
        'Low',
        'Medium',
        'High',
        'Very high',
      ],
      EventSensoryKey.exitEase => [
        'Very hard',
        'Hard',
        'Medium',
        'Easy',
        'Very easy',
      ],
    },
  };
  return words[index];
}
