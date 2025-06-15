import { describe, it, expect, beforeEach, vi } from 'vitest'
import { offerApi } from '../api/offerApi'
import * as restApiServiceModule from '../api/restApiService'
import { mockRestApiService } from './mocks/restApiService.mock'

// Mock the restApiService
vi.mock('../api/restApiService', () => ({
  restApiService: mockRestApiService
}))

describe('offerApi', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('should fetch an offer by slug', async () => {
    // Setup successful response
    mockRestApiService.getOffer.mockResolvedValueOnce({
      data: {
        slug: 'offer001',
        customerName: 'John Doe',
        offerAmount: 3500,
        documentURL: 'https://example.com/document.pdf',
        pdfUrl: 'https://example.com/document.pdf',
        isSigned: true,
        signedAt: '2025-06-10T14:32:11Z'
      },
      status: 200
    });

    const response = await offerApi.getOffer('offer001');
    
    // Check the response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.slug).toBe('offer001');
    expect(response.data?.customerName).toBe('John Doe');
    expect(response.data?.offerAmount).toBe(3500);
    expect(response.data?.isSigned).toBe(true);
    
    // Verify the service was called correctly
    expect(mockRestApiService.getOffer).toHaveBeenCalledWith('offer001');
    expect(mockRestApiService.getOffer).toHaveBeenCalledTimes(1);
  })

  it('should return 404 for non-existent offer', async () => {
    // Setup error response
    mockRestApiService.getOffer.mockResolvedValueOnce({
      error: 'This offer link is invalid or has expired',
      status: 404
    });
    
    const response = await offerApi.getOffer('non-existent-slug');
    
    expect(response.status).toBe(404);
    expect(response.error).toBe('This offer link is invalid or has expired');
    expect(response.data).toBeUndefined();
    
    // Verify the service was called correctly
    expect(mockRestApiService.getOffer).toHaveBeenCalledWith('non-existent-slug');
    expect(mockRestApiService.getOffer).toHaveBeenCalledTimes(1);
  })

  it('should sign an offer successfully', async () => {
    const signedDate = '2025-06-15T10:30:00Z';
    
    // Setup successful response
    mockRestApiService.signOffer.mockResolvedValueOnce({
      data: {
        slug: 'offer004',
        customerName: 'Maria Garcia',
        offerAmount: 3200,
        documentURL: 'https://example.com/documents/offer004.pdf',
        pdfUrl: 'https://example.com/documents/offer004.pdf',
        isSigned: true,
        signedAt: signedDate,
        projectAddress: '321 Energy Lane, Frankfurt',
        notes: 'Standard package with additional roof insulation'
      },
      status: 200
    });
    
    const response = await offerApi.signOffer('offer004');
    
    // Check the response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.isSigned).toBe(true);
    expect(response.data?.signedAt).toBe(signedDate);
    
    // Verify the service was called correctly
    expect(mockRestApiService.signOffer).toHaveBeenCalledWith('offer004', {});
    expect(mockRestApiService.signOffer).toHaveBeenCalledTimes(1);
  })

  it('should return all offers', async () => {
    const sampleOffers = [
      {
        slug: 'offer001',
        customerName: 'John Doe',
        offerAmount: 3500,
        documentURL: 'https://example.com/document1.pdf',
        pdfUrl: 'https://example.com/document1.pdf',
        isSigned: true,
        signedAt: '2025-06-10T14:32:11Z'
      },
      {
        slug: 'offer002',
        customerName: 'Jane Smith',
        offerAmount: 2800,
        documentURL: 'https://example.com/document2.pdf',
        pdfUrl: 'https://example.com/document2.pdf',
        isSigned: true,
        signedAt: '2025-06-11T09:15:00Z'
      }
    ];
    
    // Setup successful response
    mockRestApiService.getAllOffers.mockResolvedValueOnce({
      data: sampleOffers,
      status: 200
    });
    
    const response = await offerApi.getAllOffers();
    
    // Check the response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data!.length).toBe(2);
    expect(response.data![0].slug).toBe('offer001');
    expect(response.data![1].slug).toBe('offer002');
    
    // Verify the service was called correctly
    expect(mockRestApiService.getAllOffers).toHaveBeenCalledTimes(1);
  })

  it('should handle already signed offers', async () => {
    // Setup error response for already signed offer
    mockRestApiService.signOffer.mockResolvedValueOnce({
      error: 'Offer has already been signed',
      status: 409
    });
    
    const response = await offerApi.signOffer('offer001');
    
    // Check the response
    expect(response.status).toBe(409);
    expect(response.error).toBe('Offer has already been signed');
    expect(response.data).toBeUndefined();
    
    // Verify the service was called correctly
    expect(mockRestApiService.signOffer).toHaveBeenCalledWith('offer001', {});
    expect(mockRestApiService.signOffer).toHaveBeenCalledTimes(1);
  })
  
  it('should handle network errors', async () => {
    // Setup network error response
    mockRestApiService.getOffer.mockResolvedValueOnce({
      error: 'Network Error: Failed to connect to API',
      status: 500
    });
    
    const response = await offerApi.getOffer('offer003');
    
    // Check the response
    expect(response.status).toBe(500);
    expect(response.error).toBe('Network Error: Failed to connect to API');
    expect(response.data).toBeUndefined();
    
    // Verify the service was called correctly
    expect(mockRestApiService.getOffer).toHaveBeenCalledWith('offer003');
    expect(mockRestApiService.getOffer).toHaveBeenCalledTimes(1);
  })
})
