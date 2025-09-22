import { NextRequest, NextResponse } from 'next/server'
import { DataProcessor } from '@/lib/dataProcessing'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') || 'here'
    const coords = searchParams.get('coords') || '40.7128,-74.0060'
    const [latStr, lngStr] = coords.split(',')
    const country = searchParams.get('country') || 'USA'
    const bbox = searchParams.get('bbox') || '-74.1,40.7,-73.9,40.8'
    
    // Get the base URL for internal API calls
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    console.log('Dashboard API - Base URL:', baseUrl)
    console.log('Dashboard API - Coords:', coords)
    console.log('Dashboard API - Vercel URL:', process.env.VERCEL_URL)
    
    // Try to fetch data with fallback to relative URLs if absolute URLs fail
    let airQualityRes, weatherRes, openMeteoRes, populationRes, landsatRes
    
    try {
      // First try with absolute URLs
      [airQualityRes, weatherRes, openMeteoRes, populationRes, landsatRes] = await Promise.allSettled([
        fetch(`${baseUrl}/api/waqi?location=${location}&coords=${coords}`),
        fetch(`${baseUrl}/api/weather?coords=${coords}`),
        fetch(`${baseUrl}/api/open-meteo?lat=${latStr}&lng=${lngStr}`),
        fetch(`${baseUrl}/api/population?lat=${latStr}&lng=${lngStr}`),
        fetch(`${baseUrl}/api/landsat?bbox=${bbox}`)
      ])
    } catch (error) {
      console.log('Absolute URL fetch failed, trying relative URLs:', error)
      // Fallback to relative URLs
      const fallbackResults = await Promise.allSettled([
        fetch(`/api/waqi?location=${location}&coords=${coords}`),
        fetch(`/api/weather?coords=${coords}`),
        fetch(`/api/open-meteo?lat=${latStr}&lng=${lngStr}`),
        fetch(`/api/population?lat=${latStr}&lng=${lngStr}`),
        fetch(`/api/landsat?bbox=${bbox}`)
      ])
      airQualityRes = fallbackResults[0]
      weatherRes = fallbackResults[1]
      openMeteoRes = fallbackResults[2]
      populationRes = fallbackResults[3]
      landsatRes = fallbackResults[4]
    }
    
    console.log('Dashboard API - Fetch results:', {
      airQuality: airQualityRes.status,
      weather: weatherRes.status,
      population: populationRes.status,
      openMeteo: openMeteoRes.status,
      landsat: landsatRes.status
    })

    // Process results with error handling and fallback data
    let airQuality = null
    let weather = null
    let population = null
    let openMeteo = null
    let landsat = null

    try {
      airQuality = airQualityRes.status === 'fulfilled' ? await airQualityRes.value.json() as Record<string, unknown> : null
    } catch (error) {
      console.error('Air Quality API error:', error)
    }

    try {
      weather = weatherRes.status === 'fulfilled' ? await weatherRes.value.json() as Record<string, unknown> : null
    } catch (error) {
      console.error('Weather API error:', error)
    }

    try {
      openMeteo = openMeteoRes.status === 'fulfilled' ? await openMeteoRes.value.json() as Record<string, unknown> : null
    } catch (error) {
      console.error('Open-Meteo API error:', error)
    }

    try {
      population = populationRes.status === 'fulfilled' ? await populationRes.value.json() as Record<string, unknown> : null
    } catch (error) {
      console.error('Population API error:', error)
    }

    try {
      landsat = landsatRes.status === 'fulfilled' ? await landsatRes.value.json() as Record<string, unknown> : null
    } catch (error) {
      console.error('Landsat API error:', error)
    }

    // Only add fallback data if APIs actually failed (not just null)
    if (!airQuality && airQualityRes.status === 'rejected') {
      console.log('Air Quality API failed, using fallback data')
      airQuality = {
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
    }

    if (!weather && weatherRes.status === 'rejected') {
      console.log('Weather API failed, using fallback data')
      weather = {
        temperature: 23.5,
        humidity: 65,
        precipitation: 5.2,
        windSpeed: 12.3,
        pressure: 1013.2,
        description: 'Partly Cloudy',
        timestamp: new Date().toISOString(),
        source: 'Fallback Data (API Unavailable)'
      }
    }

    if (!population && populationRes.status === 'rejected') {
      console.log('Population API failed, using fallback data')
      population = {
        population: 8500000,
        density: 2850,
        growthRate: 0.8,
        year: 2023,
        country: country,
        timestamp: new Date().toISOString(),
        source: 'Fallback Data (API Unavailable)'
      }
    }

    if (!landsat && landsatRes.status === 'rejected') {
      console.log('Landsat API failed, using fallback data')
      landsat = {
        features: [],
        hasError: true,
        ndvi: 0.65,
        health: 'Moderate',
        timestamp: new Date().toISOString(),
        source: 'Fallback Data (API Unavailable)'
      }
    }

    // Calculate derived metrics
    const processedData = {
      timestamp: new Date().toISOString(),
      location: {
        name: airQuality?.city || 'Unknown',
        coordinates: airQuality?.location || [parseFloat(coords.split(',')[0]), parseFloat(coords.split(',')[1])],
        country: country
      },
      airQuality: airQuality ? {
        aqi: airQuality.aqi as number,
        status: getAQIStatus(airQuality.aqi as number),
        pollutants: airQuality.pollutants as Record<string, unknown>,
        healthImpact: getHealthImpact(airQuality.aqi as number),
        lastUpdated: airQuality.timestamp as string
      } : null,
      weather: weather ? {
        temperature: (weather.current as Record<string, unknown>)?.temperature as number || weather.temperature as number,
        humidity: (weather.current as Record<string, unknown>)?.humidity as number || weather.humidity as number,
        windSpeed: (weather.current as Record<string, unknown>)?.windSpeed as string || weather.windSpeed as string,
        precipitation: (weather.current as Record<string, unknown>)?.precipitationProbability as number || weather.precipitation as number,
        forecast: (weather.current as Record<string, unknown>)?.shortForecast as string || weather.description as string,
        heatIndex: calculateHeatIndex(
          (weather.current as Record<string, unknown>)?.temperature as number || weather.temperature as number, 
          (weather.current as Record<string, unknown>)?.humidity as number || weather.humidity as number
        ),
        lastUpdated: (weather.metadata as Record<string, unknown>)?.generatedAt as string || weather.timestamp as string
      } : null,
      weatherGround: openMeteo ? {
        source: 'Open-Meteo (Weather API Ground)',
        current: (openMeteo as any).current,
        daily: (openMeteo as any).daily,
        urls: { weather: (openMeteo as any).weatherUrl, air: (openMeteo as any).airUrl }
      } : null,
      population: population ? {
        density: (population as Record<string, unknown>)?.density as number || 0,
        growthRate: population.growthRate as number,
        yearRange: (population.metadata as Record<string, unknown>)?.yearRange as { start: number; end: number },
        dataSource: (population.data as Record<string, unknown>)?.title as string,
        lastUpdated: (population.metadata as Record<string, unknown>)?.lastUpdated as string
      } : null,
      satellite: DataProcessor.processSatellite(landsat),
      metrics: {
        // Calculate urban planning KPIs
        urbanHeatIsland: calculateUrbanHeatIsland(
          weather ? (weather.current as Record<string, unknown>)?.temperature as number : 0, 
          landsat ? ((landsat.features as unknown[])?.[0] as Record<string, unknown>) : null
        ),
        vegetationHealth: calculateVegetationHealth(
          landsat ? ((landsat.features as unknown[])?.[0] as Record<string, unknown>) : null
        ),
        airQualityScore: calculateAirQualityScore(airQuality ? (airQuality.aqi as number) : 0),
        populationDensity: population ? (population.latestYear as number) : 0,
        environmentalHealth: calculateEnvironmentalHealth(
          airQuality ? (airQuality.aqi as number) : 0, 
          weather ? (weather.current as Record<string, unknown>)?.temperature as number : 0, 
          population ? (population.latestYear as number) : 0
        )
      },
      errors: {
        airQuality: airQualityRes.status === 'rejected' ? (airQualityRes.reason as Error)?.message : null,
        weather: weatherRes.status === 'rejected' ? (weatherRes.reason as Error)?.message : null,
        population: populationRes.status === 'rejected' ? (populationRes.reason as Error)?.message : null,
        landsat: landsatRes.status === 'rejected' ? (landsatRes.reason as Error)?.message : null
      }
    }

    return NextResponse.json(processedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800', // 15 min cache
      },
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getAQIStatus(aqi: number) {
  if (aqi <= 50) return { status: 'Good', color: 'green', level: 1 }
  if (aqi <= 100) return { status: 'Moderate', color: 'yellow', level: 2 }
  if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: 'orange', level: 3 }
  if (aqi <= 200) return { status: 'Unhealthy', color: 'red', level: 4 }
  if (aqi <= 300) return { status: 'Very Unhealthy', color: 'purple', level: 5 }
  return { status: 'Hazardous', color: 'maroon', level: 6 }
}

