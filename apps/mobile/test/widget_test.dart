import 'package:flutter_test/flutter_test.dart';

import 'package:sensory_access/spectrum_app.dart';

void main() {
  testWidgets('loads Spectrum Access auth entry flow', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SpectrumAccessApp());
    await tester.pumpAndSettle();

    expect(find.text('Spectrum Access'), findsWidgets);
    expect(find.text('Entra a Spectrum Access'), findsOneWidget);
    expect(find.text('Continuar amb Google'), findsOneWidget);
    expect(find.text('Continuar amb Apple'), findsOneWidget);
    expect(find.text('Registrar amb email'), findsOneWidget);

    await tester.tap(find.text('Entrar'));
    await tester.pumpAndSettle();

    expect(find.text('Entrar amb email'), findsOneWidget);
    expect(find.text('Nom públic'), findsNothing);
  });
}
