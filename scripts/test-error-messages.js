#!/usr/bin/env node

/**
 * Test script to verify error message improvements
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

async function testErrorMessages() {
  try {
    console.log('🧪 Testing error messages for invalid offer slugs...');
    
    const url = `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
    const invalidSlugs = ['invalid-offer', 'non-existent', 'test123'];
    
    for (const testSlug of invalidSlugs) {
      console.log(`\n🔍 Testing slug: ${testSlug}`);
      
      const filterFormula = `{Slug} = "${testSlug}"`;
      const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
        headers: getAirtableHeaders(),
      });
      
      if (!response.ok) {
        console.log(`❌ API Error ${response.status} for ${testSlug}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`📊 Found ${data.records?.length || 0} records for ${testSlug}`);
      
      if (!data.records || data.records.length === 0) {
        console.log(`✅ Correct behavior: Would show "Offer not found" message for ${testSlug}`);
      } else {
        console.log(`🎯 Found record for ${testSlug}:`, data.records[0].fields.Name);
      }
    }
    
    console.log('\n✅ Error message testing complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testErrorMessages();
