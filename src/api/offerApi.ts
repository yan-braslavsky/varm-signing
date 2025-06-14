import { Offer, ApiResponse, SignRequest } from '../types/offer';

// Mock data for development - in production this would call Firebase Functions
const mockOffers: Record<string, Offer> = {
  'test-offer-123': {
    slug: 'test-offer-123',
    customerName: 'John Doe',
    offerAmount: 150000,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isSigned: false,
  },
  'signed-offer-456': {
    slug: 'signed-offer-456',
    customerName: 'Jane Smith',
    offerAmount: 275000,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isSigned: true,
    signedAt: '2024-06-14T10:30:00Z',
  },
  'demo-offer-789': {
    slug: 'demo-offer-789',
    customerName: 'Alice Johnson',
    offerAmount: 320000,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isSigned: false,
  },
  'solar-deal-abc': {
    slug: 'solar-deal-abc',
    customerName: 'Michael Brown',
    offerAmount: 85000,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isSigned: false,
  },
  'wind-project-xyz': {
    slug: 'wind-project-xyz',
    customerName: 'Sarah Wilson',
    offerAmount: 450000,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isSigned: false,
  },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Simulate network delay for realistic UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random network failures for testing error handling
const shouldSimulateError = () => Math.random() < 0.05; // 5% chance of error

export const offerApi = {
  async getOffer(slug: string): Promise<ApiResponse<Offer>> {
    await delay(600 + Math.random() * 400); // Random delay 600-1000ms
    
    // Simulate occasional network errors
    if (shouldSimulateError()) {
      return {
        error: 'Network error - please try again',
        status: 500,
      };
    }
    
    const offer = mockOffers[slug];
    
    if (!offer) {
      return {
        error: 'This offer link is invalid or has expired',
        status: 404,
      };
    }

    return {
      data: { ...offer }, // Clone to prevent mutations
      status: 200,
    };
  },

  async signOffer(slug: string, signRequest: SignRequest = {}): Promise<ApiResponse<Offer>> {
    await delay(800 + Math.random() * 400); // Random delay 800-1200ms
    
    // Simulate occasional network errors
    if (shouldSimulateError()) {
      return {
        error: 'Failed to sign offer due to network error. Please try again.',
        status: 500,
      };
    }
    
    const offer = mockOffers[slug];
    
    if (!offer) {
      return {
        error: 'This offer link is invalid or has expired',
        status: 404,
      };
    }

    if (offer.isSigned) {
      return {
        error: 'This offer has already been signed',
        status: 409,
      };
    }

    // Update the mock data (simulate database update)
    const updatedOffer = {
      ...offer,
      isSigned: true,
      signedAt: new Date().toISOString(),
    };

    mockOffers[slug] = updatedOffer;

    return {
      data: { ...updatedOffer }, // Clone to prevent mutations
      status: 200,
    };
  },

  // Get all available offers (for demo purposes)
  async getAllOffers(): Promise<ApiResponse<Offer[]>> {
    await delay(300);
    
    return {
      data: Object.values(mockOffers),
      status: 200,
    };
  },
};

// Production API implementation (to be implemented with Firebase Functions)
export const productionApi = {
  async getOfferFromFirebase(slug: string): Promise<ApiResponse<Offer>> {
    try {
      const response = await fetch(`${API_BASE_URL}/offer/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          error: data.error || 'Failed to fetch offer',
          status: response.status,
        };
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: 'Network error - please check your connection',
        status: 500,
      };
    }
  },

  async signOfferInFirebase(slug: string, signRequest: SignRequest): Promise<ApiResponse<Offer>> {
    try {
      const response = await fetch(`${API_BASE_URL}/offer/${slug}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signRequest),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          error: data.error || 'Failed to sign offer',
          status: response.status,
        };
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: 'Network error - please check your connection',
        status: 500,
      };
    }
  },
};

// Airtable integration (to be implemented)
export const airtableApi = {
  async getOfferFromAirtable(slug: string): Promise<ApiResponse<Offer>> {
    // TODO: Implement actual Airtable API integration
    // This would use the Airtable API to fetch offer data
    // For now, fall back to mock data
    console.log('Airtable integration not yet implemented, using mock data');
    return offerApi.getOffer(slug);
  },

  async signOfferInAirtable(slug: string, signRequest: SignRequest): Promise<ApiResponse<Offer>> {
    // TODO: Implement actual Airtable API integration
    // This would update the Airtable record with signature data
    // For now, fall back to mock data
    console.log('Airtable integration not yet implemented, using mock data');
    return offerApi.signOffer(slug, signRequest);
  },
};

// Export the default API (currently using mock data)
export default offerApi;
