enum LocationStatus { idle, locating, located, denied, unavailable, error }

enum RegistrationKind { user, professional }

class DeviceLocation {
  const DeviceLocation({
    required this.latitude,
    required this.longitude,
    required this.accuracyMeters,
  });

  final double latitude;
  final double longitude;
  final double accuracyMeters;
}
