/**
 * Firebase Storage helper utilities for Cloud Functions
 */
import * as logger from "firebase-functions/logger";

/**
 * Process PDF URL to handle Firebase Storage gs:// URLs
 * Converts Firebase Storage URLs to HTTP URLs if needed
 */
export const processPdfUrl = (url: string): string => {
  if (!url) return '';
  
  // If already an HTTP(S) URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle Firebase Storage URLs (gs://)
  if (url.startsWith('gs://')) {
    // Extract bucket and path
    // Format: gs://bucket-name/path/to/file.pdf
    const gsUrlPattern = /gs:\/\/([^\/]+)\/(.+)/;
    const matches = url.match(gsUrlPattern);
    
    if (matches && matches.length >= 3) {
      const bucket = matches[1];
      const filePath = matches[2];
      
      // Convert to HTTPS URL
      // Format: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/path%2Fto%2Ffile.pdf?alt=media
      const encodedPath = filePath.split('/').map(part => encodeURIComponent(part)).join('%2F');
      const httpUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
      
      logger.debug(`Converted GS URL to HTTP: ${httpUrl}`);
      return httpUrl;
    }
  }
  
  // If not a recognized format, return as is
  return url;
};
