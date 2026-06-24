import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import 'firebase_services.dart';
import 'mobile_google_maps.dart';
import 'mobile_image_upload.dart';
import 'mobile_state.dart';
import 'place_helpers.dart';
import 'spectrum_application_service.dart';
import 'spectrum_content.dart';
import 'spectrum_theme.dart';

class SpectrumShell extends StatefulWidget {
  const SpectrumShell({
    required this.firebaseInitialization,
    required this.themeMode,
    required this.onThemeModeChanged,
    this.createApplicationService,
    super.key,
  });

  final Future<void>? firebaseInitialization;
  final ThemeMode themeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;
  final SpectrumApplicationService Function()? createApplicationService;

  @override
  State<SpectrumShell> createState() => _SpectrumShellState();
}

class _SpectrumShellState extends State<SpectrumShell> {
  bool _showHome = true;
  bool _focusMode = false;
  bool _googleMapsAvailable = false;
  bool _firebaseReady = false;
  bool _authUnavailable = true;
  bool _authSubmitting = false;
  bool _profileSubmitting = false;
  bool _professionalSubmitting = false;
  bool _placesLoading = false;
  int _selectedPlace = 0;
  int? _selectedFilter;
  LocationStatus _locationStatus = LocationStatus.idle;
  DeviceLocation? _deviceLocation;
  LocaleOption _locale = LocaleOption.ca;
  MobileTab _selectedTab = MobileTab.consult;
  SpectrumApplicationService? _applicationService;
  StreamSubscription<SpectrumAuthUser?>? _authSubscription;
  SpectrumAuthUser? _authUser;
  SpectrumUserProfile? _userProfile;
  List<PlaceSummary> _places = const [];
  final List<VerifiedProfile> _verifiedProfiles = const [];
  final List<ChildProfile> _childProfiles = const [];
  final PlaceImagePicker _imagePicker = PlaceImagePicker();
  final List<PreparedPlaceImage> _selectedImages = [];
  final TextEditingController _authEmailController = TextEditingController();
  final TextEditingController _authPasswordController = TextEditingController();
  final TextEditingController _authPasswordRepeatController =
      TextEditingController();
  final TextEditingController _authPublicNameController =
      TextEditingController();
  final TextEditingController _authCityController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _childAliasController = TextEditingController();
  final TextEditingController _professionalNameController =
      TextEditingController();
  final TextEditingController _licenseNumberController =
      TextEditingController();
  final TextEditingController _professionalCollegeController =
      TextEditingController();
  final TextEditingController _specialtyController = TextEditingController();
  final TextEditingController _placeNameController = TextEditingController();
  final TextEditingController _placeCityController = TextEditingController();
  final TextEditingController _placeAddressController = TextEditingController();
  final TextEditingController _placeDescriptionController =
      TextEditingController();
  bool _showRegister = true;
  RegistrationKind _registrationKind = RegistrationKind.user;
  String? _childAgeRange;
  String? _authMessage;
  String? _profileMessage;
  String? _professionalMessage;
  bool _isSubmittingReport = false;
  String? _reportMessage;
  final Map<SensoryKey, double> _ratings = {
    SensoryKey.noise: 2,
    SensoryKey.density: 2,
    SensoryKey.light: 2,
    SensoryKey.wait: 1,
  };

  @override
  void initState() {
    super.initState();
    _startFirebaseInitialization();
    unawaited(_resolveGoogleMapsAvailability());
    unawaited(_locateDeviceOnLaunch());
    unawaited(_restoreLostImages());
  }

  @override
  void dispose() {
    unawaited(_authSubscription?.cancel());
    _authEmailController.dispose();
    _authPasswordController.dispose();
    _authPasswordRepeatController.dispose();
    _authPublicNameController.dispose();
    _authCityController.dispose();
    _notesController.dispose();
    _childAliasController.dispose();
    _professionalNameController.dispose();
    _licenseNumberController.dispose();
    _professionalCollegeController.dispose();
    _specialtyController.dispose();
    _placeNameController.dispose();
    _placeCityController.dispose();
    _placeAddressController.dispose();
    _placeDescriptionController.dispose();
    super.dispose();
  }

  SpectrumApplicationService _service() {
    return _applicationService ??=
        widget.createApplicationService?.call() ?? SpectrumFirebaseServices();
  }

  void _listenToAuth() {
    try {
      final service = _service();
      _authSubscription = service.authStateChanges.listen((user) {
        if (!mounted) {
          return;
        }
        setState(() {
          _authUser = user;
          _authUnavailable = false;
        });
        if (user != null) {
          unawaited(_loadUserProfile());
        } else {
          setStateIfMounted(() => _userProfile = null);
        }
      });
    } catch (_) {
      setState(() {
        _authUnavailable = true;
      });
    }
  }

  void _startFirebaseInitialization() {
    final initialization = widget.firebaseInitialization;
    if (initialization == null) {
      return;
    }

    unawaited(
      initialization
          .then((_) {
            if (!mounted) {
              return;
            }
            setState(() {
              _firebaseReady = true;
              _authUnavailable = false;
            });
            _listenToAuth();
            unawaited(_loadPlaces());
          })
          .catchError((Object error, StackTrace stackTrace) {
            if (kDebugMode || kProfileMode) {
              debugPrint('Spectrum Firebase initialization error: $error');
              debugPrintStack(stackTrace: stackTrace);
            }
            if (!mounted) {
              return;
            }
            setState(() {
              _firebaseReady = false;
              _authUnavailable = true;
            });
          }),
    );

    unawaited(
      Future<void>.delayed(const Duration(seconds: 8), () {
        if (!mounted || _firebaseReady) {
          return;
        }
        setState(() => _authUnavailable = true);
      }),
    );
  }

  Future<void> _loadUserProfile() async {
    try {
      final profile = await _service().loadCurrentUserProfile();
      setStateIfMounted(() => _userProfile = profile);
    } catch (_) {
      setStateIfMounted(() => _userProfile = null);
    }
  }

  Future<void> _loadPlaces() async {
    if (_placesLoading) {
      return;
    }

    setStateIfMounted(() {
      _placesLoading = true;
    });

    try {
      final places = await _service().loadActivePlaces();
      if (!mounted) {
        return;
      }
      setState(() {
        _places = places;
        _selectedPlace = places.isEmpty
            ? 0
            : _selectedPlace.clamp(0, places.length - 1).toInt();
      });
    } catch (_) {
      // Keep the production UI empty if Firestore cannot be read.
    } finally {
      setStateIfMounted(() => _placesLoading = false);
    }
  }

  void _openTab(MobileTab tab) {
    setState(() {
      _selectedTab = tab;
      _showHome = false;
    });
  }

  void _openAuthScreen({bool showRegister = false}) {
    setState(() {
      _selectedTab = MobileTab.contribute;
      _showHome = false;
      _showRegister = showRegister;
      _authMessage = null;
    });
  }

  void _openHome() {
    setState(() => _showHome = true);
  }

