// GeoDB Cities API service for real population data
// Documentation: http://geodb-cities-api.wirefreethought.com/docs/api

interface GeoDBPlace {
  id: string
  name: string
  population: number
  latitude: number
  longitude: number
  country: {
    name: string
    code: string
  }
  region: {
    name: string
    code: string
  }
  elevationMeters?: number
}

interface GeoDBResponse {
  data: {
    places: {
      totalCount: number
      edges: Array<{
        node: GeoDBPlace
      }>
    }
  }
}

class GeoDBPopulationService {
  private baseURL = 'http://geodb-free-service.wirefreethought.com/graphql'
  
  async getPopulationDataByCityName(cityName: string): Promise<{
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
    suggestions?: Array<{
      name: string
      population: number
      country: string
      region: string
      latitude: number
      longitude: number
    }>
    error?: string
  }> {
    try {
      console.log('🌍 Searching for city:', cityName)
      
      // Clean and normalize city name
      const cleanCityName = this.normalizeCityName(cityName)
      console.log('🧹 Cleaned city name:', cleanCityName)
      
      // Try multiple search strategies
      const searchTerms = [
        cityName.trim(), // Original name first
        cleanCityName,
        // Extract main city name from "City of X" format
        cityName.replace(/^(city of|town of|village of)\s+/i, '').trim(),
        // Extract main city name from "X City" format
        cityName.replace(/\s+(city|town|village)$/i, '').trim(),
        cleanCityName.split(' ')[0], // First word only
        cleanCityName.replace(/\s+/g, '') // No spaces
      ].filter((term, index, arr) => arr.indexOf(term) === index && term.length >= 2) // Remove duplicates and short terms
      
      console.log('🔍 Search terms to try:', searchTerms)
      
      let places: GeoDBPlace[] = []
      let searchTermUsed = ''
      
      // Try each search term until we get results
      for (const searchTerm of searchTerms) {
        if (searchTerm.length < 2) continue
        
        const query = `
          query SearchCity($cityName: String!) {
            populatedPlaces(namePrefix: $cityName, minPopulation: 40000, first: 10) {
              totalCount
              edges {
                node {
                  id
                  name
                  population
                  latitude
                  longitude
                  country {
                    name
                    code
                  }
                  region {
                    name
                  }
                  elevationMeters
                }
              }
            }
          }
        `
        
        const response = await fetch(this.baseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: {
              cityName: searchTerm
            }
          })
        })
        
        if (!response.ok) {
          console.log(`❌ Search failed for term: ${searchTerm}`)
          continue
        }
        
        const result = await response.json()
        
