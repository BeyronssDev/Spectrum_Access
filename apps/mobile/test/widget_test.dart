import 'package:flutter_test/flutter_test.dart';

import 'package:sensory_access/main.dart';

void main() {
  testWidgets('loads home and mobile tabs aligned with the web app', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SensoryAccessApp());
    await tester.pumpAndSettle();

    expect(find.text('Accessibilitat sensorial'), findsWidgets);
    expect(find.text('Inici'), findsOneWidget);
    expect(
      find.text('El teu espai d accessibilitat sensorial'),
      findsOneWidget,
    );
    expect(find.text('Consulta'), findsWidgets);
    expect(find.text('Aportacions'), findsWidgets);
    expect(find.text('Ajuda'), findsWidgets);
    expect(find.text('Perfils'), findsWidgets);

    await tester.tap(find.text('Aportacions').last);
    await tester.pumpAndSettle();

    expect(find.text('Pujar imatge'), findsOneWidget);
    expect(find.text('Afegir comentari'), findsOneWidget);
    expect(find.text('Publicar com a anonim'), findsOneWidget);

    await tester.tap(find.text('Perfils').last);
    await tester.pumpAndSettle();

    expect(find.text('Professionals verificats'), findsOneWidget);
    expect(find.text('Dra. Marta Soler'), findsOneWidget);
    expect(find.text('Associacio Autisme Obert'), findsOneWidget);
  });
}
