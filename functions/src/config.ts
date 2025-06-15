/**
 * Configuration for Firebase Cloud Functions
 * Contains environment configuration and constants
 */

import { defineSecret } from "firebase-functions/params";

// Define secrets for v2 functions
export const AIRTABLE_BASE_ID = defineSecret("AIRTABLE_BASE_ID");
export const AIRTABLE_API_KEY = defineSecret("AIRTABLE_API_KEY");
export const API_KEY = defineSecret("API_KEY");
export const API_BASEURL = defineSecret("API_BASEURL");

// Get config from Firebase environment (now from secrets)
const airtableConfig = {
  base_id: process.env.AIRTABLE_BASE_ID,
  api_key: process.env.AIRTABLE_API_KEY
};
const apiConfig = {
  key: process.env.API_KEY,
  baseurl: process.env.API_BASEURL
};

// Airtable configuration - using only Firebase config
export const AIRTABLE_CONFIG = {
  baseId: airtableConfig.base_id,
  apiKey: airtableConfig.api_key,
  tableName: 'Offers',
  baseUrl: 'https://api.airtable.com/v0',
};

// API security configuration
export const API_CONFIG = {
  // API key for simple API key authentication (can be set using firebase functions:config:set api.key=your-secret-key)
  apiKey: apiConfig.key,
  
  // Base URL for the API
  baseUrl: apiConfig.baseurl || 'https://us-central1-varm-55a88.cloudfunctions.net',
  
  // List of allowed origins for CORS
  allowedOrigins: [
    "http://localhost:5174",
    "http://localhost:5173", 
    "https://varm-signing.web.app",
    "https://varm-signing.firebaseapp.com"
  ],
  
  // Development environment settings
  skipAuthInDevelopment: process.env.NODE_ENV === 'development' || false,
  skipOriginCheckInDevelopment: process.env.NODE_ENV === 'development' || false,
};

// CORS configuration for allowed origins - keeping for backward compatibility
export const ALLOWED_ORIGINS = API_CONFIG.allowedOrigins;

// Field mappings from Airtable to our app
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
