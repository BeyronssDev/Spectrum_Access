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
    required this.name,
    required this.area,
    required this.city,
    required this.category,
    required this.score,
    required this.distance,
    required this.quietDb,
    required this.description,
  });

  final String name;
  final String area;
  final String city;
  final String category;
  final double score;
  final String distance;
  final String quietDb;
  final String description;
}

class VerifiedProfile {
  const VerifiedProfile({
    required this.name,
    required this.kind,
    required this.identifier,
    required this.detail,
    required this.initials,
    required this.icon,
  });

  final String name;
  final String kind;
  final String identifier;
  final String detail;
  final String initials;
  final IconData icon;
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
    required this.pendingDraft,
    required this.continueDraft,
    required this.helpCard,
    required this.openHelpCard,
    required this.verifiedProfessionals,
    required this.viewAll,
    required this.search,
    required this.filters,
    required this.placeDetails,
    required this.save,
    required this.report,
    required this.sensoryReport,
    required this.reportIntro,
    required this.uploadImages,
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
    required this.childProfile,
    required this.sensoryProfile,
    required this.license,
    required this.registry,
    required this.contact,
    required this.verified,
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
  final String pendingDraft;
  final String continueDraft;
  final String helpCard;
  final String openHelpCard;
  final String verifiedProfessionals;
  final String viewAll;
  final String search;
  final List<String> filters;
  final String placeDetails;
  final String save;
  final String report;
  final String sensoryReport;
  final String reportIntro;
  final String uploadImages;
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
  final String childProfile;
  final String sensoryProfile;
  final String license;
  final String registry;
  final String contact;
  final String verified;
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
    greeting: 'Bon dia, Josep',
    homeIntro:
        'Basat en el teu perfil sensorial, et suggerim espais amb baixa densitat acústica i sortides clares.',
    sessionStatus: 'Sessió protegida',
    darkMode: 'Mode fosc',
    lightMode: 'Mode clar',
    focusMode: 'Focus mode',
    focusActive: 'Focus actiu',
    nearbyMap: 'Mapa Sensorial',
    savedPlaces: 'Llocs desats',
    pendingDraft: 'Esborrany pendent',
    continueDraft: 'Continuar esborrany',
    helpCard: 'Targeta d’ajuda',
    openHelpCard: 'Obrir targeta',
    verifiedProfessionals: 'Professionals verificats',
    viewAll: 'Veure tots',
    search: 'Cerca llocs, ciutat o categoria',
    filters: ['Baix soroll', 'Llum suau', 'Poca densitat'],
    placeDetails: 'Fitxa del lloc',
    save: 'Desar',
    report: 'Reportar',
    sensoryReport: 'Aportació sensorial',
    reportIntro:
        'Comparteix l’estat actual del lloc quan ho puguis fer amb calma.',
    uploadImages: 'Pujar imatges',
    notes: 'Notes atmosfèriques',
    notesHint: 'Descriu soroll, llum, afluència o espera...',
    submit: 'Enviar aportació',
    anonymous: 'Publicar com a anònim',
    pendingModeration: 'Pendent de moderació',
    tutorReview: 'Revisió del tutor',
    helpTitle: 'Ajuda immediata',
    helpIntro: 'Targeta de comunicació, contacte de confiança i focus mode.',
    communicationMessage:
        'Soc una persona autista. Ara mateix em costa parlar o respondre. Necessito uns minuts, un lloc tranquil o contactar amb una persona de confiança.',
    trustedContact: 'Contacte de confiança',
    focusBody:
        'Redueix informació secundària i manté només les accions crítiques.',
    profilesTitle: 'Perfils',
    profilesIntro: 'Adults, tutors i perfils tutelats dins el mateix compte.',
    adultProfile: 'Adult o persona identificada',
    tutorProfile: 'Tutor principal',
    childProfile: 'Perfil infantil tutelat',
    sensoryProfile: 'Perfil sensorial',
    license: 'Col·legiat/da',
    registry: 'Registre',
    contact: 'Contactar',
    verified: 'Verificat',
  ),
  LocaleOption.es: AppCopy(
    appName: 'Spectrum Access',
    subtitle: 'Sensory Accessibility',
    home: 'Inicio',
    consult: 'Consulta',
    contribute: 'Aportaciones',
    support: 'Ayuda',
    profiles: 'Perfiles',
    greeting: 'Buenos días, Josep',
    homeIntro:
        'Según tu perfil sensorial, sugerimos espacios con baja densidad acústica y salidas claras.',
    sessionStatus: 'Sesión protegida',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    focusMode: 'Focus mode',
    focusActive: 'Focus activo',
    nearbyMap: 'Mapa Sensorial',
    savedPlaces: 'Lugares guardados',
    pendingDraft: 'Borrador pendiente',
    continueDraft: 'Continuar borrador',
    helpCard: 'Tarjeta de ayuda',
    openHelpCard: 'Abrir tarjeta',
    verifiedProfessionals: 'Profesionales verificados',
    viewAll: 'Ver todos',
    search: 'Busca lugares, ciudad o categoría',
    filters: ['Bajo ruido', 'Luz suave', 'Poca densidad'],
    placeDetails: 'Ficha del lugar',
    save: 'Guardar',
    report: 'Reportar',
    sensoryReport: 'Aportación sensorial',
    reportIntro:
        'Comparte el estado actual del lugar cuando puedas hacerlo con calma.',
    uploadImages: 'Subir imágenes',
    notes: 'Notas atmosféricas',
    notesHint: 'Describe ruido, luz, afluencia o espera...',
    submit: 'Enviar aportación',
    anonymous: 'Publicar como anónimo',
    pendingModeration: 'Pendiente de moderación',
    tutorReview: 'Revisión del tutor',
    helpTitle: 'Ayuda inmediata',
    helpIntro: 'Tarjeta de comunicación, contacto de confianza y focus mode.',
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
    childProfile: 'Perfil infantil tutelado',
    sensoryProfile: 'Perfil sensorial',
    license: 'Colegiado/a',
    registry: 'Registro',
    contact: 'Contactar',
    verified: 'Verificado',
  ),
  LocaleOption.en: AppCopy(
    appName: 'Spectrum Access',
    subtitle: 'Sensory Accessibility',
    home: 'Dashboard',
    consult: 'Discover',
    contribute: 'Report',
    support: 'Help',
    profiles: 'Profiles',
    greeting: 'Good morning, Josep',
    homeIntro:
        'Based on your sensory profile, we suggest spaces with low acoustic density and clear exits.',
    sessionStatus: 'Protected session',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    focusMode: 'Focus mode',
    focusActive: 'Focus active',
    nearbyMap: 'Sensory Map',
    savedPlaces: 'Saved places',
    pendingDraft: 'Pending draft',
    continueDraft: 'Continue draft',
    helpCard: 'Help card',
    openHelpCard: 'Open card',
    verifiedProfessionals: 'Verified professionals',
    viewAll: 'View all',
    search: 'Search places, city or category',
    filters: ['Low noise', 'Soft light', 'Low density'],
    placeDetails: 'Place details',
    save: 'Save',
    report: 'Report',
    sensoryReport: 'Sensory report',
    reportIntro:
        'Share the current state of the place when you can do it calmly.',
    uploadImages: 'Upload images',
    notes: 'Atmospheric notes',
    notesHint: 'Describe noise, light, crowding or waiting...',
    submit: 'Submit report',
    anonymous: 'Post anonymously',
    pendingModeration: 'Pending moderation',
    tutorReview: 'Tutor review',
    helpTitle: 'Immediate help',
    helpIntro: 'Communication card, trusted contact and focus mode.',
    communicationMessage:
        'I am autistic. Right now it is hard for me to speak or answer. I need a few minutes, a quiet place or a trusted contact.',
    trustedContact: 'Trusted contact',
    focusBody: 'Reduces secondary information and keeps only critical actions.',
    profilesTitle: 'Profiles',
    profilesIntro:
        'Adults, tutors and tutored profiles inside the same account.',
    adultProfile: 'Adult or identified person',
    tutorProfile: 'Main tutor',
    childProfile: 'Tutored child profile',
    sensoryProfile: 'Sensory profile',
    license: 'License',
    registry: 'Registry',
    contact: 'Contact',
    verified: 'Verified',
  ),
};

