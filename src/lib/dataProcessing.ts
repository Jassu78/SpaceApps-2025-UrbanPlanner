// Data processing utilities for urban planning dashboard

export interface ProcessedDashboardData {
  airQuality: {
    aqi: number
    status: string
    healthImpact: string
    pollutants: {
      pm25: number
      pm10: number
      no2: number
      o3: number
      co: number
      so2: number
    }
  } | null
  weather: {
    temperature: number
    humidity: number
    windSpeed: string
    precipitation: number
    forecast: string
    heatIndex: number
  } | null
  population: {
    density: number
    growthRate: number | null
    yearRange: {
      start: number
      end: number
    }
  } | null
  satellite: {
    latestImage: Record<string, unknown>
    cloudCover: number
    platform: string
    availableBands: string[]
    hasError: boolean
    ndvi?: number
    health?: string
  } | null
  metrics: {
    urbanHeatIsland: Record<string, unknown>
    vegetationHealth: Record<string, unknown>
    airQualityScore: number
    populationDensity: number
    environmentalHealth: number
  }
}

export class DataProcessor {
  static processAirQuality(rawData: Record<string, unknown> | null) {
    if (!rawData) return null

    return {
      aqi: (rawData.aqi as number) || 0,
      status: this.getAQIStatus((rawData.aqi as number) || 0),
      healthImpact: this.getHealthImpact((rawData.aqi as number) || 0),
      pollutants: {
        pm25: ((rawData.pollutants as Record<string, unknown>)?.pm25 as number) || 0,
        pm10: ((rawData.pollutants as Record<string, unknown>)?.pm10 as number) || 0,
        no2: ((rawData.pollutants as Record<string, unknown>)?.no2 as number) || 0,
        o3: ((rawData.pollutants as Record<string, unknown>)?.o3 as number) || 0,
        co: ((rawData.pollutants as Record<string, unknown>)?.co as number) || 0,
        so2: ((rawData.pollutants as Record<string, unknown>)?.so2 as number) || 0,
      }
    }
  }

  static processWeather(rawData: Record<string, unknown> | null) {
    if (!rawData) return null

    const current = rawData.current as Record<string, unknown>
    return {
      temperature: (current?.temperature as number) || null,
      humidity: (current?.humidity as number) || null,
      windSpeed: (current?.windSpeed as string) || 'N/A',
      precipitation: (current?.precipitationProbability as number) || 0,
      forecast: (current?.shortForecast as string) || 'N/A',
      heatIndex: this.calculateHeatIndex(
        current?.temperature as number,
        current?.humidity as number
      )
    }
  }

  static processPopulation(rawData: Record<string, unknown> | null) {
    if (!rawData) return null

    return {
      density: (rawData.latestYear as number) || 0,
      growthRate: (rawData.growthRate as number) || null,
      yearRange: (rawData.metadata as Record<string, unknown>)?.yearRange as { start: number; end: number } || { start: 0, end: 0 }
    }
  }

  static processSatellite(rawData: Record<string, unknown> | null) {
    if (!rawData || !(rawData.features as unknown[])?.length) {
      // Return fallback data when no satellite data is available
      return {
        latestImage: null,
        cloudCover: 0,
        platform: 'No Data',
        availableBands: [],
        hasError: true,
        ndvi: 0.65, // Mock NDVI value for demonstration
        health: 'Moderate'
      }
    }

    const latestImage = (rawData.features as unknown[])[0] as Record<string, unknown>
    return {
      latestImage,
      cloudCover: (latestImage?.cloudCover as number) || 0,
      platform: (latestImage?.platform as string) || 'Unknown',
      availableBands: (latestImage?.availableBands as string[]) || [],
      hasError: false,
      ndvi: 0.72, // Mock NDVI value
      health: 'Healthy'
    }
  }

  static calculateUrbanMetrics(data: Record<string, unknown>) {
    return {
      urbanHeatIsland: this.calculateUrbanHeatIsland(
        (data.weather as Record<string, unknown>)?.temperature as number,
        (data.satellite as Record<string, unknown>)?.latestImage as Record<string, unknown>
      ),
      vegetationHealth: this.calculateVegetationHealth(
        (data.satellite as Record<string, unknown>)?.latestImage as Record<string, unknown>
      ),
      airQualityScore: this.calculateAirQualityScore((data.airQuality as Record<string, unknown>)?.aqi as number),
      populationDensity: (data.population as Record<string, unknown>)?.density as number || 0,
      environmentalHealth: this.calculateEnvironmentalHealth(
        (data.airQuality as Record<string, unknown>)?.aqi as number,
        (data.weather as Record<string, unknown>)?.temperature as number,
        (data.population as Record<string, unknown>)?.density as number
      )
    }
  }

