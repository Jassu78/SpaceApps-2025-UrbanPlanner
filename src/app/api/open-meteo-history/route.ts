import { NextRequest, NextResponse } from 'next/server'

const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast'
const AIR_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') || '40.7128'
  const lng = searchParams.get('lng') || '-74.0060'
  const daysStr = searchParams.get('days') || '7'
  const timezone = searchParams.get('timezone') || 'auto'

  const days = Math.min(Math.max(parseInt(daysStr, 10) || 7, 1), 16)

  try {
    // Hourly for the last N days using past_days
    const weatherUrl = `${WEATHER_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&hourly=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,pressure_msl,wind_speed_10m&past_days=${days}&forecast_days=0&timezone=${encodeURIComponent(timezone)}`

    // Air quality hourly means (Open-Meteo AQ supports historical via past_hours implicitly when past_days used)
    const airUrl = `${AIR_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&hourly=european_aqi,pm10,pm2_5,ozone&past_days=${days}&forecast_days=0&timezone=${encodeURIComponent(timezone)}`

    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl, { headers: { 'Accept': 'application/json' } }),
      fetch(airUrl, { headers: { 'Accept': 'application/json' } })
    ])

    if (!weatherRes.ok) {
      const text = await weatherRes.text()
      return NextResponse.json({ error: 'Open-Meteo history weather fetch failed', details: text }, { status: 502 })
    }
    if (!airRes.ok) {
      const text = await airRes.text()
      return NextResponse.json({ error: 'Open-Meteo history air-quality fetch failed', details: text }, { status: 502 })
    }

    const weather = await weatherRes.json()
    const air = await airRes.json()

    return NextResponse.json({
      source: 'Open-Meteo (Weather API Ground)',
      location: { lat: Number(lat), lng: Number(lng) },
      days,
      weatherUrl,
      airUrl,
      hourly: {
        time: weather.hourly?.time ?? [],
        temperatureC: weather.hourly?.temperature_2m ?? [],
        humidityPct: weather.hourly?.relative_humidity_2m ?? [],
        precipitationMm: weather.hourly?.precipitation ?? [],
        cloudCoverPct: weather.hourly?.cloud_cover ?? [],
        pressureHpa: weather.hourly?.pressure_msl ?? [],
        windSpeed10m: weather.hourly?.wind_speed_10m ?? []
      },
      airQualityHourly: {
        time: air.hourly?.time ?? [],
        aqiEuropean: air.hourly?.european_aqi ?? [],
        pm25: air.hourly?.pm2_5 ?? [],
        pm10: air.hourly?.pm10 ?? [],
        ozone: air.hourly?.ozone ?? []
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Open-Meteo history error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}


