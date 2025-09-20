'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MapPin, 
  Thermometer, 
  Wind, 
  Leaf,
  Droplets,
  BarChart3,
  RefreshCw,
  Trash2,
  Settings,
  Lightbulb
} from "lucide-react"

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  data?: any
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your NASA Climate AI assistant. I can help you analyze climate data, understand urban planning insights, and answer questions about environmental conditions. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        data: aiResponse.data
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('temperature') || lowerInput.includes('heat')) {
      return {
        content: "Based on the latest NASA MODIS data, the current land surface temperature in your area is 24.5°C. This is within normal ranges, but I notice some urban heat island effects in the downtown area. Would you like me to show you specific heat maps or suggest cooling strategies?",
        data: {
          type: 'temperature',
          value: 24.5,
          unit: '°C',
          trend: '+0.3°C from yesterday',
          status: 'normal'
        }
      }
    }
    
    if (lowerInput.includes('air quality') || lowerInput.includes('pollution')) {
      return {
        content: "The current Air Quality Index is 85, which indicates good air quality. However, I'm detecting elevated NO2 levels near major traffic corridors. This suggests vehicle emissions are the primary concern. I recommend implementing green infrastructure and promoting electric vehicles in these areas.",
        data: {
          type: 'air_quality',
          value: 85,
          unit: 'AQI',
          trend: 'Stable',
          status: 'good'
        }
      }
    }
    
    if (lowerInput.includes('vegetation') || lowerInput.includes('green')) {
      return {
        content: "The NDVI (Normalized Difference Vegetation Index) shows 72% vegetation health in your area. This is quite good! However, I notice some areas with low vegetation coverage that could benefit from urban greening initiatives. Would you like me to identify specific locations for tree planting or park development?",
        data: {
          type: 'vegetation',
          value: 72,
          unit: '%',
          trend: '+2% from last month',
          status: 'healthy'
        }
      }
    }
    
    if (lowerInput.includes('precipitation') || lowerInput.includes('rain')) {
      return {
        content: "Current precipitation levels are 12.3mm in the last 24 hours. This is moderate rainfall that should be manageable with proper drainage systems. However, I'm monitoring for potential flood risks in low-lying areas. Would you like me to analyze flood vulnerability or suggest water management strategies?",
        data: {
          type: 'precipitation',
          value: 12.3,
          unit: 'mm',
          trend: 'Increasing',
          status: 'moderate'
        }
      }
    }
    
    if (lowerInput.includes('recommendation') || lowerInput.includes('suggest')) {
      return {
        content: "Based on the climate data analysis, here are my top recommendations for improving urban resilience:\n\n1. **Green Infrastructure**: Implement green roofs and urban forests in heat island areas\n2. **Air Quality**: Promote electric vehicles and improve public transportation\n3. **Water Management**: Enhance drainage systems and create rain gardens\n4. **Community Engagement**: Develop citizen science programs for environmental monitoring\n\nWould you like me to elaborate on any of these recommendations?",
        data: {
          type: 'recommendations',
          items: [
            'Green Infrastructure',
            'Air Quality Improvement',
            'Water Management',
            'Community Engagement'
          ]
        }
      }
    }
    
    return {
      content: "I understand you're asking about climate data and urban planning. I can help you analyze temperature patterns, air quality, vegetation health, precipitation data, and provide recommendations for sustainable urban development. Could you be more specific about what aspect you'd like to explore?",
      data: null
    }
  }

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Hello! I'm your NASA Climate AI assistant. I can help you analyze climate data, understand urban planning insights, and answer questions about environmental conditions. What would you like to know?",
      timestamp: new Date()
    }])
  }

  const getDataIcon = (type: string) => {
    switch (type) {
      case 'temperature': return Thermometer
      case 'air_quality': return Wind
      case 'vegetation': return Leaf
      case 'precipitation': return Droplets
      default: return BarChart3
    }
  }

  const getDataColor = (type: string) => {
    switch (type) {
      case 'temperature': return 'text-orange-400'
      case 'air_quality': return 'text-blue-400'
      case 'vegetation': return 'text-green-400'
      case 'precipitation': return 'text-cyan-400'
      default: return 'text-purple-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="flex h-[calc(100vh-100px)]">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-3xl ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <Card className={`${
                      message.type === 'user' 
                        ? 'bg-blue-500/20 border-blue-500/30' 
                        : 'bg-white/10 border-white/20'
                    }`}>
                      <CardContent className="p-4">
                        <p className="text-white whitespace-pre-wrap">{message.content}</p>
                        {message.data && (
                          <div className="mt-3 p-3 bg-black/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              {React.createElement(getDataIcon(message.data.type), {
                                className: `w-4 h-4 ${getDataColor(message.data.type)}`
                              })}
                              <span className="text-white font-medium capitalize">
                                {message.data.type.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                              {message.data.value} {message.data.unit}
                            </div>
                            <div className="text-sm text-gray-300">
                              {message.data.trend}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-gray-300 text-sm">AI is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me about climate data, urban planning, or environmental conditions..."
                  className="w-full p-4 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/15 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Quick Questions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Quick Questions
              </h3>
              <div className="space-y-2">
                {[
                  "What's the current temperature?",
                  "How's the air quality today?",
                  "Show me vegetation health",
                  "Any precipitation expected?",
                  "Give me recommendations"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(question)}
                    className="w-full p-3 text-left rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <span className="text-gray-300 text-sm">{question}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-medium">NASA Earthdata</p>
                    <p className="text-gray-400 text-xs">Satellite imagery</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white text-sm font-medium">MODIS</p>
                    <p className="text-gray-400 text-xs">Temperature data</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <Wind className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Aura OMI</p>
                    <p className="text-gray-400 text-xs">Air quality</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <Leaf className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Landsat</p>
                    <p className="text-gray-400 text-xs">Vegetation data</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Stats */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Chat Stats</h3>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Messages</span>
                      <span className="text-white font-medium">{messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Session Time</span>
                      <span className="text-white font-medium">5:32</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Data Queries</span>
                      <span className="text-white font-medium">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
