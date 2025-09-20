import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // const coords = searchParams.get('coords') || '40.7128,-74.0060' // Default to NYC
    
    // NOAA Weather API - no API key required
    const weatherUrl = `https://api.weather.gov/gridpoints/TOP/31,80/forecast`
    
    const response = await fetch(weatherUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'UrbanPlanningDashboard/1.0 (contact@example.com)',
      },
    })

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Process the data to extract relevant information
    const currentPeriod = data.properties?.periods?.[0]
    
    // Convert temperature from Fahrenheit to Celsius
    const tempF = currentPeriod?.temperature as number
    const tempC = tempF ? Math.round((tempF - 32) * 5/9 * 10) / 10 : null
    
    const processedData = {
      location: data.properties?.relativeLocation?.properties || null,
      current: {
        temperature: tempC,
        humidity: currentPeriod?.relativeHumidity?.value || null,
        windSpeed: currentPeriod?.windSpeed || null,
        windDirection: currentPeriod?.windDirection || null,
        shortForecast: currentPeriod?.shortForecast || null,
        detailedForecast: currentPeriod?.detailedForecast || null,
        precipitationProbability: currentPeriod?.probabilityOfPrecipitation?.value || null,
        dewpoint: currentPeriod?.dewpoint?.value || null,
      },
      forecast: data.properties?.periods?.slice(0, 7).map((period: Record<string, unknown>) => ({
        name: period.name as string,
        temperature: period.temperature as number,
        humidity: (period.relativeHumidity as Record<string, unknown>)?.value as number,
        windSpeed: period.windSpeed as string,
        shortForecast: period.shortForecast as string,
        precipitationProbability: (period.probabilityOfPrecipitation as Record<string, unknown>)?.value as number,
        startTime: period.startTime as string,
        endTime: period.endTime as string,
      })) || [],
      metadata: {
        generatedAt: data.properties?.generatedAt || new Date().toISOString(),
        validTimes: data.properties?.validTimes || null,
      }
    }

    return NextResponse.json(processedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min cache
      },
    })
  } catch (error) {
    console.error('Weather API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
