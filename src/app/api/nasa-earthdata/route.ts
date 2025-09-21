import { NextRequest, NextResponse } from 'next/server';

const NASA_CMR_API = process.env.NEXT_PUBLIC_NASA_CMR_API || 'https://cmr.earthdata.nasa.gov';
const NASA_TOKEN = process.env.NEXT_PUBLIC_NASA_EARTHDATA_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const product = searchParams.get('product') || 'MOD11A1'; // Default to temperature
  const temporal = searchParams.get('temporal') || '2024-01-01,2024-01-31';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  if (!NASA_TOKEN) {
    return NextResponse.json({ error: 'NASA token not configured' }, { status: 500 });
  }

  try {
    // Calculate bounding box (0.1 degree buffer around point)
    const bbox = `${parseFloat(lng) - 0.1},${parseFloat(lat) - 0.1},${parseFloat(lng) + 0.1},${parseFloat(lat) + 0.1}`;
    
    // Map product names to collection concept IDs
    const productMap: { [key: string]: string } = {
      'MOD11A1': 'C1748058432-LPCLOUD', // Land Surface Temperature
      'MYD11A1': 'C1748046084-LPCLOUD', // Aqua Land Surface Temperature
      'MOD09GQ': 'C2343115666-LPCLOUD', // Terra Surface Reflectance
      'MYD09GQ': 'C2343109950-LPCLOUD', // Aqua Surface Reflectance
      'MCD43A3': 'C2278860820-LPCLOUD', // Albedo
      'MCD43A4': 'C2218719731-LPCLOUD', // Vegetation Index
      'MOD14': 'C2271754179-LPCLOUD',   // Fire Detection
      'MYD14': 'C2271754179-LPCLOUD'    // Aqua Fire Detection
    };

    const collectionId = productMap[product];
    if (!collectionId) {
      return NextResponse.json({ error: 'Invalid product specified' }, { status: 400 });
    }

    // Search for granules
    const searchUrl = `${NASA_CMR_API}/search/granules.json?bounding_box=${bbox}&temporal=${temporal}&collection_concept_id=${collectionId}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${NASA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process the response to extract useful information
    const processedData = {
      product,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      temporal,
      granules: data.feed?.entry?.map((granule: any) => ({
        id: granule.id,
        title: granule.title,
        timeStart: granule.time_start,
        timeEnd: granule.time_end,
        cloudCover: granule.cloud_cover,
        granuleSize: granule.granule_size,
        downloadUrl: granule.links?.find((link: any) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#' && link.href?.includes('.hdf'))?.href,
        opendapUrl: granule.links?.find((link: any) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/service#' && link.href?.includes('opendap'))?.href,
        browseUrl: granule.links?.find((link: any) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/browse#' && link.href?.includes('.jpg'))?.href
      })) || []
    };

    return NextResponse.json(processedData);

  } catch (error) {
    console.error('NASA Earthdata API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NASA data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
