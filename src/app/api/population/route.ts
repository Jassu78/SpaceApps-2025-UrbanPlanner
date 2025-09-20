import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country') || 'USA'
    
    // WorldPop API - no API key required
    const populationUrl = `https://hub.worldpop.org/rest/data/pop/wpgp?iso3=${countryCode}`
    
    const response = await fetch(populationUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Population API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Process the data to extract relevant information
    const populationData = data.data || []
    
    // Get the most recent year's data
    const latestYear = Math.max(...populationData.map((item: Record<string, unknown>) => parseInt(item.popyear as string)))
    const latestData = populationData.find((item: Record<string, unknown>) => parseInt(item.popyear as string) === latestYear)
    
    // Calculate growth rate from previous year
    const previousYear = latestYear - 1
    const previousData = populationData.find((item: Record<string, unknown>) => parseInt(item.popyear as string) === previousYear)
    
    // Calculate estimated population density based on country
    // These are rough estimates for demonstration purposes
    const countryDensities: Record<string, number> = {
      'USA': 36,      // people per km²
      'CHN': 148,     // China
      'IND': 464,     // India
      'BRA': 25,      // Brazil
      'DEU': 233,     // Germany
      'GBR': 275,     // United Kingdom
      'FRA': 119,     // France
      'JPN': 347,     // Japan
      'CAN': 4,       // Canada
      'AUS': 3,       // Australia
    }
    
    const estimatedDensity = countryDensities[countryCode] || 50

    const processedData = {
      country: countryCode,
      latestYear: latestYear,
      data: {
        title: latestData?.title || 'Population Data',
        description: latestData?.desc || '',
        year: latestData?.popyear || latestYear.toString(),
        dataFile: latestData?.data_file || '',
        imageUrl: latestData?.url_img || '',
        continent: latestData?.continent || '',
        country: latestData?.country || '',
        resolution: '100m',
        format: 'GeoTIFF',
        citation: latestData?.citation || '',
        license: latestData?.license || '',
      },
      density: estimatedDensity, // Add density field
      historical: populationData.map((item: Record<string, unknown>) => ({
        year: parseInt(item.popyear as string),
        title: item.title as string,
        dataFile: item.data_file as string,
        imageUrl: item.url_img as string,
        date: item.date as string,
      })).sort((a: { year: number }, b: { year: number }) => a.year - b.year),
      growthRate: previousData ? 
        ((parseInt((latestData as Record<string, unknown>)?.popyear as string || '0') - parseInt((previousData as Record<string, unknown>).popyear as string)) / parseInt((previousData as Record<string, unknown>).popyear as string)) * 100 : null,
      metadata: {
        totalYears: populationData.length,
        yearRange: {
          start: Math.min(...populationData.map((item: Record<string, unknown>) => parseInt(item.popyear as string))),
          end: latestYear
        },
        source: 'WorldPop',
        lastUpdated: new Date().toISOString(),
      }
    }

    return NextResponse.json(processedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', // 24 hour cache
      },
    })
  } catch (error) {
    console.error('Population API Error:', error)
    
    // Return fallback data instead of error
    const fallbackData = {
      population: 8500000,
      density: 2850,
      growthRate: 0.8,
      year: 2023,
      country: 'USA',
      timestamp: new Date().toISOString(),
      source: 'Fallback Data (API Unavailable)'
    }
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache for fallback
      },
    })
  }
}
