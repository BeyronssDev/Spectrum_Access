import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

const googleMapsRequested = bool.fromEnvironment(
  'SPECTRUM_GOOGLE_MAPS_ENABLED',
  defaultValue: true,
);
const _nativeConfigChannel = MethodChannel('spectrum_access/native_config');

Future<bool> resolveGoogleMapsAvailability() async {
  if (!googleMapsRequested) {
    return false;
  }

  if (kIsWeb) {
    return true;
  }

  try {
    return await _nativeConfigChannel.invokeMethod<bool>(
          'hasGoogleMapsApiKey',
        ) ??
        false;
  } catch (_) {
    return false;
  }
}
