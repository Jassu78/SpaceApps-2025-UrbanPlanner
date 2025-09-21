// Test script for NASA API endpoints
// Run with: node test-nasa-apis.js

const testAPIs = async () => {
  console.log('🧪 Testing NASA API Endpoints...\n')

  // Test FIRMS API
  console.log('1. Testing FIRMS API...')
  try {
    const fireResponse = await fetch('http://localhost:3000/api/firms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bounds: { north: 40.8, south: 40.6, east: -73.9, west: -74.1 },
        token: 'test-token'
      })
    })
    const fireData = await fireResponse.json()
    console.log('✅ FIRMS API:', fireData.success ? 'Working' : 'Error')
    if (fireData.success) {
      console.log(`   Found ${fireData.count} fire detections`)
    }
  } catch (error) {
    console.log('❌ FIRMS API Error:', error.message)
  }

  // Test MODIS API
  console.log('\n2. Testing MODIS API...')
  try {
    const modisResponse = await fetch('http://localhost:3000/api/nasa-modis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 40.7128,
        lng: -74.0060,
        type: 'temperature',
        temporal: '2024-01-01,2024-01-31',
        token: 'test-token'
      })
    })
    const modisData = await modisResponse.json()
    console.log('✅ MODIS API:', modisData.dataType ? 'Working' : 'Error')
    if (modisData.dataType) {
      console.log(`   Found ${modisData.summary.totalGranules} granules`)
    }
  } catch (error) {
    console.log('❌ MODIS API Error:', error.message)
  }

  // Test AppEEARS API
  console.log('\n3. Testing AppEEARS API...')
  try {
    const appeearsResponse = await fetch('http://localhost:3000/api/appeears', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bounds: { north: 40.8, south: 40.6, east: -73.9, west: -74.1 },
        products: ['MOD11A1', 'MOD13Q1'],
        temporal: '2024-01-01,2024-01-31',
        token: 'test-token'
      })
    })
    const appeearsData = await appeearsResponse.json()
    console.log('✅ AppEEARS API:', appeearsData.success ? 'Working' : 'Error')
    if (appeearsData.success) {
      console.log(`   Found ${appeearsData.data.availableProducts} available products`)
    }
  } catch (error) {
    console.log('❌ AppEEARS API Error:', error.message)
  }

  // Test GIBS API
  console.log('\n4. Testing GIBS API...')
  try {
    const gibsResponse = await fetch('http://localhost:3000/api/gibs?layer=modis_terra_truecolor&z=4&x=2&y=3')
    const gibsData = await gibsResponse.json()
    console.log('✅ GIBS API:', gibsData.success ? 'Working' : 'Error')
    if (gibsData.success) {
      console.log(`   Generated tile URL: ${gibsData.tileUrl.substring(0, 80)}...`)
    }
  } catch (error) {
    console.log('❌ GIBS API Error:', error.message)
  }

  console.log('\n🎉 API Testing Complete!')
}

// Run the tests
testAPIs().catch(console.error)
