import { describe, it, expect } from 'vitest';
import {
  convertGsUrlToDownloadUrl,
  isFirebaseStorageGsUrl,
  processPdfUrl
} from '../utils/firebaseStorage';

describe('Firebase Storage Utilities', () => {
  describe('isFirebaseStorageGsUrl', () => {
    it('should return true for gs:// URLs', () => {
      expect(isFirebaseStorageGsUrl('gs://bucket-name/path/file.pdf')).toBe(true);
      expect(isFirebaseStorageGsUrl('gs://my-bucket/documents/test.pdf')).toBe(true);
    });

    it('should return false for non-gs:// URLs', () => {
      expect(isFirebaseStorageGsUrl('https://example.com/file.pdf')).toBe(false);
      expect(isFirebaseStorageGsUrl('http://example.com/file.pdf')).toBe(false);
      expect(isFirebaseStorageGsUrl('file.pdf')).toBe(false);
      expect(isFirebaseStorageGsUrl('')).toBe(false);
    });

    it('should handle invalid inputs gracefully', () => {
      expect(isFirebaseStorageGsUrl(null as any)).toBe(false);
      expect(isFirebaseStorageGsUrl(undefined as any)).toBe(false);
      expect(isFirebaseStorageGsUrl(123 as any)).toBe(false);
    });
  });

  describe('convertGsUrlToDownloadUrl', () => {
    it('should convert gs:// URL to Firebase Storage download URL', () => {
      const gsUrl = 'gs://varm-55a88.firebasestorage.app/Festpreisangebot_Masterkunde_KD_.pdf';
      const expected = 'https://firebasestorage.googleapis.com/v0/b/varm-55a88.firebasestorage.app/o/Festpreisangebot_Masterkunde_KD_.pdf?alt=media';
      
      expect(convertGsUrlToDownloadUrl(gsUrl)).toBe(expected);
    });

    it('should handle complex file paths with folders', () => {
      const gsUrl = 'gs://my-bucket/documents/subfolder/test file.pdf';
      const expected = 'https://firebasestorage.googleapis.com/v0/b/my-bucket/o/documents%2Fsubfolder%2Ftest%2520file.pdf?alt=media';
      
      expect(convertGsUrlToDownloadUrl(gsUrl)).toBe(expected);
    });

    it('should return HTTP(S) URLs unchanged', () => {
      const httpUrl = 'https://example.com/file.pdf';
      expect(convertGsUrlToDownloadUrl(httpUrl)).toBe(httpUrl);
      
      const httpUrl2 = 'http://example.com/file.pdf';
      expect(convertGsUrlToDownloadUrl(httpUrl2)).toBe(httpUrl2);
    });

    it('should return non-URL strings unchanged', () => {
      const nonUrl = 'not-a-url';
      expect(convertGsUrlToDownloadUrl(nonUrl)).toBe(nonUrl);
      
      const empty = '';
      expect(convertGsUrlToDownloadUrl(empty)).toBe(empty);
    });

    it('should handle malformed gs:// URLs gracefully', () => {
      const malformedUrl = 'gs://';
      const result = convertGsUrlToDownloadUrl(malformedUrl);
      // Should return the original URL as fallback
      expect(result).toBe(malformedUrl);
    });
  });

  describe('processPdfUrl', () => {
    it('should process gs:// URLs correctly', () => {
      const gsUrl = 'gs://varm-55a88.firebasestorage.app/document.pdf';
      const result = processPdfUrl(gsUrl);
      
      expect(result).toContain('firebasestorage.googleapis.com');
      expect(result).toContain('alt=media');
    });

    it('should leave HTTP(S) URLs unchanged', () => {
      const httpUrl = 'https://example.com/file.pdf';
      expect(processPdfUrl(httpUrl)).toBe(httpUrl);
    });

    it('should handle empty or invalid inputs', () => {
      expect(processPdfUrl('')).toBe('');
      expect(processPdfUrl(null as any)).toBe('');
      expect(processPdfUrl(undefined as any)).toBe('');
    });

    it('should handle real Firebase Storage URL format', () => {
      const realGsUrl = 'gs://varm-55a88.firebasestorage.app/Festpreisangebot_Masterkunde_KD_.pdf';
      const result = processPdfUrl(realGsUrl);
      
      expect(result).toBe('https://firebasestorage.googleapis.com/v0/b/varm-55a88.firebasestorage.app/o/Festpreisangebot_Masterkunde_KD_.pdf?alt=media');
    });
  });
});
