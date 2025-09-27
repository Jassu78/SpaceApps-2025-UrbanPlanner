interface CitySuggestion {
  name: string
  displayName: string
  country: string
  region: string
  latitude: number
  longitude: number
  population?: number
}

interface GeocodingResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    country_code?: string
  }
}

class CitySuggestionService {
  private baseURL = 'https://nominatim.openstreetmap.org/search'
  private cache = new Map<string, CitySuggestion[]>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  async getCitySuggestions(query: string, limit: number = 5): Promise<CitySuggestion[]> {
    if (!query || query.length < 2) {
      return []
    }

    // Check cache first
    const cacheKey = `${query.toLowerCase()}_${limit}`
    const cached = this.cache.get(cacheKey)
    if (cached && this.isCacheValid(cacheKey)) {
      console.log('📋 Using cached suggestions for:', query)
      return cached
    }

    try {
      console.log('🌍 Fetching city suggestions for:', query)
      
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: limit.toString(),
        featuretype: 'city,town,village',
        countrycodes: '', // Search globally
        dedupe: '1'
      })

      const response = await fetch(`${this.baseURL}?${params}`, {
        headers: {
          'User-Agent': 'MoonLight-UrbanPlanning/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const results: GeocodingResult[] = await response.json()
      
      const suggestions = results
        .filter(result => this.isValidCity(result))
        .map(result => this.formatCitySuggestion(result))
        .slice(0, limit)

      // Cache the results
      this.cache.set(cacheKey, suggestions)
      this.cache.set(`${cacheKey}_timestamp`, Date.now())

      console.log(`✅ Found ${suggestions.length} city suggestions for "${query}"`)
      return suggestions

    } catch (error) {
      console.error('❌ Error fetching city suggestions:', error)
      return []
    }
  }

  private isValidCity(result: GeocodingResult): boolean {
    // Filter for cities, towns, and villages with good importance scores
    const validTypes = ['city', 'town', 'village', 'hamlet']
    const hasValidType = validTypes.some(type => 
      result.type === type || result.display_name.toLowerCase().includes(type)
    )
    
    const hasGoodImportance = result.importance > 0.1
    const hasLocation = result.lat && result.lon
    
    return hasValidType && hasGoodImportance && hasLocation
  }

  private formatCitySuggestion(result: GeocodingResult): CitySuggestion {
    const address = result.address || {}
    const cityName = address.city || address.town || address.village || 
                     this.extractCityFromDisplayName(result.display_name)
    
    return {
      name: cityName,
      displayName: this.formatDisplayName(cityName, address),
      country: address.country || 'Unknown',
      region: address.state || 'Unknown',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      population: undefined // Nominatim doesn't provide population
    }
  }

  private extractCityFromDisplayName(displayName: string): string {
    // Extract city name from display name like "Mumbai, Maharashtra, India"
    const parts = displayName.split(',')
    return parts[0]?.trim() || displayName
  }

  private formatDisplayName(cityName: string, address: any): string {
    const parts = [cityName]
    if (address.state) parts.push(address.state)
    if (address.country) parts.push(address.country)
    return parts.join(', ')
  }

  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this.cache.get(`${cacheKey}_timestamp`)
    if (!timestamp) return false
    
    const age = Date.now() - timestamp
    return age < this.cacheTimeout
  }

  // Validate if a city name exists in our suggestions
  async validateCityName(cityName: string): Promise<CitySuggestion | null> {
    const suggestions = await this.getCitySuggestions(cityName, 10)
    
    if (suggestions.length === 0) {
      return null
    }
    
    // Look for exact match first
    const exactMatch = suggestions.find(suggestion => 
      suggestion.name.toLowerCase() === cityName.toLowerCase()
    )
    
    if (exactMatch) {
      return exactMatch
    }

    // Look for close match in name
    const closeMatch = suggestions.find(suggestion => 
      suggestion.name.toLowerCase().includes(cityName.toLowerCase()) ||
      cityName.toLowerCase().includes(suggestion.name.toLowerCase())
    )

    if (closeMatch) {
      return closeMatch
    }

    // Look for close match in display name
    const displayMatch = suggestions.find(suggestion => 
      suggestion.displayName.toLowerCase().includes(cityName.toLowerCase()) ||
      cityName.toLowerCase().includes(suggestion.displayName.toLowerCase())
    )

    // If no close match, return the first suggestion (most relevant)
    return displayMatch || suggestions[0] || null
  }

  // Get population data for a validated city
  async getCityPopulationData(city: CitySuggestion): Promise<{
    success: boolean
    data?: {
      population: number
      density: number
      country: string
      city: string
      region: string
      elevation?: number
      latitude: number
      longitude: number
    }
    error?: string
  }> {
    try {
      // Try to get population from GeoDB using city name first
      const geodbService = await import('./geodbPopulationService')
      const geodbNameResult = await geodbService.geodbPopulationService.getPopulationDataByCityName(city.name)
      
      if (geodbNameResult.success && geodbNameResult.data) {
        return geodbNameResult
      }

      // Try with coordinates as fallback
      const geodbResult = await geodbService.geodbPopulationService.getPopulationData(
        city.latitude, 
        city.longitude, 
        50 // 50km radius
      )
      
      if (geodbResult.success && geodbResult.data) {
        // Update the city name to match what GeoDB found
        return {
          success: true,
          data: {
            ...geodbResult.data,
            latitude: city.latitude,
            longitude: city.longitude
          }
        }
      }

      // Fallback: estimate population based on city size/type
      const estimatedPopulation = this.estimatePopulation(city)
      
      return {
        success: true,
        data: {
          population: estimatedPopulation,
          density: Math.round(estimatedPopulation / 100), // Rough estimate
          country: city.country,
          city: city.name,
          region: city.region,
          latitude: city.latitude,
          longitude: city.longitude
        }
      }

    } catch (error) {
      console.error('❌ Error getting population data:', error)
      return {
        success: false,
        error: 'Failed to get population data for this city'
      }
    }
  }

  private estimatePopulation(city: CitySuggestion): number {
    // Very rough population estimation based on city name patterns
    // This is a fallback when GeoDB doesn't have data
    
    const name = city.name.toLowerCase()
    const country = city.country.toLowerCase()
    
    // Major cities by country
    if (country.includes('india')) {
      if (name.includes('mumbai') || name.includes('delhi') || name.includes('bangalore')) {
        return 10000000
      }
      if (name.includes('hyderabad') || name.includes('chennai') || name.includes('kolkata')) {
        return 5000000
      }
      if (name.includes('pune') || name.includes('ahmedabad') || name.includes('jaipur')) {
        return 3000000
      }
    }
    
    if (country.includes('united states') || country.includes('usa')) {
      if (name.includes('new york') || name.includes('los angeles') || name.includes('chicago')) {
        return 8000000
      }
      if (name.includes('houston') || name.includes('phoenix') || name.includes('philadelphia')) {
        return 2000000
      }
    }
    
    // Default estimates based on city type
    if (name.includes('city') || name.includes('metropolitan')) {
      return 1000000
    }
    if (name.includes('town') || name.includes('borough')) {
      return 50000
    }
    
    // Default fallback
    return 100000
  }
}

export const citySuggestionService = new CitySuggestionService()
