import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:sensory_access/spectrum_app.dart';
import 'package:sensory_access/spectrum_content.dart';
import 'package:sensory_access/spectrum_shell.dart'
    show nearbyDiscoveryMaxResults, nearbyDiscoveryRadiusMeters;

PlaceSummary testPlace({
  required String id,
  Map<SensoryKey, double> criterionAverages = const {},
}) {
  return PlaceSummary(
    id: id,
    source: 'spectrum',
    spectrumPlaceId: id,
    name: 'Place $id',
    area: 'Area',
    city: 'Barcelona',
    category: 'other',
    score: 0,
    distance: 'Live',
    quietDb: 'New',
    description: '',
    latitude: 41.3851,
    longitude: 2.1734,
    criterionAverages: criterionAverages,
    hasSpectrumData: criterionAverages.isNotEmpty,
  );
}

class FakeProfileService implements SpectrumApplicationService {
  FakeProfileService({
    required this.profile,
    this.claims = AccessClaims.none,
    this.queues = ModerationQueues.empty,
  });

  final SpectrumUserProfile profile;
  final AccessClaims claims;
  final ModerationQueues queues;
  double? lastNearbyRadiusMeters;
  int? lastNearbyMaxResultCount;

  @override
  bool get hasAuthenticatedUser => true;

  @override
  SpectrumAuthUser? get currentUser => SpectrumAuthUser(
    uid: profile.uid,
    displayName: profile.publicName,
    email: profile.email,
  );

  @override
  Stream<SpectrumAuthUser?> get authStateChanges =>
      Stream<SpectrumAuthUser?>.value(currentUser);

  @override
  Future<SpectrumUserProfile?> loadCurrentUserProfile() async => profile;

  @override
  Future<AccessClaims> loadAccessClaims() async => claims;

  @override
  Future<List<PlaceSummary>> loadActivePlaces() async => [testPlace(id: 'one')];

  @override
  Future<List<PlaceSummary>> searchNearbyPlaces({
    required double latitude,
    required double longitude,
    required String locale,
    double radiusMeters = 1500,
    int maxResultCount = 20,
  }) async {
    lastNearbyRadiusMeters = radiusMeters;
    lastNearbyMaxResultCount = maxResultCount;
    return [testPlace(id: 'nearby')];
  }

  @override
  Future<EventHistorySummary> searchEventHistory({
    required String locale,
    double? latitude,
    double? longitude,
    double radiusMeters = 10000,
    int maxResultCount = 50,
    String? city,
  }) async => const EventHistorySummary();

  @override
  Future<String> createEventSeries({
    required String title,
    required String category,
    required String city,
    String? description,
  }) async => 'event-series-1';

  @override
  Future<String> createEventEdition({
    required String eventSeriesId,
    required String title,
    required int year,
    required DateTime startsAt,
    required DateTime endsAt,
  }) async => 'event-edition-1';

  @override
  Future<String> createEventZone({
    required String eventSeriesId,
    required String eventEditionId,
    required String name,
    required double latitude,
    required double longitude,
    double radiusMeters = 150,
    String? description,
  }) async => 'event-zone-1';

  @override
  Future<String> uploadEventExperiencePhoto({
    required String experienceId,
    required Uint8List bytes,
    required String fileName,
    required String contentType,
  }) async => 'event-experience-images/${profile.uid}/$experienceId/$fileName';

  @override
  Future<String?> eventExperiencePhotoUrl({required String photoPath}) async =>
      null;

  @override
  Future<void> submitEventExperience({
    required String experienceId,
    required String eventSeriesId,
    required String eventEditionId,
    required String eventZoneId,
    required DateTime observedAt,
    required Map<EventSensoryKey, double> ratings,
    required String description,
    required String photoPath,
  }) async {}

  @override
  Future<void> updateUserProfile({
    required String publicName,
    String? city,
    String? address,
    String? phone,
    Uint8List? profilePhotoBytes,
    String? profilePhotoFileName,
    String? profilePhotoContentType,
  }) async {}

  @override
  Future<void> registerWithEmail({
    required String email,
    required String password,
    required String publicName,
    required String birthDate,
    required String locale,
    String? city,
  }) async {}

  @override
  Future<void> signInWithEmail({
    required String email,
    required String password,
    required String locale,
  }) async {}

  @override
  Future<void> requestPasswordReset({
    required String email,
    required String locale,
  }) async {}

  @override
  Future<void> signInWithGoogle({
    required String locale,
    String? birthDate,
  }) async {}

