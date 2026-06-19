import 'package:flutter/material.dart';

void main() {
  runApp(const SensoryAccessApp());
}

class SensoryAccessApp extends StatelessWidget {
  const SensoryAccessApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Accessibilitat sensorial',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2F6F73),
          surface: const Color(0xFFFFFDF8),
        ),
        scaffoldBackgroundColor: const Color(0xFFF7F4EE),
        useMaterial3: true,
      ),
      home: const AppHome(),
    );
  }
}

class AppHome extends StatefulWidget {
  const AppHome({super.key});

  @override
  State<AppHome> createState() => _AppHomeState();
}

class _AppHomeState extends State<AppHome> {
  int _tabIndex = 0;
  int _selectedPlace = 0;
  LocaleOption _locale = LocaleOption.ca;

  final List<PlaceSummary> places = const [
    PlaceSummary(
      name: 'Biblioteca Sant Antoni',
      city: 'Barcelona',
      category: 'Cultura',
      score: 4.4,
      description: 'Espai amb zones de lectura silencioses i sortides clares.',
    ),
    PlaceSummary(
      name: 'Centre cívic de Gràcia',
      city: 'Barcelona',
      category: 'Cultura',
      score: 3.8,
      description: 'Activitat variable segons horari; recomanable consultar afluència.',
    ),
    PlaceSummary(
      name: 'Cafeteria Calma',
      city: 'Girona',
      category: 'Cafeteria',
      score: 4.7,
      description: 'Il·luminació càlida, taules separades i música baixa al matí.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final labels = translations[_locale]!;
    final selectedPlace = places[_selectedPlace];

    return Scaffold(
      appBar: AppBar(
        title: Text(labels.appName),
        actions: [
          DropdownButtonHideUnderline(
            child: DropdownButton<LocaleOption>(
              value: _locale,
              items: LocaleOption.values
                  .map(
                    (locale) => DropdownMenuItem(
                      value: locale,
                      child: Text(locale.label),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _locale = value);
                }
              },
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: SafeArea(
        child: IndexedStack(
          index: _tabIndex,
          children: [
            MapScreen(
              places: places,
              selectedIndex: _selectedPlace,
              labels: labels,
              onSelected: (index) => setState(() => _selectedPlace = index),
            ),
            ContributionsScreen(place: selectedPlace, labels: labels),
            SupportScreen(labels: labels),
            ProfilesScreen(labels: labels),
            VerifiedScreen(labels: labels),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        onDestinationSelected: (index) => setState(() => _tabIndex = index),
        destinations: [
          NavigationDestination(icon: const Icon(Icons.map_outlined), selectedIcon: const Icon(Icons.map), label: labels.map),
          NavigationDestination(icon: const Icon(Icons.upload_outlined), selectedIcon: const Icon(Icons.upload), label: labels.contributions),
          NavigationDestination(icon: const Icon(Icons.support_outlined), selectedIcon: const Icon(Icons.support), label: labels.support),
          NavigationDestination(icon: const Icon(Icons.people_outline), selectedIcon: const Icon(Icons.people), label: labels.profiles),
          NavigationDestination(icon: const Icon(Icons.verified_outlined), selectedIcon: const Icon(Icons.verified), label: labels.verified),
        ],
      ),
    );
  }
}

class MapScreen extends StatelessWidget {
  const MapScreen({
    required this.places,
    required this.selectedIndex,
    required this.labels,
    required this.onSelected,
    super.key,
  });

  final List<PlaceSummary> places;
  final int selectedIndex;
  final AppLabels labels;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    final selectedPlace = places[selectedIndex];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SearchBar(
          leading: const Icon(Icons.search),
          hintText: labels.search,
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 300,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: const Color(0xFFDCE8DF),
              border: Border.all(color: const Color(0xFFD9D2C4)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: CalmMapPainter(),
                  ),
                ),
                _MapPin(left: 0.28, top: 0.42, selected: selectedIndex == 0, onTap: () => onSelected(0)),
                _MapPin(left: 0.55, top: 0.25, selected: selectedIndex == 1, onTap: () => onSelected(1)),
                _MapPin(left: 0.72, top: 0.62, selected: selectedIndex == 2, onTap: () => onSelected(2)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        PlacePanel(place: selectedPlace),
        const SizedBox(height: 16),
        ...places.indexed.map(
          (entry) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              selected: entry.$1 == selectedIndex,
              tileColor: Colors.white,
              selectedTileColor: const Color(0xFFE7EFE9),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: Color(0xFFD9D2C4)),
              ),
              title: Text(entry.$2.name),
              subtitle: Text('${entry.$2.city} · ${entry.$2.category}'),
              trailing: Text(entry.$2.score.toStringAsFixed(1)),
              onTap: () => onSelected(entry.$1),
            ),
          ),
        ),
      ],
    );
  }
}

