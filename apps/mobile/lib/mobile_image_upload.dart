import 'dart:typed_data';

import 'package:image_picker/image_picker.dart';

class PreparedPlaceImage {
  const PreparedPlaceImage({
    required this.bytes,
    required this.fileName,
    required this.contentType,
    required this.originalName,
    required this.isHeic,
  });

  final Uint8List bytes;
  final String fileName;
  final String contentType;
  final String originalName;
  final bool isHeic;

  int get sizeInBytes => bytes.lengthInBytes;
}

class PlaceImagePicker {
  PlaceImagePicker({ImagePicker? picker}) : _picker = picker ?? ImagePicker();

  final ImagePicker _picker;

  Future<PreparedPlaceImage?> pickFromGallery() {
    return _pick(ImageSource.gallery);
  }

  Future<PreparedPlaceImage?> takePhoto() {
    return _pick(ImageSource.camera);
  }

  Future<List<PreparedPlaceImage>> retrieveLostImages() async {
    final response = await _picker.retrieveLostData();
    final files = response.files;
    if (response.isEmpty || files == null || files.isEmpty) {
      return const [];
    }

    final images = <PreparedPlaceImage>[];
    for (final file in files) {
      images.add(await preparePlaceImage(file));
    }
    return images;
  }

  Future<PreparedPlaceImage?> _pick(ImageSource source) async {
    final file = await _picker.pickImage(
      source: source,
      maxWidth: 2048,
      maxHeight: 2048,
      imageQuality: 90,
      requestFullMetadata: false,
    );

    if (file == null) {
      return null;
    }
    return preparePlaceImage(file);
  }
}

Future<PreparedPlaceImage> preparePlaceImage(XFile file) async {
  final bytes = await file.readAsBytes();
  final originalName = sourceImageName(file);
  final contentType = resolveImageContentType(
    mimeType: file.mimeType,
    name: originalName,
    path: file.path,
  );

  return PreparedPlaceImage(
    bytes: bytes,
    fileName: normalizeImageFileName(
      originalName: originalName,
      contentType: contentType,
    ),
    contentType: contentType,
    originalName: originalName,
    isHeic: isHeicContentType(contentType),
  );
}

String sourceImageName(XFile file) {
  final name = file.name.trim();
  if (name.isNotEmpty) {
    return name;
  }

  final pathName = _lastPathSegment(file.path);
  if (pathName.isNotEmpty) {
    return pathName;
  }

  return 'spectrum-access-${DateTime.now().millisecondsSinceEpoch}';
}

String resolveImageContentType({String? mimeType, String? name, String? path}) {
  final normalizedMime = mimeType?.trim().toLowerCase();
  if (normalizedMime != null && normalizedMime.startsWith('image/')) {
    if (normalizedMime == 'image/jpg') {
      return 'image/jpeg';
    }
    return normalizedMime;
  }

  final extension = _extensionFrom(name) ?? _extensionFrom(path);
  return switch (extension?.toLowerCase()) {
    'jpg' || 'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'heic' => 'image/heic',
    'heif' => 'image/heif',
    _ => 'image/jpeg',
  };
}

String normalizeImageFileName({
  required String originalName,
  required String contentType,
}) {
  final fallback = 'spectrum-access-${DateTime.now().millisecondsSinceEpoch}';
  final source = _lastPathSegment(originalName).isEmpty
      ? fallback
      : _lastPathSegment(originalName);
  final withoutExtension = source.replaceFirst(RegExp(r'\.[^.]+$'), '');
  final safeBase = withoutExtension
      .replaceAll(RegExp(r'[^A-Za-z0-9._-]+'), '-')
      .replaceAll(RegExp('-+'), '-')
      .replaceAll(RegExp(r'^[-.]+|[-.]+$'), '');
  final extension = imageExtensionForContentType(contentType);

  return '${safeBase.isEmpty ? fallback : safeBase}.$extension';
}

String imageExtensionForContentType(String contentType) {
  return switch (contentType.toLowerCase()) {
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/heic' => 'heic',
    'image/heif' => 'heif',
    _ => 'jpg',
  };
}

bool isHeicContentType(String contentType) {
  final normalized = contentType.toLowerCase();
  return normalized == 'image/heic' || normalized == 'image/heif';
}

String? _extensionFrom(String? value) {
  if (value == null || value.trim().isEmpty) {
    return null;
  }

  final segment = _lastPathSegment(value);
  final index = segment.lastIndexOf('.');
  if (index == -1 || index == segment.length - 1) {
    return null;
  }
  return segment.substring(index + 1);
}

String _lastPathSegment(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) {
    return '';
  }
  return trimmed.split(RegExp(r'[/\\]')).last;
}
