import { NextRequest, NextResponse } from 'next/server'

// FIRMS (Fire Information for Resource Management System) API Route
// Provides real-time fire detection data from NASA

interface FIRMSRequest {
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  token: string
  days?: number
}

interface FIRMSFireData {
  latitude: number
  longitude: number
  brightness: number
  scan: number
  track: number
  acq_date: string
  acq_time: string
  satellite: string
  confidence: string
  version: string
  bright_t31: number
  frp: number
  daynight: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FIRMSRequest = await request.json()
    const { bounds, token, days = 1 } = body

    // Validate bounds
    if (!bounds || typeof bounds.north !== 'number' || typeof bounds.south !== 'number' || 
        typeof bounds.east !== 'number' || typeof bounds.west !== 'number') {
      return NextResponse.json(
        { error: 'Invalid bounds provided' },
        { status: 400 }
      )
    }

    // Validate token
    if (!token) {
      return NextResponse.json(
        { error: 'NASA token required' },
        { status: 401 }
      )
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Fetch FIRMS data for the specified area and date range
    const firmsData = await fetchFIRMSData(bounds, formatDate(startDate), formatDate(endDate))

    return NextResponse.json({
      success: true,
      data: firmsData,
      bounds,
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(endDate)
      },
      count: firmsData.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('FIRMS API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch FIRMS data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function fetchFIRMSData(
  bounds: { north: number; south: number; east: number; west: number },
  startDate: string,
  endDate: string
): Promise<FIRMSFireData[]> {
  try {
    // Use the direct CSV endpoint we tested earlier
    const csvUrl = `https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv`
    
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      throw new Error(`FIRMS CSV fetch failed: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split('\n')
    
    // Skip header line
    const dataLines = lines.slice(1).filter(line => line.trim())
    
    const fireData: FIRMSFireData[] = []
    
    for (const line of dataLines) {
      const columns = line.split(',')
      
      if (columns.length >= 12) {
        const latitude = parseFloat(columns[0])
        const longitude = parseFloat(columns[1])
        
        // Check if fire is within bounds
        if (latitude >= bounds.south && latitude <= bounds.north &&
            longitude >= bounds.west && longitude <= bounds.east) {
          
          fireData.push({
            latitude,
            longitude,
            brightness: parseFloat(columns[2]) || 0,
            scan: parseFloat(columns[3]) || 0,
            track: parseFloat(columns[4]) || 0,
            acq_date: columns[5] || '',
            acq_time: columns[6] || '',
            satellite: columns[7] || '',
            confidence: columns[8] || '',
            version: columns[9] || '',
            bright_t31: parseFloat(columns[10]) || 0,
            frp: parseFloat(columns[11]) || 0,
            daynight: columns[12] || ''
          })
        }
      }
    }
    
    return fireData
    
  } catch (error) {
    console.error('Error fetching FIRMS data:', error)
    throw error
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'FIRMS API - Fire Information for Resource Management System',
    endpoints: {
      POST: 'Fetch fire data for specified bounds'
    },
    parameters: {
      bounds: 'Geographic bounds {north, south, east, west}',
      token: 'NASA Earthdata token',
      days: 'Number of days to look back (default: 1)'
    }
  })
}
