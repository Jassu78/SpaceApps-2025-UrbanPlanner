'use client'

import React, { useState } from 'react'
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
  Droplets
} from "lucide-react"

interface AnalyticsData {
  temperature: {
    current: number
    average: number
    trend: number
    history: number[]
  }
  airQuality: {
    current: number
    average: number
    trend: number
    history: number[]
  }
  vegetation: {
    current: number
    average: number
    trend: number
    history: number[]
  }
  precipitation: {
    current: number
    average: number
    trend: number
    history: number[]
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    temperature: {
      current: 24.5,
      average: 23.8,
      trend: 2.9,
      history: [22.1, 23.4, 24.2, 24.5, 24.8, 24.3, 24.5]
    },
    airQuality: {
      current: 85,
      average: 82,
      trend: -3.2,
      history: [88, 85, 83, 85, 87, 84, 85]
    },
    vegetation: {
      current: 0.72,
      average: 0.68,
      trend: 5.9,
      history: [0.65, 0.67, 0.69, 0.71, 0.72, 0.70, 0.72]
    },
    precipitation: {
      current: 12.3,
      average: 15.2,
      trend: -19.1,
      history: [18.5, 16.2, 14.8, 12.3, 10.1, 11.5, 12.3]
    }
  })

  const [selectedMetric, setSelectedMetric] = useState<string>('temperature')
  const [timeRange, setTimeRange] = useState<string>('7d')
  // const [isLoading, setIsLoading] = useState(false)

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
    { key: 'vegetation', name: 'Vegetation', unit: '%', icon: Leaf, color: 'green' },
    { key: 'precipitation', name: 'Precipitation', unit: 'mm', icon: Droplets, color: 'cyan' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const data = analyticsData[metric.key as keyof AnalyticsData]
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
                        {metric.key === 'vegetation' ? (data.current * 100).toFixed(1) : data.current.toFixed(1)}
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
                  <div className="h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-indigo-400/50 mx-auto mb-2" />
                      <p className="text-indigo-300/70">Interactive trend chart</p>
                      <p className="text-indigo-300/50 text-sm">NASA data visualization</p>
                    </div>
                  </div>
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
                    Key Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Temperature Stable</p>
                        <p className="text-gray-300 text-xs">Within normal seasonal ranges</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Air Quality Alert</p>
                        <p className="text-gray-300 text-xs">Monitor traffic corridors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">Vegetation Healthy</p>
                        <p className="text-gray-300 text-xs">Good green space coverage</p>
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
                  <h3 className="text-lg font-semibold text-white mb-4">Data Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Data Points</span>
                      <span className="text-white font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Update Frequency</span>
                      <span className="text-white font-medium">Every 15 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Data Sources</span>
                      <span className="text-white font-medium">6 NASA APIs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Last Updated</span>
                      <span className="text-white font-medium">2 min ago</span>
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
                <h3 className="text-lg font-semibold text-white mb-4">Correlation Analysis</h3>
                <div className="h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-green-400/50 mx-auto mb-2" />
                    <p className="text-green-300/70">Correlation matrix</p>
                    <p className="text-green-300/50 text-sm">Climate variables relationship</p>
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
                <h3 className="text-lg font-semibold text-white mb-4">Predictive Analysis</h3>
                <div className="h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-purple-400/50 mx-auto mb-2" />
                    <p className="text-purple-300/70">Forecast models</p>
                    <p className="text-purple-300/50 text-sm">AI-powered predictions</p>
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