const places = [
  PlaceSummary(
    name: 'Biblioteca Veridian',
    area: 'Zona silenciosa',
    city: 'Barcelona',
    category: 'Cultura',
    score: 9.8,
    distance: '0.4 km',
    quietDb: '34dB',
    description:
        'Biblioteca amb llum difusa, plantes baixes tranquil·les i sortida visible.',
  ),
  PlaceSummary(
    name: 'Jardí Atrium',
    area: 'Espai verd',
    city: 'Barcelona',
    category: 'Exterior',
    score: 9.5,
    distance: '0.8 km',
    quietDb: '38dB',
    description:
        'Pati obert amb recorregut senzill, bancs separats i zones d’ombra.',
  ),
  PlaceSummary(
    name: 'Esbeteria Mar Blau',
    area: 'Cafeteria tranquil·la',
    city: 'Barcelona',
    category: 'Cafeteria',
    score: 8.9,
    distance: '1.2 km',
    quietDb: '42dB',
    description:
        'Interior petit amb música baixa al matí i una taula lateral amb menys estímuls.',
  ),
];

const verifiedProfiles = [
  VerifiedProfile(
    name: 'Marta Gómez',
    kind: 'Psicòloga',
    identifier: 'COPC 47145',
    detail: 'Autisme adult i suport familiar',
    initials: 'MG',
    icon: Icons.psychology_outlined,
  ),
  VerifiedProfile(
    name: 'Centre TEA Catalunya',
    kind: 'Entitat',
    identifier: 'Reg. E-12345',
    detail: 'Acompanyament per a persones autistes i famílies',
    initials: 'CT',
    icon: Icons.apartment_outlined,
  ),
];

const childProfiles = [
  ChildProfile(alias: 'Aina', age: '8', state: 'Aportació pendent'),
  ChildProfile(alias: 'Pau', age: '11', state: 'Preferències actualitzades'),
];

List<PlaceSummary> get samplePlaces => places;
List<VerifiedProfile> get sampleVerifiedProfiles => verifiedProfiles;
List<ChildProfile> get sampleChildProfiles => childProfiles;

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