        if (result.data?.populatedPlaces?.edges?.length > 0) {
          places = result.data.populatedPlaces.edges.map(edge => edge.node)
          searchTermUsed = searchTerm
          console.log(`✅ Found ${places.length} results for search term: ${searchTerm}`)
          break
        }
      }
      
      if (places.length === 0) {
        return {
          success: false,
          error: `No cities found matching "${cityName}". Try a different spelling or check if the city has more than 40,000 people.`
        }
      }
      
      // Find exact match first
      const exactMatch = places.find(place => 
        place.name.toLowerCase() === cleanCityName.toLowerCase()
      )
      
      if (exactMatch) {
        console.log('✅ Exact match found:', exactMatch.name)
        return {
          success: true,
          data: this.formatCityData(exactMatch)
        }
      }

      // Find partial match with higher priority for major cities
      const partialMatch = places.find(place => {
        const placeName = place.name.toLowerCase()
        const searchName = cleanCityName.toLowerCase()
        
        // Check if the search term is contained in the place name
        if (placeName.includes(searchName)) {
          // Prioritize major cities (higher population)
          return place.population > 1000000
        }
        return false
      })
      
      if (partialMatch) {
        console.log('✅ Major city partial match found:', partialMatch.name)
        return {
          success: true,
          data: this.formatCityData(partialMatch)
        }
      }
      
      // Find best fuzzy match with lower threshold
      const bestMatch = this.findBestFuzzyMatch(cleanCityName, places)
      
      if (bestMatch) {
        console.log('✅ Best match found:', bestMatch.name)
        return {
          success: true,
          data: this.formatCityData(bestMatch),
          suggestions: places.slice(0, 5).map(place => ({
            name: place.name,
            population: place.population,
            country: place.country.name,
            region: place.region.name,
            latitude: place.latitude,
            longitude: place.longitude
          }))
        }
      }
      
      // Always return suggestions for any search results
      console.log(`📋 Showing ${places.length} suggestions for "${cityName}"`)
      return {
        success: false,
        error: `No exact match found for "${cityName}". Please select from the matching cities below:`,
        suggestions: places.slice(0, 5).map(place => ({
          name: place.name,
          population: place.population,
          country: place.country.name,
          region: place.region.name,
          latitude: place.latitude,
          longitude: place.longitude
        }))
      }
      
    } catch (error) {
      console.error('❌ Error searching for city:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getPopulationData(lat: number, lng: number, radius: number = 50): Promise<{
    success: boolean
    data?: {
      population: number
      density: number
      country: string
      city: string
      region: string
      elevation?: number
    }
    error?: string
  }> {
    try {
      console.log('🌍 Fetching real population data from GeoDB for:', { lat, lng, radius })
      
      // Free version doesn't support 'near' parameter, so we'll search by country first
      // Get country code from coordinates (simplified approach)
      const countryCode = this.getCountryCodeFromCoordinates(lat, lng)
      console.log('🌍 Detected country code for coordinates:', { lat, lng, countryCode })
      
      const query = `
        query GetPlacesInCountry($countryCode: String!) {
          country(id: $countryCode) {
            name
            populatedPlaces(first: 10, minPopulation: 40000) {
              totalCount
              edges {
                node {
                  id
                  name
                  population
                  latitude
                  longitude
                  country {
                    name
                    code
                  }
                  region {
                    name
                    code
                  }
                  elevationMeters
                }
              }
            }
          }
        }
      `
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            countryCode
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`GeoDB API error: ${response.status}`)
      }
      
      const result = await response.json()
      
      console.log('🌍 GeoDB API response for country:', countryCode, {
        hasCountry: !!result.data?.country,
        hasPlaces: !!result.data?.country?.populatedPlaces?.edges?.length,
        placesCount: result.data?.country?.populatedPlaces?.edges?.length || 0
      })
      
      if (!result.data?.country?.populatedPlaces?.edges?.length) {
        console.log('❌ No population data found for country:', countryCode)
        return {
          success: false,
          error: 'No population data found for this location'
        }
      }
      
      // Find the closest place with population data
      const places = result.data.country.populatedPlaces.edges.map(edge => edge.node)
      const placesWithPopulation = places.filter(place => place.population > 0)
      
      if (placesWithPopulation.length === 0) {
        return {
          success: false,
          error: 'No places with population data found'
        }
      }
      
      // Calculate distance to find closest place
      const closestPlace = this.findClosestPlace(lat, lng, placesWithPopulation)
      
      // Calculate population density (rough estimate based on area)
      const areaKm2 = Math.PI * Math.pow(radius / 111, 2) // Convert radius to km and calculate area
      const density = Math.round(closestPlace.population / areaKm2)
      
      console.log('✅ Real population data retrieved:', {
        city: closestPlace.name,
        population: closestPlace.population,
        density,
        country: closestPlace.country.name
      })
      
      return {
        success: true,
        data: {
          population: closestPlace.population,
          density: Math.max(1, density), // Ensure minimum density of 1
          country: closestPlace.country.name,
          city: closestPlace.name,
          region: closestPlace.region.name,
          elevation: closestPlace.elevationMeters
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching GeoDB population data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  private findClosestPlace(lat: number, lng: number, places: GeoDBPlace[]): GeoDBPlace {
    let closestPlace = places[0]
    let minDistance = this.calculateDistance(lat, lng, closestPlace.latitude, closestPlace.longitude)
    
    for (const place of places) {
      const distance = this.calculateDistance(lat, lng, place.latitude, place.longitude)
      if (distance < minDistance) {
        minDistance = distance
        closestPlace = place
      }
    }
    
    return closestPlace
  }
  
  private normalizeCityName(cityName: string): string {
    return cityName
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/\b(district|city|town|municipality)\b/g, '') // Remove common suffixes
      .replace(/^(city of|town of|village of)\s+/i, '') // Remove "City of" prefix
      .replace(/\s+(city|town|village)$/i, '') // Remove "City" suffix
      .trim()
  }
  
  private findBestFuzzyMatch(searchTerm: string, places: GeoDBPlace[]): GeoDBPlace | null {
    const searchLower = searchTerm.toLowerCase()
    
    // Calculate similarity score for each place
    const scoredPlaces = places.map(place => ({
      place,
      score: this.calculateSimilarity(searchLower, place.name.toLowerCase())
    }))
    
    // Sort by score (highest first)
    scoredPlaces.sort((a, b) => b.score - a.score)
    
    // Return the best match if score is above threshold (lowered for better matching)
    const bestMatch = scoredPlaces[0]
    return bestMatch && bestMatch.score > 0.2 ? bestMatch.place : null
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    // Levenshtein distance based similarity
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }
  
  private formatCityData(place: GeoDBPlace): {
    population: number
    density: number
    country: string
    city: string
    region: string
    elevation?: number
    latitude: number
    longitude: number
  } {
    // Calculate population density (rough estimate)
    const areaKm2 = 100 // Assume 100 km² for city area
    const density = Math.round(place.population / areaKm2)
    
    return {
      population: place.population,
      density: Math.max(1, density),
      country: place.country.name,
      city: place.name,
      region: place.region.name,
      elevation: place.elevationMeters,
      latitude: place.latitude,
      longitude: place.longitude
    }
  }
  
  private getCountryCodeFromCoordinates(lat: number, lng: number): string {
    // Simplified country detection based on coordinates
    // This is a basic implementation - in production, you'd use a proper geocoding service
    
    // India
    if (lat >= 6.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0) return 'IN'
    // USA
    if (lat >= 24.0 && lat <= 49.0 && lng >= -125.0 && lng <= -66.0) return 'US'
    // China
    if (lat >= 18.0 && lat <= 54.0 && lng >= 73.0 && lng <= 135.0) return 'CN'
    // Brazil
    if (lat >= -34.0 && lat <= 5.0 && lng >= -74.0 && lng <= -34.0) return 'BR'
    // Russia
    if (lat >= 41.0 && lat <= 82.0 && lng >= 19.0 && lng <= 169.0) return 'RU'
    // Canada
    if (lat >= 41.0 && lat <= 84.0 && lng >= -141.0 && lng <= -52.0) return 'CA'
    // Australia
    if (lat >= -44.0 && lat <= -10.0 && lng >= 113.0 && lng <= 154.0) return 'AU'
    // UK
    if (lat >= 50.0 && lat <= 59.0 && lng >= -8.0 && lng <= 2.0) return 'GB'
    // Germany
    if (lat >= 47.0 && lat <= 55.0 && lng >= 5.0 && lng <= 15.0) return 'DE'
    // France
    if (lat >= 42.0 && lat <= 51.0 && lng >= -5.0 && lng <= 8.0) return 'FR'
    
    // Default to India for testing
    return 'IN'
  }
  
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  async getCountryPopulation(countryCode: string): Promise<{
    success: boolean
    data?: {
      totalPopulation: number
      cityCount: number
      averageDensity: number
    }
    error?: string
  }> {
    try {
      const query = `
        query GetCountryPlaces($countryCode: String!) {
          country(id: $countryCode) {
            name
            populatedPlaces(first: 100) {
              totalCount
              edges {
                node {
                  name
                  population
                  latitude
                  longitude
                }
              }
            }
          }
        }
      `
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            countryCode
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`GeoDB API error: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.data?.country?.populatedPlaces?.edges?.length) {
        return {
          success: false,
          error: 'No population data found for this country'
        }
      }
      
      const places = result.data.country.populatedPlaces.edges.map(edge => edge.node)
      const totalPopulation = places.reduce((sum, place) => sum + (place.population || 0), 0)
      const cityCount = places.length
      const averageDensity = totalPopulation / cityCount
      
      return {
        success: true,
        data: {
          totalPopulation,
          cityCount,
          averageDensity: Math.round(averageDensity)
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching country population data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const geodbPopulationService = new GeoDBPopulationService()
export type { GeoDBPlace, GeoDBResponse }
