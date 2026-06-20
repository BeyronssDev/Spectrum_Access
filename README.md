# Spectrum Access

Plataforma abierta de accesibilidad sensorial para consultar, valorar y documentar espacios desde una perspectiva sensorial, con especial atención a personas autistas, familias, tutores, asociaciones y profesionales verificados.

El objetivo del proyecto es construir un MVP real, seguro y escalable que combine aplicación web, aplicación móvil iOS/Android y backend Firebase. La plataforma permite que una persona registrada pueda consultar lugares, revisar información sensorial, aportar valoraciones, subir imágenes, guardar espacios y reportar contenido tanto desde el móvil como desde la web.

> Estado del proyecto: MVP en desarrollo. El despliegue público, la URL definitiva y los usuarios de prueba se documentarán cuando el sistema de autenticación y publicación esté cerrado.

## Índice

- [A. Descripción general del proyecto](#a-descripción-general-del-proyecto)
- [B. Stack tecnológico utilizado](#b-stack-tecnológico-utilizado)
- [C. Instalación y ejecución](#c-instalación-y-ejecución)
- [D. Estructura del proyecto](#d-estructura-del-proyecto)
- [E. Funcionalidades principales](#e-funcionalidades-principales)
- [Consideraciones de privacidad y seguridad](#consideraciones-de-privacidad-y-seguridad)
- [Estado actual y próximos pasos](#estado-actual-y-proximos-pasos)
- [Licencia](#licencia)

## A. Descripción general del proyecto

Spectrum Access nace como una plataforma web y móvil para mejorar la accesibilidad sensorial de espacios públicos y privados. La idea principal es que la comunidad pueda documentar cómo se perciben determinados lugares en aspectos como ruido, iluminación, densidad de personas, tiempo de espera, facilidad de salida, existencia de zonas tranquilas o trato del personal.

El proyecto se dirige principalmente a:

- Personas autistas adultas o personas identificadas que quieran consultar y aportar información sensorial.
- Tutores que gestionan perfiles infantiles tutelados dentro de su propia cuenta.
- Familias que necesitan información práctica antes de visitar un lugar.
- Psicólogos y profesionales verificados.
- Asociaciones y centros de autismo verificados.
- Moderadores y administradores encargados de revisar contenido, imágenes y verificaciones.

La plataforma no pretende emitir diagnósticos, sustituir a profesionales sanitarios ni realizar recomendaciones clínicas. Los datos sensoriales se tratan como información funcional y comunitaria para ayudar a preparar visitas, reducir incertidumbre y facilitar decisiones personales.

### Problema que resuelve

Muchas personas autistas o con sensibilidad sensorial necesitan anticipar cómo será un entorno antes de visitarlo. Información habitual como horarios, dirección o reseñas generales no suele explicar si un espacio es ruidoso, si la luz es intensa, si hay aglomeraciones, si existen salidas claras o si hay zonas tranquilas.

Spectrum Access busca cubrir ese vacío mediante una plataforma donde los usuarios puedan:

- Consultar lugares en un mapa.
- Filtrar espacios por necesidades sensoriales.
- Revisar fichas con puntuaciones y comentarios.
- Guardar lugares útiles.
- Preparar aportaciones con calma desde casa.
- Subir imágenes de apoyo.
- Reportar contenido incorrecto o sensible.
- Consultar perfiles profesionales y entidades verificadas.

### Enfoque web y móvil

El proyecto está diseñado con paridad funcional entre web y móvil, pero sin copiar exactamente la misma interfaz:

- La aplicación móvil está pensada para uso rápido en la calle: consultar el mapa cercano, aportar información breve, acceder a ayuda inmediata y gestionar acciones simples.
- La web está pensada como un entorno tranquilo de escritorio: revisar información con más espacio, completar aportaciones con calma, gestionar perfiles, consultar verificaciones y usar el mapa en pantalla grande.

## B. Stack tecnológico utilizado

El repositorio está organizado como un monorepo con `pnpm` para JavaScript/TypeScript y Flutter para la aplicación móvil.

> Importante: este proyecto no utiliza `npm`. Todas las operaciones JavaScript/TypeScript se ejecutan con `pnpm`.

### Frontend web

- **Next.js 16.2.9**: aplicación web de usuario y zona de administración.
- **React 19.2.7**: interfaz principal de la web.
- **TypeScript 5.9.3**: tipado estático.
- **Tailwind CSS 4.3.1**: base de estilos.
- **Lucide React**: iconografía de la interfaz.
- **Google Maps JavaScript API**: mapa web interactivo.
- **Firebase Web SDK 12.15.0**: conexión web con Auth, Firestore, Storage y Functions.

### Aplicación móvil

- **Flutter**: aplicación móvil para iOS y Android.
- **Dart SDK `^3.11.4`**.
- **firebase_core**, **firebase_auth**, **cloud_firestore**, **firebase_storage**, **firebase_app_check** y **cloud_functions** para integración con Firebase.
- **google_sign_in** y **sign_in_with_apple** para autenticación.
- **google_maps_flutter** para mapas nativos.
- **image_picker** para selección de imágenes.
- **flutter_svg** y **google_fonts** para identidad visual.

### Backend y servicios cloud

- **Firebase Auth**: autenticación con Apple y Google.
- **Cloud Firestore**: base de datos principal.
- **Firebase Storage**: almacenamiento de imágenes de lugares, fotos profesionales, logos y evidencias privadas.
- **Cloud Functions for Firebase**: lógica backend, moderación, agregados, verificaciones y notificaciones.
- **Firebase App Check**: protección frente a clientes no autorizados.
- **Firebase Emulator Suite**: entorno local para pruebas de reglas y servicios.

### Infraestructura y configuración

- **pnpm 11.1.2** como gestor de paquetes JavaScript/TypeScript.
- **Node.js `>=20.9`** como versión mínima.
- **Cloud Functions runtime `nodejs22`** configurado en Firebase.
- **Firestore en Europa `eur3`** como decisión de ubicación de datos.
- **Functions region `europe-west1`**.
- **Firebase Hosting** preparado para la web mediante export estático de Next.js.
- **GitHub Actions** preparado para CI y staging web.

### Diseño y marca

- Nombre del proyecto: **Spectrum Access**.
- Logo oficial compartido entre web y móvil.
- Paleta visual premium definida en `docs/design/brand.md`.
- Soporte de idioma para catalán, castellano e inglés.
- Modo claro, modo oscuro y modo focus.

## C. Instalación y ejecución

### Requisitos previos

Antes de ejecutar el proyecto en local, es necesario tener instalado:

- Node.js `>=20.9`.
- `pnpm` `11.1.2` o superior.
- Flutter stable compatible con Dart `^3.11.4`.
- Firebase CLI.
- Java Runtime si se quieren ejecutar emuladores y tests de reglas Firebase.
- Xcode para ejecutar la app en iOS.
- Android Studio o Android SDK para ejecutar la app en Android.

### Instalación de dependencias JavaScript/TypeScript

Desde la raíz del repositorio:

```bash
pnpm install
```

### Variables de entorno y secretos

El repositorio no debe incluir claves reales, cuentas de servicio ni archivos nativos privados. Los archivos `.env`, configuraciones nativas de Firebase y claves de mapas se mantienen fuera de Git.

Archivos de referencia incluidos:

- `.env.example`
- `apps/web/.env.example`
- `packages/functions/.env.example`
- `apps/mobile/android/local.properties.example`
- `apps/mobile/ios/Flutter/Secrets.xcconfig.example`

Archivos locales que se deben crear manualmente cuando se configure el proyecto real:

- `apps/web/.env`
- `apps/mobile/android/app/google-services.json`
- `apps/mobile/ios/Runner/GoogleService-Info.plist`
- `apps/mobile/android/local.properties`
- `apps/mobile/ios/Flutter/Secrets.xcconfig`

### Configuración mínima de la web

Crear `apps/web/.env` a partir de `apps/web/.env.example` y definir las variables públicas de Firebase y Google Maps:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

La clave `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` debe permitir la **Google Maps JavaScript API**. Para desarrollo local se recomienda restringirla a:

```text
http://localhost:3000/*
http://127.0.0.1:3000/*
```

Si no se define esta clave, la web mantiene un mapa visual fallback para evitar romper la experiencia local.

### Ejecutar la web en local

Desde la raíz del repositorio:

```bash
pnpm dev:web
```

La web se ejecuta normalmente en:

```text
http://localhost:3000
```

Comandos útiles para la web:

```bash
pnpm --filter @accessibilitat/web typecheck
pnpm --filter @accessibilitat/web build
```

### Ejecutar la aplicación móvil

Entrar en la carpeta móvil:

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

Para activar Google Maps nativo durante el desarrollo móvil:

```bash
flutter run --dart-define=SPECTRUM_GOOGLE_MAPS_ENABLED=true
```

Sin ese `dart-define`, la aplicación puede mantener el mapa visual fallback para evitar errores cuando todavía no se han configurado las claves nativas.

Comandos desde la raíz del repositorio:

```bash
pnpm mobile:analyze
pnpm mobile:test
```

### Ejecutar checks globales

Desde la raíz:

```bash
pnpm typecheck
pnpm test
pnpm build
```

### Firebase Emulators y reglas

Ejecutar los emuladores:

```bash
pnpm firebase:emulators
```

Ejecutar tests de reglas:

```bash
pnpm rules:test
```

Estos tests requieren Java y Firebase Emulator Suite correctamente configurados.

## D. Estructura del proyecto

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
├── docs
│   ├── design
│   ├── adr-0001-stack.md
│   ├── architecture.md
│   ├── privacy.md
│   ├── product-spec.md
│   └── setup-local.md
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
├── firebase.json
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

### `apps/web`

Contiene la aplicación web construida con Next.js, React y TypeScript.

Archivos relevantes:

- `apps/web/app/page.tsx`: entrada principal de la web.
- `apps/web/app/platform-app.tsx`: interfaz principal de Spectrum Access.
- `apps/web/app/admin/page.tsx`: zona de administración.
- `apps/web/app/lib/firebase.ts`: inicialización Firebase web.
- `apps/web/app/lib/firebase-actions.ts`: acciones web conectadas con Firestore, Storage y Cloud Functions.
- `apps/web/app/lib/google-maps.ts`: carga de Google Maps JavaScript API.
- `apps/web/public/brand/accessibilitat-logo.svg`: logo oficial en web.

### `apps/mobile`

Contiene la aplicación Flutter para iOS y Android.

Archivos relevantes:

- `apps/mobile/lib/main.dart`: punto de entrada de Flutter.
- `apps/mobile/lib/spectrum_app.dart`: interfaz principal de la app móvil.
- `apps/mobile/lib/spectrum_theme.dart`: tema visual, colores y componentes.
- `apps/mobile/lib/spectrum_content.dart`: textos, datos mock y contenido compartido de la UI.
- `apps/mobile/lib/firebase_services.dart`: conexión con Firebase desde Flutter.
- `apps/mobile/lib/firebase_options.dart`: configuración Firebase generada.
- `apps/mobile/assets/brand/accessibilitat-logo.svg`: logo oficial en móvil.

### `packages/shared`

Paquete compartido de modelos, constantes y validaciones de dominio.

Incluye:

- Roles de usuario.
- Estados de moderación.
- Estados de verificación.
- Categorías de lugares.
- Criterios sensoriales.
- Tipos de comentarios, reportes y verificaciones.
- Interfaces de datos principales.
- Validaciones compartidas.

Este paquete actúa como fuente de verdad para evitar duplicar reglas de negocio entre web, móvil y backend.

### `packages/functions`

Contiene las Cloud Functions de Firebase.

Funciones principales:

- Crear lugares.
- Enviar valoraciones.
- Crear comentarios.
- Registrar imágenes subidas.
- Crear reportes.
- Crear perfiles infantiles tutelados.
- Solicitar verificación profesional.
- Solicitar verificación de asociación o centro.
- Moderar contenido.
- Cambiar estado de verificación.
- Recalcular estadísticas agregadas de lugares.
- Notificar imágenes rechazadas.
- Auditar cambios de verificación.

### `firebase`

Contiene la configuración de seguridad de Firebase:

- `firestore.rules`: reglas de acceso a Firestore.
- `storage.rules`: reglas de acceso a Firebase Storage.
- `firestore.indexes.json`: índices necesarios para consultas.

### `docs`

Documentación interna del proyecto:

- `product-spec.md`: especificación funcional del MVP.
- `architecture.md`: arquitectura inicial.
- `privacy.md`: principios de privacidad y confianza.
- `setup-local.md`: configuración local.
- `adr-0001-stack.md`: decisión técnica del stack.
- `design/brand.md`: identidad visual y reglas de marca.

## E. Funcionalidades principales

### 1. Mapa sensorial

La plataforma permite consultar lugares en un mapa con información sensorial. En la web se utiliza Google Maps cuando existe una clave configurada y un fallback visual cuando no está disponible.

Funcionalidades asociadas:

- Visualización de lugares.
- Búsqueda por nombre, ciudad o categoría.
- Filtros sensoriales.
- Capas de mapa.
- Localización del usuario con permiso del navegador.
- Ficha de lugar seleccionada.

### 2. Consulta y ficha de lugares

Cada lugar puede incluir:

- Nombre.
- Categoría.
- Ciudad.
- Dirección o área.
- Descripción.
- Coordenadas.
- Estado de moderación.
- Puntuación media.
- Número de valoraciones.
- Número de imágenes.

La ficha permite revisar el estado sensorial del lugar antes de visitarlo.

### 3. Valoraciones sensoriales

Los usuarios pueden aportar valoraciones basadas en criterios sensoriales.

Criterios contemplados:

- Ruido.
- Afluencia o densidad de personas.
- Iluminación.
- Temperatura.
- Tiempo de espera.
- Trato del personal.
- Espacio tranquilo.
- Facilidad de salida.
- Seguridad percibida.
- Recomendación general.

Las puntuaciones se registran como valores del 1 al 5. Las valoraciones entran inicialmente en estado `pending` para permitir moderación.

### 4. Comentarios

Los usuarios registrados pueden crear comentarios sobre lugares o valoraciones. Los comentarios también se tratan como contenido moderable.

### 5. Subida de imágenes

Los usuarios registrados pueden subir imágenes de lugares desde la web o desde la app. El objetivo es permitir que una persona pueda capturar información en un momento concreto y subirla más tarde con calma.

En el MVP:

- Las imágenes quedan en estado `pending`.
- Las imágenes deben pertenecer al usuario autenticado.
- Storage valida tipo de archivo `image/*`.
- Storage limita el tamaño de imagen.
- La publicación depende de moderación.
- Si una imagen se rechaza o elimina, se puede notificar de forma privada al usuario.

### 6. Favoritos y lugares guardados

La experiencia de usuario incluye lugares guardados para facilitar el acceso rápido a espacios relevantes.

### 7. Reportes

Los usuarios pueden reportar contenido relacionado con:

- Lugares.
- Valoraciones.
- Comentarios.
- Imágenes.
- Profesionales.
- Organizaciones.

Los reportes se crean en estado `open` y pueden ser revisados por moderadores.

### 8. Perfiles de usuario

La plataforma contempla varios tipos de perfiles:

- Usuario estándar.
- Usuario de confianza.
- Tutor.
- Profesional.
- Organización.
- Moderador.
- Administrador.

La identidad pública de usuarios estándar se basa en pseudónimo para reducir exposición innecesaria.

### 9. Tutores y perfiles infantiles tutelados

Los perfiles infantiles no tienen login propio ni email independiente en el MVP. Viven dentro de la cuenta del tutor.

Un tutor puede gestionar:

- Alias del menor.
- Franja de edad opcional.
- Preferencias sensoriales.
- Aportaciones preparadas por el menor.

Las aportaciones asociadas a un perfil infantil requieren revisión y aprobación del tutor antes de enviarse a moderación o publicación.

### 10. Profesionales verificados

Los psicólogos y otros profesionales pueden solicitar verificación.

El perfil profesional contempla:

- Foto profesional.
- Nombre profesional.
- Número de colegiado/a.
- Colegio profesional.
- Especialidad.
- Estado de verificación.

La evidencia documental de verificación queda privada para administración.

### 11. Asociaciones y centros de autismo verificados

Las asociaciones y centros pueden solicitar verificación.

El perfil de entidad contempla:

- Logo.
- Nombre.
- Descripción.
- Ciudad.
- Web o contacto.
- Número de inscripción o identificador registral.
- Estado de verificación.

El número registral puede mostrarse públicamente cuando la entidad lo facilite.

### 12. Moderación y administración

La zona de administración y las Cloud Functions permiten:

- Revisar contenido pendiente.
- Cambiar estados de moderación.
- Aprobar o rechazar verificaciones.
- Registrar acciones administrativas.
- Mantener trazabilidad de cambios sensibles.

Las claims `admin` y `moderator` gobiernan los permisos elevados. El sistema no confía en roles editables desde cliente para acciones críticas.

### 13. Modo focus

La web incluye un modo focus pensado para reducir carga visual y facilitar la concentración. En pantallas de consulta, el modo focus compacta navegación y paneles secundarios para dar más protagonismo al mapa.

### 14. Tarjeta de ayuda

La sección de ayuda incluye una tarjeta de comunicación pensada para momentos de sobrecarga o dificultad comunicativa. Su objetivo es permitir expresar necesidades básicas de forma rápida y clara.

### 15. Multidioma

La interfaz está planteada en:

- Catalán.
- Castellano.
- Inglés.

El README se mantiene en castellano para facilitar la corrección del trabajo final de máster.

## Consideraciones de privacidad y seguridad

Spectrum Access trabaja con información potencialmente sensible por el contexto de uso, aunque no almacene diagnósticos médicos.

Principios aplicados:

- Minimización de datos.
- No solicitar informes médicos.
- No ofrecer diagnóstico ni recomendaciones clínicas.
- Separación entre perfil público y evidencia privada.
- Moderación de contenido público.
- Protección de perfiles infantiles dentro de cuentas de tutor.
- Reglas Firestore y Storage restrictivas.
- Uso de App Check previsto para reducir abuso.
- Gestión de secretos fuera del repositorio.

Datos que no deben subirse al repositorio:

- `.env` reales.
- Service accounts.
- Claves privadas.
- Archivos `google-services.json` reales.
- Archivos `GoogleService-Info.plist` reales.
- Claves de signing.
- Configuraciones nativas privadas.

## Estado actual y próximos pasos

Estado actual:

- Monorepo inicial creado.
- Web Next.js operativa en local.
- App Flutter preparada para iOS y Android.
- Modelos compartidos definidos.
- Cloud Functions principales implementadas.
- Reglas Firestore y Storage definidas.
- Google Maps integrado en web.
- Identidad visual de Spectrum Access definida.
- Documentación interna inicial disponible en `docs`.

Pendiente para fases posteriores:

- Cerrar configuración final de Firebase Auth.
- Crear usuarios de prueba cuando el login esté cerrado.
- Completar despliegue público.
- Documentar URL real del proyecto.
- Preparar slides de presentación.
- Preparar vídeo explicativo del TFM.
- Ampliar tests visuales y funcionales sobre web y móvil.

## Licencia

Este proyecto se distribuye bajo licencia **GPL-3.0-only**.
