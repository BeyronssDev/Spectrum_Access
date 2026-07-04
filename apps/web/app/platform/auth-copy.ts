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
    showPassword: string;
    hidePassword: string;
    birthDate: string;
    birthDateHint: string;
    adultGateTitle: string;
    adultGateIntro: string;
    adultGateRequired: string;
    adultGateUnderage: string;
    adultGateContinue: string;
    adultGateCancel: string;
    publicName: string;
    cityOptional: string;
    accountType: string;
    registerAsUser: string;
    registerAsProfessional: string;
    registerAsOrganization: string;
    professionalRegistrationTitle: string;
    organizationRegistrationTitle: string;
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
    passwordMinLength: string;
    passwordsMismatch: string;
    forgotPassword: string;
    passwordResetSent: string;
    passwordResetFailed: string;
    authFailed: string;
    emailVerificationSent: string;
    professionalVerificationSent: string;
    organizationVerificationSent: string;
    verificationRequestFailed: string;
    retryVerification: string;
    professionalFieldsRequired: string;
    organizationFieldsRequired: string;
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
    professionalPublicName: string;
    professionalName: string;
    licenseNumber: string;
    professionalCollege: string;
    professionalType: string;
    specialty: string;
    organizationName: string;
    organizationCity: string;
    organizationDescription: string;
    organizationWebsite: string;
    organizationRegistryNumber: string;
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
    showPassword: "Mostra contrasenya",
    hidePassword: "Amaga contrasenya",
    birthDate: "Data de naixement",
    birthDateHint: "AAAA-MM-DD",
    adultGateTitle: "Confirmació d'edat",
    adultGateIntro:
      "Per crear un compte autònom cal tenir 18 anys o més. Els menors poden participar mitjançant un tutor.",
    adultGateRequired: "Introdueix una data de naixement vàlida.",
    adultGateUnderage: "No es pot crear un compte autònom si ets menor de 18 anys.",
    adultGateContinue: "Continuar",
    adultGateCancel: "Cancel·lar",
    publicName: "Nom públic",
    cityOptional: "Ciutat opcional",
    accountType: "Tipus de compte",
    registerAsUser: "Usuari",
    registerAsProfessional: "Professional especialitzat",
    registerAsOrganization: "Associació",
    professionalRegistrationTitle: "Dades del professional",
    organizationRegistrationTitle: "Dades de l'associació",
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
    passwordMinLength: "La contrasenya ha de tenir com a mínim 12 caràcters.",
    passwordsMismatch: "Les contrasenyes no coincideixen.",
    forgotPassword: "Has oblidat la teva contrasenya?",
    passwordResetSent: "Si aquest correu està registrat, rebràs un enllaç per restablir la contrasenya.",
    passwordResetFailed: "No s'ha pogut enviar el correu de restabliment. Torna-ho a provar.",
    authFailed: "No s'ha pogut completar l'autenticació. Torna-ho a provar.",
    emailVerificationSent: "Compte creat. T'hem enviat un correu de verificació.",
    professionalVerificationSent: "Compte professional creat. T'hem enviat el correu de verificació i la sol·licitud queda pendent de revisió.",
    organizationVerificationSent: "Compte d'associació creat. T'hem enviat el correu de verificació i la sol·licitud queda pendent de revisió.",
    verificationRequestFailed: "El compte s'ha creat, però no s'ha pogut enviar la sol·licitud de verificació. Revisa les dades i torna-ho a provar.",
    retryVerification: "Reintentar verificació",
    professionalFieldsRequired: "Omple les dades del professional abans d'enviar la verificació.",
    organizationFieldsRequired: "Omple el nom, la ciutat i la descripció de l'associació.",
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
    professionalPublicName: "Nom professional públic",
    professionalName: "Nom professional",
    licenseNumber: "Acreditació o número de col·legiat/da",
    professionalCollege: "Col·legi o entitat professional",
    professionalType: "Tipus de professional",
    specialty: "Especialitat o àmbit",
    organizationName: "Nom de l'associació",
    organizationCity: "Ciutat",
    organizationDescription: "Descripció de l'associació",
    organizationWebsite: "Web opcional",
    organizationRegistryNumber: "Número de registre opcional",
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
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    birthDate: "Fecha de nacimiento",
    birthDateHint: "AAAA-MM-DD",
    adultGateTitle: "Confirmación de edad",
    adultGateIntro:
      "Para crear una cuenta autónoma hay que tener 18 años o más. Los menores pueden participar mediante un tutor.",
    adultGateRequired: "Introduce una fecha de nacimiento válida.",
    adultGateUnderage: "No se puede crear una cuenta autónoma si eres menor de 18 años.",
    adultGateContinue: "Continuar",
    adultGateCancel: "Cancelar",
    publicName: "Nombre público",
    cityOptional: "Ciudad opcional",
    accountType: "Tipo de cuenta",
    registerAsUser: "Usuario",
    registerAsProfessional: "Profesional especializado",
    registerAsOrganization: "Asociación",
    professionalRegistrationTitle: "Datos del profesional",
    organizationRegistrationTitle: "Datos de la asociación",
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
    passwordMinLength: "La contraseña debe tener como mínimo 12 caracteres.",
    passwordsMismatch: "Las contraseñas no coinciden.",
    forgotPassword: "¿Has olvidado tu contraseña?",
    passwordResetSent: "Si este correo está registrado, recibirás un enlace para restablecer la contraseña.",
    passwordResetFailed: "No se ha podido enviar el correo de restablecimiento. Inténtalo de nuevo.",
    authFailed: "No se ha podido completar la autenticación. Inténtalo de nuevo.",
    emailVerificationSent: "Cuenta creada. Te hemos enviado un correo de verificación.",
    professionalVerificationSent: "Cuenta profesional creada. Te hemos enviado el correo de verificación y la solicitud queda pendiente de revisión.",
    organizationVerificationSent: "Cuenta de asociación creada. Te hemos enviado el correo de verificación y la solicitud queda pendiente de revisión.",
    verificationRequestFailed: "La cuenta se ha creado, pero no se ha podido enviar la solicitud de verificación. Revisa los datos e inténtalo de nuevo.",
    retryVerification: "Reintentar verificación",
    professionalFieldsRequired: "Rellena los datos del profesional antes de enviar la verificación.",
    organizationFieldsRequired: "Rellena el nombre, la ciudad y la descripción de la asociación.",
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
    professionalPublicName: "Nombre profesional público",
    professionalName: "Nombre profesional",
    licenseNumber: "Acreditación o número de colegiado/a",
    professionalCollege: "Colegio o entidad profesional",
    professionalType: "Tipo de profesional",
    specialty: "Especialidad o ámbito",
    organizationName: "Nombre de la asociación",
    organizationCity: "Ciudad",
    organizationDescription: "Descripción de la asociación",
    organizationWebsite: "Web opcional",
    organizationRegistryNumber: "Número de registro opcional",
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
    showPassword: "Show password",
    hidePassword: "Hide password",
    birthDate: "Date of birth",
    birthDateHint: "YYYY-MM-DD",
    adultGateTitle: "Age confirmation",
    adultGateIntro:
      "To create an independent account you must be 18 or older. Minors can participate through a tutor.",
    adultGateRequired: "Enter a valid date of birth.",
    adultGateUnderage: "You cannot create an independent account if you are under 18.",
    adultGateContinue: "Continue",
    adultGateCancel: "Cancel",
    publicName: "Public name",
    cityOptional: "Optional city",
    accountType: "Account type",
    registerAsUser: "User",
    registerAsProfessional: "Specialist professional",
    registerAsOrganization: "Association",
    professionalRegistrationTitle: "Professional details",
    organizationRegistrationTitle: "Association details",
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
    passwordMinLength: "Password must be at least 12 characters.",
    passwordsMismatch: "Passwords do not match.",
    forgotPassword: "Forgot your password?",
    passwordResetSent: "If this email is registered, you will receive a password reset link.",
    passwordResetFailed: "We could not send the reset email. Please try again.",
    authFailed: "Authentication could not be completed. Please try again.",
    emailVerificationSent: "Account created. We sent you a verification email.",
    professionalVerificationSent: "Professional account created. We sent you a verification email and the request is pending review.",
    organizationVerificationSent: "Association account created. We sent you a verification email and the request is pending review.",
    verificationRequestFailed: "The account was created, but the verification request could not be sent. Review the details and try again.",
    retryVerification: "Retry verification",
    professionalFieldsRequired: "Fill in the professional details before sending verification.",
    organizationFieldsRequired: "Fill in the association name, city and description.",
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
    professionalPublicName: "Public professional name",
    professionalName: "Professional name",
    licenseNumber: "Credential or license number",
    professionalCollege: "Professional college or entity",
    professionalType: "Professional type",
    specialty: "Specialty or field",
    organizationName: "Association name",
    organizationCity: "City",
    organizationDescription: "Association description",
    organizationWebsite: "Optional website",
    organizationRegistryNumber: "Optional registry number",
    requestVerification: "Send verification",
    verificationRequested: "Request sent. It remains pending manual review."
  }
};
