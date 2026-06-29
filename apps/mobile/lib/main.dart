import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'firebase_options.dart';
import 'spectrum_app.dart';

const _webAppCheckSiteKey = String.fromEnvironment(
  'FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY',
);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final initialThemeMode = await SpectrumThemePreferences.loadThemeMode();

  runApp(
    SpectrumAccessApp(
      firebaseInitialization: _initializeFirebase(),
      initialThemeMode: initialThemeMode,
    ),
  );
}

Future<void> _initializeFirebase() async {
  try {
    if (Firebase.apps.isEmpty) {
      if (kIsWeb) {
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
      } else {
        await Firebase.initializeApp();
      }
    }
    await _activateFirebaseAppCheck();
  } on FirebaseException catch (error) {
    if (error.code != 'duplicate-app') {
      rethrow;
    }
  }
}

Future<void> _activateFirebaseAppCheck() async {
  if (kIsWeb && _webAppCheckSiteKey.isEmpty) {
    return;
  }

  await FirebaseAppCheck.instance.activate(
    providerWeb: kIsWeb ? ReCaptchaV3Provider(_webAppCheckSiteKey) : null,
    providerAndroid: kDebugMode
        ? const AndroidDebugProvider()
        : const AndroidPlayIntegrityProvider(),
    providerApple: kDebugMode
        ? const AppleDebugProvider()
        : const AppleAppAttestWithDeviceCheckFallbackProvider(),
  );
}
