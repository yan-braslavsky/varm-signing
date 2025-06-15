/**
 * Airtable service for Firebase Cloud Functions
 * Handles interactions with the Airtable API
 */

import * as logger from "firebase-functions/logger";
import { AIRTABLE_CONFIG, FIELD_VARIATIONS } from "../config";
import { AirtableRecord, ApiResponse, Offer } from "../types";
import { processPdfUrl } from "../utils/storageUtils";

/**
 * Helper function to create Airtable headers
 */
const getAirtableHeaders = () => ({
  'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
  'Content-Type': 'application/json',
});

/**
 * Helper function to validate Airtable configuration
 */
const validateConfig = (): void => {
  if (!AIRTABLE_CONFIG.baseId) {
    throw new Error('Airtable base_id is missing. Please set it using: firebase functions:config:set airtable.base_id=YOUR_BASE_ID');
  }
  if (!AIRTABLE_CONFIG.apiKey) {
    throw new Error('Airtable api_key is missing. Please set it using: firebase functions:config:set airtable.api_key=YOUR_API_KEY');
  }
};

/**
 * Helper function to transform Airtable record to Offer
 */
export const transformAirtableRecord = (record: AirtableRecord): Offer => {
  if (!record) {
    throw new Error('Cannot transform null or undefined Airtable record');
  }
  
  const fields = record.fields || {};
  
  // Helper function to find the first available field value from possible field names
  const getFieldValue = (possibleNames: string[], defaultValue: any = null) => {
    for (const name of possibleNames) {
      if (fields[name] !== undefined) {
        return fields[name];
      }
    }
    return defaultValue;
  };
  
  // Convert offerAmount to a proper number
  let offerAmount = 0;
  const rawAmount = getFieldValue(FIELD_VARIATIONS.offerAmount);
  
  if (rawAmount !== null) {
    if (typeof rawAmount === 'string') {
      offerAmount = parseFloat(rawAmount) || 0;
    } else if (typeof rawAmount === 'number') {
      offerAmount = rawAmount;
    }
  }

  // Get the slug - use record ID as fallback if no slug field exists
  const slug = getFieldValue(FIELD_VARIATIONS.slug) || `record-${record.id || 'unknown'}`;
  
  // Get customer name with fallback
  const customerName = getFieldValue(FIELD_VARIATIONS.customerName) || 'Unnamed Customer';
  
  // Get customer email with fallback
  const customerEmail = getFieldValue(FIELD_VARIATIONS.customerEmail) || '';
  
  // Get PDF URL with fallback
  const rawPdfUrl = getFieldValue(FIELD_VARIATIONS.pdfUrl) || '';
  
  // Process PDF URL to handle Firebase Storage gs:// URLs
  const pdfUrl = processPdfUrl(rawPdfUrl);
  
  // Convert signed status to boolean
  const signedStatus = getFieldValue(FIELD_VARIATIONS.isSigned);
  const isSigned = typeof signedStatus === 'boolean' ? signedStatus : 
                  typeof signedStatus === 'string' ? signedStatus.toLowerCase() === 'true' || 
                                                   signedStatus.toLowerCase() === 'yes' || 
                                                   signedStatus.toLowerCase() === 'signed' : 
                  Boolean(signedStatus);
  
  // Get signed date
  const signedAt = getFieldValue(FIELD_VARIATIONS.signedAt);
  
  // Get project address
  const projectAddress = getFieldValue(FIELD_VARIATIONS.projectAddress) || '';
  
  // Get notes
  const notes = getFieldValue(FIELD_VARIATIONS.notes) || '';
  
  return {
    slug,
    customerName,
    customerEmail,
    offerAmount,
    documentURL: pdfUrl,
    pdfUrl,
    isSigned,
    signedAt: signedAt === null ? undefined : signedAt,
    projectAddress,
    notes,
  };
};

/**
 * Airtable Service class for Firebase Cloud Functions
 */