  bool _isValidEmail(String value) {
    return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value.trim());
  }

  Future<void> _runAuthAction(Future<void> Function() action) async {
    if (_authSubmitting) {
      return;
    }

    setState(() {
      _authSubmitting = true;
      _authMessage = null;
    });

    try {
      await action();
      await _loadUserProfile();
    } catch (error, stackTrace) {
      if (kDebugMode) {
        debugPrint('Spectrum auth error: $error');
        debugPrintStack(stackTrace: stackTrace);
      }
      setStateIfMounted(() => _authMessage = _authMessageForError(error));
    } finally {
      setStateIfMounted(() => _authSubmitting = false);
    }
  }

  String _authMessageForError(Object error) {
    final labels = authCopies[_locale]!;
    if (error is FirebaseAuthException) {
      return switch (error.code) {
        'operation-not-allowed' => labels.authProviderDisabled,
        'account-exists-with-different-credential' =>
          labels.authProviderDisabled,
        'invalid-credential' ||
        'invalid-oauth-provider' ||
        'missing-or-invalid-nonce' => labels.authConfigurationError,
        'network-request-failed' => labels.authFailed,
        _ => labels.authFailed,
      };
    }
    if (error is PlatformException) {
      final code = error.code.toLowerCase();
      final message = '${error.message ?? ''} ${error.details ?? ''}'
          .toLowerCase();
      if (code.contains('cancel') || message.contains('cancel')) {
        return labels.authCancelled;
      }
      if (code.contains('config') ||
          code.contains('sign_in_failed') ||
          message.contains('client_id') ||
          message.contains('url scheme') ||
          message.contains('entitlement') ||
          message.contains('configuration')) {
        return labels.authConfigurationError;
      }
    }
    final text = error.toString().toLowerCase();
    if (text.contains('cancel')) {
      return labels.authCancelled;
    }
    if (text.contains('client_id') ||
        text.contains('url scheme') ||
        text.contains('entitlement') ||
        text.contains('configuration')) {
      return labels.authConfigurationError;
    }
    return labels.authFailed;
  }

  Future<void> _registerWithEmail() {
    final labels = authCopies[_locale]!;
    final publicName = _authPublicNameController.text.trim();
    final email = _authEmailController.text.trim();
    final password = _authPasswordController.text;
    final confirmPassword = _authPasswordRepeatController.text;
    final professionalName = _professionalNameController.text.trim();
    final licenseNumber = _licenseNumberController.text.trim();
    final professionalCollege = _professionalCollegeController.text.trim();
    final specialty = _specialtyController.text.trim();
    final isProfessional = _registrationKind == RegistrationKind.professional;

    if (publicName.isEmpty ||
        email.isEmpty ||
        password.isEmpty ||
        confirmPassword.isEmpty) {
      setState(() => _authMessage = labels.requiredFields);
      return Future<void>.value();
    }

    if (!_isValidEmail(email)) {
      setState(() => _authMessage = labels.invalidEmail);
      return Future<void>.value();
    }

    if (password.length < 6) {
      setState(() => _authMessage = labels.passwordMinLength);
      return Future<void>.value();
    }

    if (password != confirmPassword) {
      setState(() => _authMessage = labels.passwordsMismatch);
      return Future<void>.value();
    }

    if (isProfessional &&
        (professionalName.isEmpty ||
            licenseNumber.isEmpty ||
            professionalCollege.isEmpty ||
            specialty.isEmpty)) {
      setState(() => _authMessage = labels.professionalFieldsRequired);
      return Future<void>.value();
    }

    return _runAuthAction(() async {
      final service = _service();
      await service.registerWithEmail(
        email: email,
        password: password,
        publicName: publicName,
        city: _authCityController.text.trim(),
        locale: _locale.name,
      );
      if (isProfessional) {
        await service.requestProfessionalVerification(
          professionalName: professionalName,
          licenseNumber: licenseNumber,
          professionalCollege: professionalCollege,
          specialty: specialty,
        );
        setStateIfMounted(
          () => _authMessage = labels.professionalRegistrationSent,
        );
      } else {
        setStateIfMounted(() => _authMessage = labels.verificationSent);
      }
    });
  }

  Future<void> _signInWithEmail() {
    final labels = authCopies[_locale]!;
    final email = _authEmailController.text.trim();
    final password = _authPasswordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _authMessage = labels.requiredFields);
      return Future<void>.value();
    }

    if (!_isValidEmail(email)) {
      setState(() => _authMessage = labels.invalidEmail);
      return Future<void>.value();
    }

    return _runAuthAction(() async {
      await _service().signInWithEmail(
        email: email,
        password: password,
        locale: _locale.name,
      );
    });
  }

  Future<void> _signInWithGoogle() {
    return _runAuthAction(() async {
      await _service().signInWithGoogle(locale: _locale.name);
    });
  }

  Future<void> _signInWithApple() {
    return _runAuthAction(() async {
      await _service().signInWithApple(locale: _locale.name);
    });
  }

  Future<void> _signOut() async {
    try {
      await _service().signOut();
    } finally {
      setStateIfMounted(() {
        _authUser = null;
        _userProfile = null;
        _showHome = true;
      });
    }
  }

  Future<void> _createChildProfile() async {
    if (_profileSubmitting) {
      return;
    }

    setState(() {
      _profileSubmitting = true;
      _profileMessage = null;
    });

    try {
      await _service().createChildProfile(
        alias: _childAliasController.text.trim(),
        ageRange: _childAgeRange,
        sensoryPreferences: const {},
      );
      _childAliasController.clear();
      setStateIfMounted(() {
        _childAgeRange = null;
        _profileMessage = authCopies[_locale]!.childCreated;
      });
      await _loadUserProfile();
    } catch (_) {
      setStateIfMounted(
        () => _profileMessage = authCopies[_locale]!.authFailed,
      );
    } finally {
      setStateIfMounted(() => _profileSubmitting = false);
    }
  }

  Future<void> _requestProfessionalVerification() async {
    if (_professionalSubmitting) {
      return;
    }

    final labels = authCopies[_locale]!;
    final professionalName = _professionalNameController.text.trim();
    final licenseNumber = _licenseNumberController.text.trim();
    final professionalCollege = _professionalCollegeController.text.trim();
    final specialty = _specialtyController.text.trim();

    if (professionalName.isEmpty ||
        licenseNumber.isEmpty ||
        professionalCollege.isEmpty ||
        specialty.isEmpty) {
      setState(() => _professionalMessage = labels.professionalFieldsRequired);
      return;
    }

    setState(() {
      _professionalSubmitting = true;
      _professionalMessage = null;
    });

    try {
      await _service().requestProfessionalVerification(
        professionalName: professionalName,
        licenseNumber: licenseNumber,
        professionalCollege: professionalCollege,
        specialty: specialty,
      );
      _professionalNameController.clear();
      _licenseNumberController.clear();
      _professionalCollegeController.clear();
      _specialtyController.clear();
      setStateIfMounted(
        () => _professionalMessage = authCopies[_locale]!.verificationRequested,
      );
      await _loadUserProfile();
    } catch (_) {
      setStateIfMounted(
        () => _professionalMessage = authCopies[_locale]!.authFailed,
      );
    } finally {
      setStateIfMounted(() => _professionalSubmitting = false);
    }
  }

  Future<void> _resolveGoogleMapsAvailability() async {
    final available = await resolveGoogleMapsAvailability();
    setStateIfMounted(() => _googleMapsAvailable = available);
  }

  Future<void> _locateDeviceOnLaunch() async {
    if (_locationStatus == LocationStatus.locating) {
      return;
    }

    setStateIfMounted(() => _locationStatus = LocationStatus.locating);

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setStateIfMounted(() => _locationStatus = LocationStatus.unavailable);
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setStateIfMounted(() => _locationStatus = LocationStatus.denied);
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 12),
        ),
      );

      setStateIfMounted(() {
        _deviceLocation = DeviceLocation(
          latitude: position.latitude,
          longitude: position.longitude,
          accuracyMeters: position.accuracy,
        );
        _locationStatus = LocationStatus.located;
        _selectedPlace = 0;
      });
    } catch (_) {
      setStateIfMounted(() => _locationStatus = LocationStatus.error);
    }
  }

  String _mapSubtitleFor(PlaceSummary? selectedPlace) {
    return switch (_locationStatus) {
      LocationStatus.locating => switch (_locale) {
        LocaleOption.ca => 'Buscant ubicació',
        LocaleOption.es => 'Buscando ubicación',
        LocaleOption.en => 'Finding location',
      },
      LocationStatus.located =>
        selectedPlace == null
            ? appCopies[_locale]!.noPlacesTitle
            : '${selectedPlace.distance} · ${selectedPlace.city}',
      LocationStatus.denied => switch (_locale) {
        LocaleOption.ca => 'Permís d’ubicació bloquejat',
        LocaleOption.es => 'Permiso de ubicación bloqueado',
        LocaleOption.en => 'Location permission blocked',
      },
      LocationStatus.unavailable => switch (_locale) {
        LocaleOption.ca => 'Ubicació no disponible',
        LocaleOption.es => 'Ubicación no disponible',
        LocaleOption.en => 'Location unavailable',
      },
      LocationStatus.error => switch (_locale) {
        LocaleOption.ca => 'No s’ha pogut obtenir la ubicació',
        LocaleOption.es => 'No se ha podido obtener la ubicación',
        LocaleOption.en => 'Could not get location',
      },
      LocationStatus.idle =>
        selectedPlace?.city ?? appCopies[_locale]!.noPlacesTitle,
    };
  }

  void setStateIfMounted(VoidCallback update) {
    if (!mounted) {
      return;
    }
    setState(update);
  }

  Future<void> _restoreLostImages() async {
    try {
      final images = await _imagePicker.retrieveLostImages();
      if (!mounted || images.isEmpty) {
        return;
      }
      setState(() {
        _selectedImages.addAll(images);
        _reportMessage = null;
      });
    } catch (_) {
      // The plugin can be unavailable in widget tests; users can still pick again.
    }
  }

  Future<void> _pickReportImageFromGallery() {
    return _addPickedImage(_imagePicker.pickFromGallery());
  }

  Future<void> _takeReportPhoto() {
    return _addPickedImage(_imagePicker.takePhoto());
  }

  Future<void> _addPickedImage(Future<PreparedPlaceImage?> pendingImage) async {
    try {
      final image = await pendingImage;
      if (!mounted || image == null) {
        return;
      }
      setState(() {
        _selectedImages.add(image);
        _reportMessage = null;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() => _reportMessage = appCopies[_locale]!.submitFailed);
    }
  }

  Future<void> _submitReport(AppCopy labels) async {
    if (_isSubmittingReport) {
      return;
    }

    setState(() {
      _isSubmittingReport = true;
      _reportMessage = null;
    });

    try {
      final service = _service();
      if (!service.hasAuthenticatedUser) {
        if (mounted) {
          setState(() => _reportMessage = labels.uploadAuthRequired);
        }
        return;
      }

      final visiblePlaces = filterPlacesBySensory(
        rankPlacesByDeviceLocation(_places, _deviceLocation),
        _selectedFilter,
      );
      final place = visiblePlaces.isEmpty
          ? null
          : visiblePlaces[_selectedPlace
                .clamp(0, visiblePlaces.length - 1)
                .toInt()];
      var placeId = place?.id;
      if (placeId == null) {
        final placeName = _placeNameController.text.trim();
        final city = _placeCityController.text.trim();
        final addressOrArea = _placeAddressController.text.trim();
        if (placeName.isEmpty || city.isEmpty || addressOrArea.isEmpty) {
          if (mounted) {
            setState(
              () => _reportMessage = authCopies[_locale]!.requiredFields,
            );
          }
          return;
        }

        if (_deviceLocation == null) {
          await _locateDeviceOnLaunch();
        }
        final location = _deviceLocation;
        if (location == null) {
          if (mounted) {
            setState(() => _reportMessage = labels.locationRequiredForPlace);
          }
          return;
        }

        placeId = await service.createPlace(
          name: placeName,
          category: 'other',
          city: city,
          addressOrArea: addressOrArea,
          latitude: location.latitude,
          longitude: location.longitude,
          description: _placeDescriptionController.text.trim(),
        );
      }

      final comment = _notesController.text.trim();
      await service.submitReview(
        placeId: placeId,
        ratings: _ratings,
        comment: comment.isEmpty ? null : comment,
      );

      for (final image in _selectedImages) {
        await service.uploadPlaceImage(
          placeId: placeId,
          bytes: image.bytes,
          fileName: image.fileName,
          contentType: image.contentType,
          altText: {_locale.name: image.originalName},
        );
      }

      if (!mounted) {
        return;
      }
      setState(() {
        _selectedImages.clear();
        _notesController.clear();
        _placeNameController.clear();
        _placeCityController.clear();
        _placeAddressController.clear();
        _placeDescriptionController.clear();
        _reportMessage = labels.submitSuccess;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() => _reportMessage = labels.submitFailed);
    } finally {
      if (mounted) {
        setState(() => _isSubmittingReport = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final labels = appCopies[_locale]!;
    final authLabels = authCopies[_locale]!;
    final isDark = widget.themeMode == ThemeMode.dark;
    final visiblePlaces = filterPlacesBySensory(
      rankPlacesByDeviceLocation(_places, _deviceLocation),
      _selectedFilter,
    );
    final visibleVerifiedProfiles = rankVerifiedProfilesByDeviceLocation(
      _verifiedProfiles,
      _deviceLocation,
    );
    final selectedPlaceIndex = visiblePlaces.isEmpty
        ? -1
        : _selectedPlace.clamp(0, visiblePlaces.length - 1).toInt();
    final selectedPlace = selectedPlaceIndex < 0
        ? null
        : visiblePlaces[selectedPlaceIndex];
    final mapSubtitle = _mapSubtitleFor(selectedPlace);

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
                child: FittedBox(
                  alignment: Alignment.centerLeft,
                  fit: BoxFit.scaleDown,
                  child: Text(
                    labels.appName,
                    maxLines: 1,
                    style: Theme.of(
                      context,
                    ).textTheme.titleLarge?.copyWith(fontSize: 18),
                  ),
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
          IconButton(
            tooltip: _authUser == null
                ? authLabels.signInToContinue
                : authLabels.signOut,
            onPressed: _authUser == null ? () => _openAuthScreen() : _signOut,
            icon: Icon(
              _authUser == null ? Icons.login_outlined : Icons.logout_outlined,
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
                  authLabels: authLabels,
                  locale: _locale,
                  isAuthenticated: _authUser != null,
                  focusMode: _focusMode,
                  googleMapsAvailable: _googleMapsAvailable,
                  places: visiblePlaces,
                  verifiedProfiles: visibleVerifiedProfiles,
                  selectedPlace: selectedPlace,
                  mapSubtitle: mapSubtitle,
                  locationStatus: _locationStatus,
                  deviceLocation: _deviceLocation,
                  onLocate: _locateDeviceOnLaunch,
                  onOpenTab: _openTab,
                  onOpenPlace: (index) => setState(() {
                    _selectedPlace = index;
                    _selectedTab = MobileTab.consult;
                    _showHome = false;
                  }),
                )
              : _screenForTab(
                  labels,
                  selectedPlace,
                  visiblePlaces,
                  visibleVerifiedProfiles,
                  selectedPlaceIndex,
                  mapSubtitle,
                ),
        ),
      ),
      bottomNavigationBar: BottomNavigation(
        labels: labels,
        selectedTab: _showHome ? null : _selectedTab,
        onSelected: _openTab,
      ),
    );
  }

  Widget _screenForTab(
    AppCopy labels,
    PlaceSummary? selectedPlace,
    List<PlaceSummary> places,
    List<VerifiedProfile> verifiedProfiles,
    int selectedPlaceIndex,
    String mapSubtitle,
  ) {
    final authLabels = authCopies[_locale]!;
    final isAuthenticated = _authUser != null;

    switch (_selectedTab) {
      case MobileTab.consult:
        return ConsultScreen(
          key: const ValueKey('consult'),
          labels: labels,
          authLabels: authLabels,
          locale: _locale,
          places: places,
          selectedPlace: selectedPlaceIndex,
          selectedFilter: _selectedFilter,
          googleMapsAvailable: _googleMapsAvailable,
          mapSubtitle: mapSubtitle,
          locationStatus: _locationStatus,
          deviceLocation: _deviceLocation,
          isAuthenticated: isAuthenticated,
          onFilterChanged: (index) => setState(() {
            _selectedFilter = index;
            _selectedPlace = 0;
          }),
          onPlaceChanged: (index) => setState(() => _selectedPlace = index),
          onLocate: _locateDeviceOnLaunch,
          onContribute: () => _openTab(MobileTab.contribute),
        );
      case MobileTab.contribute:
        if (!isAuthenticated) {
          return _protectedAuthScreen(labels, authLabels);
        }
        return ReportScreen(
          key: const ValueKey('contribute'),
          labels: labels,
          locale: _locale,
          place: selectedPlace,
          placeNameController: _placeNameController,
          placeCityController: _placeCityController,
          placeAddressController: _placeAddressController,
          placeDescriptionController: _placeDescriptionController,
          ratings: _ratings,
          notesController: _notesController,
          selectedImages: _selectedImages,
          isSubmitting: _isSubmittingReport,
          reportMessage: _reportMessage,
          onRatingChanged: (key, value) =>
              setState(() => _ratings[key] = value),
          onPickFromGallery: _pickReportImageFromGallery,
          onTakePhoto: _takeReportPhoto,
          onRemoveImage: (index) =>
              setState(() => _selectedImages.removeAt(index)),
          onSubmit: () => _submitReport(labels),
        );
      case MobileTab.support:
        return HelpScreen(
          key: const ValueKey('support'),
          labels: labels,
          focusMode: _focusMode,
          onEnableFocus: () => setState(() => _focusMode = true),
        );
      case MobileTab.profiles:
        return ProfilesScreen(
          key: const ValueKey('profiles'),
          labels: labels,
          authLabels: authLabels,
          locale: _locale,
          isAuthenticated: isAuthenticated,
          userProfile: _userProfile,
          verifiedProfiles: verifiedProfiles,
          childProfiles: _childProfiles,
          childAliasController: _childAliasController,
          childAgeRange: _childAgeRange,
          profileMessage: _profileMessage,
          professionalMessage: _professionalMessage,
          professionalNameController: _professionalNameController,
          licenseNumberController: _licenseNumberController,
          professionalCollegeController: _professionalCollegeController,
          specialtyController: _specialtyController,
          isProfileSubmitting: _profileSubmitting,
          isProfessionalSubmitting: _professionalSubmitting,
          onChildAgeChanged: (value) => setState(() => _childAgeRange = value),
          onCreateChildProfile: _createChildProfile,
          onRequestProfessionalVerification: _requestProfessionalVerification,
        );
    }
  }

  Widget _protectedAuthScreen(AppCopy labels, AuthCopy authLabels) {
    return AuthScreen(
      key: const ValueKey('protected-auth'),
      labels: labels,
      authLabels: authLabels,
      locale: _locale,
      isDark: widget.themeMode == ThemeMode.dark,
      showRegister: _showRegister,
      isSubmitting: _authSubmitting,
      authUnavailable: _authUnavailable,
      message: _authMessage,
      emailController: _authEmailController,
      passwordController: _authPasswordController,
      passwordRepeatController: _authPasswordRepeatController,
      publicNameController: _authPublicNameController,
      cityController: _authCityController,
      professionalNameController: _professionalNameController,
      licenseNumberController: _licenseNumberController,
      professionalCollegeController: _professionalCollegeController,
      specialtyController: _specialtyController,
      registrationKind: _registrationKind,
      standalone: false,
      onToggleMode: () => setState(() => _showRegister = !_showRegister),
      onRegistrationKindChanged: (kind) =>
          setState(() => _registrationKind = kind),
      onLocaleChanged: (locale) => setState(() => _locale = locale),
      onThemeModeChanged: widget.onThemeModeChanged,
      onEmailSubmit: _showRegister ? _registerWithEmail : _signInWithEmail,
      onGoogle: _signInWithGoogle,
      onApple: _signInWithApple,
    );
  }
}

class AuthScreen extends StatelessWidget {
  const AuthScreen({
    required this.labels,
    required this.authLabels,
    required this.locale,
    required this.isDark,
    required this.showRegister,
    required this.isSubmitting,
    required this.authUnavailable,
    required this.message,
    required this.emailController,
    required this.passwordController,
    required this.passwordRepeatController,
    required this.publicNameController,
    required this.cityController,
    required this.professionalNameController,
    required this.licenseNumberController,
    required this.professionalCollegeController,
    required this.specialtyController,
    required this.registrationKind,
    required this.onToggleMode,
    required this.onRegistrationKindChanged,
    required this.onLocaleChanged,
    required this.onThemeModeChanged,
    required this.onEmailSubmit,
    required this.onGoogle,
    required this.onApple,
    this.standalone = true,
    super.key,
  });

  final AppCopy labels;
  final AuthCopy authLabels;
  final LocaleOption locale;
  final bool isDark;
  final bool showRegister;
  final bool isSubmitting;
  final bool authUnavailable;
  final String? message;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController passwordRepeatController;
  final TextEditingController publicNameController;
  final TextEditingController cityController;
  final TextEditingController professionalNameController;
  final TextEditingController licenseNumberController;
  final TextEditingController professionalCollegeController;
  final TextEditingController specialtyController;
  final RegistrationKind registrationKind;
  final VoidCallback onToggleMode;
  final ValueChanged<RegistrationKind> onRegistrationKindChanged;
  final ValueChanged<LocaleOption> onLocaleChanged;
  final ValueChanged<ThemeMode> onThemeModeChanged;
  final VoidCallback onEmailSubmit;
  final VoidCallback onGoogle;
  final VoidCallback onApple;
  final bool standalone;

  @override
  Widget build(BuildContext context) {
    final professionalRegister =
        showRegister && registrationKind == RegistrationKind.professional;
    final content = SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 22, 20, 32),
        children: [
          Row(
            children: [
              const BrandLogo(size: 46),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  labels.appName,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              PopupMenuButton<LocaleOption>(
                tooltip: 'Idioma',
                initialValue: locale,
                icon: Text(
                  locale.label,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                onSelected: onLocaleChanged,
                itemBuilder: (context) => LocaleOption.values
                    .map(
                      (locale) => PopupMenuItem(
                        value: locale,
                        child: Text(locale.label),
                      ),
                    )
                    .toList(),
              ),
              IconButton(
                tooltip: isDark ? labels.lightMode : labels.darkMode,
                onPressed: () => onThemeModeChanged(
                  isDark ? ThemeMode.light : ThemeMode.dark,
                ),
                icon: Icon(
                  isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 34),
          Text(
            authLabels.authTitle,
            style: Theme.of(context).textTheme.displayLarge,
          ),
          const SizedBox(height: 14),
          Text(
            authLabels.authIntro,
            style: TextStyle(
              color: mutedColor(context),
              fontSize: 16,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 24),
          SpectrumPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SegmentedButton<bool>(
                  segments: [
                    ButtonSegment(
                      value: true,
                      label: Text(authLabels.register),
                      icon: const Icon(Icons.person_add_alt_1_outlined),
                    ),
                    ButtonSegment(
                      value: false,
                      label: Text(authLabels.login),
                      icon: const Icon(Icons.login_outlined),
                    ),
                  ],
                  selected: {showRegister},
                  onSelectionChanged: (_) => onToggleMode(),
                ),
                const SizedBox(height: 18),
                if (showRegister) ...[
                  SegmentedButton<RegistrationKind>(
                    segments: [
                      ButtonSegment(
                        value: RegistrationKind.user,
                        label: Text(authLabels.personalAccount),
                        icon: const Icon(Icons.person_outline),
                      ),
                      ButtonSegment(
                        value: RegistrationKind.professional,
                        label: Text(authLabels.professionalAccount),
                        icon: const Icon(Icons.verified_user_outlined),
                      ),
                    ],
                    selected: {registrationKind},
                    onSelectionChanged: (values) =>
                        onRegistrationKindChanged(values.first),
                  ),
                  const SizedBox(height: 18),
                ],
                if (professionalRegister) ...[
                  StatusMessage(message: authLabels.professionalRegisterIntro),
                  const SizedBox(height: 18),
                ] else ...[
                  OutlinedButton.icon(
                    onPressed: isSubmitting || authUnavailable
                        ? null
                        : onGoogle,
                    icon: const GoogleLogo(size: 18),
                    label: Text(authLabels.continueWithGoogle),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: isSubmitting || authUnavailable ? null : onApple,
                    icon: const AppleLogo(size: 18),
                    label: Text(authLabels.continueWithApple),
                  ),
                  const SizedBox(height: 18),
                ],
                if (showRegister) ...[
                  TextField(
                    controller: publicNameController,
                    decoration: InputDecoration(
                      labelText: authLabels.publicName,
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(labelText: authLabels.email),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: InputDecoration(labelText: authLabels.password),
                ),
                if (showRegister) ...[
                  const SizedBox(height: 12),
                  TextField(
                    controller: passwordRepeatController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: authLabels.confirmPassword,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: cityController,
                    decoration: InputDecoration(
                      labelText: authLabels.cityOptional,
                    ),
                  ),
                  if (professionalRegister) ...[
                    const SizedBox(height: 12),
                    TextField(
                      controller: professionalNameController,
                      decoration: InputDecoration(
                        labelText: authLabels.professionalName,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: licenseNumberController,
                      decoration: InputDecoration(
                        labelText: authLabels.licenseNumber,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: professionalCollegeController,
                      decoration: InputDecoration(
                        labelText: authLabels.professionalCollege,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: specialtyController,
                      decoration: InputDecoration(
                        labelText: authLabels.specialty,
                      ),
                    ),
                  ],
                ],
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: isSubmitting || authUnavailable
                      ? null
                      : onEmailSubmit,
                  icon: isSubmitting
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.mail_outline),
                  label: Text(
                    showRegister
                        ? authLabels.emailRegister
                        : authLabels.emailLogin,
                  ),
                ),
                if (message != null || authUnavailable) ...[
                  const SizedBox(height: 14),
                  StatusMessage(
                    message: authUnavailable ? authLabels.authFailed : message!,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
    return standalone ? Scaffold(body: content) : content;
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    required this.labels,
    required this.authLabels,
    required this.locale,
    required this.isAuthenticated,
    required this.focusMode,
    required this.googleMapsAvailable,
    required this.places,
    required this.verifiedProfiles,
    required this.selectedPlace,
    required this.mapSubtitle,
    required this.locationStatus,
    required this.deviceLocation,
    required this.onLocate,
    required this.onOpenTab,
    required this.onOpenPlace,
    super.key,
  });

  final AppCopy labels;
  final AuthCopy authLabels;
  final LocaleOption locale;
  final bool isAuthenticated;
  final bool focusMode;
  final bool googleMapsAvailable;
  final List<PlaceSummary> places;
  final List<VerifiedProfile> verifiedProfiles;
  final PlaceSummary? selectedPlace;
  final String mapSubtitle;
  final LocationStatus locationStatus;
  final DeviceLocation? deviceLocation;
  final Future<void> Function() onLocate;
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
        Text(
          isAuthenticated ? labels.greeting : authLabels.publicMode,
          style: Theme.of(context).textTheme.displayLarge,
        ),
        const SizedBox(height: 14),
        Text(
          isAuthenticated ? labels.homeIntro : authLabels.signInRequiredIntro,
          style: TextStyle(
            color: mutedColor(context),
            fontSize: 17,
            height: 1.55,
          ),
        ),
        const SizedBox(height: 24),
        SensoryMapPanel(
          title: labels.nearbyMap,
          subtitle: mapSubtitle,
          locale: locale,
          openFullMapLabel: labels.openFullMap,
          googleMapsAvailable: googleMapsAvailable,
          places: places,
          selectedPlace: selectedPlace,
          locationStatus: locationStatus,
          deviceLocation: deviceLocation,
          emptyBody: labels.noPlacesBody,
          onLocate: onLocate,
          onOpen: () => onOpenTab(MobileTab.consult),
          onPlaceSelected: onOpenPlace,
        ),
        const SizedBox(height: 18),
        SpectrumPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionHeading(
                title: labels.availablePlaces,
                action: labels.viewAll,
              ),
              const SizedBox(height: 10),
              if (places.isEmpty)
                StatusMessage(message: labels.noPlacesBody)
              else
                for (final entry in places.indexed)
                  SavedPlaceRow(
                    locale: locale,
                    place: entry.$2,
                    onTap: () => onOpenPlace(entry.$1),
                  ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        if (!isAuthenticated) ...[
          SpectrumPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.lock_outline, color: SpectrumColors.tertiary),
                const SizedBox(height: 12),
                Text(
                  authLabels.signInRequiredTitle,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  authLabels.signInRequiredIntro,
                  style: TextStyle(color: mutedColor(context), height: 1.45),
                ),
                const SizedBox(height: 14),
                FilledButton.icon(
                  onPressed: () => onOpenTab(MobileTab.contribute),
                  icon: const Icon(Icons.login_outlined),
                  label: Text(authLabels.signInToContinue),
                ),
              ],
            ),
          ),
        ],
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
              if (verifiedProfiles.isEmpty)
                StatusMessage(message: labels.noVerifiedProfiles)
              else
                for (final profile in verifiedProfiles)
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
    required this.authLabels,
    required this.locale,
    required this.places,
    required this.selectedPlace,
    required this.selectedFilter,
    required this.googleMapsAvailable,
    required this.mapSubtitle,
    required this.locationStatus,
    required this.deviceLocation,
    required this.isAuthenticated,
    required this.onFilterChanged,
    required this.onPlaceChanged,
    required this.onLocate,
    required this.onContribute,
    super.key,
  });

  final AppCopy labels;
  final AuthCopy authLabels;
  final LocaleOption locale;
  final List<PlaceSummary> places;
  final int selectedPlace;
  final int? selectedFilter;
  final bool googleMapsAvailable;
  final String mapSubtitle;
  final LocationStatus locationStatus;
  final DeviceLocation? deviceLocation;
  final bool isAuthenticated;
  final ValueChanged<int?> onFilterChanged;
  final ValueChanged<int> onPlaceChanged;
  final Future<void> Function() onLocate;
  final VoidCallback onContribute;

  @override
  Widget build(BuildContext context) {
    final place = places.isEmpty
        ? null
        : places[selectedPlace.clamp(0, places.length - 1).toInt()];
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
                  onSelected: (selected) =>
                      onFilterChanged(selected ? entry.$1 : null),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 18),
        SensoryMapPanel(
          title: labels.nearbyMap,
          subtitle: mapSubtitle,
          locale: locale,
          openFullMapLabel: labels.openFullMap,
          googleMapsAvailable: googleMapsAvailable,
          places: places,
          selectedPlace: place,
          locationStatus: locationStatus,
          deviceLocation: deviceLocation,
          emptyBody: labels.noPlacesBody,
          onLocate: onLocate,
          onPlaceSelected: onPlaceChanged,
        ),
        const SizedBox(height: 18),
        if (place == null)
          SpectrumPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionHeading(title: labels.noPlacesTitle),
                const SizedBox(height: 8),
                Text(
                  labels.noPlacesBody,
                  style: TextStyle(color: mutedColor(context), height: 1.45),
                ),
                const SizedBox(height: 14),
                FilledButton.icon(
                  onPressed: onContribute,
                  icon: Icon(
                    isAuthenticated
                        ? Icons.add_location_alt_outlined
                        : Icons.login_outlined,
                  ),
                  label: Text(
                    isAuthenticated
                        ? labels.createPlace
                        : authLabels.signInToContinue,
                  ),
                ),
              ],
            ),
          )
        else
          PlaceDetailsCard(
            labels: labels,
            authLabels: authLabels,
            locale: locale,
            place: place,
            isAuthenticated: isAuthenticated,
            onContribute: onContribute,
          ),
        const SizedBox(height: 18),
        for (final entry in places.indexed)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: SavedPlaceRow(
              locale: locale,
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
    required this.placeNameController,
    required this.placeCityController,
    required this.placeAddressController,
    required this.placeDescriptionController,
    required this.ratings,
    required this.notesController,
    required this.selectedImages,
    required this.isSubmitting,
    required this.reportMessage,
    required this.onRatingChanged,
    required this.onPickFromGallery,
    required this.onTakePhoto,
    required this.onRemoveImage,
    required this.onSubmit,
    super.key,
  });

  final AppCopy labels;
  final LocaleOption locale;
  final PlaceSummary? place;
  final TextEditingController placeNameController;
  final TextEditingController placeCityController;
  final TextEditingController placeAddressController;
  final TextEditingController placeDescriptionController;
  final Map<SensoryKey, double> ratings;
  final TextEditingController notesController;
  final List<PreparedPlaceImage> selectedImages;
  final bool isSubmitting;
  final String? reportMessage;
  final void Function(SensoryKey key, double value) onRatingChanged;
  final VoidCallback onPickFromGallery;
  final VoidCallback onTakePhoto;
  final ValueChanged<int> onRemoveImage;
  final VoidCallback onSubmit;

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
              if (place == null)
                NewPlaceContext(
                  labels: labels,
                  placeNameController: placeNameController,
                  placeCityController: placeCityController,
                  placeAddressController: placeAddressController,
                  placeDescriptionController: placeDescriptionController,
                )
              else
                PlaceContext(place: place!, labels: labels, locale: locale),
              const SizedBox(height: 18),
              InlineUploadBox(
                labels: labels,
                selectedImages: selectedImages,
                onPickFromGallery: onPickFromGallery,
                onTakePhoto: onTakePhoto,
                onRemoveImage: onRemoveImage,
              ),
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
              if (reportMessage != null) ...[
                const SizedBox(height: 8),
                StatusMessage(message: reportMessage!),
                const SizedBox(height: 14),
              ] else
                const SizedBox(height: 8),
              FilledButton.icon(
                onPressed: isSubmitting ? null : onSubmit,
                icon: isSubmitting
                    ? const SizedBox.square(
                        dimension: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.send_outlined),
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

  void _showHelpCard(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.volunteer_activism_outlined),
            const SizedBox(width: 10),
            Expanded(child: Text(labels.helpCard)),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                labels.communicationMessage,
                style: Theme.of(
                  context,
                ).textTheme.headlineSmall?.copyWith(height: 1.35),
              ),
              const SizedBox(height: 18),
              DecoratedBox(
                decoration: BoxDecoration(
                  color: softPanelColor(context),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.phone_outlined, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              labels.trustedContact,
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(labels.trustedContactBody),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(labels.close),
          ),
        ],
      ),
    );
  }

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
              FilledButton(
                onPressed: () => _showHelpCard(context),
                child: Text(labels.openHelpCard),
              ),
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
            subtitle: Text(labels.trustedContactBody),
            trailing: Tooltip(
              message: labels.actionUnavailable,
              child: TextButton(onPressed: null, child: Text(labels.contact)),
            ),
          ),
        ),
      ],
    );
  }
}

