import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') || 'here'
    const coords = searchParams.get('coords') // Get coordinates if available
    
    // Use coordinates if available, otherwise use location
    const searchParam = coords ? `geo:${coords}` : location
    
    // Use demo token for now - in production, use environment variable
    const waqiUrl = `https://api.waqi.info/feed/${searchParam}/?token=demo`
    
    const response = await fetch(waqiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`WAQI API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Check if we got valid data (AQI > 0)
    const hasValidData = data.aqi && data.aqi > 0
    
    // Process the data to extract relevant information
    const processedData = {
      aqi: hasValidData ? data.aqi : 45, // Fallback to moderate AQI
      status: data.status || 'ok',
      city: data.city?.name || 'New York',
      location: data.city?.geo || null,
      timestamp: data.time?.iso || new Date().toISOString(),
      pollutants: hasValidData ? {
        pm25: data.iaqi?.pm25?.v || 0,
        pm10: data.iaqi?.pm10?.v || 0,
        no2: data.iaqi?.no2?.v || 0,
        o3: data.iaqi?.o3?.v || 0,
        co: data.iaqi?.co?.v || 0,
        so2: data.iaqi?.so2?.v || 0,
      } : {
        pm25: 12, // Fallback values for NYC
        pm10: 18,
        no2: 25,
        o3: 35,
        co: 1.2,
        so2: 8,
      },
      weather: {
        temperature: data.iaqi?.t?.v || null,
        humidity: data.iaqi?.h?.v || null,
        pressure: data.iaqi?.p?.v || null,
        wind: data.iaqi?.w?.v || null,
      },
      forecast: data.forecast?.daily || null,
      isFallback: !hasValidData // Flag to indicate if this is fallback data
    }

    return NextResponse.json(processedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800', // 15 min cache
      },
    })
  } catch (error) {
    console.error('WAQI API Error:', error)
    
    // Return fallback data instead of error
    const fallbackData = {
      aqi: 45,
      status: 'Good',
      healthImpact: 'Air quality is acceptable for most people',
      pollutants: {
        pm25: 12.5,
        pm10: 18.3,
        no2: 25.7,
        o3: 45.2,
        so2: 8.9,
        co: 1.2
      },
      city: 'Sample City',
      timestamp: new Date().toISOString(),
      source: 'Fallback Data (API Unavailable)'
    }
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache for fallback
      },
    })
  }
}
