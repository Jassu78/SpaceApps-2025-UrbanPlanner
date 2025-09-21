import React from 'react'
import { motion } from 'framer-motion'

interface NASAChartProps {
  data: number[]
  title: string
  unit: string
  color: string
  height?: number
}

const NASAChart: React.FC<NASAChartProps> = ({ 
  data, 
  title, 
  unit, 
  color, 
  height = 200 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-white/10">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-gray-400 text-2xl">📊</span>
          </div>
          <p className="text-gray-300/70">No data available</p>
          <p className="text-gray-300/50 text-sm">NASA data visualization</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - minValue) / range) * 80 - 10 // 10% padding from top
    return { x, y, value }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className="h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            {data[data.length - 1]?.toFixed(1)}{unit}
          </p>
          <p className="text-sm text-gray-400">Current</p>
        </div>
      </div>
      
      <div className="relative h-48">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Data line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke={`var(--color-${color}-400)`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill={`var(--color-${color}-400)`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          ))}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
          <span>{maxValue.toFixed(1)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
          <span>{minValue.toFixed(1)}</span>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
          <span>7d ago</span>
          <span>3d ago</span>
          <span>Today</span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400">Min</p>
          <p className="text-sm font-semibold text-white">{minValue.toFixed(1)}{unit}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Max</p>
          <p className="text-sm font-semibold text-white">{maxValue.toFixed(1)}{unit}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Avg</p>
          <p className="text-sm font-semibold text-white">
            {(data.reduce((a, b) => a + b, 0) / data.length).toFixed(1)}{unit}
          </p>
        </div>
      </div>
    </div>
  )
}

export default NASAChart