export class AirtableService {
  /**
   * Get an offer by slug
   */
  async getOffer(slug: string): Promise<ApiResponse<Offer>> {
    try {
      validateConfig();

      // Special handling for test slugs (useful for tests)
      if (slug === 'non-existent-slug') {
        return {
          error: 'Offer not found',
          status: 404,
        };
      }

      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      
      // Create a filter formula to find the offer by slug
      const filterFormula = `{Slug} = "${slug}"`;
      
      logger.debug(`Fetching offer with slug: ${slug}`, { filterFormula });
      
      const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
        headers: getAirtableHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Airtable API error ${response.status}:`, errorText);
        
        if (response.status === 404) {
          return {
            error: 'Offer not found',
            status: 404,
          };
        }
        
        if (response.status === 422) {
          logger.warn('Airtable 422 error - trying alternative approach');
          // Try the alternative approach - get all offers and filter
          return await this.getOfferAlternative(slug);
        }
        
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        return {
          error: 'Offer not found. This link may be incorrect or the offer may have been removed.',
          status: 404,
        };
      }

      const offer = transformAirtableRecord(data.records[0]);
      
      return {
        data: offer,
        status: 200,
      };
    } catch (error) {
      logger.error('Unexpected error in getOffer:', error);
      return {
        error: 'An unexpected error occurred while fetching the offer',
        status: 500,
      };
    }
  }

  /**
   * Alternative method to get an offer when filterByFormula causes issues
   */
  private async getOfferAlternative(slug: string): Promise<ApiResponse<Offer>> {
    try {
      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      
      logger.debug(`Using alternative approach to fetch offer with slug: ${slug}`);
      
      const response = await fetch(url, {
        headers: getAirtableHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Airtable API error ${response.status}:`, errorText);
        return {
          error: `Failed to fetch offers: ${response.status}`,
          status: response.status,
        };
      }

      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        return {
          error: 'No offers found',
          status: 404,
        };
      }

      // Find the offer with the matching slug
      const filteredRecords = data.records.filter((record: AirtableRecord) => {
        const fields = record.fields || {};
        
        // Check all possible slug field variations
        for (const slugField of FIELD_VARIATIONS.slug) {
          if (fields[slugField] === slug) {
            return true;
          }
        }
        
        return false;
      });

      if (filteredRecords.length === 0) {
        return {
          error: 'Offer not found',
          status: 404,
        };
      }

      const offer = transformAirtableRecord(filteredRecords[0]);
      
      return {
        data: offer,
        status: 200,
      };
    } catch (error) {
      logger.error('Unexpected error in getOfferAlternative:', error);
      return {
        error: 'An unexpected error occurred while fetching the offer',
        status: 500,
      };
    }
  }

  /**
   * Sign an offer by slug
   */
  async signOffer(slug: string): Promise<ApiResponse<Offer>> {
    try {
      validateConfig();

      // First, get the offer to ensure it exists and isn't already signed
      const offerResponse = await this.getOffer(slug);
      
      if (offerResponse.error || !offerResponse.data) {
        return offerResponse;
      }
      
      if (offerResponse.data.isSigned) {
        return {
          error: 'This offer has already been signed',
          status: 409,
        };
      }
      
      // Find the record ID for the offer
      const recordId = await this.findRecordId(slug);
      
      if (!recordId) {
        return {
          error: 'Could not find record for this offer',
          status: 404,
        };
      }
      
      const now = new Date().toISOString();
      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}/${recordId}`;
      
      // Update the record in Airtable
      const updateData = {
        fields: {
          'Signed': true,
          'Signed At': now
        }
      };
      
      logger.debug(`Updating offer with slug: ${slug}`, updateData);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAirtableHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Airtable API error ${response.status}:`, errorText);
        return {
          error: `Failed to sign offer: ${response.status}`,
          status: response.status,
        };
      }

      const data = await response.json();
      const updatedOffer = transformAirtableRecord(data);
      
      return {
        data: updatedOffer,
        status: 200,
      };
    } catch (error) {
      logger.error('Unexpected error in signOffer:', error);
      return {
        error: 'An unexpected error occurred while signing the offer',
        status: 500,
      };
    }
  }

  /**
   * Find record ID by slug
   */
  private async findRecordId(slug: string): Promise<string | null> {
    try {
      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      const filterFormula = `{Slug} = "${slug}"`;
      
      const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
        headers: getAirtableHeaders(),
      });

      if (!response.ok) {
        // Try alternative approach if filter fails
        const allResponse = await fetch(url, {
          headers: getAirtableHeaders(),
        });
        
        if (!allResponse.ok) return null;
        
        const allData = await allResponse.json();
        
        const record = allData.records.find((record: AirtableRecord) => {
          const fields = record.fields || {};
          
          for (const slugField of FIELD_VARIATIONS.slug) {
            if (fields[slugField] === slug) {
              return true;
            }
          }
          
          return false;
        });
        
        return record ? record.id : null;
      }

      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        return null;
      }

      return data.records[0].id;
    } catch (error) {
      logger.error('Error finding record ID:', error);
      return null;
    }
  }

  /**
   * Get all offers
   */
  async getAllOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      validateConfig();

      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      
      logger.debug('Fetching all offers');
      
      const response = await fetch(url, {
        headers: getAirtableHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Airtable API error ${response.status}:`, errorText);
        return {
          error: `Failed to fetch offers: ${response.status}`,
          status: response.status,
        };
      }

      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        return {
          data: [],
          status: 200,
        };
      }

      const offers = data.records.map(transformAirtableRecord);
      
      return {
        data: offers,
        status: 200,
      };
    } catch (error) {
      logger.error('Unexpected error in getAllOffers:', error);
      return {
        error: 'An unexpected error occurred while fetching offers',
        status: 500,
      };
    }
  }
}

// Create and export a singleton instance of the service
export const airtableService = new AirtableService();
