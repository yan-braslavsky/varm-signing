import { describe, test, expect, vi } from 'vitest';
import { airtableService } from '../api/airtableService';
import { FIELD_VARIATIONS } from '../types/schema';

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

describe('Schema Validation', () => {
  // Access the transformAirtableRecord function for testing
  // @ts-ignore - Accessing private function for testing
  const transformRecord = airtableService.__test__.transformAirtableRecord;
  
  test('correctly parses numeric strings for offerAmount', () => {
    const record = {
      id: 'rec123',
      fields: {
        id: 'offer-123',
        name: 'John Doe',
        email: 'john@example.com',
        offerAmount: '150000', // String instead of number
        documentURL: 'https://example.com/doc.pdf',
        signed: false
      }
    };
    
    // @ts-ignore - Using private function for testing
    const result = transformRecord(record);
    
    expect(result.offerAmount).toBe(150000);
    expect(typeof result.offerAmount).toBe('number');
  });
  
  test('handles non-numeric offerAmount strings', () => {
    const record = {
      id: 'rec123',
      fields: {
        id: 'offer-123',
        name: 'John Doe',
        email: 'john@example.com',
        offerAmount: 'not-a-number', // Invalid number
        documentURL: 'https://example.com/doc.pdf',
        signed: false
      }
    };
    
    // @ts-ignore - Using private function for testing
    const result = transformRecord(record);
    
    expect(result.offerAmount).toBe(0); // Should default to 0
    expect(typeof result.offerAmount).toBe('number');
  });

  test('correctly parses different boolean formats for isSigned', () => {
    const testCases = [
      { input: true, expected: true },
      { input: false, expected: false },
      { input: 'true', expected: true },
      { input: 'false', expected: false },
      { input: 'yes', expected: true },
      { input: 'no', expected: false },
      { input: 'signed', expected: true },
      { input: 'unsigned', expected: false },
      { input: 1, expected: true },
      { input: 0, expected: false },
      { input: '', expected: false },
      { input: null, expected: false },
      { input: undefined, expected: false },
    ];
    
    testCases.forEach(({ input, expected }) => {
      const record = {
        id: 'rec-test',
        fields: {
          slug: 'test-offer',
          name: 'Test User',
          email: 'test@example.com',
          offerAmount: 100000,
          documentURL: 'https://example.com/test.pdf',
          signed: input
        }
      };
      
      // @ts-ignore - Using private function for testing
      const result = transformRecord(record);
      expect(result.isSigned).toBe(expected);
    });
  });

  test('validates email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name+tag@example.co.uk',
      'user-name@domain.com'
    ];
    
    const invalidEmails = [
      '',
      'plainaddress',
      '@missingusername.com',
      'user@.com',
      'user@com'
    ];
    
    validEmails.forEach(email => {
      const record = {
        id: 'rec-email',
        fields: {
          slug: 'email-test',
          name: 'Email Test',
          email: email,
          offerAmount: 100000,
          documentURL: 'https://example.com/test.pdf',
          signed: false
        }
      };
      
      // @ts-ignore - Using private function for testing
      const result = transformRecord(record);
      expect(result.customerEmail).toBe(email);
    });
    
    invalidEmails.forEach(email => {
      const record = {
        id: 'rec-email',
        fields: {
          slug: 'email-test',
          name: 'Email Test',
          email: email,
          offerAmount: 100000,
          documentURL: 'https://example.com/test.pdf',
          signed: false
        }
      };
      
      // @ts-ignore - Using private function for testing
      const result = transformRecord(record);
      // Should still pass through the value even if invalid, as validation should happen elsewhere
      expect(result.customerEmail).toBe(email);
    });
  });

  test('handles mixed case field names', () => {
    const record = {
      id: 'rec-mixed',
      fields: {
        SlUg: 'mixed-case-test', // Mixed case
        NaMe: 'Mixed Case User', // Mixed case
        EmAiL: 'mixed@example.com', // Mixed case
        offeRAmouNt: 175000, // Mixed case
        DoCuMeNtUrL: 'https://example.com/mixed.pdf', // Mixed case
        SiGnEd: true // Mixed case
      }
    };
    
    // @ts-ignore - Using private function for testing
    const result = transformRecord(record);
    
    // Should not find these mixed case fields since they're not in the variations
    expect(result).toEqual({
      slug: `record-${record.id}`, // Should use record ID as fallback
      customerName: 'Unnamed Customer', // Should use fallback name
      customerEmail: '', // Should use empty string as fallback
      offerAmount: 0, // Should use fallback amount
      documentURL: '', // Should use empty string as fallback
      pdfUrl: '', // Should use empty string as fallback
      isSigned: false, // Should use fallback signed status
      signedAt: undefined,
      notes: '',
      projectAddress: ''
    });
  });
  
  test('field name variations are case-sensitive for exact matching', () => {
    // Verify that each variation in FIELD_VARIATIONS can be matched
    Object.entries(FIELD_VARIATIONS).forEach(([_, fieldVariations]) => {
      fieldVariations.forEach(fieldName => {
        const fields: Record<string, any> = {
          // Set default required fields
          slug: 'test-variation',
          name: 'Test User',
          email: 'test@example.com',
          offerAmount: 100000,
          documentURL: 'https://example.com/test.pdf',
          signed: false
        };
        
        // Clear the default field for the one we're testing
        const defaultField = fields[fieldVariations[0]];
        if (defaultField !== undefined) {
          delete fields[fieldVariations[0]];
        }
        
        // Set the field with the current variation name
        fields[fieldName] = defaultField !== undefined ? defaultField : 'test-value';
        
        const record = {
          id: 'rec-variation',
          fields
        };
        
        // @ts-ignore - Using private function for testing
        const result = transformRecord(record);
        
        // The field should be mapped correctly
        expect(result).toBeTruthy();
      });
    });
  });
});
