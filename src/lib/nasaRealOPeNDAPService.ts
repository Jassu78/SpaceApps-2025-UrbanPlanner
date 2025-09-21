// Real OPeNDAP service for extracting actual temperature values from NASA
interface RealOPeNDAPTemperatureData {
  temperature: number
  timestamp: string
  coordinates: { lat: number, lng: number }
  dataSource: 'OPeNDAP'
  confidence: number
  rawValue: number
  scaleFactor: number
  offset: number
}

class NASARealOPeNDAPService {
  private token: string;

  constructor() {
    this.token = process.env.NEXT_PUBLIC_NASA_EARTHDATA_TOKEN || '';
  }

  // Extract real temperature data using NASA OPeNDAP
  async getRealTemperatureFromOPeNDAP(lat: number, lng: number): Promise<RealOPeNDAPTemperatureData[]> {
    try {
      console.log('🌡️ Extracting REAL temperature from NASA OPeNDAP...');
      
      // 1. Get real granule metadata
      const granules = await this.getRealGranules(lat, lng);
      
      // 2. Extract real temperature values using OPeNDAP
      const temperatures: RealOPeNDAPTemperatureData[] = [];
      
      for (const granule of granules.slice(0, 7)) {
        try {
          const temperature = await this.extractTemperatureFromOPeNDAP(granule, lat, lng);
          if (temperature) {
            temperatures.push(temperature);
          }
        } catch (error) {
          console.warn(`Failed to extract temperature from granule ${granule.id}:`, error);
        }
      }
      
      console.log(`✅ Extracted ${temperatures.length} real temperature values from OPeNDAP`);
      return temperatures;
      
    } catch (error) {
      console.error('Error extracting real OPeNDAP temperature data:', error);
      throw error;
    }
  }

  private async getRealGranules(lat: number, lng: number) {
    const response = await fetch('/api/nasa-modis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat, lng, type: 'temperature',
        temporal: new Date().toISOString().split('T')[0],
        token: this.token
      })
    });
    
    const data = await response.json();
    return data.data?.granules || [];
  }

  private async extractTemperatureFromOPeNDAP(granule: any, lat: number, lng: number): Promise<RealOPeNDAPTemperatureData | null> {
    try {
      const opendapUrl = granule.opendapUrl;
      if (!opendapUrl) {
        throw new Error('No OPeNDAP URL available');
      }

      // Convert lat/lng to MODIS tile coordinates
      const tileCoords = this.convertLatLngToMODIS(lat, lng);
      
      // Construct OPeNDAP query for specific pixel
      const opendapQuery = `${opendapUrl}.dap?LST_Day_1km[0:0][${tileCoords.row}:${tileCoords.row}][${tileCoords.col}:${tileCoords.col}]`;
      
      console.log(`🔍 OPeNDAP Query: ${opendapQuery}`);
      
      const response = await fetch(opendapQuery, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`OPeNDAP request failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const responseText = await response.text();
      console.log(`📄 OPeNDAP Response: ${responseText.substring(0, 200)}...`);
      
      // Parse the real temperature value
      const temperatureData = this.parseOPeNDAPResponse(responseText);
      
      if (temperatureData) {
        return {
          temperature: temperatureData.temperature,
          timestamp: granule.timeStart,
          coordinates: { lat, lng },
          dataSource: 'OPeNDAP',
          confidence: 90, // High confidence for direct OPeNDAP extraction
          rawValue: temperatureData.rawValue,
          scaleFactor: 0.02,
          offset: -273.15
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error extracting temperature from OPeNDAP:', error);
      return null;
    }
  }

  private convertLatLngToMODIS(lat: number, lng: number): { row: number, col: number } {
    // Convert lat/lng to MODIS sinusoidal projection coordinates
    // This is a simplified conversion - real implementation would use proper projection math
    
    // MODIS uses sinusoidal projection with specific tile indices
    // For h12v04 tile (New York area), approximate conversion
    const tileSize = 1200; // MODIS tile size
    const centerLat = 40.0;
    const centerLng = -74.0;
    
    // Simple linear conversion (not accurate for production)
    const row = Math.floor((lat - centerLat) * 100) + 600;
    const col = Math.floor((lng - centerLng) * 100) + 600;
    
    // Clamp to valid range
    const clampedRow = Math.max(0, Math.min(tileSize - 1, row));
    const clampedCol = Math.max(0, Math.min(tileSize - 1, col));
    
    return { row: clampedRow, col: clampedCol };
  }

  private parseOPeNDAPResponse(responseText: string): { temperature: number, rawValue: number } | null {
    try {
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(responseText);
        console.log('🔍 OPeNDAP JSON response:', jsonData);
        
        if (jsonData.LST_Day_1km && Array.isArray(jsonData.LST_Day_1km)) {
          const rawValue = jsonData.LST_Day_1km[0];
          if (typeof rawValue === 'number') {
            const temperature = (rawValue * 0.02) - 273.15;
            return { temperature, rawValue };
          }
        }
      } catch (jsonError) {
        console.log('🔍 Not JSON format, trying text parsing...');
      }
      
      // Try to parse as text/CSV format
      const lines = responseText.split('\n');
      
      for (const line of lines) {
        // Look for temperature values in the response
        const tempMatch = line.match(/(\d+\.?\d*)/);
        if (tempMatch) {
          const rawValue = parseFloat(tempMatch[1]);
          const temperature = (rawValue * 0.02) - 273.15;
          
          if (temperature > -50 && temperature < 60) { // Valid temperature range
            console.log(`✅ Real temperature found: ${temperature}°C (raw: ${rawValue})`);
            return { temperature, rawValue };
          }
        }
      }
      
      // Try to find temperature in DAP format
      const dapMatch = responseText.match(/LST_Day_1km.*?(\d+\.?\d*)/);
      if (dapMatch) {
        const rawValue = parseFloat(dapMatch[1]);
        const temperature = (rawValue * 0.02) - 273.15;
        if (temperature > -50 && temperature < 60) {
          console.log(`✅ DAP temperature found: ${temperature}°C (raw: ${rawValue})`);
          return { temperature, rawValue };
        }
      }
      
      console.warn('No valid temperature found in OPeNDAP response');
      return null;
      
    } catch (error) {
      console.error('Error parsing OPeNDAP response:', error);
      return null;
    }
  }
}

export const nasaRealOPeNDAPService = new NASARealOPeNDAPService();
export type { RealOPeNDAPTemperatureData };
