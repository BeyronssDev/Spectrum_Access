import type { Locale } from "./types";

export const authCopy: Record<
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
    accountType: string;
    registerAsUser: string;
    registerAsProfessional: string;
    professionalRegistrationTitle: string;
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
    requiredFields: string;
    invalidEmail: string;
    passwordsMismatch: string;
    forgotPassword: string;
    passwordResetSent: string;
    passwordResetFailed: string;
    authFailed: string;
    emailVerificationSent: string;
    professionalVerificationSent: string;
    professionalFieldsRequired: string;
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
    professionalType: string;
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
    accountType: "Tipus de compte",
    registerAsUser: "Usuari",
    registerAsProfessional: "Professional",
    professionalRegistrationTitle: "Dades professionals",
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
    requiredFields: "Omple els camps obligatoris.",
    invalidEmail: "Introdueix un email vàlid.",
    passwordsMismatch: "Les contrasenyes no coincideixen.",
    forgotPassword: "Has oblidat la teva contrasenya?",
    passwordResetSent: "Si aquest correu està registrat, rebràs un enllaç per restablir la contrasenya.",
    passwordResetFailed: "No s'ha pogut enviar el correu de restabliment. Torna-ho a provar.",
    authFailed: "No s'ha pogut completar l'autenticació. Revisa Firebase Auth i torna-ho a provar.",
    emailVerificationSent: "Compte creat. T'hem enviat un correu de verificació.",
    professionalVerificationSent: "Compte professional creat. T'hem enviat el correu de verificació i la sol·licitud queda pendent de revisió.",
    professionalFieldsRequired: "Omple les dades professionals abans de crear el compte.",
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
    professionalType: "Tipus de professional",
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
    accountType: "Tipo de cuenta",
    registerAsUser: "Usuario",
    registerAsProfessional: "Profesional",
    professionalRegistrationTitle: "Datos profesionales",
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
    requiredFields: "Rellena los campos obligatorios.",
    invalidEmail: "Introduce un email válido.",
    passwordsMismatch: "Las contraseñas no coinciden.",
    forgotPassword: "¿Has olvidado tu contraseña?",
    passwordResetSent: "Si este correo está registrado, recibirás un enlace para restablecer la contraseña.",
    passwordResetFailed: "No se ha podido enviar el correo de restablecimiento. Inténtalo de nuevo.",
    authFailed: "No se ha podido completar la autenticación. Revisa Firebase Auth e inténtalo de nuevo.",
    emailVerificationSent: "Cuenta creada. Te hemos enviado un correo de verificación.",
    professionalVerificationSent: "Cuenta profesional creada. Te hemos enviado el correo de verificación y la solicitud queda pendiente de revisión.",
    professionalFieldsRequired: "Rellena los datos profesionales antes de crear la cuenta.",
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
    professionalType: "Tipo de profesional",
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
    accountType: "Account type",
    registerAsUser: "User",
    registerAsProfessional: "Professional",
    professionalRegistrationTitle: "Professional details",
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
    requiredFields: "Fill in the required fields.",
    invalidEmail: "Enter a valid email.",
    passwordsMismatch: "Passwords do not match.",
    forgotPassword: "Forgot your password?",
    passwordResetSent: "If this email is registered, you will receive a password reset link.",
    passwordResetFailed: "We could not send the reset email. Please try again.",
    authFailed: "Authentication could not be completed. Check Firebase Auth and try again.",
    emailVerificationSent: "Account created. We sent you a verification email.",
    professionalVerificationSent: "Professional account created. We sent you a verification email and the request is pending review.",
    professionalFieldsRequired: "Fill in the professional details before creating the account.",
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
    professionalType: "Professional type",
    specialty: "Specialty",
    requestVerification: "Send verification",
    verificationRequested: "Request sent. It remains pending manual review."
  }
};
