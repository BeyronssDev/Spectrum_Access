import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SpectrumThemePreferences {
  static const themeModeKey = 'spectrum_access.theme_mode';

  static Future<ThemeMode> loadThemeMode() async {
    try {
      final preferences = await SharedPreferences.getInstance();

      return _themeModeFromPreference(preferences.getString(themeModeKey));
    } catch (_) {
      return ThemeMode.light;
    }
  }

  static Future<void> saveThemeMode(ThemeMode themeMode) async {
    try {
      final preferences = await SharedPreferences.getInstance();
      await preferences.setString(
        themeModeKey,
        _themeModeToPreference(themeMode),
      );
    } catch (_) {}
  }

  static ThemeMode _themeModeFromPreference(String? value) {
    return switch (value) {
      'dark' => ThemeMode.dark,
      'system' => ThemeMode.system,
      _ => ThemeMode.light,
    };
  }

  static String _themeModeToPreference(ThemeMode themeMode) {
    return switch (themeMode) {
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
      ThemeMode.light => 'light',
    };
  }
}
