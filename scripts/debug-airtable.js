#!/usr/bin/env node

/**
 * Debug script to test Airtable connection and see actual data structure
 */

const AIRTABLE_CONFIG = {
  baseId: process.env.VITE_AIRTABLE_BASE_ID || 'appBFElcFYb9RnuI4',
  apiKey: process.env.VITE_AIRTABLE_API_KEY || 'patxAnJFNMeukT7e3.0a7d04a50ca607e802a7b560de49ab535cc23d0c7ac31a33d4641be1c859bc84',
  tableName: 'Offers',
  baseUrl: 'https://api.airtable.com/v0',
};

const getAirtableHeaders = () => ({
  'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
  'Content-Type': 'application/json',
});

async function debugAirtable() {
  try {
    console.log('🔍 Testing Airtable connection...');
    console.log('Base ID:', AIRTABLE_CONFIG.baseId);
    console.log('Table Name:', AIRTABLE_CONFIG.tableName);
    
    const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
    console.log('URL:', url);
    
    // First, try to get all records to see the structure
    console.log('\n📋 Fetching all records...');
    const response = await fetch(url, {
      headers: getAirtableHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Airtable API error ${response.status}:`, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Successfully connected to Airtable!');
    console.log(`📊 Found ${data.records?.length || 0} records`);
    
    if (data.records && data.records.length > 0) {
      console.log('\n🔍 First record structure:');
      console.log('Record ID:', data.records[0].id);
      console.log('Fields:', Object.keys(data.records[0].fields || {}));
      console.log('Sample data:', JSON.stringify(data.records[0].fields, null, 2));
      
      // Test specific slug
      console.log('\n🎯 Testing specific slug: offer003');
      const testSlug = 'offer003';
      
      // Find the record with matching slug
      const matchingRecord = data.records.find(record => {
        const fields = record.fields || {};
        return fields.slug === testSlug || 
               fields.Slug === testSlug || 
               fields.id === testSlug || 
               fields.ID === testSlug || 
               fields.Id === testSlug;
      });
      
      if (matchingRecord) {
        console.log('✅ Found matching record for offer003:');
        console.log(JSON.stringify(matchingRecord.fields, null, 2));
      } else {
        console.log('❌ No record found with slug "offer003"');
        console.log('Available slugs/ids:');
        data.records.forEach((record, index) => {
          const fields = record.fields || {};
          console.log(`  Record ${index + 1}:`, {
            slug: fields.slug,
            Slug: fields.Slug,
            id: fields.id,
            ID: fields.ID,
            Id: fields.Id,
          });
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAirtable();
