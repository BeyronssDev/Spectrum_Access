// ignore_for_file: use_null_aware_elements

import 'dart:typed_data';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';

import 'spectrum_content.dart';

class SpectrumFirebaseServices {
  SpectrumFirebaseServices({
    FirebaseAuth? auth,
    FirebaseFirestore? firestore,
    FirebaseFunctions? functions,
    FirebaseStorage? storage,
  }) : _auth = auth ?? FirebaseAuth.instance,
       _firestore = firestore ?? FirebaseFirestore.instance,
       _functions =
           functions ?? FirebaseFunctions.instanceFor(region: 'europe-west1'),
       _storage = storage ?? FirebaseStorage.instance;

  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;
  final FirebaseFunctions _functions;
  final FirebaseStorage _storage;

  Future<List<PlaceSummary>> loadActivePlaces() async {
    final snapshot = await _firestore
        .collection('places')
        .where('status', isEqualTo: 'active')
        .limit(50)
        .get();

    return snapshot.docs.map(_placeFromDocument).toList(growable: false);
  }

  Future<HttpsCallableResult<dynamic>> createPlace({
    required String name,
    required String category,
    required String city,
    required String addressOrArea,
    required double latitude,
    required double longitude,
    String? description,
  }) {
    return _functions.httpsCallable('createPlace').call({
      'name': name,
      'category': category,
      'city': city,
      'addressOrArea': addressOrArea,
      'latitude': latitude,
      'longitude': longitude,
      if (description != null) 'description': description,
    });
  }

  Future<HttpsCallableResult<dynamic>> submitReview({
    required String placeId,
    required Map<SensoryKey, double> ratings,
    String? comment,
    String? childProfileId,
  }) {
    return _functions.httpsCallable('submitReview').call({
      'placeId': placeId,
      'ratings': _ratingsPayload(ratings),
      if (comment != null && comment.trim().isNotEmpty) 'comment': comment,
      if (childProfileId != null) 'childProfileId': childProfileId,
    });
  }

  Future<HttpsCallableResult<dynamic>> submitComment({
    required String targetType,
    required String targetId,
    required String body,
    String? placeId,
  }) {
    return _functions.httpsCallable('submitComment').call({
      'targetType': targetType,
      'targetId': targetId,
      'body': body,
      if (placeId != null) 'placeId': placeId,
    });
  }

  Future<HttpsCallableResult<dynamic>> createReport({
    required String targetType,
    required String targetId,
    required String reason,
  }) {
    return _functions.httpsCallable('createReport').call({
      'targetType': targetType,
      'targetId': targetId,
      'reason': reason,
    });
  }

  Future<HttpsCallableResult<dynamic>> createChildProfile({
    required String alias,
    String? ageRange,
    Map<String, String>? sensoryPreferences,
  }) {
    return _functions.httpsCallable('createChildProfile').call({
      'alias': alias,
      if (ageRange != null) 'ageRange': ageRange,
      if (sensoryPreferences != null) 'sensoryPreferences': sensoryPreferences,
    });
  }

  Future<HttpsCallableResult<dynamic>> requestProfessionalVerification({
    required String professionalName,
    required String licenseNumber,
    required String professionalCollege,
    required String specialty,
    String? photoPath,
    String? evidencePath,
    String? note,
  }) {
    return _functions.httpsCallable('requestProfessionalVerification').call({
      'professionalName': professionalName,
      'licenseNumber': licenseNumber,
      'professionalCollege': professionalCollege,
      'specialty': specialty,
      if (photoPath != null) 'photoPath': photoPath,
      if (evidencePath != null) 'evidencePath': evidencePath,
      if (note != null) 'note': note,
    });
  }

  Future<HttpsCallableResult<dynamic>> requestOrganizationVerification({
    required String name,
    required String description,
    required String city,
    String? website,
    String? registryNumber,
    String? logoPath,
    String? evidencePath,
    String? note,
  }) {
    return _functions.httpsCallable('requestOrganizationVerification').call({
      'name': name,
      'description': description,
      'city': city,
      if (website != null) 'website': website,
      if (registryNumber != null) 'registryNumber': registryNumber,
      if (logoPath != null) 'logoPath': logoPath,
      if (evidencePath != null) 'evidencePath': evidencePath,
      if (note != null) 'note': note,
    });
  }

  Future<HttpsCallableResult<dynamic>> uploadPlaceImage({
    required String placeId,
    required Uint8List bytes,
    required String fileName,
    required String contentType,
    Map<String, String>? altText,
  }) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) {
      throw StateError('auth-required');
    }

    final imageId = DateTime.now().microsecondsSinceEpoch.toString();
    final storagePath = 'place-images/$uid/$imageId/$fileName';
    await _storage
        .ref(storagePath)
        .putData(bytes, SettableMetadata(contentType: contentType));

    return _functions.httpsCallable('createPlaceImageRecord').call({
      'placeId': placeId,
      'storagePath': storagePath,
      if (altText != null) 'altText': altText,
    });
  }
}

PlaceSummary _placeFromDocument(
  QueryDocumentSnapshot<Map<String, dynamic>> doc,
) {
  final data = doc.data();
  final position = data['position'];
  final latitude = position is Map
      ? (position['latitude'] as num?)?.toDouble()
      : null;
  final longitude = position is Map
      ? (position['longitude'] as num?)?.toDouble()
      : null;

  return PlaceSummary(
    name: (data['name'] as String?) ?? '',
    area:
        (data['addressOrArea'] as String?) ??
        (data['category'] as String? ?? ''),
    city: (data['city'] as String?) ?? '',
    category: (data['category'] as String?) ?? 'other',
    score: (data['averageScore'] as num?)?.toDouble() ?? 0,
    distance: 'Live',
    quietDb: ((data['ratingCount'] as num?)?.toInt() ?? 0) > 0
        ? '${(data['ratingCount'] as num).toInt()} reviews'
        : 'New',
    latitude: latitude ?? 41.3851,
    longitude: longitude ?? 2.1734,
    description: (data['description'] as String?) ?? '',
  );
}

Map<String, int> _ratingsPayload(Map<SensoryKey, double> ratings) {
  final noise = ratings[SensoryKey.noise]?.round() ?? 3;
  final density = ratings[SensoryKey.density]?.round() ?? 3;
  final light = ratings[SensoryKey.light]?.round() ?? 3;
  final wait = ratings[SensoryKey.wait]?.round() ?? 3;
  final general = ((noise + density + light + wait) / 4)
      .round()
      .clamp(1, 5)
      .toInt();

  return {
    'noise': noise,
    'crowd': density,
    'lighting': light,
    'temperature': 3,
    'waitingTime': wait,
    'staffTreatment': 3,
    'quietSpace': (6 - noise).clamp(1, 5).toInt(),
    'exitEase': 3,
    'perceivedSafety': 3,
    'generalRecommendation': general,
  };
}
