'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function SimpleNASAMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    const initializeMap = async () => {
      try {
        const L = await import('leaflet')
        
        // Fix for default markers in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Create map
        const map = L.map(mapRef.current!).setView([40.7128, -74.0060], 6)

        // Add OpenStreetMap base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Add working NASA layers - SIMPLIFIED APPROACH
        const modisTerraLayer = L.tileLayer(
          'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-15/250m/{z}/{y}/{x}.jpg',
          {
            attribution: 'NASA GIBS',
            maxZoom: 8,
            opacity: 0.8
          }
        )

        // Add MODIS Terra layer to map by default
        modisTerraLayer.addTo(map)

        // Add layer control with working NASA layers
        const baseMaps = {
          "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }),
          "NASA MODIS Terra": modisTerraLayer
        }

        L.control.layers(baseMaps).addTo(map)

        console.log('✅ NASA layer added successfully!')
        console.log('Map layers:', map._layers)

      } catch (error) {
        console.error('❌ Error initializing map:', error)
      }
    }

    initializeMap()
  }, [isClient])

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading NASA Map...</p>
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
