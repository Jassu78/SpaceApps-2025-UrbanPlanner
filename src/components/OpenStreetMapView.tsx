'use client'

import React, { useEffect, useRef, useState } from 'react'

interface OpenStreetMapViewProps {
  coordinates: [number, number]
  zoom?: number
  hasError?: boolean
  className?: string
}

export default function OpenStreetMapView({ 
  coordinates, 
  zoom = 13, 
  hasError = false,
  className = "h-64 w-full rounded-lg"
}: OpenStreetMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || hasError || mapError || !mapRef.current) return

    // Dynamically import Leaflet only on client side
    const initializeMap = async () => {
      try {
        const L = await import('leaflet')
        
        // Fix for default markers in Next.js
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Create map using the container
        const map = L.map(mapRef.current!).setView(coordinates, zoom)
        mapInstanceRef.current = map

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Add satellite layer as overlay
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© <a href="https://www.esri.com/">Esri</a>',
          maxZoom: 19,
        }).addTo(map)

        // Add marker for the location
        L.marker(coordinates).addTo(map)
          .bindPopup(`
            <div class="text-center">
              <strong>Location</strong><br>
              Lat: ${coordinates[0].toFixed(4)}<br>
              Lon: ${coordinates[1].toFixed(4)}
            </div>
          `)

        // Add layer control
        const baseMaps = {
          "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }),
          "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
          })
        }

        L.control.layers(baseMaps).addTo(map)

      } catch (error) {
        console.error('Error initializing map:', error)
        setMapError(true)
      }
    }

    initializeMap()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [coordinates, zoom, hasError, isClient, mapError])

  if (!isClient) {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-500/10 to-green-500/10 flex items-center justify-center border border-blue-500/20`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-blue-300/70">Loading map...</p>
        </div>
      </div>
    )
  }

  if (hasError || mapError) {
    return (
      <div className={`${className} bg-gradient-to-br from-yellow-500/10 to-red-500/10 flex items-center justify-center border border-yellow-500/20`}>
        <div className="text-center">
          <div className="w-16 h-16 text-yellow-400/50 mx-auto mb-2">⚠️</div>
          <p className="text-yellow-300/70">Map temporarily unavailable</p>
          <p className="text-yellow-300/50 text-sm">OpenStreetMap connection issue</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  )
}
