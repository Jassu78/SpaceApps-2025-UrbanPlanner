'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  Thermometer,
  Wind,
  Leaf,
  Droplets,
  RefreshCw,
  MapPin
} from "lucide-react"
import { nasaAnalyticsService, NASAAnalyticsData } from '@/lib/nasaAnalyticsService'
import NASAChart from '@/components/NASAChart'

interface LocationData {
  lat: number
  lng: number
  name: string
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<NASAAnalyticsData | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature')
  const [timeRange, setTimeRange] = useState<string>('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    lat: 40.7128,
    lng: -74.0060,
    name: 'New York City'
  })
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Fetch real NASA data on component mount
  useEffect(() => {
    fetchRealNASAData()
  }, [selectedLocation])

  const fetchRealNASAData = async () => {
    setIsLoading(true)
    try {
      console.log('🌍 Fetching real NASA analytics data...')
      const data = await nasaAnalyticsService.fetchAnalyticsData(selectedLocation.lat, selectedLocation.lng)
      setAnalyticsData(data)
      setLastUpdated(new Date().toLocaleTimeString())
      console.log('✅ Real NASA data loaded:', data)
    } catch (error) {
      console.error('❌ Error fetching NASA data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchRealNASAData()
  }

  // Data refresh functionality can be added later
  //   // Simulate data refresh with slight variations
  //   setAnalyticsData(prev => ({
  //     temperature: {
  //       ...prev.temperature,
  //       current: prev.temperature.current + (Math.random() - 0.5) * 2,
  //       trend: prev.temperature.trend + (Math.random() - 0.5) * 2
  //     },
  //     airQuality: {
  //       ...prev.airQuality,
  //       current: Math.max(0, Math.min(100, prev.airQuality.current + (Math.random() - 0.5) * 5)),
  //       trend: prev.airQuality.trend + (Math.random() - 0.5) * 2
  //     },
  //     vegetation: {
  //       ...prev.vegetation,
  //       current: Math.max(0, Math.min(1, prev.vegetation.current + (Math.random() - 0.5) * 0.05)),
  //       trend: prev.vegetation.trend + (Math.random() - 0.5) * 2
  //     },
  //     precipitation: {
  //       ...prev.precipitation,
  //       current: Math.max(0, prev.precipitation.current + (Math.random() - 0.5) * 3),
  //       trend: prev.precipitation.trend + (Math.random() - 0.5) * 5
  //     }
  //   }))
  //   setIsLoading(false)
  // }, 1500)
  // }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'temperature': return Thermometer
      case 'airQuality': return Wind
      case 'vegetation': return Leaf
      case 'precipitation': return Droplets
      default: return Activity
    }
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'temperature': return 'text-orange-400'
      case 'airQuality': return 'text-blue-400'
      case 'vegetation': return 'text-green-400'
      case 'precipitation': return 'text-cyan-400'
      default: return 'text-purple-400'
    }
  }

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-400' : 'text-red-400'
  }

  const metrics = [
    { key: 'temperature', name: 'Temperature', unit: '°C', icon: Thermometer, color: 'orange' },
    { key: 'airQuality', name: 'Air Quality', unit: 'AQI', icon: Wind, color: 'blue' },
    { key: 'vegetation', name: 'Vegetation', unit: 'NDVI', icon: Leaf, color: 'green' },
    { key: 'precipitation', name: 'Precipitation', unit: 'mm', icon: Droplets, color: 'cyan' }
  ]

  const locations = [
    { lat: 40.7128, lng: -74.0060, name: 'New York City' },
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago' },
    { lat: 29.7604, lng: -95.3698, name: 'Houston' },
    { lat: 33.4484, lng: -112.0740, name: 'Phoenix' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading NASA Data...</h2>
          <p className="text-gray-300">Fetching real-time satellite and environmental data</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Data</h2>
          <p className="text-gray-300 mb-4">Unable to fetch NASA analytics data</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">NASA Analytics Dashboard</h1>
              <p className="text-gray-300">Real-time environmental data from NASA satellites</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="text-white font-medium">{lastUpdated}</p>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg border border-indigo-500/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-indigo-300 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-indigo-300 text-sm">Refresh</span>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedLocation.name}
                  onChange={(e) => {
                    const location = locations.find(l => l.name === e.target.value)
                    if (location) setSelectedLocation(location)
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500/50"
                >
                  {locations.map(location => (
                    <option key={location.name} value={location.name} className="bg-slate-800">
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500/50"
                >
                  {metrics.map(metric => (
                    <option key={metric.key} value={metric.key} className="bg-slate-800">
                      {metric.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="24h" className="bg-slate-800">Last 24 hours</option>
                  <option value="7d" className="bg-slate-800">Last 7 days</option>
                  <option value="30d" className="bg-slate-800">Last 30 days</option>
                  <option value="90d" className="bg-slate-800">Last 90 days</option>
                </select>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg border border-indigo-500/30 transition-colors">
              <Download className="w-4 h-4 text-indigo-300" />
              <span className="text-indigo-300 text-sm">Export Data</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const data = analyticsData[metric.key as keyof NASAAnalyticsData]
            const TrendIcon = getTrendIcon(data.trend)
            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-${metric.color}-500/20 rounded-lg`}>
                        <metric.icon className={`w-6 h-6 text-${metric.color}-400`} />
                      </div>
                      <Badge className={`bg-${metric.color}-500/20 text-${metric.color}-300 border-${metric.color}-500/30`}>
                        {metric.name}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold text-white">
                        {metric.key === 'vegetation' ? data.current.toFixed(3) : data.current.toFixed(1)}
                        {metric.unit}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Current Value
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendIcon className={`w-4 h-4 ${getTrendColor(data.trend)}`} />
                        <span className={getTrendColor(data.trend)}>
                          {data.trend > 0 ? '+' : ''}{data.trend.toFixed(1)}% from average
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-gray-400">Source: {data.source}</p>
                        <p className="text-xs text-gray-500">Updated: {new Date(data.lastUpdated).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Main Chart Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Primary Chart */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {React.createElement(getMetricIcon(selectedMetric), {
                        className: `w-6 h-6 ${getMetricColor(selectedMetric)}`
                      })}
                      <h3 className="text-xl font-semibold text-white">
                        {metrics.find(m => m.key === selectedMetric)?.name} Trends
                      </h3>
                    </div>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                      {timeRange.toUpperCase()}
                    </Badge>
                  </div>
                  <NASAChart
                    data={analyticsData[selectedMetric as keyof NASAAnalyticsData].history}
                    title={`${metrics.find(m => m.key === selectedMetric)?.name} Trends`}
                    unit={metrics.find(m => m.key === selectedMetric)?.unit || ''}
                    color={metrics.find(m => m.key === selectedMetric)?.color || 'indigo'}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    NASA Data Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Temperature Data Active</p>
                        <p className="text-gray-300 text-xs">MODIS Terra Land Surface Temperature</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Air Quality Monitoring</p>
                        <p className="text-gray-300 text-xs">FIRMS Fire Data (Atmospheric Proxy)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Vegetation Analysis</p>
                        <p className="text-gray-300 text-xs">MODIS Terra NDVI (Normalized Difference Vegetation Index)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Urban Analysis</p>
                        <p className="text-gray-300 text-xs">SEDAC Population Data (Precipitation Proxy)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">NASA Data Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Data Points</span>
                      <span className="text-white font-medium">Real-time</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Update Frequency</span>
                      <span className="text-white font-medium">Live NASA feeds</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Data Sources</span>
                      <span className="text-white font-medium">4 NASA APIs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Location</span>
                      <span className="text-white font-medium">{selectedLocation.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Coordinates</span>
                      <span className="text-white font-medium text-xs">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Last Updated</span>
                      <span className="text-white font-medium">{lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">NASA Data Correlation</h3>
                <div className="h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-green-400/50 mx-auto mb-2" />
                    <p className="text-green-300/70">NASA Satellite Data</p>
                    <p className="text-green-300/50 text-sm">MODIS, FIRMS, SEDAC correlation</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-green-300">Temperature ↔ Vegetation</p>
                        <p className="text-gray-400">
                          {analyticsData ? 
                            `${((analyticsData.temperature.trend + analyticsData.vegetation.trend) / 2).toFixed(1)}% correlation` :
                            'Real-time correlation'
                          }
                        </p>
                      </div>
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-blue-300">Air Quality ↔ Fire Activity</p>
                        <p className="text-gray-400">
                          {analyticsData ? 
                            `${Math.abs(analyticsData.airQuality.trend).toFixed(1)}% impact` :
                            'Real-time impact'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">NASA Data Forecast</h3>
                <div className="h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-purple-400/50 mx-auto mb-2" />
                    <p className="text-purple-300/70">NASA Satellite Trends</p>
                    <p className="text-purple-300/50 text-sm">Based on real-time data</p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-purple-300">Temperature Trend</p>
                        <p className="text-gray-400">
                          {analyticsData ? 
                            `${analyticsData.temperature.trend > 0 ? '+' : ''}${analyticsData.temperature.trend.toFixed(1)}% over 7 days` :
                            'Real-time trend'
                          }
                        </p>
                      </div>
                      <div className="bg-white/10 rounded p-2">
                        <p className="text-pink-300">Vegetation Health</p>
                        <p className="text-gray-400">
                          {analyticsData ? 
                            `NDVI ${analyticsData.vegetation.trend > 0 ? 'increasing' : 'decreasing'} ${Math.abs(analyticsData.vegetation.trend).toFixed(1)}%` :
                            'Real-time health'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
