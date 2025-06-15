/**
 * REST API Service for Firebase Cloud Functions
 * 
 * This module provides a clean interface for interacting with the Firebase Cloud Functions API.
 * It handles the API requests to the backend instead of directly connecting to Airtable.
 */

import type { Offer, ApiResponse, SignRequest } from '../types/offer.js';
import { Logger } from '../utils/logger';

// API configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL,
};

/**
 * REST API Service for Firebase Cloud Functions
 */
export const restApiService = {
  /**
   * Fetch a single offer by slug
   */
  async getOffer(slug: string): Promise<ApiResponse<Offer>> {
    try {
      Logger.info(`Fetching offer with slug: ${slug} from API`, { 
        context: 'restApiService.getOffer'
      });

      const response = await fetch(`${API_CONFIG.baseUrl}/offer/${slug}`);
      const result = await response.json();
      
      if (!response.ok) {
        Logger.error(`Failed to fetch offer: ${result.error}`, undefined, { 
          context: 'restApiService.getOffer',
          data: { slug, status: result.status }
        });
      } else {
        Logger.debug('Successfully fetched offer from API', { 
          context: 'restApiService.getOffer',
          data: result.data
        });
      }
      
      return result;
    } catch (error) {
      Logger.error('Unexpected error in getOffer', error as Error, { 
        context: 'restApiService.getOffer'
      });
      
      return {
        error: `Failed to fetch offer: ${(error as Error).message}`,
        status: 500
      };
    }
  },

  /**
   * Sign an offer by slug
   */
  async signOffer(slug: string, signRequest: SignRequest = {}): Promise<ApiResponse<Offer>> {
    try {
      Logger.info(`Signing offer with slug: ${slug} via API`, { 
        context: 'restApiService.signOffer',
        data: signRequest
      });

      const response = await fetch(`${API_CONFIG.baseUrl}/offer/${slug}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signRequest)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        Logger.error(`Failed to sign offer: ${result.error}`, undefined, { 
          context: 'restApiService.signOffer',
          data: { slug, status: result.status }
        });
      } else {
        Logger.info('Successfully signed offer via API', { 
          context: 'restApiService.signOffer',
          data: { slug, timestamp: result.data?.signedAt }
        });
      }
      
      return result;
    } catch (error) {
      Logger.error('Unexpected error in signOffer', error as Error, { 
        context: 'restApiService.signOffer'
      });
      
      return {
        error: `Failed to sign offer: ${(error as Error).message}`,
        status: 500
      };
    }
  },

  /**
   * Get all offers
   */
  async getAllOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      Logger.info('Fetching all offers from API', { context: 'restApiService.getAllOffers' });

      const response = await fetch(`${API_CONFIG.baseUrl}/offers`);
      const result = await response.json();
      
      if (!response.ok) {
        Logger.error(`Failed to fetch offers: ${result.error}`, undefined, { 
          context: 'restApiService.getAllOffers',
          data: { status: result.status }
        });
      } else {
        const offerCount = result.data?.length || 0;
        Logger.info(`Successfully fetched ${offerCount} offers from API`, { 
          context: 'restApiService.getAllOffers'
        });
        Logger.debug('Offers data', { 
          context: 'restApiService.getAllOffers',
          data: result.data
        });
        
        // Log as table for better visibility
        if (result.data && result.data.length > 0) {
          const simplifiedOffers = result.data.map((o: Offer) => ({
            slug: o.slug,
            customer: o.customerName,
            amount: o.offerAmount,
            isSigned: o.isSigned,
            signedAt: o.signedAt || 'N/A'
          }));
          
          Logger.table(simplifiedOffers, { context: 'Offers Summary' });
        }
      }
      
      return result;
    } catch (error) {
      Logger.error('Unexpected error in getAllOffers', error as Error, { 
        context: 'restApiService.getAllOffers'
      });
      
      return {
        error: `Failed to fetch offers: ${(error as Error).message}`,
        status: 500
      };
    }
  }
};
