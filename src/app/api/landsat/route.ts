import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bbox = searchParams.get('bbox') || '-74.1,40.7,-73.9,40.8' // Default to NYC area
    const limit = searchParams.get('limit') || '5'
    const datetime = searchParams.get('datetime') || new Date().toISOString().split('T')[0]
    
    // Validate bbox format (should be minx,miny,maxx,maxy)
    const bboxArray = bbox.split(',').map(Number)
    if (bboxArray.length !== 4 || bboxArray.some(isNaN)) {
      throw new Error('Invalid bbox format. Expected: minx,miny,maxx,maxy')
    }
    
    // Build Landsat STAC API URL with proper parameters
    const baseUrl = 'https://landsatlook.usgs.gov/stac-server/collections/landsat-c2l2-sr/items'
    const params = new URLSearchParams({
      bbox: bbox,
      limit: limit,
      datetime: `${datetime}T00:00:00Z/${datetime}T23:59:59Z` // Proper datetime range format
    })
    
    const landsatUrl = `${baseUrl}?${params.toString()}`
    
    console.log('Landsat API URL:', landsatUrl) // Debug logging
    
    const response = await fetch(landsatUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'UrbanPlanningDashboard/1.0'
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Landsat API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: landsatUrl,
        error: errorText
      })
      throw new Error(`Landsat API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    
    // Process the data to extract relevant information
    const features = data.features || []
    
    const processedData = {
      totalFeatures: data.numberMatched || 0,
      returnedFeatures: data.numberReturned || 0,
      features: features.map((feature: Record<string, unknown>) => ({
        id: feature.id as string,
        datetime: (feature.properties as Record<string, unknown>)?.datetime as string,
        cloudCover: (feature.properties as Record<string, unknown>)?.['eo:cloud_cover'] as number,
        platform: (feature.properties as Record<string, unknown>)?.platform as string,
        instruments: (feature.properties as Record<string, unknown>)?.instruments as string[],
        bbox: feature.bbox as number[],
        geometry: feature.geometry as Record<string, unknown>,
        availableBands: Object.keys((feature.assets as Record<string, unknown>) || {}),
        bands: {
          red: (feature.assets as Record<string, unknown>)?.red || null,
          green: (feature.assets as Record<string, unknown>)?.green || null,
          blue: (feature.assets as Record<string, unknown>)?.blue || null,
          nir: (feature.assets as Record<string, unknown>)?.nir08 || null,
          swir1: (feature.assets as Record<string, unknown>)?.swir16 || null,
          swir2: (feature.assets as Record<string, unknown>)?.swir22 || null,
        },
        thumbnails: {
          small: ((feature.assets as Record<string, unknown>)?.thumbnail as Record<string, unknown>)?.href as string || null,
          large: ((feature.assets as Record<string, unknown>)?.reduced_resolution_browse as Record<string, unknown>)?.href as string || null
        },
        metadata: {
          collection: feature.collection as string || 'unknown',
          stacVersion: feature.stac_version as string || '1.0.0',
          extensions: (feature.stac_extensions as unknown[]) || []
        }
      })),
      metadata: {
        stacVersion: data.stac_version,
        type: data.type,
        context: data.context,
        links: data.links || []
      }
    }

    return NextResponse.json(processedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    })
  } catch (error) {
    console.error('Landsat API Error:', error)
    
    // Return fallback data instead of error to prevent dashboard failure
    const fallbackData = {
      totalFeatures: 0,
      returnedFeatures: 0,
      features: [],
      metadata: {
        stacVersion: '1.0.0',
        type: 'FeatureCollection',
        context: null,
        links: []
      },
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }
    }
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache for errors
      },
    })
  }
}
