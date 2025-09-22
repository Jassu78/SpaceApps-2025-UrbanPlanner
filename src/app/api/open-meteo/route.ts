import { NextRequest, NextResponse } from 'next/server'

// Open-Meteo endpoints (no API key required)
const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast'
const AIR_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') || '40.7128'
  const lng = searchParams.get('lng') || '-74.0060'
  const timezone = searchParams.get('timezone') || 'auto'

  try {
    // General daily + current snapshot
    const weatherUrl = `${WEATHER_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,shortwave_radiation_sum&forecast_days=1&timezone=${encodeURIComponent(timezone)}`

    // Air Quality (current + daily mean)
    const airUrl = `${AIR_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&current=european_aqi,pm10,pm2_5,carbon_monoxide,ozone,nitrogen_dioxide,sulphur_dioxide&daily=european_aqi_mean,pm10_mean,pm2_5_mean,ozone_mean&forecast_days=1&timezone=${encodeURIComponent(timezone)}`

    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl, { headers: { 'Accept': 'application/json' } }),
      fetch(airUrl, { headers: { 'Accept': 'application/json' } })
    ])

    if (!weatherRes.ok) {
      const text = await weatherRes.text()
      return NextResponse.json({ error: 'Open-Meteo weather fetch failed', details: text }, { status: 502 })
    }
    if (!airRes.ok) {
      const text = await airRes.text()
      return NextResponse.json({ error: 'Open-Meteo air-quality fetch failed', details: text }, { status: 502 })
    }

    const weather = await weatherRes.json()
    const air = await airRes.json()

    return NextResponse.json({
      source: 'Open-Meteo (Weather API Ground)',
      location: { lat: Number(lat), lng: Number(lng) },
      weatherUrl,
      airUrl,
      current: {
        temperatureC: weather.current?.temperature_2m ?? null,
        apparentTemperatureC: weather.current?.apparent_temperature ?? null,
        humidityPct: weather.current?.relative_humidity_2m ?? null,
        pressureHpa: weather.current?.pressure_msl ?? null,
        windSpeed10m: weather.current?.wind_speed_10m ?? null,
        windDirection10m: weather.current?.wind_direction_10m ?? null,
        precipitationMm: weather.current?.precipitation ?? null,
        aqiEuropean: air.current?.european_aqi ?? null,
        pm25: air.current?.pm2_5 ?? null,
        pm10: air.current?.pm10 ?? null,
        ozone: air.current?.ozone ?? null,
        nitrogenDioxide: air.current?.nitrogen_dioxide ?? null,
        sulphurDioxide: air.current?.sulphur_dioxide ?? null
      },
      daily: {
        date: weather.daily?.time?.[0] ?? null,
        tempMaxC: weather.daily?.temperature_2m_max?.[0] ?? null,
        tempMinC: weather.daily?.temperature_2m_min?.[0] ?? null,
        precipSumMm: weather.daily?.precipitation_sum?.[0] ?? null,
        uvIndexMax: weather.daily?.uv_index_max?.[0] ?? null,
        shortwaveRadiationSum: weather.daily?.shortwave_radiation_sum?.[0] ?? null,
        aqiEuropeanMean: air.daily?.european_aqi_mean?.[0] ?? null,
        pm25Mean: air.daily?.pm2_5_mean?.[0] ?? null,
        pm10Mean: air.daily?.pm10_mean?.[0] ?? null,
        ozoneMean: air.daily?.ozone_mean?.[0] ?? null
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Open-Meteo general error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}