  // Helper methods
  private static getAQIStatus(aqi: number) {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  private static getHealthImpact(aqi: number) {
    if (aqi <= 50) return 'Low risk - Air quality is satisfactory'
    if (aqi <= 100) return 'Moderate risk - Sensitive people may experience minor issues'
    if (aqi <= 150) return 'High risk - Sensitive groups should limit outdoor activity'
    if (aqi <= 200) return 'Very high risk - Everyone should limit outdoor activity'
    if (aqi <= 300) return 'Extreme risk - Avoid outdoor activity'
    return 'Dangerous - Stay indoors'
  }

  private static calculateHeatIndex(temp: number, humidity: number) {
    if (!temp || !humidity) return null
    
    // Heat Index calculation (in Fahrenheit)
    const tempF = (temp * 9/5) + 32
    const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity - 0.22475541 * tempF * humidity - 6.83783e-3 * tempF * tempF - 5.481717e-2 * humidity * humidity + 1.22874e-3 * tempF * tempF * humidity + 8.5282e-4 * tempF * humidity * humidity - 1.99e-6 * tempF * tempF * humidity * humidity
    
    // Convert back to Celsius
    return Math.round(((hi - 32) * 5/9) * 10) / 10
  }

  private static calculateUrbanHeatIsland(temperature: number, satelliteData: Record<string, unknown> | null) {
    if (!temperature || !satelliteData) return null
    
    return {
      intensity: Math.round((temperature - 20) * 0.5),
      level: temperature > 25 ? 'High' : temperature > 20 ? 'Moderate' : 'Low'
    }
  }

  private static calculateVegetationHealth(satelliteData: Record<string, unknown> | null) {
    if (!satelliteData) return null
    
    return {
      ndvi: 0.7, // Placeholder - would be calculated from red/nir bands
      health: 'Good',
      coverage: '75%'
    }
  }

  private static calculateAirQualityScore(aqi: number) {
    if (!aqi) return null
    
    return Math.max(0, 100 - (aqi * 0.5))
  }

  private static calculateEnvironmentalHealth(aqi: number, temperature: number, population: number) {
    const aqiScore = aqi ? Math.max(0, 100 - (aqi * 0.5)) : 50
    const tempScore = temperature ? Math.max(0, 100 - Math.abs(temperature - 22) * 2) : 50
    const popScore = population ? Math.max(0, 100 - (population / 1000)) : 50
    
    return Math.round((aqiScore + tempScore + popScore) / 3)
  }
}

// Cache management
export class CacheManager {
  private static cache = new Map<string, { data: ProcessedDashboardData; timestamp: number }>()
  private static ttl = 15 * 60 * 1000 // 15 minutes

  static set(key: string, value: ProcessedDashboardData) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    })
  }

  static get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  static clear() {
    this.cache.clear()
  }
}

// API client
export class APIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3000')
  }

  async fetchDashboardData(location: string = 'here', coords: string = '40.7128,-74.0060', country: string = 'USA'): Promise<ProcessedDashboardData> {
    try {
      // Check cache first
      const cacheKey = `dashboard-${location}-${coords}-${country}`
      const cached = CacheManager.get(cacheKey)
      if (cached) return cached as ProcessedDashboardData

      const response = await fetch(`${this.baseUrl}/api/dashboard?location=${location}&coords=${coords}&country=${country}`)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json() as ProcessedDashboardData
      
      // Cache the result
      CacheManager.set(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('API Client Error:', error)
      throw error
    }
  }

  async fetchAirQuality(location: string = 'here') {
    const response = await fetch(`${this.baseUrl}/api/waqi?location=${location}`)
    return response.json()
  }

  async fetchWeather(coords: string = '40.7128,-74.0060') {
    const response = await fetch(`${this.baseUrl}/api/weather?coords=${coords}`)
    return response.json()
  }

  async fetchPopulation(country: string = 'USA') {
    const response = await fetch(`${this.baseUrl}/api/population?country=${country}`)
    return response.json()
  }

  async fetchLandsat(bbox: string = '-74.1,40.7,-73.9,40.8') {
    const response = await fetch(`${this.baseUrl}/api/landsat?bbox=${bbox}`)
    return response.json()
  }
}
