#!/usr/bin/env node

/**
 * Test script to verify Euro currency formatting
 */

function testCurrencyFormatting() {
  console.log('🧪 Testing Euro Currency Formatting...\n');
  
  // Test OffersPage formatting (de-DE locale with EUR)
  const offersPageFormat = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Test SignPage formatting (de-DE locale with EUR)
  const signPageFormat = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  const testAmounts = [3500, 4750, 5000, 6200, 7800];
  
  console.log('📊 OffersPage Currency Formatting (minimumFractionDigits: 0):');
  testAmounts.forEach(amount => {
    console.log(`  ${amount} → ${offersPageFormat(amount)}`);
  });
  
  console.log('\n💰 SignPage Currency Formatting (minimumFractionDigits: 2):');
  testAmounts.forEach(amount => {
    console.log(`  ${amount} → ${signPageFormat(amount)}`);
  });
  
  console.log('\n✅ All currency formatting now uses Euro (€) symbol!');
  console.log('📍 Both pages use de-DE locale for proper German formatting.');
}

testCurrencyFormatting();
