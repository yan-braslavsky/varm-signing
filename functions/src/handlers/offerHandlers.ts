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
    const slug = request.params[0]?.replace('/offer/', '');
    
    if (!slug) {
      handleError(response, 400, "Missing slug parameter", undefined, { 
        function: "getOffer", 
        path: request.path 
      });
      return;
    }

    logger.info(`Fetching offer: ${slug}`, { 
      function: "getOffer",
      slug
    });
    
    const result = await airtableService.getOffer(slug);
    
    // Log request completion
    logger.info(`Completed getOffer for slug ${slug}`, {
      function: "getOffer",
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
      "Internal server error while fetching offer", 
      { message: errorObj.message, stack: errorObj.stack },
      { function: "getOffer", path: request.path }
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
