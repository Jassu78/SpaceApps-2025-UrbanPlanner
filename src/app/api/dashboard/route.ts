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
    // Open-Meteo is now primary for weather + air quality, NOAA as fallback
    let airQualityRes, weatherRes, openMeteoRes, populationRes, landsatRes
    
    try {
      // First try with absolute URLs - Open-Meteo first for global coverage
      [openMeteoRes, airQualityRes, weatherRes, populationRes, landsatRes] = await Promise.allSettled([
        fetch(`${baseUrl}/api/open-meteo?lat=${latStr}&lng=${lngStr}`), // Primary: Open-Meteo (global + air quality)
        fetch(`${baseUrl}/api/waqi?location=${location}&coords=${coords}`), // Fallback air quality
        fetch(`${baseUrl}/api/weather?coords=${coords}`), // Fallback weather (NOAA - US only)
        fetch(`${baseUrl}/api/population?lat=${latStr}&lng=${lngStr}`),
        fetch(`${baseUrl}/api/landsat?bbox=${bbox}`)
      ])
    } catch (error) {
      console.log('Absolute URL fetch failed, trying relative URLs:', error)
      // Fallback to relative URLs
      const fallbackResults = await Promise.allSettled([
        fetch(`/api/open-meteo?lat=${latStr}&lng=${lngStr}`), // Primary: Open-Meteo
        fetch(`/api/waqi?location=${location}&coords=${coords}`), // Fallback air quality
        fetch(`/api/weather?coords=${coords}`), // Fallback weather
        fetch(`/api/population?lat=${latStr}&lng=${lngStr}`),
        fetch(`/api/landsat?bbox=${bbox}`)
      ])
      openMeteoRes = fallbackResults[0]
      airQualityRes = fallbackResults[1]
      weatherRes = fallbackResults[2]
      populationRes = fallbackResults[3]
      landsatRes = fallbackResults[4]
    }
    
    console.log('Dashboard API - Fetch results:', {
      openMeteo: openMeteoRes.status, // Primary weather + air quality
      airQuality: airQualityRes.status, // Fallback air quality
      weather: weatherRes.status, // Fallback weather (NOAA)
      population: populationRes.status,
      landsat: landsatRes.status
    })

    // Process results with error handling and fallback data
    // Open-Meteo is now primary source for weather + air quality
    let airQuality = null
    let weather = null
    let population = null
    let openMeteo = null
    let landsat = null

    // Process Open-Meteo first (primary source for weather + air quality)
    try {
      openMeteo = openMeteoRes.status === 'fulfilled' ? await openMeteoRes.value.json() as Record<string, unknown> : null
    } catch (error) {
      console.error('Open-Meteo API error:', error)
    }

    // Process fallback air quality (WAQI)
    try {
      airQuality = airQualityRes.status === 'fulfilled' ? await airQualityRes.value.json() as Record<string, unknown> : null
    } catch (error) {
      console.error('Air Quality API error:', error)
    }

    // Process fallback weather (NOAA)
    try {
      weather = weatherRes.status === 'fulfilled' ? await weatherRes.value.json() as Record<string, unknown> : null
    } catch (error) {
      console.error('Weather API error:', error)
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

    // No fallback data - show honest data availability status
    console.log('Data availability status:', {
      openMeteo: openMeteo ? 'Available' : 'Unavailable',
      airQuality: airQuality ? 'Available' : 'Unavailable', 
      weather: weather ? 'Available' : 'Unavailable',
      population: population ? 'Available' : 'Unavailable',
      landsat: landsat ? 'Available' : 'Unavailable'
    })

    // Calculate derived metrics
    const processedData = {
      timestamp: new Date().toISOString(),
      location: {
        name: airQuality?.city || 'Unknown',
        coordinates: airQuality?.location || [parseFloat(coords.split(',')[0]), parseFloat(coords.split(',')[1])],
        country: country
      },
      airQuality: openMeteo ? {
        // Use Open-Meteo air quality data (primary source)
        aqi: (openMeteo.current as Record<string, unknown>)?.aqiEuropean as number || 0,
        status: getAQIStatus((openMeteo.current as Record<string, unknown>)?.aqiEuropean as number || 0),
        pollutants: {
          pm25: (openMeteo.current as Record<string, unknown>)?.pm25 as number || 0,
          pm10: (openMeteo.current as Record<string, unknown>)?.pm10 as number || 0,
          no2: (openMeteo.current as Record<string, unknown>)?.nitrogenDioxide as number || 0,
          o3: (openMeteo.current as Record<string, unknown>)?.ozone as number || 0,
          so2: (openMeteo.current as Record<string, unknown>)?.sulphurDioxide as number || 0,
          co: (openMeteo.current as Record<string, unknown>)?.carbonMonoxide as number || 0
        },
        healthImpact: getHealthImpact((openMeteo.current as Record<string, unknown>)?.aqiEuropean as number || 0),
        lastUpdated: new Date().toISOString(),
        source: 'Open-Meteo (Primary)'
      } : airQuality ? {
        // Fallback to WAQI if Open-Meteo unavailable
        aqi: airQuality.aqi as number,
        status: getAQIStatus(airQuality.aqi as number),
        pollutants: airQuality.pollutants as Record<string, unknown>,
        healthImpact: getHealthImpact(airQuality.aqi as number),
        lastUpdated: airQuality.timestamp as string,
        source: 'WAQI (Fallback)'
      } : {
        // No data available
        aqi: null,
        status: 'No Data Available',
        pollutants: null,
        healthImpact: 'Air quality data is currently unavailable',
        lastUpdated: null,
        source: 'Unavailable'
      },
      weather: openMeteo ? {
        // Use Open-Meteo weather data (primary source)
        temperature: (openMeteo.current as Record<string, unknown>)?.temperatureC as number || 0,
        humidity: (openMeteo.current as Record<string, unknown>)?.humidityPct as number || 0,
        windSpeed: (openMeteo.current as Record<string, unknown>)?.windSpeed10m as number || 0,
        precipitation: (openMeteo.current as Record<string, unknown>)?.precipitationMm as number || 0,
        pressure: (openMeteo.current as Record<string, unknown>)?.pressureHpa as number || 0,
        forecast: (openMeteo.daily as Record<string, unknown>)?.date as string || 'Current conditions',
        heatIndex: calculateHeatIndex(
          (openMeteo.current as Record<string, unknown>)?.temperatureC as number || 0,
          (openMeteo.current as Record<string, unknown>)?.humidityPct as number || 0
        ),
        lastUpdated: new Date().toISOString(),
        source: 'Open-Meteo (Primary)'
      } : weather ? {
        // Fallback to NOAA weather if Open-Meteo unavailable
        temperature: (weather.current as Record<string, unknown>)?.temperature as number || weather.temperature as number,
        humidity: (weather.current as Record<string, unknown>)?.humidity as number || weather.humidity as number,
        windSpeed: (weather.current as Record<string, unknown>)?.windSpeed as string || weather.windSpeed as string,
        precipitation: (weather.current as Record<string, unknown>)?.precipitationProbability as number || weather.precipitation as number,
        forecast: (weather.current as Record<string, unknown>)?.shortForecast as string || weather.description as string,
        heatIndex: calculateHeatIndex(
          (weather.current as Record<string, unknown>)?.temperature as number || weather.temperature as number, 
          (weather.current as Record<string, unknown>)?.humidity as number || weather.humidity as number
        ),
        lastUpdated: (weather.metadata as Record<string, unknown>)?.generatedAt as string || weather.timestamp as string,
        source: 'NOAA (Fallback)'
      } : {
        // No data available
        temperature: null,
        humidity: null,
        windSpeed: null,
        precipitation: null,
        pressure: null,
        forecast: 'Weather data is currently unavailable',
        heatIndex: null,
        lastUpdated: null,
        source: 'Unavailable'
      },
      weatherGround: openMeteo ? {
        source: 'Open-Meteo (Weather API Ground)',
        current: (openMeteo as any).current,
        daily: (openMeteo as any).daily,
        urls: { weather: (openMeteo as any).weatherUrl, air: (openMeteo as any).airUrl }
      } : null,
      population: population ? {
        density: (population as Record<string, unknown>)?.density as number || 0,
        growthRate: null, // GeoDB doesn't provide growth rate
        yearRange: null, // GeoDB doesn't provide year range
        dataSource: 'GeoDB Cities API (Real Population Data)',
        lastUpdated: new Date().toISOString(),
        city: (population as Record<string, unknown>)?.city as string || 'Unknown',
        country: (population as Record<string, unknown>)?.country as string || 'Unknown',
        region: (population as Record<string, unknown>)?.region as string || 'Unknown',
        elevation: (population as Record<string, unknown>)?.elevation as number || null
      } : {
        density: null,
        growthRate: null,
        yearRange: null,
        dataSource: 'Population data is currently unavailable',
        lastUpdated: null,
        city: null,
        country: null,
        region: null,
        elevation: null
      },
      satellite: landsat ? DataProcessor.processSatellite(landsat) : {
        latestImage: null,
        cloudCover: null,
        platform: 'No Data Available',
        availableBands: [],
        hasError: true,
        ndvi: null,
        health: 'Data unavailable'
      },
      metrics: {
        // Calculate urban planning KPIs - only when data is available
        urbanHeatIsland: (weather && openMeteo) ? calculateUrbanHeatIsland(
          (weather.current as Record<string, unknown>)?.temperature as number || 0, 
          landsat ? ((landsat.features as unknown[])?.[0] as Record<string, unknown>) : null
        ) : null,
        vegetationHealth: landsat ? calculateVegetationHealth(
          ((landsat.features as unknown[])?.[0] as Record<string, unknown>) || null
        ) : null,
        airQualityScore: (airQuality && openMeteo) ? calculateAirQualityScore((airQuality.aqi as number) || 0) : null,
        populationDensity: population ? (population.latestYear as number) : null,
        environmentalHealth: (airQuality && weather && population) ? calculateEnvironmentalHealth(
          (airQuality.aqi as number) || 0, 
          (weather.current as Record<string, unknown>)?.temperature as number || 0, 
          (population.latestYear as number) || 0
        ) : null
      },
      errors: {
        openMeteo: openMeteoRes.status === 'rejected' ? (openMeteoRes.reason as Error)?.message : null, // Primary weather + air quality
        airQuality: airQualityRes.status === 'rejected' ? (airQualityRes.reason as Error)?.message : null, // Fallback air quality
        weather: weatherRes.status === 'rejected' ? (weatherRes.reason as Error)?.message : null, // Fallback weather
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