class ProfilesScreen extends StatelessWidget {
  const ProfilesScreen({
    required this.labels,
    required this.authLabels,
    required this.locale,
    required this.isAuthenticated,
    required this.userProfile,
    required this.verifiedProfiles,
    required this.childProfiles,
    required this.childAliasController,
    required this.childAgeRange,
    required this.profileMessage,
    required this.professionalMessage,
    required this.professionalNameController,
    required this.licenseNumberController,
    required this.professionalCollegeController,
    required this.specialtyController,
    required this.isProfileSubmitting,
    required this.isProfessionalSubmitting,
    required this.onChildAgeChanged,
    required this.onCreateChildProfile,
    required this.onRequestProfessionalVerification,
    super.key,
  });

  final AppCopy labels;
  final AuthCopy authLabels;
  final LocaleOption locale;
  final bool isAuthenticated;
  final SpectrumUserProfile? userProfile;
  final List<VerifiedProfile> verifiedProfiles;
  final List<ChildProfile> childProfiles;
  final TextEditingController childAliasController;
  final String? childAgeRange;
  final String? profileMessage;
  final String? professionalMessage;
  final TextEditingController professionalNameController;
  final TextEditingController licenseNumberController;
  final TextEditingController professionalCollegeController;
  final TextEditingController specialtyController;
  final bool isProfileSubmitting;
  final bool isProfessionalSubmitting;
  final ValueChanged<String?> onChildAgeChanged;
  final VoidCallback onCreateChildProfile;
  final VoidCallback onRequestProfessionalVerification;

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
              if (verifiedProfiles.isEmpty)
                StatusMessage(message: labels.noVerifiedProfiles)
              else
                for (final profile in verifiedProfiles)
                  VerifiedRow(profile: profile, labels: labels),
            ],
          ),
        ),
        const SizedBox(height: 14),
        if (!isAuthenticated) ...[
          SpectrumPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.lock_outline, color: SpectrumColors.tertiary),
                const SizedBox(height: 12),
                Text(
                  authLabels.signInRequiredTitle,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  authLabels.signInRequiredIntro,
                  style: TextStyle(color: mutedColor(context), height: 1.45),
                ),
              ],
            ),
          ),
        ],
        if (isAuthenticated) ...[
          ProfilePanel(
            icon: Icons.person_outline,
            title: labels.adultProfile,
            body:
                '${userProfile?.publicName ?? 'Spectrum user'} · ${userProfile?.city ?? authLabels.cityOptional}',
          ),
          const SizedBox(height: 14),
          ProfilePanel(
            icon: Icons.supervisor_account_outlined,
            title: labels.tutorProfile,
            body: labels.tutorProfileBody,
          ),
          const SizedBox(height: 14),
          SpectrumPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionHeading(title: labels.childProfile),
                const SizedBox(height: 10),
                if (childProfiles.isEmpty)
                  StatusMessage(message: labels.noChildProfiles)
                else
                  for (final child in childProfiles)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: ChildProfileTile(profile: child, locale: locale),
                    ),
                const SizedBox(height: 12),
                TextField(
                  controller: childAliasController,
                  decoration: InputDecoration(labelText: authLabels.childAlias),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: childAgeRange,
                  decoration: InputDecoration(labelText: authLabels.childAge),
                  items: const [
                    DropdownMenuItem(value: '0-5', child: Text('0-5')),
                    DropdownMenuItem(value: '6-9', child: Text('6-9')),
                    DropdownMenuItem(value: '10-13', child: Text('10-13')),
                    DropdownMenuItem(value: '14-17', child: Text('14-17')),
                  ],
                  onChanged: onChildAgeChanged,
                ),
                const SizedBox(height: 14),
                FilledButton.icon(
                  onPressed: isProfileSubmitting ? null : onCreateChildProfile,
                  icon: isProfileSubmitting
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.add),
                  label: Text(authLabels.createChildProfile),
                ),
                if (profileMessage != null) ...[
                  const SizedBox(height: 12),
                  StatusMessage(message: profileMessage!),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
          SpectrumPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionHeading(title: authLabels.professionalRequestTitle),
                const SizedBox(height: 12),
                TextField(
                  controller: professionalNameController,
                  decoration: InputDecoration(
                    labelText: authLabels.professionalName,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: licenseNumberController,
                  decoration: InputDecoration(
                    labelText: authLabels.licenseNumber,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: professionalCollegeController,
                  decoration: InputDecoration(
                    labelText: authLabels.professionalCollege,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: specialtyController,
                  decoration: InputDecoration(labelText: authLabels.specialty),
                ),
                const SizedBox(height: 14),
                FilledButton.icon(
                  onPressed: isProfessionalSubmitting
                      ? null
                      : onRequestProfessionalVerification,
                  icon: isProfessionalSubmitting
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.verified_outlined),
                  label: Text(authLabels.requestVerification),
                ),
                if (professionalMessage != null) ...[
                  const SizedBox(height: 12),
                  StatusMessage(message: professionalMessage!),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
          ProfilePanel(
            icon: Icons.tune_outlined,
            title: labels.sensoryProfile,
            body: labels.sensoryProfileBody,
          ),
        ],
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
    required this.locale,
    required this.openFullMapLabel,
    required this.googleMapsAvailable,
    required this.places,
    required this.selectedPlace,
    required this.locationStatus,
    required this.deviceLocation,
    required this.emptyBody,
    required this.onLocate,
    required this.onPlaceSelected,
    this.onOpen,
    super.key,
  });

  final String title;
  final String subtitle;
  final LocaleOption locale;
  final String openFullMapLabel;
  final bool googleMapsAvailable;
  final List<PlaceSummary> places;
  final PlaceSummary? selectedPlace;
  final LocationStatus locationStatus;
  final DeviceLocation? deviceLocation;
  final String emptyBody;
  final Future<void> Function() onLocate;
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
              if (onOpen != null)
                IconButton(
                  tooltip: openFullMapLabel,
                  onPressed: onOpen,
                  icon: const Icon(Icons.tune_outlined),
                ),
              IconButton(
                tooltip: subtitle,
                onPressed: () => unawaited(onLocate()),
                icon: Icon(
                  locationStatus == LocationStatus.locating
                      ? Icons.location_searching
                      : Icons.my_location_outlined,
                ),
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
                  if (selectedPlace == null && deviceLocation == null)
                    _EmptyMapLayer(body: emptyBody)
                  else if (googleMapsAvailable)
                    _GoogleMapLayer(
                      places: places,
                      selectedPlace: selectedPlace,
                      deviceLocation: deviceLocation,
                      locationStatus: locationStatus,
                      onPlaceSelected: onPlaceSelected,
                    )
                  else
                    _FallbackMapLayer(
                      places: places,
                      selectedPlace: selectedPlace,
                      deviceLocation: deviceLocation,
                      onPlaceSelected: onPlaceSelected,
                    ),
                  Positioned(
                    left: 14,
                    top: 14,
                    child: _MapProviderBadge(
                      label: googleMapsAvailable
                          ? 'Google Maps'
                          : 'Fallback map',
                    ),
                  ),
                  if (selectedPlace != null)
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
                                  localizedPlaceArea(locale, selectedPlace!),
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              Text(
                                selectedPlace!.quietDb,
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
              label: Text(openFullMapLabel),
            ),
          ],
        ],
      ),
    );
  }
}

