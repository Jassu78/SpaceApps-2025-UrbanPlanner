import { NextRequest, NextResponse } from 'next/server';

const NASA_CMR_API = process.env.NEXT_PUBLIC_NASA_CMR_API || 'https://cmr.earthdata.nasa.gov';
const NASA_TOKEN = process.env.NEXT_PUBLIC_NASA_EARTHDATA_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const dataType = searchParams.get('type') || 'temperature'; // temperature, vegetation, fire, albedo
  const temporal = searchParams.get('temporal') || '2024-01-01,2024-01-31';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  if (!NASA_TOKEN) {
    return NextResponse.json({ error: 'NASA token not configured' }, { status: 500 });
  }

  try {
    // Calculate bounding box
    const bbox = `${parseFloat(lng) - 0.1},${parseFloat(lat) - 0.1},${parseFloat(lng) + 0.1},${parseFloat(lat) + 0.1}`;
    
    // Map data types to MODIS products
    const productMap: { [key: string]: { product: string, collectionId: string, description: string } } = {
      'temperature': {
        product: 'MOD11A1',
        collectionId: 'C1748058432-LPCLOUD',
        description: 'Land Surface Temperature'
      },
      'vegetation': {
        product: 'MCD43A4',
        collectionId: 'C2218719731-LPCLOUD',
        description: 'Vegetation Index (NDVI)'
      },
      'fire': {
        product: 'MOD14',
        collectionId: 'C2271754179-LPCLOUD',
        description: 'Fire Detection'
      },
      'albedo': {
        product: 'MCD43A3',
        collectionId: 'C2278860820-LPCLOUD',
        description: 'Surface Albedo'
      },
      'reflectance': {
        product: 'MOD09GQ',
        collectionId: 'C2343115666-LPCLOUD',
        description: 'Surface Reflectance'
      }
    };

    const productInfo = productMap[dataType];
    if (!productInfo) {
      return NextResponse.json({ error: 'Invalid data type specified' }, { status: 400 });
    }

    // Search for granules
    const searchUrl = `${NASA_CMR_API}/search/granules.json?bounding_box=${bbox}&temporal=${temporal}&collection_concept_id=${productInfo.collectionId}`;
    
    // Make request with browser-like headers to avoid NASA API blocking
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NASA API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Process the response
    const processedData = {
      dataType,
      product: productInfo.product,
      description: productInfo.description,
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
      })) || [],
      summary: {
        totalGranules: data.feed?.entry?.length || 0,
        averageCloudCover: data.feed?.entry?.length > 0 
          ? (data.feed.entry.reduce((sum: number, granule: any) => sum + (parseFloat(granule.cloud_cover) || 0), 0) / data.feed.entry.length).toFixed(1)
          : 0
      }
    };

    return NextResponse.json(processedData);

  } catch (error) {
    console.error('NASA MODIS API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MODIS data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
