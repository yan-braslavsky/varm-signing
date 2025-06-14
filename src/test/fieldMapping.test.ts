import { describe, test, expect, vi } from 'vitest';
import { airtableService } from '../api/airtableService';

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_AIRTABLE_API_KEY: 'test-api-key',
    VITE_AIRTABLE_BASE_ID: 'test-base-id',
    MODE: 'test'
  }
});

// Mock console methods to prevent logging during tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'group').mockImplementation(() => {});
vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

describe('Airtable Field Mapping', () => {
  // Access the transformAirtableRecord function for testing
  // @ts-ignore - Accessing private function for testing
  const transformRecord = airtableService.__test__.transformAirtableRecord;
  
  test('transforms record with exact schema field names', () => {
    // Create a record with fields exactly matching the schema
    const record = {
      id: 'rec123',
      fields: {
        id: 'offer-123',
        slug: 'offer-123',
        name: 'John Doe',
        email: 'john@example.com',
        offerAmount: 150000,
        documentURL: 'https://example.com/doc.pdf',
        signed: false
      }
    };
    
    // @ts-ignore - Using private function for testing
    const result = transformRecord(record);
    
    // Verify transformation
    expect(result).toEqual({
      slug: 'offer-123',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      offerAmount: 150000,
      pdfUrl: 'https://example.com/doc.pdf',
      isSigned: false,
      signedAt: undefined
    });
  });
  
  test('transforms record with alternative field names', () => {
    // Create a record with alternative field names
    const record = {
      id: 'rec456',
      fields: {
        ID: 'offer-456',
        Name: 'Jane Smith',
        Email: 'jane@example.com',
        Amount: 250000,
        'PDF URL': 'https://example.com/doc2.pdf',
        Signed: true,
        'Signed At': '2025-06-14T10:00:00Z'
      }
    };
    
    // @ts-ignore - Using private function for testing
    const result = transformRecord(record);
    
    // Verify transformation
    expect(result).toEqual({
      slug: 'offer-456',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      offerAmount: 250000,
      pdfUrl: 'https://example.com/doc2.pdf',
      isSigned: true,
      signedAt: '2025-06-14T10:00:00Z'
    });
  });
  
  test('handles missing fields with fallbacks', () => {
    // Create a record with missing fields
    const record = {
      id: 'rec789',
      fields: {
        id: 'offer-789'
        // All other fields missing
      }
    };
    
    // @ts-ignore - Using private function for testing
    const result = transformRecord(record);
    
    // Verify transformation with fallbacks
    expect(result).toEqual({
      slug: 'offer-789',
      customerName: 'Unnamed Customer',
      customerEmail: '',
      offerAmount: 0,
      pdfUrl: '',
      isSigned: false,
      signedAt: undefined
    });
  });
});
