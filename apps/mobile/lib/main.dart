import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:firebase_core/firebase_core.dart';

import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const SensoryAccessApp());
}

class SensoryAccessApp extends StatefulWidget {
  const SensoryAccessApp({super.key});

  @override
  State<SensoryAccessApp> createState() => _SensoryAccessAppState();
}

class _SensoryAccessAppState extends State<SensoryAccessApp> {
  ThemeMode _themeMode = ThemeMode.light;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Spectrum Access',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: _buildTheme(Brightness.light),
      darkTheme: _buildTheme(Brightness.dark),
      home: AppHome(
        themeMode: _themeMode,
        onThemeModeChanged: (mode) => setState(() => _themeMode = mode),
      ),
    );
  }
}

ThemeData _buildTheme(Brightness brightness) {
  final isDark = brightness == Brightness.dark;
  final colorScheme = ColorScheme.fromSeed(
    seedColor: AppColors.deepTeal,
    brightness: brightness,
    primary: isDark ? AppColors.tealLight : AppColors.deepTeal,
    secondary: isDark ? AppColors.amberLight : AppColors.clay,
    surface: isDark ? AppColors.darkSurface : AppColors.surface,
  );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: isDark
        ? AppColors.darkBackground
        : AppColors.background,
    appBarTheme: AppBarTheme(
      centerTitle: false,
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      foregroundColor: isDark ? AppColors.darkText : AppColors.text,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        minimumSize: const Size(0, 48),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        minimumSize: const Size(0, 44),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(
          color: isDark ? AppColors.darkLine : AppColors.line,
        ),
      ),
      filled: true,
      fillColor: isDark ? AppColors.darkPanel : Colors.white,
    ),
  );
}

class AppHome extends StatefulWidget {
  const AppHome({
    required this.themeMode,
    required this.onThemeModeChanged,
    super.key,
  });

  final ThemeMode themeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  State<AppHome> createState() => _AppHomeState();
}

class _AppHomeState extends State<AppHome> {
  bool _showHome = true;
  MobileTab _selectedTab = MobileTab.consultation;
  int _selectedPlace = 0;
  LocaleOption _locale = LocaleOption.ca;

  final List<PlaceSummary> places = const [
    PlaceSummary(
      name: 'Biblioteca Sant Antoni',
      city: 'Barcelona',
      category: 'Cultura',
      score: 4.4,
      description:
          'Espai amb zones de lectura silencioses, sortides clares i llum controlada.',
    ),
    PlaceSummary(
      name: 'Centre civic de Gracia',
      city: 'Barcelona',
      category: 'Cultura',
      score: 3.8,
      description:
          'Activitat variable segons horari; recomanable consultar afluencia abans d anar-hi.',
    ),
    PlaceSummary(
      name: 'Cafeteria Calma',
      city: 'Girona',
      category: 'Cafeteria',
      score: 4.7,
      description:
          'Il·luminacio calida, taules separades i musica baixa al mati.',
    ),
  ];

  void _openTab(MobileTab tab) {
    setState(() {
      _selectedTab = tab;
      _showHome = false;
    });
  }

  void _openHome() {
    setState(() => _showHome = true);
  }

  @override
  Widget build(BuildContext context) {
    final labels = translations[_locale]!;
    final selectedPlace = places[_selectedPlace];
    final isDark = widget.themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 12,
        title: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: _openHome,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const BrandLogo(size: 36),
                const SizedBox(width: 10),
                Flexible(
                  child: Text(
                    labels.appName,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          IconButton(
            tooltip: labels.home,
            onPressed: _openHome,
            icon: const Icon(Icons.grid_view_outlined),
          ),
          IconButton(
            tooltip: isDark ? labels.lightMode : labels.darkMode,
            onPressed: () => widget.onThemeModeChanged(
              isDark ? ThemeMode.light : ThemeMode.dark,
            ),
            icon: Icon(
              isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
            ),
          ),
          DropdownButtonHideUnderline(
            child: DropdownButton<LocaleOption>(
              value: _locale,
              borderRadius: BorderRadius.circular(8),
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
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 180),
          child: _showHome
              ? HomeScreen(
                  key: const ValueKey('home'),
                  labels: labels,
                  selectedPlace: selectedPlace,
                  onOpenTab: _openTab,
                  onThemeModeChanged: widget.onThemeModeChanged,
                  themeMode: widget.themeMode,
                )
              : _screenForTab(labels, selectedPlace),
        ),
      ),
      bottomNavigationBar: MobileBottomNavigation(
        labels: labels,
        selectedTab: _showHome ? null : _selectedTab,
        onSelected: _openTab,
      ),
    );
  }

