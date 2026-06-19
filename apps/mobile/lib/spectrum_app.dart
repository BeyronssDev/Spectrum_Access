import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import 'spectrum_content.dart';
import 'spectrum_theme.dart';

const googleMapsEnabled = bool.fromEnvironment('SPECTRUM_GOOGLE_MAPS_ENABLED');

class SpectrumAccessApp extends StatefulWidget {
  const SpectrumAccessApp({super.key});

  @override
  State<SpectrumAccessApp> createState() => _SpectrumAccessAppState();
}

class _SpectrumAccessAppState extends State<SpectrumAccessApp> {
  ThemeMode _themeMode = ThemeMode.light;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Spectrum Access',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: buildSpectrumTheme(Brightness.light),
      darkTheme: buildSpectrumTheme(Brightness.dark),
      home: SpectrumShell(
        themeMode: _themeMode,
        onThemeModeChanged: (themeMode) =>
            setState(() => _themeMode = themeMode),
      ),
    );
  }
}

class SpectrumShell extends StatefulWidget {
  const SpectrumShell({
    required this.themeMode,
    required this.onThemeModeChanged,
    super.key,
  });

  final ThemeMode themeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  State<SpectrumShell> createState() => _SpectrumShellState();
}

class _SpectrumShellState extends State<SpectrumShell> {
  bool _showHome = true;
  bool _focusMode = false;
  bool _anonymous = false;
  int _selectedPlace = 0;
  int _selectedFilter = 0;
  LocaleOption _locale = LocaleOption.ca;
  MobileTab _selectedTab = MobileTab.consult;
  final TextEditingController _notesController = TextEditingController();
  final Map<SensoryKey, double> _ratings = {
    SensoryKey.noise: 2,
    SensoryKey.density: 2,
    SensoryKey.light: 2,
    SensoryKey.wait: 1,
  };

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

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
    final labels = appCopies[_locale]!;
    final isDark = widget.themeMode == ThemeMode.dark;
    final selectedPlace = samplePlaces[_selectedPlace];

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: _openHome,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const BrandLogo(size: 38),
              const SizedBox(width: 12),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      labels.appName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(
                        context,
                      ).textTheme.titleLarge?.copyWith(fontSize: 22),
                    ),
                    Text(
                      labels.subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            tooltip: _focusMode ? labels.focusActive : labels.focusMode,
            onPressed: () => setState(() => _focusMode = !_focusMode),
            icon: Icon(
              _focusMode
                  ? Icons.filter_center_focus
                  : Icons.auto_awesome_outlined,
            ),
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
          PopupMenuButton<LocaleOption>(
            tooltip: 'Idioma',
            initialValue: _locale,
            icon: Text(
              _locale.label,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
            onSelected: (locale) => setState(() => _locale = locale),
            itemBuilder: (context) => LocaleOption.values
                .map(
                  (locale) =>
                      PopupMenuItem(value: locale, child: Text(locale.label)),
                )
                .toList(),
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
                  focusMode: _focusMode,
                  selectedPlace: selectedPlace,
                  onOpenTab: _openTab,
                  onOpenPlace: (index) => setState(() {
                    _selectedPlace = index;
                    _selectedTab = MobileTab.consult;
                    _showHome = false;
                  }),
                )
              : _screenForTab(labels, selectedPlace),
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        labels: labels,
        selectedTab: _showHome ? null : _selectedTab,
        onSelected: _openTab,
      ),
    );
  }

  Widget _screenForTab(AppCopy labels, PlaceSummary selectedPlace) {
    switch (_selectedTab) {
      case MobileTab.consult:
        return ConsultScreen(
          key: const ValueKey('consult'),
          labels: labels,
          selectedPlace: _selectedPlace,
          selectedFilter: _selectedFilter,
          onFilterChanged: (index) => setState(() => _selectedFilter = index),
          onPlaceChanged: (index) => setState(() => _selectedPlace = index),
          onContribute: () => _openTab(MobileTab.contribute),
        );
      case MobileTab.contribute:
        return ReportScreen(
          key: const ValueKey('contribute'),
          labels: labels,
          locale: _locale,
          place: selectedPlace,
          ratings: _ratings,
          notesController: _notesController,
          anonymous: _anonymous,
          onAnonymousChanged: (value) => setState(() => _anonymous = value),
          onRatingChanged: (key, value) =>
              setState(() => _ratings[key] = value),
        );
      case MobileTab.support:
        return HelpScreen(
          key: const ValueKey('support'),
          labels: labels,
          focusMode: _focusMode,
          onEnableFocus: () => setState(() => _focusMode = true),
        );
      case MobileTab.profiles:
        return ProfilesScreen(key: const ValueKey('profiles'), labels: labels);
    }
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    required this.labels,
    required this.focusMode,
    required this.selectedPlace,
    required this.onOpenTab,
    required this.onOpenPlace,
    super.key,
  });

  final AppCopy labels;
  final bool focusMode;
  final PlaceSummary selectedPlace;
  final ValueChanged<MobileTab> onOpenTab;
  final ValueChanged<int> onOpenPlace;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      children: [
        if (focusMode) ...[
          FocusBanner(labels: labels),
          const SizedBox(height: 18),
        ],
        Text(labels.greeting, style: Theme.of(context).textTheme.displayLarge),
        const SizedBox(height: 14),
        Text(
          labels.homeIntro,
          style: TextStyle(
            color: mutedColor(context),
            fontSize: 17,
            height: 1.55,
          ),
        ),
        const SizedBox(height: 24),
        SensoryMapPanel(
          title: labels.nearbyMap,
          subtitle: 'Barcelona',
          selectedPlace: selectedPlace,
          onOpen: () => onOpenTab(MobileTab.consult),
          onPlaceSelected: onOpenPlace,
        ),
        const SizedBox(height: 18),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeading(title: labels.savedPlaces, action: labels.viewAll),
              const SizedBox(height: 10),
              for (final entry in samplePlaces.indexed)
                SavedPlaceRow(
                  place: entry.$2,
                  onTap: () => onOpenPlace(entry.$1),
                ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeading(
                title: labels.pendingDraft,
                action: labels.continueDraft,
              ),
              const SizedBox(height: 12),
              DraftPreview(labels: labels),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeading(
                title: labels.verifiedProfessionals,
                action: labels.viewAll,
              ),
              const SizedBox(height: 12),
              for (final profile in sampleVerifiedProfiles)
                VerifiedRow(profile: profile, labels: labels),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SpectrumPanel(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      labels.helpCard,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      labels.helpIntro,
                      style: TextStyle(
                        color: mutedColor(context),
                        height: 1.45,
                      ),
                    ),
                  ],
                ),
              ),
              FilledButton(
                onPressed: () => onOpenTab(MobileTab.support),
                child: Text(labels.openHelpCard),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class ConsultScreen extends StatelessWidget {
  const ConsultScreen({
    required this.labels,
    required this.selectedPlace,
    required this.selectedFilter,
    required this.onFilterChanged,
    required this.onPlaceChanged,
    required this.onContribute,
    super.key,
  });

  final AppCopy labels;
  final int selectedPlace;
  final int selectedFilter;
  final ValueChanged<int> onFilterChanged;
  final ValueChanged<int> onPlaceChanged;
  final VoidCallback onContribute;

  @override
  Widget build(BuildContext context) {
    final place = samplePlaces[selectedPlace];
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      children: [
        Text(labels.consult, style: Theme.of(context).textTheme.displayLarge),
        const SizedBox(height: 18),
        SearchBar(
          leading: const Icon(Icons.search),
          hintText: labels.search,
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
        ),
        const SizedBox(height: 14),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: labels.filters.indexed
              .map(
                (entry) => ChoiceChip(
                  selected: selectedFilter == entry.$1,
                  label: Text(entry.$2),
                  onSelected: (_) => onFilterChanged(entry.$1),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 18),
        SensoryMapPanel(
          title: labels.nearbyMap,
          subtitle: 'Barcelona',
          selectedPlace: place,
          onPlaceSelected: onPlaceChanged,
        ),
        const SizedBox(height: 18),
        PlaceDetailsCard(
          labels: labels,
          place: place,
          onContribute: onContribute,
        ),
        const SizedBox(height: 18),
        for (final entry in samplePlaces.indexed)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: SavedPlaceRow(
              place: entry.$2,
              selected: selectedPlace == entry.$1,
              onTap: () => onPlaceChanged(entry.$1),
            ),
          ),
      ],
    );
  }
}

