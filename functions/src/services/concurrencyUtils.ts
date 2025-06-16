/**
 * Utilities for handling concurrency issues with Airtable
 */

import * as logger from "firebase-functions/logger";
import { setTimeout } from 'timers/promises';
import { ApiResponse } from "../types";

/**
 * Configuration for retry attempts
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 200,
  maxDelayMs: 1000,
};

/**
 * Exponential backoff calculation
 * @param attempt - Current attempt number (starting at 1)
 * @returns Delay in milliseconds
 */
export const calculateBackoff = (attempt: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.maxDelayMs,
    RETRY_CONFIG.initialDelayMs * Math.pow(1.5, attempt - 1)
  );
  
  // Add some jitter to prevent synchronized retries
  const jitter = Math.random() * 0.3 * delay;
  return Math.round(delay + jitter);
};

/**
 * Generic retry function with exponential backoff
 * @param operation - Async function to retry
 * @param shouldRetry - Function to determine if retry is needed based on result
 * @param context - Context for logging
 * @returns The result of the operation
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  shouldRetry: (result: T) => boolean,
  context: string
): Promise<T> => {
  let attempt = 1;
  
  while (true) {
    const result = await operation();
    
    if (!shouldRetry(result) || attempt >= RETRY_CONFIG.maxRetries) {
      if (attempt > 1) {
        logger.info(`Operation succeeded after ${attempt} attempts`, { context });
      }
      return result;
    }
    
    const delay = calculateBackoff(attempt);
    logger.info(`Attempt ${attempt} failed, retrying in ${delay}ms`, { context });
    
    await setTimeout(delay);
    attempt++;
  }
};

/**
 * Determines if an API error is due to a concurrency issue
 * @param response - API response
 * @returns True if the error is a concurrency issue
 */
export const isConcurrencyError = (response: ApiResponse<any>): boolean => {
  // Check for specific error messages that indicate concurrency issues
  // This can be expanded based on the error patterns seen in production
  if (!response.error) return false;
  
  const errorText = response.error.toLowerCase();
  return (
    errorText.includes("record modified") ||
    errorText.includes("conflict") ||
    errorText.includes("concurrent") ||
    (response.status === 409 && errorText.includes("already")) ||
    (response.status === 412) // Precondition Failed
  );
};