  Widget _screenForTab(AppLabels labels, PlaceSummary selectedPlace) {
    switch (_selectedTab) {
      case MobileTab.consultation:
        return ConsultationScreen(
          key: const ValueKey('consultation'),
          places: places,
          selectedIndex: _selectedPlace,
          labels: labels,
          onSelected: (index) => setState(() => _selectedPlace = index),
        );
      case MobileTab.contributions:
        return ContributionsScreen(
          key: const ValueKey('contributions'),
          place: selectedPlace,
          labels: labels,
        );
      case MobileTab.support:
        return SupportScreen(key: const ValueKey('support'), labels: labels);
      case MobileTab.profiles:
        return ProfilesScreen(key: const ValueKey('profiles'), labels: labels);
    }
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    required this.labels,
    required this.selectedPlace,
    required this.onOpenTab,
    required this.themeMode,
    required this.onThemeModeChanged,
    super.key,
  });

  final AppLabels labels;
  final PlaceSummary selectedPlace;
  final ValueChanged<MobileTab> onOpenTab;
  final ThemeMode themeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = themeMode == ThemeMode.dark;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
      children: [
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const BrandLogo(size: 58),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          labels.home,
                          style: Theme.of(context).textTheme.labelLarge,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          labels.homeTitle,
                          style: Theme.of(context).textTheme.headlineSmall
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          labels.homeIntro,
                          style: TextStyle(
                            color: AppColors.mutedFor(context),
                            height: 1.45,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: StatusPill(
                      icon: Icons.verified_user_outlined,
                      text: labels.sessionStatus,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => onThemeModeChanged(
                        isDark ? ThemeMode.light : ThemeMode.dark,
                      ),
                      icon: Icon(
                        isDark
                            ? Icons.light_mode_outlined
                            : Icons.dark_mode_outlined,
                      ),
                      label: Text(isDark ? labels.lightMode : labels.darkMode),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        SectionTitle(title: labels.quickActions),
        const SizedBox(height: 10),
        QuickActionGrid(labels: labels, onOpenTab: onOpenTab),
        const SizedBox(height: 14),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeader(
                title: labels.nearbyMap,
                action: labels.openConsultation,
                onTap: () => onOpenTab(MobileTab.consultation),
              ),
              const SizedBox(height: 10),
              CalmMapPreview(
                selectedIndex: 0,
                onSelected: (_) => onOpenTab(MobileTab.consultation),
              ),
              const SizedBox(height: 12),
              PlacePanel(place: selectedPlace),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeader(
                title: labels.draftContribution,
                action: labels.openContribution,
                onTap: () => onOpenTab(MobileTab.contributions),
              ),
              const SizedBox(height: 10),
              const UploadPreview(),
              const SizedBox(height: 10),
              Text(
                labels.commentPlaceholder,
                style: TextStyle(
                  color: AppColors.mutedFor(context),
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 10),
              const RatingPreview(value: 3),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeader(
                title: labels.support,
                action: labels.openHelp,
                onTap: () => onOpenTab(MobileTab.support),
              ),
              const SizedBox(height: 10),
              CommunicationCopy(text: labels.communicationText),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeader(
                title: labels.profilesAndVerified,
                action: labels.openProfiles,
                onTap: () => onOpenTab(MobileTab.profiles),
              ),
              const SizedBox(height: 10),
              InfoPanel(
                icon: Icons.family_restroom_outlined,
                title: labels.tutoredProfiles,
                body: labels.profileSummary,
                action: labels.tutorReview,
              ),
              const SizedBox(height: 10),
              VerifiedTile(
                icon: Icons.psychology_outlined,
                title: labels.sampleProfessional,
                subtitle: labels.sampleProfessionalSpecialty,
                detail: 'COPC 24421',
                action: labels.contact,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class QuickActionGrid extends StatelessWidget {
  const QuickActionGrid({
    required this.labels,
    required this.onOpenTab,
    super.key,
  });

  final AppLabels labels;
  final ValueChanged<MobileTab> onOpenTab;

  @override
  Widget build(BuildContext context) {
    final actions = [
      QuickActionData(
        Icons.map_outlined,
        labels.consultation,
        labels.openConsultation,
        MobileTab.consultation,
      ),
      QuickActionData(
        Icons.upload_outlined,
        labels.contributions,
        labels.openContribution,
        MobileTab.contributions,
      ),
      QuickActionData(
        Icons.front_hand_outlined,
        labels.support,
        labels.openHelp,
        MobileTab.support,
      ),
      QuickActionData(
        Icons.people_outline,
        labels.profiles,
        labels.openProfiles,
        MobileTab.profiles,
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth > 520 ? 2 : 1;
        return GridView.count(
          crossAxisCount: columns,
          childAspectRatio: columns == 2 ? 3.4 : 4.0,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: actions
              .map(
                (action) => QuickActionTile(
                  action: action,
                  onTap: () => onOpenTab(action.tab),
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class ConsultationScreen extends StatelessWidget {
  const ConsultationScreen({
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
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
      children: [
        Text(
          labels.consultationTitle,
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        Text(
          labels.consultationIntro,
          style: TextStyle(color: AppColors.mutedFor(context), height: 1.45),
        ),
        const SizedBox(height: 14),
        SearchBar(
          leading: const Icon(Icons.search),
          hintText: labels.search,
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: labels.filters
              .map(
                (filter) => FilterChip(
                  label: Text(filter),
                  onSelected: (_) {},
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 14),
        CalmMapPreview(selectedIndex: selectedIndex, onSelected: onSelected),
        const SizedBox(height: 14),
        PlacePanel(place: selectedPlace),
        const SizedBox(height: 14),
        ...places.indexed.map(
          (entry) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: PlaceListTile(
              place: entry.$2,
              selected: entry.$1 == selectedIndex,
              onTap: () => onSelected(entry.$1),
            ),
          ),
        ),
      ],
    );
  }
}

class ContributionsScreen extends StatefulWidget {
  const ContributionsScreen({
    required this.place,
    required this.labels,
    super.key,
  });

  final PlaceSummary place;
  final AppLabels labels;

  @override
  State<ContributionsScreen> createState() => _ContributionsScreenState();
}

class _ContributionsScreenState extends State<ContributionsScreen> {
  bool _anonymous = false;

  @override
  Widget build(BuildContext context) {
    final labels = widget.labels;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
      children: [
        Text(
          labels.contributionsTitle,
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        Text(
          labels.contributionsIntro,
          style: TextStyle(color: AppColors.mutedFor(context), height: 1.45),
        ),
        const SizedBox(height: 14),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.place.name,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 4),
              Text(
                labels.pendingModeration,
                style: TextStyle(color: AppColors.mutedFor(context)),
              ),
              const SizedBox(height: 14),
              UploadPreview(
                label: labels.uploadImage,
                helper: labels.uploadHint,
              ),
              const SizedBox(height: 14),
              TextField(
                minLines: 4,
                maxLines: 8,
                decoration: InputDecoration(
                  labelText: labels.addComment,
                  hintText: labels.commentPlaceholder,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                labels.sensoryRatings,
                style: Theme.of(
                  context,
                ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              const SensorySlider(label: 'Soroll', value: 2),
              const SensorySlider(label: 'Afluencia', value: 3),
              const SensorySlider(label: 'Llum', value: 3),
              const SensorySlider(label: 'Espera', value: 2),
              CheckboxListTile(
                value: _anonymous,
                onChanged: (value) =>
                    setState(() => _anonymous = value ?? false),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
                title: Text(labels.anonymous),
              ),
              FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.send_outlined),
                label: Text(labels.submitReview),
              ),
            ],
          ),
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
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
      children: [
        Text(
          labels.supportTitle,
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        Text(
          labels.supportIntro,
          style: TextStyle(color: AppColors.mutedFor(context), height: 1.45),
        ),
        const SizedBox(height: 14),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                labels.quickCard,
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 12),
              CommunicationCopy(text: labels.communicationText),
              const SizedBox(height: 14),
              FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.spa_outlined),
                label: Text(labels.calmMode),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        InfoPanel(
          icon: Icons.phone_outlined,
          title: labels.trustedContact,
          body: labels.trustedContactBody,
          action: labels.contact,
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
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
      children: [
        Text(
          labels.profilesTitle,
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        Text(
          labels.profilesIntro,
          style: TextStyle(color: AppColors.mutedFor(context), height: 1.45),
        ),
        const SizedBox(height: 14),
        SectionTitle(title: labels.verifiedProfessionals),
        const SizedBox(height: 10),
        VerifiedTile(
          icon: Icons.psychology_outlined,
          title: labels.sampleProfessional,
          subtitle: labels.sampleProfessionalSpecialty,
          detail: 'COPC 24421',
          action: labels.contact,
        ),
        const SizedBox(height: 10),
        VerifiedTile(
          icon: Icons.apartment_outlined,
          title: labels.sampleOrganization,
          subtitle: labels.sampleOrganizationSpecialty,
          detail: 'Registre 12345',
          action: labels.contact,
        ),
        const SizedBox(height: 12),
        InfoPanel(
          icon: Icons.person_outline,
          title: labels.adultProfile,
          body: labels.adultProfileBody,
          action: labels.editProfile,
        ),
        const SizedBox(height: 12),
        InfoPanel(
          icon: Icons.family_restroom_outlined,
          title: labels.childProfile,
          body: labels.childProfileBody,
          action: labels.tutorReview,
        ),
        const SizedBox(height: 12),
        InfoPanel(
          icon: Icons.favorite_border,
          title: labels.sensoryProfile,
          body: labels.sensoryProfileBody,
          action: labels.editPreferences,
        ),
      ],
    );
  }
}

class MobileBottomNavigation extends StatelessWidget {
  const MobileBottomNavigation({
    required this.labels,
    required this.selectedTab,
    required this.onSelected,
    super.key,
  });

  final AppLabels labels;
  final MobileTab? selectedTab;
  final ValueChanged<MobileTab> onSelected;

  @override
  Widget build(BuildContext context) {
    final items = [
      BottomNavData(
        MobileTab.consultation,
        Icons.map_outlined,
        Icons.map,
        labels.consultation,
      ),
      BottomNavData(
        MobileTab.contributions,
        Icons.upload_outlined,
        Icons.upload,
        labels.contributions,
      ),
      BottomNavData(
        MobileTab.support,
        Icons.front_hand_outlined,
        Icons.front_hand,
        labels.support,
      ),
      BottomNavData(
        MobileTab.profiles,
        Icons.people_outline,
        Icons.people,
        labels.profiles,
      ),
    ];

    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(top: BorderSide(color: AppColors.lineFor(context))),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
          child: Row(
            children: items
                .map(
                  (item) => Expanded(
                    child: BottomNavItem(
                      item: item,
                      selected: selectedTab == item.tab,
                      onTap: () => onSelected(item.tab),
                    ),
                  ),
                )
                .toList(),
          ),
        ),
      ),
    );
  }
}

class BrandLogo extends StatelessWidget {
  const BrandLogo({this.size = 42, super.key});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Logo oficial Spectrum Access',
      image: true,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: SvgPicture.asset(
          'assets/brand/accessibilitat-logo.svg',
          width: size,
          height: size,
        ),
      ),
    );
  }
}

class AppPanel extends StatelessWidget {
  const AppPanel({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border.all(color: AppColors.lineFor(context)),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: Theme.of(context).brightness == Brightness.dark
                  ? 0.22
                  : 0.06,
            ),
            blurRadius: 22,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class StatusPill extends StatelessWidget {
  const StatusPill({required this.icon, required this.text, super.key});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.tealTintFor(context),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.tealSoftFor(context)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: AppColors.tealFor(context)),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                text,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: AppColors.tealFor(context),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class QuickActionTile extends StatelessWidget {
  const QuickActionTile({required this.action, required this.onTap, super.key});

  final QuickActionData action;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: AppColors.lineFor(context)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Icon(action.icon, color: AppColors.tealFor(context)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      action.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      action.subtitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.mutedFor(context),
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({required this.title, super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(
        context,
      ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    required this.title,
    required this.action,
    required this.onTap,
    super.key,
  });

  final String title;
  final String action;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: SectionTitle(title: title)),
        TextButton(onPressed: onTap, child: Text(action)),
      ],
    );
  }
}

class CalmMapPreview extends StatelessWidget {
  const CalmMapPreview({
    required this.selectedIndex,
    required this.onSelected,
    super.key,
  });

  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 290,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark
              ? AppColors.darkMap
              : AppColors.sage,
          border: Border.all(color: AppColors.lineFor(context)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: CalmMapPainter(
                  isDark: Theme.of(context).brightness == Brightness.dark,
                ),
              ),
            ),
            _MapPin(
              left: 0.28,
              top: 0.42,
              selected: selectedIndex == 0,
              onTap: () => onSelected(0),
            ),
            _MapPin(
              left: 0.55,
              top: 0.25,
              selected: selectedIndex == 1,
              onTap: () => onSelected(1),
            ),
            _MapPin(
              left: 0.72,
              top: 0.62,
              selected: selectedIndex == 2,
              onTap: () => onSelected(2),
            ),
          ],
        ),
      ),
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
        color: Theme.of(context).brightness == Brightness.dark
            ? AppColors.darkPanel
            : Colors.white,
        border: Border.all(color: AppColors.lineFor(context)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    place.name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                ScoreBadge(value: place.score),
              ],
            ),
            const SizedBox(height: 5),
            Text(
              '${place.city} · ${place.category}',
              style: TextStyle(color: AppColors.mutedFor(context)),
            ),
            const SizedBox(height: 10),
            Text(place.description, style: const TextStyle(height: 1.4)),
          ],
        ),
      ),
    );
  }
}

