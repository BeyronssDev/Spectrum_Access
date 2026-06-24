import 'dart:async';

import 'package:flutter/material.dart';

import 'spectrum_application_service.dart';
import 'spectrum_shell.dart';
import 'spectrum_theme.dart';
import 'theme_preferences.dart';

export 'mobile_state.dart';
export 'place_helpers.dart';
export 'spectrum_application_service.dart';
export 'theme_preferences.dart';

class SpectrumAccessApp extends StatefulWidget {
  const SpectrumAccessApp({
    super.key,
    this.firebaseInitialization,
    this.initialThemeMode = ThemeMode.light,
    this.createApplicationService,
  });

  final Future<void>? firebaseInitialization;
  final ThemeMode initialThemeMode;
  final SpectrumApplicationService Function()? createApplicationService;

  @override
  State<SpectrumAccessApp> createState() => _SpectrumAccessAppState();
}

class _SpectrumAccessAppState extends State<SpectrumAccessApp> {
  late ThemeMode _themeMode;

  @override
  void initState() {
    super.initState();
    _themeMode = widget.initialThemeMode;
  }

  void _changeThemeMode(ThemeMode themeMode) {
    if (_themeMode == themeMode) {
      return;
    }

    setState(() => _themeMode = themeMode);
    unawaited(SpectrumThemePreferences.saveThemeMode(themeMode));
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Spectrum Access',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: buildSpectrumTheme(Brightness.light),
      darkTheme: buildSpectrumTheme(Brightness.dark),
      home: SpectrumShell(
        firebaseInitialization: widget.firebaseInitialization,
        themeMode: _themeMode,
        createApplicationService: widget.createApplicationService,
        onThemeModeChanged: _changeThemeMode,
      ),
    );
  }
}
