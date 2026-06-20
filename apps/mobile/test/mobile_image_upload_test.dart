import 'package:flutter_test/flutter_test.dart';
import 'package:sensory_access/mobile_image_upload.dart';

void main() {
  test('keeps HEIC metadata for iPhone images', () {
    final contentType = resolveImageContentType(name: 'IMG_1234.HEIC');
    final fileName = normalizeImageFileName(
      originalName: 'IMG_1234.HEIC',
      contentType: contentType,
    );

    expect(contentType, 'image/heic');
    expect(fileName, 'IMG_1234.heic');
    expect(isHeicContentType(contentType), isTrue);
  });

  test('normalizes common image types for storage metadata', () {
    expect(resolveImageContentType(name: 'place.jpeg'), 'image/jpeg');
    expect(resolveImageContentType(name: 'place.png'), 'image/png');
    expect(resolveImageContentType(name: 'place.webp'), 'image/webp');
    expect(resolveImageContentType(mimeType: 'image/jpg'), 'image/jpeg');
  });

  test('sanitizes filenames and keeps an image content type fallback', () {
    final contentType = resolveImageContentType(name: 'unknown-file');
    final fileName = normalizeImageFileName(
      originalName: 'la foto del lloc',
      contentType: contentType,
    );

    expect(contentType, 'image/jpeg');
    expect(fileName, 'la-foto-del-lloc.jpg');
  });
}
