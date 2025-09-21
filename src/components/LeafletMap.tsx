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
  type: 'temperature' | 'air_quality' | 'vegetation' | 'precipitation' | 'fire' | 'albedo'
  visible: boolean
  opacity: number
  color: string
  url?: string
  nasaProduct?: string
  nasaType?: string
}

interface LocationData {
  lat: number
  lng: number
  name: string
  temperature: number
  airQuality: number
  vegetation: number
  precipitation: number
  fire?: number
  albedo?: number
  cloudCover?: number
  lastUpdated?: string
}

interface NASAData {
  dataType: string
  product: string
  description: string
  location: { lat: number; lng: number }
  temporal: string
  granules: Array<{
    id: string
    title: string
    timeStart: string
    timeEnd: string
    cloudCover: string
    granuleSize: string
    downloadUrl?: string
    opendapUrl?: string
    browseUrl?: string
  }>
  summary: {
    totalGranules: number
    averageCloudCover: string
  }
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
  const [nasaData, setNasaData] = useState<{ [key: string]: NASAData }>({})
  const [loadingData, setLoadingData] = useState(false)

  const sampleLocations: LocationData[] = [
    { lat: 40.7128, lng: -74.0060, name: 'New York City', temperature: 24.5, airQuality: 85, vegetation: 0.72, precipitation: 12.3 },
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles', temperature: 28.2, airQuality: 78, vegetation: 0.65, precipitation: 8.7 },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago', temperature: 22.1, airQuality: 92, vegetation: 0.68, precipitation: 15.2 },
    { lat: 29.7604, lng: -95.3698, name: 'Houston', temperature: 31.4, airQuality: 73, vegetation: 0.58, precipitation: 18.9 }
  ]

  // Fetch NASA data for a location
  const fetchNASAData = async (lat: number, lng: number, dataType: string) => {
    try {
      const response = await fetch(`/api/nasa-modis?lat=${lat}&lng=${lng}&type=${dataType}&temporal=2024-01-01,2024-01-31`)
      if (!response.ok) throw new Error('Failed to fetch NASA data')
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching NASA ${dataType} data:`, error)
      return null
    }
  }

         // Function to add visual indicators based on NASA data
         const addVisualIndicators = (lat: number, lng: number, data: any) => {
           const map = mapInstanceRef.current
           if (!map || !data) return

           // Add temperature indicator
           if (data.temperature && data.temperature.summary.totalGranules > 0) {
             const tempColor = data.temperature.summary.totalGranules > 5 ? 'red' : 'orange'
             const tempCircle = L.circleMarker([lat, lng], {
               radius: 8,
               fillColor: tempColor,
               color: 'white',
               weight: 2,
               opacity: 0.8,
               fillOpacity: 0.6
             }).bindPopup(`🌡️ Temperature Data: ${data.temperature.summary.totalGranules} granules`)
             ;(map as any).dataOverlays.temperature.addLayer(tempCircle)
           }

           // Add vegetation indicator
           if (data.vegetation && data.vegetation.summary.totalGranules > 0) {
             const vegColor = data.vegetation.summary.totalGranules > 5 ? 'green' : 'lightgreen'
             const vegCircle = L.circleMarker([lat, lng], {
               radius: 6,
               fillColor: vegColor,
               color: 'white',
               weight: 2,
               opacity: 0.8,
               fillOpacity: 0.6
             }).bindPopup(`🍃 Vegetation Data: ${data.vegetation.summary.totalGranules} granules`)
             ;(map as any).dataOverlays.vegetation.addLayer(vegCircle)
           }

           // Add fire detection indicator
           if (data.fire && data.fire.summary.totalGranules > 0) {
             const fireColor = data.fire.summary.totalGranules > 3 ? 'red' : 'orange'
             const fireCircle = L.circleMarker([lat, lng], {
               radius: 10,
               fillColor: fireColor,
               color: 'white',
               weight: 2,
               opacity: 0.9,
               fillOpacity: 0.7
             }).bindPopup(`🔥 Fire Detection: ${data.fire.summary.totalGranules} alerts`)
             ;(map as any).dataOverlays.fire.addLayer(fireCircle)
           }

           // Add albedo indicator
           if (data.albedo && data.albedo.summary.totalGranules > 0) {
             const albedoColor = data.albedo.summary.totalGranules > 5 ? 'yellow' : 'lightyellow'
             const albedoCircle = L.circleMarker([lat, lng], {
               radius: 7,
               fillColor: albedoColor,
               color: 'white',
               weight: 2,
               opacity: 0.8,
               fillOpacity: 0.6
             }).bindPopup(`☀️ Surface Albedo: ${data.albedo.summary.totalGranules} measurements`)
             ;(map as any).dataOverlays.albedo.addLayer(albedoCircle)
           }
         }

         // Fetch all NASA data for a location
         const fetchAllNASAData = async (lat: number, lng: number) => {
           setLoadingData(true)
           try {
             const dataTypes = ['temperature', 'vegetation', 'fire', 'albedo']
             const promises = dataTypes.map(type => fetchNASAData(lat, lng, type))
             const results = await Promise.all(promises)
             
             const dataMap: { [key: string]: NASAData } = {}
             results.forEach((data, index) => {
               if (data) {
                 dataMap[dataTypes[index]] = data
               }
             })
             
             setNasaData(dataMap)
             
             // Add visual indicators to the map
             if (mapInstanceRef.current && (mapInstanceRef.current as any).dataOverlays) {
               addVisualIndicators(lat, lng, dataMap)
             }
           } catch (error) {
             console.error('Error fetching NASA data:', error)
           } finally {
             setLoadingData(false)
           }
         }

         useEffect(() => {
           setIsClient(true)
         }, [])

         // Update layer visibility when layers prop changes
         useEffect(() => {
           if (mapInstanceRef.current && (mapInstanceRef.current as any).nasaLayers) {
             const updateLayerVisibility = () => {
               layers.forEach(layer => {
                 const nasaLayer = (mapInstanceRef.current as any).nasaLayers[layer.type];
                 const dataOverlay = (mapInstanceRef.current as any).dataOverlays?.[layer.type];
                 
                 if (nasaLayer) {
                   if (layer.visible) {
                     nasaLayer.addTo(mapInstanceRef.current!);
                     nasaLayer.setOpacity(layer.opacity);
                   } else {
                     nasaLayer.remove();
                   }
                 }
                 
                 if (dataOverlay) {
                   if (layer.visible) {
                     dataOverlay.addTo(mapInstanceRef.current!);
                     // Note: LayerGroup doesn't have setOpacity, individual layers within it do
                   } else {
                     dataOverlay.remove();
                   }
                 }
               });
             }
             updateLayerVisibility();
           }
         }, [layers])

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

               // Add satellite imagery layer (using a free alternative)
               const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                 attribution: '© <a href="https://www.esri.com/">Esri</a>',
                 maxZoom: 19,
                 opacity: 0.8
               })

               // Add NASA Land Surface Temperature layer (placeholder for now)
               const nasaTempLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                 attribution: '© <a href="https://www.esri.com/">Esri</a>',
                 maxZoom: 19,
                 opacity: 0.6
               })

               // Add NASA Vegetation Index layer (placeholder for now)
               const nasaVegLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                 attribution: '© <a href="https://www.esri.com/">Esri</a>',
                 maxZoom: 19,
                 opacity: 0.6
               })

               // Add visual data overlays based on NASA data
               const addDataOverlays = () => {
                 // Create temperature heatmap overlay
                 const tempOverlay = L.layerGroup()
                 
                 // Create vegetation overlay
                 const vegOverlay = L.layerGroup()
                 
                 // Create fire detection overlay
                 const fireOverlay = L.layerGroup()
                 
                 // Create albedo overlay
                 const albedoOverlay = L.layerGroup()
                 
                 // Store overlays for later use
                 ;(map as any).dataOverlays = {
                   temperature: tempOverlay,
                   vegetation: vegOverlay,
                   fire: fireOverlay,
                   albedo: albedoOverlay
                 }
               }
               
               addDataOverlays()


               // Store layers for later use
               ;(map as any).nasaLayers = {
                 satellite: satelliteLayer,
                 temperature: nasaTempLayer,
                 vegetation: nasaVegLayer
               }

               // Add layer control functionality
               const updateLayerVisibility = () => {
                 layers.forEach(layer => {
                   const nasaLayer = (map as any).nasaLayers[layer.type];
                   const dataOverlay = (map as any).dataOverlays?.[layer.type];
                   
                   if (nasaLayer) {
                     if (layer.visible) {
                       nasaLayer.addTo(map);
                       nasaLayer.setOpacity(layer.opacity);
                     } else {
                       nasaLayer.remove();
                     }
                   }
                   
                   if (dataOverlay) {
                     if (layer.visible) {
                       dataOverlay.addTo(map);
                       // Note: LayerGroup doesn't have setOpacity, individual layers within it do
                     } else {
                       dataOverlay.remove();
                     }
                   }
                 });
               }

               // Initial layer setup
               updateLayerVisibility();

        // Add sample location markers with NASA data
        sampleLocations.forEach(async (location) => {
          const marker = L.marker([location.lat, location.lng]).addTo(map)
          
          // Fetch NASA data for this location
          await fetchAllNASAData(location.lat, location.lng)
          
          // Create enhanced popup with NASA data
          const createPopupContent = (loc: LocationData, nasa: { [key: string]: NASAData }) => {
            const tempData = nasa.temperature
            const vegData = nasa.vegetation
            const fireData = nasa.fire
            const albedoData = nasa.albedo
            
            return `
              <div class="p-3 min-w-[250px]">
                <h3 class="font-semibold text-gray-800 mb-2">${loc.name}</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-orange-500">🌡️</span>
                      <span>Temperature</span>
                    </div>
                    <span class="font-medium">${loc.temperature.toFixed(1)}°C</span>
                  </div>
                  ${tempData ? `<div class="text-xs text-gray-500 ml-6">NASA: ${tempData.summary.totalGranules} granules, ${tempData.summary.averageCloudCover}% clouds</div>` : ''}
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-green-500">🍃</span>
                      <span>Vegetation</span>
                    </div>
                    <span class="font-medium">${(loc.vegetation * 100).toFixed(1)}%</span>
                  </div>
                  ${vegData ? `<div class="text-xs text-gray-500 ml-6">NASA: ${vegData.summary.totalGranules} granules, ${vegData.summary.averageCloudCover}% clouds</div>` : ''}
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-blue-500">💨</span>
                      <span>Air Quality</span>
                    </div>
                    <span class="font-medium">AQI: ${loc.airQuality}</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-cyan-500">💧</span>
                      <span>Precipitation</span>
                    </div>
                    <span class="font-medium">${loc.precipitation.toFixed(1)}mm</span>
                  </div>
                  
                  ${fireData ? `
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-red-500">🔥</span>
                      <span>Fire Detection</span>
                    </div>
                    <span class="font-medium">${fireData.summary.totalGranules} alerts</span>
                  </div>
                  ` : ''}
                  
                  ${albedoData ? `
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-yellow-500">☀️</span>
                      <span>Surface Albedo</span>
                    </div>
                    <span class="font-medium">${albedoData.summary.totalGranules} measurements</span>
                  </div>
                  ` : ''}
                </div>
                <div class="mt-2 pt-2 border-t border-gray-200">
                  <div class="text-xs text-gray-500">
                    <div>📍 ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</div>
                    <div>🛰️ NASA Earth Observation Data</div>
                  </div>
                </div>
              </div>
            `
          }
          
          marker.bindPopup(createPopupContent(location, nasaData))
          
          marker.on('click', () => {
            onLocationSelect(location)
          })
        })

        // Add click handler for map
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng
          
          // Validate coordinates
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.error('Invalid coordinates:', { lat, lng })
            return
          }
          
          // Fetch NASA data for clicked location
          await fetchAllNASAData(lat, lng)
          
          const location: LocationData = {
            lat,
            lng,
            name: `Location ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            temperature: 20 + Math.random() * 15,
            airQuality: 50 + Math.random() * 50,
            vegetation: Math.random(),
            precipitation: Math.random() * 20,
            lastUpdated: new Date().toISOString()
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
          
          {/* NASA Data Status */}
          {loadingData && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading NASA data...</span>
              </div>
            </div>
          )}
          
          {Object.keys(nasaData).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-2">🛰️ NASA Earth Observation</div>
              {Object.entries(nasaData).map(([type, data]) => (
                <div key={type} className="text-xs text-gray-500 flex justify-between">
                  <span className="capitalize">{type}:</span>
                  <span>{data.summary.totalGranules} granules</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}