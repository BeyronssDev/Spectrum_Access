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

const nearbyDiscoveryRadiusMeters = 100.0;
const nearbyDiscoveryMaxResults = 8;
const minimumPasswordLength = 12;

class _BetaBadge extends StatelessWidget {
  const _BetaBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final foreground = isDark
        ? SpectrumColors.tertiaryContainer
        : SpectrumColors.tertiary;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: SpectrumColors.tertiaryContainer.withValues(
          alpha: isDark ? 0.18 : 0.2,
        ),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: foreground.withValues(alpha: 0.44)),
      ),
      child: Text(
        label.toUpperCase(),
        maxLines: 1,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: foreground,
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
          height: 1,
        ),
      ),
    );
  }
}

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
  bool _userProfileEditing = false;
  bool _userProfileSubmitting = false;
  bool _qualifiedAccountCreated = false;
  bool _placesLoading = false;
  bool _placesReloadQueued = false;
  bool _eventsLoading = false;
  bool _isSubmittingEventExperience = false;
  int _selectedPlace = 0;
  int? _selectedFilter;
  LocationStatus _locationStatus = LocationStatus.idle;
  DeviceLocation? _deviceLocation;
  LocaleOption _locale = LocaleOption.ca;
  MobileTab _selectedTab = MobileTab.consult;
  SpectrumApplicationService? _applicationService;
  StreamSubscription<SpectrumAuthUser?>? _authSubscription;
  Timer? _firebaseInitializationTimeout;
  SpectrumAuthUser? _authUser;
  SpectrumUserProfile? _userProfile;
  List<PlaceSummary> _places = const [];
  EventHistorySummary _eventHistory = const EventHistorySummary();
  Map<String, String> _eventPhotoUrls = const {};
  final PlaceImagePicker _imagePicker = PlaceImagePicker();
  final PlaceImagePicker _profileImagePicker = PlaceImagePicker();
  final List<PreparedPlaceImage> _selectedImages = [];
  final TextEditingController _authEmailController = TextEditingController();
  final TextEditingController _authPasswordController = TextEditingController();
  final TextEditingController _authPasswordRepeatController =
      TextEditingController();
  final TextEditingController _authPublicNameController =
      TextEditingController();
  final TextEditingController _authCityController = TextEditingController();
  final TextEditingController _authBirthDateController =
      TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _licenseNumberController =
      TextEditingController();
  final TextEditingController _professionalCollegeController =
      TextEditingController();
  final TextEditingController _specialtyController = TextEditingController();
  final TextEditingController _organizationDescriptionController =
      TextEditingController();
  final TextEditingController _organizationWebsiteController =
      TextEditingController();
  final TextEditingController _organizationRegistryController =
      TextEditingController();
  final TextEditingController _userProfileNameController =
      TextEditingController();
  final TextEditingController _userProfileCityController =
      TextEditingController();
  final TextEditingController _userProfileAddressController =
      TextEditingController();
  final TextEditingController _userProfilePhoneController =
      TextEditingController();
  final TextEditingController _placeNameController = TextEditingController();
  final TextEditingController _placeCityController = TextEditingController();
  final TextEditingController _placeAddressController = TextEditingController();
  final TextEditingController _placeDescriptionController =
      TextEditingController();
  final TextEditingController _eventSeriesController = TextEditingController();
  final TextEditingController _eventCityController = TextEditingController();
  final TextEditingController _eventEditionController = TextEditingController();
  final TextEditingController _eventZoneController = TextEditingController();
  final TextEditingController _eventObservedAtController =
      TextEditingController();
  final TextEditingController _eventDescriptionController =
      TextEditingController();
  bool _showRegister = true;
  RegistrationKind _registrationKind = RegistrationKind.user;
  String? _authMessage;
  String? _userProfileMessage;
  PreparedPlaceImage? _profilePhotoDraft;
  PreparedPlaceImage? _eventPhotoDraft;
  bool _isSubmittingReport = false;
  String? _reportMessage;
  String? _eventMessage;
  final Map<SensoryKey, double> _ratings = {
    SensoryKey.noise: 2,
    SensoryKey.density: 2,
    SensoryKey.light: 2,
    SensoryKey.wait: 1,
  };
  final Map<EventSensoryKey, double> _eventRatings = {
    EventSensoryKey.noise: 3,
    EventSensoryKey.crowd: 3,
    EventSensoryKey.lighting: 3,
    EventSensoryKey.waitingTime: 3,
    EventSensoryKey.temperature: 3,
    EventSensoryKey.perceivedSafety: 3,
    EventSensoryKey.exitEase: 3,
  };

  @override
  void initState() {
    super.initState();
    _eventObservedAtController.text = _formatEventDateInput(DateTime.now());
    _startFirebaseInitialization();
    unawaited(_resolveGoogleMapsAvailability());
    unawaited(_locateDeviceOnLaunch());
    unawaited(_restoreLostImages());
  }

  @override
  void dispose() {
    _firebaseInitializationTimeout?.cancel();
    unawaited(_authSubscription?.cancel());
    _authEmailController.dispose();
    _authPasswordController.dispose();
    _authPasswordRepeatController.dispose();
    _authPublicNameController.dispose();
    _authCityController.dispose();
    _authBirthDateController.dispose();
    _notesController.dispose();
    _licenseNumberController.dispose();
    _professionalCollegeController.dispose();
    _specialtyController.dispose();
    _organizationDescriptionController.dispose();
    _organizationWebsiteController.dispose();
    _organizationRegistryController.dispose();
    _userProfileNameController.dispose();
    _userProfileCityController.dispose();
    _userProfileAddressController.dispose();
    _userProfilePhoneController.dispose();
    _placeNameController.dispose();
    _placeCityController.dispose();
    _placeAddressController.dispose();
    _placeDescriptionController.dispose();
    _eventSeriesController.dispose();
    _eventCityController.dispose();
    _eventEditionController.dispose();
    _eventZoneController.dispose();
    _eventObservedAtController.dispose();
    _eventDescriptionController.dispose();
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
            _firebaseInitializationTimeout?.cancel();
            _listenToAuth();
            unawaited(_loadPlaces());
            unawaited(_loadEventHistory());
          })
          .catchError((Object error, StackTrace stackTrace) {
            if (kDebugMode || kProfileMode) {
              debugPrint('Spectrum Firebase initialization error: $error');
              debugPrintStack(stackTrace: stackTrace);
            }
            if (!mounted) {
              return;
            }
            _firebaseInitializationTimeout?.cancel();
            setState(() {
              _firebaseReady = false;
              _authUnavailable = true;
            });
          }),
    );

    _firebaseInitializationTimeout?.cancel();
    _firebaseInitializationTimeout = Timer(const Duration(seconds: 8), () {
      if (!mounted || _firebaseReady) {
        return;
      }
      setState(() => _authUnavailable = true);
    });
  }

  Future<void> _loadUserProfile() async {
    try {
      final profile = await _service().loadCurrentUserProfile();
      setStateIfMounted(() {
        _userProfile = profile;
        final city = profile?.city?.trim();
        if (_eventCityController.text.trim().isEmpty &&
            city != null &&
            city.isNotEmpty) {
          _eventCityController.text = city;
        }
      });
      unawaited(_loadEventHistory());
    } catch (_) {
      setStateIfMounted(() => _userProfile = null);
    }
  }

  Future<void> _loadPlaces() async {
    if (_placesLoading) {
      _placesReloadQueued = true;
      return;
    }

    setStateIfMounted(() {
      _placesLoading = true;
    });

    try {
      final location = _deviceLocation;
      if (location == null) {
        _clearPlaces();
        return;
      }

      final places = await _service().searchNearbyPlaces(
        latitude: location.latitude,
        longitude: location.longitude,
        locale: _locale.name,
        radiusMeters: nearbyDiscoveryRadiusMeters,
        maxResultCount: nearbyDiscoveryMaxResults,
      );
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
      _clearPlaces();
    } finally {
      final reloadQueued = _placesReloadQueued;
      _placesReloadQueued = false;
      setStateIfMounted(() => _placesLoading = false);
      if (reloadQueued) {
        unawaited(_loadPlaces());
      }
    }
  }

  Future<void> _loadEventHistory() async {
    if (_eventsLoading || !_firebaseReady) {
      return;
    }

    setStateIfMounted(() => _eventsLoading = true);

    try {
      final location = _deviceLocation;
      final preferredCity = _eventCityController.text.trim().isNotEmpty
          ? _eventCityController.text.trim()
          : _userProfile?.city?.trim();
      final history = await _service().searchEventHistory(
        locale: _locale.name,
        latitude: location?.latitude,
        longitude: location?.longitude,
        city: preferredCity,
        radiusMeters: 10000,
        maxResultCount: 50,
      );
      if (!mounted) {
        return;
      }
      setState(() => _eventHistory = history);
      unawaited(_loadEventPhotoUrls(history));
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _eventHistory = const EventHistorySummary();
        _eventPhotoUrls = const {};
      });
    } finally {
      setStateIfMounted(() => _eventsLoading = false);
    }
  }

  Future<void> _loadEventPhotoUrls(EventHistorySummary history) async {
    final experiences = history.experiences
        .where((experience) => experience.photoPath.trim().isNotEmpty)
        .toList(growable: false);
    if (experiences.isEmpty) {
      setStateIfMounted(() => _eventPhotoUrls = const {});
      return;
    }

    final service = _service();
    final entries = await Future.wait(
      experiences.map((experience) async {
        try {
          final url = await service.eventExperiencePhotoUrl(
            photoPath: experience.photoPath,
          );
          if (url == null || url.isEmpty) {
            return null;
          }
          return MapEntry(experience.id, url);
        } catch (_) {
          return null;
        }
      }),
    );

    if (!mounted) {
      return;
    }
    setState(() {
      _eventPhotoUrls = {
        for (final entry in entries)
          if (entry != null) entry.key: entry.value,
      };
    });
  }

  void _clearPlaces() {
    setStateIfMounted(() {
      _places = const [];
      _selectedPlace = 0;
    });
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
      _qualifiedAccountCreated = false;
    });
  }

  void _openHome() {
    setState(() => _showHome = true);
  }

  bool _isValidEmail(String value) {
    return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value.trim());
  }

  DateTime? _parseBirthDate(String value) {
    final match = RegExp(r'^(\d{4})-(\d{2})-(\d{2})$').firstMatch(value.trim());
    if (match == null) {
      return null;
    }

    final year = int.tryParse(match.group(1)!);
    final month = int.tryParse(match.group(2)!);
    final day = int.tryParse(match.group(3)!);
    if (year == null || month == null || day == null) {
      return null;
    }

    final parsed = DateTime.utc(year, month, day);
    if (parsed.year != year || parsed.month != month || parsed.day != day) {
      return null;
    }
    return parsed;
  }

  bool _isAdultBirthDate(String value) {
    final birthDate = _parseBirthDate(value);
    if (birthDate == null) {
      return false;
    }

    final today = DateTime.now().toUtc();
    var age = today.year - birthDate.year;
    final hadBirthdayThisYear =
        today.month > birthDate.month ||
        (today.month == birthDate.month && today.day >= birthDate.day);
    if (!hadBirthdayThisYear) {
      age -= 1;
    }

    return age >= 18;
  }

  String? _birthDateValidationMessage(String value) {
    final labels = authCopies[_locale]!;
    if (_parseBirthDate(value) == null) {
      return labels.adultGateRequired;
    }
    return _isAdultBirthDate(value) ? null : labels.adultGateUnderage;
  }

  Future<void> _runAuthAction(
    Future<void> Function() action, {
    String? failureMessage,
  }) async {
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
        debugPrint('Spectrum auth error handled without user-facing details.');
        if (error is! FirebaseAuthException) {
          debugPrintStack(stackTrace: stackTrace);
        }
      }
      setStateIfMounted(
        () => _authMessage = failureMessage ?? _authMessageForError(error),
      );
    } finally {
      setStateIfMounted(() => _authSubmitting = false);
    }
  }

  String _authMessageForError(Object error) {
    final labels = authCopies[_locale]!;
    if (error is FirebaseAuthException) {
      return labels.authFailed;
    }
    if (error is PlatformException) {
      final code = error.code.toLowerCase();
      final message = '${error.message ?? ''} ${error.details ?? ''}'
          .toLowerCase();
      if (code.contains('cancel') || message.contains('cancel')) {
        return labels.authCancelled;
      }
    }
    final text = error.toString().toLowerCase();
    if (text.contains('cancel')) {
      return labels.authCancelled;
    }
    return labels.authFailed;
  }

  Future<void> _registerWithEmail() {
    final labels = authCopies[_locale]!;
    final publicName = _authPublicNameController.text.trim();
    final email = _authEmailController.text.trim();
    final password = _authPasswordController.text;
    final confirmPassword = _authPasswordRepeatController.text;
    final city = _authCityController.text.trim();
    final birthDate = _authBirthDateController.text.trim();
    final licenseNumber = _licenseNumberController.text.trim();
    final professionalCollege = _professionalCollegeController.text.trim();
    final specialty = _specialtyController.text.trim();
    final organizationDescription = _organizationDescriptionController.text
        .trim();
    final organizationWebsite = _organizationWebsiteController.text.trim();
    final organizationRegistry = _organizationRegistryController.text.trim();
    final isProfessional = _registrationKind == RegistrationKind.professional;
    final isOrganization = _registrationKind == RegistrationKind.organization;

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

    final birthDateMessage = _birthDateValidationMessage(birthDate);
    if (birthDateMessage != null) {
      setState(() => _authMessage = birthDateMessage);
      return Future<void>.value();
    }

    if (password.length < minimumPasswordLength) {
      setState(() => _authMessage = labels.passwordMinLength);
      return Future<void>.value();
    }

    if (password != confirmPassword) {
      setState(() => _authMessage = labels.passwordsMismatch);
      return Future<void>.value();
    }

    if (isProfessional &&
        (licenseNumber.isEmpty ||
            professionalCollege.isEmpty ||
            specialty.isEmpty)) {
      setState(() => _authMessage = labels.professionalFieldsRequired);
      return Future<void>.value();
    }

    if (isOrganization && (city.isEmpty || organizationDescription.isEmpty)) {
      setState(() => _authMessage = labels.organizationFieldsRequired);
      return Future<void>.value();
    }

    return _runAuthAction(() async {
      final service = _service();
      if (!_qualifiedAccountCreated) {
        await service.registerWithEmail(
          email: email,
          password: password,
          publicName: publicName,
          birthDate: birthDate,
          city: city,
          locale: _locale.name,
        );
      }
      if (isProfessional) {
        try {
          await service.requestProfessionalVerification(
            professionalName: publicName,
            licenseNumber: licenseNumber,
            professionalCollege: professionalCollege,
            specialty: specialty,
          );
        } catch (_) {
          setStateIfMounted(() {
            _qualifiedAccountCreated = true;
            _authMessage = labels.verificationRequestFailed;
          });
          return;
        }
        setStateIfMounted(() {
          _qualifiedAccountCreated = false;
          _authMessage = labels.professionalRegistrationSent;
        });
      } else if (isOrganization) {
        try {
          await service.requestOrganizationVerification(
            name: publicName,
            description: organizationDescription,
            city: city,
            website: organizationWebsite.isEmpty ? null : organizationWebsite,
            registryNumber: organizationRegistry.isEmpty
                ? null
                : organizationRegistry,
          );
        } catch (_) {
          setStateIfMounted(() {
            _qualifiedAccountCreated = true;
            _authMessage = labels.verificationRequestFailed;
          });
          return;
        }
        setStateIfMounted(() {
          _qualifiedAccountCreated = false;
          _authMessage = labels.organizationRegistrationSent;
        });
      } else {
        setStateIfMounted(() {
          _qualifiedAccountCreated = false;
          _authMessage = labels.verificationSent;
        });
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

  Future<void> _requestPasswordReset() {
    final labels = authCopies[_locale]!;
    final email = _authEmailController.text.trim();

    if (email.isEmpty) {
      setState(() => _authMessage = labels.requiredFields);
      return Future<void>.value();
    }

    if (!_isValidEmail(email)) {
      setState(() => _authMessage = labels.invalidEmail);
      return Future<void>.value();
    }

    return _runAuthAction(() async {
      await _service().requestPasswordReset(email: email, locale: _locale.name);
      setStateIfMounted(() => _authMessage = labels.passwordResetSent);
    }, failureMessage: labels.passwordResetFailed);
  }

  Future<void> _signInWithGoogle() {
    final birthDate = _showRegister
        ? _authBirthDateController.text.trim()
        : null;
    if (_showRegister) {
      final birthDateMessage = _birthDateValidationMessage(birthDate ?? '');
      if (birthDateMessage != null) {
        setState(() => _authMessage = birthDateMessage);
        return Future<void>.value();
      }
    }

    return _runAuthAction(() async {
      await _service().signInWithGoogle(
        locale: _locale.name,
        birthDate: birthDate,
      );
    });
  }

  Future<void> _signInWithApple() {
    final birthDate = _showRegister
        ? _authBirthDateController.text.trim()
        : null;
    if (_showRegister) {
      final birthDateMessage = _birthDateValidationMessage(birthDate ?? '');
      if (birthDateMessage != null) {
        setState(() => _authMessage = birthDateMessage);
        return Future<void>.value();
      }
    }

    return _runAuthAction(() async {
      await _service().signInWithApple(
        locale: _locale.name,
        birthDate: birthDate,
      );
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

  void _openUserProfileEditor() {
    final profile = _userProfile;
    if (profile == null || profile.isProfessional || profile.isOrganization) {
      return;
    }

    setState(() {
      _userProfileNameController.text = profile.publicName;
      _userProfileCityController.text = profile.city ?? '';
      _userProfileAddressController.text = profile.address ?? '';
      _userProfilePhoneController.text = profile.phone ?? '';
      _profilePhotoDraft = null;
      _userProfileMessage = null;
      _userProfileEditing = true;
    });
  }

  void _closeUserProfileEditor() {
    setState(() {
      _userProfileEditing = false;
      _profilePhotoDraft = null;
      _userProfileMessage = null;
    });
  }

  Future<void> _pickUserProfilePhotoFromGallery() async {
    final image = await _profileImagePicker.pickFromGallery();
    if (image == null) {
      return;
    }

    setStateIfMounted(() => _profilePhotoDraft = image);
  }

  Future<void> _takeUserProfilePhoto() async {
    final image = await _profileImagePicker.takePhoto();
    if (image == null) {
      return;
    }

    setStateIfMounted(() => _profilePhotoDraft = image);
  }

  Future<void> _saveUserProfile() async {
    if (_userProfileSubmitting) {
      return;
    }

    final labels = appCopies[_locale]!;
    final publicName = _userProfileNameController.text.trim();
    if (publicName.isEmpty) {
      setState(() => _userProfileMessage = labels.profileNameRequired);
      return;
    }

    setState(() {
      _userProfileSubmitting = true;
      _userProfileMessage = null;
    });

    try {
      final photo = _profilePhotoDraft;
      await _service().updateUserProfile(
        publicName: publicName,
        city: _userProfileCityController.text.trim(),
        address: _userProfileAddressController.text.trim(),
        phone: _userProfilePhoneController.text.trim(),
        profilePhotoBytes: photo?.bytes,
        profilePhotoFileName: photo?.fileName,
        profilePhotoContentType: photo?.contentType,
      );
      await _loadUserProfile();
      setStateIfMounted(() {
        _userProfileEditing = false;
        _profilePhotoDraft = null;
        _userProfileMessage = labels.profileSaved;
      });
    } catch (error, stackTrace) {
      if (kDebugMode || kProfileMode) {
        debugPrint('Spectrum profile update error: $error');
        debugPrintStack(stackTrace: stackTrace);
      }
      setStateIfMounted(() => _userProfileMessage = labels.profileSaveFailed);
    } finally {
      setStateIfMounted(() => _userProfileSubmitting = false);
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
        setStateIfMounted(() {
          _locationStatus = LocationStatus.unavailable;
          _places = const [];
          _selectedPlace = 0;
        });
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setStateIfMounted(() {
          _locationStatus = LocationStatus.denied;
          _places = const [];
          _selectedPlace = 0;
        });
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
      unawaited(_loadPlaces());
      unawaited(_loadEventHistory());
    } catch (_) {
      setStateIfMounted(() {
        _locationStatus = LocationStatus.error;
        _places = const [];
        _selectedPlace = 0;
      });
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

  Future<void> _pickEventPhotoFromGallery() {
    return _setEventPhoto(_imagePicker.pickFromGallery());
  }

  Future<void> _takeEventPhoto() {
    return _setEventPhoto(_imagePicker.takePhoto());
  }

  Future<void> _setEventPhoto(Future<PreparedPlaceImage?> pendingImage) async {
    try {
      final image = await pendingImage;
      if (!mounted || image == null) {
        return;
      }
      setState(() {
        _eventPhotoDraft = image;
        _eventMessage = null;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() => _eventMessage = appCopies[_locale]!.eventSubmitFailed);
    }
  }

  Future<void> _submitEventExperience(AppCopy labels) async {
    if (_isSubmittingEventExperience) {
      return;
    }

    setState(() {
      _isSubmittingEventExperience = true;
      _eventMessage = null;
    });

    try {
      final service = _service();
      if (!service.hasAuthenticatedUser) {
        if (mounted) {
          setState(() => _eventMessage = labels.uploadAuthRequired);
        }
        return;
      }

      final eventTitle = _eventSeriesController.text.trim();
      final city = _eventCityController.text.trim().isNotEmpty
          ? _eventCityController.text.trim()
          : (_userProfile?.city?.trim() ?? '');
      final zoneName = _eventZoneController.text.trim();
      final description = _eventDescriptionController.text.trim();
      final observedAt = _parseEventObservedAt(_eventObservedAtController.text);

      if (eventTitle.isEmpty ||
          city.isEmpty ||
          zoneName.isEmpty ||
          description.isEmpty ||
          observedAt == null) {
        if (mounted) {
          setState(() => _eventMessage = authCopies[_locale]!.requiredFields);
        }
        return;
      }

      final photo = _eventPhotoDraft;
      if (photo == null) {
        if (mounted) {
          setState(() => _eventMessage = labels.eventPhotoRequired);
        }
        return;
      }

      var location = _deviceLocation;
      if (location == null) {
        await _locateDeviceOnLaunch();
        location = _deviceLocation;
      }
      if (location == null) {
        if (mounted) {
          setState(() => _eventMessage = labels.eventLocationRequired);
        }
        return;
      }

      final editionTitle = _eventEditionController.text.trim().isNotEmpty
          ? _eventEditionController.text.trim()
          : '$eventTitle ${observedAt.year}';
      final seriesId =
          _matchingEventSeriesId(eventTitle, city) ??
          await service.createEventSeries(
            title: eventTitle,
            category: 'other',
            city: city,
            description: description,
          );
      final editionId =
          _matchingEventEditionId(seriesId, editionTitle, observedAt.year) ??
          await service.createEventEdition(
            eventSeriesId: seriesId,
            title: editionTitle,
            year: observedAt.year,
            startsAt: DateTime(observedAt.year),
            endsAt: DateTime(observedAt.year, 12, 31, 23, 59, 59),
          );
      final zoneId =
          _matchingEventZoneId(editionId, zoneName) ??
          await service.createEventZone(
            eventSeriesId: seriesId,
            eventEditionId: editionId,
            name: zoneName,
            latitude: location.latitude,
            longitude: location.longitude,
            radiusMeters: 150,
            description: description,
          );
      final experienceId = 'mobile-${DateTime.now().microsecondsSinceEpoch}';
      final photoPath = await service.uploadEventExperiencePhoto(
        experienceId: experienceId,
        bytes: photo.bytes,
        fileName: photo.fileName,
        contentType: photo.contentType,
      );

      await service.submitEventExperience(
        experienceId: experienceId,
        eventSeriesId: seriesId,
        eventEditionId: editionId,
        eventZoneId: zoneId,
        observedAt: observedAt,
        ratings: _eventRatings,
        description: description,
        photoPath: photoPath,
      );

      if (!mounted) {
        return;
      }
      setState(() {
        _eventPhotoDraft = null;
        _eventMessage = labels.eventSubmitSuccess;
        _eventDescriptionController.clear();
        _eventZoneController.clear();
        _eventEditionController.clear();
        _eventObservedAtController.text = _formatEventDateInput(DateTime.now());
        for (final key in EventSensoryKey.values) {
          _eventRatings[key] = 3;
        }
      });
      unawaited(_loadEventHistory());
    } catch (error, stackTrace) {
      if (kDebugMode || kProfileMode) {
        debugPrint('Spectrum event experience submit error: $error');
        debugPrintStack(stackTrace: stackTrace);
      }
      if (!mounted) {
        return;
      }
      setState(() => _eventMessage = labels.eventSubmitFailed);
    } finally {
      setStateIfMounted(() => _isSubmittingEventExperience = false);
    }
  }

  String? _matchingEventSeriesId(String title, String city) {
    final normalizedTitle = _normalizeEventText(title);
    final normalizedCity = _normalizeEventText(city);
    for (final series in _eventHistory.series) {
      if (_normalizeEventText(series.title) == normalizedTitle &&
          _normalizeEventText(series.city) == normalizedCity) {
        return series.id;
      }
    }
    return null;
  }

  String? _matchingEventEditionId(String seriesId, String title, int year) {
    final normalizedTitle = _normalizeEventText(title);
    for (final edition in _eventHistory.editions) {
      if (edition.eventSeriesId == seriesId &&
          edition.year == year &&
          _normalizeEventText(edition.title) == normalizedTitle) {
        return edition.id;
      }
    }
    return null;
  }

  String? _matchingEventZoneId(String editionId, String name) {
    final normalizedName = _normalizeEventText(name);
    for (final zone in _eventHistory.zones) {
      if (zone.eventEditionId == editionId &&
          _normalizeEventText(zone.name) == normalizedName) {
        return zone.id;
      }
    }
    return null;
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
      var placeId = place?.spectrumPlaceId;
      if (placeId == null) {
        if (place?.googlePlaceId != null) {
          var location = _deviceLocation;
          if (location == null) {
            await _locateDeviceOnLaunch();
            location = _deviceLocation;
          }
          if (location == null) {
            if (mounted) {
              setState(() => _reportMessage = labels.locationRequiredForPlace);
            }
            return;
          }

          placeId = await service.resolvePlaceForContribution(
            place: place!,
            locale: _locale.name,
            contributorLatitude: location.latitude,
            contributorLongitude: location.longitude,
            contributorAccuracyMeters: location.accuracyMeters,
          );
        }
      }

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
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        labels.appName,
                        maxLines: 1,
                        style: Theme.of(
                          context,
                        ).textTheme.titleLarge?.copyWith(fontSize: 18),
                      ),
                      const SizedBox(width: 8),
                      _BetaBadge(label: labels.betaLabel),
                    ],
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
            onSelected: (locale) {
              setState(() => _locale = locale);
              unawaited(_loadPlaces());
              unawaited(_loadEventHistory());
            },
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
      case MobileTab.events:
        return EventsScreen(
          key: const ValueKey('events'),
          labels: labels,
          authLabels: authLabels,
          locale: _locale,
          history: _eventHistory,
          photoUrls: _eventPhotoUrls,
          isLoading: _eventsLoading,
          isAuthenticated: isAuthenticated,
          seriesController: _eventSeriesController,
          cityController: _eventCityController,
          editionController: _eventEditionController,
          zoneController: _eventZoneController,
          observedAtController: _eventObservedAtController,
          descriptionController: _eventDescriptionController,
          ratings: _eventRatings,
          photoDraft: _eventPhotoDraft,
          isSubmitting: _isSubmittingEventExperience,
          message: _eventMessage,
          onRefresh: _loadEventHistory,
          onRatingChanged: (key, value) =>
              setState(() => _eventRatings[key] = value),
          onPickFromGallery: _pickEventPhotoFromGallery,
          onTakePhoto: _takeEventPhoto,
          onRemovePhoto: () => setState(() => _eventPhotoDraft = null),
          onSubmit: () => _submitEventExperience(labels),
          onSignIn: () => _openAuthScreen(),
        );
      case MobileTab.contribute:
        if (!isAuthenticated || _qualifiedAccountCreated) {
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
        return HelpScreen(key: const ValueKey('support'), labels: labels);
      case MobileTab.profiles:
        return ProfilesScreen(
          key: const ValueKey('profiles'),
          labels: labels,
          authLabels: authLabels,
          locale: _locale,
          isAuthenticated: isAuthenticated,
          userProfile: _userProfile,
          isUserProfileEditing: _userProfileEditing,
          isUserProfileSubmitting: _userProfileSubmitting,
          userProfileMessage: _userProfileMessage,
          userProfileNameController: _userProfileNameController,
          userProfileCityController: _userProfileCityController,
          userProfileAddressController: _userProfileAddressController,
          userProfilePhoneController: _userProfilePhoneController,
          profilePhotoDraft: _profilePhotoDraft,
          onEditUserProfile: _openUserProfileEditor,
          onCancelUserProfileEdit: _closeUserProfileEditor,
          onPickUserProfilePhoto: _pickUserProfilePhotoFromGallery,
          onTakeUserProfilePhoto: _takeUserProfilePhoto,
          onSaveUserProfile: _saveUserProfile,
        );
    }
  }

  Widget _protectedAuthScreen(AppCopy labels, AuthCopy authLabels) {
    return AuthScreen(
      key: const ValueKey('protected-auth'),
      authLabels: authLabels,
      showRegister: _showRegister,
      isSubmitting: _authSubmitting,
      authUnavailable: _authUnavailable,
      verificationRetryPending: _qualifiedAccountCreated,
      message: _authMessage,
      emailController: _authEmailController,
      passwordController: _authPasswordController,
      passwordRepeatController: _authPasswordRepeatController,
      publicNameController: _authPublicNameController,
      cityController: _authCityController,
      birthDateController: _authBirthDateController,
      licenseNumberController: _licenseNumberController,
      professionalCollegeController: _professionalCollegeController,
      specialtyController: _specialtyController,
      organizationDescriptionController: _organizationDescriptionController,
      organizationWebsiteController: _organizationWebsiteController,
      organizationRegistryController: _organizationRegistryController,
      registrationKind: _registrationKind,
      standalone: false,
      onToggleMode: () => setState(() {
        _showRegister = !_showRegister;
        _qualifiedAccountCreated = false;
      }),
      onRegistrationKindChanged: (kind) => setState(() {
        _registrationKind = kind;
        _qualifiedAccountCreated = false;
        _authMessage = null;
      }),
      onEmailSubmit: _showRegister ? _registerWithEmail : _signInWithEmail,
      onPasswordReset: _requestPasswordReset,
      onGoogle: _signInWithGoogle,
      onApple: _signInWithApple,
    );
  }
}

class AuthScreen extends StatelessWidget {
  const AuthScreen({
    required this.authLabels,
    required this.showRegister,
    required this.isSubmitting,
    required this.authUnavailable,
    required this.verificationRetryPending,
    required this.message,
    required this.emailController,
    required this.passwordController,
    required this.passwordRepeatController,
    required this.publicNameController,
    required this.cityController,
    required this.birthDateController,
    required this.licenseNumberController,
    required this.professionalCollegeController,
    required this.specialtyController,
    required this.organizationDescriptionController,
    required this.organizationWebsiteController,
    required this.organizationRegistryController,
    required this.registrationKind,
    required this.onToggleMode,
    required this.onRegistrationKindChanged,
    required this.onEmailSubmit,
    required this.onPasswordReset,
    required this.onGoogle,
    required this.onApple,
    this.standalone = true,
    super.key,
  });

  final AuthCopy authLabels;
  final bool showRegister;
  final bool isSubmitting;
  final bool authUnavailable;
  final bool verificationRetryPending;
  final String? message;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController passwordRepeatController;
  final TextEditingController publicNameController;
  final TextEditingController cityController;
  final TextEditingController birthDateController;
  final TextEditingController licenseNumberController;
  final TextEditingController professionalCollegeController;
  final TextEditingController specialtyController;
  final TextEditingController organizationDescriptionController;
  final TextEditingController organizationWebsiteController;
  final TextEditingController organizationRegistryController;
  final RegistrationKind registrationKind;
  final VoidCallback onToggleMode;
  final ValueChanged<RegistrationKind> onRegistrationKindChanged;
  final VoidCallback onEmailSubmit;
  final VoidCallback onPasswordReset;
  final VoidCallback onGoogle;
  final VoidCallback onApple;
  final bool standalone;

  @override
  Widget build(BuildContext context) {
    final professionalRegister =
        showRegister && registrationKind == RegistrationKind.professional;
    final organizationRegister =
        showRegister && registrationKind == RegistrationKind.organization;
    final qualifiedRegister = professionalRegister || organizationRegister;
    final nameLabel = professionalRegister
        ? authLabels.professionalPublicName
        : organizationRegister
        ? authLabels.organizationName
        : authLabels.publicName;
    final cityLabel = organizationRegister
        ? authLabels.organizationCity
        : authLabels.cityOptional;
    final content = SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 22, 20, 32),
        children: [
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
                      ButtonSegment(
                        value: RegistrationKind.organization,
                        label: Text(authLabels.organizationAccount),
                        icon: const Icon(Icons.groups_outlined),
                      ),
                    ],
                    selected: {registrationKind},
                    onSelectionChanged: (values) =>
                        onRegistrationKindChanged(values.first),
                  ),
                  const SizedBox(height: 18),
                  TextField(
                    controller: birthDateController,
                    keyboardType: TextInputType.datetime,
                    decoration: InputDecoration(
                      labelText: authLabels.birthDate,
                      hintText: authLabels.birthDateHint,
                    ),
                  ),
                  const SizedBox(height: 18),
                ],
                if (qualifiedRegister) ...[
                  StatusMessage(
                    message: professionalRegister
                        ? authLabels.professionalRegisterIntro
                        : authLabels.organizationRegisterIntro,
                  ),
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
                    decoration: InputDecoration(labelText: nameLabel),
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
                if (!showRegister) ...[
                  const SizedBox(height: 6),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton.icon(
                      onPressed: isSubmitting || authUnavailable
                          ? null
                          : onPasswordReset,
                      icon: const Icon(Icons.lock_reset_outlined, size: 18),
                      label: Text(authLabels.forgotPassword),
                    ),
                  ),
                ],
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
                    decoration: InputDecoration(labelText: cityLabel),
                  ),
                  if (professionalRegister) ...[
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
                  if (organizationRegister) ...[
                    const SizedBox(height: 12),
                    TextField(
                      controller: organizationDescriptionController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: authLabels.organizationDescription,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: organizationWebsiteController,
                      keyboardType: TextInputType.url,
                      decoration: InputDecoration(
                        labelText: authLabels.organizationWebsite,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: organizationRegistryController,
                      decoration: InputDecoration(
                        labelText: authLabels.organizationRegistryNumber,
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
                    showRegister && verificationRetryPending
                        ? authLabels.retryVerification
                        : showRegister
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

class EventsScreen extends StatelessWidget {
  const EventsScreen({
    required this.labels,
    required this.authLabels,
    required this.locale,
    required this.history,
    required this.photoUrls,
    required this.isLoading,
    required this.isAuthenticated,
    required this.seriesController,
    required this.cityController,
    required this.editionController,
    required this.zoneController,
    required this.observedAtController,
    required this.descriptionController,
    required this.ratings,
    required this.photoDraft,
    required this.isSubmitting,
    required this.message,
    required this.onRefresh,
    required this.onRatingChanged,
    required this.onPickFromGallery,
    required this.onTakePhoto,
    required this.onRemovePhoto,
    required this.onSubmit,
    required this.onSignIn,
    super.key,
  });

  final AppCopy labels;
  final AuthCopy authLabels;
  final LocaleOption locale;
  final EventHistorySummary history;
  final Map<String, String> photoUrls;
  final bool isLoading;
  final bool isAuthenticated;
  final TextEditingController seriesController;
  final TextEditingController cityController;
  final TextEditingController editionController;
  final TextEditingController zoneController;
  final TextEditingController observedAtController;
  final TextEditingController descriptionController;
  final Map<EventSensoryKey, double> ratings;
  final PreparedPlaceImage? photoDraft;
  final bool isSubmitting;
  final String? message;
  final Future<void> Function() onRefresh;
  final void Function(EventSensoryKey key, double value) onRatingChanged;
  final VoidCallback onPickFromGallery;
  final VoidCallback onTakePhoto;
  final VoidCallback onRemovePhoto;
  final VoidCallback onSubmit;
  final VoidCallback onSignIn;

  @override
  Widget build(BuildContext context) {
    final seriesById = {for (final series in history.series) series.id: series};
    final editionsById = {
      for (final edition in history.editions) edition.id: edition,
    };
    final zonesById = {for (final zone in history.zones) zone.id: zone};

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  labels.eventHistoryTitle,
                  style: Theme.of(context).textTheme.displayLarge,
                ),
              ),
              IconButton(
                tooltip: labels.viewAll,
                onPressed: isLoading ? null : onRefresh,
                icon: isLoading
                    ? const SizedBox.square(
                        dimension: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh_outlined),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            labels.eventHistoryIntro,
            style: TextStyle(
              color: mutedColor(context),
              fontSize: 16,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 22),
          if (history.experiences.isEmpty)
            SpectrumPanel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.event_busy_outlined,
                    color: SpectrumColors.tertiary,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    labels.noEventsTitle,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    labels.noEventsBody,
                    style: TextStyle(color: mutedColor(context), height: 1.45),
                  ),
                ],
              ),
            )
          else
            for (final experience in history.experiences)
              Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: EventExperienceCard(
                  labels: labels,
                  locale: locale,
                  experience: experience,
                  series: seriesById[experience.eventSeriesId],
                  edition: editionsById[experience.eventEditionId],
                  zone: zonesById[experience.eventZoneId],
                  photoUrl: photoUrls[experience.id],
                ),
              ),
          const SizedBox(height: 18),
          if (!isAuthenticated)
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
                    onPressed: onSignIn,
                    icon: const Icon(Icons.login_outlined),
                    label: Text(authLabels.signInToContinue),
                  ),
                ],
              ),
            )
          else
            EventExperienceForm(
              labels: labels,
              locale: locale,
              seriesController: seriesController,
              cityController: cityController,
              editionController: editionController,
              zoneController: zoneController,
              observedAtController: observedAtController,
              descriptionController: descriptionController,
              ratings: ratings,
              photoDraft: photoDraft,
              isSubmitting: isSubmitting,
              message: message,
              onRatingChanged: onRatingChanged,
              onPickFromGallery: onPickFromGallery,
              onTakePhoto: onTakePhoto,
              onRemovePhoto: onRemovePhoto,
              onSubmit: onSubmit,
            ),
        ],
      ),
    );
  }
}

