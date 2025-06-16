/**
 * Handler for offer-related API endpoints
 */

import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import * as logger from "firebase-functions/logger";
import { airtableService } from "../services/airtableService";
import { SignRequest } from "../types";

// Use more generic types that work with Firebase Functions
type Request = ExpressRequest | any;
type Response = ExpressResponse | any;

/**
 * Custom error handler to standardize error object structure
 * @param response - Express response object
 * @param statusCode - HTTP status code
 * @param message - Error message
 * @param details - Additional error details (optional)
 */
const handleError = (
  response: Response, 
  statusCode: number, 
  message: string, 
  details?: any,
  loggingMetadata?: Record<string, any>
): void => {
  // Add more robust error logging for local dev
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('[handleError]', { statusCode, message, details, ...loggingMetadata });
  }
  logger.error(message, { 
    statusCode,
    details,
    ...loggingMetadata 
  });
  
  response.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(details ? { details } : {})
  });
};

/**
 * Get an offer by slug
 */
export const getOffer = async (request: Request, response: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    // First check if slug is already available in request.params from our dedicated function
    let slug = request.params?.slug;
    
    // If not found in params, try to extract it from the path (for API function)
    if (!slug) {
      // Extract slug from path using regex for better accuracy
      const match = request.path.match(/\/offer\/?([^/]+)/);
      slug = match ? match[1] : undefined;
    }

    // Log the path and slug for debugging
    logger.debug(`🔍 [getOffer] Path: ${request.path}, Extracted slug: ${slug}`, { 
      function: 'getOffer', 
      path: request.path,
      params: JSON.stringify(request.params || {})
    });

    if (!slug) {
      logger.error('❌ [getOffer] Missing slug parameter', { function: 'getOffer', path: request.path });
      handleError(response, 400, 'Missing slug parameter', undefined, { function: 'getOffer', path: request.path });
      return;
    }

    logger.info(`🔍 [getOffer] Fetching offer: ${slug}`, { function: 'getOffer', slug });

    // Log the filter formula for Airtable
    const filterFormula = `{Slug} = "${slug}"`;
    logger.debug(`🧪 [getOffer] Using filterFormula: ${filterFormula}`);

    const result = await airtableService.getOffer(slug);

    // Log request completion
    if (result.status === 200) {
      logger.info(`✅ [getOffer] Completed getOffer for slug ${slug}`, {
        function: 'getOffer', slug, status: result.status, durationMs: Date.now() - startTime
      });
    } else {
      logger.warn(`⚠️ [getOffer] Offer not found or error for slug ${slug}`, {
        function: 'getOffer', slug, status: result.status, error: result.error, durationMs: Date.now() - startTime
      });
    }

    response.status(result.status).json(result);
  } catch (error) {
    const errorObj = error as Error;
    logger.error(`🔥 [getOffer] Internal server error: ${errorObj.message}`, { function: 'getOffer', path: request.path, stack: errorObj.stack });
    handleError(
      response,
      500,
      'Internal server error while fetching offer',
      { message: errorObj.message, stack: errorObj.stack },
      { function: 'getOffer', path: request.path }
    );
  }
};

/**
 * Sign an offer by slug
 */
export const signOffer = async (request: Request, response: Response): Promise<void> => {
  const startTime = Date.now();
  
  try {
    if (request.method !== 'POST') {
      handleError(response, 405, "Method not allowed", { allowedMethods: ['POST'] }, {
        function: "signOffer", 
        method: request.method
      });
      return;
    }

    const pathParts = request.params[0]?.split('/');
    const slug = pathParts?.[1]; // /offer/:slug/sign
    
    if (!slug) {
      handleError(response, 400, "Missing slug parameter", undefined, { 
        function: "signOffer", 
        path: request.path 
      });
      return;
    }

    // Extract sign request data (for future use, not currently used by airtableService)
    const signRequest: SignRequest = request.body || {};
    
    // Log the sign attempt
    logger.info(`Signing offer: ${slug}`, {
      function: "signOffer",
      slug,
      hasSignature: !!signRequest.signature
    });
    
    const result = await airtableService.signOffer(slug);
    
    // Log request completion
    logger.info(`Completed signOffer for slug ${slug}`, {
      function: "signOffer",
      slug,
      status: result.status,
      durationMs: Date.now() - startTime
    });
    
    response.status(result.status).json(result);
  } catch (error) {
    const errorObj = error as Error;
    handleError(
      response, 
      500, 
      "Internal server error while signing offer", 
      { message: errorObj.message, stack: errorObj.stack },
      { function: "signOffer", slug: request.params[0]?.split('/')?.[1] }
    );
  }
};

/**
 * Get all offers
 */
export const getAllOffers = async (_request: Request, response: Response): Promise<void> => {
  const startTime = Date.now();
  
  try {
    logger.info("Fetching all offers", { function: "getAllOffers" });
    const result = await airtableService.getAllOffers();
    
    // Log request completion with helpful metrics
    logger.info(`Completed getAllOffers`, {
      function: "getAllOffers",
      status: result.status,
      count: result.data?.length || 0,
      durationMs: Date.now() - startTime
    });
    
    response.status(result.status).json(result);
  } catch (error) {
    const errorObj = error as Error;
    handleError(
      response, 
      500, 
      "Internal server error while fetching all offers", 
      { message: errorObj.message, stack: errorObj.stack },
      { function: "getAllOffers" }
    );
  }
};
