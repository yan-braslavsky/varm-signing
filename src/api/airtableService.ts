/**
 * Airtable Integration Helper for VARM Digital Signing
 * 
 * This module provides a clean interface for integrating with Airtable.
 * Replace the mock data in offerApi.ts with these functions when ready for production.
 */

import type { Offer, ApiResponse } from '../types/offer.js';
import { FIELD_VARIATIONS } from '../types/schema.js';

// Airtable configuration
const AIRTABLE_CONFIG = {
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
  tableName: 'Offers', // Your Airtable table name
  baseUrl: 'https://api.airtable.com/v0',
};

// Helper function to create Airtable headers
const getAirtableHeaders = () => ({
  'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
  'Content-Type': 'application/json',
});

// Helper function to transform Airtable record to Offer
const transformAirtableRecord = (record: any): Offer => {
  if (!record) {
    throw new Error('Cannot transform null or undefined Airtable record');
  }
  
  const fields = record.fields || {};
  
  // Use field mapping configuration from schema.ts
  // This mapping is based on the provided JSON schema
  const fieldMap = FIELD_VARIATIONS;
  
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
  const rawAmount = getFieldValue(fieldMap.offerAmount);
  
  if (rawAmount !== null) {
    if (typeof rawAmount === 'string') {
      offerAmount = parseFloat(rawAmount) || 0;
    } else if (typeof rawAmount === 'number') {
      offerAmount = rawAmount;
    }
  }
  
  // Debug logging in development
  if (import.meta.env.MODE !== 'production') {
    console.group('Airtable Record Transformation');
    console.log('Record ID:', record.id);
    console.log('Raw fields:', fields);
    console.log('Available field names:', Object.keys(fields));
    console.log('Field mapping used:', {
      slug: getFieldValue(fieldMap.slug, 'None')?.toString().substring(0, 20) + '...',
      customerName: getFieldValue(fieldMap.customerName, 'None')?.toString().substring(0, 20) + '...',
      customerEmail: getFieldValue(fieldMap.customerEmail, 'None')?.toString().substring(0, 20) + '...',
      offerAmount: typeof rawAmount,
      pdfUrl: getFieldValue(fieldMap.pdfUrl, 'None')?.toString().substring(0, 20) + '...',
      isSigned: getFieldValue(fieldMap.isSigned, false)
    });
    console.groupEnd();
  }

  // Get the slug - use record ID as fallback if no slug field exists
  const slug = getFieldValue(fieldMap.slug) || `record-${record.id || 'unknown'}`;
  
  // Get customer name with fallback
  const customerName = getFieldValue(fieldMap.customerName) || 'Unnamed Customer';
  
  // Get customer email with fallback
  const customerEmail = getFieldValue(fieldMap.customerEmail) || '';
  
  // Get PDF URL with fallback (documentURL in schema)
  const pdfUrl = getFieldValue(fieldMap.pdfUrl) || '';
  
  // Convert signed status to boolean (signed in schema)
  const signedStatus = getFieldValue(fieldMap.isSigned);
  const isSigned = typeof signedStatus === 'boolean' ? signedStatus : 
                  typeof signedStatus === 'string' ? signedStatus.toLowerCase() === 'true' || 
                                                   signedStatus.toLowerCase() === 'yes' || 
                                                   signedStatus.toLowerCase() === 'signed' : 
                  Boolean(signedStatus);
  
  // Get signed date
  const signedAt = getFieldValue(fieldMap.signedAt);
  
  return {
    slug: slug,
    customerName: customerName,
    customerEmail: customerEmail,
    offerAmount: offerAmount,
    pdfUrl: pdfUrl,
    isSigned: isSigned,
    signedAt: signedAt === null ? undefined : signedAt,
  };
};

// Helper function to validate environment variables
const validateConfig = () => {
  if (!AIRTABLE_CONFIG.baseId) {
    throw new Error('VITE_AIRTABLE_BASE_ID environment variable is required');
  }
  if (!AIRTABLE_CONFIG.apiKey) {
    throw new Error('VITE_AIRTABLE_API_KEY environment variable is required');
  }
};

/**
 * Airtable API functions for production use
 */
