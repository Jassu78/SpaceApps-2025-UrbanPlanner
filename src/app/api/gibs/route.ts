import { NextRequest, NextResponse } from 'next/server'

// GIBS (Global Imagery Browse Services) API Route
// Provides access to NASA's pre-generated satellite imagery tiles

interface GIBSRequest {
  layer: string
  z: number
  x: number
  y: number
  time?: string
  format?: 'png' | 'jpg'
}

interface GIBSLayer {
  id: string
  name: string
  description: string
  url: string
  attribution: string
  maxZoom: number
  temporal: boolean
  timeFormat?: string
}

// Available GIBS layers
const GIBS_LAYERS: GIBSLayer[] = [
  {
    id: 'modis_terra_truecolor',
    name: 'MODIS Terra True Color',
    description: 'MODIS Terra Corrected Reflectance True Color',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/250m/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS',
    maxZoom: 8,
    temporal: true,
    timeFormat: 'YYYY-MM-DD'
  },
  {
    id: 'modis_aqua_truecolor',
    name: 'MODIS Aqua True Color',
    description: 'MODIS Aqua Corrected Reflectance True Color',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Aqua_CorrectedReflectance_TrueColor/default/{time}/250m/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS',
    maxZoom: 8,
    temporal: true,
    timeFormat: 'YYYY-MM-DD'
  },
  {
    id: 'viirs_truecolor',
    name: 'VIIRS True Color',
    description: 'VIIRS SNPP Corrected Reflectance True Color',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{time}/250m/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS',
    maxZoom: 8,
    temporal: true,
    timeFormat: 'YYYY-MM-DD'
  },
  {
    id: 'landsat_truecolor',
    name: 'Landsat True Color',
    description: 'Landsat WELD Corrected Reflectance True Color',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/Landsat_WELD_CorrectedReflectance_TrueColor/default/{time}/250m/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS',
    maxZoom: 8,
    temporal: true,
    timeFormat: 'YYYY-MM-DD'
  },
  {
    id: 'modis_terra_lst',
    name: 'MODIS Land Surface Temperature',
    description: 'MODIS Terra Land Surface Temperature Day',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_Land_Surface_Temperature_Day/default/{time}/250m/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS',
    maxZoom: 8,
    temporal: true,
    timeFormat: 'YYYY-MM-DD'
  },
  {
    id: 'modis_ndvi',
    name: 'MODIS NDVI',
    description: 'MODIS Terra Vegetation Indices NDVI',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_NDVI/default/{time}/250m/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS',
    maxZoom: 8,
    temporal: true,
    timeFormat: 'YYYY-MM-DD'
  },
  {
    id: 'modis_evi',
    name: 'MODIS EVI',
    description: 'MODIS Terra Vegetation Indices EVI',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_EVI/default/{time}/250m/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS',
    maxZoom: 8,
    temporal: true,
    timeFormat: 'YYYY-MM-DD'
  },
  {
    id: 'modis_aqua_lst',
    name: 'MODIS Aqua Land Surface Temperature',
    description: 'MODIS Aqua Land Surface Temperature Day',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Aqua_Land_Surface_Temperature_Day/default/{time}/250m/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS',
    maxZoom: 8,
    temporal: true,
    timeFormat: 'YYYY-MM-DD'
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const layer = searchParams.get('layer')
  const z = searchParams.get('z')
  const x = searchParams.get('x')
  const y = searchParams.get('y')
  const time = searchParams.get('time')

  if (!layer || !z || !x || !y) {
    return NextResponse.json(
      { error: 'Layer, z, x, and y parameters are required' },
      { status: 400 }
    )
  }

  try {
    const layerInfo = GIBS_LAYERS.find(l => l.id === layer)
    if (!layerInfo) {
      return NextResponse.json(
        { error: 'Layer not found' },
        { status: 404 }
      )
    }

    // Use current date if no time specified
    const tileTime = time || new Date().toISOString().split('T')[0]
    
    // Generate tile URL
    const tileUrl = layerInfo.url
      .replace('{time}', tileTime)
      .replace('{z}', z)
      .replace('{y}', y)
      .replace('{x}', x)

    // Return tile URL and metadata
    return NextResponse.json({
      success: true,
      tileUrl,
      layer: layerInfo,
      coordinates: { z: parseInt(z), x: parseInt(x), y: parseInt(y) },
      time: tileTime,
      attribution: layerInfo.attribution
    })

  } catch (error) {
    console.error('GIBS API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate GIBS tile URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GIBSRequest = await request.json()
    const { layer, z, x, y, time, format = 'png' } = body

    if (!layer || z === undefined || x === undefined || y === undefined) {
      return NextResponse.json(
        { error: 'Layer, z, x, and y parameters are required' },
        { status: 400 }
      )
    }

    const layerInfo = GIBS_LAYERS.find(l => l.id === layer)
    if (!layerInfo) {
      return NextResponse.json(
        { error: 'Layer not found' },
        { status: 404 }
      )
    }

    // Use current date if no time specified
    const tileTime = time || new Date().toISOString().split('T')[0]
    
    // Generate tile URL
    const tileUrl = layerInfo.url
      .replace('{time}', tileTime)
      .replace('{z}', z.toString())
      .replace('{y}', y.toString())
      .replace('{x}', x.toString())

    return NextResponse.json({
      success: true,
      tileUrl,
      layer: layerInfo,
      coordinates: { z, x, y },
      time: tileTime,
      format,
      attribution: layerInfo.attribution
    })

  } catch (error) {
    console.error('GIBS POST API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate GIBS tile URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get available layers
export async function OPTIONS() {
  return NextResponse.json({
    success: true,
    layers: GIBS_LAYERS,
    count: GIBS_LAYERS.length,
    message: 'Available GIBS layers for satellite imagery'
  })
}