  @override
  Future<void> signInWithApple({
    required String locale,
    String? birthDate,
  }) async {}

  @override
  Future<void> signOut() async {}

  @override
  Future<String> createPlace({
    required String name,
    required String category,
    required String city,
    required String addressOrArea,
    required double latitude,
    required double longitude,
    String? description,
  }) async => 'place-1';

  @override
  Future<String> resolvePlaceForContribution({
    required PlaceSummary place,
    required String locale,
    required double contributorLatitude,
    required double contributorLongitude,
    double? contributorAccuracyMeters,
  }) async => place.spectrumPlaceId ?? 'resolved-place-1';

  @override
  Future<void> submitReview({
    required String placeId,
    required Map<SensoryKey, double> ratings,
    String? comment,
    String? childProfileId,
  }) async {}

  @override
  Future<void> submitComment({
    required String targetType,
    required String targetId,
    required String body,
    String? placeId,
  }) async {}

  @override
  Future<void> createReport({
    required String targetType,
    required String targetId,
    required String reason,
  }) async {}

  @override
  Future<void> createChildProfile({
    required String alias,
    String? ageRange,
    Map<String, String>? sensoryPreferences,
  }) async {}

  @override
  Future<void> requestProfessionalVerification({
    required String professionalName,
    required String licenseNumber,
    required String professionalCollege,
    required String specialty,
    String? photoPath,
    String? evidencePath,
    String? note,
  }) async {}

  @override
  Future<void> requestOrganizationVerification({
    required String name,
    required String description,
    required String city,
    String? website,
    String? registryNumber,
    String? logoPath,
    String? evidencePath,
    String? note,
  }) async {}

  @override
  Future<void> uploadPlaceImage({
    required String placeId,
    required Uint8List bytes,
    required String fileName,
    required String contentType,
    Map<String, String>? altText,
  }) async {}

  @override
  Future<ModerationQueues> loadModerationQueues() async => queues;

  @override
  Future<void> moderateContent({
    required String collectionId,
    required String targetId,
    required String status,
    String? reason,
  }) async {}

  @override
  Future<AccessGrantResult> setUserAccessClaims({
    required String email,
    required bool admin,
    required bool moderator,
  }) async {
    return AccessGrantResult(
      email: email,
      roles: [if (admin) 'admin', if (moderator || admin) 'moderator'],
      claims: AccessClaims(admin: admin, moderator: moderator || admin),
    );
  }
}

class FakeGeolocatorPlatform extends GeolocatorPlatform {
  FakeGeolocatorPlatform({
    this.serviceEnabled = true,
    this.permission = LocationPermission.whileInUse,
    Position? position,
  }) : position =
           position ??
           Position(
             latitude: 41.3851,
             longitude: 2.1734,
             timestamp: DateTime(2026, 7, 5),
             accuracy: 8,
             altitude: 0,
             altitudeAccuracy: 0,
             heading: 0,
             headingAccuracy: 0,
             speed: 0,
             speedAccuracy: 0,
           );

  final bool serviceEnabled;
  final LocationPermission permission;
  final Position position;

  @override
  Future<bool> isLocationServiceEnabled() async => serviceEnabled;

  @override
  Future<LocationPermission> checkPermission() async => permission;

  @override
  Future<LocationPermission> requestPermission() async => permission;

  @override
  Future<Position> getCurrentPosition({
    LocationSettings? locationSettings,
  }) async => position;
}

class FailingEmailSignInService extends FakeProfileService {
  FailingEmailSignInService()
    : super(
        profile: const SpectrumUserProfile(
          uid: 'guest',
          publicName: 'Visitant',
          roles: ['user'],
        ),
      );

  @override
  bool get hasAuthenticatedUser => false;

  @override
  SpectrumAuthUser? get currentUser => null;

  @override
  Stream<SpectrumAuthUser?> get authStateChanges =>
      Stream<SpectrumAuthUser?>.value(null);

  @override
  Future<SpectrumUserProfile?> loadCurrentUserProfile() async => null;

  @override
  Future<void> signInWithEmail({
    required String email,
    required String password,
    required String locale,
  }) async {
    throw FirebaseAuthException(
      code: 'user-not-found',
      message: 'There is no user record corresponding to this identifier.',
    );
  }
}

