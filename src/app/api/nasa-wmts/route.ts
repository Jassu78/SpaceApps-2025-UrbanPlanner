import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get('service');
  const request = searchParams.get('request');
  const version = searchParams.get('version');
  const layer = searchParams.get('layer');
  const style = searchParams.get('style');
  const tilematrixset = searchParams.get('tilematrixset');
  const tilematrix = searchParams.get('tilematrix');
  const tilerow = searchParams.get('tilerow');
  const tilecol = searchParams.get('tilecol');
  const format = searchParams.get('format');

  if (!service || !request || !version || !layer || !style || !tilematrixset || !tilematrix || !tilerow || !tilecol || !format) {
    return NextResponse.json({ error: 'Missing required WMTS parameters' }, { status: 400 });
  }

  // Construct the NASA WMTS URL
  const nasaUrl = `https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi?SERVICE=${service}&REQUEST=${request}&VERSION=${version}&LAYER=${layer}&STYLE=${style}&TILEMATRIXSET=${tilematrixset}&TILEMATRIX=${tilematrix}&TILEROW=${tilerow}&TILECOL=${tilecol}&FORMAT=${format}`;

  try {
    const response = await fetch(nasaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*',
        'Referer': 'https://localhost:3000/'
      },
      redirect: 'follow' // Follow redirects
    });

    if (!response.ok) {
      console.error('NASA WMTS response not ok:', response.status, response.statusText);
      return NextResponse.json({ error: `Failed to fetch NASA WMTS tile: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('NASA WMTS proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy NASA WMTS tile' }, { status: 500 });
  }
}
