import { NextRequest, NextResponse } from 'next/server';

const LANDSAT_API = process.env.NEXT_PUBLIC_NASA_LANDSAT_API || 'https://landsatlook.usgs.gov/stac-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const limit = searchParams.get('limit') || '5';
  const cloudCover = searchParams.get('cloudCover') || '20'; // Max cloud cover percentage

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  try {
    // Calculate bounding box
    const bbox = `${parseFloat(lng) - 0.1},${parseFloat(lat) - 0.1},${parseFloat(lng) + 0.1},${parseFloat(lat) + 0.1}`;
    
    // Search for Landsat imagery
    const searchUrl = `${LANDSAT_API}/collections/landsat-c2l2-sr/items?bbox=${bbox}&limit=${limit}&cloud_cover=${cloudCover}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Landsat API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process the response
    const processedData = {
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      bbox,
      cloudCover: parseFloat(cloudCover),
      items: data.features?.map((item: any) => ({
        id: item.id,
        datetime: item.properties?.datetime,
        cloudCover: item.properties?.cloud_cover,
        platform: item.properties?.platform,
        instrument: item.properties?.instrument,
        collection: item.properties?.collection,
        bbox: item.bbox,
        geometry: item.geometry,
        assets: item.assets ? Object.keys(item.assets).map(key => ({
          name: key,
          href: item.assets[key].href,
          type: item.assets[key].type,
          title: item.assets[key].title
        })) : [],
        thumbnail: item.assets?.thumbnail?.href,
        preview: item.assets?.preview?.href
      })) || [],
      summary: {
        totalItems: data.features?.length || 0,
        averageCloudCover: data.features?.length > 0 
          ? (data.features.reduce((sum: number, item: any) => sum + (item.properties?.cloud_cover || 0), 0) / data.features.length).toFixed(1)
          : 0
      }
    };

    return NextResponse.json(processedData);

  } catch (error) {
    console.error('Landsat API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Landsat data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
