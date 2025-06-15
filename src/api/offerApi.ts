// filepath: /Users/yan.braslavsky/Documents/React Web Projects/varm-signing/src/api/offerApi.ts
import type { Offer, ApiResponse, SignRequest } from '../types/offer.js';
import { restApiService } from './restApiService';
import { Logger } from '../utils/logger';

/**
 * Offer API service
 * Handles all offer-related API requests through Firebase Cloud Functions
 */
export const offerApi = {
  async getOffer(slug: string): Promise<ApiResponse<Offer>> {
    Logger.info(`Fetching offer with slug: ${slug}`, { 
      context: 'offerApi.getOffer'
    });
    
    try {
      const response = await restApiService.getOffer(slug);
      
      if (response.error) {
        Logger.error(`Failed to fetch offer: ${response.error}`, undefined, { 
          context: 'offerApi.getOffer',
          data: { slug, status: response.status }
        });
      } else {
        Logger.debug('Successfully fetched offer', { 
          context: 'offerApi.getOffer',
          data: response.data
        });
      }
      
      return response;
    } catch (error) {
      Logger.error('Unexpected error in getOffer', error as Error, { context: 'offerApi.getOffer' });
      throw error;
    }
  },

  async signOffer(slug: string, signRequest: SignRequest = {}): Promise<ApiResponse<Offer>> {
    Logger.info(`Signing offer with slug: ${slug}`, { 
      context: 'offerApi.signOffer',
      data: signRequest
    });
    
    try {
      const response = await restApiService.signOffer(slug, signRequest);
      
      if (response.error) {
        Logger.error(`Failed to sign offer: ${response.error}`, undefined, { 
          context: 'offerApi.signOffer',
          data: { slug, status: response.status }
        });
      } else {
        Logger.info('Successfully signed offer', { 
          context: 'offerApi.signOffer',
          data: { slug, timestamp: response.data?.signedAt }
        });
      }
      
      return response;
    } catch (error) {
      Logger.error('Unexpected error in signOffer', error as Error, { context: 'offerApi.signOffer' });
      throw error;
    }
  },

  // Get all available offers
  async getAllOffers(): Promise<ApiResponse<Offer[]>> {
    Logger.info('Fetching all offers', { 
      context: 'offerApi.getAllOffers'
    });
    
    try {
      const response = await restApiService.getAllOffers();
      
      if (response.error) {
        Logger.error(`Failed to fetch offers: ${response.error}`, undefined, { 
          context: 'offerApi.getAllOffers',
          data: { status: response.status }
        });
      } else {
        const offerCount = response.data?.length || 0;
        Logger.info(`Successfully fetched ${offerCount} offers`, { context: 'offerApi.getAllOffers' });
        Logger.debug('Offers data', { 
          context: 'offerApi.getAllOffers',
          data: response.data
        });
        
        // Log as table for better visibility
        if (response.data && response.data.length > 0) {
          const simplifiedOffers = response.data.map((o: Offer) => ({
            slug: o.slug,
            customer: o.customerName,
            amount: o.offerAmount,
            isSigned: o.isSigned,
            signedAt: o.signedAt || 'N/A'
          }));
          
          Logger.table(simplifiedOffers, { context: 'Offers Summary' });
        }
      }
      
      return response;
    } catch (error) {
      Logger.error('Unexpected error in getAllOffers', error as Error, { context: 'offerApi.getAllOffers' });
      throw error;
    }
  },
};

// Export the default API
export default offerApi;
