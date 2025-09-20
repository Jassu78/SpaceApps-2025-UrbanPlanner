'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the Leaflet map component to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Loading Map...</p>
      </div>
    </div>
  )
})

interface MapLayer {
  id: string
  name: string
  type: 'temperature' | 'air_quality' | 'vegetation' | 'precipitation'
  visible: boolean
  opacity: number
  color: string
}

interface LocationData {
  lat: number
  lng: number
  name: string
  temperature: number
  airQuality: number
  vegetation: number
  precipitation: number
}

interface InteractiveMapProps {
  selectedLocation: LocationData | null
  onLocationSelect: (location: LocationData | null) => void
  layers: MapLayer[]
  onLayerToggle: (layerId: string) => void
  onLayerOpacityChange: (layerId: string, opacity: number) => void
}

export default function InteractiveMap({ 
  selectedLocation, 
  onLocationSelect, 
  layers, 
  onLayerToggle, 
  onLayerOpacityChange 
}: InteractiveMapProps) {
  return (
    <div className="relative w-full h-full bg-slate-900">
      <LeafletMap
        selectedLocation={selectedLocation}
        onLocationSelect={onLocationSelect}
        layers={layers}
        onLayerToggle={onLayerToggle}
        onLayerOpacityChange={onLayerOpacityChange}
      />
    </div>
  )
}