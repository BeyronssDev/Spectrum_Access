# Plataforma oberta d'accessibilitat sensorial

MVP de plataforma web i mòbil per consultar, valorar i documentar espais segons criteris d'accessibilitat sensorial per a persones autistes, famílies, tutors, associacions i professionals verificats.

## Decisions tècniques

- Monorepo amb `pnpm` per a JavaScript/TypeScript.
- App mòbil Flutter a `apps/mobile`.
- Web Next.js a `apps/web`, amb paritat funcional respecte de l'app.
- Backend Firebase amb Firestore, Storage, Auth, App Check i Cloud Functions.
- Dades a Europa, amb Firestore planificat a `eur3`.
- Llicència GPL-3.0-only.

## Comandes

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm dev:web
pnpm mobile:analyze
pnpm mobile:test
```

## Estructura

- `apps/mobile`: app iOS/Android.
- `apps/web`: web d'usuari i zona d'administració.
- `packages/shared`: models i constants compartides.
- `packages/functions`: Cloud Functions i tests de regles.
- `firebase`: regles i índexs.
- `docs`: especificació, arquitectura i notes de privacitat.

## Nota ètica

La plataforma no ofereix diagnòstics ni recomanacions clíniques. Les dades sensorials s'han de tractar com a preferències funcionals i informació comunitària, no com a historial mèdic.