void main() {
  late GeolocatorPlatform defaultGeolocatorPlatform;

  setUpAll(() {
    defaultGeolocatorPlatform = GeolocatorPlatform.instance;
  });

  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
    GeolocatorPlatform.instance = defaultGeolocatorPlatform;
  });

  tearDown(() {
    GeolocatorPlatform.instance = defaultGeolocatorPlatform;
  });

  test('filters places only when real criterion averages exist', () {
    final quietPlace = testPlace(
      id: 'quiet',
      criterionAverages: const {SensoryKey.noise: 2},
    );
    final unknownPlace = testPlace(id: 'unknown');

    expect(filterPlacesBySensory([quietPlace, unknownPlace], null), [
      quietPlace,
      unknownPlace,
    ]);
    expect(filterPlacesBySensory([quietPlace, unknownPlace], 0), [quietPlace]);
  });

  testWidgets('loads Spectrum Access public entry before auth', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SpectrumAccessApp());
    await tester.pumpAndSettle();

    expect(find.text('Spectrum Access'), findsWidgets);
    expect(find.text('BETA'), findsWidgets);
    expect(find.text('Mode consulta'), findsWidgets);
    expect(find.text('Mapa Sensorial'), findsOneWidget);
    expect(find.text('Entra a Spectrum Access'), findsNothing);
    expect(find.text('Professionals verificats'), findsNothing);
    expect(find.text('Iniciar sessió'), findsNothing);
    expect(find.byTooltip('Iniciar sessió'), findsOneWidget);
    expect(find.byIcon(Icons.person_outline), findsOneWidget);
    expect(find.byIcon(Icons.login_outlined), findsNothing);

    await tester.tap(find.text('Perfils'));
    await tester.pumpAndSettle();

    expect(find.text('Professionals verificats'), findsNothing);
    expect(
      find.text('Encara no hi ha professionals verificats.'),
      findsNothing,
    );
    expect(find.text('Entra a Spectrum Access'), findsNothing);

    await tester.tap(find.text('Ajuda'));
    await tester.pumpAndSettle();

    expect(find.text('Ajuda immediata'), findsOneWidget);
    expect(find.text('Targeta d’ajuda'), findsOneWidget);
    expect(find.text('Focus mode'), findsNothing);
    expect(find.byTooltip('Focus mode'), findsOneWidget);

    await tester.tap(find.text('Aportacions'));
    await tester.pumpAndSettle();

    expect(find.text('Entra a Spectrum Access'), findsOneWidget);
    expect(find.text('Continuar amb Google'), findsOneWidget);
    expect(find.text('Continuar amb Apple'), findsOneWidget);
    expect(find.text('Data de naixement'), findsOneWidget);
    expect(find.byTooltip('Mostra contrasenya'), findsNWidgets(2));
    expect(
      tester
          .widget<TextField>(find.widgetWithText(TextField, 'Contrasenya'))
          .obscureText,
      isTrue,
    );
    await tester.ensureVisible(find.byTooltip('Mostra contrasenya').first);
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Mostra contrasenya').first);
    await tester.pumpAndSettle();
    expect(
      tester
          .widget<TextField>(find.widgetWithText(TextField, 'Contrasenya'))
          .obscureText,
      isFalse,
    );
    expect(find.byTooltip('Amaga contrasenya'), findsOneWidget);
    expect(find.text('Registrar amb email'), findsOneWidget);
    expect(find.text('Has oblidat la teva contrasenya?'), findsNothing);
    expect(find.byTooltip('Idioma'), findsOneWidget);
    expect(find.byTooltip('Mode fosc'), findsOneWidget);

    await tester.ensureVisible(find.text('Entrar'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Entrar'));
    await tester.pumpAndSettle();

    expect(find.byIcon(Icons.login_outlined), findsNothing);
    expect(find.byIcon(Icons.person_outline), findsWidgets);
    expect(find.byTooltip('Mostra contrasenya'), findsOneWidget);
    expect(find.text('Entrar amb email'), findsOneWidget);
    expect(find.text('Has oblidat la teva contrasenya?'), findsOneWidget);
    expect(find.text('Nom públic'), findsNothing);
  });

  testWidgets(
    'shows separate registration fields for users professionals and associations',
    (WidgetTester tester) async {
      await tester.pumpWidget(const SpectrumAccessApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Aportacions'));
      await tester.pumpAndSettle();

      expect(find.text('Usuari'), findsOneWidget);
      expect(find.text('Professional'), findsOneWidget);
      expect(find.text('Associació'), findsOneWidget);
      expect(find.text('Nom públic'), findsOneWidget);
      expect(find.text('Data de naixement'), findsOneWidget);
      expect(find.text('Continuar amb Google'), findsOneWidget);
      expect(find.text('Continuar amb Apple'), findsOneWidget);

      await tester.tap(find.text('Professional'));
      await tester.pumpAndSettle();

      expect(find.text('Nom professional públic'), findsOneWidget);
      expect(
        find.text('Acreditació o número de col·legiat/da'),
        findsOneWidget,
      );
      expect(find.text('Col·legi o entitat professional'), findsOneWidget);
      expect(find.text('Especialitat o àmbit'), findsOneWidget);
      expect(find.text('Continuar amb Google'), findsNothing);
      expect(find.text('Continuar amb Apple'), findsNothing);

      await tester.tap(find.text('Associació'));
      await tester.pumpAndSettle();

      expect(find.text('Nom de l’associació'), findsOneWidget);
      expect(find.text('Ciutat'), findsWidgets);
      expect(find.text('Descripció de l’associació'), findsOneWidget);
      expect(find.text('Web opcional'), findsOneWidget);
      expect(find.text('Número de registre opcional'), findsOneWidget);
      expect(find.text('Acreditació o número de col·legiat/da'), findsNothing);
    },
  );

  testWidgets('shows Firestore places before location discovery', (
    WidgetTester tester,
  ) async {
    final service = FakeProfileService(
      profile: const SpectrumUserProfile(
        uid: 'user-a',
        publicName: 'Josep Baró Roca',
        roles: ['user'],
      ),
    );

    await tester.pumpWidget(
      SpectrumAccessApp(
        key: UniqueKey(),
        firebaseInitialization: Future<void>.value(),
        createApplicationService: () => service,
      ),
    );
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Place one'),
      180,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Place one'), findsWidgets);
    expect(find.text('Place nearby'), findsNothing);
    expect(find.textContaining('Jardins Artigas'), findsNothing);
  });

  testWidgets(
    'uses mobile discovery radius and result limit for nearby search',
    (WidgetTester tester) async {
      GeolocatorPlatform.instance = FakeGeolocatorPlatform();
      final service = FakeProfileService(
        profile: const SpectrumUserProfile(
          uid: 'user-a',
          publicName: 'Josep Baró Roca',
          roles: ['user'],
        ),
      );

      await tester.pumpWidget(
        SpectrumAccessApp(
          key: UniqueKey(),
          firebaseInitialization: Future<void>.value(),
          createApplicationService: () => service,
        ),
      );
      await tester.pumpAndSettle();

      expect(service.lastNearbyRadiusMeters, nearbyDiscoveryRadiusMeters);
      expect(service.lastNearbyMaxResultCount, nearbyDiscoveryMaxResults);
      expect(service.lastNearbyRadiusMeters, 1500.0);
      expect(service.lastNearbyMaxResultCount, 10);
    },
  );

  testWidgets('shows administration only for moderation claims', (
    WidgetTester tester,
  ) async {
    final normalService = FakeProfileService(
      profile: const SpectrumUserProfile(
        uid: 'user-a',
        publicName: 'Normal User',
        roles: ['user'],
      ),
    );

    await tester.pumpWidget(
      SpectrumAccessApp(
        key: UniqueKey(),
        firebaseInitialization: Future<void>.value(),
        createApplicationService: () => normalService,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byTooltip('Administració'), findsNothing);

    await tester.pumpWidget(
      SpectrumAccessApp(
        key: UniqueKey(),
        firebaseInitialization: Future<void>.value(),
        createApplicationService: () => FakeProfileService(
          profile: const SpectrumUserProfile(
            uid: 'mod-a',
            publicName: 'Moderator',
            roles: ['user'],
          ),
          claims: const AccessClaims(moderator: true),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byTooltip('Administració'), findsOneWidget);
    await tester.tap(find.text('Perfils'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.text('Administració'),
      180,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Administració'), findsOneWidget);
  });

  testWidgets('shows grants only for super admin and moderation empty states', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      SpectrumAccessApp(
        key: UniqueKey(),
        firebaseInitialization: Future<void>.value(),
        createApplicationService: () => FakeProfileService(
          profile: const SpectrumUserProfile(
            uid: 'mod-a',
            publicName: 'Moderator',
            roles: ['user'],
          ),
          claims: const AccessClaims(moderator: true),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Administració'));
    await tester.pumpAndSettle();

    expect(find.text('No hi ha imatges pendents.'), findsOneWidget);
    expect(find.text('No hi ha experiències pendents.'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('No hi ha elements de catàleg pendents.'),
      260,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('No hi ha elements de catàleg pendents.'), findsOneWidget);
    expect(find.text('Permisos'), findsNothing);

    await tester.pumpWidget(
      SpectrumAccessApp(
        key: UniqueKey(),
        firebaseInitialization: Future<void>.value(),
        createApplicationService: () => FakeProfileService(
          profile: const SpectrumUserProfile(
            uid: 'super-a',
            publicName: 'Super Admin',
            roles: ['user'],
          ),
          claims: const AccessClaims(superAdmin: true),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Administració'));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Permisos'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Permisos'), findsOneWidget);
    expect(find.widgetWithText(TextField, 'Email'), findsOneWidget);
  });

  testWidgets('keeps email sign-in failures generic', (
    WidgetTester tester,
  ) async {
    final service = FailingEmailSignInService();

    await tester.pumpWidget(
      SpectrumAccessApp(
        firebaseInitialization: Future<void>.value(),
        createApplicationService: () => service,
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Aportacions'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Entrar'));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.widgetWithText(TextField, 'Email'),
      'noexisteix@example.com',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Contrasenya'),
      'contrasenya-incorrecta',
    );
    await tester.ensureVisible(find.text('Entrar amb email'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Entrar amb email'));
    await tester.pumpAndSettle();

    expect(
      find.text('No s’ha pogut completar l’autenticació.'),
      findsOneWidget,
    );
    expect(find.textContaining('user-not-found'), findsNothing);
    expect(find.textContaining('There is no user record'), findsNothing);
    expect(find.textContaining('Firebase'), findsNothing);
  });

  testWidgets('opens the normal user profile editor from profiles', (
    WidgetTester tester,
  ) async {
    final service = FakeProfileService(
      profile: const SpectrumUserProfile(
        uid: 'user-a',
        publicName: 'Josep Baró Roca',
        email: 'josep@example.com',
        city: 'Barcelona',
        address: 'Carrer de prova',
        phone: '600000000',
        roles: ['user'],
      ),
    );

    await tester.pumpWidget(
      SpectrumAccessApp(
        firebaseInitialization: Future<void>.value(),
        createApplicationService: () => service,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Iniciar sessió'), findsNothing);
    expect(find.byTooltip('Tancar sessió'), findsOneWidget);
    expect(find.byIcon(Icons.logout_outlined), findsOneWidget);

    await tester.tap(find.text('Perfils'));
    await tester.pumpAndSettle();

    expect(find.text('Josep Baró Roca · Barcelona'), findsOneWidget);
    expect(find.text('Editar perfil'), findsOneWidget);
    expect(find.text('Professionals verificats'), findsNothing);
    expect(find.text('Sol·licitar perfil professional'), findsNothing);
    expect(find.text('Perfil infantil tutelat'), findsNothing);
    expect(find.text('Perfil tutor'), findsNothing);
    expect(find.text('Perfil sensorial'), findsNothing);
    expect(
      find.text('Gestiona les teves dades personals i la foto del perfil.'),
      findsOneWidget,
    );

    await tester.tap(find.text('Editar perfil'));
    await tester.pumpAndSettle();

    expect(find.text('Foto de perfil'), findsWidgets);
    expect(find.widgetWithText(TextField, 'Adreça'), findsWidgets);
    expect(find.widgetWithText(TextField, 'Telèfon'), findsWidgets);
    expect(find.text('Guardar perfil'), findsOneWidget);
  });

  testWidgets('restores saved dark mode on startup', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues(<String, Object>{
      SpectrumThemePreferences.themeModeKey: 'dark',
    });

    final initialThemeMode = await SpectrumThemePreferences.loadThemeMode();

    await tester.pumpWidget(
      SpectrumAccessApp(initialThemeMode: initialThemeMode),
    );
    await tester.pumpAndSettle();

    final scaffoldContext = tester.element(find.byType(Scaffold).first);
    expect(Theme.of(scaffoldContext).brightness, Brightness.dark);
  });

  testWidgets('saves dark mode when the theme action is used', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SpectrumAccessApp());
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Mode fosc').first);
    await tester.pumpAndSettle();

    final preferences = await SharedPreferences.getInstance();
    expect(
      preferences.getString(SpectrumThemePreferences.themeModeKey),
      'dark',
    );

    final scaffoldContext = tester.element(find.byType(Scaffold).first);
    expect(Theme.of(scaffoldContext).brightness, Brightness.dark);
  });
}
