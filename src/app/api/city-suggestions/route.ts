import { NextRequest, NextResponse } from 'next/server'
import { citySuggestionService } from '@/lib/citySuggestionService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '5')
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: []
      })
    }
    
    console.log('🔍 Getting city suggestions for:', query)
    
    const suggestions = await citySuggestionService.getCitySuggestions(query, limit)
    
    return NextResponse.json({
      success: true,
      suggestions
    })
    
  } catch (error) {
    console.error('❌ City suggestions error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get city suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
