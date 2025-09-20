'use client'

import React, { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { motion } from 'framer-motion'
import { 
  Thermometer, 
  Wind, 
  Leaf, 
  Droplets,
  MapPin,
  Satellite,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react"

// Fix for default markers in React-Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

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

// NASA GIBS tile layer URLs
const NASA_LAYERS = {
  temperature: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_Land_Surface_Temperature_Day/default/{time}/{z}/{y}/{x}.png',
  air_quality: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/Aura_NO2_Total_Column_Day/default/{time}/{z}/{y}/{x}.png',
  vegetation: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_NDVI/default/{time}/{z}/{y}/{x}.png',
  precipitation: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/GPM_3IMERGDL/default/{time}/{z}/{y}/{x}.png'
}

// Map event handlers
function MapEvents({ onLocationSelect }: { onLocationSelect: (location: LocationData | null) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      // Create a temporary location for clicked point
      const clickedLocation: LocationData = {
        lat,
        lng,
        name: `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        temperature: 24.5 + (Math.random() - 0.5) * 5,
        airQuality: 80 + (Math.random() - 0.5) * 20,
        vegetation: 0.7 + (Math.random() - 0.5) * 0.2,
        precipitation: 10 + (Math.random() - 0.5) * 10
      }
      onLocationSelect(clickedLocation)
    }
  })
  return null
}

// Custom marker component
function CustomMarker({ location, isSelected, onClick }: { 
  location: LocationData
  isSelected: boolean
  onClick: () => void 
}) {
  const getMarkerColor = (airQuality: number) => {
    if (airQuality >= 80) return '#10b981' // green
    if (airQuality >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${getMarkerColor(location.airQuality)};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: transform 0.2s ease;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={customIcon}
      eventHandlers={{
        click: onClick
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-semibold text-gray-900 mb-2">{location.name}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>Temperature: {location.temperature.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-500" />
              <span>Air Quality: {location.airQuality}</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-500" />
              <span>Vegetation: {(location.vegetation * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-500" />
              <span>Precipitation: {location.precipitation.toFixed(1)}mm</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

// NASA layer component
function NASALayer({ layer, visible, opacity }: { 
  layer: MapLayer
  visible: boolean
  opacity: number 
}) {
  if (!visible || !layer.url) return null

  const today = new Date().toISOString().split('T')[0]
  const url = layer.url.replace('{time}', today)

  return (
    <TileLayer
      url={url}
      opacity={opacity}
      attribution="NASA Earth Observation Data"
      zIndex={1000}
    />
  )
}

export default function LeafletMap({ 
  selectedLocation, 
  onLocationSelect, 
  layers, 
  onLayerToggle, 
  onLayerOpacityChange 
}: LeafletMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060])
  const [zoom, setZoom] = useState(10)
  const mapRef = useRef<L.Map>(null)

  const sampleLocations: LocationData[] = [
    { lat: 40.7128, lng: -74.0060, name: 'New York City', temperature: 24.5, airQuality: 85, vegetation: 0.72, precipitation: 12.3 },
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles', temperature: 28.2, airQuality: 78, vegetation: 0.65, precipitation: 8.7 },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago', temperature: 22.1, airQuality: 92, vegetation: 0.68, precipitation: 15.2 },
    { lat: 29.7604, lng: -95.3698, name: 'Houston', temperature: 31.4, airQuality: 73, vegetation: 0.58, precipitation: 18.9 }
  ]

  // Update NASA layer URLs
  const updatedLayers = layers.map(layer => ({
    ...layer,
    url: NASA_LAYERS[layer.type]
  }))

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView(mapCenter, zoom)
    }
  }

  return (
    <div className="relative w-full h-full bg-slate-900">
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
      >
        {/* Base Map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* NASA Data Layers */}
        {updatedLayers.map((layer) => (
          <NASALayer
            key={layer.id}
            layer={layer}
            visible={layer.visible}
            opacity={layer.opacity}
          />
        ))}

        {/* Location Markers */}
        {sampleLocations.map((location) => (
          <CustomMarker
            key={`${location.lat}-${location.lng}`}
            location={location}
            isSelected={selectedLocation?.name === location.name}
            onClick={() => onLocationSelect(location)}
          />
        ))}

        {/* Map Events */}
        <MapEvents onLocationSelect={onLocationSelect} />
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          className="p-3 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors border border-gray-200 shadow-lg"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          className="p-3 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors border border-gray-200 shadow-lg"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResetView}
          className="p-3 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors border border-gray-200 shadow-lg"
        >
          <RotateCcw className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>

      {/* Map Info Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <Satellite className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">NASA Satellite Data</span>
          </div>
          <p className="text-xs text-gray-600">
            Center: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
          </p>
          <p className="text-xs text-gray-600">
            Zoom: {zoom}x
          </p>
        </div>
      </div>
    </div>
  )
}