class ReportScreen extends StatelessWidget {
  const ReportScreen({
    required this.labels,
    required this.locale,
    required this.place,
    required this.ratings,
    required this.notesController,
    required this.anonymous,
    required this.onAnonymousChanged,
    required this.onRatingChanged,
    super.key,
  });

  final AppCopy labels;
  final LocaleOption locale;
  final PlaceSummary place;
  final Map<SensoryKey, double> ratings;
  final TextEditingController notesController;
  final bool anonymous;
  final ValueChanged<bool> onAnonymousChanged;
  final void Function(SensoryKey key, double value) onRatingChanged;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      children: [
        Text(
          labels.sensoryReport,
          style: Theme.of(context).textTheme.displayLarge,
        ),
        const SizedBox(height: 12),
        Text(
          labels.reportIntro,
          style: TextStyle(
            color: mutedColor(context),
            fontSize: 16,
            height: 1.55,
          ),
        ),
        const SizedBox(height: 22),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              PlaceContext(place: place, labels: labels),
              const SizedBox(height: 18),
              InlineUploadBox(labels: labels),
              const SizedBox(height: 28),
              for (final key in SensoryKey.values)
                SensoryControl(
                  label: sensoryLabel(locale, key),
                  word: sensoryWord(locale, key, ratings[key]!.round()),
                  value: ratings[key]!,
                  onChanged: (value) => onRatingChanged(key, value),
                ),
              const SizedBox(height: 18),
              Text(labels.notes, style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 10),
              TextField(
                controller: notesController,
                minLines: 5,
                maxLines: 8,
                decoration: InputDecoration(hintText: labels.notesHint),
              ),
              const SizedBox(height: 16),
              CheckboxListTile(
                value: anonymous,
                onChanged: (value) => onAnonymousChanged(value ?? false),
                controlAffinity: ListTileControlAffinity.leading,
                contentPadding: EdgeInsets.zero,
                title: Text(labels.anonymous),
              ),
              FilledButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.send_outlined),
                label: Text(labels.submit),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class HelpScreen extends StatelessWidget {
  const HelpScreen({
    required this.labels,
    required this.focusMode,
    required this.onEnableFocus,
    super.key,
  });

  final AppCopy labels;
  final bool focusMode;
  final VoidCallback onEnableFocus;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      children: [
        Text(labels.helpTitle, style: Theme.of(context).textTheme.displayLarge),
        const SizedBox(height: 12),
        Text(
          labels.helpIntro,
          style: TextStyle(
            color: mutedColor(context),
            fontSize: 16,
            height: 1.55,
          ),
        ),
        const SizedBox(height: 22),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.volunteer_activism_outlined,
                color: SpectrumColors.tertiary,
              ),
              const SizedBox(height: 16),
              Text(
                labels.helpCard,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 18),
              DecoratedBox(
                decoration: BoxDecoration(
                  color: softPanelColor(context),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    labels.communicationMessage,
                    style: Theme.of(
                      context,
                    ).textTheme.headlineMedium?.copyWith(height: 1.38),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              FilledButton(onPressed: () {}, child: Text(labels.openHelpCard)),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.auto_awesome_outlined, color: SpectrumColors.tertiary),
              const SizedBox(height: 12),
              Text(
                labels.focusMode,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                labels.focusBody,
                style: TextStyle(color: mutedColor(context), height: 1.45),
              ),
              const SizedBox(height: 14),
              OutlinedButton(
                onPressed: focusMode ? null : onEnableFocus,
                child: Text(focusMode ? labels.focusActive : labels.focusMode),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SpectrumPanel(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.phone_outlined),
            title: Text(labels.trustedContact),
            subtitle: const Text('Tutor principal · Josep B.'),
            trailing: TextButton(onPressed: () {}, child: Text(labels.contact)),
          ),
        ),
      ],
    );
  }
}