class _GoogleMapLayer extends StatelessWidget {
  const _GoogleMapLayer({
    required this.places,
    required this.selectedPlace,
    required this.deviceLocation,
    required this.locationStatus,
    required this.onPlaceSelected,
  });

  final List<PlaceSummary> places;
  final PlaceSummary? selectedPlace;
  final DeviceLocation? deviceLocation;
  final LocationStatus locationStatus;
  final ValueChanged<int> onPlaceSelected;

  @override
  Widget build(BuildContext context) {
    final selectedIndex = places.indexWhere(
      (place) => place.id == selectedPlace?.id,
    );
    final deviceLatLng = deviceLocation == null
        ? null
        : LatLng(deviceLocation!.latitude, deviceLocation!.longitude);
    final cameraTarget =
        deviceLatLng ??
        LatLng(selectedPlace!.latitude, selectedPlace!.longitude);

    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: GoogleMap(
        key: ValueKey(
          '${selectedPlace?.id ?? 'device'}-${deviceLocation?.latitude}-${deviceLocation?.longitude}',
        ),
        initialCameraPosition: CameraPosition(
          target: cameraTarget,
          zoom: deviceLatLng == null ? 13 : 14,
        ),
        markers: {
          for (final entry in places.indexed)
            Marker(
              markerId: MarkerId(entry.$2.id),
              position: LatLng(entry.$2.latitude, entry.$2.longitude),
              onTap: () => onPlaceSelected(entry.$1),
              icon: BitmapDescriptor.defaultMarkerWithHue(
                entry.$1 == selectedIndex
                    ? BitmapDescriptor.hueYellow
                    : BitmapDescriptor.hueAzure,
              ),
            ),
          if (deviceLatLng != null)
            Marker(
              markerId: const MarkerId('device-location'),
              position: deviceLatLng,
              icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueBlue,
              ),
            ),
        },
        compassEnabled: false,
        mapToolbarEnabled: false,
        myLocationEnabled: locationStatus == LocationStatus.located,
        myLocationButtonEnabled: false,
        zoomControlsEnabled: false,
      ),
    );
  }
}

