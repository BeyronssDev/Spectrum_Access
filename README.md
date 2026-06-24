# Spectrum Access

Open sensory accessibility platform for consulting, reviewing and documenting places from a functional sensory perspective.

Spectrum Access combines a web application, an iOS/Android mobile application and a Firebase backend. The project is designed for autistic people, families, tutors, verified professionals, associations and moderators who need practical information about sensory conditions before visiting a place.

> Project status: final open-source project with working web and mobile applications, backed by Firebase services. The repository is product-oriented and includes the source code, setup instructions and deployment-ready structure.

**Languages:** [English](#english) · [Català](#catala) · [Castellano](#castellano)

<a id="english"></a>
## English

<a id="en-index"></a>
### Index

- [A. Project Overview](#en-a-project-overview)
- [B. Technology Stack](#en-technology-stack)
- [C. Installation and Running Locally](#en-installation-and-running-locally)
- [D. Project Structure](#en-project-structure)
- [E. Main Features](#en-main-features)
- [F. Test User and Password](#en-test-user-and-password)
- [Privacy and Security Considerations](#en-privacy-and-security-considerations)
- [Current State](#en-current-status-and-next-steps)
- [License](#en-license)

<a id="en-a-project-overview"></a>
### A. Project Overview

Spectrum Access is a web and mobile platform for improving sensory accessibility information about public and private spaces. The main goal is to let the community document how places are experienced in terms of noise, lighting, crowd density, waiting time, exit clarity, quiet areas and staff support.

The project is intended for:

- Autistic adults or identified people who want to consult and contribute sensory information.
- Tutors managing child profiles inside their own account.
- Families who need practical information before visiting a place.
- Verified psychologists and professionals.
- Verified autism associations and centres.
- Moderators and administrators who review content, images and verification requests.

The platform does not provide diagnoses, medical recommendations or clinical advice. Sensory information is treated as functional and community-based information, not as medical history.

#### Problem Addressed

Many autistic people or people with sensory sensitivity need to anticipate what an environment will be like before visiting it. Standard information such as opening hours, addresses or general reviews often does not explain whether a place is noisy, visually intense, crowded, easy to leave or suitable for a quiet pause.

Spectrum Access addresses that gap by allowing users to:

- Consult places on a map.
- Filter spaces by sensory needs.
- Review place pages with scores and comments.
- Save useful places.
- Prepare contributions calmly.
- Upload supporting images.
- Report incorrect or sensitive content.
- Consult verified professional and organization profiles.

#### Web and Mobile Approach

The project aims for functional parity between web and mobile, while adapting each interface to its context:

- The mobile app is designed for quick use in the street: checking nearby places, contributing short reports, accessing help and completing simple actions.
- The web app is designed as a calmer desktop environment: reviewing information with more space, completing contributions, managing profiles, consulting verification information and using the map on a larger screen.

<a id="en-technology-stack"></a>
### B. Technology Stack

The repository is organized as a monorepo using `pnpm` for JavaScript/TypeScript and Flutter for the mobile application.

> Important: this project does not use `npm`. All JavaScript/TypeScript operations must use `pnpm`.

#### Web Frontend

- **Next.js 16.2.9**: web application and administration area.
- **React 19.2.7**: main web interface.
- **TypeScript 5.9.3**: static typing.
- **Tailwind CSS 4.3.1**: styling foundation.
- **Lucide React**: interface icons.
- **Google Maps JavaScript API**: interactive web map.
- **Firebase Web SDK 12.15.0**: Auth, Firestore, Storage and Functions integration.

#### Mobile Application

- **Flutter**: iOS and Android application.
- **Dart SDK `^3.11.4`**.
- **firebase_core**, **firebase_auth**, **cloud_firestore**, **firebase_storage**, **firebase_app_check** and **cloud_functions**.
- **google_sign_in** and **sign_in_with_apple** for authentication.
- **google_maps_flutter** for native maps.
- **image_picker** for selecting images.
- **flutter_svg** and **google_fonts** for visual identity.

#### Backend and Cloud Services

- **Firebase Auth**: authentication.
- **Cloud Firestore**: main database.
- **Firebase Storage**: place images, professional photos, organization logos and private evidence files.
- **Cloud Functions for Firebase**: backend logic, moderation, aggregates, verification and notifications.
- **Firebase App Check**: protection against unauthorized clients.
- **Firebase Emulator Suite**: local rule and service testing.

#### Infrastructure

- **pnpm 11.1.2** as the JavaScript/TypeScript package manager.
- **Node.js `>=20.9`**.
- **Cloud Functions runtime `nodejs22`**.
- **Firestore region `eur3`**.
- **Functions region `europe-west1`**.
- **Firebase Hosting** prepared for the static Next.js export, but not required during local development.

#### Design and Brand

- Project name: **Spectrum Access**.
- Shared official logo between web and mobile.
- Visual support for light mode, dark mode and focus mode.
- Interface languages: Catalan, Spanish and English.

<a id="en-installation-and-running-locally"></a>
### C. Installation and Running Locally

#### Requirements

- Node.js `>=20.9`.
- `pnpm` `11.1.2` or newer.
- Flutter stable compatible with Dart `^3.11.4`.
- Firebase CLI.
- Java Runtime for Firebase Emulator Suite and Firebase Rules tests.
- Xcode for iOS.
- Android Studio or Android SDK for Android.

#### Install JavaScript/TypeScript Dependencies

From the repository root:

```bash
pnpm install
```

#### Environment Variables and Secrets

The repository must not contain real secrets, service accounts or private native configuration files. Local `.env` files, signing keys and native Firebase files must stay outside Git.

Reference files included in the repository:

- `.env.example`
- `apps/web/.env.example`
- `packages/functions/.env.example`
- `apps/mobile/android/local.properties.example`
- `apps/mobile/ios/Flutter/Secrets.xcconfig.example`

Local files to create manually when needed:

- `apps/web/.env`
- `apps/mobile/android/app/google-services.json`
- `apps/mobile/ios/Runner/GoogleService-Info.plist`
- `apps/mobile/android/local.properties`
- `apps/mobile/ios/Flutter/Secrets.xcconfig`

#### Web Setup

Create `apps/web/.env` from `apps/web/.env.example` and define the public Firebase and Google Maps values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

For local development:

```bash
pnpm dev:web
```

The web application normally runs at:

```text
http://localhost:3000
```

Useful web checks:

```bash
pnpm --filter @accessibilitat/web typecheck
pnpm --filter @accessibilitat/web build
```

#### Mobile Setup

Enter the mobile application directory:

```bash
cd apps/mobile
flutter pub get
```

Run on Android:

```bash
flutter run -d android
```

Run on iOS:

```bash
flutter run -d ios
```

Enable native Google Maps during development:

```bash
flutter run --dart-define=SPECTRUM_GOOGLE_MAPS_ENABLED=true
```

Without this `dart-define`, the app can keep the visual fallback map to avoid local errors when native keys are not configured.

Mobile checks from the repository root:

```bash
pnpm mobile:analyze
pnpm mobile:test
```

#### Global Checks

```bash
pnpm typecheck
pnpm test
pnpm build
```

#### Firebase Emulators and Rules

Start emulators:

```bash
pnpm firebase:emulators
```

Run rules tests:

```bash
pnpm rules:test
```

These tests require Java and Firebase Emulator Suite.

<a id="en-project-structure"></a>
### D. Project Structure

Main monorepo structure:

```text
.
├── apps
│   ├── mobile
│   │   ├── android
│   │   ├── ios
│   │   ├── lib
│   │   └── test
│   └── web
│       ├── app
│       └── public
├── firebase
│   ├── firestore.indexes.json
│   ├── firestore.rules
│   └── storage.rules
├── packages
│   ├── functions
│   │   ├── src
│   │   └── tests
│   └── shared
│       └── src
├── .github
│   └── workflows
├── AGENTS.md
├── README.md
├── firebase.json
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

#### `apps/web`

Next.js, React and TypeScript web application.

Relevant files:

- `apps/web/app/page.tsx`: main web entry.
- `apps/web/app/platform-app.tsx`: web orchestration component.
- `apps/web/app/platform/`: UI copy, navigation, types, mappers, distance helpers, map config and hooks.
- `apps/web/app/admin/page.tsx`: administration area.
- `apps/web/app/lib/firebase.ts`: Firebase web initialization.
- `apps/web/app/lib/accessibilitat-api.ts`: client-side application API port.
- `apps/web/app/lib/firebase-api.ts`: Firebase adapter for the client-side API port.
- `apps/web/app/lib/firebase-actions.ts`: compatibility facade for existing web actions.
- `apps/web/app/lib/firebase-place-mappers.ts`: Firestore-to-shared-model mappers.
- `apps/web/app/lib/google-maps.ts`: Google Maps JavaScript API loader.
- `apps/web/public/brand/accessibilitat-logo.svg`: official web logo.

#### `apps/mobile`

Flutter application for iOS and Android.

Relevant files:

- `apps/mobile/lib/main.dart`: Flutter entry point.
- `apps/mobile/lib/spectrum_app.dart`: public `SpectrumAccessApp` entry point.
- `apps/mobile/lib/spectrum_shell.dart`: mobile shell, navigation and screens.
- `apps/mobile/lib/spectrum_application_service.dart`: mobile application service port.
- `apps/mobile/lib/firebase_services.dart`: Firebase adapter for the mobile service port.
- `apps/mobile/lib/mobile_state.dart`: mobile UI state models.
- `apps/mobile/lib/place_helpers.dart`: distance, ranking and sensory filtering helpers.
- `apps/mobile/lib/theme_preferences.dart`: persisted theme preferences.
- `apps/mobile/lib/mobile_google_maps.dart`: native Google Maps availability helper.
- `apps/mobile/lib/mobile_image_upload.dart`: image selection and metadata normalization.
- `apps/mobile/lib/spectrum_theme.dart`: theme, colors and components.
- `apps/mobile/lib/spectrum_content.dart`: texts, enums and UI constants.
- `apps/mobile/lib/firebase_options.dart`: generated Firebase options.
- `apps/mobile/assets/brand/accessibilitat-logo.svg`: official mobile logo.

#### `packages/shared`

Shared domain models, constants and validations.

Includes:

- User roles.
- Moderation statuses.
- Verification statuses.
- Place categories.
- Sensory criteria.
- Comment, report and verification types.
- Main data interfaces.
- Shared validations.

#### `packages/functions`

Firebase Cloud Functions backend.

The backend is organized as a modular monolith with internal Clean Architecture / hexagonal boundaries:

- `packages/functions/src/domain`: pure domain rules, review aggregate calculations, roles and domain errors.
- `packages/functions/src/application`: callable use cases and event handlers.
- `packages/functions/src/ports`: repository, auth, clock and logger contracts.
- `packages/functions/src/infrastructure/firebase`: Firestore/Auth/Functions adapters and mappers.
- `packages/functions/src/interfaces`: HTTPS callable and Firestore trigger adapters.
- `packages/functions/src/composition`: dependency wiring.
- `packages/functions/src/index.ts`: thin public Cloud Functions entry point.

Firestore triggers are treated as Firebase event adapters. They delegate to application handlers for review aggregate recalculation, image moderation notifications and verification audit events without introducing an external broker.

Main responsibilities:

- Creating places.
- Submitting reviews.
- Creating comments.
- Registering uploaded images.
- Creating reports.
- Creating tutored child profiles.
- Requesting professional verification.
- Requesting organization verification.
- Moderating content.
- Updating verification status.
- Recalculating place aggregates.
- Notifying rejected images.
- Auditing verification changes.

#### `firebase`

Firebase security configuration:

- `firestore.rules`: Firestore access rules.
- `storage.rules`: Firebase Storage access rules.
- `firestore.indexes.json`: required Firestore indexes.

<a id="en-main-features"></a>
### E. Main Features

#### 1. Sensory Map

The platform lets users consult places on a map with sensory information. The web app uses Google Maps when a valid key is configured and a visual fallback when it is not available.

Associated features:

- Place visualization.
- Search by name, city or category.
- Sensory filters.
- Map layers.
- Browser location with permission.
- Selected place panel.

#### 2. Place Details

Each place can include name, category, city, address or area, description, coordinates, moderation status, average score, review count and image count.

#### 3. Sensory Reviews

Users can contribute scores from 1 to 5 for criteria such as noise, crowd density, lighting, waiting time, staff treatment, quiet space, exit ease and perceived safety. Reviews initially enter `pending` status.

#### 4. Comments

Registered users can create comments about places or reviews. Comments are moderated content.

#### 5. Image Uploads

Registered users can upload images of places from the web or mobile app. Images belong to the authenticated user, are stored under controlled paths and enter `pending` moderation status.

#### 6. Favorites and Saved Places

The user experience includes saved places for quick access to relevant spaces.

#### 7. Reports

Users can report places, reviews, comments, images, professionals and organizations. Reports are created as `open` and reviewed by moderators.

#### 8. User Profiles

The platform supports standard users, trusted users, tutors, professionals, organizations, moderators and administrators. Standard public identity is based on pseudonyms to reduce unnecessary exposure.

#### 9. Tutors and Child Profiles

Child profiles do not have their own login or email in the current version. They live inside the tutor account. Contributions linked to a child profile require tutor review before moderation or publication.

#### 10. Verified Professionals

Professionals can request verification. Public profile information is separated from private documentary evidence.

#### 11. Verified Associations and Centres

Organizations can request verification and show public information such as name, city, description, website and registry identifier when available.

#### 12. Moderation and Administration

The administration area and Cloud Functions support reviewing pending content, changing moderation states, approving or rejecting verifications and recording sensitive administrative actions.

#### 13. Focus Mode

The web app includes a focus mode designed to reduce visual load and make map-based consultation calmer.

#### 14. Help Card

The support section includes a communication card for moments of overload or communication difficulty.

#### 15. Multilingual Interface

The interface is designed for Catalan, Spanish and English.

<a id="en-test-user-and-password"></a>
### F. Test User and Password

The project is prepared to work with Firebase Auth. Real test credentials are not committed to the public repository and must be created in the Firebase project used for the deployed or demo environment.

When the project is reviewed in an environment with login enabled, provide the credentials through a private channel using this format:

```text
Test user:
Password:
Role:
Environment URL:
```

Recommended test roles:

- Standard user: consult places, save places, submit reviews, comments, images and reports.
- Tutor user: manage child profiles and review child-linked contributions.
- Moderator or admin user: validate moderation, reports and verification flows when elevated claims are configured.

<a id="en-privacy-and-security-considerations"></a>
### Privacy and Security Considerations

Spectrum Access may handle sensitive contextual information even though it does not store medical diagnoses.

Applied principles:

- Data minimization.
- No medical reports requested.
- No diagnosis or clinical recommendations.
- Separation between public profile and private verification evidence.
- Moderation of public content.
- Child profiles protected inside tutor accounts.
- Restrictive Firestore and Storage Rules.
- App Check planned as an abuse-reduction layer.
- Secrets kept outside the repository.

Data that must not be committed:

- Real `.env` files.
- Service accounts.
- Private keys.
- Real `google-services.json` files.
- Real `GoogleService-Info.plist` files.
- Signing keys.
- Private native configuration files.
- Internal documents, screenshots, PDFs, concept images or work artifacts.

<a id="en-current-status-and-next-steps"></a>
### Current State

Available now:

- Production-style monorepo structure.
- Modular monolith architecture with internal Clean/Hexagonal boundaries and Firebase adapters.
- Working Next.js web application.
- Working Flutter app prepared for iOS and Android.
- Shared domain models and validations.
- Main Firebase Cloud Functions implemented.
- Firestore and Storage Rules defined.
- Google Maps integrated in the web app.
- Firebase configuration prepared for Auth, Firestore, Storage, Functions and App Check.
- Spectrum Access visual identity defined across web and mobile.
- Public repository documentation limited to `README.md` and `AGENTS.md`.

Configuration to adapt before production use:

- Set final Firebase Auth providers, domains and authorized clients.
- Configure real deployment environment variables outside the repository.
- Validate mobile builds on target iOS and Android devices.
- Review moderation and publication flows with real operational data.
- Extend visual and functional test coverage as the product grows.

<a id="en-license"></a>
### License

This project is distributed under the **GPL-3.0-only** license.

[Back to languages](#spectrum-access)

<a id="catala"></a>
## Català

<a id="ca-index"></a>
### Índex

- [A. Descripció General del Projecte](#ca-a-descripcio-general-del-projecte)
- [B. Stack Tecnològic](#ca-stack-tecnologic)
- [C. Instal·lació i Execució Local](#ca-installacio-i-execucio-local)
- [D. Estructura del Projecte](#ca-estructura-del-projecte)
- [E. Funcionalitats Principals](#ca-funcionalitats-principals)
- [F. Usuari i Contrasenya de Prova](#ca-usuari-i-contrasenya-de-prova)
- [Consideracions de Privacitat i Seguretat](#ca-consideracions-de-privacitat-i-seguretat)
- [Estat del Projecte](#ca-estat-actual-i-propers-passos)
- [Llicència](#ca-llicencia)

<a id="ca-a-descripcio-general-del-projecte"></a>
### A. Descripció General del Projecte

Spectrum Access és una plataforma web i mòbil per millorar la informació sobre accessibilitat sensorial en espais públics i privats. L'objectiu principal és permetre que la comunitat documenti com es perceben determinats llocs en aspectes com el soroll, la llum, l'afluència, el temps d'espera, la facilitat de sortida, l'existència d'espais tranquils i el tracte del personal.

El projecte s'adreça a:

- Persones autistes adultes o persones identificades que volen consultar i aportar informació sensorial.
- Tutors que gestionen perfils infantils dins del seu propi compte.
- Famílies que necessiten informació pràctica abans de visitar un lloc.
- Psicòlegs i professionals verificats.
- Associacions i centres d'autisme verificats.
- Moderadors i administradors responsables de revisar contingut, imatges i verificacions.

La plataforma no ofereix diagnòstics, recomanacions mèdiques ni consells clínics. La informació sensorial es tracta com a informació funcional i comunitària, no com a historial mèdic.

#### Problema Que Resol

Moltes persones autistes o amb sensibilitat sensorial necessiten anticipar com serà un entorn abans de visitar-lo. La informació habitual, com horaris, adreces o ressenyes generals, sovint no explica si un espai és sorollós, visualment intens, concorregut, fàcil d'abandonar o adequat per fer una pausa tranquil·la.

Spectrum Access cobreix aquest buit permetent:

- Consultar llocs en un mapa.
- Filtrar espais segons necessitats sensorials.
- Revisar fitxes amb puntuacions i comentaris.
- Guardar llocs útils.
- Preparar aportacions amb calma.
- Pujar imatges de suport.
- Reportar contingut incorrecte o sensible.
- Consultar perfils professionals i entitats verificades.

#### Enfocament Web i Mòbil

El projecte busca paritat funcional entre web i mòbil, adaptant cada interfície al seu context:

- L'app mòbil està pensada per a ús ràpid al carrer: consultar llocs propers, fer aportacions breus, accedir a ajuda i completar accions simples.
- La web està pensada com un entorn d'escriptori més tranquil: revisar informació amb més espai, completar aportacions, gestionar perfils, consultar verificacions i usar el mapa en pantalla gran.

<a id="ca-stack-tecnologic"></a>
### B. Stack Tecnològic

El repositori està organitzat com un monorepo amb `pnpm` per JavaScript/TypeScript i Flutter per a l'aplicació mòbil.

> Important: aquest projecte no utilitza `npm`. Totes les operacions JavaScript/TypeScript s'han de fer amb `pnpm`.

#### Frontend Web

- **Next.js 16.2.9**: aplicació web i zona d'administració.
- **React 19.2.7**: interfície principal de la web.
- **TypeScript 5.9.3**: tipatge estàtic.
- **Tailwind CSS 4.3.1**: base d'estils.
- **Lucide React**: icones de la interfície.
- **Google Maps JavaScript API**: mapa web interactiu.
- **Firebase Web SDK 12.15.0**: integració amb Auth, Firestore, Storage i Functions.

#### Aplicació Mòbil

- **Flutter**: aplicació iOS i Android.
- **Dart SDK `^3.11.4`**.
- **firebase_core**, **firebase_auth**, **cloud_firestore**, **firebase_storage**, **firebase_app_check** i **cloud_functions**.
- **google_sign_in** i **sign_in_with_apple** per a autenticació.
- **google_maps_flutter** per a mapes natius.
- **image_picker** per seleccionar imatges.
- **flutter_svg** i **google_fonts** per a identitat visual.

#### Backend i Serveis Cloud

- **Firebase Auth**: autenticació.
- **Cloud Firestore**: base de dades principal.
- **Firebase Storage**: imatges de llocs, fotos professionals, logos d'entitats i evidències privades.
- **Cloud Functions for Firebase**: lògica backend, moderació, agregats, verificacions i notificacions.
- **Firebase App Check**: protecció contra clients no autoritzats.
- **Firebase Emulator Suite**: proves locals de regles i serveis.

#### Infraestructura

- **pnpm 11.1.2** com a gestor de paquets JavaScript/TypeScript.
- **Node.js `>=20.9`**.
- **Cloud Functions runtime `nodejs22`**.
- **Firestore a `eur3`**.
- **Functions a `europe-west1`**.
- **Firebase Hosting** preparat per l'export estàtic de Next.js, però no necessari durant el desenvolupament local.

#### Disseny i Marca

- Nom del projecte: **Spectrum Access**.
- Logo oficial compartit entre web i mòbil.
- Suport visual per a mode clar, mode fosc i mode focus.
- Idiomes de la interfície: català, castellà i anglès.

<a id="ca-installacio-i-execucio-local"></a>
### C. Instal·lació i Execució Local

#### Requisits

- Node.js `>=20.9`.
- `pnpm` `11.1.2` o superior.
- Flutter stable compatible amb Dart `^3.11.4`.
- Firebase CLI.
- Java Runtime per a Firebase Emulator Suite i tests de regles Firebase.
- Xcode per a iOS.
- Android Studio o Android SDK per a Android.

#### Instal·lar Dependències JavaScript/TypeScript

Des de l'arrel del repositori:

```bash
pnpm install
```

#### Variables d'Entorn i Secrets

El repositori no ha de contenir secrets reals, comptes de servei ni fitxers natius privats. Els `.env` locals, claus de signing i fitxers Firebase natius han de quedar fora de Git.

Fitxers de referència inclosos:

- `.env.example`
- `apps/web/.env.example`
- `packages/functions/.env.example`
- `apps/mobile/android/local.properties.example`
- `apps/mobile/ios/Flutter/Secrets.xcconfig.example`

Fitxers locals que cal crear manualment quan sigui necessari:

- `apps/web/.env`
- `apps/mobile/android/app/google-services.json`
- `apps/mobile/ios/Runner/GoogleService-Info.plist`
- `apps/mobile/android/local.properties`
- `apps/mobile/ios/Flutter/Secrets.xcconfig`

#### Configuració Web

Crea `apps/web/.env` a partir de `apps/web/.env.example` i defineix els valors públics de Firebase i Google Maps:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Per al desenvolupament local:

```bash
pnpm dev:web
```

La web normalment s'executa a:

```text
http://localhost:3000
```

Checks útils de web:

```bash
pnpm --filter @accessibilitat/web typecheck
pnpm --filter @accessibilitat/web build
```

#### Configuració Mòbil

Entra al directori de l'app mòbil:

```bash
cd apps/mobile
flutter pub get
```

Executar a Android:

```bash
flutter run -d android
```

Executar a iOS:

```bash
flutter run -d ios
```

Activar Google Maps natiu durant el desenvolupament:

```bash
flutter run --dart-define=SPECTRUM_GOOGLE_MAPS_ENABLED=true
```

Sense aquest `dart-define`, l'app pot mantenir el mapa visual fallback per evitar errors locals quan no hi ha claus natives configurades.

Checks mòbils des de l'arrel:

```bash
pnpm mobile:analyze
pnpm mobile:test
```

#### Checks Globals

```bash
pnpm typecheck
pnpm test
pnpm build
```

#### Firebase Emulators i Regles

Arrencar emuladors:

```bash
pnpm firebase:emulators
```

Executar tests de regles:

```bash
pnpm rules:test
```

Aquests tests requereixen Java i Firebase Emulator Suite.

<a id="ca-estructura-del-projecte"></a>
### D. Estructura del Projecte

Estructura principal del monorepo:

```text
.
├── apps
│   ├── mobile
│   │   ├── android
│   │   ├── ios
│   │   ├── lib
│   │   └── test
│   └── web
│       ├── app
│       └── public
├── firebase
│   ├── firestore.indexes.json
│   ├── firestore.rules
│   └── storage.rules
├── packages
│   ├── functions
│   │   ├── src
│   │   └── tests
│   └── shared
│       └── src
├── .github
│   └── workflows
├── AGENTS.md
├── README.md
├── firebase.json
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

#### `apps/web`

Aplicació web Next.js, React i TypeScript.

Fitxers rellevants:

- `apps/web/app/page.tsx`: entrada principal de la web.
- `apps/web/app/platform-app.tsx`: component d'orquestració de la web.
- `apps/web/app/platform/`: còpia de UI, navegació, tipus, mappers, helpers de distància, configuració de mapa i hooks.
- `apps/web/app/admin/page.tsx`: zona d'administració.
- `apps/web/app/lib/firebase.ts`: inicialització Firebase web.
- `apps/web/app/lib/accessibilitat-api.ts`: port d'API d'aplicació del client web.
- `apps/web/app/lib/firebase-api.ts`: adaptador Firebase del port d'API del client.
- `apps/web/app/lib/firebase-actions.ts`: façana de compatibilitat per a les accions web existents.
- `apps/web/app/lib/firebase-place-mappers.ts`: mappers de Firestore cap als models compartits.
- `apps/web/app/lib/google-maps.ts`: carregador de Google Maps JavaScript API.
- `apps/web/public/brand/accessibilitat-logo.svg`: logo oficial web.

#### `apps/mobile`

Aplicació Flutter per iOS i Android.

Fitxers rellevants:

- `apps/mobile/lib/main.dart`: punt d'entrada de Flutter.
- `apps/mobile/lib/spectrum_app.dart`: punt d'entrada públic `SpectrumAccessApp`.
- `apps/mobile/lib/spectrum_shell.dart`: shell mòbil, navegació i pantalles.
- `apps/mobile/lib/spectrum_application_service.dart`: port del servei d'aplicació mòbil.
- `apps/mobile/lib/firebase_services.dart`: adaptador Firebase del port mòbil.
- `apps/mobile/lib/mobile_state.dart`: models d'estat de UI mòbil.
- `apps/mobile/lib/place_helpers.dart`: helpers de distància, rànquing i filtratge sensorial.
- `apps/mobile/lib/theme_preferences.dart`: preferències de tema persistides.
- `apps/mobile/lib/mobile_google_maps.dart`: helper de disponibilitat de Google Maps natiu.
- `apps/mobile/lib/mobile_image_upload.dart`: selecció d'imatges i normalització de metadades.
- `apps/mobile/lib/spectrum_theme.dart`: tema, colors i components.
- `apps/mobile/lib/spectrum_content.dart`: textos, enums i constants de UI.
- `apps/mobile/lib/firebase_options.dart`: opcions Firebase generades.
- `apps/mobile/assets/brand/accessibilitat-logo.svg`: logo oficial mòbil.

#### `packages/shared`

Models, constants i validacions compartides de domini.

Inclou:

- Rols d'usuari.
- Estats de moderació.
- Estats de verificació.
- Categories de llocs.
- Criteris sensorials.
- Tipus de comentaris, reports i verificacions.
- Interfícies principals de dades.
- Validacions compartides.

#### `packages/functions`

Backend Firebase Cloud Functions.

El backend està organitzat com un monòlit modular amb límits interns de Clean Architecture / arquitectura hexagonal:

- `packages/functions/src/domain`: regles pures de domini, càlculs d'agregats de reviews, rols i errors de domini.
- `packages/functions/src/application`: casos d'ús callable i handlers d'esdeveniments.
- `packages/functions/src/ports`: contractes de repositori, auth, rellotge i logger.
- `packages/functions/src/infrastructure/firebase`: adaptadors i mappers de Firestore/Auth/Functions.
- `packages/functions/src/interfaces`: adaptadors HTTPS callable i triggers Firestore.
- `packages/functions/src/composition`: wiring de dependències.
- `packages/functions/src/index.ts`: entry point públic prim de Cloud Functions.

Els triggers de Firestore es tracten com adaptadors d'esdeveniments Firebase. Deleguen a handlers d'aplicació per recalcular agregats de reviews, notificar moderació d'imatges i auditar canvis de verificació sense introduir un broker extern.

Responsabilitats principals:

- Crear llocs.
- Enviar valoracions.
- Crear comentaris.
- Registrar imatges pujades.
- Crear reports.
- Crear perfils infantils tutelats.
- Sol·licitar verificació professional.
- Sol·licitar verificació d'entitat.
- Moderar contingut.
- Actualitzar estat de verificació.
- Recalcular agregats de llocs.
- Notificar imatges rebutjades.
- Auditar canvis de verificació.

#### `firebase`

Configuració de seguretat Firebase:

- `firestore.rules`: regles d'accés a Firestore.
- `storage.rules`: regles d'accés a Firebase Storage.
- `firestore.indexes.json`: índexs necessaris de Firestore.

<a id="ca-funcionalitats-principals"></a>
### E. Funcionalitats Principals

#### 1. Mapa Sensorial

La plataforma permet consultar llocs en un mapa amb informació sensorial. La web utilitza Google Maps quan hi ha una clau vàlida configurada i un fallback visual quan no està disponible.

Funcionalitats associades:

- Visualització de llocs.
- Cerca per nom, ciutat o categoria.
- Filtres sensorials.
- Capes de mapa.
- Ubicació del navegador amb permís.
- Panell del lloc seleccionat.

#### 2. Fitxa de Lloc

Cada lloc pot incloure nom, categoria, ciutat, adreça o zona, descripció, coordenades, estat de moderació, puntuació mitjana, nombre de valoracions i nombre d'imatges.

#### 3. Valoracions Sensorials

Els usuaris poden aportar puntuacions de l'1 al 5 per criteris com soroll, afluència, llum, espera, tracte del personal, espai tranquil, facilitat de sortida i seguretat percebuda. Les valoracions entren inicialment en estat `pending`.

#### 4. Comentaris

Els usuaris registrats poden crear comentaris sobre llocs o valoracions. Els comentaris són contingut moderable.

#### 5. Pujada d'Imatges

Els usuaris registrats poden pujar imatges de llocs des de la web o l'app. Les imatges pertanyen a l'usuari autenticat, es guarden en rutes controlades i entren en estat `pending`.

#### 6. Favorits i Llocs Guardats

L'experiència d'usuari inclou llocs guardats per accedir ràpidament a espais rellevants.

#### 7. Reports

Els usuaris poden reportar llocs, valoracions, comentaris, imatges, professionals i organitzacions. Els reports es creen com `open` i són revisats per moderadors.

#### 8. Perfils d'Usuari

La plataforma contempla usuaris estàndard, usuaris de confiança, tutors, professionals, organitzacions, moderadors i administradors. La identitat pública estàndard es basa en pseudònim per reduir exposició innecessària.

#### 9. Tutors i Perfils Infantils

Els perfils infantils no tenen login propi ni email independent en la versió actual. Viuen dins del compte del tutor. Les aportacions vinculades a un perfil infantil requereixen revisió del tutor abans de la moderació o publicació.

#### 10. Professionals Verificats

Els professionals poden sol·licitar verificació. La informació pública del perfil se separa de l'evidència documental privada.

#### 11. Associacions i Centres Verificats

Les entitats poden sol·licitar verificació i mostrar informació pública com nom, ciutat, descripció, web i identificador registral quan estigui disponible.

#### 12. Moderació i Administració

La zona d'administració i les Cloud Functions permeten revisar contingut pendent, canviar estats de moderació, aprovar o rebutjar verificacions i registrar accions administratives sensibles.

#### 13. Mode Focus

La web inclou un mode focus pensat per reduir càrrega visual i fer més tranquil·la la consulta amb mapa.

#### 14. Targeta d'Ajuda

La secció d'ajuda inclou una targeta de comunicació per a moments de sobrecàrrega o dificultat comunicativa.

#### 15. Interfície Multidioma

La interfície està plantejada en català, castellà i anglès.

<a id="ca-usuari-i-contrasenya-de-prova"></a>
### F. Usuari i Contrasenya de Prova

El projecte està preparat per treballar amb Firebase Auth. Les credencials reals de prova no s'inclouen al repositori públic i s'han de crear al projecte Firebase utilitzat per a l'entorn desplegat o de demo.

Quan el projecte es revisi en un entorn amb login activat, proporciona les credencials per un canal privat amb aquest format:

```text
Usuari de prova:
Contrasenya:
Rol:
URL de l'entorn:
```

Rols de prova recomanats:

- Usuari estàndard: consultar llocs, guardar llocs, enviar valoracions, comentaris, imatges i reports.
- Tutor: gestionar perfils infantils i revisar aportacions vinculades a menors.
- Moderador o administrador: validar fluxos de moderació, reports i verificacions quan les claims elevades estiguin configurades.

<a id="ca-consideracions-de-privacitat-i-seguretat"></a>
### Consideracions de Privacitat i Seguretat

Spectrum Access pot tractar informació contextual sensible encara que no emmagatzemi diagnòstics mèdics.

Principis aplicats:

- Minimització de dades.
- No sol·licitar informes mèdics.
- No oferir diagnòstics ni recomanacions clíniques.
- Separació entre perfil públic i evidència privada de verificació.
- Moderació de contingut públic.
- Perfils infantils protegits dins comptes de tutor.
- Firestore Rules i Storage Rules restrictives.
- App Check previst com a capa de reducció d'abús.
- Secrets fora del repositori.

Dades que no s'han d'incloure al repositori:

- `.env` reals.
- Comptes de servei.
- Claus privades.
- `google-services.json` reals.
- `GoogleService-Info.plist` reals.
- Claus de signing.
- Configuracions natives privades.
- Documents interns, captures, PDFs, imatges de concepte o artefactes de treball.

<a id="ca-estat-actual-i-propers-passos"></a>
### Estat del Projecte

Disponible ara:

- Estructura de monorepo amb enfocament de producte.
- Arquitectura de monòlit modular amb límits interns Clean/Hexagonal i adaptadors Firebase.
- Aplicació web Next.js funcional.
- App Flutter funcional preparada per iOS i Android.
- Models i validacions de domini compartits.
- Cloud Functions principals implementades.
- Firestore Rules i Storage Rules definides.
- Google Maps integrat a la web.
- Configuració Firebase preparada per Auth, Firestore, Storage, Functions i App Check.
- Identitat visual de Spectrum Access definida a web i mòbil.
- Documentació pública limitada a `README.md` i `AGENTS.md`.

Configuració a adaptar abans d'ús en producció:

- Definir els proveïdors finals de Firebase Auth, dominis i clients autoritzats.
- Configurar variables d'entorn reals fora del repositori.
- Validar builds mòbils en dispositius iOS i Android objectiu.
- Revisar els fluxos de moderació i publicació amb dades operatives reals.
- Ampliar la cobertura de tests visuals i funcionals a mesura que el producte creixi.

<a id="ca-llicencia"></a>
### Llicència

Aquest projecte es distribueix sota la llicència **GPL-3.0-only**.

[Torna als idiomes](#spectrum-access)

<a id="castellano"></a>
## Castellano

<a id="es-index"></a>
### Índice

- [A. Descripción General del Proyecto](#es-a-descripcion-general-del-proyecto)
- [B. Stack Tecnológico](#es-stack-tecnologico)
- [C. Instalación y Ejecución Local](#es-instalacion-y-ejecucion-local)
- [D. Estructura del Proyecto](#es-estructura-del-proyecto)
- [E. Funcionalidades Principales](#es-funcionalidades-principales)
- [F. Usuario y Contraseña de Prueba](#es-usuario-y-contrasena-de-prueba)
- [Consideraciones de Privacidad y Seguridad](#es-consideraciones-de-privacidad-y-seguridad)
- [Estado del Proyecto](#es-estado-actual-y-proximos-pasos)
- [Licencia](#es-licencia)

<a id="es-a-descripcion-general-del-proyecto"></a>
### A. Descripción General del Proyecto

Spectrum Access es una plataforma web y móvil para mejorar la información sobre accesibilidad sensorial en espacios públicos y privados. El objetivo principal es permitir que la comunidad documente cómo se perciben determinados lugares en aspectos como ruido, iluminación, afluencia, tiempo de espera, facilidad de salida, existencia de espacios tranquilos y trato del personal.

El proyecto se dirige a:

- Personas autistas adultas o personas identificadas que quieran consultar y aportar información sensorial.
- Tutores que gestionan perfiles infantiles dentro de su propia cuenta.
- Familias que necesitan información práctica antes de visitar un lugar.
- Psicólogos y profesionales verificados.
- Asociaciones y centros de autismo verificados.
- Moderadores y administradores encargados de revisar contenido, imágenes y verificaciones.

La plataforma no ofrece diagnósticos, recomendaciones médicas ni consejos clínicos. La información sensorial se trata como información funcional y comunitaria, no como historial médico.

#### Problema Que Resuelve

Muchas personas autistas o con sensibilidad sensorial necesitan anticipar cómo será un entorno antes de visitarlo. La información habitual, como horarios, direcciones o reseñas generales, no suele explicar si un espacio es ruidoso, visualmente intenso, concurrido, fácil de abandonar o adecuado para una pausa tranquila.

Spectrum Access cubre ese vacío permitiendo:

- Consultar lugares en un mapa.
- Filtrar espacios según necesidades sensoriales.
- Revisar fichas con puntuaciones y comentarios.
- Guardar lugares útiles.
- Preparar aportaciones con calma.
- Subir imágenes de apoyo.
- Reportar contenido incorrecto o sensible.
- Consultar perfiles profesionales y entidades verificadas.

#### Enfoque Web y Móvil

El proyecto busca paridad funcional entre web y móvil, adaptando cada interfaz a su contexto:

- La app móvil está pensada para uso rápido en la calle: consultar lugares cercanos, hacer aportaciones breves, acceder a ayuda y completar acciones simples.
- La web está pensada como un entorno de escritorio más tranquilo: revisar información con más espacio, completar aportaciones, gestionar perfiles, consultar verificaciones y usar el mapa en pantalla grande.

<a id="es-stack-tecnologico"></a>
### B. Stack Tecnológico

El repositorio está organizado como un monorepo con `pnpm` para JavaScript/TypeScript y Flutter para la aplicación móvil.

> Importante: este proyecto no utiliza `npm`. Todas las operaciones JavaScript/TypeScript se deben ejecutar con `pnpm`.

#### Frontend Web

- **Next.js 16.2.9**: aplicación web y zona de administración.
- **React 19.2.7**: interfaz principal de la web.
- **TypeScript 5.9.3**: tipado estático.
- **Tailwind CSS 4.3.1**: base de estilos.
- **Lucide React**: iconos de interfaz.
- **Google Maps JavaScript API**: mapa web interactivo.
- **Firebase Web SDK 12.15.0**: integración con Auth, Firestore, Storage y Functions.

#### Aplicación Móvil

- **Flutter**: aplicación iOS y Android.
- **Dart SDK `^3.11.4`**.
- **firebase_core**, **firebase_auth**, **cloud_firestore**, **firebase_storage**, **firebase_app_check** y **cloud_functions**.
- **google_sign_in** y **sign_in_with_apple** para autenticación.
- **google_maps_flutter** para mapas nativos.
- **image_picker** para seleccionar imágenes.
- **flutter_svg** y **google_fonts** para identidad visual.

#### Backend y Servicios Cloud

- **Firebase Auth**: autenticación.
- **Cloud Firestore**: base de datos principal.
- **Firebase Storage**: imágenes de lugares, fotos profesionales, logos de entidades y evidencias privadas.
- **Cloud Functions for Firebase**: lógica backend, moderación, agregados, verificaciones y notificaciones.
- **Firebase App Check**: protección contra clientes no autorizados.
- **Firebase Emulator Suite**: pruebas locales de reglas y servicios.

#### Infraestructura

- **pnpm 11.1.2** como gestor de paquetes JavaScript/TypeScript.
- **Node.js `>=20.9`**.
- **Cloud Functions runtime `nodejs22`**.
- **Firestore en `eur3`**.
- **Functions en `europe-west1`**.
- **Firebase Hosting** preparado para el export estático de Next.js, pero no necesario durante el desarrollo local.

#### Diseño y Marca

- Nombre del proyecto: **Spectrum Access**.
- Logo oficial compartido entre web y móvil.
- Soporte visual para modo claro, modo oscuro y modo focus.
- Idiomas de la interfaz: catalán, castellano e inglés.

<a id="es-instalacion-y-ejecucion-local"></a>
### C. Instalación y Ejecución Local

#### Requisitos

- Node.js `>=20.9`.
- `pnpm` `11.1.2` o superior.
- Flutter stable compatible con Dart `^3.11.4`.
- Firebase CLI.
- Java Runtime para Firebase Emulator Suite y tests de reglas Firebase.
- Xcode para iOS.
- Android Studio o Android SDK para Android.

#### Instalar Dependencias JavaScript/TypeScript

Desde la raíz del repositorio:

```bash
pnpm install
```

#### Variables de Entorno y Secretos

El repositorio no debe contener secretos reales, cuentas de servicio ni archivos nativos privados. Los `.env` locales, claves de signing y archivos Firebase nativos deben quedar fuera de Git.

Archivos de referencia incluidos:

- `.env.example`
- `apps/web/.env.example`
- `packages/functions/.env.example`
- `apps/mobile/android/local.properties.example`
- `apps/mobile/ios/Flutter/Secrets.xcconfig.example`

Archivos locales que deben crearse manualmente cuando sea necesario:

- `apps/web/.env`
- `apps/mobile/android/app/google-services.json`
- `apps/mobile/ios/Runner/GoogleService-Info.plist`
- `apps/mobile/android/local.properties`
- `apps/mobile/ios/Flutter/Secrets.xcconfig`

#### Configuración Web

Crea `apps/web/.env` a partir de `apps/web/.env.example` y define los valores públicos de Firebase y Google Maps:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Para desarrollo local:

```bash
pnpm dev:web
```

La web normalmente se ejecuta en:

```text
http://localhost:3000
```

Checks útiles de web:

```bash
pnpm --filter @accessibilitat/web typecheck
pnpm --filter @accessibilitat/web build
```

#### Configuración Móvil

Entra en el directorio de la app móvil:

```bash
cd apps/mobile
flutter pub get
```

Ejecutar en Android:

```bash
flutter run -d android
```

Ejecutar en iOS:

```bash
flutter run -d ios
```

Activar Google Maps nativo durante el desarrollo:

```bash
flutter run --dart-define=SPECTRUM_GOOGLE_MAPS_ENABLED=true
```

Sin este `dart-define`, la app puede mantener el mapa visual fallback para evitar errores locales cuando no hay claves nativas configuradas.

Checks móviles desde la raíz:

```bash
pnpm mobile:analyze
pnpm mobile:test
```

#### Checks Globales

```bash
pnpm typecheck
pnpm test
pnpm build
```

#### Firebase Emulators y Reglas

Arrancar emuladores:

```bash
pnpm firebase:emulators
```

Ejecutar tests de reglas:

```bash
pnpm rules:test
```

Estos tests requieren Java y Firebase Emulator Suite.

<a id="es-estructura-del-proyecto"></a>
### D. Estructura del Proyecto

Estructura principal del monorepo:

```text
.
├── apps
│   ├── mobile
│   │   ├── android
│   │   ├── ios
│   │   ├── lib
│   │   └── test
│   └── web
│       ├── app
│       └── public
├── firebase
│   ├── firestore.indexes.json
│   ├── firestore.rules
│   └── storage.rules
├── packages
│   ├── functions
│   │   ├── src
│   │   └── tests
│   └── shared
│       └── src
├── .github
│   └── workflows
├── AGENTS.md
├── README.md
├── firebase.json
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

#### `apps/web`

Aplicación web Next.js, React y TypeScript.

Archivos relevantes:

- `apps/web/app/page.tsx`: entrada principal de la web.
- `apps/web/app/platform-app.tsx`: componente de orquestación de la web.
- `apps/web/app/platform/`: copia de UI, navegación, tipos, mappers, helpers de distancia, configuración de mapa y hooks.
- `apps/web/app/admin/page.tsx`: zona de administración.
- `apps/web/app/lib/firebase.ts`: inicialización Firebase web.
- `apps/web/app/lib/accessibilitat-api.ts`: puerto de API de aplicación del cliente web.
- `apps/web/app/lib/firebase-api.ts`: adaptador Firebase del puerto de API del cliente.
- `apps/web/app/lib/firebase-actions.ts`: fachada de compatibilidad para las acciones web existentes.
- `apps/web/app/lib/firebase-place-mappers.ts`: mappers de Firestore hacia los modelos compartidos.
- `apps/web/app/lib/google-maps.ts`: cargador de Google Maps JavaScript API.
- `apps/web/public/brand/accessibilitat-logo.svg`: logo oficial web.

#### `apps/mobile`

Aplicación Flutter para iOS y Android.

Archivos relevantes:

- `apps/mobile/lib/main.dart`: punto de entrada de Flutter.
- `apps/mobile/lib/spectrum_app.dart`: punto de entrada público `SpectrumAccessApp`.
- `apps/mobile/lib/spectrum_shell.dart`: shell móvil, navegación y pantallas.
- `apps/mobile/lib/spectrum_application_service.dart`: puerto del servicio de aplicación móvil.
- `apps/mobile/lib/firebase_services.dart`: adaptador Firebase del puerto móvil.
- `apps/mobile/lib/mobile_state.dart`: modelos de estado de UI móvil.
- `apps/mobile/lib/place_helpers.dart`: helpers de distancia, ranking y filtrado sensorial.
- `apps/mobile/lib/theme_preferences.dart`: preferencias de tema persistidas.
- `apps/mobile/lib/mobile_google_maps.dart`: helper de disponibilidad de Google Maps nativo.
- `apps/mobile/lib/mobile_image_upload.dart`: selección de imágenes y normalización de metadatos.
- `apps/mobile/lib/spectrum_theme.dart`: tema, colores y componentes.
- `apps/mobile/lib/spectrum_content.dart`: textos, enums y constantes de UI.
- `apps/mobile/lib/firebase_options.dart`: opciones Firebase generadas.
- `apps/mobile/assets/brand/accessibilitat-logo.svg`: logo oficial móvil.

#### `packages/shared`

Modelos, constantes y validaciones compartidas de dominio.

Incluye:

- Roles de usuario.
- Estados de moderación.
- Estados de verificación.
- Categorías de lugares.
- Criterios sensoriales.
- Tipos de comentarios, reportes y verificaciones.
- Interfaces principales de datos.
- Validaciones compartidas.

#### `packages/functions`

Backend Firebase Cloud Functions.

El backend está organizado como un monolito modular con límites internos de Clean Architecture / arquitectura hexagonal:

- `packages/functions/src/domain`: reglas puras de dominio, cálculos de agregados de reviews, roles y errores de dominio.
- `packages/functions/src/application`: casos de uso callable y handlers de eventos.
- `packages/functions/src/ports`: contratos de repositorio, auth, reloj y logger.
- `packages/functions/src/infrastructure/firebase`: adaptadores y mappers de Firestore/Auth/Functions.
- `packages/functions/src/interfaces`: adaptadores HTTPS callable y triggers Firestore.
- `packages/functions/src/composition`: wiring de dependencias.
- `packages/functions/src/index.ts`: entry point público fino de Cloud Functions.

Los triggers de Firestore se tratan como adaptadores de eventos Firebase. Delegan en handlers de aplicación para recalcular agregados de reviews, notificar moderación de imágenes y auditar cambios de verificación sin introducir un broker externo.

Responsabilidades principales:

- Crear lugares.
- Enviar valoraciones.
- Crear comentarios.
- Registrar imágenes subidas.
- Crear reportes.
- Crear perfiles infantiles tutelados.
- Solicitar verificación profesional.
- Solicitar verificación de entidad.
- Moderar contenido.
- Actualizar estado de verificación.
- Recalcular agregados de lugares.
- Notificar imágenes rechazadas.
- Auditar cambios de verificación.

#### `firebase`

Configuración de seguridad Firebase:

- `firestore.rules`: reglas de acceso a Firestore.
- `storage.rules`: reglas de acceso a Firebase Storage.
- `firestore.indexes.json`: índices necesarios de Firestore.

<a id="es-funcionalidades-principales"></a>
### E. Funcionalidades Principales

#### 1. Mapa Sensorial

La plataforma permite consultar lugares en un mapa con información sensorial. La web utiliza Google Maps cuando hay una clave válida configurada y un fallback visual cuando no está disponible.

Funcionalidades asociadas:

- Visualización de lugares.
- Búsqueda por nombre, ciudad o categoría.
- Filtros sensoriales.
- Capas de mapa.
- Ubicación del navegador con permiso.
- Panel del lugar seleccionado.

#### 2. Ficha de Lugar

Cada lugar puede incluir nombre, categoría, ciudad, dirección o zona, descripción, coordenadas, estado de moderación, puntuación media, número de valoraciones y número de imágenes.

#### 3. Valoraciones Sensoriales

Los usuarios pueden aportar puntuaciones del 1 al 5 para criterios como ruido, afluencia, luz, espera, trato del personal, espacio tranquilo, facilidad de salida y seguridad percibida. Las valoraciones entran inicialmente en estado `pending`.

#### 4. Comentarios

Los usuarios registrados pueden crear comentarios sobre lugares o valoraciones. Los comentarios son contenido moderable.

#### 5. Subida de Imágenes

Los usuarios registrados pueden subir imágenes de lugares desde la web o la app. Las imágenes pertenecen al usuario autenticado, se guardan en rutas controladas y entran en estado `pending`.

#### 6. Favoritos y Lugares Guardados

La experiencia de usuario incluye lugares guardados para acceder rápidamente a espacios relevantes.

#### 7. Reportes

Los usuarios pueden reportar lugares, valoraciones, comentarios, imágenes, profesionales y organizaciones. Los reportes se crean como `open` y son revisados por moderadores.

#### 8. Perfiles de Usuario

La plataforma contempla usuarios estándar, usuarios de confianza, tutores, profesionales, organizaciones, moderadores y administradores. La identidad pública estándar se basa en pseudónimo para reducir exposición innecesaria.

#### 9. Tutores y Perfiles Infantiles

Los perfiles infantiles no tienen login propio ni email independiente en la versión actual. Viven dentro de la cuenta del tutor. Las aportaciones vinculadas a un perfil infantil requieren revisión del tutor antes de la moderación o publicación.

#### 10. Profesionales Verificados

Los profesionales pueden solicitar verificación. La información pública del perfil se separa de la evidencia documental privada.

#### 11. Asociaciones y Centros Verificados

Las entidades pueden solicitar verificación y mostrar información pública como nombre, ciudad, descripción, web e identificador registral cuando esté disponible.

#### 12. Moderación y Administración

La zona de administración y las Cloud Functions permiten revisar contenido pendiente, cambiar estados de moderación, aprobar o rechazar verificaciones y registrar acciones administrativas sensibles.

#### 13. Modo Focus

La web incluye un modo focus pensado para reducir carga visual y hacer más tranquila la consulta con mapa.

#### 14. Tarjeta de Ayuda

La sección de ayuda incluye una tarjeta de comunicación para momentos de sobrecarga o dificultad comunicativa.

#### 15. Interfaz Multidioma

La interfaz está planteada en catalán, castellano e inglés.

<a id="es-usuario-y-contrasena-de-prueba"></a>
### F. Usuario y Contraseña de Prueba

El proyecto está preparado para trabajar con Firebase Auth. Las credenciales reales de prueba no se incluyen en el repositorio público y deben crearse en el proyecto Firebase utilizado para el entorno desplegado o de demo.

Cuando el proyecto se revise en un entorno con login activado, proporciona las credenciales por un canal privado con este formato:

```text
Usuario de prueba:
Contraseña:
Rol:
URL del entorno:
```

Roles de prueba recomendados:

- Usuario estándar: consultar lugares, guardar lugares, enviar valoraciones, comentarios, imágenes y reportes.
- Tutor: gestionar perfiles infantiles y revisar aportaciones vinculadas a menores.
- Moderador o administrador: validar flujos de moderación, reportes y verificaciones cuando las claims elevadas estén configuradas.

<a id="es-consideraciones-de-privacidad-y-seguridad"></a>
### Consideraciones de Privacidad y Seguridad

Spectrum Access puede tratar información contextual sensible aunque no almacene diagnósticos médicos.

Principios aplicados:

- Minimización de datos.
- No solicitar informes médicos.
- No ofrecer diagnósticos ni recomendaciones clínicas.
- Separación entre perfil público y evidencia privada de verificación.
- Moderación de contenido público.
- Perfiles infantiles protegidos dentro de cuentas de tutor.
- Firestore Rules y Storage Rules restrictivas.
- App Check previsto como capa de reducción de abuso.
- Secretos fuera del repositorio.

Datos que no deben incluirse en el repositorio:

- `.env` reales.
- Cuentas de servicio.
- Claves privadas.
- `google-services.json` reales.
- `GoogleService-Info.plist` reales.
- Claves de signing.
- Configuraciones nativas privadas.
- Documentos internos, capturas, PDFs, imágenes de concepto o artefactos de trabajo.

<a id="es-estado-actual-y-proximos-pasos"></a>
### Estado del Proyecto

Disponible ahora:

- Estructura de monorepo con enfoque de producto.
- Arquitectura de monolito modular con límites internos Clean/Hexagonal y adaptadores Firebase.
- Aplicación web Next.js funcional.
- App Flutter funcional preparada para iOS y Android.
- Modelos y validaciones de dominio compartidos.
- Cloud Functions principales implementadas.
- Firestore Rules y Storage Rules definidas.
- Google Maps integrado en la web.
- Configuración Firebase preparada para Auth, Firestore, Storage, Functions y App Check.
- Identidad visual de Spectrum Access definida en web y móvil.
- Documentación pública limitada a `README.md` y `AGENTS.md`.

Configuración a adaptar antes de uso en producción:

- Definir los proveedores finales de Firebase Auth, dominios y clientes autorizados.
- Configurar variables de entorno reales fuera del repositorio.
- Validar builds móviles en dispositivos iOS y Android objetivo.
- Revisar los flujos de moderación y publicación con datos operativos reales.
- Ampliar la cobertura de tests visuales y funcionales a medida que el producto crezca.

<a id="es-licencia"></a>
### Licencia

Este proyecto se distribuye bajo la licencia **GPL-3.0-only**.

[Volver a los idiomas](#spectrum-access)
