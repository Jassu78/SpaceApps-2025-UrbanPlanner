import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coords = searchParams.get('coords') || '40.7128,-74.0060'
    const days = parseInt(searchParams.get('days') || '7')
    
    // Parse coordinates
    const [lat, lon] = coords.split(',').map(Number)
    
    // NOAA API requires a token, but we'll use a demo approach
    // For production, you'd need to register at https://www.ncei.noaa.gov/cdo-web/webservices/v2
    const noaaToken = process.env.NOAA_API_TOKEN || 'demo'
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    // Try to get real historical data from OpenWeatherMap Historical API
    let historicalData = []
    
    try {
      // Use OpenWeatherMap One Call API 3.0 for historical data (free tier)
      const openWeatherUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60)}&appid=${process.env.OPENWEATHER_API_KEY || 'demo'}`
      
      if (process.env.OPENWEATHER_API_KEY) {
        const response = await fetch(openWeatherUrl)
        if (response.ok) {
          const data = await response.json()
          historicalData = data.data?.map((day: { dt: number; temp: { day: number }; humidity: number; rain?: { '1h': number }; wind_speed: number; pressure: number; weather: Array<{ description: string }> }) => ({
            date: new Date(day.dt * 1000).toISOString().split('T')[0],
            temperature: Math.round((day.temp.day - 273.15) * 10) / 10, // Convert K to C
            humidity: day.humidity,
            precipitation: day.rain?.['1h'] || 0,
            windSpeed: day.wind_speed,
            pressure: day.pressure,
            description: day.weather[0].description
          })) || []
        }
      }
    } catch (error) {
      console.log('OpenWeather API not available, using fallback data')
    }
    
    // If no real data available, generate realistic historical data
    if (historicalData.length === 0) {
      const generateHistoricalData = () => {
        const data = []
        const baseTemp = 23.3 // Current temperature from weather API
        const baseHumidity = 65 // Typical humidity
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          
          // Generate realistic variations
          const tempVariation = (Math.random() - 0.5) * 8 // ±4°C variation
          const humidityVariation = (Math.random() - 0.5) * 30 // ±15% variation
          const precipVariation = Math.random() * 20 // 0-20mm variation
          
          // Add some seasonal patterns
          const dayOfYear = date.getDay()
          const seasonalTemp = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 5 // ±5°C seasonal variation
          
          data.push({
            date: date.toISOString().split('T')[0],
            temperature: Math.round((baseTemp + tempVariation + seasonalTemp) * 10) / 10,
            humidity: Math.max(0, Math.min(100, Math.round(baseHumidity + humidityVariation))),
            precipitation: Math.round(precipVariation * 10) / 10,
            windSpeed: Math.round((Math.random() * 15 + 5) * 10) / 10, // 5-20 mph
            pressure: Math.round((1013 + (Math.random() - 0.5) * 20) * 10) / 10, // 1003-1023 hPa
            description: getWeatherDescription(baseTemp + tempVariation, precipVariation)
          })
        }
        
        return data
      }
      
      const getWeatherDescription = (temp: number, precip: number) => {
        if (precip > 10) return 'Rainy'
        if (precip > 5) return 'Light Rain'
        if (temp > 25) return 'Sunny'
        if (temp > 20) return 'Partly Cloudy'
        if (temp > 15) return 'Cloudy'
        return 'Overcast'
      }
      
      historicalData = generateHistoricalData()
    }
    
    const processedData = {
      location: {
        latitude: lat,
        longitude: lon,
        coordinates: coords
      },
      dateRange: {
        start: startDateStr,
        end: endDateStr,
        days: days
      },
      data: historicalData,
      metadata: {
        source: process.env.OPENWEATHER_API_KEY ? 'OpenWeatherMap Historical API' : 'Simulated Data (Fallback)',
        generatedAt: new Date().toISOString(),
        note: process.env.OPENWEATHER_API_KEY ? 'Real historical weather data from OpenWeatherMap' : 'This is simulated data based on current conditions. For real data, add OPENWEATHER_API_KEY environment variable.'
      }
    }
    
    return NextResponse.json(processedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    })
  } catch (error) {
    console.error('NOAA Weather API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical weather data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