class ProfilesScreen extends StatelessWidget {
  const ProfilesScreen({required this.labels, super.key});

  final AppCopy labels;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      children: [
        Text(
          labels.profilesTitle,
          style: Theme.of(context).textTheme.displayLarge,
        ),
        const SizedBox(height: 12),
        Text(
          labels.profilesIntro,
          style: TextStyle(
            color: mutedColor(context),
            fontSize: 16,
            height: 1.55,
          ),
        ),
        const SizedBox(height: 22),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeading(
                title: labels.verifiedProfessionals,
                action: labels.viewAll,
              ),
              const SizedBox(height: 10),
              for (final profile in sampleVerifiedProfiles)
                VerifiedRow(profile: profile, labels: labels),
            ],
          ),
        ),
        const SizedBox(height: 14),
        ProfilePanel(
          icon: Icons.person_outline,
          title: labels.adultProfile,
          body: 'Pseudònim públic editable, favorits, comentaris i imatges.',
        ),
        const SizedBox(height: 14),
        ProfilePanel(
          icon: Icons.supervisor_account_outlined,
          title: labels.tutorProfile,
          body:
              'Compte principal que revisa aportacions dels perfils infantils.',
        ),
        const SizedBox(height: 14),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeading(title: labels.childProfile),
              const SizedBox(height: 10),
              for (final child in sampleChildProfiles)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: ChildProfileTile(profile: child),
                ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        ProfilePanel(
          icon: Icons.tune_outlined,
          title: labels.sensoryProfile,
          body: 'Preferències de soroll, llum, afluència i temps d’espera.',
        ),
      ],
    );
  }
}

