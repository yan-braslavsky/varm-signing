/**
 * VARM Digital Signing Cloud Functions
 * Main entry point for Firebase Cloud Functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as cors from "cors";
import * as admin from "firebase-admin";
import { ALLOWED_ORIGINS } from "./config";
import { getOffer, signOffer, getAllOffers } from "./handlers/offerHandlers";
import { verifyApiKey } from "./middleware/authMiddleware";

// Initialize Firebase Admin SDK
admin.initializeApp();

// CORS configuration for cross-origin requests
const corsHandler = cors.default({
  origin: ALLOWED_ORIGINS,
  credentials: true,
});

/**
 * GET /api/offer/:slug - Fetch offer details
 */
export const getOfferFunction = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    await getOffer(request, response);
  });
});

/**
 * POST /api/offer/:slug/sign - Sign an offer
 */
export const signOfferFunction = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    await signOffer(request, response);
  });
});

/**
 * GET /api/offers - Fetch all offers (secured with API key)
 */
export const getAllOffersFunction = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    // Apply API key verification for this sensitive endpoint
    verifyApiKey(request, response, async () => {
      await getAllOffers(request, response);
    });
  });
});

/**
 * Simple ping function for health checks
 */
export const ping = onRequest((request, response) => {
  corsHandler(request, response, () => {
    logger.info("Ping function called", {structuredData: true});
    response.json({
      message: "pong",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });
});

/**
 * Root API handler - routes requests to appropriate functions
 */
export const api = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    const path = request.params[0] || '';
    
    logger.info(`API request: ${request.method} ${path}`, { 
      origin: request.headers.origin,
      path,
      method: request.method,
      ip: request.ip
    });

    if (path.startsWith('offer/') && path.endsWith('/sign') && request.method === 'POST') {
      // Handle sign offer request
      await signOffer(request, response);
    } else if (path.startsWith('offer/') && request.method === 'GET') {
      // Handle get offer request
      await getOffer(request, response);
    } else if (path === 'offers' && request.method === 'GET') {
      // Handle get all offers request - secured with API key
      verifyApiKey(request, response, async () => {
        await getAllOffers(request, response);
      });
    } else {
      response.status(404).json({
        error: "API endpoint not found",
        status: 404,
        path: path
      });
    }
  });
});
