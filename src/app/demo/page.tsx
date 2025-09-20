'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  BarChart3, 
  MessageSquare, 
  Play,
  ArrowRight,
  Globe,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DemoPage() {
  const router = useRouter()

  const demoFeatures = [
    {
      icon: MapPin,
      title: "Interactive Mapping",
      description: "Explore urban areas with real-time NASA satellite data",
      color: "blue",
      route: "/map"
    },
    {
      icon: BarChart3,
      title: "Data Visualization", 
      description: "Comprehensive analytics and climate insights",
      color: "green",
      route: "/analytics"
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Get instant answers about urban planning",
      color: "purple",
      route: "/chat"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Live climate data and predictive modeling",
      color: "orange",
      route: "/dashboard"
    }
  ]

  const handleFeatureClick = (route: string) => {
    router.push(route)
  }

  const handleLaunchApp = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
            <Play className="w-4 h-4 mr-2" />
            Interactive Demo
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Experience the Future of
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {" "}Urban Planning
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover how NASA&apos;s Earth observation data and AI technology can transform 
            urban planning with real-time insights and predictive analytics.
          </p>

          <Button 
            size="lg"
            onClick={handleLaunchApp}
            className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
          >
            Launch Full Application
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        {/* Demo Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {demoFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Card 
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                onClick={() => handleFeatureClick(feature.route)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${feature.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Demo Interface Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">
                See It In Action
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Map Interface */}
                <motion.div 
                  className="space-y-4 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => router.push('/map')}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-6 h-6 text-blue-400" />
                    <h4 className="text-xl font-semibold text-white">Interactive Map</h4>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-blue-400/50 mx-auto mb-2" />
                      <p className="text-blue-300/70">Click to explore the map</p>
                    </div>
                  </div>
                </motion.div>

                {/* Analytics Dashboard */}
                <motion.div 
                  className="space-y-4 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => router.push('/analytics')}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                    <h4 className="text-xl font-semibold text-white">Analytics Dashboard</h4>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-green-400/50 mx-auto mb-2" />
                      <p className="text-green-300/70">Click to view analytics</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
