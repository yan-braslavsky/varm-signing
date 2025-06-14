#!/usr/bin/env node

/**
 * Test the fixed Airtable integration with correct field names
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

async function testFilterFormula() {
  try {
    console.log('🧪 Testing the fixed filter formula...');
    
    const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
    const testSlug = 'offer003';
    
    // Test the corrected filter formula
    const filterFormula = `{Slug} = "${testSlug}"`;
    console.log('Filter formula:', filterFormula);
    console.log('Encoded:', encodeURIComponent(filterFormula));
    
    const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
      headers: getAirtableHeaders(),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Airtable API error ${response.status}:`, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Filter formula works!');
    console.log(`📊 Found ${data.records?.length || 0} records`);
    
    if (data.records && data.records.length > 0) {
      console.log('🎯 Record found:');
      console.log(JSON.stringify(data.records[0].fields, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFilterFormula();