class PlaceListTile extends StatelessWidget {
  const PlaceListTile({
    required this.place,
    required this.selected,
    required this.onTap,
    super.key,
  });

  final PlaceSummary place;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected
          ? AppColors.tealTintFor(context)
          : Theme.of(context).colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: selected
              ? AppColors.tealSoftFor(context)
              : AppColors.lineFor(context),
        ),
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        title: Text(
          place.name,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        subtitle: Text('${place.city} · ${place.category}'),
        trailing: ScoreBadge(value: place.score),
        onTap: onTap,
      ),
    );
  }
}

class ScoreBadge extends StatelessWidget {
  const ScoreBadge({required this.value, super.key});

  final double value;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.clayTintFor(context),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 9),
        child: Text(
          value.toStringAsFixed(1),
          style: TextStyle(
            color: AppColors.clayFor(context),
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class UploadPreview extends StatelessWidget {
  const UploadPreview({this.label, this.helper, super.key});

  final String? label;
  final String? helper;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.tealTintFor(context),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: AppColors.tealSoftFor(context),
          style: BorderStyle.solid,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              Icons.photo_library_outlined,
              color: AppColors.tealFor(context),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label ?? 'Pujar imatge',
                    style: TextStyle(
                      color: AppColors.tealFor(context),
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  if (helper != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      helper!,
                      style: TextStyle(
                        color: AppColors.mutedFor(context),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class RatingPreview extends StatelessWidget {
  const RatingPreview({required this.value, super.key});

  final int value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(
        5,
        (index) => Padding(
          padding: const EdgeInsets.only(right: 4),
          child: Icon(
            index < value ? Icons.star : Icons.star_border,
            size: 24,
            color: AppColors.amberFor(context),
          ),
        ),
      ),
    );
  }
}

class CommunicationCopy extends StatelessWidget {
  const CommunicationCopy({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark
              ? AppColors.darkPanel
              : Colors.white,
        ),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ColoredBox(
                color: AppColors.amberFor(context),
                child: const SizedBox(width: 4),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    text,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      height: 1.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SensorySlider extends StatelessWidget {
  const SensorySlider({required this.label, required this.value, super.key});

  final String label;
  final double value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
            width: 86,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
          Expanded(
            child: Slider(
              value: value,
              min: 1,
              max: 5,
              divisions: 4,
              onChanged: (_) {},
            ),
          ),
        ],
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
    return AppPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.tealFor(context)),
          const SizedBox(height: 10),
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(body, style: const TextStyle(height: 1.45)),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: () {}, child: Text(action)),
        ],
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
    required this.action,
    super.key,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String detail;
  final String action;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).colorScheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: AppColors.lineFor(context)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.tealFor(context), size: 28),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                      ),
                      Icon(
                        Icons.verified_outlined,
                        color: AppColors.tealFor(context),
                        size: 20,
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: AppColors.mutedFor(context),
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 7),
                  Text(
                    detail,
                    style: TextStyle(
                      color: AppColors.tealFor(context),
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton(onPressed: () {}, child: Text(action)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BottomNavItem extends StatelessWidget {
  const BottomNavItem({
    required this.item,
    required this.selected,
    required this.onTap,
    super.key,
  });

  final BottomNavData item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final foreground = selected
        ? AppColors.tealFor(context)
        : AppColors.mutedFor(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3),
      child: Material(
        color: selected ? AppColors.tealTintFor(context) : Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  selected ? item.selectedIcon : item.icon,
                  color: foreground,
                ),
                const SizedBox(height: 3),
                Text(
                  item.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: foreground,
                  ),
                ),
              ],
            ),
          ),
        ),
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
            backgroundColor: selected
                ? AppColors.clayFor(context)
                : AppColors.tealFor(context),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onPressed: onTap,
          icon: const Icon(Icons.location_on),
        ),
      ),
    );
  }
}

