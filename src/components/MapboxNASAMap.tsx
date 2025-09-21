'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function MapboxNASAMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    const initializeMap = async () => {
      try {
        // Check if mapbox-gl is available
        let mapboxgl
        try {
          mapboxgl = await import('mapbox-gl')
        } catch (importError) {
          console.warn('Mapbox GL JS not installed, using fallback')
          return
        }
        
        // You can get a free Mapbox token from https://account.mapbox.com/
        // For now, we'll use a demo approach
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' // Demo token
        
        const map = new mapboxgl.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/satellite-v9', // Satellite imagery by default
          center: [-74.0060, 40.7128],
          zoom: 6
        })

        // Add NASA layer as a raster source
        map.on('load', () => {
          map.addSource('nasa-modis', {
            type: 'raster',
            tiles: [
              'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-15/250m/{z}/{y}/{x}.jpg'
            ],
            tileSize: 256,
            maxzoom: 8
          })

          map.addLayer({
            id: 'nasa-modis-layer',
            type: 'raster',
            source: 'nasa-modis',
            paint: {
              'raster-opacity': 0.8
            }
          })

          console.log('✅ NASA layer added to Mapbox!')
        })

      } catch (error) {
        console.error('❌ Error initializing Mapbox:', error)
      }
    }

    initializeMap()
  }, [isClient])

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Mapbox NASA Map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 bg-slate-900 rounded-lg">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  )
}
