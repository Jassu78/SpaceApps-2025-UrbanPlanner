import { NextRequest, NextResponse } from 'next/server'

interface PopulationRequest {
  lat: number
  lng: number
}

interface PopulationResponse {
  success: boolean
  data: {
    population: number
    density: number
    country: string
    city: string
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PopulationRequest = await request.json()
    const { lat, lng } = body

    if (!lat || !lng) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required'
      } as PopulationResponse, { status: 400 })
    }

    // Simulate population data based on coordinates
    // In a real implementation, this would call SEDAC API
    const populationData = generatePopulationData(lat, lng)

    return NextResponse.json({
      success: true,
      data: populationData
    } as PopulationResponse)

  } catch (error) {
    console.error('Population API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch population data'
    } as PopulationResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '')
    const lng = parseFloat(searchParams.get('lng') || '')

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required as query params'
      } as PopulationResponse, { status: 400 })
    }

    const populationData = generatePopulationData(lat, lng)

    return NextResponse.json({
      success: true,
      data: populationData
    } as PopulationResponse)
  } catch (error) {
    console.error('Population API GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch population data'
    } as PopulationResponse, { status: 500 })
  }
}

function generatePopulationData(lat: number, lng: number) {
  // Generate realistic population data based on coordinates
  // This simulates SEDAC population data
  
  // Major cities with known approximate populations
  const majorCities = [
    { lat: 40.7128, lng: -74.0060, city: 'New York City', country: 'USA', population: 8336817 },
    { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA', population: 3979576 },
    { lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'USA', population: 2693976 },
    { lat: 29.7604, lng: -95.3698, city: 'Houston', country: 'USA', population: 2320268 },
    { lat: 33.4484, lng: -112.0740, city: 'Phoenix', country: 'USA', population: 1680992 },
    { lat: 39.9526, lng: -75.1652, city: 'Philadelphia', country: 'USA', population: 1584064 },
    { lat: 32.7767, lng: -96.7970, city: 'Dallas', country: 'USA', population: 1343573 },
    { lat: 25.7617, lng: -80.1918, city: 'Miami', country: 'USA', population: 467963 },
    { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA', population: 873965 },
    { lat: 47.6062, lng: -122.3321, city: 'Seattle', country: 'USA', population: 749256 }
  ]

  // Find the closest major city
  let closestCity = majorCities[0]
  let minDistance = getDistance(lat, lng, closestCity.lat, closestCity.lng)

  for (const city of majorCities) {
    const distance = getDistance(lat, lng, city.lat, city.lng)
    if (distance < minDistance) {
      minDistance = distance
      closestCity = city
    }
  }

  // If very close to a major city, use its data
  if (minDistance < 0.5) { // Within ~50km
    return {
      population: closestCity.population,
      density: Math.round(closestCity.population / 1000), // people per km²
      country: closestCity.country,
      city: closestCity.city
    }
  }

  // For other locations, generate realistic data based on coordinates
  // Urban areas tend to have higher populations
  const isUrban = Math.abs(lat) < 60 && Math.abs(lng) < 180 // Not polar regions
  const basePopulation = isUrban ? 500000 : 50000
  
  // Add some randomness but keep it realistic
  const population = Math.round(basePopulation * (0.5 + Math.random()))
  const density = Math.round(population / (100 + Math.random() * 900)) // 100-1000 people per km²

  return {
    population,
    density,
    country: 'USA', // Default to USA for now
    city: 'Unknown Location'
  }
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}