class _FallbackMapLayer extends StatelessWidget {
  const _FallbackMapLayer({
    required this.places,
    required this.selectedPlace,
    required this.deviceLocation,
    required this.onPlaceSelected,
  });

  final List<PlaceSummary> places;
  final PlaceSummary? selectedPlace;
  final DeviceLocation? deviceLocation;
  final ValueChanged<int> onPlaceSelected;

  @override
  Widget build(BuildContext context) {
    final pinLayout = [
      (left: .38, top: .45),
      (left: .59, top: .28),
      (left: .68, top: .64),
      (left: .32, top: .63),
      (left: .72, top: .38),
    ];

    return Stack(
      children: [
        Positioned.fill(
          child: CustomPaint(
            painter: PremiumMapPainter(
              isDark: Theme.of(context).brightness == Brightness.dark,
            ),
          ),
        ),
        for (final entry in places.indexed)
          _MapPin(
            left: pinLayout[entry.$1 % pinLayout.length].left,
            top: pinLayout[entry.$1 % pinLayout.length].top,
            active: selectedPlace?.id == entry.$2.id,
            onTap: () => onPlaceSelected(entry.$1),
          ),
        if (deviceLocation != null)
          const Positioned(
            left: 0,
            right: 0,
            top: 122,
            child: Center(
              child: Icon(
                Icons.my_location,
                color: SpectrumColors.primary,
                size: 28,
              ),
            ),
          ),
      ],
    );
  }
}