class EventExperienceCard extends StatelessWidget {
  const EventExperienceCard({
    required this.labels,
    required this.locale,
    required this.experience,
    required this.series,
    required this.edition,
    required this.zone,
    required this.photoUrl,
    super.key,
  });

  final AppCopy labels;
  final LocaleOption locale;
  final EventExperienceSummary experience;
  final EventSeriesSummary? series;
  final EventEditionSummary? edition;
  final EventZoneSummary? zone;
  final String? photoUrl;

  @override
  Widget build(BuildContext context) {
    return SpectrumPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: photoUrl == null
                  ? DecoratedBox(
                      decoration: BoxDecoration(color: softPanelColor(context)),
                      child: const Center(
                        child: Icon(Icons.image_outlined, size: 34),
                      ),
                    )
                  : Image.network(photoUrl!, fit: BoxFit.cover),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            series?.title ?? labels.eventHistoryTitle,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 4),
          Text(
            [
              if (edition?.title.trim().isNotEmpty == true) edition!.title,
              if (zone?.name.trim().isNotEmpty == true) zone!.name,
              _formatEventDisplayDate(experience.observedAt),
            ].where((part) => part.trim().isNotEmpty).join(' · '),
            style: TextStyle(color: mutedColor(context), height: 1.35),
          ),
          if (experience.description.trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(experience.description, style: const TextStyle(height: 1.45)),
          ],
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: EventSensoryKey.values.map((key) {
              final value = experience.ratings[key]?.round() ?? 3;
              return Chip(
                visualDensity: VisualDensity.compact,
                label: Text('${eventSensoryLabel(locale, key)} $value/5'),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class EventExperienceForm extends StatelessWidget {
  const EventExperienceForm({
    required this.labels,
    required this.locale,
    required this.seriesController,
    required this.cityController,
    required this.editionController,
    required this.zoneController,
    required this.observedAtController,
    required this.descriptionController,
    required this.ratings,
    required this.photoDraft,
    required this.isSubmitting,
    required this.message,
    required this.onRatingChanged,
    required this.onPickFromGallery,
    required this.onTakePhoto,
    required this.onRemovePhoto,
    required this.onSubmit,
    super.key,
  });

  final AppCopy labels;
  final LocaleOption locale;
  final TextEditingController seriesController;
  final TextEditingController cityController;
  final TextEditingController editionController;
  final TextEditingController zoneController;
  final TextEditingController observedAtController;
  final TextEditingController descriptionController;
  final Map<EventSensoryKey, double> ratings;
  final PreparedPlaceImage? photoDraft;
  final bool isSubmitting;
  final String? message;
  final void Function(EventSensoryKey key, double value) onRatingChanged;
  final VoidCallback onPickFromGallery;
  final VoidCallback onTakePhoto;
  final VoidCallback onRemovePhoto;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return SpectrumPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            labels.eventExperienceTitle,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: seriesController,
            decoration: InputDecoration(labelText: labels.eventSeriesName),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: cityController,
            decoration: InputDecoration(labelText: labels.placeCity),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: editionController,
            decoration: InputDecoration(labelText: labels.eventEditionName),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: zoneController,
            decoration: InputDecoration(labelText: labels.eventZoneName),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: observedAtController,
            keyboardType: TextInputType.datetime,
            decoration: InputDecoration(
              labelText: labels.eventObservedAt,
              hintText: '2027-08-28 20:30',
            ),
          ),
          const SizedBox(height: 18),
          SinglePhotoUploadBox(
            labels: labels,
            photoDraft: photoDraft,
            onPickFromGallery: onPickFromGallery,
            onTakePhoto: onTakePhoto,
            onRemovePhoto: onRemovePhoto,
          ),
          const SizedBox(height: 24),
          for (final key in EventSensoryKey.values)
            SensoryControl(
              label: eventSensoryLabel(locale, key),
              word: eventSensoryWord(locale, key, ratings[key]!.round()),
              value: ratings[key]!,
              onChanged: (value) => onRatingChanged(key, value),
            ),
          Text(
            labels.eventDescription,
            style: Theme.of(context).textTheme.labelLarge,
          ),
          const SizedBox(height: 10),
          TextField(
            controller: descriptionController,
            minLines: 5,
            maxLines: 8,
            decoration: InputDecoration(hintText: labels.notesHint),
          ),
          if (message != null) ...[
            const SizedBox(height: 12),
            StatusMessage(message: message!),
          ],
          const SizedBox(height: 16),
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
    );
  }
}

class SinglePhotoUploadBox extends StatelessWidget {
  const SinglePhotoUploadBox({
    required this.labels,
    required this.photoDraft,
    required this.onPickFromGallery,
    required this.onTakePhoto,
    required this.onRemovePhoto,
    super.key,
  });

