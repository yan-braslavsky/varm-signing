/**
 * VARM Digital Signing Cloud Functions
 * Main entry point for Firebase Cloud Functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { getOffer, signOffer, getAllOffers } from "./handlers/offerHandlers";
import { verifyApiKey } from "./middleware/authMiddleware";
import { AIRTABLE_BASE_ID, AIRTABLE_API_KEY, API_KEY, API_BASEURL } from "./config";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Simple ping function for health checks
export const ping = onRequest({ 
  timeoutSeconds: 30,
  region: "us-central1", 
  memory: "256MiB",
  cors: true,
  secrets: [API_KEY, AIRTABLE_BASE_ID, AIRTABLE_API_KEY, API_BASEURL],
}, (request, response) => {
  logger.info("Ping function called", {structuredData: true});
  response.json({
    message: "pong",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API function for offer access
export const api = onRequest({
  timeoutSeconds: 60,
  region: "us-central1",
  memory: "256MiB",
  cors: true,
  secrets: [API_KEY, AIRTABLE_BASE_ID, AIRTABLE_API_KEY, API_BASEURL],
}, (request, response) => {
  const path = request.path || '';
  
  logger.info(`API request: ${request.method} ${path}`, { 
    origin: request.headers.origin,
    path,
    method: request.method,
    ip: request.ip
  });

  if (path === '/ping' || path === '/api/ping') {
    response.json({
      message: "pong from api",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  } else if (path.startsWith('/offer/') && path.endsWith('/sign') && request.method === 'POST') {
    // Handle sign offer request
    signOffer(request, response);
  } else if (path.startsWith('/offer/') && request.method === 'GET') {
    // Handle get offer request
    getOffer(request, response);
  } else if (path === '/offers' && request.method === 'GET') {
    // Handle get all offers request - secured with API key
    verifyApiKey(request, response, () => {
      getAllOffers(request, response);
    });
  } else {
    response.status(404).json({
      error: "API endpoint not found",
      status: 404,
      path: path
    });
  }
});