class _EmptyMapLayer extends StatelessWidget {
  const _EmptyMapLayer({required this.body});

  final String body;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.add_location_alt_outlined,
              color: SpectrumColors.tertiary,
              size: 42,
            ),
            const SizedBox(height: 12),
            Text(
              body,
              textAlign: TextAlign.center,
              style: TextStyle(color: mutedColor(context), height: 1.45),
            ),
          ],
        ),
      ),
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
    required this.locale,
    required this.place,
    required this.onTap,
    this.selected = false,
    super.key,
  });

  final LocaleOption locale;
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
                      '${localizedPlaceArea(locale, place)} · ${place.distance}',
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

class PlaceDetailsCard extends StatelessWidget {
  const PlaceDetailsCard({
    required this.labels,
    required this.authLabels,
    required this.locale,
    required this.place,
    required this.isAuthenticated,
    required this.onContribute,
    super.key,
  });

  final AppCopy labels;
  final AuthCopy authLabels;
  final LocaleOption locale;
  final PlaceSummary place;
  final bool isAuthenticated;
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
            '${localizedPlaceArea(locale, place)} · ${place.city}',
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
          Text(
            localizedPlaceDescription(locale, place),
            style: const TextStyle(height: 1.45),
          ),
          const SizedBox(height: 16),
          if (isAuthenticated) ...[
            Row(
              children: [
                Expanded(
                  child: Tooltip(
                    message: labels.actionUnavailable,
                    child: OutlinedButton(
                      onPressed: null,
                      child: Text(labels.save),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Tooltip(
                    message: labels.actionUnavailable,
                    child: OutlinedButton(
                      onPressed: null,
                      child: Text(labels.report),
                    ),
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
          ] else ...[
            DecoratedBox(
              decoration: BoxDecoration(
                color: softPanelColor(context),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.lock_outline),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        authLabels.signInRequiredIntro,
                        style: TextStyle(
                          color: mutedColor(context),
                          height: 1.45,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),
            FilledButton.icon(
              onPressed: onContribute,
              icon: const Icon(Icons.login_outlined),
              label: Text(authLabels.signInToContinue),
            ),
          ],
        ],
      ),
    );
  }
}

class NewPlaceContext extends StatelessWidget {
  const NewPlaceContext({
    required this.labels,
    required this.placeNameController,
    required this.placeCityController,
    required this.placeAddressController,
    required this.placeDescriptionController,
    super.key,
  });

  final AppCopy labels;
  final TextEditingController placeNameController;
  final TextEditingController placeCityController;
  final TextEditingController placeAddressController;
  final TextEditingController placeDescriptionController;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeading(title: labels.createPlace),
        const SizedBox(height: 10),
        Text(
          labels.noPlacesBody,
          style: TextStyle(color: mutedColor(context), height: 1.45),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: placeNameController,
          decoration: InputDecoration(labelText: labels.placeName),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: placeCityController,
          decoration: InputDecoration(labelText: labels.placeCity),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: placeAddressController,
          decoration: InputDecoration(labelText: labels.placeAddress),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: placeDescriptionController,
          minLines: 2,
          maxLines: 4,
          decoration: InputDecoration(labelText: labels.placeDescription),
        ),
      ],
    );
  }
}

