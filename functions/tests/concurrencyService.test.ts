import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signOfferWithConcurrencyControl } from '../services/concurrencyService';
import { airtableService } from '../services/airtableService';

// Mock the Airtable service
vi.mock('../src/services/airtableService', () => ({
  airtableService: {
    getOffer: vi.fn(),
    signOffer: vi.fn()
  }
}));

describe('Concurrency Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully sign an offer', async () => {
    // Mock getOffer to return an unsigned offer
    airtableService.getOffer.mockResolvedValueOnce({
      data: {
        slug: 'test-offer',
        customerName: 'Test Customer',
        isSigned: false
      },
      status: 200
    });

    // Mock signOffer to return a successful response
    airtableService.signOffer.mockResolvedValueOnce({
      data: {
        slug: 'test-offer',
        customerName: 'Test Customer',
        isSigned: true,
        signedAt: '2025-06-16'
      },
      status: 200
    });

    const result = await signOfferWithConcurrencyControl('test-offer');

    expect(result.status).toBe(200);
    expect(result.data?.isSigned).toBe(true);
    expect(airtableService.getOffer).toHaveBeenCalledTimes(1);
    expect(airtableService.signOffer).toHaveBeenCalledTimes(1);
  });

  it('should return error if offer is already signed', async () => {
    // Mock getOffer to return an already signed offer
    airtableService.getOffer.mockResolvedValueOnce({
      data: {
        slug: 'test-offer',
        customerName: 'Test Customer',
        isSigned: true,
        signedAt: '2025-06-15'
      },
      status: 200
    });

    const result = await signOfferWithConcurrencyControl('test-offer');

    expect(result.status).toBe(409);
    expect(result.error).toBe('This offer has already been signed');
    expect(airtableService.getOffer).toHaveBeenCalledTimes(1);
    expect(airtableService.signOffer).not.toHaveBeenCalled();
  });

  it('should retry on concurrency issues and succeed', async () => {
    // Mock getOffer to consistently return an unsigned offer
    airtableService.getOffer
      .mockResolvedValueOnce({
        data: {
          slug: 'test-offer',
          customerName: 'Test Customer',
          isSigned: false
        },
        status: 200
      })
      .mockResolvedValueOnce({
        data: {
          slug: 'test-offer',
          customerName: 'Test Customer',
          isSigned: false
        },
        status: 200
      });

    // Mock signOffer to fail once with a concurrency error, then succeed
    airtableService.signOffer
      .mockResolvedValueOnce({
        error: 'Concurrent modification detected',
        status: 409
      })
      .mockResolvedValueOnce({
        data: {
          slug: 'test-offer',
          customerName: 'Test Customer',
          isSigned: true,
          signedAt: '2025-06-16'
        },
        status: 200
      });

    const result = await signOfferWithConcurrencyControl('test-offer');

    expect(result.status).toBe(200);
    expect(result.data?.isSigned).toBe(true);
    expect(airtableService.getOffer).toHaveBeenCalledTimes(2);
    expect(airtableService.signOffer).toHaveBeenCalledTimes(2);
  });

  it('should give up after max retries', async () => {
    // Mock getOffer to consistently return an unsigned offer
    airtableService.getOffer.mockResolvedValue({
      data: {
        slug: 'test-offer',
        customerName: 'Test Customer',
        isSigned: false
      },
      status: 200
    });

    // Mock signOffer to always fail with concurrency errors
    airtableService.signOffer.mockResolvedValue({
      error: 'Concurrent modification detected',
      status: 409
    });

    const result = await signOfferWithConcurrencyControl('test-offer');

    expect(result.status).toBe(409);
    expect(result.error).toContain('Failed to sign offer after');
    expect(airtableService.getOffer).toHaveBeenCalledTimes(3);
    expect(airtableService.signOffer).toHaveBeenCalledTimes(3);
  });
});
