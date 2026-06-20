import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';

class SpectrumColors {
  const SpectrumColors._();

  static const surface = Color(0xFFFCF8F8);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFF6F3F2);
  static const surfaceContainer = Color(0xFFF1EDED);
  static const surfaceContainerHigh = Color(0xFFEBE7E7);
  static const surfaceContainerHighest = Color(0xFFE5E2E1);
  static const onSurface = Color(0xFF1C1B1B);
  static const onSurfaceVariant = Color(0xFF44474A);
  static const outline = Color(0xFF75777A);
  static const outlineVariant = Color(0xFFC5C6CA);
  static const primary = Color(0xFF000101);
  static const onPrimary = Color(0xFFFFFFFF);
  static const primaryContainer = Color(0xFF1A1C1E);
  static const secondary = Color(0xFF545F72);
  static const secondaryContainer = Color(0xFFD5E0F7);
  static const tertiary = Color(0xFF735C00);
  static const tertiaryContainer = Color(0xFFCCA730);
  static const darkSurface = Color(0xFF1A1C1E);
  static const darkContainer = Color(0xFF313030);
  static const darkOnSurface = Color(0xFFF4F0EF);
  static const darkSecondary = Color(0xFFC6C6C9);
}

ThemeData buildSpectrumTheme(Brightness brightness) {
  final isDark = brightness == Brightness.dark;
  final textColor = isDark
      ? SpectrumColors.darkOnSurface
      : SpectrumColors.onSurface;
  final mutedColor = isDark
      ? SpectrumColors.darkSecondary
      : SpectrumColors.secondary;
  final surface = isDark ? SpectrumColors.darkSurface : SpectrumColors.surface;
  final container = isDark
      ? SpectrumColors.darkContainer
      : SpectrumColors.surfaceContainerLowest;

  final baseText = GoogleFonts.montserratTextTheme(
    ThemeData(brightness: brightness).textTheme,
  ).apply(bodyColor: textColor, displayColor: textColor);

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    scaffoldBackgroundColor: surface,
    colorScheme: ColorScheme(
      brightness: brightness,
      primary: isDark ? SpectrumColors.onPrimary : SpectrumColors.primary,
      onPrimary: isDark ? SpectrumColors.primary : SpectrumColors.onPrimary,
      secondary: mutedColor,
      onSecondary: SpectrumColors.onPrimary,
      error: const Color(0xFFBA1A1A),
      onError: SpectrumColors.onPrimary,
      surface: container,
      onSurface: textColor,
    ),
    textTheme: baseText.copyWith(
      displayLarge: GoogleFonts.playfairDisplay(
        fontSize: 44,
        height: 1.08,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      headlineLarge: GoogleFonts.playfairDisplay(
        fontSize: 36,
        height: 1.12,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      headlineMedium: GoogleFonts.playfairDisplay(
        fontSize: 28,
        height: 1.16,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      titleLarge: GoogleFonts.playfairDisplay(
        fontSize: 24,
        height: 1.18,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
      labelLarge: GoogleFonts.montserrat(
        fontSize: 12,
        height: 1.2,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
        color: mutedColor,
      ),
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      backgroundColor: surface,
      foregroundColor: textColor,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: container,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: isDark
              ? SpectrumColors.outline
              : SpectrumColors.surfaceContainerHigh,
        ),
      ),
    ),
    sliderTheme: SliderThemeData(
      activeTrackColor: textColor,
      inactiveTrackColor: isDark
          ? SpectrumColors.outline
          : SpectrumColors.surfaceContainerHighest,
      thumbColor: textColor,
      overlayColor: SpectrumColors.tertiaryContainer.withValues(alpha: 0.18),
      trackHeight: 2,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: isDark
          ? SpectrumColors.darkContainer
          : SpectrumColors.surfaceContainerLow,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(
          color: isDark
              ? SpectrumColors.outline
              : SpectrumColors.outlineVariant,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(
          color: isDark
              ? SpectrumColors.outline
              : SpectrumColors.outlineVariant,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(
          color: SpectrumColors.tertiaryContainer,
          width: 2,
        ),
      ),
    ),
  );
}

Color mutedColor(BuildContext context) {
  return Theme.of(context).brightness == Brightness.dark
      ? SpectrumColors.darkSecondary
      : SpectrumColors.secondary;
}

Color panelColor(BuildContext context) {
  return Theme.of(context).brightness == Brightness.dark
      ? SpectrumColors.darkContainer
      : SpectrumColors.surfaceContainerLowest;
}

Color softPanelColor(BuildContext context) {
  return Theme.of(context).brightness == Brightness.dark
      ? SpectrumColors.primaryContainer
      : SpectrumColors.surfaceContainerLow;
}

Color borderColor(BuildContext context) {
  return Theme.of(context).brightness == Brightness.dark
      ? SpectrumColors.outline
      : SpectrumColors.surfaceContainerHigh;
}

class BrandLogo extends StatelessWidget {
  const BrandLogo({this.size = 44, super.key});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Spectrum Access',
      image: true,
      child: SvgPicture.asset(
        'assets/brand/accessibilitat-logo.svg',
        width: size,
        height: size,
      ),
    );
  }
}

class SpectrumPanel extends StatelessWidget {
  const SpectrumPanel({
    required this.child,
    this.padding = const EdgeInsets.all(24),
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: panelColor(context),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark
              ? SpectrumColors.outline
              : SpectrumColors.surfaceContainerHigh,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.22 : 0.05),
            blurRadius: 36,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: Padding(padding: padding, child: child),
    );
  }
}

class SectionHeading extends StatelessWidget {
  const SectionHeading({
    required this.title,
    this.action,
    this.onAction,
    super.key,
  });

  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(title, style: Theme.of(context).textTheme.titleLarge),
        ),
        if (action != null)
          TextButton(onPressed: onAction, child: Text(action!)),
      ],
    );
  }
}