class PlaceContext extends StatelessWidget {
  const PlaceContext({
    required this.place,
    required this.labels,
    required this.locale,
    super.key,
  });

  final PlaceSummary place;
  final AppCopy labels;
  final LocaleOption locale;

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
                '${localizedPlaceArea(locale, place)} · ${place.quietDb}',
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

class StatusMessage extends StatelessWidget {
  const StatusMessage({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: softPanelColor(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor(context)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            const Icon(Icons.info_outline, size: 18),
            const SizedBox(width: 10),
            Expanded(child: Text(message)),
          ],
        ),
      ),
    );
  }
}

class InlineUploadBox extends StatelessWidget {
  const InlineUploadBox({
    required this.labels,
    required this.selectedImages,
    required this.onPickFromGallery,
    required this.onTakePhoto,
    required this.onRemoveImage,
    super.key,
  });

  final AppCopy labels;
  final List<PreparedPlaceImage> selectedImages;
  final VoidCallback onPickFromGallery;
  final VoidCallback onTakePhoto;
  final ValueChanged<int> onRemoveImage;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: softPanelColor(context),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
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
                        style: TextStyle(
                          color: mutedColor(context),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                OutlinedButton.icon(
                  onPressed: onTakePhoto,
                  icon: const Icon(Icons.photo_camera_outlined),
                  label: Text(labels.takePhoto),
                ),
                OutlinedButton.icon(
                  onPressed: onPickFromGallery,
                  icon: const Icon(Icons.photo_library_outlined),
                  label: Text(labels.chooseFromGallery),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              labels.heicNotice,
              style: TextStyle(color: mutedColor(context), fontSize: 12),
            ),
            if (selectedImages.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                labels.selectedImages,
                style: Theme.of(context).textTheme.labelLarge,
              ),
              const SizedBox(height: 8),
              for (final entry in selectedImages.indexed)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: PreparedImageRow(
                    image: entry.$2,
                    labels: labels,
                    onRemove: () => onRemoveImage(entry.$1),
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class PreparedImageRow extends StatelessWidget {
  const PreparedImageRow({
    required this.image,
    required this.labels,
    required this.onRemove,
    super.key,
  });

  final PreparedPlaceImage image;
  final AppCopy labels;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: panelColor(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor(context)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            const Icon(Icons.image_outlined, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    image.fileName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${image.contentType} · ${_formatImageSize(image.sizeInBytes)} · ${labels.uploadReady}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: mutedColor(context), fontSize: 12),
                  ),
                ],
              ),
            ),
            if (image.isHeic) ...[
              const SizedBox(width: 8),
              const Chip(
                label: Text('HEIC'),
                visualDensity: VisualDensity.compact,
              ),
            ],
            IconButton(
              tooltip: labels.removeImage,
              onPressed: onRemove,
              icon: const Icon(Icons.close),
            ),
          ],
        ),
      ),
    );
  }
}

