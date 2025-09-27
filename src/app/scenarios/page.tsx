'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  BarChart3, 
  MapPin, 
  Zap, 
  TrendingUp,
  Settings,
  Download,
  Share2
} from "lucide-react"

export default function ScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)

  const scenarios = [
    {
      id: 'green-infrastructure',
      name: 'Green Infrastructure Expansion',
      description: 'Model the impact of adding parks, green roofs, and urban forests',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'transit-development',
      name: 'Transit-Oriented Development',
      description: 'Analyze the effects of new public transportation routes',
      icon: MapPin,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'heat-mitigation',
      name: 'Urban Heat Island Mitigation',
      description: 'Test strategies to reduce urban heat island effects',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30'
    },
    {
      id: 'air-quality',
      name: 'Air Quality Improvement',
      description: 'Model the impact of air quality improvement measures',
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Scenario Planning</h1>
          <p className="text-gray-300">
            Model different urban development scenarios and analyze their impacts
          </p>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Run All Scenarios
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {scenarios.map((scenario, index) => {
            const IconComponent = scenario.icon
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedScenario === scenario.id
                      ? `${scenario.bgColor} ${scenario.borderColor} border-2`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className={`w-6 h-6 ${scenario.color}`} />
                      <h3 className="font-semibold text-white">{scenario.name}</h3>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">{scenario.description}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Results Section */}
        {selectedScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Scenario Results: {scenarios.find(s => s.id === selectedScenario)?.name}
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">+15%</div>
                    <div className="text-sm text-gray-300">Air Quality Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">-3°C</div>
                    <div className="text-sm text-gray-300">Temperature Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">+25%</div>
                    <div className="text-sm text-gray-300">Green Space Coverage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Scenario Modeling</h3>
              <p className="text-gray-300 mb-4">
                Coming soon: AI-powered scenario generation, cost-benefit analysis, and stakeholder impact modeling
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Notified
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