class BottomNavigation extends StatelessWidget {
  const BottomNavigation({
    required this.labels,
    required this.selectedTab,
    required this.onSelected,
    super.key,
  });

  final AppCopy labels;
  final MobileTab? selectedTab;
  final ValueChanged<MobileTab> onSelected;

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItem(MobileTab.consult, Icons.map_outlined, labels.consult),
      _NavItem(
        MobileTab.contribute,
        Icons.add_circle_outline,
        labels.contribute,
      ),
      _NavItem(MobileTab.support, Icons.help_outline, labels.support),
      _NavItem(MobileTab.profiles, Icons.groups_outlined, labels.profiles),
    ];

    return DecoratedBox(
      decoration: BoxDecoration(
        color: panelColor(context),
        border: Border(
          top: BorderSide(
            color: Theme.of(context).brightness == Brightness.dark
                ? SpectrumColors.outline
                : SpectrumColors.surfaceContainerHigh,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
          child: Row(
            children: items
                .map(
                  (item) => Expanded(
                    child: _BottomNavigationButton(
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

class _BottomNavigationButton extends StatelessWidget {
  const _BottomNavigationButton({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? SpectrumColors.primary : mutedColor(context);
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(item.icon, color: color),
            const SizedBox(height: 4),
            Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SensoryMapPanel extends StatelessWidget {
  const SensoryMapPanel({
    required this.title,
    required this.subtitle,
    required this.selectedPlace,
    required this.onPlaceSelected,
    this.onOpen,
    super.key,
  });

  final String title;
  final String subtitle;
  final PlaceSummary selectedPlace;
  final ValueChanged<int> onPlaceSelected;
  final VoidCallback? onOpen;

  @override
  Widget build(BuildContext context) {
    return SpectrumPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 4),
                    Text(
                      subtitle.toUpperCase(),
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.tune_outlined),
              ),
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.my_location_outlined),
              ),
            ],
          ),
          const SizedBox(height: 18),
          SizedBox(
            height: 310,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: softPanelColor(context),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Stack(
                children: [
                  if (googleMapsEnabled)
                    _GoogleMapLayer(
                      selectedPlace: selectedPlace,
                      onPlaceSelected: onPlaceSelected,
                    )
                  else
                    _FallbackMapLayer(
                      selectedPlace: selectedPlace,
                      onPlaceSelected: onPlaceSelected,
                    ),
                  Positioned(
                    left: 14,
                    top: 14,
                    child: _MapProviderBadge(
                      label: googleMapsEnabled ? 'Google Maps' : 'Fallback map',
                    ),
                  ),
                  Positioned(
                    left: 18,
                    right: 18,
                    bottom: 18,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: panelColor(context).withValues(alpha: 0.92),
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 18,
                          vertical: 14,
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.circle,
                              size: 10,
                              color: SpectrumColors.tertiary,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                selectedPlace.area,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            Text(
                              selectedPlace.quietDb,
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (onOpen != null) ...[
            const SizedBox(height: 10),
            TextButton.icon(
              onPressed: onOpen,
              icon: const Icon(Icons.arrow_forward),
              label: const Text('Obrir mapa complet'),
            ),
          ],
        ],
      ),
    );
  }
}

class _GoogleMapLayer extends StatelessWidget {
  const _GoogleMapLayer({
    required this.selectedPlace,
    required this.onPlaceSelected,
  });

  final PlaceSummary selectedPlace;
  final ValueChanged<int> onPlaceSelected;

  @override
  Widget build(BuildContext context) {
    final selectedIndex = samplePlaces.indexOf(selectedPlace);
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: LatLng(selectedPlace.latitude, selectedPlace.longitude),
          zoom: 13,
        ),
        markers: {
          for (final entry in samplePlaces.indexed)
            Marker(
              markerId: MarkerId(entry.$2.name),
              position: LatLng(entry.$2.latitude, entry.$2.longitude),
              onTap: () => onPlaceSelected(entry.$1),
              icon: BitmapDescriptor.defaultMarkerWithHue(
                entry.$1 == selectedIndex
                    ? BitmapDescriptor.hueYellow
                    : BitmapDescriptor.hueAzure,
              ),
            ),
        },
        compassEnabled: false,
        mapToolbarEnabled: false,
        myLocationButtonEnabled: false,
        zoomControlsEnabled: false,
      ),
    );
  }
}

class _FallbackMapLayer extends StatelessWidget {
  const _FallbackMapLayer({
    required this.selectedPlace,
    required this.onPlaceSelected,
  });

  final PlaceSummary selectedPlace;
  final ValueChanged<int> onPlaceSelected;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: CustomPaint(
            painter: PremiumMapPainter(
              isDark: Theme.of(context).brightness == Brightness.dark,
            ),
          ),
        ),
        _MapPin(
          left: .38,
          top: .45,
          active: selectedPlace == samplePlaces[0],
          onTap: () => onPlaceSelected(0),
        ),
        _MapPin(
          left: .59,
          top: .28,
          active: selectedPlace == samplePlaces[1],
          onTap: () => onPlaceSelected(1),
        ),
        _MapPin(
          left: .68,
          top: .64,
          active: selectedPlace == samplePlaces[2],
          onTap: () => onPlaceSelected(2),
        ),
      ],
    );
  }
}