class CalmMapPainter extends CustomPainter {
  CalmMapPainter({required this.isDark});

  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final blockPaint = Paint()
      ..color = isDark ? const Color(0xFF2D3C37) : const Color(0xFFEFF4EF);
    final roadPaint = Paint()
      ..color = isDark ? const Color(0xFF705E3E) : const Color(0xFFC3B189);
    final gridPaint = Paint()
      ..color = isDark ? const Color(0xFF3E514A) : const Color(0xFFC2D6CC)
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 48) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 48) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(
          size.width * .1,
          size.height * .12,
          size.width * .18,
          size.height * .72,
        ),
        const Radius.circular(8),
      ),
      blockPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(
          size.width * .36,
          size.height * .08,
          size.width * .12,
          size.height * .84,
        ),
        const Radius.circular(8),
      ),
      blockPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(
          size.width * .58,
          size.height * .18,
          size.width * .24,
          size.height * .58,
        ),
        const Radius.circular(8),
      ),
      blockPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(0, size.height * .48, size.width, 28),
      roadPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(size.width * .48, 0, 28, size.height),
      roadPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CalmMapPainter oldDelegate) =>
      oldDelegate.isDark != isDark;
}

class QuickActionData {
  const QuickActionData(this.icon, this.title, this.subtitle, this.tab);

