'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Users, AlertCircle, CheckCircle } from 'lucide-react'

interface CitySuggestion {
  name: string
  population: number
  country: string
  region: string
  latitude: number
  longitude: number
}

interface SmartCitySearchProps {
  onCitySelect: (city: {
    name: string
    population: number
    country: string
    region: string
    latitude: number
    longitude: number
  }) => void
  onSkip: () => void
}

export default function SmartCitySearch({ onCitySelect, onSkip }: SmartCitySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (searchTerm.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      await searchCities(searchTerm)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm])

  const searchCities = async (query: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/city-suggestions?q=${encodeURIComponent(query)}&limit=5`)
      const result = await response.json()
      
      if (result.success && result.suggestions && result.suggestions.length > 0) {
        // Show suggestions
        setSuggestions(result.suggestions)
        setShowSuggestions(true)
        setError('') // Clear error when we have suggestions
      } else {
        setError('No cities found. Please try a different search term.')
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search for cities')
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = async (suggestion: CitySuggestion) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Validate the city and get population data
      const response = await fetch('/api/validate-city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityName: suggestion.name,
          latitude: suggestion.latitude,
          longitude: suggestion.longitude
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // City validated and population data retrieved
        onCitySelect(result.data)
        setSearchTerm('')
        setSuggestions([])
        setShowSuggestions(false)
      } else {
        setError(result.error || 'Failed to validate city')
      }
    } catch (error) {
      console.error('City validation error:', error)
      setError('Failed to validate city selection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const formatPopulation = (population: number) => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(0)}K`
    }
    return population.toString()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Where are you planning?</h2>
        <p className="text-gray-300">
          Search for your city to get real population data and insights
        </p>
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            placeholder="Start typing a city name (e.g., Mumbai, New York, London)..."
            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && !showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
        
        {/* Info Message when suggestions are available */}
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-blue-400 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Found {suggestions.length} matching cities. Click to select:
          </motion.div>
        )}

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={`${suggestion.name}-${suggestion.country}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-white/20' : ''
                  } ${index === 0 ? 'rounded-t-xl' : ''} ${
                    index === suggestions.length - 1 ? 'rounded-b-xl' : 'border-b border-white/10'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {suggestion.region}, {suggestion.country}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">
                      {suggestion.latitude.toFixed(2)}, {suggestion.longitude.toFixed(2)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip Button */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
