'use client'

import React from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface ClimateTrendsChartProps {
  weatherData: {
    temperature: number
    humidity: number | null
    precipitation: number
    timestamp: string
  } | null
  airQualityData: {
    aqi: number
    pollutants: {
      pm25: number
      pm10: number
      no2: number
    }
    timestamp: string
  } | null
}

export default function ClimateTrendsChart({ weatherData, airQualityData }: ClimateTrendsChartProps) {
  // Generate mock historical data for the last 7 days
  const generateHistoricalData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Generate realistic variations around current values
      const baseTemp = weatherData?.temperature || 23.3
      const baseAqi = airQualityData?.aqi || 45
      const baseHumidity = weatherData?.humidity || 65
      
      // Add some realistic daily variation
      const tempVariation = (Math.random() - 0.5) * 6 // ±3°C variation
      const aqiVariation = (Math.random() - 0.5) * 20 // ±10 AQI variation
      const humidityVariation = (Math.random() - 0.5) * 20 // ±10% variation
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
        aqi: Math.max(0, Math.round(baseAqi + aqiVariation)),
        humidity: Math.max(0, Math.min(100, Math.round(baseHumidity + humidityVariation))),
        precipitation: Math.round(Math.random() * 15 * 10) / 10, // 0-15mm
        pm25: Math.max(0, Math.round((airQualityData?.pollutants?.pm25 || 12) + (Math.random() - 0.5) * 8))
      })
    }
    
    return data
  }

  const chartData = generateHistoricalData()

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; unit?: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.unit || ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: '°C', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'AQI', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Temperature Area */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#tempGradient)"
            name="Temperature (°C)"
          />
          
          {/* AQI Line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="aqi"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Air Quality Index"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
