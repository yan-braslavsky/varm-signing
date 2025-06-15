/**
 * Authentication middleware for Firebase Cloud Functions
 */
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { API_CONFIG } from "../config";

// Types for our middleware
type Request = ExpressRequest | any;
type Response = ExpressResponse | any;

/**
 * Middleware to verify Firebase Auth tokens
 */
export const verifyFirebaseAuth = async (request: Request, response: Response, next: NextFunction) => {
  try {
    // Skip auth for development environment if configured
    if (API_CONFIG.skipAuthInDevelopment && process.env.NODE_ENV === 'development') {
      logger.warn('Skipping authentication in development environment');
      return next();
    }

    // Get the Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Unauthorized request: Missing or invalid Authorization header');
      return response.status(401).json({
        error: 'Unauthorized: Missing or invalid authentication token',
        status: 401
      });
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Attach user info to request for use in route handlers
      request.user = decodedToken;
      
      // Continue to the next middleware or handler
      return next();
    } catch (tokenError) {
      logger.warn('Invalid Firebase token', tokenError);
      return response.status(403).json({
        error: 'Forbidden: Invalid authentication token',
        status: 403
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', error);
    return response.status(500).json({
      error: 'Internal server error in authentication middleware',
      status: 500
    });
  }
};

/**
 * Middleware to verify API key
 */
export const verifyApiKey = (request: Request, response: Response, next: NextFunction) => {
  try {
    // Skip auth for development environment if configured
    if (API_CONFIG.skipAuthInDevelopment && process.env.NODE_ENV === 'development') {
      logger.warn('Skipping API key verification in development environment');
      return next();
    }

    // Get the API key from header
    const apiKey = request.headers['x-api-key'];
    
    if (!apiKey || apiKey !== API_CONFIG.apiKey) {
      logger.warn('Unauthorized request: Invalid API key');
      return response.status(401).json({
        error: 'Unauthorized: Invalid API key',
        status: 401
      });
    }
    
    // API key is valid, continue
    return next();
  } catch (error) {
    logger.error('API key verification error', error);
    return response.status(500).json({
      error: 'Internal server error in API key verification',
      status: 500
    });
  }
};

/**
 * Middleware that checks CORS origin
 */
export const checkOrigin = (request: Request, response: Response, next: NextFunction) => {
  try {
    // Skip origin check for development environment if configured
    if (API_CONFIG.skipOriginCheckInDevelopment && process.env.NODE_ENV === 'development') {
      logger.warn('Skipping origin check in development environment');
      return next();
    }

    const origin = request.headers.origin;
    
    // If no allowed origins defined or options request, continue
    if (!API_CONFIG.allowedOrigins || request.method === 'OPTIONS') {
      return next();
    }
    
    // Check if origin is in allowed list
    if (origin && API_CONFIG.allowedOrigins.includes(origin)) {
      return next();
    } else {
      logger.warn(`Unauthorized origin: ${origin}`);
      return response.status(403).json({
        error: 'Forbidden: Origin not allowed',
        status: 403
      });
    }
  } catch (error) {
    logger.error('Origin check error', error);
    return response.status(500).json({
      error: 'Internal server error in origin verification',
      status: 500
    });
  }
};
