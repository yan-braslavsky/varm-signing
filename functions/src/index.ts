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

// Dedicated offers function with proper CORS handling
export const offers = onRequest({
  timeoutSeconds: 60,
  region: "us-central1",
  memory: "256MiB",
  cors: true,
  secrets: [API_KEY, AIRTABLE_BASE_ID, AIRTABLE_API_KEY, API_BASEURL],
}, (request, response) => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    response.set({
      'Access-Control-Allow-Origin': request.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': request.headers['access-control-request-headers'] || 'Content-Type,Authorization,x-api-key',
      'Access-Control-Max-Age': '3600',
    });
    response.status(204).send('');
    return;
  }

  // Set CORS headers for normal requests
  response.set({
    'Access-Control-Allow-Origin': request.headers.origin || '*',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-api-key',
  });

  logger.info("Offers function called directly", { 
    origin: request.headers.origin,
    method: request.method,
    ip: request.ip
  });
  
  if (request.method === 'GET') {
    // Verify API key and get all offers
    verifyApiKey(request, response, () => {
      getAllOffers(request, response);
    });
  } else {
    response.status(405).json({
      error: "Method not allowed",
      status: 405,
      method: request.method
    });
  }
});

// Dedicated offer function for individual offer operations (get/sign)
export const offer = onRequest({
  timeoutSeconds: 60,
  region: "us-central1",
  memory: "256MiB",
  cors: true,
  secrets: [API_KEY, AIRTABLE_BASE_ID, AIRTABLE_API_KEY, API_BASEURL],
}, (request, response) => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    response.set({
      'Access-Control-Allow-Origin': request.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': request.headers['access-control-request-headers'] || 'Content-Type,Authorization,x-api-key',
      'Access-Control-Max-Age': '3600',
    });
    response.status(204).send('');
    return;
  }

  // Set CORS headers for normal requests
  response.set({
    'Access-Control-Allow-Origin': request.headers.origin || '*',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-api-key',
  });

  // Get the path and extract the slug
  const path = request.path || '';
  logger.info(`Offer function called directly: ${request.method} ${path}`, { 
    origin: request.headers.origin,
    path,
    method: request.method,
    ip: request.ip
  });
  
  // Extract the slug from the request path
  // For URLs like:
  // - https://us-central1-varm-55a88.cloudfunctions.net/offer/offer003
  // - https://us-central1-varm-55a88.cloudfunctions.net/offer/offer003/sign
  const pathSegments = path.split('/').filter(segment => segment.length > 0);
  
  let slug = '';
  let isSignRequest = false;
  
  // Check if this is a sign request
  if (pathSegments.length >= 2 && pathSegments[1] === 'sign') {
    slug = pathSegments[0];
    isSignRequest = true;
  } else if (pathSegments.length > 0) {
    slug = pathSegments[0];
  }
  
  logger.info(`Processing offer: slug="${slug}", isSignRequest=${isSignRequest}`, { 
    context: 'offer',
    path,
    slug,
    pathSegments,
    isSignRequest
  });

  // Update the request object with the extracted slug and additional metadata
  if (isSignRequest) {
    // Format for signOffer handler which expects params[0] to be '/offer/slug/sign'
    request.params = { 
      ...request.params, 
      0: `/offer/${slug}/sign`,
      slug
    };
  } else {
    request.params = { 
      ...request.params, 
      slug
    };
  }
  
  // Check if we're handling a sign request or a get request
  if (isSignRequest && request.method === 'POST') {
    // Handle sign offer request
    signOffer(request, response);
  } else if (request.method === 'GET' && slug) {
    // Handle get offer request with the extracted slug
    verifyApiKey(request, response, () => {
      getOffer(request, response);
    });
  } else {
    response.status(405).json({
      error: "Method not allowed",
      status: 405,
      method: request.method
    });
  }
});

// API function for offer access
export const api = onRequest({
  timeoutSeconds: 60,
  region: "us-central1",
  memory: "256MiB",
  cors: true,
  secrets: [API_KEY, AIRTABLE_BASE_ID, AIRTABLE_API_KEY, API_BASEURL],
}, (request, response) => {
  // Handle CORS preflight (OPTIONS) requests for all endpoints
  if (request.method === 'OPTIONS') {
    // Always set CORS headers for preflight
    response.set({
      'Access-Control-Allow-Origin': request.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': request.headers['access-control-request-headers'] || 'Content-Type,Authorization,x-api-key',
      'Access-Control-Max-Age': '3600',
    });
    response.status(204).send('');
    return;
  }

  // Always set CORS headers for all responses
  response.set({
    'Access-Control-Allow-Origin': request.headers.origin || '*',
    'Vary': 'Origin',
  });

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
