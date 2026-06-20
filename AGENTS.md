# AGENTS.md

Instruccions per a agents que treballin en aquest projecte.

## Regla prioritària

- No facis servir mai `npm`. Aquest repositori fa servir sempre `pnpm` per a JavaScript/TypeScript.
- Si cal instal·lar, executar scripts o afegir dependències JS/TS, usa `pnpm`.
- Si tens un TXT enganxat i no hi ha cap altra instrucció, llegeix el TXT i aplica el que diu.
- No afegeixis al repositori captures, imatges de concepte, PDFs, documents interns, notes de treball, renders, exportacions, proves visuals ni cap altre artefacte auxiliar generat durant la feina.
- La documentació pública permesa al repo és només `README.md` i `AGENTS.md`. Qualsevol altre `.md` és intern per defecte i no s'ha de versionar.

## Fitxers interns i artefactes prohibits al repo

Aquest és un projecte universitari i el repositori públic ha de quedar net, professional i sense materials interns de treball.

No s'han de crear, moure, afegir ni commitejar dins del projecte:

- Carpetes de treball com `docs/`, `DocsD5/`, `artifacts/`, `exports/`, `screenshots/`, `captures/`, `tmp/` o similars.
- Captures de pantalla, imatges de referència, imatges de concepte, renders, mockups exportats, fotos temporals o fitxers de proves visuals.
- PDFs, documents de treball, notes internes, fitxers Markdown interns o qualsevol document generat per explicar decisions de l'agent.
- Fitxers del tipus `Captura de pantalla*.png`, `*.pdf`, `*.heic`, `*.webp`, `*.jpg`, `*.jpeg` o `*.png` quan siguin materials interns i no assets necessaris de l'app.

Quan calgui crear qualsevol material auxiliar per treballar amb el propietari, s'ha de desar fora del repositori a:

```text
~/Desktop/DocsD5/Spectrum_Access/
```

Si un agent necessita proposar documentació nova, primer ho ha de posar al missatge de resposta o a `~/Desktop/DocsD5/Spectrum_Access/`; no ha de crear cap `.md` nou dins del repo. Si cal canviar documentació versionada, només pot tocar `README.md` o `AGENTS.md`.

Abans de qualsevol `git add`, s'ha de comprovar:

```bash
git status --short
git ls-files '*.md'
git ls-files | rg -i '^(docs/|DocsD5/|artifacts/|exports/|screenshots/|captures/)|\.(pdf|png|jpe?g|webp|heic|heif)$'
```

Només són acceptables les imatges estrictament necessàries per compilar o publicar l'app, com icones natives i assets públics finals. Si hi ha dubte, no les afegeixis i pregunta.

## Context del projecte

Aquest repo és la plataforma oberta d'accessibilitat sensorial `Spectrum Access`, un MVP web i mòbil per consultar, valorar i documentar espais segons criteris d'accessibilitat sensorial per a persones autistes, famílies, tutors, associacions i professionals verificats.

La plataforma no ofereix diagnòstics, recomanacions clíniques ni IA mèdica. Tracta les dades sensorials com a preferències funcionals i informació comunitària, no com a historial mèdic.

## Estructura

- `apps/web`: app web Next.js 16, React 19 i Tailwind CSS.
- `apps/mobile`: app Flutter iOS/Android.
- `packages/shared`: models, constants, etiquetes i validacions compartides.
- `packages/functions`: Cloud Functions Firebase i tests de regles.
- `firebase`: Firestore Rules, Storage Rules i índexs.
- `docs`: especificació funcional, arquitectura, privacitat, setup i disseny.

## Comandes

Executa les comandes des de l'arrel tret que s'indiqui el contrari.

- Instal·lació JS/TS: `pnpm install`
- Web local: `pnpm dev:web`
- Build complet: `pnpm build`
- Typecheck complet: `pnpm typecheck`
- Tests JS/TS: `pnpm test`
- Emuladors Firebase: `pnpm firebase:emulators`
- Tests de regles: `pnpm rules:test`
- Anàlisi Flutter: `pnpm mobile:analyze`
- Tests Flutter: `pnpm mobile:test`

Per a comandes directes de Flutter, entra a `apps/mobile` i usa `flutter pub get`, `flutter analyze` o `flutter test`.

## Arquitectura i decisions que cal preservar

- Monorepo amb `pnpm` fixat a `pnpm@11.1.2`.
- Node requerit: `>=20.9`; CI actualment usa Node 24.
- Web Next.js amb `output: "export"` per Firebase Hosting.
- Backend Firebase: Auth, Firestore, Storage, App Check i Cloud Functions.
- Cloud Functions configuren runtime `nodejs22` a `firebase.json`.
- Firestore s'ha de mantenir a `eur3`; no canviïs aquesta decisió sense migració explícita.
- Firebase project actual: `spectrum-access-499918`.

## Producte i domini