class _MapProviderBadge extends StatelessWidget {
  const _MapProviderBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: panelColor(context).withValues(alpha: 0.86),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
        child: Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelLarge,
        ),
      ),
    );
  }
}

class SavedPlaceRow extends StatelessWidget {
  const SavedPlaceRow({
    required this.place,
    required this.onTap,
    this.selected = false,
    super.key,
  });

  final PlaceSummary place;
  final VoidCallback onTap;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? softPanelColor(context) : Colors.transparent,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            children: [
              const PlaceIcon(),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place.name,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${place.area} · ${place.distance}',
                      style: TextStyle(
                        color: mutedColor(context),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              ScoreBadge(value: place.score),
            ],
          ),
        ),
      ),
    );
  }
}

class DraftPreview extends StatelessWidget {
  const DraftPreview({required this.labels, super.key});

  final AppCopy labels;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const PlaceIcon(size: 74),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Esbeteria Mar Blau',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 6),
              Text(
                'Avinguda del Mar, 25 · Barcelona',
                style: TextStyle(color: mutedColor(context)),
              ),
              const SizedBox(height: 10),
              Text(
                labels.tutorReview,
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class PlaceDetailsCard extends StatelessWidget {
  const PlaceDetailsCard({
    required this.labels,
    required this.place,
    required this.onContribute,
    super.key,
  });

  final AppCopy labels;
  final PlaceSummary place;
  final VoidCallback onContribute;

  @override
  Widget build(BuildContext context) {
    return SpectrumPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PlaceIcon(size: 74),
          const SizedBox(height: 14),
          Text(place.name, style: Theme.of(context).textTheme.headlineLarge),
          const SizedBox(height: 8),
          Text(
            '${place.area} · ${place.city}',
            style: TextStyle(color: mutedColor(context)),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Text(
                place.score.toStringAsFixed(1),
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(width: 8),
              const Icon(Icons.star, color: SpectrumColors.tertiary),
            ],
          ),
          const SizedBox(height: 12),
          Text(place.description, style: const TextStyle(height: 1.45)),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  child: Text(labels.save),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  child: Text(labels.report),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          FilledButton.icon(
            onPressed: onContribute,
            icon: const Icon(Icons.add),
            label: Text(labels.contribute),
          ),
        ],
      ),
    );
  }
}

