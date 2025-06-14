import type { Offer, ApiResponse, SignRequest } from '../types/offer.js';
import { airtableService } from './airtableService';

// Using Airtable API implementation for production
export const offerApi = {
  async getOffer(slug: string): Promise<ApiResponse<Offer>> {
    return airtableService.getOffer(slug);
  },

  async signOffer(slug: string, _signRequest: SignRequest = {}): Promise<ApiResponse<Offer>> {
    return airtableService.signOffer(slug);
  },

  // Get all available offers
  async getAllOffers(): Promise<ApiResponse<Offer[]>> {
    return airtableService.getAllOffers();
  },
};

// Export the default API (using Airtable service)
export default offerApi;
