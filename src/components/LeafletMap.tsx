'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Thermometer, 
  Wind, 
  Leaf, 
  Droplets,
  Satellite,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react"

interface MapLayer {
  id: string
  name: string
  type: 'temperature' | 'air_quality' | 'vegetation' | 'precipitation'
  visible: boolean
  opacity: number
  color: string
  url?: string
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

interface LeafletMapProps {
  selectedLocation: LocationData | null
  onLocationSelect: (location: LocationData | null) => void
  layers: MapLayer[]
  onLayerToggle: (layerId: string) => void
  onLayerOpacityChange: (layerId: string, opacity: number) => void
}

export default function LeafletMap({ 
  selectedLocation, 
  onLocationSelect, 
  layers,
  onLayerToggle,
  onLayerOpacityChange
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [mapError, setMapError] = useState(false)

  const sampleLocations: LocationData[] = [
    { lat: 40.7128, lng: -74.0060, name: 'New York City', temperature: 24.5, airQuality: 85, vegetation: 0.72, precipitation: 12.3 },
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles', temperature: 28.2, airQuality: 78, vegetation: 0.65, precipitation: 8.7 },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago', temperature: 22.1, airQuality: 92, vegetation: 0.68, precipitation: 15.2 },
    { lat: 29.7604, lng: -95.3698, name: 'Houston', temperature: 31.4, airQuality: 73, vegetation: 0.58, precipitation: 18.9 }
  ]

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || mapError || !mapRef.current) return

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
        const map = L.map(mapRef.current!).setView([40.7128, -74.0060], 10)
        mapInstanceRef.current = map

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Add NASA satellite layer
        L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=MODIS_Terra_CorrectedReflectance_TrueColor&STYLE=default&TILEMATRIXSET=EPSG4326_500m&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg', {
          attribution: '© <a href="https://earthdata.nasa.gov/">NASA Earthdata</a>',
          maxZoom: 19,
          opacity: 0.7
        }).addTo(map)

        // Add sample location markers
        sampleLocations.forEach((location) => {
          const marker = L.marker([location.lat, location.lng]).addTo(map)
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-gray-800 mb-2">${location.name}</h3>
              <div class="space-y-1 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-orange-500">🌡️</span>
                  <span>${location.temperature.toFixed(1)}°C</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-blue-500">💨</span>
                  <span>AQI: ${location.airQuality}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-500">🍃</span>
                  <span>${(location.vegetation * 100).toFixed(1)}%</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-cyan-500">💧</span>
                  <span>${location.precipitation.toFixed(1)}mm</span>
                </div>
              </div>
            </div>
          `)
          
          marker.on('click', () => {
            onLocationSelect(location)
          })
        })

        // Add click handler for map
        map.on('click', (e) => {
          const { lat, lng } = e.latlng
          const location: LocationData = {
            lat,
            lng,
            name: `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            temperature: 20 + Math.random() * 15,
            airQuality: 50 + Math.random() * 50,
            vegetation: Math.random(),
            precipitation: Math.random() * 20
          }
          onLocationSelect(location)
        })

        // Add selected location marker if exists
        if (selectedLocation) {
          const selectedMarker = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(map)
          selectedMarker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-gray-800 mb-2">${selectedLocation.name}</h3>
              <div class="space-y-1 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-orange-500">🌡️</span>
                  <span>${selectedLocation.temperature.toFixed(1)}°C</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-blue-500">💨</span>
                  <span>AQI: ${selectedLocation.airQuality}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-500">🍃</span>
                  <span>${(selectedLocation.vegetation * 100).toFixed(1)}%</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-cyan-500">💧</span>
                  <span>${selectedLocation.precipitation.toFixed(1)}mm</span>
                </div>
              </div>
            </div>
          `)
        }

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
  }, [isClient, mapError, selectedLocation, onLocationSelect])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([40.7128, -74.0060], 10)
    }
  }

  if (!isClient) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Map...</p>
        </div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 text-yellow-400/50 mx-auto mb-2">⚠️</div>
          <p className="text-yellow-300/70">Map temporarily unavailable</p>
          <p className="text-yellow-300/50 text-sm">OpenStreetMap connection issue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-slate-900">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResetView}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 mb-2">Data Layers</h3>
          {layers.map((layer) => (
            <div key={layer.id} className="flex items-center gap-3">
              <button
                onClick={() => onLayerToggle(layer.id)}
                className={`w-5 h-5 rounded border-2 transition-colors ${
                  layer.visible 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                }`}
              >
                {layer.visible && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
              </button>
              <span className="text-sm text-gray-700">{layer.name}</span>
              {layer.visible && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layer.opacity}
                  onChange={(e) => onLayerOpacityChange(layer.id, parseFloat(e.target.value))}
                  className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}