export interface Offer {
  slug: string;
  customerName: string;
  customerEmail?: string; // Added to match Airtable schema
  offerAmount: number;
  pdfUrl: string;
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
