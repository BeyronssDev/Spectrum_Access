import 'package:flutter/material.dart';

enum LocaleOption {
  ca('CA'),
  es('ES'),
  en('EN');

  const LocaleOption(this.label);
  final String label;
}

enum MobileTab { consult, contribute, support, profiles }

enum SensoryKey { noise, density, light, wait }

class PlaceSummary {
  const PlaceSummary({
    required this.id,
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
  });

  final String id;
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

  PlaceSummary copyWith({
    String? distance,
    Map<SensoryKey, double>? criterionAverages,
  }) {
    return PlaceSummary(
      id: id,
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
    required this.home,
    required this.consult,
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
  });

  final String appName;
  final String subtitle;
  final String home;
  final String consult;
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
}

class AuthCopy {
  const AuthCopy({
    required this.authTitle,
    required this.authIntro,
    required this.login,
    required this.register,
    required this.personalAccount,
    required this.professionalAccount,
    required this.professionalRegisterIntro,
    required this.email,
    required this.password,
    required this.confirmPassword,
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
    required this.professionalFieldsRequired,
    required this.authFailed,
    required this.authCancelled,
    required this.authProviderDisabled,
    required this.authConfigurationError,
    required this.verificationSent,
    required this.professionalRegistrationSent,
    required this.childAlias,
    required this.childAge,
    required this.createChildProfile,
    required this.childCreated,
    required this.professionalRequestTitle,
    required this.professionalName,
    required this.licenseNumber,
    required this.professionalCollege,
    required this.specialty,
    required this.requestVerification,
    required this.verificationRequested,
  });

  final String authTitle;
  final String authIntro;
  final String login;
  final String register;
  final String personalAccount;
  final String professionalAccount;
  final String professionalRegisterIntro;
  final String email;
  final String password;
  final String confirmPassword;
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
  final String professionalFieldsRequired;
  final String authFailed;
  final String authCancelled;
  final String authProviderDisabled;
  final String authConfigurationError;
  final String verificationSent;
  final String professionalRegistrationSent;
  final String childAlias;
  final String childAge;
  final String createChildProfile;
  final String childCreated;
  final String professionalRequestTitle;
  final String professionalName;
  final String licenseNumber;
  final String professionalCollege;
  final String specialty;
  final String requestVerification;
  final String verificationRequested;
}

const appCopies = {
  LocaleOption.ca: AppCopy(
    appName: 'Spectrum Access',
    subtitle: 'Sensory Accessibility',
    home: 'Inici',
    consult: 'Consulta',
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
    verifiedProfessionals: 'Professionals verificats',
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
    profilesIntro: 'Adults, tutors i perfils tutelats dins el mateix compte.',
    adultProfile: 'Adult o persona identificada',
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
    noPlacesTitle: 'Encara no hi ha llocs publicats',
    noPlacesBody:
        'Quan facis una aportació real, el lloc i les imatges quedaran pendents de moderació.',
    noVerifiedProfiles: 'Encara no hi ha professionals verificats.',
    noChildProfiles: 'Encara no hi ha perfils tutelats.',
    createPlace: 'Crear lloc nou',
    placeName: 'Nom del lloc',
    placeCity: 'Ciutat',
    placeAddress: 'Adreça o zona',
    placeDescription: 'Descripció opcional',
    locationRequiredForPlace:
        'Activa la ubicació per crear un lloc nou des del mòbil.',
  ),
  LocaleOption.es: AppCopy(
    appName: 'Spectrum Access',
    subtitle: 'Sensory Accessibility',
    home: 'Inicio',
    consult: 'Consulta',
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
    verifiedProfessionals: 'Profesionales verificados',
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
    profilesIntro:
        'Adultos, tutores y perfiles tutelados dentro de la misma cuenta.',
    adultProfile: 'Adulto o persona identificada',
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
    noPlacesTitle: 'Todavía no hay lugares publicados',
    noPlacesBody:
        'Cuando hagas una aportación real, el lugar y las imágenes quedarán pendientes de moderación.',
    noVerifiedProfiles: 'Todavía no hay profesionales verificados.',
    noChildProfiles: 'Todavía no hay perfiles tutelados.',
    createPlace: 'Crear lugar nuevo',
    placeName: 'Nombre del lugar',
    placeCity: 'Ciudad',
    placeAddress: 'Dirección o zona',
    placeDescription: 'Descripción opcional',
    locationRequiredForPlace:
        'Activa la ubicación para crear un lugar nuevo desde el móvil.',
  ),
  LocaleOption.en: AppCopy(
    appName: 'Spectrum Access',
    subtitle: 'Sensory Accessibility',
    home: 'Dashboard',
    consult: 'Discover',
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
    verifiedProfessionals: 'Verified professionals',
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
    profilesIntro:
        'Adults, tutors and tutored profiles inside the same account.',
    adultProfile: 'Adult or identified person',
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
    noPlacesTitle: 'No published places yet',
    noPlacesBody:
        'When you make a real contribution, the place and images will stay pending moderation.',
    noVerifiedProfiles: 'No verified professionals yet.',
    noChildProfiles: 'No tutored profiles yet.',
    createPlace: 'Create new place',
    placeName: 'Place name',
    placeCity: 'City',
    placeAddress: 'Address or area',
    placeDescription: 'Optional description',
    locationRequiredForPlace:
        'Enable location to create a new place from the phone.',
  ),
};

