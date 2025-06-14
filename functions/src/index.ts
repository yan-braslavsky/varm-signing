/**
 * VARM Digital Signing Cloud Functions
 * Handles offer management and Airtable integration
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as cors from "cors";

// CORS configuration for cross-origin requests
const corsHandler = cors.default({
  origin: [
    "http://localhost:5174",
    "http://localhost:5173", 
    "https://varm-signing.web.app",
    "https://varm-signing.firebaseapp.com"
  ],
  credentials: true,
});

// Mock Airtable data for development
interface Offer {
  slug: string;
  customerName: string;
  offerAmount: number;
  pdfUrl: string;
  isSigned: boolean;
  signedAt?: string;
}

const mockOffers: Record<string, Offer> = {
  'test-offer-123': {
    slug: 'test-offer-123',
    customerName: 'John Doe',
    offerAmount: 150000,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isSigned: false,
  },
  'signed-offer-456': {
    slug: 'signed-offer-456',
    customerName: 'Jane Smith', 
    offerAmount: 275000,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isSigned: true,
    signedAt: '2024-06-14T10:30:00Z',
  },
  'offer-789': {
    slug: 'offer-789',
    customerName: 'Alice Johnson',
    offerAmount: 320000,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isSigned: false,
  },
};

/**
 * GET /api/offer/:slug - Fetch offer details
 */
export const getOffer = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    try {
      const slug = request.params[0]?.replace('api/offer/', '');
      
      if (!slug) {
        logger.warn("Missing slug parameter");
        response.status(400).json({
          error: "Missing slug parameter",
          status: 400
        });
        return;
      }

      logger.info(`Fetching offer: ${slug}`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const offer = mockOffers[slug];
      
      if (!offer) {
        logger.warn(`Offer not found: ${slug}`);
        response.status(404).json({
          error: "Offer not found",
          status: 404
        });
        return;
      }

      logger.info(`Offer found: ${slug}`, {offer});
      response.status(200).json({
        data: offer,
        status: 200
      });

    } catch (error) {
      logger.error("Error fetching offer:", error);
      response.status(500).json({
        error: "Internal server error",
        status: 500
      });
    }
  });
});

/**
 * POST /api/offer/:slug/sign - Sign an offer
 */
export const signOffer = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({
          error: "Method not allowed",
          status: 405
        });
        return;
      }

      const pathParts = request.params[0]?.split('/');
      const slug = pathParts?.[2]; // api/offer/:slug/sign
      
      if (!slug) {
        logger.warn("Missing slug parameter");
        response.status(400).json({
          error: "Missing slug parameter", 
          status: 400
        });
        return;
      }

      logger.info(`Signing offer: ${slug}`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const offer = mockOffers[slug];
      
      if (!offer) {
        logger.warn(`Offer not found: ${slug}`);
        response.status(404).json({
          error: "Offer not found",
          status: 404
        });
        return;
      }

      if (offer.isSigned) {
        logger.warn(`Offer already signed: ${slug}`);
        response.status(409).json({
          error: "Offer has already been signed",
          status: 409
        });
        return;
      }

      // Update the offer (in real implementation, this would update Airtable)
      const updatedOffer = {
        ...offer,
        isSigned: true,
        signedAt: new Date().toISOString(),
      };

      mockOffers[slug] = updatedOffer;

      logger.info(`Offer signed successfully: ${slug}`, {updatedOffer});
      response.status(200).json({
        data: updatedOffer,
        status: 200
      });

    } catch (error) {
      logger.error("Error signing offer:", error);
      response.status(500).json({
        error: "Internal server error",
        status: 500
      });
    }
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
    
    logger.info(`API request: ${request.method} ${path}`);

    if (path.startsWith('offer/') && path.endsWith('/sign') && request.method === 'POST') {
      // Redirect to signOffer function
      const slug = path.split('/')[1];
      request.params[0] = `api/offer/${slug}/sign`;
      return signOffer(request, response);
    } else if (path.startsWith('offer/') && request.method === 'GET') {
      // Redirect to getOffer function  
      const slug = path.split('/')[1];
      request.params[0] = `api/offer/${slug}`;
      return getOffer(request, response);
    } else {
      response.status(404).json({
        error: "API endpoint not found",
        status: 404,
        path: path
      });
    }
  });
});