  final IconData icon;
  final String title;
  final String subtitle;
  final MobileTab tab;
}

class BottomNavData {
  const BottomNavData(this.tab, this.icon, this.selectedIcon, this.label);

  final MobileTab tab;
  final IconData icon;
  final IconData selectedIcon;
  final String label;
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

enum MobileTab { consultation, contributions, support, profiles }

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
    required this.home,
    required this.consultation,
    required this.contributions,
    required this.support,
    required this.profiles,
    required this.homeTitle,
    required this.homeIntro,
    required this.sessionStatus,
    required this.darkMode,
    required this.lightMode,
    required this.quickActions,
    required this.nearbyMap,
    required this.draftContribution,
    required this.tutoredProfiles,
    required this.profilesAndVerified,
    required this.openConsultation,
    required this.openContribution,
    required this.openHelp,
    required this.openProfiles,
    required this.search,
    required this.filters,
    required this.consultationTitle,
    required this.consultationIntro,
    required this.contributionsTitle,
    required this.contributionsIntro,
    required this.uploadImage,
    required this.uploadHint,
    required this.addComment,
    required this.commentPlaceholder,
    required this.submitReview,
    required this.pendingModeration,
    required this.sensoryRatings,
    required this.anonymous,
    required this.supportTitle,
    required this.supportIntro,
    required this.quickCard,
    required this.calmMode,
    required this.communicationText,
    required this.trustedContact,
    required this.trustedContactBody,
    required this.profilesTitle,
    required this.profilesIntro,
    required this.adultProfile,
    required this.adultProfileBody,
    required this.childProfile,
    required this.childProfileBody,
    required this.tutorReview,
    required this.sensoryProfile,
    required this.sensoryProfileBody,
    required this.editProfile,
    required this.editPreferences,
    required this.verifiedProfessionals,
    required this.sampleProfessional,
    required this.sampleProfessionalSpecialty,
    required this.sampleOrganization,
    required this.sampleOrganizationSpecialty,
    required this.profileSummary,
    required this.contact,
  });

  final String appName;
  final String home;
  final String consultation;
  final String contributions;
  final String support;
  final String profiles;
  final String homeTitle;
  final String homeIntro;
  final String sessionStatus;
  final String darkMode;
  final String lightMode;
  final String quickActions;
  final String nearbyMap;
  final String draftContribution;
  final String tutoredProfiles;
  final String profilesAndVerified;
  final String openConsultation;
  final String openContribution;
  final String openHelp;
  final String openProfiles;
  final String search;
  final List<String> filters;
  final String consultationTitle;
  final String consultationIntro;
  final String contributionsTitle;
  final String contributionsIntro;
  final String uploadImage;
  final String uploadHint;
  final String addComment;
  final String commentPlaceholder;
  final String submitReview;
  final String pendingModeration;
  final String sensoryRatings;
  final String anonymous;
  final String supportTitle;
  final String supportIntro;
  final String quickCard;
  final String calmMode;
  final String communicationText;
  final String trustedContact;
  final String trustedContactBody;
  final String profilesTitle;
  final String profilesIntro;
  final String adultProfile;
  final String adultProfileBody;
  final String childProfile;
  final String childProfileBody;
  final String tutorReview;
  final String sensoryProfile;
  final String sensoryProfileBody;
  final String editProfile;
  final String editPreferences;
  final String verifiedProfessionals;
  final String sampleProfessional;
  final String sampleProfessionalSpecialty;
  final String sampleOrganization;
  final String sampleOrganizationSpecialty;
  final String profileSummary;
  final String contact;
}

