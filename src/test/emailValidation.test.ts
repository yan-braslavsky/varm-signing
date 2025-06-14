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
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Email Handling in Airtable Integration', () => {
  // Access the transformAirtableRecord function for testing
  // @ts-ignore - Accessing private function for testing
  const transformRecord = airtableService.__test__.transformAirtableRecord;
  
  test('handles valid email addresses correctly', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.co.uk',
      'firstname+label@domain.com',
      'name@subdomain.example.com',
      'very.common@example.com'
    ];
    
    validEmails.forEach(email => {
      const record = {
        id: 'rec123',
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
  });
  
  test('handles missing email field with empty string fallback', () => {
    const record = {
      id: 'rec123',
      fields: {
        slug: 'no-email-test',
        name: 'No Email Test',
        offerAmount: 100000,
        documentURL: 'https://example.com/test.pdf',
        signed: false
        // No email field
      }
    };
    
    // @ts-ignore - Using private function for testing
    const result = transformRecord(record);
    
    expect(result.customerEmail).toBe('');
  });
  
  test('handles email addresses with special formats', () => {
    const edgeCaseEmails = [
      '"quoted"@example.org',
      'email@example-domain.com',
      'email@subdomain.example.com',
      'user-name@example.com'
    ];
    
    edgeCaseEmails.forEach(email => {
      const record = {
        id: 'rec123',
        fields: {
          slug: 'edge-email-test',
          name: 'Edge Email Test',
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
  });
  
  test('handles alternative field names for email', () => {
    const alternativeFields = [
      { fieldName: 'email', value: 'test1@example.com' },
      { fieldName: 'Email', value: 'test2@example.com' },
      { fieldName: 'customerEmail', value: 'test3@example.com' },
      { fieldName: 'Customer Email', value: 'test4@example.com' }
    ];
    
    alternativeFields.forEach(({ fieldName, value }) => {
      const fields: Record<string, any> = {
        slug: 'alt-field-test',
        name: 'Alt Field Test',
        offerAmount: 100000,
        documentURL: 'https://example.com/test.pdf',
        signed: false
      };
      
      // Set the specified field
      fields[fieldName] = value;
      
      const record = {
        id: 'rec123',
        fields: fields
      };
      
      // @ts-ignore - Using private function for testing
      const result = transformRecord(record);
      
      expect(result.customerEmail).toBe(value);
    });
  });
});
