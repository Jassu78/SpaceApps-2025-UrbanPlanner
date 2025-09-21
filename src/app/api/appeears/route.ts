import { NextRequest, NextResponse } from 'next/server'

// AppEEARS (Application for Extracting and Exploring Analysis Ready Samples) API Route
// Provides geospatial data extraction and analysis

interface AppEEARSRequest {
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  products: string[]
  temporal: string
  token: string
}

interface AppEEARSProduct {
  Product: string
  Platform: string
  Description: string
  RasterType: string
  Resolution: string
  TemporalGranularity: string
  Version: string
  Available: boolean
  DocLink: string
  Source: string
  TemporalExtentStart: string
  TemporalExtentEnd: string
  Deleted: boolean
  DOI: string
  ProductAndVersion: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AppEEARSRequest = await request.json()
    const { bounds, products, temporal, token } = body

    // Validate inputs
    if (!bounds || typeof bounds.north !== 'number' || typeof bounds.south !== 'number' || 
        typeof bounds.east !== 'number' || typeof bounds.west !== 'number') {
      return NextResponse.json(
        { error: 'Invalid bounds provided' },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: 'NASA token required' },
        { status: 401 }
      )
    }

    // Fetch available products
    const availableProducts = await fetchAppEEARSProducts()
    
    // Filter products based on request
    const requestedProducts = products && products.length > 0 
      ? availableProducts.filter(p => products.includes(p.Product))
      : availableProducts.slice(0, 10) // Default to first 10 products

    // Create GeoJSON polygon for the bounds
    const geoJson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [bounds.west, bounds.south],
            [bounds.east, bounds.south],
            [bounds.east, bounds.north],
            [bounds.west, bounds.north],
            [bounds.west, bounds.south]
          ]]
        },
        properties: {}
      }]
    }

    return NextResponse.json({
      success: true,
      data: {
        products: requestedProducts,
        geoJson,
        bounds,
        temporal,
        availableProducts: availableProducts.length,
        requestedProducts: requestedProducts.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AppEEARS API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch AppEEARS data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function fetchAppEEARSProducts(): Promise<AppEEARSProduct[]> {
  try {
    const response = await fetch('https://appeears.earthdatacloud.nasa.gov/api/product?limit=50&pretty=true')
    
    if (!response.ok) {
      throw new Error(`AppEEARS API error: ${response.status}`)
    }

    const products = await response.json()
    return products

  } catch (error) {
    console.error('Error fetching AppEEARS products:', error)
    // Return some default products if API fails
    return [
      {
        Product: "MOD11A1",
        Platform: "Terra MODIS",
        Description: "Land Surface Temperature and Emissivity",
        RasterType: "Tile",
        Resolution: "1000m",
        TemporalGranularity: "Daily",
        Version: "061",
        Available: true,
        DocLink: "https://doi.org/10.5067/MODIS/MOD11A1.061",
        Source: "LP DAAC",
        TemporalExtentStart: "2000-02-18",
        TemporalExtentEnd: "Present",
        Deleted: false,
        DOI: "10.5067/MODIS/MOD11A1.061",
        ProductAndVersion: "MOD11A1.061"
      },
      {
        Product: "MOD13Q1",
        Platform: "Terra MODIS",
        Description: "Vegetation Indices 16-Day L3 Global 250m",
        RasterType: "Tile",
        Resolution: "250m",
        TemporalGranularity: "16 day",
        Version: "061",
        Available: true,
        DocLink: "https://doi.org/10.5067/MODIS/MOD13Q1.061",
        Source: "LP DAAC",
        TemporalExtentStart: "2000-02-18",
        TemporalExtentEnd: "Present",
        Deleted: false,
        DOI: "10.5067/MODIS/MOD13Q1.061",
        ProductAndVersion: "MOD13Q1.061"
      }
    ]
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'AppEEARS API - Application for Extracting and Exploring Analysis Ready Samples',
    endpoints: {
      POST: 'Fetch available products and create area analysis'
    },
    parameters: {
      bounds: 'Geographic bounds {north, south, east, west}',
      products: 'Array of product names to filter',
      temporal: 'Date range in format YYYY-MM-DD,YYYY-MM-DD',
      token: 'NASA Earthdata token'
    }
  })
}