class PlaceContext extends StatelessWidget {
  const PlaceContext({required this.place, required this.labels, super.key});

  final PlaceSummary place;
  final AppCopy labels;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const PlaceIcon(),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                place.name,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              Text(
                '${place.area} · ${place.quietDb}',
                style: TextStyle(color: mutedColor(context)),
              ),
            ],
          ),
        ),
        Text(
          labels.pendingModeration,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

class InlineUploadBox extends StatelessWidget {
  const InlineUploadBox({required this.labels, super.key});

  final AppCopy labels;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: softPanelColor(context),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(
              Icons.add_photo_alternate_outlined,
              color: SpectrumColors.tertiary,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    labels.uploadImages,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${labels.pendingModeration}. ${labels.tutorReview}.',
                    style: TextStyle(color: mutedColor(context), fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SensoryControl extends StatelessWidget {
  const SensoryControl({
    required this.label,
    required this.word,
    required this.value,
    required this.onChanged,
    super.key,
  });

  final String label;
  final String word;
  final double value;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  label.toUpperCase(),
                  style: Theme.of(context).textTheme.labelLarge,
                ),
              ),
              Text(
                word,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: SpectrumColors.tertiary,
                ),
              ),
            ],
          ),
          Slider(
            value: value,
            min: 1,
            max: 5,
            divisions: 4,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class VerifiedRow extends StatelessWidget {
  const VerifiedRow({required this.profile, required this.labels, super.key});

  final VerifiedProfile profile;
  final AppCopy labels;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          CircleAvatar(
            radius: 25,
            backgroundColor: softPanelColor(context),
            child: Text(
              profile.initials,
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile.name,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 3),
                Text(
                  profile.identifier,
                  style: TextStyle(color: mutedColor(context), fontSize: 12),
                ),
              ],
            ),
          ),
          DecoratedBox(
            decoration: BoxDecoration(
              color: softPanelColor(context),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              child: Row(
                children: [
                  const Icon(
                    Icons.verified_outlined,
                    size: 15,
                    color: SpectrumColors.tertiary,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    labels.verified,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ProfilePanel extends StatelessWidget {
  const ProfilePanel({
    required this.icon,
    required this.title,
    required this.body,
    super.key,
  });

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return SpectrumPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: SpectrumColors.tertiary),
          const SizedBox(height: 12),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(
            body,
            style: TextStyle(color: mutedColor(context), height: 1.45),
          ),
        ],
      ),
    );
  }
}

class ChildProfileTile extends StatelessWidget {
  const ChildProfileTile({required this.profile, super.key});

