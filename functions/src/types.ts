/**
 * Type definitions for the VARM Signing Platform API
 */

export interface Offer {
  slug: string;
  customerName: string;
  customerEmail?: string;
  offerAmount: number;
  documentURL: string; // Renamed from pdfUrl for consistency
  pdfUrl: string; // Keep for backward compatibility
  isSigned: boolean;
  signedAt?: string;
  projectAddress?: string; 
  notes?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface SignRequest {
  signature?: string;
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime?: string;
}
