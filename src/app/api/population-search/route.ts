import { NextRequest, NextResponse } from 'next/server'
import { geodbPopulationService } from '@/lib/geodbPopulationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityName = searchParams.get('city')
    
    if (!cityName) {
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Searching for city:', cityName)
    
    const result = await geodbPopulationService.getPopulationDataByCityName(cityName)
    
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: {
          ...result.data,
          dataSource: 'GeoDB Cities API',
          lastUpdated: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        suggestions: result.suggestions || []
      }, { status: 404 })
    }
    
  } catch (error) {
    console.error('❌ Population search error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search for city population data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
