import 'dart:typed_data';

import 'spectrum_content.dart';

class SpectrumAuthUser {
  const SpectrumAuthUser({
    required this.uid,
    this.displayName,
    this.email,
    this.emailVerified = false,
  });

  final String uid;
  final String? displayName;
  final String? email;
  final bool emailVerified;
}

class SpectrumUserProfile {
  const SpectrumUserProfile({
    required this.uid,
    required this.publicName,
    required this.roles,
    this.email,
    this.city,
    this.address,
    this.phone,
    this.profilePhotoPath,
    this.profilePhotoUrl,
  });

  final String uid;
  final String publicName;
  final List<String> roles;
  final String? email;
  final String? city;
  final String? address;
  final String? phone;
  final String? profilePhotoPath;
  final String? profilePhotoUrl;

  bool get isTutor => roles.contains('tutor');
  bool get isProfessional => roles.contains('professional');
  bool get isOrganization => roles.contains('organization');

  factory SpectrumUserProfile.fromMap(Map<String, dynamic> data) {
    final roles = data['roles'];
    return SpectrumUserProfile(
      uid: (data['uid'] as String?) ?? '',
      publicName:
          (data['publicName'] as String?) ??
          (data['displayName'] as String?) ??
          'Spectrum user',
      email: data['email'] as String?,
      city: data['city'] as String?,
      address: data['address'] as String?,
      phone: data['phone'] as String?,
      profilePhotoPath: data['profilePhotoPath'] as String?,
      profilePhotoUrl: data['profilePhotoUrl'] as String?,
      roles: roles is List
          ? roles.whereType<String>().toList(growable: false)
          : const ['user'],
    );
  }
}

abstract interface class SpectrumApplicationService {
  bool get hasAuthenticatedUser;
  SpectrumAuthUser? get currentUser;
  Stream<SpectrumAuthUser?> get authStateChanges;

  Future<SpectrumUserProfile?> loadCurrentUserProfile();

  Future<void> registerWithEmail({
    required String email,
    required String password,
    required String publicName,
    required String locale,
    String? city,
  });

  Future<void> signInWithEmail({
    required String email,
    required String password,
    required String locale,
  });

  Future<void> requestPasswordReset({
    required String email,
    required String locale,
  });

  Future<void> updateUserProfile({
    required String publicName,
    String? city,
    String? address,
    String? phone,
    Uint8List? profilePhotoBytes,
    String? profilePhotoFileName,
    String? profilePhotoContentType,
  });

  Future<void> signInWithGoogle({required String locale});

  Future<void> signInWithApple({required String locale});

  Future<void> signOut();

  Future<List<PlaceSummary>> loadActivePlaces();

  Future<String> createPlace({
    required String name,
    required String category,
    required String city,
    required String addressOrArea,
    required double latitude,
    required double longitude,
    String? description,
  });

  Future<void> submitReview({
    required String placeId,
    required Map<SensoryKey, double> ratings,
    String? comment,
    String? childProfileId,
  });

  Future<void> submitComment({
    required String targetType,
    required String targetId,
    required String body,
    String? placeId,
  });

  Future<void> createReport({
    required String targetType,
    required String targetId,
    required String reason,
  });

  Future<void> createChildProfile({
    required String alias,
    String? ageRange,
    Map<String, String>? sensoryPreferences,
  });

  Future<void> requestProfessionalVerification({
    required String professionalName,
    required String licenseNumber,
    required String professionalCollege,
    required String specialty,
    String? photoPath,
    String? evidencePath,
    String? note,
  });

  Future<void> requestOrganizationVerification({
    required String name,
    required String description,
    required String city,
    String? website,
    String? registryNumber,
    String? logoPath,
    String? evidencePath,
    String? note,
  });

  Future<void> uploadPlaceImage({
    required String placeId,
    required Uint8List bytes,
    required String fileName,
    required String contentType,
    Map<String, String>? altText,
  });
}
