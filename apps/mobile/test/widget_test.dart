import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:sensory_access/spectrum_app.dart';
import 'package:sensory_access/spectrum_content.dart';

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
  FakeProfileService({required this.profile});

  final SpectrumUserProfile profile;

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
  Future<List<PlaceSummary>> loadActivePlaces() async => [testPlace(id: 'one')];

  @override
  Future<List<PlaceSummary>> searchNearbyPlaces({
    required double latitude,
    required double longitude,
    required String locale,
    double radiusMeters = 1500,
    int maxResultCount = 20,
  }) async => [testPlace(id: 'nearby')];

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
  Future<void> signInWithGoogle({required String locale}) async {}

  @override
  Future<void> signInWithApple({required String locale}) async {}

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
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
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
    expect(find.text('Mode consulta'), findsWidgets);
    expect(find.text('Mapa Sensorial'), findsOneWidget);
    expect(find.text('Entra a Spectrum Access'), findsNothing);

    await tester.tap(find.text('Perfils'));
    await tester.pumpAndSettle();

    expect(find.text('Professionals verificats'), findsOneWidget);
    expect(
      find.text('Encara no hi ha professionals verificats.'),
      findsOneWidget,
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
    expect(find.text('Registrar amb email'), findsOneWidget);
    expect(find.text('Has oblidat la teva contrasenya?'), findsNothing);
    expect(find.byTooltip('Idioma'), findsOneWidget);
    expect(find.byTooltip('Mode fosc'), findsOneWidget);

    await tester.tap(find.text('Entrar'));
    await tester.pumpAndSettle();

    expect(find.text('Entrar amb email'), findsOneWidget);
    expect(find.text('Has oblidat la teva contrasenya?'), findsOneWidget);
    expect(find.text('Nom públic'), findsNothing);
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

    await tester.tap(find.text('Perfils'));
    await tester.pumpAndSettle();

    expect(find.text('Josep Baró Roca · Barcelona'), findsOneWidget);
    expect(find.text('Editar perfil'), findsOneWidget);

    await tester.tap(find.text('Editar perfil'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Foto de perfil'), 220);
    await tester.pumpAndSettle();

    expect(find.text('Foto de perfil'), findsOneWidget);
    expect(find.text('Adreça'), findsOneWidget);
    expect(find.text('Telèfon'), findsOneWidget);
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
