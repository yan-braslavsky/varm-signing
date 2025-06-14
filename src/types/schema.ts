/**
 * JSON Schema Type Definitions for Airtable Integration
 * 
 * This file provides TypeScript interfaces that match the JSON schema for offers.
 * These types are used for documentation and validation purposes.
 */

/**
 * The OfferRecord schema from Airtable
 * 
 * This schema matches the provided JSON schema:
 * {
 *   "$schema": "http://json-schema.org/draft-07/schema#",
 *   "title": "OfferRecord",
 *   "type": "object",
 *   "properties": {
 *     "id": { "type": "string", "description": "Unique identifier for the offer" },
 *     "name": { "type": "string", "description": "Full name of the customer" },
 *     "email": { "type": "string", "format": "email", "description": "Email of the customer" },
 *     "offerAmount": { "type": "number", "description": "Offer amount in euros" },
 *     "documentURL": { "type": "string", "format": "uri", "description": "Link to the offer PDF" },
 *     "signed": { "type": "boolean", "description": "Whether the customer has signed the offer" },
 *     "signedAt": { "type": ["string", "null"], "format": "date-time", "description": "Timestamp" },
 *     "slug": { "type": "string", "description": "URL-safe unique slug for this offer" }
 *   },
 *   "required": ["id", "name", "email", "offerAmount", "documentURL", "signed"]
 * }
 */
export interface AirtableOfferRecord {
  /** Unique identifier for the offer */
  id: string;
  
  /** Full name of the customer */
  name: string;
  
  /** Email of the customer */
  email: string;
  
  /** Offer amount in euros */
  offerAmount: number;
  
  /** Link to the offer PDF (Firebase Storage URL or external) */
  documentURL: string;
  
  /** Whether the customer has signed the offer */
  signed: boolean;
  
  /** Timestamp of when the offer was signed */
  signedAt?: string | null;
  
  /** URL-safe unique slug for this offer */
  slug: string;
}

/**
 * Field mapping between Airtable schema and app schema
 */
export const FIELD_MAPPING = {
  // App field name : Primary Airtable field name
  slug: 'slug',
  customerName: 'name',
  customerEmail: 'email',
  offerAmount: 'offerAmount',
  pdfUrl: 'documentURL',
  isSigned: 'signed',
  signedAt: 'signedAt'
};

/**
 * Airtable field name variations
 * These are acceptable alternative field names for each app field
 */
export const FIELD_VARIATIONS = {
  slug: ['slug', 'Slug', 'id', 'ID', 'Id'],
  customerName: ['name', 'Name', 'customerName', 'Customer Name'],
  customerEmail: ['email', 'Email', 'customerEmail', 'Customer Email'],
  offerAmount: ['offerAmount', 'Offer Amount', 'Amount', 'Value'],
  pdfUrl: ['documentURL', 'DocumentURL', 'Document URL', 'pdfUrl', 'PDF URL'],
  isSigned: ['signed', 'Signed', 'isSigned', 'Is Signed'],
  signedAt: ['signedAt', 'Signed At', 'Sign Date', 'Date Signed']
};