const translations = {
  LocaleOption.ca: AppLabels(
    appName: 'Spectrum Access',
    home: 'Inici',
    consultation: 'Consulta',
    contributions: 'Aportacions',
    support: 'Ajuda',
    profiles: 'Perfils',
    homeTitle: 'El teu espai de Spectrum Access',
    homeIntro:
        'Consulta llocs, prepara aportacions amb calma i accedeix rapidament a ajuda, perfils i verificacions.',
    sessionStatus: 'Sessio protegida',
    darkMode: 'Mode fosc',
    lightMode: 'Mode clar',
    quickActions: 'Accions rapides',
    nearbyMap: 'Mapa proper',
    draftContribution: 'Aportacio pendent',
    tutoredProfiles: 'Perfils tutelats',
    profilesAndVerified: 'Perfils i verificats',
    openConsultation: 'Obrir consulta',
    openContribution: 'Aportar experiencia',
    openHelp: 'Obrir ajuda',
    openProfiles: 'Gestionar perfils',
    search: 'Cerca llocs, ciutat o categoria',
    filters: ['Soroll baix', 'Llum suau', 'Sortida clara'],
    consultationTitle: 'Consulta',
    consultationIntro:
        'Mapa proper, cerca, filtres i fitxa del lloc per revisar abans d anar-hi.',
    contributionsTitle: 'Aportacions',
    contributionsIntro:
        'Prepara imatges, comentaris i valoracions sensorials quan estiguis tranquil.',
    uploadImage: 'Pujar imatge',
    uploadHint: 'JPG o PNG. Quedara pendent de moderacio.',
    addComment: 'Afegir comentari',
    commentPlaceholder:
        'Comparteix detalls que puguin ajudar altres persones...',
    submitReview: 'Enviar valoracio',
    pendingModeration: 'Pendent de moderacio',
    sensoryRatings: 'Valoracions sensorials',
    anonymous: 'Publicar com a anonim',
    supportTitle: 'Ajuda',
    supportIntro:
        'Targeta de comunicacio i accions curtes per moments de sobrecarrega.',
    quickCard: 'Targeta de comunicacio',
    calmMode: 'Mode tranquil',
    communicationText:
        'Soc una persona autista. Ara mateix em costa parlar o respondre. Necessito uns minuts o un lloc tranquil.',
    trustedContact: 'Contacte de confianca',
    trustedContactBody:
        'Acces rapid a una persona definida pel compte quan cal demanar suport.',
    profilesTitle: 'Perfils',
    profilesIntro:
        'Adults, tutors, perfils tutelats, professionals i entitats verificades en un sol lloc.',
    adultProfile: 'Adult o persona identificada',
    adultProfileBody:
        'Pseudonim public editable, favorits, comentaris, imatges i reports amb el mateix compte web i mobil.',
    childProfile: 'Perfil tutelat',
    childProfileBody:
        'El tutor crea el perfil infantil sense email propi i revisa les aportacions abans d enviar-les.',
    tutorReview: 'Revisio del tutor',
    sensoryProfile: 'Perfil sensorial',
    sensoryProfileBody:
        'Preferencies de soroll, llum, afluencia, temperatura i espera sense demanar cap diagnostic.',
    editProfile: 'Editar perfil',
    editPreferences: 'Editar preferencies',
    verifiedProfessionals: 'Professionals verificats',
    sampleProfessional: 'Dra. Marta Soler',
    sampleProfessionalSpecialty: 'Autisme adult i suport familiar',
    sampleOrganization: 'Associacio Autisme Obert',
    sampleOrganizationSpecialty:
        'Centre i associacio de suport a persones autistes i families',
    profileSummary:
        'Perfils tutelats dins del compte principal i verificats accessibles des de Perfils.',
    contact: 'Contactar',
  ),
  LocaleOption.es: AppLabels(
    appName: 'Spectrum Access',
    home: 'Inicio',
    consultation: 'Consulta',
    contributions: 'Aportaciones',
    support: 'Ayuda',
    profiles: 'Perfiles',
    homeTitle: 'Tu espacio de Spectrum Access',
    homeIntro:
        'Consulta lugares, prepara aportaciones con calma y accede rapido a ayuda, perfiles y verificaciones.',
    sessionStatus: 'Sesion protegida',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    quickActions: 'Acciones rapidas',
    nearbyMap: 'Mapa cercano',
    draftContribution: 'Aportacion pendiente',
    tutoredProfiles: 'Perfiles tutelados',
    profilesAndVerified: 'Perfiles y verificados',
    openConsultation: 'Abrir consulta',
    openContribution: 'Aportar experiencia',
    openHelp: 'Abrir ayuda',
    openProfiles: 'Gestionar perfiles',
    search: 'Busca lugares, ciudad o categoria',
    filters: ['Ruido bajo', 'Luz suave', 'Salida clara'],
    consultationTitle: 'Consulta',
    consultationIntro:
        'Mapa cercano, busqueda, filtros y ficha del lugar para revisar antes de ir.',
    contributionsTitle: 'Aportaciones',
    contributionsIntro:
        'Prepara imagenes, comentarios y valoraciones sensoriales cuando estes tranquilo.',
    uploadImage: 'Subir imagen',
    uploadHint: 'JPG o PNG. Quedara pendiente de moderacion.',
    addComment: 'Anadir comentario',
    commentPlaceholder:
        'Comparte detalles que puedan ayudar a otras personas...',
    submitReview: 'Enviar valoracion',
    pendingModeration: 'Pendiente de moderacion',
    sensoryRatings: 'Valoraciones sensoriales',
    anonymous: 'Publicar como anonimo',
    supportTitle: 'Ayuda',
    supportIntro:
        'Tarjeta de comunicacion y acciones cortas para momentos de sobrecarga.',
    quickCard: 'Tarjeta de comunicacion',
    calmMode: 'Modo tranquilo',
    communicationText:
        'Soy una persona autista. Ahora mismo me cuesta hablar o responder. Necesito unos minutos o un lugar tranquilo.',
    trustedContact: 'Contacto de confianza',
    trustedContactBody:
        'Acceso rapido a una persona definida por la cuenta cuando haga falta pedir apoyo.',
    profilesTitle: 'Perfiles',
    profilesIntro:
        'Adultos, tutores, perfiles tutelados, profesionales y entidades verificadas en un solo lugar.',
    adultProfile: 'Adulto o persona identificada',
    adultProfileBody:
        'Seudonimo publico editable, favoritos, comentarios, imagenes e informes con la misma cuenta web y movil.',
    childProfile: 'Perfil tutelado',
    childProfileBody:
        'El tutor crea el perfil infantil sin email propio y revisa las aportaciones antes de enviarlas.',
    tutorReview: 'Revision del tutor',
    sensoryProfile: 'Perfil sensorial',
    sensoryProfileBody:
        'Preferencias de ruido, luz, afluencia, temperatura y espera sin pedir diagnostico.',
    editProfile: 'Editar perfil',
    editPreferences: 'Editar preferencias',
    verifiedProfessionals: 'Profesionales verificados',
    sampleProfessional: 'Dra. Marta Soler',
    sampleProfessionalSpecialty: 'Autismo adulto y apoyo familiar',
    sampleOrganization: 'Asociacion Autismo Abierto',
    sampleOrganizationSpecialty:
        'Centro y asociacion de apoyo a personas autistas y familias',
    profileSummary:
        'Perfiles tutelados dentro de la cuenta principal y verificados accesibles desde Perfiles.',
    contact: 'Contactar',
  ),
  LocaleOption.en: AppLabels(
    appName: 'Spectrum Access',
    home: 'Home',
    consultation: 'Consult',
    contributions: 'Contributions',
    support: 'Help',
    profiles: 'Profiles',
    homeTitle: 'Your Spectrum Access space',
    homeIntro:
        'Review places, prepare contributions calmly and reach help, profiles and verification shortcuts fast.',
    sessionStatus: 'Protected session',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    quickActions: 'Quick actions',
    nearbyMap: 'Nearby map',
    draftContribution: 'Pending contribution',
    tutoredProfiles: 'Tutored profiles',
    profilesAndVerified: 'Profiles and verified',
    openConsultation: 'Open consult',
    openContribution: 'Share experience',
    openHelp: 'Open help',
    openProfiles: 'Manage profiles',
    search: 'Search places, city or category',
    filters: ['Low noise', 'Soft light', 'Clear exit'],
    consultationTitle: 'Consult',
    consultationIntro:
        'Nearby map, search, filters and place details for review before going.',
    contributionsTitle: 'Contributions',
    contributionsIntro:
        'Prepare images, comments and sensory ratings when you feel calm.',
    uploadImage: 'Upload image',
    uploadHint: 'JPG or PNG. It will stay pending moderation.',
    addComment: 'Add comment',
    commentPlaceholder: 'Share details that could help other people...',
    submitReview: 'Submit review',
    pendingModeration: 'Pending moderation',
    sensoryRatings: 'Sensory ratings',
    anonymous: 'Post anonymously',
    supportTitle: 'Help',
    supportIntro: 'Communication card and short actions for overload moments.',
    quickCard: 'Communication card',
    calmMode: 'Calm mode',
    communicationText:
        'I am an autistic person. Right now it is hard for me to speak or answer. I need a few minutes or a quiet place.',
    trustedContact: 'Trusted contact',
    trustedContactBody:
        'Quick access to a person defined by the account when support is needed.',
    profilesTitle: 'Profiles',
    profilesIntro:
        'Adults, tutors, tutored profiles, professionals and verified organizations in one place.',
    adultProfile: 'Adult or identified person',
    adultProfileBody:
        'Editable public nickname, favorites, comments, images and reports with the same web and mobile account.',
    childProfile: 'Tutored profile',
    childProfileBody:
        'The tutor creates the child profile without its own email and reviews contributions before sending.',
    tutorReview: 'Tutor review',
    sensoryProfile: 'Sensory profile',
    sensoryProfileBody:
        'Noise, light, crowd, temperature and waiting preferences without asking for diagnosis.',
    editProfile: 'Edit profile',
    editPreferences: 'Edit preferences',
    verifiedProfessionals: 'Verified professionals',
    sampleProfessional: 'Dr. Marta Soler',
    sampleProfessionalSpecialty: 'Adult autism and family support',
    sampleOrganization: 'Open Autism Association',
    sampleOrganizationSpecialty:
        'Center and association supporting autistic people and families',
    profileSummary:
        'Tutored profiles inside the main account and verified profiles reachable from Profiles.',
    contact: 'Contact',
  ),
};

