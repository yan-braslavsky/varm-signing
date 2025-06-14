/**
 * Simple test to show Firebase Storage URL conversion
 */

// Manual conversion test - simulating the conversion logic
function convertGsUrlManual(gsUrl) {
  if (gsUrl.startsWith('http://') || gsUrl.startsWith('https://')) {
    return gsUrl;
  }
  
  if (!gsUrl.startsWith('gs://')) {
    return gsUrl;
  }
  
  try {
    const url = new URL(gsUrl);
    const bucket = url.hostname;
    const path = url.pathname.substring(1);
    
    if (!bucket || bucket.trim() === '') {
      return gsUrl;
    }
    
    const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('%2F');
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
  } catch (error) {
    return gsUrl;
  }
}

console.log('🔥 Firebase Storage URL Conversion Test\n');

const gsUrl = 'gs://varm-55a88.firebasestorage.app/Festpreisangebot_Masterkunde_KD_.pdf';
console.log('Original gs:// URL:');
console.log(gsUrl);
console.log('\nConverted Download URL:');
console.log(convertGsUrlManual(gsUrl));

console.log('\n✅ This URL should now work in browsers!');
console.log('\nThe converted URL follows Firebase Storage REST API format:');
console.log('https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media');