  final ChildProfile profile;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: softPanelColor(context),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CircleAvatar(child: Text(profile.alias.substring(0, 1))),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile.alias,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  Text(
                    '${profile.age} anys · ${profile.state}',
                    style: TextStyle(color: mutedColor(context), fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class FocusBanner extends StatelessWidget {
  const FocusBanner({required this.labels, super.key});

  final AppCopy labels;

  @override
  Widget build(BuildContext context) {
    return SpectrumPanel(
      padding: const EdgeInsets.all(18),
      child: Row(
        children: [
          const Icon(Icons.filter_center_focus, color: SpectrumColors.tertiary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              '${labels.focusActive}. ${labels.focusBody}',
              style: const TextStyle(fontWeight: FontWeight.w700, height: 1.35),
            ),
          ),
        ],
      ),
    );
  }
}

class PlaceIcon extends StatelessWidget {
  const PlaceIcon({this.size = 54, super.key});

  final double size;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            SpectrumColors.primaryContainer,
            Theme.of(context).brightness == Brightness.dark
                ? SpectrumColors.darkContainer
                : SpectrumColors.surfaceContainerHighest,
          ],
        ),
        borderRadius: BorderRadius.circular(size > 60 ? 24 : 18),
      ),
      child: SizedBox(
        width: size,
        height: size,
        child: const Icon(
          Icons.place_outlined,
          color: SpectrumColors.darkOnSurface,
        ),
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
        color: softPanelColor(context),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        child: Text(
          value.toStringAsFixed(1),
          style: const TextStyle(
            color: SpectrumColors.tertiary,
            fontWeight: FontWeight.w900,
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
    required this.active,
    required this.onTap,
  });

  final double left;
  final double top;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: FractionallySizedBox(
        alignment: Alignment(left * 2 - 1, top * 2 - 1),
        widthFactor: active ? 0.12 : 0.08,
        heightFactor: active ? 0.12 : 0.08,
        child: IconButton.filled(
          style: IconButton.styleFrom(
            backgroundColor: active
                ? SpectrumColors.tertiaryContainer
                : SpectrumColors.secondary,
            foregroundColor: SpectrumColors.onPrimary,
          ),
          onPressed: onTap,
          icon: const Icon(Icons.circle, size: 12),
        ),
      ),
    );
  }
}

class PremiumMapPainter extends CustomPainter {
  const PremiumMapPainter({required this.isDark});

  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final regionPaint = Paint()
      ..color = isDark
          ? SpectrumColors.primaryContainer.withValues(alpha: 0.58)
          : SpectrumColors.surfaceContainerLowest.withValues(alpha: 0.62);
    final roadPaint = Paint()
      ..color = SpectrumColors.outlineVariant.withValues(
        alpha: isDark ? 0.26 : 0.42,
      )
      ..strokeWidth = 18
      ..strokeCap = StrokeCap.round;
    final waterPaint = Paint()
      ..color = SpectrumColors.secondary.withValues(
        alpha: isDark ? 0.18 : 0.12,
      );

    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(
          size.width * .09,
          size.height * .16,
          size.width * .3,
          size.height * .55,
        ),
        const Radius.circular(24),
      ),
      regionPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(
          size.width * .47,
          size.height * .09,
          size.width * .22,
          size.height * .42,
        ),
        const Radius.circular(24),
      ),
      regionPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(
          size.width * .58,
          size.height * .62,
          size.width * .32,
          size.height * .28,
        ),
        const Radius.circular(24),
      ),
      regionPaint,
    );
    canvas.drawLine(
      Offset(size.width * -.1, size.height * .55),
      Offset(size.width * 1.1, size.height * .55),
      roadPaint,
    );
    canvas.drawLine(
      Offset(size.width * .47, size.height * -.1),
      Offset(size.width * .42, size.height * 1.1),
      roadPaint,
    );
    canvas.drawLine(
      Offset(size.width * .2, size.height * .68),
      Offset(size.width * 1.08, size.height * .43),
      roadPaint,
    );
    canvas.drawOval(
      Rect.fromLTWH(
        size.width * .76,
        size.height * .72,
        size.width * .4,
        size.height * .3,
      ),
      waterPaint,
    );
  }

  @override
  bool shouldRepaint(covariant PremiumMapPainter oldDelegate) =>
      oldDelegate.isDark != isDark;
}

class _NavItem {
  const _NavItem(this.tab, this.icon, this.label);

  final MobileTab tab;
  final IconData icon;
  final String label;
}
