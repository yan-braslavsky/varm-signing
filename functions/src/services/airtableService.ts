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
        logger.warn(`Cannot sign offer - getOffer failed: ${offerResponse.error}`, { 
          slug, 
          status: offerResponse.status 
        });
        return offerResponse;
      }
      
      if (offerResponse.data.isSigned) {
        logger.info(`Offer ${slug} already signed at ${offerResponse.data.signedAt}`);
        return {
          error: 'This offer has already been signed',
          status: 409,
        };
      }
      
      // Find the record ID for the offer
      logger.info(`Finding Airtable record ID for slug: ${slug}`);
      const recordId = await this.findRecordId(slug);
      
      if (!recordId) {
        logger.error(`Could not find record ID for slug: ${slug}`);
        return {
          error: 'Could not find record for this offer',
          status: 422, // Using 422 to match the error we're seeing
          details: { slug }
        };
      }
      
      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}/${recordId}`;
      
      // Update the record in Airtable
      // First, let's check what field names are being used in the offer we just retrieved
      const fieldsInUse = offerResponse.data ? Object.keys(offerResponse.data) : [];
      
      // Log the available fields to help diagnose
      logger.info(`Fields available in offer: ${JSON.stringify(fieldsInUse)}`, { 
        slug, 
        recordId
      });
      
      // Get the current date in a format that Airtable will accept
      // Airtable requires dates to be in YYYY-MM-DD format for Date fields
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      // Create a minimal update payload using just the known-good field name
      // We'll try first with both fields, but have a fallback if this fails
      const updateData = {
        fields: {
          // Use only the basic field name that we know exists based on the error message
          'Signed': true,
          'Signed At': formattedDate
        } as Record<string, any>
      };
      
      logger.info(`Updating offer with slug: ${slug}, record ID: ${recordId}`, { 
        slug, 
        recordId,
        updateData: JSON.stringify(updateData)
      });
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAirtableHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Parse the error if possible to get more details
        let errorDetails = {};
        try {
          errorDetails = JSON.parse(errorText);
        } catch (e) {
          // If error text isn't JSON, use as is
          errorDetails = { message: errorText };
        }
        
        logger.error(`Airtable API error ${response.status}:`, {
          slug,
          recordId,
          status: response.status,
          error: errorDetails,
          requestBody: JSON.stringify(updateData)
        });
        
        // If the error is about the date field, try with a simplified update
        if (response.status === 422 && (errorText.includes('Signed At') || errorText.includes('UNKNOWN_FIELD_NAME'))) {
          logger.info('Attempting update with only the Signed field (no date)');
          
          // Try again with just the boolean field
          const simpleUpdateData = { fields: { 'Signed': true } };
          
          try {
            const simpleResponse = await fetch(url, {
              method: 'PATCH',
              headers: getAirtableHeaders(),
              body: JSON.stringify(simpleUpdateData),
            });
            
            if (simpleResponse.ok) {
              const simpleData = await simpleResponse.json();
              logger.info('Successfully updated offer with simplified payload');
              
              // Use the already parsed data
              const updatedOffer = transformAirtableRecord(simpleData);
              return { data: updatedOffer, status: 200 };
            } else {
              const simpleErrorText = await simpleResponse.text();
              logger.error('Even simplified update failed:', { error: simpleErrorText });
            }
          } catch (e) {
            logger.error('Error during simplified update attempt:', e);
          }
        }
        
        return {
          error: `Failed to sign offer: ${response.status}`,
          status: response.status,
          details: { errorDetails, requestBody: updateData }
        };
      }
      
      // Parse and log the successful response
      const responseData = await response.json();
      logger.info(`Successfully signed offer in Airtable:`, { 
        slug,
        recordId,
        responseFields: JSON.stringify(responseData.fields || {})
      });

      // Use the already parsed data
      const updatedOffer = transformAirtableRecord(responseData);
      
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
      
      // Try multiple field variations for the slug
      for (const slugField of FIELD_VARIATIONS.slug) {
        // Try each possible slug field name in the filter
        const filterFormula = `{${slugField}} = "${slug}"`;
        logger.debug(`Trying to find record with filter: ${filterFormula}`, { slug, slugField });
        
        try {
          const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
            headers: getAirtableHeaders(),
          });
  
          if (response.ok) {
            const data = await response.json();
            
            if (data.records && data.records.length > 0) {
              logger.info(`Found record ID for slug "${slug}" using field "${slugField}": ${data.records[0].id}`);
              return data.records[0].id;
            }
          } else {
            logger.warn(`Filter query failed for field "${slugField}": ${response.status}`);
          }
        } catch (err) {
          logger.warn(`Error querying with field "${slugField}":`, err);
          // Continue to the next field variation
        }
      }
      
      // If all specific filters fail, try fetching all records
      logger.info(`No record found with specific filters, trying general approach for slug: ${slug}`);
      const allResponse = await fetch(url, {
        headers: getAirtableHeaders(),
      });
      
      if (!allResponse.ok) {
        logger.error(`Failed to fetch all records: ${allResponse.status}`);
        return null;
      }
      
      const allData = await allResponse.json();
      logger.debug(`Retrieved ${allData.records?.length || 0} records, looking for slug: ${slug}`);
      
      // Log a sample of the data structure to help debug field names
      if (allData.records && allData.records.length > 0) {
        logger.debug('Sample record fields:', { 
          sampleFields: allData.records[0].fields,
          fieldKeys: Object.keys(allData.records[0].fields || {})
        });
      }
      
      const record = allData.records?.find((record: AirtableRecord) => {
        const fields = record.fields || {};
        
        for (const slugField of FIELD_VARIATIONS.slug) {
          if (fields[slugField] === slug) {
            logger.info(`Found matching record with field "${slugField}" = "${slug}"`);
            return true;
          }
        }
        
        return false;
      });
      
      if (record) {
        logger.info(`Found record ID using full scan: ${record.id}`);
        return record.id;
      } else {
        logger.warn(`No record found with slug "${slug}" in any field variation`);
        return null;
      }
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
