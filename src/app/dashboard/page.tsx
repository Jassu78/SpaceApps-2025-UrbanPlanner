'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Loader2,
  Play,
  ArrowRight,
  Zap
} from "lucide-react"
import { APIClient } from '@/lib/dataProcessing'
import ClimateTrendsChart from '@/components/ClimateTrendsChart'
import OpenStreetMapView from '@/components/OpenStreetMapView'
import { OnboardingModal } from '@/components/OnboardingModal'
import Link from 'next/link'

interface DashboardData {
  airQuality: {
    aqi: number | null
    status: string
    healthImpact: string
    pollutants: {
      pm25: number
      pm10: number
      no2: number
      o3: number
      co: number
      so2: number
    } | null
    lastUpdated?: string | null
    source?: string
  } | null
  weather: {
    temperature: number | null
    humidity: number | null
    windSpeed: string | null
    precipitation: number | null
    pressure?: number | null
    forecast: string
    heatIndex: number | null
    lastUpdated?: string | null
    source?: string
  } | null
  population: {
    density: number | null
    growthRate: number | null
    yearRange: {
      start: number
      end: number
    } | null
    dataSource?: string
    lastUpdated?: string | null
    city?: string | null
    country?: string | null
    region?: string | null
    elevation?: number | null
  } | null
  satellite: {
    latestImage: Record<string, unknown> | null
    cloudCover: number | null
    platform: string
    availableBands: string[]
    hasError: boolean
    ndvi?: number | null
    health?: string
  } | null
  metrics: {
    urbanHeatIsland: Record<string, unknown> | null
    vegetationHealth: Record<string, unknown> | null
    airQualityScore: number | null
    populationDensity: number | null
    environmentalHealth: number | null
  }
}

interface OnboardingData {
  focusArea: string
  location: string
  coordinates?: { lat: number; lng: number }
}

