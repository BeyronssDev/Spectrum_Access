import 'package:flutter_test/flutter_test.dart';

import 'package:sensory_access/main.dart';

void main() {
  testWidgets('loads the sensory accessibility MVP shell', (WidgetTester tester) async {
    await tester.pumpWidget(const SensoryAccessApp());

    expect(find.text('Accessibilitat sensorial'), findsOneWidget);
    expect(find.text('Biblioteca Sant Antoni'), findsWidgets);
    expect(find.text('Mapa'), findsOneWidget);

    await tester.tap(find.text('Aportacions'));
    await tester.pump();

    expect(find.text('Pujar imatge'), findsOneWidget);
    expect(find.text('Afegir comentari'), findsOneWidget);
  });
}
