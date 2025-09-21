'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import InteractiveMap from "@/components/InteractiveMap"
import { 
  Layers, 
  Thermometer, 
  Wind, 
  Droplets, 
  Leaf,
  Settings,
  ChevronDown,
  Flame,
  Sun
} from "lucide-react"

interface MapLayer {
  id: string
  name: string
  type: 'temperature' | 'air_quality' | 'vegetation' | 'precipitation' | 'fire' | 'albedo'
  visible: boolean
  opacity: number
  color: string
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

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'temp', name: 'Temperature', type: 'temperature', visible: true, opacity: 0.8, color: 'orange', nasaProduct: 'MOD11A1', nasaType: 'temperature' },
    { id: 'air', name: 'Air Quality', type: 'air_quality', visible: true, opacity: 0.7, color: 'blue' },
    { id: 'veg', name: 'Vegetation', type: 'vegetation', visible: true, opacity: 0.6, color: 'green', nasaProduct: 'MCD43A4', nasaType: 'vegetation' },
    { id: 'precip', name: 'Precipitation', type: 'precipitation', visible: false, opacity: 0.5, color: 'cyan' },
    { id: 'fire', name: 'Fire Detection', type: 'fire', visible: false, opacity: 0.7, color: 'red', nasaProduct: 'MOD14', nasaType: 'fire' },
    { id: 'albedo', name: 'Surface Albedo', type: 'albedo', visible: false, opacity: 0.6, color: 'yellow', nasaProduct: 'MCD43A3', nasaType: 'albedo' }
  ])

  const [mapCenter] = useState({ lat: 40.7128, lng: -74.0060 })
  const [zoom] = useState(10)

  const toggleLayer = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ))
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ))
  }

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'temperature': return Thermometer
      case 'air_quality': return Wind
      case 'vegetation': return Leaf
      case 'precipitation': return Droplets
      case 'fire': return Flame
      case 'albedo': return Sun
      default: return Layers
    }
  }

  const getLayerColor = (color: string) => {
    const colors = {
      orange: 'text-orange-400',
      blue: 'text-blue-400',
      green: 'text-green-400',
      cyan: 'text-cyan-400',
      red: 'text-red-400',
      yellow: 'text-yellow-400'
    }
    return colors[color as keyof typeof colors] || 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="flex h-[calc(100vh-100px)] bg-slate-900">
        {/* Interactive Map Container */}
        <div className="flex-1 relative bg-slate-900">
          <InteractiveMap
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
            layers={layers}
            onLayerToggle={toggleLayer}
            onLayerOpacityChange={updateLayerOpacity}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Layer Controls */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Data Layers
              </h3>
              <div className="space-y-3">
                {layers.map((layer) => {
                  const IconComponent = getLayerIcon(layer.type)
                  return (
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`transition-all duration-200 ${
                        layer.visible 
                          ? 'bg-white/10 border-white/30' 
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <IconComponent className={`w-5 h-5 ${getLayerColor(layer.color)}`} />
                              <span className="text-white font-medium">{layer.name}</span>
                            </div>
                            <button
                              onClick={() => toggleLayer(layer.id)}
                              className={`w-6 h-6 rounded border-2 transition-colors ${
                                layer.visible 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-white/30'
                              }`}
                            >
                              {layer.visible && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                            </button>
                          </div>
                          {layer.visible && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm text-gray-300">
                                <span>Opacity</span>
                                <span>{Math.round(layer.opacity * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={layer.opacity}
                                onChange={(e) => updateLayerOpacity(layer.id, parseFloat(e.target.value))}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Location Details */}
            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Location Details</h3>
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium mb-3">{selectedLocation.name}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300 text-sm">Temperature</span>
                        </div>
                        <span className="text-white font-medium">{selectedLocation.temperature}°C</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300 text-sm">Air Quality</span>
                        </div>
                        <span className="text-white font-medium">{selectedLocation.airQuality}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300 text-sm">Vegetation</span>
                        </div>
                        <span className="text-white font-medium">{(selectedLocation.vegetation * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-cyan-400" />
                          <span className="text-gray-300 text-sm">Precipitation</span>
                        </div>
                        <span className="text-white font-medium">{selectedLocation.precipitation}mm</span>
                      </div>
                      {selectedLocation.fire !== undefined && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-red-400" />
                            <span className="text-gray-300 text-sm">Fire Detection</span>
                          </div>
                          <span className="text-white font-medium">{selectedLocation.fire} alerts</span>
                        </div>
                      )}
                      {selectedLocation.albedo !== undefined && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300 text-sm">Surface Albedo</span>
                          </div>
                          <span className="text-white font-medium">{selectedLocation.albedo}%</span>
                        </div>
                      )}
                      {selectedLocation.cloudCover !== undefined && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">☁️</span>
                            <span className="text-gray-300 text-sm">Cloud Cover</span>
                          </div>
                          <span className="text-white font-medium">{selectedLocation.cloudCover}%</span>
                        </div>
                      )}
                      {selectedLocation.lastUpdated && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-xs text-gray-400">
                            Last updated: {new Date(selectedLocation.lastUpdated).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors border border-blue-500/30 text-left">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Map Settings</span>
                  </div>
                </button>
                <button className="w-full p-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors border border-green-500/30 text-left">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-green-400" />
                    <span className="text-white">Export Data</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