- Web i app mòbil han de mantenir paritat funcional: mapa, cerca, fitxes, valoracions, comentaris, imatges, favorits, reports i perfil sensorial.
- Mantingues el suport per `ca`, `es` i `en` quan afegeixis text visible.
- Els perfils infantils no tenen email ni login propi en l'MVP; viuen dins el compte del tutor.
- Les aportacions d'un perfil infantil han de requerir revisió del tutor abans d'enviar-se a moderació o publicació.
- Professionals i entitats verificades han de separar la informació pública de l'evidència documental privada.
- Tot contingut públic de risc, especialment imatges i comentaris, ha de tenir estat de moderació. Les imatges d'usuari entren com `pending`.

## Models i dades

- Usa `packages/shared/src/models.ts` com a font de veritat per rols, estats, categories, criteris sensorials i formes de dades.
- Afegeix o modifica validacions a `packages/shared/src/validation.ts` quan canviin contractes de dades.
- Si canvies models compartits, comprova impacte a web, Flutter, Functions i Rules.
- Les puntuacions sensorials són enters de l'1 al 5.
- Evita duplicar constants de domini si poden viure a `packages/shared`.

## Web

- La ruta principal renderitza `PlatformApp` a `apps/web/app/platform-app.tsx`.
- La web és una experiència de client amb estats mock/MVP; no introdueixis accessos Firebase sense respectar `apps/web/app/lib/firebase.ts`.
- Usa `lucide-react` per a icones quan ja existeixi una icona equivalent.
- Mantingues el logo oficial des de `apps/web/public/brand/accessibilitat-logo.svg`.
- Respecta la paleta i criteris de `docs/design/brand.md`: warm alabaster, deep charcoal, slate blue-grey i champagne gold.
- Preserva mode focus, mode fosc i canvi d'idioma si toques layout o navegació.
- Evita textos mèdics o promeses clíniques.

## Flutter

- L'app arrenca a `apps/mobile/lib/main.dart` i inicialitza Firebase amb `firebase_options.dart`.
- La UI principal viu a `apps/mobile/lib/spectrum_app.dart`.
- Reutilitza `spectrum_theme.dart` per colors, tipografia, logo i panels.
- Reutilitza `spectrum_content.dart` per textos, enums i dades mock.
- Mantingues el logo oficial des de `apps/mobile/assets/brand/accessibilitat-logo.svg`.
- Quan canviïs UI o navegació mòbil, actualitza `apps/mobile/test/widget_test.dart` si cal.

## Firebase, seguretat i moderació

- Firestore Rules viuen a `firebase/firestore.rules`; Storage Rules a `firebase/storage.rules`.
- Si canvies regles, afegeix o actualitza tests a `packages/functions/tests/rules.test.ts` i executa `pnpm rules:test` quan l'entorn tingui Java i emuladors.
- Les claims `admin` i `moderator` governen permisos elevats; no confiïs en rols editables pel client.
- Els usuaris normals només poden crear contingut propi i normalment en estat `pending`.
- Les imatges a Storage han de quedar sota rutes d'usuari i passar validació de tipus `image/*` i mida.
- No facis públic accés a documents o fitxers privats sense revisar Rules i tests.

## Cloud Functions

- Codi a `packages/functions/src/index.ts`.
- Les Functions actuals recalculen agregats de reviews, notifiquen imatges rebutjades i auditen canvis de verificació.
- Mantingues imports ESM amb extensions correctes quan pertoqui.
- Quan canviis agregats o estats, comprova que `packages/shared` i Rules continuen alineats.

## Secrets i fitxers locals

- No commitegis secrets, `.env`, service accounts, claus de signing ni configuracions natives privades.
- Usa `.env.example`, `apps/web/.env.example` i `packages/functions/.env.example` com a referència.
- Els fitxers Firebase natius reals de mobile s'han de crear manualment i no han d'entrar al repo:
  - `apps/mobile/android/app/google-services.json`
  - `apps/mobile/ios/Runner/GoogleService-Info.plist`

## Verificació abans d'acabar

Tria la verificació més petita que cobreixi el canvi:

- Canvis compartits o Functions: `pnpm typecheck` i/o `pnpm test`.
- Canvis web: `pnpm --filter @accessibilitat/shared build` i `pnpm --filter @accessibilitat/web typecheck`; si afecta build/export, `pnpm --filter @accessibilitat/web build`.
- Canvis de Rules: `pnpm rules:test`.
- Canvis Flutter: `pnpm mobile:analyze` i `pnpm mobile:test`.
- Canvis globals: `pnpm typecheck`, `pnpm test`, `pnpm build`, i comprovacions Flutter si s'ha tocat `apps/mobile`.

Si una verificació no es pot executar per falta d'entorn, Java, Firebase CLI, Flutter o secrets, explica-ho clarament.

## Estil de treball

- Llegeix primer els fitxers propers abans de modificar.
- Mantingues els canvis petits i alineats amb l'estructura existent.
- No refactoritzis superfícies no relacionades amb la petició.
- No reverteixis canvis locals que no hagis fet.
- Actualitza documentació quan una decisió tècnica, flux de dades o comanda canviï.
- En respostes al propietari del projecte, sigues directe i en català si ell ha escrit en català.
