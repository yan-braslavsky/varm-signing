#!/usr/bin/env node

/**
 * Test script to verify Firebase Storage URL conversion
 */

import { processPdfUrl, convertGsUrlToDownloadUrl } from '../src/utils/firebaseStorage.js';

console.log('🔥 Firebase Storage URL Conversion Test\n');

// Test with the real URL from the error
const gsUrl = 'gs://varm-55a88.firebasestorage.app/Festpreisangebot_Masterkunde_KD_.pdf';
console.log('Original gs:// URL:');
console.log(gsUrl);
console.log('\nConverted Download URL:');
console.log(processPdfUrl(gsUrl));

console.log('\n' + '='.repeat(80));

// Test with various URL types
const testUrls = [
  'gs://varm-55a88.firebasestorage.app/Festpreisangebot_Masterkunde_KD_.pdf',
  'https://example.com/document.pdf',
  'http://example.com/document.pdf',
  '',
  'gs://bucket/folder/file with spaces.pdf',
];

console.log('\n📋 Multiple URL Conversion Tests:\n');

testUrls.forEach((url, index) => {
  console.log(`${index + 1}. Input: ${url || '(empty string)'}`);
  console.log(`   Output: ${processPdfUrl(url)}`);
  console.log('');
});
