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
  );
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
    expect(find.byTooltip('Idioma'), findsOneWidget);
    expect(find.byTooltip('Mode fosc'), findsOneWidget);

    await tester.tap(find.text('Entrar'));
    await tester.pumpAndSettle();

    expect(find.text('Entrar amb email'), findsOneWidget);
    expect(find.text('Nom públic'), findsNothing);
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
