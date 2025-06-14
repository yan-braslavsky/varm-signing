/**
 * Firebase Storage Utilities for VARM Digital Signing
 * 
 * This module provides utilities for converting Firebase Storage gs:// URLs
 * to downloadable HTTPS URLs that can be displayed in browsers.
 */

/**
 * Converts a Firebase Storage gs:// URL to a download URL
 * @param gsUrl - The gs:// URL from Firebase Storage
 * @returns Promise<string> - The downloadable HTTPS URL
 */
export const convertGsUrlToDownloadUrl = (gsUrl: string): string => {
  // Check if it's already a proper HTTP(S) URL
  if (gsUrl.startsWith('http://') || gsUrl.startsWith('https://')) {
    return gsUrl;
  }

  // Check if it's a gs:// URL
  if (!gsUrl.startsWith('gs://')) {
    // If it's not a gs:// URL and not HTTP(S), return as-is
    return gsUrl;
  }

  try {
    // Parse the gs:// URL to extract bucket and path
    // Format: gs://bucket-name/path/to/file.pdf
    const url = new URL(gsUrl);
    const bucket = url.hostname;
    const path = url.pathname.substring(1); // Remove leading slash
    
    // Check for malformed URLs (empty bucket or path)
    if (!bucket || bucket.trim() === '') {
      console.warn('Malformed gs:// URL - empty bucket:', gsUrl);
      return gsUrl; // Return original as fallback
    }
    
    // Convert to Firebase Storage download URL format
    // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media
    // Use encodeURIComponent to properly encode the path
    const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('%2F');
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    
    return downloadUrl;
  } catch (error) {
    console.error('Error converting gs:// URL to download URL:', error);
    console.error('Original URL:', gsUrl);
    
    // Return the original URL as fallback
    return gsUrl;
  }
};

/**
 * Checks if a URL is a Firebase Storage gs:// URL
 * @param url - The URL to check
 * @returns boolean - True if it's a gs:// URL
 */
export const isFirebaseStorageGsUrl = (url: string): boolean => {
  return typeof url === 'string' && url.startsWith('gs://');
};

/**
 * Processes a PDF URL to ensure it's downloadable
 * This function handles both gs:// URLs and regular HTTP(S) URLs
 * @param url - The PDF URL (could be gs:// or HTTP(S))
 * @returns string - A downloadable URL
 */
export const processPdfUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // If it's a gs:// URL, convert it
  if (isFirebaseStorageGsUrl(url)) {
    return convertGsUrlToDownloadUrl(url);
  }

  // Otherwise return as-is
  return url;
};
