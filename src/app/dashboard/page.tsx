'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Thermometer, 
  Wind, 
  Droplets, 
  Leaf, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Satellite,
  BarChart3,
  RefreshCw
} from "lucide-react"

interface ClimateData {
  temperature: number
  airQuality: number
  humidity: number
  vegetation: number
  precipitation: number
  timestamp: string
}

export default function DashboardPage() {
  const [climateData, setClimateData] = useState<ClimateData>({
    temperature: 24.5,
    airQuality: 85,
    humidity: 65,
    vegetation: 0.72,
    precipitation: 12.3,
    timestamp: new Date().toISOString()
  })

  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setClimateData({
        temperature: 24.5 + (Math.random() - 0.5) * 2,
        airQuality: Math.max(0, Math.min(100, 85 + (Math.random() - 0.5) * 10)),
        humidity: Math.max(0, Math.min(100, 65 + (Math.random() - 0.5) * 10)),
        vegetation: Math.max(0, Math.min(1, 0.72 + (Math.random() - 0.5) * 0.1)),
        precipitation: Math.max(0, 12.3 + (Math.random() - 0.5) * 5),
        timestamp: new Date().toISOString()
      })
      setIsLoading(false)
    }, 1500)
  }

  const getAirQualityStatus = (aqi: number) => {
    if (aqi >= 80) return { status: 'Good', color: 'green', icon: CheckCircle }
    if (aqi >= 60) return { status: 'Moderate', color: 'yellow', icon: AlertTriangle }
    return { status: 'Poor', color: 'red', icon: AlertTriangle }
  }

  const airQualityStatus = getAirQualityStatus(climateData.airQuality)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Temperature Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Thermometer className="w-6 h-6 text-orange-400" />
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    Temperature
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">
                    {climateData.temperature.toFixed(1)}°C
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Land Surface Temperature
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">+0.3°C from yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Air Quality Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Wind className="w-6 h-6 text-blue-400" />
                  </div>
                  <Badge className={`${
                    airQualityStatus.color === 'green' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    airQualityStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    Air Quality
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">
                    {climateData.airQuality.toFixed(0)}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Air Quality Index
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <airQualityStatus.icon className={`w-4 h-4 text-${airQualityStatus.color}-400`} />
                    <span className={`text-${airQualityStatus.color}-400`}>
                      {airQualityStatus.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vegetation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Leaf className="w-6 h-6 text-green-400" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Vegetation
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">
                    {(climateData.vegetation * 100).toFixed(1)}%
                  </h3>
                  <p className="text-gray-300 text-sm">
                    NDVI Index
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Healthy growth</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Precipitation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <Droplets className="w-6 h-6 text-cyan-400" />
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    Precipitation
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">
                    {climateData.precipitation.toFixed(1)}mm
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Last 24 hours
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">Updated 2 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Data Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Climate Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Climate Trends</h3>
                </div>
                <div className="h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-blue-400/50 mx-auto mb-2" />
                    <p className="text-blue-300/70">Interactive climate trends chart</p>
                    <p className="text-blue-300/50 text-sm">NASA MODIS & Landsat data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Satellite View</h3>
                </div>
                <div className="h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-green-400/50 mx-auto mb-2" />
                    <p className="text-green-300/70">Interactive satellite map</p>
                    <p className="text-green-300/50 text-sm">Real-time NASA imagery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-white font-medium">View Map</p>
                    <p className="text-blue-300/70 text-sm">Interactive satellite view</p>
                  </div>
                </button>
                <button className="p-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors border border-green-500/30">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-white font-medium">Analytics</p>
                    <p className="text-green-300/70 text-sm">Detailed data analysis</p>
                  </div>
                </button>
                <button className="p-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors border border-purple-500/30">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-white font-medium">AI Chat</p>
                    <p className="text-purple-300/70 text-sm">Ask questions about data</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
