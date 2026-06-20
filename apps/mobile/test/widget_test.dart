import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sensory_access/spectrum_app.dart';

void main() {
  testWidgets('loads Spectrum Access premium mobile flow', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SpectrumAccessApp());
    await tester.pumpAndSettle();

    expect(find.text('Spectrum Access'), findsWidgets);
    expect(find.text('Bon dia, Josep'), findsOneWidget);
    expect(find.text('Consulta'), findsWidgets);
    expect(find.text('Aportacions'), findsWidgets);
    expect(find.text('Ajuda'), findsWidgets);
    expect(find.text('Perfils'), findsWidgets);

    await tester.tap(find.text('Aportacions').last);
    await tester.pumpAndSettle();

    expect(find.text('Aportació sensorial'), findsOneWidget);
    expect(find.text('Biblioteca Veridian'), findsOneWidget);
    expect(find.text('Pujar imatges'), findsOneWidget);
    expect(find.text('Càmera'), findsOneWidget);
    expect(find.text('Galeria'), findsOneWidget);
    expect(
      find.text(
        'Les fotos HEIC/HEIF d’iPhone es conservaran amb el seu format i quedaran pendents de moderació.',
      ),
      findsOneWidget,
    );
    expect(find.text('Publicar com a anònim'), findsOneWidget);

    await tester.tap(find.text('Perfils').last);
    await tester.pumpAndSettle();

    expect(find.text('Professionals verificats'), findsOneWidget);
    expect(find.text('Marta Gómez'), findsOneWidget);
    expect(find.text('Centre TEA Catalunya'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Perfil infantil tutelat'),
      500,
      scrollable: find.byType(Scrollable).last,
    );
    await tester.pumpAndSettle();
    expect(find.text('Perfil infantil tutelat'), findsOneWidget);
  });
}
