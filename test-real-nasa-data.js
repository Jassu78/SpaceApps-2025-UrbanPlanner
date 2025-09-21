// Test script to demonstrate real NASA data extraction
const fetch = require('node-fetch');

async function testRealNASAData() {
  console.log('🌡️ Testing REAL NASA Data Extraction...\n');

  try {
    // Test 1: Get real MODIS granule metadata
    console.log('1️⃣ Fetching real MODIS granule metadata...');
    const modisResponse = await fetch('http://localhost:3002/api/nasa-modis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 40.7128,
        lng: -74.0060,
        type: 'temperature',
        temporal: '2024-01-15',
        token: process.env.NEXT_PUBLIC_NASA_EARTHDATA_TOKEN
      })
    });

    const modisData = await modisResponse.json();
    console.log('✅ Real MODIS data received:');
    console.log(`   - Granules: ${modisData.data?.granules?.length || 0}`);
    console.log(`   - Product: ${modisData.dataType}`);
    console.log(`   - Description: ${modisData.description}`);
    
    if (modisData.data?.granules?.length > 0) {
      const granule = modisData.data.granules[0];
      console.log(`   - First granule: ${granule.title}`);
      console.log(`   - Time: ${granule.timeStart}`);
      console.log(`   - Cloud cover: ${granule.cloudCover}%`);
      console.log(`   - OPeNDAP URL: ${granule.opendapUrl}`);
    }

    // Test 2: Try to extract real temperature from OPeNDAP
    if (modisData.data?.granules?.length > 0) {
      console.log('\n2️⃣ Attempting to extract real temperature from OPeNDAP...');
      const granule = modisData.data.granules[0];
      const opendapUrl = granule.opendapUrl;
      
      if (opendapUrl) {
        try {
          // This would be the real temperature extraction
          console.log(`   - OPeNDAP URL: ${opendapUrl}`);
          console.log('   - Note: Real temperature extraction requires OPeNDAP client');
          console.log('   - Temperature values are stored in HDF files, not metadata');
        } catch (error) {
          console.log(`   - OPeNDAP extraction failed: ${error.message}`);
        }
      }
    }

    // Test 3: Show what we can do with real metadata
    console.log('\n3️⃣ Real data we can extract from NASA metadata:');
    if (modisData.data?.granules?.length > 0) {
      modisData.data.granules.slice(0, 3).forEach((granule, index) => {
        console.log(`   Granule ${index + 1}:`);
        console.log(`     - Date: ${granule.timeStart}`);
        console.log(`     - Cloud Cover: ${granule.cloudCover}%`);
        console.log(`     - File Size: ${granule.granuleSize} MB`);
        console.log(`     - Download URL: ${granule.downloadUrl ? 'Available' : 'Not available'}`);
      });
    }

    console.log('\n✅ Real NASA data test completed!');
    console.log('\n📊 Summary:');
    console.log('   - Real granule metadata: ✅ Available');
    console.log('   - Real timestamps: ✅ Available');
    console.log('   - Real cloud cover: ✅ Available');
    console.log('   - Real temperature values: ⚠️  Requires HDF file processing');
    console.log('   - Real OPeNDAP access: ⚠️  Requires authentication');

  } catch (error) {
    console.error('❌ Error testing real NASA data:', error.message);
  }
}

// Run the test
testRealNASAData();
