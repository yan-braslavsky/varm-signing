#!/usr/bin/env node
/**
 * VARM Signing Platform - Airtable Validation Script
 * 
 * This script validates that your Airtable base is correctly configured
 * for integration with the VARM Signing Platform. It checks:
 * 
 * 1. That your environment variables are set
 * 2. That your Airtable base is accessible
 * 3. That the required fields exist (with various naming patterns)
 * 4. That sample data can be properly transformed
 * 
 * Usage: 
 *   node scripts/validate-airtable.js
 */

// Load environment variables from .env file
require('dotenv').config();

// Get Airtable credentials from environment variables
const baseId = process.env.VITE_AIRTABLE_BASE_ID;
const apiKey = process.env.VITE_AIRTABLE_API_KEY;
const tableName = 'Offers'; // Default table name

// Validate environment variables
if (!baseId) {
  console.error('❌ Error: VITE_AIRTABLE_BASE_ID environment variable is not set');
  console.log('💡 Tip: Create a .env file with your Airtable credentials');
  process.exit(1);
}

if (!apiKey) {
  console.error('❌ Error: VITE_AIRTABLE_API_KEY environment variable is not set');
  console.log('💡 Tip: Create a .env file with your Airtable credentials');
  process.exit(1);
}

console.log('🔍 Validating Airtable integration...');
console.log(`📊 Using Base ID: ${baseId.substring(0, 5)}...`);

// Headers for Airtable API requests
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};

// Make a request to Airtable to get the schema and records
async function validateAirtable() {
  try {
    console.log(`📡 Connecting to Airtable table "${tableName}"...`);
    
    // Fetch table metadata to see field definitions
    const metaUrl = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    const metaResponse = await fetch(metaUrl, { headers });
    
    if (!metaResponse.ok) {
      if (metaResponse.status === 401 || metaResponse.status === 403) {
        console.error('❌ Authentication error: Invalid API key or insufficient permissions');
        console.log('💡 Tip: Generate a new personal access token with proper permissions');
        process.exit(1);
      }
      console.error(`❌ Error fetching table metadata: ${metaResponse.status} ${metaResponse.statusText}`);
      process.exit(1);
    }
    
    const metaData = await metaResponse.json();
    console.log('✅ Successfully connected to Airtable');
    
    // Find the table definition
    const tableDefinition = metaData.tables.find(table => table.name === tableName);
    if (!tableDefinition) {
      console.error(`❌ Table "${tableName}" not found. Available tables:`);
      metaData.tables.forEach(table => console.log(`   - ${table.name}`));
      process.exit(1);
    }
    
    console.log('📊 Table structure:');
    
    // Define required fields with possible naming variations
    const requiredFields = {
      'slug': ['slug', 'Slug', 'ID', 'Id', 'id'],
      'customerName': ['customerName', 'Customer Name', 'Name', 'Client', 'Client Name'],
      'offerAmount': ['offerAmount', 'Offer Amount', 'Amount', 'Value', 'Price'],
      'pdfUrl': ['pdfUrl', 'Pdf Url', 'PDF URL', 'PDF', 'Document URL', 'Document Link', 'Attachment'],
      'isSigned': ['isSigned', 'Is Signed', 'Signed', 'Status'],
      'signedAt': ['signedAt', 'Signed At', 'Sign Date', 'Date Signed']
    };
    
    // Check for required fields
    const fieldsFound = {};
    const fieldsList = tableDefinition.fields.map(field => field.name);
    
    console.log('   Fields in Airtable:');
    fieldsList.forEach(fieldName => {
      console.log(`   - ${fieldName}`);
    });
    
    // Check each required field against possible naming variations
    for (const [appField, possibleNames] of Object.entries(requiredFields)) {
      const foundField = possibleNames.find(name => fieldsList.includes(name));
      fieldsFound[appField] = foundField || null;
    }
    
    console.log('\n📝 Field mapping results:');
    let missingFields = 0;
    
    for (const [appField, foundField] of Object.entries(fieldsFound)) {
      if (foundField) {
        console.log(`✅ ${appField} → ${foundField}`);
      } else {
        console.log(`❌ ${appField} → NOT FOUND`);
        console.log(`   Acceptable field names: ${requiredFields[appField].join(', ')}`);
        missingFields++;
      }
    }
    
    if (missingFields > 0) {
      console.error(`\n❌ Missing ${missingFields} required fields`);
      console.log('\n💡 Please add these fields to your Airtable base or update field names to match the expected patterns');
    } else {
      console.log('\n✅ All required fields are present in your Airtable structure');
      
      // Now test record retrieval
      console.log('\n🔍 Testing record retrieval...');
      const recordsUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=10`;
      const recordsResponse = await fetch(recordsUrl, { headers });
      
      if (!recordsResponse.ok) {
        console.error(`❌ Error fetching records: ${recordsResponse.status} ${recordsResponse.statusText}`);
        process.exit(1);
      }
      
      const recordsData = await recordsResponse.json();
      const recordCount = recordsData.records ? recordsData.records.length : 0;
      
      console.log(`✅ Successfully retrieved ${recordCount} records`);
      
      if (recordCount > 0) {
        const sample = recordsData.records[0];
        console.log('\n📊 Sample record transformation:');
        console.log('   Raw Airtable data:');
        console.log('   ', JSON.stringify(sample.fields, null, 2).replace(/\n/g, '\n   '));
        
        // Test record transformation logic
        console.log('\n   Transformed data:');
        const transformed = transformRecord(sample, fieldsFound);
        console.log('   ', JSON.stringify(transformed, null, 2).replace(/\n/g, '\n   '));
      }
      
      console.log('\n🎉 Airtable integration validation complete!');
      console.log('💡 Your Airtable base is correctly configured for integration with VARM Signing Platform');
    }
    
  } catch (error) {
    console.error(`❌ Error validating Airtable integration: ${error.message}`);
    process.exit(1);
  }
}

// Function to transform an Airtable record using the found field mappings
function transformRecord(record, fieldMappings) {
  const fields = record.fields || {};
  
  // Build transformed object with mapped fields
  const transformed = {};
  
  // Helper function to get value using the appropriate field name
  const getValue = (appField) => {
    const airtableField = fieldMappings[appField];
    if (!airtableField) return null;
    return fields[airtableField];
  };
  
  // Map each field with special handling for certain types
  transformed.slug = getValue('slug') || `record-${record.id}`;
  transformed.customerName = getValue('customerName') || 'Unnamed Customer';
  
  // Handle offer amount
  const rawAmount = getValue('offerAmount');
  transformed.offerAmount = typeof rawAmount === 'number' ? rawAmount : 
                         typeof rawAmount === 'string' ? parseFloat(rawAmount) || 0 : 0;
  
  transformed.pdfUrl = getValue('pdfUrl') || '';
  transformed.isSigned = Boolean(getValue('isSigned'));
  transformed.signedAt = getValue('signedAt');
  
  return transformed;
}

// Execute the validation
validateAirtable();
