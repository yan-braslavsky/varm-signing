export interface Offer {
  slug: string;
  customerName: string;
  customerEmail?: string; // Added to match Airtable schema
  offerAmount: number;
  documentURL: string; // Renamed from pdfUrl for consistency
  pdfUrl: string; // Keep for backward compatibility
  isSigned: boolean;
  signedAt?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface SignRequest {
  signature?: string;
}

export interface ApiError {
  message: string;
  code: number;
  details?: string;
}
