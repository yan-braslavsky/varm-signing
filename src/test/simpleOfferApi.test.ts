/**
 * Simple test for offerApi without complex mocking
 * This ensures we have at least a basic test passing for the API
 */

import { describe, it, expect, vi } from 'vitest'
import { offerApi } from '../api/offerApi'

// Mock restApiService in a simpler way
vi.mock('../api/restApiService', () => ({
  restApiService: {
    getOffer: vi.fn().mockResolvedValue({
      data: { slug: 'test-offer', customerName: 'Test User', offerAmount: 1000, documentURL: 'test.pdf', pdfUrl: 'test.pdf', isSigned: false },
      status: 200
    }),
    signOffer: vi.fn().mockResolvedValue({
      data: { slug: 'test-offer', customerName: 'Test User', offerAmount: 1000, documentURL: 'test.pdf', pdfUrl: 'test.pdf', isSigned: true, signedAt: new Date().toISOString() },
      status: 200
    }),
    getAllOffers: vi.fn().mockResolvedValue({
      data: [{ slug: 'test-offer', customerName: 'Test User', offerAmount: 1000, documentURL: 'test.pdf', pdfUrl: 'test.pdf', isSigned: false }],
      status: 200
    })
  }
}))

describe('offerApi Basic Tests', () => {
  it('should return offer data', async () => {
    const response = await offerApi.getOffer('test-offer')
    expect(response.status).toBe(200)
    expect(response.data).toBeDefined()
    expect(response.data?.slug).toBe('test-offer')
  })
})
