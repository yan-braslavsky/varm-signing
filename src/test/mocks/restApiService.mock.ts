import { vi } from 'vitest';
import type { ApiResponse, Offer } from '../../types/offer';

// Sample data for testing
const sampleOffers = {
  offer001: {
    slug: 'offer001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    offerAmount: 3500,
    documentURL: 'https://example.com/documents/offer001.pdf',
    pdfUrl: 'https://example.com/documents/offer001.pdf',
    isSigned: true,
    signedAt: '2025-06-10T14:32:11Z',
    projectAddress: '123 Green St, Berlin',
    notes: 'Premium insulation package'
  },
  offer002: {
    slug: 'offer002',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    offerAmount: 2800,
    documentURL: 'https://example.com/documents/offer002.pdf',
    pdfUrl: 'https://example.com/documents/offer002.pdf',
    isSigned: true,
    signedAt: '2025-06-12T09:45:22Z',
    projectAddress: '456 Solar Ave, Munich',
    notes: 'Standard insulation package with solar integration'
  },
  offer003: {
    slug: 'offer003',
    customerName: 'Alex Johnson',
    customerEmail: 'alex.johnson@example.com',
    offerAmount: 4200,
    documentURL: 'https://example.com/documents/offer003.pdf',
    pdfUrl: 'https://example.com/documents/offer003.pdf',
    isSigned: true,
    signedAt: '2025-06-13T16:20:45Z',
    projectAddress: '789 Eco Blvd, Hamburg',
    notes: 'Premium package with smart home integration'
  },
  offer004: {
    slug: 'offer004',
    customerName: 'Maria Garcia',
    customerEmail: 'maria.garcia@example.com',
    offerAmount: 3200,
    documentURL: 'https://example.com/documents/offer004.pdf',
    pdfUrl: 'https://example.com/documents/offer004.pdf',
    isSigned: false,
    projectAddress: '321 Energy Lane, Frankfurt',
    notes: 'Standard package with additional roof insulation'
  },
  offer005: {
    slug: 'offer005',
    customerName: 'Robert Mueller',
    customerEmail: 'robert.mueller@example.com',
    offerAmount: 3800,
    documentURL: 'https://example.com/documents/offer005.pdf',
    pdfUrl: 'https://example.com/documents/offer005.pdf',
    isSigned: false,
    projectAddress: '987 Climate Road, Cologne',
    notes: 'Premium package with extended warranty'
  }
};

// Create mock functions for restApiService
export const mockRestApiService = {
  getOffer: vi.fn(async (slug: string): Promise<ApiResponse<Offer>> => {
    // Random error simulation: 5% of calls will fail with a network error
    if (Math.random() < 0.05) {
      return {
        error: 'Network Error: Failed to connect to API',
        status: 500
      };
    }

    const offer = sampleOffers[slug as keyof typeof sampleOffers];
    
    if (!offer) {
      return {
        error: 'This offer link is invalid or has expired',
        status: 404
      };
    }
    
    return {
      data: offer,
      status: 200
    };
  }),
  
  signOffer: vi.fn(async (slug: string): Promise<ApiResponse<Offer>> => {
    // Random error simulation: 5% of calls will fail with a network error
    if (Math.random() < 0.05) {
      return {
        error: 'Network Error: Failed to connect to API',
        status: 500
      };
    }

    const offer = sampleOffers[slug as keyof typeof sampleOffers];
    
    if (!offer) {
      return {
        error: 'This offer link is invalid or has expired',
        status: 404
      };
    }
    
    if (offer.isSigned) {
      return {
        error: 'Offer has already been signed',
        status: 409
      };
    }
    
    // Create a copy with updated values
    const updatedOffer = {
      ...offer,
      isSigned: true,
      signedAt: new Date().toISOString()
    };
    
    // Update in our sample data
    sampleOffers[slug as keyof typeof sampleOffers] = updatedOffer;
    
    return {
      data: updatedOffer,
      status: 200
    };
  }),
  
  getAllOffers: vi.fn(async (): Promise<ApiResponse<Offer[]>> => {
    // Random error simulation: 5% of calls will fail with a network error
    if (Math.random() < 0.05) {
      return {
        error: 'Network Error: Failed to connect to API',
        status: 500
      };
    }
    
    return {
      data: Object.values(sampleOffers),
      status: 200
    };
  })
};

// Export individual mock functions for more granular control in tests
export const mockGetOffer = mockRestApiService.getOffer;
export const mockSignOffer = mockRestApiService.signOffer;
export const mockGetAllOffers = mockRestApiService.getAllOffers;