const authCopies = {
  LocaleOption.ca: AuthCopy(
    authTitle: 'Entra a Spectrum Access',
    authIntro:
        'Consulta el mapa sense compte. Registra’t només quan vulguis aportar imatges, crear perfils tutelats o sol·licitar verificació professional.',
    login: 'Entrar',
    register: 'Crear compte',
    personalAccount: 'Usuari',
    professionalAccount: 'Professional',
    professionalRegisterIntro:
        'El compte es crearà ara, però la verificació professional quedarà pendent fins que un administrador l’aprovi.',
    email: 'Email',
    password: 'Contrasenya',
    confirmPassword: 'Repeteix la contrasenya',
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
        'Pots consultar el mapa i la informació bàsica sense compte. Per aportar contingut, veure perfils verificats o gestionar dades personals cal registrar-se.',
    signInToContinue: 'Iniciar sessió',
    requiredFields: 'Omple els camps obligatoris.',
    invalidEmail: 'Introdueix un email vàlid.',
    passwordMinLength: 'La contrasenya ha de tenir com a mínim 6 caràcters.',
    passwordsMismatch: 'Les contrasenyes no coincideixen.',
    professionalFieldsRequired:
        'Omple les dades professionals per enviar la verificació.',
    authFailed: 'No s’ha pogut completar l’autenticació.',
    authCancelled: 'Has cancel·lat l’autenticació.',
    authProviderDisabled:
        'Aquest mètode d’accés encara no està activat a Firebase.',
    authConfigurationError:
        'Falta configuració nativa o OAuth per completar aquest accés.',
    verificationSent: 'Compte creat. Revisa el correu de verificació.',
    professionalRegistrationSent:
        'Compte creat. La verificació professional queda pendent de revisió.',
    childAlias: 'Àlies infantil',
    childAge: 'Franja d’edat',
    createChildProfile: 'Crear perfil tutelat',
    childCreated: 'Perfil tutelat creat.',
    professionalRequestTitle: 'Sol·licitar perfil professional',
    professionalName: 'Nom professional',
    licenseNumber: 'Número de col·legiat/da',
    professionalCollege: 'Col·legi professional',
    specialty: 'Especialitat',
    requestVerification: 'Enviar verificació',
    verificationRequested: 'Sol·licitud enviada a revisió.',
  ),
  LocaleOption.es: AuthCopy(
    authTitle: 'Entra en Spectrum Access',
    authIntro:
        'Consulta el mapa sin cuenta. Regístrate solo cuando quieras aportar imágenes, crear perfiles tutelados o solicitar verificación profesional.',
    login: 'Entrar',
    register: 'Crear cuenta',
    personalAccount: 'Usuario',
    professionalAccount: 'Profesional',
    professionalRegisterIntro:
        'La cuenta se creará ahora, pero la verificación profesional quedará pendiente hasta que un administrador la apruebe.',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Repite la contraseña',
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
        'Puedes consultar el mapa y la información básica sin cuenta. Para aportar contenido, ver perfiles verificados o gestionar datos personales hay que registrarse.',
    signInToContinue: 'Iniciar sesión',
    requiredFields: 'Rellena los campos obligatorios.',
    invalidEmail: 'Introduce un email válido.',
    passwordMinLength: 'La contraseña debe tener como mínimo 6 caracteres.',
    passwordsMismatch: 'Las contraseñas no coinciden.',
    professionalFieldsRequired:
        'Rellena los datos profesionales para enviar la verificación.',
    authFailed: 'No se ha podido completar la autenticación.',
    authCancelled: 'Has cancelado la autenticación.',
    authProviderDisabled:
        'Este método de acceso todavía no está activado en Firebase.',
    authConfigurationError:
        'Falta configuración nativa u OAuth para completar este acceso.',
    verificationSent: 'Cuenta creada. Revisa el correo de verificación.',
    professionalRegistrationSent:
        'Cuenta creada. La verificación profesional queda pendiente de revisión.',
    childAlias: 'Alias infantil',
    childAge: 'Franja de edad',
    createChildProfile: 'Crear perfil tutelado',
    childCreated: 'Perfil tutelado creado.',
    professionalRequestTitle: 'Solicitar perfil profesional',
    professionalName: 'Nombre profesional',
    licenseNumber: 'Número de colegiado/a',
    professionalCollege: 'Colegio profesional',
    specialty: 'Especialidad',
    requestVerification: 'Enviar verificación',
    verificationRequested: 'Solicitud enviada a revisión.',
  ),
  LocaleOption.en: AuthCopy(
    authTitle: 'Enter Spectrum Access',
    authIntro:
        'Browse the map without an account. Register only when you want to upload images, create tutored profiles or request professional verification.',
    login: 'Sign in',
    register: 'Create account',
    personalAccount: 'User',
    professionalAccount: 'Professional',
    professionalRegisterIntro:
        'The account will be created now, but professional verification stays pending until an administrator approves it.',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Repeat password',
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
        'You can browse the map and basic place information without an account. To contribute content, view verified profiles or manage personal data, registration is required.',
    signInToContinue: 'Sign in',
    requiredFields: 'Fill in the required fields.',
    invalidEmail: 'Enter a valid email.',
    passwordMinLength: 'Password must be at least 6 characters.',
    passwordsMismatch: 'Passwords do not match.',
    professionalFieldsRequired:
        'Fill in the professional details to send verification.',
    authFailed: 'Authentication could not be completed.',
    authCancelled: 'Authentication was cancelled.',
    authProviderDisabled: 'This sign-in method is not enabled in Firebase yet.',
    authConfigurationError:
        'Native or OAuth configuration is missing for this sign-in method.',
    verificationSent: 'Account created. Check the verification email.',
    professionalRegistrationSent:
        'Account created. Professional verification is pending review.',
    childAlias: 'Child alias',
    childAge: 'Age range',
    createChildProfile: 'Create tutored profile',
    childCreated: 'Tutored profile created.',
    professionalRequestTitle: 'Request professional profile',
    professionalName: 'Professional name',
    licenseNumber: 'License number',
    professionalCollege: 'Professional college',
    specialty: 'Specialty',
    requestVerification: 'Send verification',
    verificationRequested: 'Request sent for review.',
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