class ContributionsScreen extends StatelessWidget {
  const ContributionsScreen({required this.place, required this.labels, super.key});

  final PlaceSummary place;
  final AppLabels labels;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(place.name, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 4),
        Text(labels.pendingModeration, style: const TextStyle(color: Color(0xFF66736B))),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: const [
            SensorySlider(label: 'Soroll'),
            SensorySlider(label: 'Afluència'),
            SensorySlider(label: 'Llum'),
            SensorySlider(label: 'Temperatura'),
            SensorySlider(label: 'Espera'),
            SensorySlider(label: 'Tracte'),
          ],
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.photo_library_outlined),
          label: Text(labels.uploadImage),
        ),
        const SizedBox(height: 12),
        TextField(
          minLines: 4,
          maxLines: 8,
          decoration: InputDecoration(
            labelText: labels.addComment,
            border: const OutlineInputBorder(),
            filled: true,
            fillColor: Colors.white,
          ),
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.send_outlined),
          label: Text(labels.submitReview),
        ),
      ],
    );
  }
}

class SupportScreen extends StatelessWidget {
  const SupportScreen({required this.labels, super.key});

  final AppLabels labels;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(labels.quickCard, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        DecoratedBox(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: const Color(0xFFD9D2C4)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Padding(
            padding: EdgeInsets.all(20),
            child: Text(
              'Soc una persona autista. Ara mateix em costa parlar o respondre. Necessito uns minuts, un lloc tranquil o contactar amb una persona de confiança.',
              style: TextStyle(fontSize: 22, height: 1.45),
            ),
          ),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.spa_outlined),
          label: Text(labels.calmMode),
        ),
      ],
    );
  }
}

class ProfilesScreen extends StatelessWidget {
  const ProfilesScreen({required this.labels, super.key});

  final AppLabels labels;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        InfoPanel(
          icon: Icons.family_restroom,
          title: labels.childProfile,
          body: 'Perfil infantil tutelat dins el compte del tutor, sense email propi. Les valoracions requereixen revisió del tutor abans d’enviar-se.',
          action: labels.tutorReview,
        ),
        const SizedBox(height: 12),
        const InfoPanel(
          icon: Icons.favorite_border,
          title: 'Perfil sensorial',
          body: 'Preferències funcionals de soroll, llum, afluència, temperatura i espera. No es demana diagnòstic.',
          action: 'Editar preferències',
        ),
      ],
    );
  }
}

class VerifiedScreen extends StatelessWidget {
  const VerifiedScreen({required this.labels, super.key});

  final AppLabels labels;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(labels.professionalTrust, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        const VerifiedTile(
          icon: Icons.psychology_outlined,
          title: 'Dra. Marta Soler',
          subtitle: 'Autisme adult i suport familiar',
          detail: 'COPC 24421',
        ),
        const SizedBox(height: 12),
        const VerifiedTile(
          icon: Icons.apartment_outlined,
          title: 'Associació Autisme Obert',
          subtitle: 'Entitat de suport a persones autistes i famílies',
          detail: 'Registre 12345',
        ),
      ],
    );
  }
}

class PlacePanel extends StatelessWidget {
  const PlacePanel({required this.place, super.key});

  final PlaceSummary place;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFD9D2C4)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(place.name, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 4),
            Text('${place.city} · ${place.category}', style: const TextStyle(color: Color(0xFF66736B))),
            const SizedBox(height: 12),
            Text(place.description),
            const SizedBox(height: 12),
            Text('Puntuació ${place.score.toStringAsFixed(1)}', style: const TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class SensorySlider extends StatelessWidget {
  const SensorySlider({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFD9D2C4)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
              Slider(value: 3, min: 1, max: 5, divisions: 4, onChanged: (_) {}),
            ],
          ),
        ),
      ),
    );
  }
}

class InfoPanel extends StatelessWidget {
  const InfoPanel({
    required this.icon,
    required this.title,
    required this.body,
    required this.action,
    super.key,
  });

  final IconData icon;
  final String title;
  final String body;
  final String action;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFD9D2C4)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: const Color(0xFF2F6F73)),
            const SizedBox(height: 10),
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(body),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: () {}, child: Text(action)),
          ],
        ),
      ),
    );
  }
}

class VerifiedTile extends StatelessWidget {
  const VerifiedTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.detail,
    super.key,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFD9D2C4)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF2F6F73)),
        title: Text(title),
        subtitle: Text('$subtitle\n$detail'),
        isThreeLine: true,
        trailing: const Icon(Icons.verified, color: Color(0xFF2F6F73)),
      ),
    );
  }
}

