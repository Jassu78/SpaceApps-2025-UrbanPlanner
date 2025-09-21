// Test OPeNDAP temperature extraction
const fetch = require('node-fetch');

async function testOPeNDAPTemperature() {
  console.log('🌡️ Testing OPeNDAP Temperature Extraction...\n');

  try {
    // First get a real granule with OPeNDAP URL
    console.log('1️⃣ Fetching real MODIS granule...');
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
    
    if (!modisData.success || !modisData.data?.granules?.length) {
      throw new Error('No MODIS granules found')
    }

    const granule = modisData.data.granules[0];
    console.log('✅ Real granule found:');
    console.log(`   - ID: ${granule.id}`);
    console.log(`   - Title: ${granule.title}`);
    console.log(`   - Time: ${granule.timeStart}`);
    console.log(`   - Cloud Cover: ${granule.cloudCover}%`);
    console.log(`   - OPeNDAP URL: ${granule.opendapUrl}`);

    // Test OPeNDAP query
    console.log('\n2️⃣ Testing OPeNDAP temperature extraction...');
    
    // Construct OPeNDAP query for temperature data
    const opendapUrl = granule.opendapUrl;
    const temperatureQuery = `${opendapUrl}.dap?LST_Day_1km[0:0][1200:1200][1200:1200]`;
    
    console.log('🔍 OPeNDAP Query:', temperatureQuery);
    
    const opendapResponse = await fetch(temperatureQuery, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NASA_EARTHDATA_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    console.log(`📡 OPeNDAP Response Status: ${opendapResponse.status} ${opendapResponse.statusText}`);
    
    if (opendapResponse.ok) {
      const responseText = await opendapResponse.text();
      console.log('📄 OPeNDAP Response Length:', responseText.length);
      console.log('📄 OPeNDAP Response Preview:', responseText.substring(0, 300));
      
      // Try to extract temperature
      const tempMatch = responseText.match(/(\d+\.?\d*)/);
      if (tempMatch) {
        const rawTemp = parseFloat(tempMatch[1]);
        const celsiusTemp = (rawTemp * 0.02) - 273.15;
        console.log(`🌡️ Raw Temperature Value: ${rawTemp}`);
        console.log(`🌡️ Converted to Celsius: ${celsiusTemp.toFixed(2)}°C`);
      } else {
        console.log('❌ No temperature value found in response');
      }
    } else {
      console.log('❌ OPeNDAP request failed');
      const errorText = await opendapResponse.text();
      console.log('Error details:', errorText.substring(0, 200));
    }

    console.log('\n✅ OPeNDAP temperature test completed!');

  } catch (error) {
    console.error('❌ Error testing OPeNDAP temperature:', error.message);
  }
}

// Run the test
testOPeNDAPTemperature();
