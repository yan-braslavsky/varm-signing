/**
 * Airtable Integration Helper for VARM Digital Signing
 * 
 * This module provides a clean interface for integrating with Airtable.
 * Replace the mock data in offerApi.ts with these functions when ready for production.
 */

import type { Offer, ApiResponse } from '../types/offer.js';

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
  const fields = record.fields || {};
  
  // Convert offerAmount to a proper number if it exists
  let offerAmount = 0;
  if (fields.offerAmount !== undefined) {
    if (typeof fields.offerAmount === 'string') {
      offerAmount = parseFloat(fields.offerAmount) || 0;
    } else if (typeof fields.offerAmount === 'number') {
      offerAmount = fields.offerAmount;
    }
  }
  
  // Debug logging in development
  if (import.meta.env.MODE !== 'production') {
    console.group('Airtable Record Transformation');
    console.log('Record ID:', record.id);
    console.log('Raw fields:', fields);
    console.log('Field types:', {
      slug: typeof fields.slug,
      customerName: typeof fields.customerName,
      offerAmount: typeof fields.offerAmount,
      pdfUrl: typeof fields.pdfUrl
    });
    console.groupEnd();
  }

  return {
    slug: fields.slug || `record-${record.id || 'unknown'}`,
    customerName: fields.customerName || 'Unnamed Customer',
    offerAmount: offerAmount,
    pdfUrl: fields.pdfUrl || '',
    isSigned: Boolean(fields.isSigned),
    signedAt: fields.signedAt,
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
   * Fetch a single offer by slug from Airtable
   */
  async getOffer(slug: string): Promise<ApiResponse<Offer>> {
    try {
      validateConfig();

      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      const filterFormula = `{slug} = "${slug}"`;
      
      const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
        headers: getAirtableHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            error: 'Offer not found',
            status: 404,
          };
        }
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        return {
          error: 'Offer not found',
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
      const filterFormula = `{slug} = "${slug}"`;
      
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
      const updateData = {
        fields: {
          isSigned: true,
          signedAt: new Date().toISOString(),
        },
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
   * Get all offers from Airtable (for admin/demo purposes)
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
        }
        console.groupEnd();
      }
      
      // Ensure data.records is an array before mapping
      const records = Array.isArray(data.records) ? data.records : [];
      const offers = records.map(transformAirtableRecord);

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

  /**
   * Create a new offer in Airtable (for admin purposes)
   */
  async createOffer(offer: Omit<Offer, 'isSigned' | 'signedAt'>): Promise<ApiResponse<Offer>> {
    try {
      validateConfig();

      const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
      const createData = {
        fields: {
          slug: offer.slug,
          customerName: offer.customerName,
          offerAmount: offer.offerAmount,
          pdfUrl: offer.pdfUrl,
          isSigned: false,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: getAirtableHeaders(),
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create offer: ${response.status}`);
      }

      const createdRecord = await response.json();
      const createdOffer = transformAirtableRecord(createdRecord);

      return {
        data: createdOffer,
        status: 201,
      };

    } catch (error) {
      console.error('Airtable createOffer error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create offer',
        status: 500,
      };
    }
  },
};

/**
 * Instructions for switching to Airtable in production:
 * 
 * 1. Set up your Airtable base with the following fields:
 *    - slug (Single line text, Primary field)
 *    - customerName (Single line text)
 *    - offerAmount (Number)
 *    - pdfUrl (URL)
 *    - isSigned (Checkbox)
 *    - signedAt (Date & time)
 * 
 * 2. Get your Airtable API key from https://airtable.com/account
 * 
 * 3. Get your Base ID from the Airtable API documentation for your base
 * 
 * 4. Set environment variables:
 *    VITE_AIRTABLE_API_KEY=your_api_key_here
 *    VITE_AIRTABLE_BASE_ID=your_base_id_here
 * 
 * 5. In src/api/offerApi.ts, replace the mock implementation with:
 *    import { airtableService } from './airtableService';
 *    export const offerApi = airtableService;
 * 
 * 6. Deploy and test!
 */
