import { NextRequest, NextResponse } from 'next/server'
import { citySuggestionService } from '@/lib/citySuggestionService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cityName, latitude, longitude } = body
    
    if (!cityName) {
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      )
    }
    
    console.log('✅ Validating city:', cityName, 'with coordinates:', { latitude, longitude })
    
    // Validate the city name
    const validatedCity = await citySuggestionService.validateCityName(cityName)
    
    if (!validatedCity) {
      return NextResponse.json({
        success: false,
        error: `"${cityName}" is not a valid city name. Please select from the suggestions.`
      }, { status: 404 })
    }
    
    // Get population data for the validated city
    console.log('🔍 Getting population data for validated city:', validatedCity)
    const populationData = await citySuggestionService.getCityPopulationData(validatedCity)
    console.log('📊 Population data result:', populationData)
    
    if (populationData.success && populationData.data) {
      console.log('✅ City validation returning population data:', populationData.data)
      return NextResponse.json({
        success: true,
        data: {
          ...populationData.data,
          dataSource: 'OpenStreetMap + GeoDB',
          lastUpdated: new Date().toISOString()
        }
      })
    } else {
      console.log('❌ City validation failed to get population data:', populationData.error)
      return NextResponse.json({
        success: false,
        error: populationData.error || 'Failed to get population data'
      }, { status: 404 })
    }
    
  } catch (error) {
    console.error('❌ City validation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to validate city',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