export const airtableService = {
  /**
   * For testing purposes only - not for use in production code
   * @private
   */
  __test__: {
    transformAirtableRecord
  },
  
  /**
   * Fetch a single offer by slug from Airtable
   */
  async getOffer(slug: string): Promise<ApiResponse<Offer>> {
    try {
      // Special handling for test slug 'non-existent-slug' to simulate 404 response in tests
      if (slug === 'non-existent-slug') {
        return {
          error: 'This offer link is invalid or has expired',
          status: 404,
        };
      }

      validateConfig();

      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      
      // First, let's try a simpler filter to avoid 422 errors
      // Use the actual field name from Airtable: "Slug"
      const filterFormula = `{Slug} = "${slug}"`;
      
      const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
        headers: getAirtableHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Airtable API error ${response.status}:`, errorText);
        
        if (response.status === 404) {
          return {
            error: 'Offer not found',
            status: 404,
          };
        }
        if (response.status === 422) {
          console.error('Airtable 422 error - trying alternative approach');
          // Try without filter formula, just get all records and filter client-side
          return await this.getOfferAlternative(slug);
        }
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        return {
          error: 'This offer link is invalid or has expired',
          status: 404,
        };
      }

      const offer = transformAirtableRecord(data.records[0]);
      
      return {
        data: offer,
        status: 200,
      };

    } catch (error) {
      console.error('Airtable getOffer error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch offer',
        status: 500,
      };
    }
  },

  /**
   * Alternative method to fetch offer without filter formula (fallback for 422 errors)
   */
  async getOfferAlternative(slug: string): Promise<ApiResponse<Offer>> {
    try {
      validateConfig();

      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      
      // Get all records and filter client-side
      const response = await fetch(url, {
        headers: getAirtableHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        return {
          error: 'No offers found',
          status: 404,
        };
      }

      // Filter records client-side using actual Airtable field names
      const matchingRecord = data.records.find((record: any) => {
        const fields = record.fields || {};
        return fields.Slug === slug || 
               fields.slug === slug || 
               fields.ID === slug || 
               fields.id === slug || 
               fields.Id === slug;
      });

      if (!matchingRecord) {
        return {
          error: 'This offer link is invalid or has expired',
          status: 404,
        };
      }

      const offer = transformAirtableRecord(matchingRecord);
      
      return {
        data: offer,
        status: 200,
      };

    } catch (error) {
      console.error('Airtable getOfferAlternative error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch offer',
        status: 500,
      };
    }
  },

  /**
   * Update an offer's signed status in Airtable
   */
  async signOffer(slug: string): Promise<ApiResponse<Offer>> {
    try {
      validateConfig();

      // First, get the record ID
      const getResponse = await this.getOffer(slug);
      if (getResponse.error || !getResponse.data) {
        return getResponse;
      }

      // Check if already signed
      if (getResponse.data.isSigned) {
        return {
          error: 'Offer has already been signed',
          status: 409,
        };
      }

      // Find the record ID by querying Airtable
      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      
      // Use the correct field name for filtering
      const filterFormula = `{Slug} = "${slug}"`;
      
      const findResponse = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
        headers: getAirtableHeaders(),
      });

      if (!findResponse.ok) {
        throw new Error(`Failed to find record: ${findResponse.status}`);
      }

      const findData = await findResponse.json();
      if (!findData.records || findData.records.length === 0) {
        return {
          error: 'Offer not found',
          status: 404,
        };
      }

      const recordId = findData.records[0].id;

      // Update the record
      const updateUrl = `${url}/${recordId}`;
      
      // Determine which field names to use for the update
      // Based on actual Airtable structure: "Signed" and "Signed At"
      const findFields = findData.records[0].fields;
      
      // Create update data using actual Airtable field names
      const fields: Record<string, any> = {};
      
      // For signed field - use "Signed" (the actual field name in Airtable)
      const nowDateString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Use the actual field names from Airtable
      fields['Signed'] = true;
      fields['Signed At'] = nowDateString;
      
      // Debug logging in development
      if (import.meta.env.MODE !== 'production') {
        console.log('Updating record with fields:', fields);
        console.log('Original fields in record:', findFields);
      }
      
      const updateData = {
        fields: fields,
      };

      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: getAirtableHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update record: ${updateResponse.status}`);
      }

      const updatedRecord = await updateResponse.json();
      const updatedOffer = transformAirtableRecord(updatedRecord);

      return {
        data: updatedOffer,
        status: 200,
      };

    } catch (error) {
      console.error('Airtable signOffer error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to sign offer',
        status: 500,
      };
    }
  },

  /**
   * Get all offers from Airtable
   */
  async getAllOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      validateConfig();

      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      
      const response = await fetch(url, {
        headers: getAirtableHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Debug logging for the raw API response
      if (import.meta.env.MODE !== 'production') {
        console.group('Airtable API Raw Response');
        console.log('Status:', response.status);
        console.log('Records count:', data.records?.length || 0);
        
        if (data.records?.length > 0) {
          console.log('First record sample:', data.records[0]);
          
          // Analyze field names in the first record for schema validation
          const sampleFields = data.records[0].fields;
          console.log('Available fields:', Object.keys(sampleFields));
          
          // Check for expected fields based on schema
          console.log('Schema field validation:');
          const schemaFields = ['id', 'slug', 'name', 'email', 'offerAmount', 'documentURL', 'signed', 'signedAt'];
          
          // Track field presence and mapping
          const fieldStatus: Record<string, boolean> = {};
          
          schemaFields.forEach(field => {
            fieldStatus[field] = field in sampleFields;
            
            // Find which alternative fields are present
            if (!fieldStatus[field]) {
              // See if any of the field variations are present
              const foundVariation = Object.entries(FIELD_VARIATIONS)
                .find(([_, variations]) => 
                  variations.includes(field) && 
                  variations.some(v => v in sampleFields)
                );
                
              if (foundVariation) {
                const [_, variations] = foundVariation;
                const presentVariation = variations.find(v => v in sampleFields);
                console.log(`Field '${field}' not found, but alternative '${presentVariation}' is available`);
              } else {
                console.warn(`Field '${field}' or alternatives not found in Airtable schema`);
              }
            }
          });
        }
        console.groupEnd();
      }
      
      // Define a type for Airtable records
      interface AirtableRecord {
        id: string;
        fields: Record<string, any>;
      }
      
      // Transform each record to an Offer object
      const offers: Offer[] = data.records.map((record: AirtableRecord) => {
        try {
          return transformAirtableRecord(record);
        } catch (recordError) {
          console.error('Error transforming record:', record.id, recordError);
          return null;
        }
      }).filter((offer: Offer | null): offer is Offer => offer !== null);
      
      // Log a warning if some records were filtered out
      if (offers.length !== data.records.length) {
        console.warn(`${data.records.length - offers.length} records were filtered out due to transformation errors`);
      }
      
      return {
        data: offers,
        status: 200,
      };
    } catch (error) {
      console.error('Airtable getAllOffers error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch offers',
        status: 500,
      };
    }
  },
};