  final AppCopy labels;
  final PreparedPlaceImage? photoDraft;
  final VoidCallback onPickFromGallery;
  final VoidCallback onTakePhoto;
  final VoidCallback onRemovePhoto;

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
                  child: Text(
                    labels.eventPhoto,
                    style: const TextStyle(fontWeight: FontWeight.w800),
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
            if (photoDraft != null) ...[
              const SizedBox(height: 14),
              PreparedImageRow(
                image: photoDraft!,
                labels: labels,
                onRemove: onRemovePhoto,
              ),
            ],
          ],
        ),
      ),
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
  const HelpScreen({required this.labels, super.key});

  final AppCopy labels;

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
    required this.isUserProfileEditing,
    required this.isUserProfileSubmitting,
    required this.userProfileMessage,
    required this.userProfileNameController,
    required this.userProfileCityController,
    required this.userProfileAddressController,
    required this.userProfilePhoneController,
    required this.profilePhotoDraft,
    required this.onEditUserProfile,
    required this.onCancelUserProfileEdit,
    required this.onPickUserProfilePhoto,
    required this.onTakeUserProfilePhoto,
    required this.onSaveUserProfile,
    super.key,
  });

  final AppCopy labels;
  final AuthCopy authLabels;
  final LocaleOption locale;
  final bool isAuthenticated;
  final SpectrumUserProfile? userProfile;
  final bool isUserProfileEditing;
  final bool isUserProfileSubmitting;
  final String? userProfileMessage;
  final TextEditingController userProfileNameController;
  final TextEditingController userProfileCityController;
  final TextEditingController userProfileAddressController;
  final TextEditingController userProfilePhoneController;
  final PreparedPlaceImage? profilePhotoDraft;
  final VoidCallback onEditUserProfile;
  final VoidCallback onCancelUserProfileEdit;
  final VoidCallback onPickUserProfilePhoto;
  final VoidCallback onTakeUserProfilePhoto;
  final VoidCallback onSaveUserProfile;

  @override
  Widget build(BuildContext context) {
    final canEditUserProfile =
        userProfile != null &&
        !userProfile!.isProfessional &&
        !userProfile!.isOrganization;
    final userProfileBody = [
      userProfile?.publicName ?? 'Spectrum user',
      userProfile?.city ?? authLabels.cityOptional,
    ].where((part) => part.trim().isNotEmpty).join(' · ');

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
            body: userProfileBody,
            imageUrl: userProfile?.profilePhotoUrl,
            action: canEditUserProfile ? labels.editUserProfile : null,
            onTap: canEditUserProfile ? onEditUserProfile : null,
          ),
          if (isUserProfileEditing && canEditUserProfile) ...[
            const SizedBox(height: 14),
            UserProfileEditor(
              labels: labels,
              authLabels: authLabels,
              userProfile: userProfile!,
              profilePhotoDraft: profilePhotoDraft,
              nameController: userProfileNameController,
              cityController: userProfileCityController,
              addressController: userProfileAddressController,
              phoneController: userProfilePhoneController,
              isSubmitting: isUserProfileSubmitting,
              message: userProfileMessage,
              onPickPhoto: onPickUserProfilePhoto,
              onTakePhoto: onTakeUserProfilePhoto,
              onSave: onSaveUserProfile,
              onCancel: onCancelUserProfileEdit,
            ),
          ] else if (userProfileMessage != null) ...[
            const SizedBox(height: 12),
            StatusMessage(message: userProfileMessage!),
          ],
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
      _NavItem(MobileTab.events, Icons.event_available_outlined, labels.events),
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
              ScoreBadge(
                value: place.score,
                hasSpectrumData: place.hasSpectrumData,
              ),
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
          if (place.hasSpectrumData)
            Row(
              children: [
                Text(
                  place.score.toStringAsFixed(1),
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(width: 8),
                const Icon(Icons.star, color: SpectrumColors.tertiary),
              ],
            )
          else
            StatusMessage(message: labels.noSpectrumRatings),
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
    final spectrumStatus = place.hasSpectrumData
        ? place.quietDb
        : labels.noSpectrumRatings;
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
                '${localizedPlaceArea(locale, place)} · $spectrumStatus',
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

String _normalizeEventText(String value) {
  return value.trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ');
}

DateTime? _parseEventObservedAt(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) {
    return null;
  }
  final normalized = trimmed.contains('T')
      ? trimmed
      : trimmed.replaceFirst(RegExp(r'\s+'), 'T');
  return DateTime.tryParse(normalized);
}

