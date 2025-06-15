/**
 * Mock for the removed airtableService
 * This file exists solely to support legacy tests that depended on airtableService
 * In a real application, these tests should be updated to use the API approach
 */

import { vi } from 'vitest';
import type { Offer } from '../../types/offer';

// Field mappings from Airtable to our app - copied from functions/src/config.ts
export const FIELD_VARIATIONS = {
  slug: ['Slug', 'slug', 'id', 'ID', 'Id'],
  customerName: ['Name', 'name', 'customerName', 'Customer Name'],
  customerEmail: ['Email', 'email', 'customerEmail', 'Customer Email'],
  offerAmount: ['Offer Amount', 'offerAmount', 'Amount', 'Value'],
  pdfUrl: ['Document URL', 'documentURL', 'DocumentURL', 'pdfUrl', 'PDF URL'],
  isSigned: ['Signed', 'signed', 'isSigned', 'Is Signed'],
  signedAt: ['Signed At', 'signedAt', 'Sign Date', 'Date Signed'],
  projectAddress: ['Address', 'address', 'projectAddress', 'Project Address', 'Projektadresse'],
  notes: ['Notes', 'notes', 'Note', 'note', 'Description', 'description', 'Comment', 'comment']
};

// Mock Airtable Record type
interface AirtableRecord {
  id?: string;
  fields?: Record<string, any>;
}

/**
 * Helper function to transform Airtable record to Offer
 * This is a simplified version of what used to be in airtableService
 */
const transformAirtableRecord = (record: AirtableRecord): Offer => {
  if (!record) {
    throw new Error('Cannot transform null or undefined Airtable record');
  }
  
  const fields = record.fields || {};
  
  // Helper function to find the first available field value from possible field names
  const getFieldValue = (possibleNames: string[], defaultValue: any = null) => {
    for (const name of possibleNames) {
      if (fields[name] !== undefined) {
        return fields[name];
      }
    }
    return defaultValue;
  };
  
  // Convert offerAmount to a proper number
  let offerAmount = 0;
  const rawAmount = getFieldValue(FIELD_VARIATIONS.offerAmount);
  
  if (rawAmount !== null) {
    if (typeof rawAmount === 'string') {
      offerAmount = parseFloat(rawAmount) || 0;
    } else if (typeof rawAmount === 'number') {
      offerAmount = rawAmount;
    }
  }

  // Get the slug - use record ID as fallback if no slug field exists
  const slug = getFieldValue(FIELD_VARIATIONS.slug) || `record-${record.id || 'unknown'}`;
  
  // Get customer name with fallback
  const customerName = getFieldValue(FIELD_VARIATIONS.customerName) || 'Unnamed Customer';
  
  // Get customer email with fallback
  const customerEmail = getFieldValue(FIELD_VARIATIONS.customerEmail) || '';
  
  // Get PDF URL with fallback
  const pdfUrl = getFieldValue(FIELD_VARIATIONS.pdfUrl) || '';
  
  // Convert signed status to boolean
  const signedStatus = getFieldValue(FIELD_VARIATIONS.isSigned);
  const isSigned = typeof signedStatus === 'boolean' ? signedStatus : 
                  typeof signedStatus === 'string' ? signedStatus.toLowerCase() === 'true' || 
                                                   signedStatus.toLowerCase() === 'yes' || 
                                                   signedStatus.toLowerCase() === 'signed' : 
                  Boolean(signedStatus);
  
  // Get signed date - use undefined rather than null to match test expectations
  const signedAt = getFieldValue(FIELD_VARIATIONS.signedAt) === null ? undefined : getFieldValue(FIELD_VARIATIONS.signedAt);
  
  // Get project address
  const projectAddress = getFieldValue(FIELD_VARIATIONS.projectAddress) || '';
  
  // Get notes
  const notes = getFieldValue(FIELD_VARIATIONS.notes) || '';
  
  return {
    slug,
    customerName,
    customerEmail,
    offerAmount,
    documentURL: pdfUrl,
    pdfUrl,
    isSigned,
    signedAt,
    projectAddress,
    notes
  };
};

// Create mock airtableService for tests
export const airtableService = {
  getOffer: vi.fn(),
  getAllOffers: vi.fn(),
  signOffer: vi.fn(),
  
  // Expose internal functions for testing - to match what the old tests are using
  __test__: {
    transformAirtableRecord
  }
};
