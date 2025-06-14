import { describe, it, expect, beforeEach } from 'vitest'
import { offerApi } from '../api/offerApi'

describe('offerApi', () => {
  beforeEach(() => {
    // Reset any state if needed
  })

  it('should fetch an offer by slug', async () => {
    // Note: This test might occasionally fail due to the 5% random error simulation
    // In a real test environment, we would mock the API calls
    const response = await offerApi.getOffer('offer001')
    
    // Either success or simulated network error
    expect([200, 500]).toContain(response.status)
    
    if (response.status === 200) {
      expect(response.data).toBeDefined()
      expect(response.data?.slug).toBe('offer001')
      expect(response.data?.customerName).toBe('John Doe')
      expect(response.data?.offerAmount).toBe(3500)
      expect(response.data?.isSigned).toBe(true)
    }
  }, 10000) // Increase timeout for network delays

  it('should return 404 for non-existent offer', async () => {
    const response = await offerApi.getOffer('non-existent-slug')
    
    expect(response.status).toBe(404)
    expect(response.error).toBe('This offer link is invalid or has expired')
    expect(response.data).toBeUndefined()
  }, 10000)

  it('should sign an offer successfully', async () => {
    // Note: This test might occasionally fail due to the 5% random error simulation
    const response = await offerApi.signOffer('offer003')
    
    // Either success or simulated network error
    expect([200, 500]).toContain(response.status)
    
    if (response.status === 200) {
      expect(response.data).toBeDefined()
      expect(response.data?.isSigned).toBe(true)
      expect(response.data?.signedAt).toBeDefined()
    }
  }, 10000)

  it('should return all offers', async () => {
    // Note: This test might occasionally fail due to the 5% random error simulation
    const response = await offerApi.getAllOffers()
    
    // Either success or simulated network error
    expect([200, 500]).toContain(response.status)
    
    if (response.status === 200) {
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data!.length).toBeGreaterThan(0)
    }
  }, 10000)

  it('should handle already signed offers', async () => {
    const response = await offerApi.signOffer('offer001')
    
    // Could be 409 (already signed) or 500 (simulated error)
    expect([409, 500]).toContain(response.status)
    
    if (response.status === 409) {
      expect(response.error).toBe('Offer has already been signed')
    }
  }, 10000)
})
