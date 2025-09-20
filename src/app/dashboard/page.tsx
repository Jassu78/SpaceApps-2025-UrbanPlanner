'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Thermometer, 
  Wind, 
  Leaf, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Loader2
} from "lucide-react"
import { APIClient } from '@/lib/dataProcessing'
import ClimateTrendsChart from '@/components/ClimateTrendsChart'
import OpenStreetMapView from '@/components/OpenStreetMapView'
import Link from 'next/link'

interface DashboardData {
  airQuality: {
    aqi: number
    status: string
    healthImpact: string
    pollutants: {
      pm25: number
      pm10: number
      no2: number
      o3: number
      co: number
      so2: number
    }
    lastUpdated?: string
  } | null
  weather: {
    temperature: number
    humidity: number
    windSpeed: string
    precipitation: number
    forecast: string
    heatIndex: number
    lastUpdated?: string
  } | null
  population: {
    density: number
    growthRate: number | null
    yearRange: {
      start: number
      end: number
    }
  } | null
  satellite: {
    latestImage: Record<string, unknown>
    cloudCover: number
    platform: string
    availableBands: string[]
    hasError: boolean
    ndvi?: number
    health?: string
  } | null
  metrics: {
    urbanHeatIsland: Record<string, unknown>
    vegetationHealth: Record<string, unknown>
    airQualityScore: number
    populationDensity: number
    environmentalHealth: number
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const apiClient = useMemo(() => new APIClient(), [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiClient.fetchDashboardData()
      setDashboardData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [apiClient])

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchDashboardData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const getAirQualityStatus = (aqi: number) => {
    if (aqi <= 50) return { status: 'Good', color: 'green', icon: CheckCircle }
    if (aqi <= 100) return { status: 'Moderate', color: 'yellow', icon: AlertTriangle }
    if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: 'orange', icon: AlertTriangle }
    if (aqi <= 200) return { status: 'Unhealthy', color: 'red', icon: AlertTriangle }
    if (aqi <= 300) return { status: 'Very Unhealthy', color: 'purple', icon: AlertTriangle }
    return { status: 'Hazardous', color: 'maroon', icon: AlertTriangle }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Error loading dashboard data</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">No data available</p>
        </div>
      </div>
    )
  }

  const airQualityStatus = getAirQualityStatus(dashboardData.airQuality?.aqi || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Urban Planning Dashboard</h1>
            <p className="text-gray-300">
              Real-time environmental and demographic data for urban planning
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

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
                    {dashboardData.weather?.temperature ? 
                      `${dashboardData.weather.temperature.toFixed(1)}°C` : 
                      'N/A'
                    }
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {dashboardData.weather?.heatIndex ? 
                      `Heat Index: ${dashboardData.weather.heatIndex.toFixed(1)}°C` : 
                      'Land Surface Temperature'
                    }
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">
                      {dashboardData.weather?.forecast || 'Real-time data'}
                    </span>
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
                    airQualityStatus.color === 'orange' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                    airQualityStatus.color === 'red' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    airQualityStatus.color === 'purple' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    'bg-maroon-500/20 text-maroon-300 border-maroon-500/30'
                  }`}>
                    Air Quality
                  </Badge>
                </div>
                <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-white">
                          {dashboardData.airQuality?.aqi !== undefined ?
                            dashboardData.airQuality.aqi.toFixed(0) :
                            'N/A'
                          }
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
                  {dashboardData.airQuality?.pollutants && (
                    <div className="text-xs text-gray-400 mt-2">
                      PM2.5: {dashboardData.airQuality.pollutants.pm25} | 
                      PM10: {dashboardData.airQuality.pollutants.pm10} | 
                      NO₂: {dashboardData.airQuality.pollutants.no2}
                    </div>
                  )}
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
                          {dashboardData.satellite?.ndvi ?
                            `${(dashboardData.satellite.ndvi * 100).toFixed(1)}%` :
                            'N/A'
                          }
                        </h3>
                        <p className="text-gray-300 text-sm">
                          NDVI Index
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">
                            {dashboardData.satellite?.health || 'Satellite data'}
                          </span>
                        </div>
                  {dashboardData.satellite?.cloudCover && (
                    <div className="text-xs text-gray-400 mt-2">
                      Cloud Cover: {dashboardData.satellite.cloudCover.toFixed(1)}% | 
                      Platform: {dashboardData.satellite.platform}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Population Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Population
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">
                    {dashboardData.population?.density ? 
                      `${dashboardData.population.density.toLocaleString()}` : 
                      'N/A'
                    }
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Population Density
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400">
                      {dashboardData.population?.growthRate ? 
                        `Growth: ${dashboardData.population.growthRate.toFixed(1)}%` : 
                        'WorldPop Data'
                      }
                    </span>
                  </div>
                  {dashboardData.population?.yearRange && (
                    <div className="text-xs text-gray-400 mt-2">
                      Data Range: {dashboardData.population.yearRange.start}-{dashboardData.population.yearRange.end}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Urban Planning Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Environmental Health Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Environmental Health</h3>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {dashboardData.metrics?.environmentalHealth || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-300 mb-4">Overall Score (0-100)</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${dashboardData.metrics?.environmentalHealth || 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Urban Heat Island */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Thermometer className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Urban Heat Island</h3>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {(dashboardData.metrics?.urbanHeatIsland?.level as string) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-300 mb-4">
                    Intensity: {(dashboardData.metrics?.urbanHeatIsland?.intensity as number) || 'N/A'}°C
                  </div>
                  <div className="text-xs text-gray-400">
                    Based on land surface temperature analysis
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Air Quality Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wind className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Air Quality Score</h3>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {dashboardData.metrics?.airQualityScore || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-300 mb-4">Score (0-100)</div>
                  <div className="text-xs text-gray-400">
                    Based on AQI and pollutant levels
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
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Climate Trends</h3>
                </div>
                <div className="h-64 w-full">
                  <ClimateTrendsChart 
                    weatherData={dashboardData.weather ? {
                      temperature: dashboardData.weather.temperature,
                      humidity: dashboardData.weather.humidity,
                      precipitation: dashboardData.weather.precipitation,
                      timestamp: dashboardData.weather.lastUpdated || new Date().toISOString()
                    } : null}
                    airQualityData={dashboardData.airQuality ? {
                      aqi: dashboardData.airQuality.aqi,
                      pollutants: dashboardData.airQuality.pollutants,
                      timestamp: dashboardData.airQuality.lastUpdated || new Date().toISOString()
                    } : null}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Satellite View</h3>
                </div>
                <OpenStreetMapView
                  coordinates={[40.7128, -74.0060]} // NYC coordinates
                  zoom={13}
                  hasError={false} // OpenStreetMap should work independently of Landsat data
                  className="h-64 w-full rounded-lg"
                />
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
                       <Link href="/map" className="p-4 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors border border-blue-500/30 block">
                         <div className="text-center">
                           <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                           <p className="text-white font-medium">View Map</p>
                           <p className="text-blue-300/70 text-sm">Interactive satellite view</p>
                         </div>
                       </Link>
                       <Link href="/analytics" className="p-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors border border-green-500/30 block">
                         <div className="text-center">
                           <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                           <p className="text-white font-medium">Analytics</p>
                           <p className="text-green-300/70 text-sm">Detailed data analysis</p>
                         </div>
                       </Link>
                       <Link href="/chat" className="p-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors border border-purple-500/30 block">
                         <div className="text-center">
                           <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                           <p className="text-white font-medium">AI Chat</p>
                           <p className="text-purple-300/70 text-sm">Ask questions about data</p>
                         </div>
                       </Link>
                     </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
