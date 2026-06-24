import 'dart:math' as math;

import 'mobile_state.dart';
import 'spectrum_content.dart';

List<PlaceSummary> rankPlacesByDeviceLocation(
  List<PlaceSummary> source,
  DeviceLocation? location,
) {
  if (location == null) {
    return source;
  }

  final ranked =
      source
          .map(
            (place) => (
              place: place,
              distanceKm: distanceBetweenKm(
                location.latitude,
                location.longitude,
                place.latitude,
                place.longitude,
              ),
            ),
          )
          .toList()
        ..sort((a, b) => a.distanceKm.compareTo(b.distanceKm));

  return ranked
      .map(
        (entry) =>
            entry.place.copyWith(distance: formatDistance(entry.distanceKm)),
      )
      .toList();
}

List<PlaceSummary> filterPlacesBySensory(
  List<PlaceSummary> source,
  int? selectedFilter,
) {
  if (selectedFilter == null) {
    return source;
  }

  return source
      .where((place) {
        return switch (selectedFilter) {
          0 => _criterionAtMost(place, SensoryKey.noise, 3),
          1 => _criterionAtMost(place, SensoryKey.light, 3),
          2 => _criterionAtMost(place, SensoryKey.density, 3),
          _ => true,
        };
      })
      .toList(growable: false);
}

bool _criterionAtMost(PlaceSummary place, SensoryKey key, double maximum) {
  final score = place.criterionAverages[key];
  return score != null && score > 0 && score <= maximum;
}

List<VerifiedProfile> rankVerifiedProfilesByDeviceLocation(
  List<VerifiedProfile> source,
  DeviceLocation? location,
) {
  if (location == null) {
    return source;
  }

  final ranked =
      source
          .map(
            (profile) => (
              profile: profile,
              distanceKm: distanceBetweenKm(
                location.latitude,
                location.longitude,
                profile.latitude,
                profile.longitude,
              ),
            ),
          )
          .toList()
        ..sort((a, b) => a.distanceKm.compareTo(b.distanceKm));

  return ranked
      .map(
        (entry) =>
            entry.profile.copyWith(distance: formatDistance(entry.distanceKm)),
      )
      .toList();
}

double distanceBetweenKm(
  double originLat,
  double originLng,
  double destinationLat,
  double destinationLng,
) {
  const earthRadiusKm = 6371.0;
  final latDelta = _toRadians(destinationLat - originLat);
  final lngDelta = _toRadians(destinationLng - originLng);
  final originLatitude = _toRadians(originLat);
  final destinationLatitude = _toRadians(destinationLat);
  final a =
      math.sin(latDelta / 2) * math.sin(latDelta / 2) +
      math.cos(originLatitude) *
          math.cos(destinationLatitude) *
          math.sin(lngDelta / 2) *
          math.sin(lngDelta / 2);
  final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));

  return earthRadiusKm * c;
}

double _toRadians(double value) => value * math.pi / 180;

String formatDistance(double distanceKm) {
  if (distanceKm < 1) {
    final meters = math.max(50, (distanceKm * 1000 / 50).round() * 50);
    return '$meters m';
  }

  if (distanceKm < 10) {
    return '${distanceKm.toStringAsFixed(1)} km';
  }

  return '${distanceKm.round()} km';
}