export default function DashboardPage() {
  console.log('🚀 DashboardPage component rendering...')
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    temperature: null,
    airQuality: null,
    population: null,
    vegetation: null,
    weather: null,
    landsat: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  // Test useEffect - this should run immediately
  useEffect(() => {
    console.log('🚀 TEST useEffect running immediately!')
    console.log('🔍 Checking localStorage immediately:')
    console.log('moonlight-visited:', localStorage.getItem('moonlight-visited'))
    console.log('moonlight-onboarding:', localStorage.getItem('moonlight-onboarding'))
  }, [])

  const apiClient = useMemo(() => new APIClient(), [])

  // Debug dashboard data changes
  useEffect(() => {
    console.log('📊 Dashboard data updated:', dashboardData)
  }, [dashboardData])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use onboarding data if available, otherwise use default
      let location = 'here'
      let coords = '40.7128,-74.0060'
      let country = 'USA'
      
      if (onboardingData?.coordinates) {
        location = onboardingData.location
        coords = `${onboardingData.coordinates.lat},${onboardingData.coordinates.lng}`
        // Determine country from coordinates (simplified)
        if (onboardingData.coordinates.lat >= 6.0 && onboardingData.coordinates.lat <= 37.0 && 
            onboardingData.coordinates.lng >= 68.0 && onboardingData.coordinates.lng <= 97.0) {
          country = 'India'
        } else if (onboardingData.coordinates.lat >= 24.0 && onboardingData.coordinates.lat <= 49.0 && 
                   onboardingData.coordinates.lng >= -125.0 && onboardingData.coordinates.lng <= -66.0) {
          country = 'USA'
        }
      }
      
      const data = await apiClient.fetchDashboardData(location, coords, country)
      
      // If we have onboarding data with coordinates, try to get population data directly
      if (onboardingData?.coordinates) {
        try {
          const response = await fetch('/api/validate-city', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cityName: onboardingData.location.split(',')[0],
              latitude: onboardingData.coordinates.lat,
              longitude: onboardingData.coordinates.lng
            })
          })
          
          const result = await response.json()
          
          if (result.success && result.data) {
            console.log('✅ Direct population data fetch successful:', result.data)
            setDashboardData(prev => ({
              ...prev,
              ...data,
              population: {
                density: result.data.density,
                growthRate: null,
                yearRange: { start: 2020, end: 2024 },
                city: result.data.city,
                country: result.data.country,
                region: result.data.region,
                elevation: result.data.elevation
              }
            }))
            setLastUpdated(new Date())
            return
          }
        } catch (error) {
          console.error('Error fetching direct population data:', error)
        }
      }
      
      // Fallback to regular data
      setDashboardData(prev => {
        console.log('🔄 Dashboard data update:', {
          hasPrev: !!prev,
          hasPrevPopulation: !!(prev && prev.population?.density),
          newPopulation: data.population,
          prevPopulation: prev?.population
        })
        
        return {
          ...data,
          population: (prev && prev.population?.density) ? prev.population : data.population
        }
      })
      
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [apiClient, onboardingData])

  const loadValidatedCityData = async (data: OnboardingData) => {
    try {
      console.log('🏙️ Loading validated city data for:', data.location)
      const response = await fetch('/api/validate-city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityName: data.location.split(',')[0],
          latitude: data.coordinates!.lat,
          longitude: data.coordinates!.lng
        })
      })
      
      const result = await response.json()
      console.log('🏙️ City validation result:', result)
      
      if (result.success && result.data) {
        console.log('✅ Setting validated city data:', result.data)
        setDashboardData(prev => {
          const newData = {
            ...prev,
            population: {
              density: result.data.density,
              growthRate: null,
              yearRange: { start: 2020, end: 2024 },
              city: result.data.city,
              country: result.data.country,
              region: result.data.region,
              elevation: result.data.elevation
            }
          }
          console.log('📊 Updated dashboard data with population:', newData.population)
          return newData
        })
      } else {
        console.log('❌ City validation failed:', result.error)
      }
    } catch (error) {
      console.error('Error loading validated city data:', error)
    }
  }

  // Check if this is first visit and load onboarding data
  useEffect(() => {
    console.log('🚀 Dashboard useEffect running...')
    console.log('🚀 Component mounted, checking localStorage...')
    
    const hasVisited = localStorage.getItem('moonlight-visited')
    const savedOnboarding = localStorage.getItem('moonlight-onboarding')
    
    console.log('🔍 Dashboard useEffect - hasVisited:', hasVisited, 'savedOnboarding:', !!savedOnboarding)
    console.log('🔍 Raw savedOnboarding data:', savedOnboarding)
    
    if (savedOnboarding) {
      try {
        const data = JSON.parse(savedOnboarding)
        console.log('📋 Loaded onboarding data:', data)
        setOnboardingData(data)
        
        // Load validated city data if available
        if (data.coordinates) {
          console.log('🌍 Loading validated city data for coordinates:', data.coordinates)
          loadValidatedCityData(data)
        } else {
          console.log('❌ No coordinates in onboarding data')
        }
      } catch (error) {
        console.error('Error parsing saved onboarding data:', error)
      }
    } else {
      console.log('❌ No saved onboarding data found')
    }
    
    if (!hasVisited) {
      setIsFirstVisit(true)
      setShowOnboarding(true)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchDashboardData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const handleOnboardingComplete = async (data: OnboardingData) => {
    console.log('🎯 Onboarding complete with data:', data)
    setOnboardingData(data)
    setShowOnboarding(false)
    localStorage.setItem('moonlight-visited', 'true')
    localStorage.setItem('moonlight-onboarding', JSON.stringify(data))
    
    // Refresh dashboard data with new location
    fetchDashboardData()
  }

  // Function to handle city selection directly
  const handleCitySelect = async (cityData: any) => {
    console.log('🏙️ City selected:', cityData)
    const onboardingData = {
      focusArea: 'urban-planning',
      location: `${cityData.city}, ${cityData.region}, ${cityData.country}`,
      coordinates: {
        lat: cityData.latitude,
        lng: cityData.longitude
      }
    }
    
    setOnboardingData(onboardingData)
    localStorage.setItem('moonlight-visited', 'true')
    localStorage.setItem('moonlight-onboarding', JSON.stringify(onboardingData))
    
    // Update dashboard data directly with population data
    setDashboardData(prev => ({
      ...prev,
      population: {
        density: cityData.density,
        growthRate: null,
        yearRange: { start: 2020, end: 2024 },
        city: cityData.city,
        country: cityData.country,
        region: cityData.region,
        elevation: cityData.elevation
      }
    }))
    
    // Refresh other data
    fetchDashboardData()
  }

  const handleStartAnalysis = () => {
    setShowOnboarding(true)
  }

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

  const airQualityStatus = dashboardData.airQuality?.aqi ? getAirQualityStatus(dashboardData.airQuality.aqi) : { status: 'No Data', color: 'gray', icon: AlertTriangle }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Simplified Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {onboardingData ? `Analysis: ${onboardingData.location}` : 'Urban Planning Dashboard'}
            </h1>
            <p className="text-gray-300">
              {onboardingData 
                ? `Focus: ${onboardingData.focusArea.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                : 'Real-time environmental and demographic data for urban planning'
              }
            </p>
            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => {
                  console.log('🔍 Manual localStorage check:')
                  console.log('moonlight-visited:', localStorage.getItem('moonlight-visited'))
                  console.log('moonlight-onboarding:', localStorage.getItem('moonlight-onboarding'))
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Check localStorage
              </button>
              <button 
                onClick={() => {
                  console.log('🏙️ Setting Visakhapatnam data directly...')
                  const cityData = {
                    population: 2035922,
                    density: 20359,
                    country: 'India',
                    city: 'Visakhapatnam',
                    region: 'Andhra Pradesh',
                    elevation: 45,
                    latitude: 17.733333333,
                    longitude: 83.316666666
                  }
                  handleCitySelect(cityData)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm"
              >
                Set Visakhapatnam
              </button>
            </div>
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

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
                <Button
                  onClick={handleStartAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start New Analysis
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/map" className="group">
                  <Card className="bg-white/5 hover:bg-white/10 transition-all duration-200 border-white/10 group-hover:border-blue-500/30">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="text-white font-medium mb-1">Explore Map</h3>
                      <p className="text-gray-400 text-sm">Interactive satellite view</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/analytics" className="group">
                  <Card className="bg-white/5 hover:bg-white/10 transition-all duration-200 border-white/10 group-hover:border-green-500/30">
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="text-white font-medium mb-1">Analyze Data</h3>
                      <p className="text-gray-400 text-sm">Detailed data analysis</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/chat" className="group">
                  <Card className="bg-white/5 hover:bg-white/10 transition-all duration-200 border-white/10 group-hover:border-purple-500/30">
                    <CardContent className="p-4 text-center">
                      <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="text-white font-medium mb-1">AI Assistant</h3>
                      <p className="text-gray-400 text-sm">Ask questions about data</p>
                    </CardContent>
                  </Card>
                </Link>
                <div className="group">
                  <Card className="bg-white/5 hover:bg-white/10 transition-all duration-200 border-white/10 group-hover:border-orange-500/30">
                    <CardContent className="p-4 text-center">
                      <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="text-white font-medium mb-1">Smart Insights</h3>
                      <p className="text-gray-400 text-sm">AI-powered recommendations</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
                {dashboardData.weather?.temperature ? (
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white">
                      {dashboardData.weather.temperature.toFixed(1)}°C
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {dashboardData.weather.heatIndex ? 
                        `Heat Index: ${dashboardData.weather.heatIndex.toFixed(1)}°C` : 
                        'Land Surface Temperature'
                      }
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">
                        {dashboardData.weather.forecast || 'Real-time data'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Source: {dashboardData.weather.source}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Thermometer className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Weather data unavailable</p>
                    <p className="text-gray-500 text-xs mt-1">Please try again later</p>
                  </div>
                )}
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
                    dashboardData.airQuality?.aqi ? (
                      airQualityStatus.color === 'green' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      airQualityStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      airQualityStatus.color === 'orange' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                      airQualityStatus.color === 'red' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      airQualityStatus.color === 'purple' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      'bg-maroon-500/20 text-maroon-300 border-maroon-500/30'
                    ) : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }`}>
                    {airQualityStatus.status}
                  </Badge>
                </div>
                {dashboardData.airQuality?.aqi ? (
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white">
                      {dashboardData.airQuality.aqi.toFixed(0)}
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
                    {dashboardData.airQuality.pollutants && (
                      <div className="text-xs text-gray-400 mt-2">
                        PM2.5: {dashboardData.airQuality.pollutants.pm25} | 
                        PM10: {dashboardData.airQuality.pollutants.pm10} | 
                        NO₂: {dashboardData.airQuality.pollutants.no2}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Source: {dashboardData.airQuality.source}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Wind className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Air quality data unavailable</p>
                    <p className="text-gray-500 text-xs mt-1">Please try again later</p>
                  </div>
                )}
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
                {dashboardData.population?.density ? (
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white">
                      {dashboardData.population.density.toLocaleString()}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Population Density
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400">
                        {dashboardData.population.growthRate ? 
                          `Growth: ${dashboardData.population.growthRate.toFixed(1)}%` : 
                          'WorldPop Data'
                        }
                      </span>
                    </div>
                    {dashboardData.population.yearRange && (
                      <div className="text-xs text-gray-400 mt-2">
                        Data Range: {dashboardData.population.yearRange.start}-{dashboardData.population.yearRange.end}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      <div>Source: {dashboardData.population.dataSource}</div>
                      {dashboardData.population.city && (
                        <div>City: {dashboardData.population.city}, {dashboardData.population.region}</div>
                      )}
                      {dashboardData.population.elevation && (
                        <div>Elevation: {dashboardData.population.elevation}m</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Population data unavailable</p>
                    <p className="text-gray-500 text-xs mt-1">Please try again later</p>
                  </div>
                )}
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
                {dashboardData.metrics?.urbanHeatIsland ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {(dashboardData.metrics.urbanHeatIsland.intensity as number).toFixed(1)}°C
                    </div>
                    <div className="text-sm text-gray-300 mb-4">
                      Level: {(dashboardData.metrics.urbanHeatIsland.level as string)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Based on land surface temperature analysis
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Urban heat island data unavailable</p>
                    <p className="text-gray-500 text-xs mt-1">Requires weather and satellite data</p>
                  </div>
                )}
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
                {dashboardData.metrics?.airQualityScore ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {dashboardData.metrics.airQualityScore}
                    </div>
                    <div className="text-sm text-gray-300 mb-4">Score (0-100)</div>
                    <div className="text-xs text-gray-400">
                      Based on AQI and pollutant levels
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Wind className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Air quality score unavailable</p>
                    <p className="text-gray-500 text-xs mt-1">Requires air quality data</p>
                  </div>
                )}
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

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  )
}