String _formatImageSize(int bytes) {
  if (bytes < 1024 * 1024) {
    return '${(bytes / 1024).toStringAsFixed(0)} KB';
  }
  return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
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
                  '${profile.identifier} · ${profile.distance}',
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
  const ChildProfileTile({
    required this.profile,
    required this.locale,
    super.key,
  });

  final ChildProfile profile;
  final LocaleOption locale;

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
                    localizedChildAgeLine(locale, profile),
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

class GoogleLogo extends StatelessWidget {
  const GoogleLogo({this.size = 18, super.key});

  final double size;

  static const _svg = '''
<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
''';

  @override
  Widget build(BuildContext context) {
    return SvgPicture.string(
      _svg,
      width: size,
      height: size,
      semanticsLabel: 'Google',
    );
  }
}

class AppleLogo extends StatelessWidget {
  const AppleLogo({this.size = 18, super.key});

  final double size;

  static const _svg = '''
<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path fill="#000000" d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43Zm3.314 11.725c-.048-.096-2.325-1.234-2.113-3.422.212-2.187 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.28Z"/>
</svg>
''';

  @override
  Widget build(BuildContext context) {
    final iconColor =
        IconTheme.of(context).color ?? Theme.of(context).colorScheme.onSurface;
    return SvgPicture.string(
      _svg,
      width: size,
      height: size,
      semanticsLabel: 'Apple',
      colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
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
