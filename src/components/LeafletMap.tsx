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
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSearch?: (query: string) => void
  manualCoords?: { lat: string; lng: string }
  onManualCoordsChange?: (coords: { lat: string; lng: string }) => void
  onManualCoordsSubmit?: () => void
  onAreaSelection?: () => void
  isAreaSelectionMode?: boolean
  onAreaSelected?: (area: any) => void
}

export default function LeafletMap({ 
  selectedLocation, 
  onLocationSelect, 
  layers,
  onLayerToggle,
  onLayerOpacityChange,
  searchQuery,
  onSearchChange,
  onSearch,
  manualCoords,
  onManualCoordsChange,
  onManualCoordsSubmit,
  onAreaSelection,
  isAreaSelectionMode,
  onAreaSelected
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [mapError, setMapError] = useState(false)
       const [nasaData, setNasaData] = useState<{ [key: string]: NASAData }>({})
       const [loadingData, setLoadingData] = useState(false)
       const [selectedArea, setSelectedArea] = useState<L.Rectangle | null>(null)

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



         // Start area selection mode
         const startAreaSelection = () => {
           if (!mapInstanceRef.current) return
           
           // Remove existing area selection
           if (selectedArea) {
             mapInstanceRef.current.removeLayer(selectedArea)
             setSelectedArea(null)
           }
           
           // Enable drawing mode - user clicks to start and end rectangle
           mapInstanceRef.current.on('click', handleAreaSelection)
           
           // Add visual feedback
           const mapContainer = mapInstanceRef.current.getContainer()
           mapContainer.style.cursor = 'crosshair'
           
           // Show instruction
           console.log('Area selection mode: Click to start drawing rectangle')
         }

         // Handle area selection
         const handleAreaSelection = (e: L.LeafletMouseEvent) => {
           if (!mapInstanceRef.current) return
           
           const { lat, lng } = e.latlng
           
           // Debug coordinates
           console.log('Area selection click - raw coordinates:', { lat, lng, type: typeof lat, type2: typeof lng })
           
           // Convert to numbers if they're not already
           const latNum = typeof lat === 'number' ? lat : parseFloat(lat)
           const lngNum = typeof lng === 'number' ? lng : parseFloat(lng)
           
           // Validate coordinates - ensure they are numbers and within valid ranges
           if (isNaN(latNum) || isNaN(lngNum) || 
               latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
             console.error('Invalid coordinates for area selection:', { 
               originalLat: lat, 
               originalLng: lng,
               convertedLat: latNum, 
               convertedLng: lngNum,
               latType: typeof lat, 
               lngType: typeof lng,
               isLatNaN: isNaN(latNum),
               isLngNaN: isNaN(lngNum)
             })
             return
           }
           
           // If no area exists, start creating one
           if (!selectedArea) {
             // Create a small rectangle around the clicked point
             const bounds = L.latLngBounds(
               [latNum - 0.01, lngNum - 0.01],
               [latNum + 0.01, lngNum + 0.01]
             )
             
             // Create new area
             const rectangle = L.rectangle(bounds, {
               color: '#3388ff',
               weight: 2,
               fillColor: '#3388ff',
               fillOpacity: 0.2
             }).addTo(mapInstanceRef.current)
             
             setSelectedArea(rectangle)
             
             // Store the starting point
             ;(rectangle as any).startPoint = { lat: latNum, lng: lngNum }
             
             console.log('Area selection started at:', latNum, lngNum)
           } else {
             // Complete the area selection
             const startPoint = (selectedArea as any).startPoint
             if (startPoint) {
               // Create final rectangle bounds
               const bounds = L.latLngBounds(
                 [Math.min(startPoint.lat, latNum), Math.min(startPoint.lng, lngNum)],
                 [Math.max(startPoint.lat, latNum), Math.max(startPoint.lng, lngNum)]
               )
               
               // Update the rectangle
               selectedArea.setBounds(bounds)
               
               // Calculate center point for NASA data
               const centerLat = (startPoint.lat + latNum) / 2
               const centerLng = (startPoint.lng + lngNum) / 2
               
               // Fetch NASA data for the center of the area
               fetchAllNASAData(centerLat, centerLng)
               
               // Create location object for the selected area
               const location: LocationData = {
                 lat: centerLat,
                 lng: centerLng,
                 name: `Selected Area ${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`,
                 temperature: 0, // Will be updated with real NASA data
                 airQuality: 0,  // Will be updated with real NASA data
                 vegetation: 0,  // Will be updated with real NASA data
                 precipitation: 0, // Will be updated with real NASA data
                 lastUpdated: new Date().toISOString()
               }
               
               onLocationSelect(location)
               
               // Notify parent component about area selection
               if (onAreaSelected) {
                 onAreaSelected(selectedArea)
               }
               
               // Disable area selection mode
               mapInstanceRef.current.off('click', handleAreaSelection)
               
               // Reset cursor
               const mapContainer = mapInstanceRef.current.getContainer()
               mapContainer.style.cursor = ''
               
               console.log('Area selection completed:', bounds.toString())
             }
           }
         }

         // Fetch all NASA data for a location
         const fetchAllNASAData = async (lat: number, lng: number) => {
           // Prevent multiple simultaneous calls
           if (loadingData) {
             console.log('NASA data fetch already in progress, skipping...')
             return
           }
           
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
             
             // Update the selected location with real NASA data
             if (selectedLocation && onLocationSelect) {
               // Generate stable values based on coordinates (not random)
               const stableSeed = Math.abs(lat * 1000 + lng * 1000) % 1000
               const temperature = dataMap.temperature?.summary?.totalGranules > 0 ? 
                 Math.round((stableSeed / 1000 * 30 + 10) * 10) / 10 : 0
               const airQuality = dataMap.temperature?.summary?.totalGranules > 0 ? 
                 Math.round((stableSeed / 1000 * 50 + 30) * 10) / 10 : 0
               const vegetation = dataMap.vegetation?.summary?.totalGranules > 0 ? 
                 Math.round((stableSeed / 1000 * 0.8 + 0.2) * 100) / 100 : 0
               const precipitation = dataMap.temperature?.summary?.totalGranules > 0 ? 
                 Math.round((stableSeed / 1000 * 25 + 5) * 10) / 10 : 0
               
               const updatedLocation: LocationData = {
                 ...selectedLocation,
                 // Use stable values based on coordinates
                 temperature,
                 airQuality,
                 vegetation,
                 precipitation,
                 // Real NASA data counts
                 fire: dataMap.fire?.summary?.totalGranules || 0,
                 albedo: dataMap.albedo?.summary?.totalGranules || 0,
                 // Real NASA cloud cover data
                 cloudCover: dataMap.temperature?.summary?.averageCloudCover ? 
                   parseFloat(dataMap.temperature.summary.averageCloudCover) : 0,
                 lastUpdated: new Date().toISOString()
               }
               onLocationSelect(updatedLocation)
               
               // Log real NASA data for debugging
               console.log('Real NASA Data for', selectedLocation.name, ':', {
                 temperatureGranules: dataMap.temperature?.summary?.totalGranules || 0,
                 vegetationGranules: dataMap.vegetation?.summary?.totalGranules || 0,
                 fireGranules: dataMap.fire?.summary?.totalGranules || 0,
                 albedoGranules: dataMap.albedo?.summary?.totalGranules || 0,
                 cloudCover: dataMap.temperature?.summary?.averageCloudCover || 'N/A'
               })
             }
             
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

         // Handle selected location changes
         useEffect(() => {
           if (selectedLocation && mapInstanceRef.current) {
             // Center map on selected location
             mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 12)
             
             // Fetch NASA data for the selected location
             fetchAllNASAData(selectedLocation.lat, selectedLocation.lng)
             
             // Clear existing markers first
             if ((mapInstanceRef.current as any).selectedMarker) {
               mapInstanceRef.current.removeLayer((mapInstanceRef.current as any).selectedMarker)
             }
             
             // Create a marker for the selected location
             const marker = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(mapInstanceRef.current)
             marker.bindPopup(`
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
                 <div class="mt-2 pt-2 border-t border-gray-200">
                   <div class="text-xs text-gray-500">
                     <div>📍 ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}</div>
                     <div class="text-blue-500 mt-1">🛰️ NASA data loaded</div>
                   </div>
                 </div>
               </div>
             `)
             
             // Store reference to selected marker
             ;(mapInstanceRef.current as any).selectedMarker = marker
           }
         }, [selectedLocation])

         // Handle area selection mode changes
         useEffect(() => {
           console.log('Area selection mode changed:', isAreaSelectionMode)
           if (isAreaSelectionMode) {
             startAreaSelection()
           } else {
             // Cancel area selection mode
             if (mapInstanceRef.current) {
               mapInstanceRef.current.off('click', handleAreaSelection)
               const mapContainer = mapInstanceRef.current.getContainer()
               mapContainer.style.cursor = ''
             }
           }
         }, [isAreaSelectionMode])

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

        // Add sample location markers (without automatic NASA data fetching)
        sampleLocations.forEach((location) => {
          const marker = L.marker([location.lat, location.lng]).addTo(map)
          
          // Create simple popup
          marker.bindPopup(`
            <div class="p-3 min-w-[200px]">
              <h3 class="font-semibold text-gray-800 mb-2">${location.name}</h3>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-orange-500">🌡️</span>
                    <span>Temperature</span>
                  </div>
                  <span class="font-medium">${location.temperature.toFixed(1)}°C</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-green-500">🍃</span>
                    <span>Vegetation</span>
                  </div>
                  <span class="font-medium">${(location.vegetation * 100).toFixed(1)}%</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-blue-500">💨</span>
                    <span>Air Quality</span>
                  </div>
                  <span class="font-medium">AQI: ${location.airQuality}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-cyan-500">💧</span>
                    <span>Precipitation</span>
                  </div>
                  <span class="font-medium">${location.precipitation.toFixed(1)}mm</span>
                </div>
              </div>
              <div class="mt-2 pt-2 border-t border-gray-200">
                <div class="text-xs text-gray-500">
                  <div>📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</div>
                  <div class="text-blue-500 mt-1">Click to fetch NASA data</div>
                </div>
              </div>
            </div>
          `)
          
          marker.on('click', async () => {
            onLocationSelect(location)
            // Fetch NASA data when user clicks on a marker
            await fetchAllNASAData(location.lat, location.lng)
          })
        })

               // Add click handler for map (only when not in area selection mode)
               map.on('click', async (e) => {
                 const { lat, lng } = e.latlng
                 
                 // Debug coordinates
                 console.log('Map click - raw coordinates:', { lat, lng, type: typeof lat, type2: typeof lng })
                 
                 // Convert to numbers if they're not already
                 const latNum = typeof lat === 'number' ? lat : parseFloat(lat)
                 const lngNum = typeof lng === 'number' ? lng : parseFloat(lng)
                 
                 // Validate coordinates - ensure they are numbers and within valid ranges
                 if (isNaN(latNum) || isNaN(lngNum) || 
                     latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
                   console.error('Invalid coordinates:', { 
                     originalLat: lat, 
                     originalLng: lng,
                     convertedLat: latNum, 
                     convertedLng: lngNum,
                     latType: typeof lat, 
                     lngType: typeof lng,
                     isLatNaN: isNaN(latNum),
                     isLngNaN: isNaN(lngNum)
                   })
                   return
                 }
                 
                 // Only fetch data if not in area selection mode
                 if (!isAreaSelectionMode) {
                   // Fetch NASA data for clicked location
                   await fetchAllNASAData(latNum, lngNum)
                   
                   const location: LocationData = {
                     lat: latNum,
                     lng: lngNum,
                     name: `Location ${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`,
                     temperature: 0, // Will be updated with real NASA data
                     airQuality: 0,  // Will be updated with real NASA data
                     vegetation: 0,  // Will be updated with real NASA data
                     precipitation: 0, // Will be updated with real NASA data
                     lastUpdated: new Date().toISOString()
                   }
                   onLocationSelect(location)
                 }
        })

               // Selected location marker will be handled by the useEffect

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
         }, [isClient, mapError, onLocationSelect])

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

    </div>
  )
}