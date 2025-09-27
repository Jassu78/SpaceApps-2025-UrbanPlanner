import { NextRequest, NextResponse } from 'next/server'
import { geodbPopulationService } from '@/lib/geodbPopulationService'

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
    region?: string
    elevation?: number
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

    // Get real population data from GeoDB Cities API
    const result = await geodbPopulationService.getPopulationData(lat, lng)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to fetch population data'
      } as PopulationResponse, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.data
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

    // Get real population data from GeoDB Cities API
    const result = await geodbPopulationService.getPopulationData(lat, lng)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to fetch population data'
      } as PopulationResponse, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.data
    } as PopulationResponse)
  } catch (error) {
    console.error('Population API GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch population data'
    } as PopulationResponse, { status: 500 })
  }
}

// Population data generation functions removed - data is now unavailable
// In a real implementation, these would call SEDAC API or similar data sources