class AppColors {
  static const deepTeal = Color(0xFF0D4F54);
  static const teal = Color(0xFF196D71);
  static const tealLight = Color(0xFF8DE4DC);
  static const sage = Color(0xFFD8E7D9);
  static const background = Color(0xFFF3F0E9);
  static const surface = Color(0xFFFFFDF8);
  static const line = Color(0xFFD9D1C4);
  static const muted = Color(0xFF66736B);
  static const text = Color(0xFF17211F);
  static const clay = Color(0xFF9B5139);
  static const clayTint = Color(0xFFF4E2D7);
  static const amber = Color(0xFFC77620);
  static const amberLight = Color(0xFFFFC36A);
  static const darkBackground = Color(0xFF111816);
  static const darkSurface = Color(0xFF1E2A27);
  static const darkPanel = Color(0xFF17211F);
  static const darkLine = Color(0xFF34443E);
  static const darkText = Color(0xFFEEF6F1);
  static const darkMuted = Color(0xFFAAB8B0);
  static const darkMap = Color(0xFF25322E);

  static Color lineFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkLine : line;
  static Color mutedFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? darkMuted : muted;
  static Color tealFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? tealLight : deepTeal;
  static Color tealTintFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
      ? const Color(0xFF183633)
      : const Color(0xFFE7F1ED);
  static Color tealSoftFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
      ? const Color(0xFF315C58)
      : const Color(0xFFB9D4D0);
  static Color clayFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
      ? const Color(0xFFE79B75)
      : clay;
  static Color clayTintFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
      ? const Color(0xFF3E2B25)
      : clayTint;
  static Color amberFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark ? amberLight : amber;
}
