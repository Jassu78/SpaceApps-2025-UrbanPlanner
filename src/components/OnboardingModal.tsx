'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, MapPin, Thermometer, Wind, Leaf, Users, Zap } from 'lucide-react'
import SmartCitySearch from './SmartCitySearch'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: OnboardingData) => void
}

interface OnboardingData {
  focusArea: string
  location: string
  coordinates?: { lat: number; lng: number }
}

const focusAreas = [
  {
    id: 'climate',
    name: 'Climate Resilience',
    description: 'Analyze climate risks and adaptation strategies',
    icon: Thermometer,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  {
    id: 'air-quality',
    name: 'Air Quality',
    description: 'Monitor air pollution and health impacts',
    icon: Wind,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'urban-heat',
    name: 'Urban Heat Islands',
    description: 'Identify and mitigate heat island effects',
    icon: Zap,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  {
    id: 'green-infrastructure',
    name: 'Green Infrastructure',
    description: 'Plan and optimize green spaces',
    icon: Leaf,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  {
    id: 'population',
    name: 'Population & Demographics',
    description: 'Analyze population density and growth patterns',
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  }
]

export const OnboardingModal = ({ isOpen, onClose, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1)
  const [selectedFocus, setSelectedFocus] = useState<string>('')
  const [location, setLocation] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleFocusSelect = (focusId: string) => {
    setSelectedFocus(focusId)
  }

  const handleLocationSearch = async () => {
    if (!location.trim()) return
    
    setIsSearching(true)
    try {
      // Use OpenStreetMap Nominatim API for geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`)
      const data = await response.json()
      
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const coordinates = { lat: parseFloat(lat), lng: parseFloat(lon) }
        
        onComplete({
          focusArea: selectedFocus,
          location: display_name,
          coordinates
        })
      } else {
        alert('Location not found. Please try a different search term.')
      }
    } catch (error) {
      console.error('Error searching location:', error)
      alert('Error searching location. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSkip = () => {
    onComplete({
      focusArea: 'general',
      location: 'New York, NY, USA',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome to MoonLight</h2>
              <p className="text-gray-300">Let's set up your urban planning analysis</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    What's your main focus area?
                  </h3>
                  <p className="text-gray-300">
                    Choose the primary challenge you want to analyze
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {focusAreas.map((area) => {
                    const IconComponent = area.icon
                    return (
                      <motion.div
                        key={area.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                            selectedFocus === area.id
                              ? `${area.bgColor} ${area.borderColor} border-2 shadow-lg`
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                          onClick={() => handleFocusSelect(area.id)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className={`p-4 rounded-full ${area.bgColor} ${area.borderColor} border-2`}>
                                <IconComponent className={`w-8 h-8 ${area.color}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white text-lg mb-2">{area.name}</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">{area.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex justify-center gap-4 pt-6">
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 px-6 py-2 rounded-lg"
                  >
                    Skip Setup
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedFocus}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    Next: Location
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <SmartCitySearch
                  onCitySelect={(city) => {
                    onComplete({
                      focusArea: selectedFocus,
                      location: `${city.name}, ${city.region}, ${city.country}`,
                      coordinates: { lat: city.latitude, lng: city.longitude }
                    })
                  }}
                  onSkip={handleSkip}
                />

                <div className="flex justify-center pt-6">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 px-6 py-2 rounded-lg"
                  >
                    Back
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