function getHealthImpact(aqi: number) {
  if (aqi <= 50) return 'Low risk - Air quality is satisfactory'
  if (aqi <= 100) return 'Moderate risk - Sensitive people may experience minor issues'
  if (aqi <= 150) return 'High risk - Sensitive groups should limit outdoor activity'
  if (aqi <= 200) return 'Very high risk - Everyone should limit outdoor activity'
  if (aqi <= 300) return 'Extreme risk - Avoid outdoor activity'
  return 'Dangerous - Stay indoors'
}

function calculateHeatIndex(temp: number, humidity: number) {
  if (!temp || !humidity) return null
  
  // Heat Index calculation (in Fahrenheit)
  const tempF = (temp * 9/5) + 32
  const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity - 0.22475541 * tempF * humidity - 6.83783e-3 * tempF * tempF - 5.481717e-2 * humidity * humidity + 1.22874e-3 * tempF * tempF * humidity + 8.5282e-4 * tempF * humidity * humidity - 1.99e-6 * tempF * tempF * humidity * humidity
  
  // Convert back to Celsius
  return Math.round(((hi - 32) * 5/9) * 10) / 10
}

function calculateUrbanHeatIsland(temperature: number, satelliteData: Record<string, unknown> | null) {
  // Simplified UHI calculation
  if (!temperature) return null
  
  // Calculate UHI even without satellite data using temperature
  const baseTemp = 20 // Base temperature for comparison
  const intensity = Math.round((temperature - baseTemp) * 0.3) // Simplified calculation
  
  return {
    intensity: intensity,
    level: temperature > 25 ? 'High' : temperature > 22 ? 'Moderate' : 'Low'
  }
}

function calculateVegetationHealth(satelliteData: Record<string, unknown> | null) {
  // This would calculate NDVI from satellite bands
  // For now, return a placeholder
  if (!satelliteData) return null
  
  return {
    ndvi: 0.7, // Placeholder - would be calculated from red/nir bands
    health: 'Good',
    coverage: '75%'
  }
}

function calculateAirQualityScore(aqi: number) {
  // Handle case where AQI is 0 (no data) by providing a default score
  if (aqi === 0) return 85 // Default good score when no AQI data
  
  // Convert AQI to 0-100 score (inverted)
  return Math.max(0, 100 - (aqi * 0.5))
}

function calculateEnvironmentalHealth(aqi: number, temperature: number, population: number) {
  // Composite environmental health score
  const aqiScore = aqi ? Math.max(0, 100 - (aqi * 0.5)) : 50
  const tempScore = temperature ? Math.max(0, 100 - Math.abs(temperature - 22) * 2) : 50
  const popScore = population ? Math.max(0, 100 - (population / 1000)) : 50
  
  return Math.round((aqiScore + tempScore + popScore) / 3)
}