class _MapPin extends StatelessWidget {
  const _MapPin({
    required this.left,
    required this.top,
    required this.selected,
    required this.onTap,
  });

  final double left;
  final double top;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: FractionallySizedBox(
        alignment: Alignment(left * 2 - 1, top * 2 - 1),
        widthFactor: 0.14,
        heightFactor: 0.14,
        child: IconButton.filled(
          style: IconButton.styleFrom(
            backgroundColor: selected ? const Color(0xFF9A5C18) : const Color(0xFF2F6F73),
          ),
          onPressed: onTap,
          icon: const Icon(Icons.location_on),
        ),
      ),
    );
  }
}

class CalmMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final blockPaint = Paint()..color = const Color(0xFFEFF4EF);
    final roadPaint = Paint()..color = const Color(0xFFC3B189);
    final gridPaint = Paint()
      ..color = const Color(0xFFC2D6CC)
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 48) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 48) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width * .1, size.height * .12, size.width * .18, size.height * .72), const Radius.circular(8)), blockPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width * .36, size.height * .08, size.width * .12, size.height * .84), const Radius.circular(8)), blockPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width * .58, size.height * .18, size.width * .24, size.height * .58), const Radius.circular(8)), blockPaint);
    canvas.drawRect(Rect.fromLTWH(0, size.height * .48, size.width, 28), roadPaint);
    canvas.drawRect(Rect.fromLTWH(size.width * .48, 0, 28, size.height), roadPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class PlaceSummary {
  const PlaceSummary({
    required this.name,
    required this.city,
    required this.category,
    required this.score,
    required this.description,
  });

  final String name;
  final String city;
  final String category;
  final double score;
  final String description;
}

enum LocaleOption {
  ca('CA'),
  es('ES'),
  en('EN');

  const LocaleOption(this.label);
  final String label;
}

class AppLabels {
  const AppLabels({
    required this.appName,
    required this.map,
    required this.contributions,
    required this.support,
    required this.profiles,
    required this.verified,
    required this.search,
    required this.uploadImage,
    required this.addComment,
    required this.submitReview,
    required this.pendingModeration,
    required this.quickCard,
    required this.calmMode,
    required this.childProfile,
    required this.tutorReview,
    required this.professionalTrust,
  });

  final String appName;
  final String map;
  final String contributions;
  final String support;
  final String profiles;
  final String verified;
  final String search;
  final String uploadImage;
  final String addComment;
  final String submitReview;
  final String pendingModeration;
  final String quickCard;
  final String calmMode;
  final String childProfile;
  final String tutorReview;
  final String professionalTrust;
}

const translations = {
  LocaleOption.ca: AppLabels(
    appName: 'Accessibilitat sensorial',
    map: 'Mapa',
    contributions: 'Aportacions',
    support: 'Ajuda',
    profiles: 'Perfils',
    verified: 'Verificats',
    search: 'Cerca llocs, ciutat o categoria',
    uploadImage: 'Pujar imatge',
    addComment: 'Afegir comentari',
    submitReview: 'Enviar valoració',
    pendingModeration: 'Pendent de moderació',
    quickCard: 'Targeta de comunicació',
    calmMode: 'Mode tranquil',
    childProfile: 'Perfil tutelat',
    tutorReview: 'Revisió del tutor',
    professionalTrust: 'Confiança professional',
  ),
  LocaleOption.es: AppLabels(
    appName: 'Accesibilidad sensorial',
    map: 'Mapa',
    contributions: 'Aportaciones',
    support: 'Ayuda',
    profiles: 'Perfiles',
    verified: 'Verificados',
    search: 'Busca lugares, ciudad o categoría',
    uploadImage: 'Subir imagen',
    addComment: 'Añadir comentario',
    submitReview: 'Enviar valoración',
    pendingModeration: 'Pendiente de moderación',
    quickCard: 'Tarjeta de comunicación',
    calmMode: 'Modo tranquilo',
    childProfile: 'Perfil tutelado',
    tutorReview: 'Revisión del tutor',
    professionalTrust: 'Confianza profesional',
  ),
  LocaleOption.en: AppLabels(
    appName: 'Sensory accessibility',
    map: 'Map',
    contributions: 'Contributions',
    support: 'Support',
    profiles: 'Profiles',
    verified: 'Verified',
    search: 'Search places, city or category',
    uploadImage: 'Upload image',
    addComment: 'Add comment',
    submitReview: 'Submit review',
    pendingModeration: 'Pending moderation',
    quickCard: 'Communication card',
    calmMode: 'Calm mode',
    childProfile: 'Tutored profile',
    tutorReview: 'Tutor review',
    professionalTrust: 'Professional trust',
  ),
};