String _formatEventDateInput(DateTime value) {
  final local = value.toLocal();
  return '${local.year.toString().padLeft(4, '0')}-'
      '${local.month.toString().padLeft(2, '0')}-'
      '${local.day.toString().padLeft(2, '0')} '
      '${local.hour.toString().padLeft(2, '0')}:'
      '${local.minute.toString().padLeft(2, '0')}';
}

String _formatEventDisplayDate(String value) {
  final parsed = DateTime.tryParse(value);
  if (parsed == null) {
    return value;
  }
  return _formatEventDateInput(parsed.toLocal());
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

class UserProfileEditor extends StatelessWidget {
  const UserProfileEditor({
    required this.labels,
    required this.authLabels,
    required this.userProfile,
    required this.profilePhotoDraft,
    required this.nameController,
    required this.cityController,
    required this.addressController,
    required this.phoneController,
    required this.isSubmitting,
    required this.message,
    required this.onPickPhoto,
    required this.onTakePhoto,
    required this.onSave,
    required this.onCancel,
    super.key,
  });

  final AppCopy labels;
  final AuthCopy authLabels;
  final SpectrumUserProfile userProfile;
  final PreparedPlaceImage? profilePhotoDraft;
  final TextEditingController nameController;
  final TextEditingController cityController;
  final TextEditingController addressController;
  final TextEditingController phoneController;
  final bool isSubmitting;
  final String? message;
  final VoidCallback onPickPhoto;
  final VoidCallback onTakePhoto;
  final VoidCallback onSave;
  final VoidCallback onCancel;

  @override
  Widget build(BuildContext context) {
    final draft = profilePhotoDraft;
    final existingPhoto = userProfile.profilePhotoUrl;
    final ImageProvider<Object>? imageProvider;
    if (draft != null) {
      imageProvider = MemoryImage(draft.bytes);
    } else if (existingPhoto != null) {
      imageProvider = NetworkImage(existingPhoto);
    } else {
      imageProvider = null;
    }

    return SpectrumPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SectionHeading(title: labels.editUserProfile, action: labels.close),
          const SizedBox(height: 14),
          Align(
            alignment: Alignment.centerLeft,
            child: CircleAvatar(
              radius: 38,
              backgroundColor: SpectrumColors.secondary.withValues(alpha: 0.14),
              backgroundImage: imageProvider,
              child: imageProvider == null
                  ? const Icon(Icons.person_outline, size: 34)
                  : null,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            labels.profilePhoto,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: isSubmitting ? null : onTakePhoto,
                  icon: const Icon(Icons.photo_camera_outlined),
                  label: Text(labels.takePhoto),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: isSubmitting ? null : onPickPhoto,
                  icon: const Icon(Icons.photo_library_outlined),
                  label: Text(labels.chooseFromGallery),
                ),
              ),
            ],
          ),
          if (draft != null) ...[
            const SizedBox(height: 10),
            StatusMessage(
              message: '${labels.selectedImages}: ${draft.originalName}',
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: nameController,
            decoration: InputDecoration(labelText: authLabels.publicName),
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: cityController,
            decoration: InputDecoration(labelText: authLabels.cityOptional),
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: addressController,
            decoration: InputDecoration(labelText: labels.profileAddress),
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: phoneController,
            keyboardType: TextInputType.phone,
            decoration: InputDecoration(labelText: labels.profilePhone),
            textInputAction: TextInputAction.done,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: isSubmitting ? null : onCancel,
                  child: Text(labels.close),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: isSubmitting ? null : onSave,
                  icon: isSubmitting
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.save_outlined),
                  label: Text(labels.saveProfile),
                ),
              ),
            ],
          ),
          if (message != null) ...[
            const SizedBox(height: 12),
            StatusMessage(message: message!),
          ],
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
    this.imageUrl,
    this.action,
    this.onTap,
    super.key,
  });

  final IconData icon;
  final String title;
  final String body;
  final String? imageUrl;
  final String? action;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (imageUrl != null)
          CircleAvatar(radius: 28, backgroundImage: NetworkImage(imageUrl!))
        else
          Icon(icon, color: SpectrumColors.tertiary),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(title, style: Theme.of(context).textTheme.titleLarge),
            ),
            if (action != null) ...[
              const SizedBox(width: 12),
              Text(
                action!,
                style: TextStyle(
                  color: SpectrumColors.tertiary,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 8),
        Text(body, style: TextStyle(color: mutedColor(context), height: 1.45)),
      ],
    );

    return SpectrumPanel(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: content,
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
  const ScoreBadge({
    required this.value,
    required this.hasSpectrumData,
    super.key,
  });

  final double value;
  final bool hasSpectrumData;

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
          hasSpectrumData ? value.toStringAsFixed(1) : 'Spectrum',
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
