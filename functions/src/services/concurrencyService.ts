/**
 * Enhanced Airtable service with concurrency control
 * 
 * This module extends the base airtableService with methods that incorporate 
 * optimistic concurrency control for race conditions when signing offers.
 */

import * as logger from "firebase-functions/logger";
import { setTimeout } from 'timers/promises';
import { airtableService } from './airtableService';
import { ApiResponse, Offer } from '../types';

/**
 * Configuration for concurrency retry attempts
 */
const CONCURRENCY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 200,
  maxDelayMs: 1000,
};

/**
 * Sign an offer with concurrency control
 * This method enhances the standard signOffer with optimistic concurrency control
 * to prevent race conditions when multiple users attempt to sign the same offer.
 */
export async function signOfferWithConcurrencyControl(
  slug: string
): Promise<ApiResponse<Offer>> {
  let attempt = 0;

  while (attempt < CONCURRENCY_CONFIG.maxRetries) {
    attempt++;
    
    // Add logging for retry attempts
    if (attempt > 1) {
      logger.info(`Retry attempt ${attempt}/${CONCURRENCY_CONFIG.maxRetries} for signing offer ${slug}`);
    }

    // Step 1: Get the current state of the offer
    const offerResponse = await airtableService.getOffer(slug);
    
    if (offerResponse.error || !offerResponse.data) {
      logger.warn(`Cannot sign offer - getOffer failed: ${offerResponse.error}`, { 
        slug, 
        status: offerResponse.status 
      });
      return offerResponse;
    }
    
    // Check if offer is already signed
    if (offerResponse.data.isSigned) {
      logger.info(`Offer ${slug} already signed at ${offerResponse.data.signedAt}`);
      return {
        error: 'This offer has already been signed',
        status: 409,
      };
    }

    // Step 2: Attempt to sign the offer
    const signResponse = await airtableService.signOffer(slug);
    
    // If successful or if it's an error that's not related to a concurrency issue, return the response
    if (signResponse.status === 200 || (signResponse.status !== 409 && signResponse.status !== 412)) {
      return signResponse;
    }

    // If we reach here, there was likely a concurrency issue (status 409 or 412)
    logger.info(`Possible concurrency issue detected for offer ${slug} on attempt ${attempt}`, {
      status: signResponse.status,
      error: signResponse.error
    });

    // Exponential backoff with jitter
    if (attempt < CONCURRENCY_CONFIG.maxRetries) {
      const baseDelay = Math.min(
        CONCURRENCY_CONFIG.maxDelayMs,
        CONCURRENCY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1)
      );
      const jitter = Math.random() * 0.3 * baseDelay;
      const delayMs = Math.floor(baseDelay + jitter);
      
      logger.info(`Waiting ${delayMs}ms before retrying sign operation for offer ${slug}`);
      await setTimeout(delayMs);
    }
  }

  // If we've exhausted our retries, return the appropriate error
  return {
    error: `Failed to sign offer after ${CONCURRENCY_CONFIG.maxRetries} attempts due to concurrent modifications`,
    status: 409,
  };
}
