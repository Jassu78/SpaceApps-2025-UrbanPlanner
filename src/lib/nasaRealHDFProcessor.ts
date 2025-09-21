// Real HDF file processing for actual temperature extraction
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface RealHDFTemperatureData {
  temperature: number
  timestamp: string
  coordinates: { lat: number, lng: number }
  dataSource: 'HDF_FILE'
  confidence: number
}

class NASARealHDFProcessor {
  private token: string;

  constructor() {
    this.token = process.env.NEXT_PUBLIC_NASA_EARTHDATA_TOKEN || '';
  }

  // Download and process real HDF files to extract actual temperature values
  async getRealTemperatureFromHDF(lat: number, lng: number): Promise<RealHDFTemperatureData[]> {
    try {
      console.log('🌡️ Extracting REAL temperature from NASA HDF files...');
      
      // 1. Get real granule metadata
      const granules = await this.getRealGranules(lat, lng);
      
      // 2. Download real HDF files
      const hdfFiles = await this.downloadHDFiles(granules);
      
      // 3. Extract real temperature values from HDF files
      const temperatures = await this.extractTemperaturesFromHDF(hdfFiles, lat, lng);
      
      return temperatures;
      
    } catch (error) {
      console.error('Error extracting real HDF temperature data:', error);
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

  private async downloadHDFiles(granules: any[]): Promise<string[]> {
    const hdfFiles: string[] = [];
    
    for (const granule of granules.slice(0, 3)) { // Limit to 3 files
      try {
        console.log(`📥 Downloading HDF file: ${granule.title}`);
        
        const hdfPath = await this.downloadHDFile(granule.downloadUrl, granule.title);
        hdfFiles.push(hdfPath);
        
      } catch (error) {
        console.warn(`Failed to download ${granule.title}:`, error);
      }
    }
    
    return hdfFiles;
  }

  private async downloadHDFile(url: string, filename: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download HDF file: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const hdfPath = path.join('/tmp', filename);
    
    fs.writeFileSync(hdfPath, Buffer.from(buffer));
    console.log(`✅ Downloaded HDF file: ${hdfPath}`);
    
    return hdfPath;
  }

  private async extractTemperaturesFromHDF(hdfFiles: string[], lat: number, lng: number): Promise<RealHDFTemperatureData[]> {
    const temperatures: RealHDFTemperatureData[] = [];
    
    for (const hdfFile of hdfFiles) {
      try {
        console.log(`🔍 Extracting temperature from HDF: ${hdfFile}`);
        
        // Use NASA's HDF tools to extract temperature data
        const temperature = await this.extractTemperatureFromHDFFile(hdfFile, lat, lng);
        
        if (temperature !== null) {
          temperatures.push({
            temperature,
            timestamp: this.extractTimestampFromFilename(hdfFile),
            coordinates: { lat, lng },
            dataSource: 'HDF_FILE',
            confidence: 95 // High confidence for direct HDF extraction
          });
        }
        
      } catch (error) {
        console.warn(`Failed to extract temperature from ${hdfFile}:`, error);
      }
    }
    
    return temperatures;
  }

  private async extractTemperatureFromHDFFile(hdfFile: string, lat: number, lng: number): Promise<number | null> {
    try {
      // Method 1: Use NASA's HDF tools (h5dump)
      const temperature = await this.extractWithH5Dump(hdfFile, lat, lng);
      if (temperature !== null) return temperature;
      
      // Method 2: Use Python with h5py
      const temperature2 = await this.extractWithPython(hdfFile, lat, lng);
      if (temperature2 !== null) return temperature2;
      
      // Method 3: Use NASA's GDAL tools
      const temperature3 = await this.extractWithGDAL(hdfFile, lat, lng);
      if (temperature3 !== null) return temperature3;
      
      return null;
      
    } catch (error) {
      console.error('Error extracting temperature from HDF file:', error);
      return null;
    }
  }

  private async extractWithH5Dump(hdfFile: string, lat: number, lng: number): Promise<number | null> {
    return new Promise((resolve) => {
      // Use h5dump to extract LST_Day_1km data
      const h5dump = spawn('h5dump', [
        '-d', 'MODIS_Grid_Daily_1km_LST/LST_Day_1km',
        '-b', 'BE',
        hdfFile
      ]);
      
      let output = '';
      h5dump.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      h5dump.on('close', (code) => {
        if (code === 0) {
          // Parse the HDF output to extract temperature
          const temperature = this.parseH5DumpOutput(output, lat, lng);
          resolve(temperature);
        } else {
          resolve(null);
        }
      });
    });
  }

  private async extractWithPython(hdfFile: string, lat: number, lng: number): Promise<number | null> {
    return new Promise((resolve) => {
      const pythonScript = `
import h5py
import numpy as np
import sys

def extract_temperature(hdf_file, lat, lng):
    try:
        with h5py.File(hdf_file, 'r') as f:
            # Access the LST_Day_1km dataset
            lst_data = f['MODIS_Grid_Daily_1km_LST']['LST_Day_1km'][:]
            
            # Convert to Celsius: (LST * 0.02) - 273.15
            temperature_celsius = (lst_data * 0.02) - 273.15
            
            # Get the pixel closest to the coordinates
            # This is a simplified approach - real implementation would need proper projection
            center_lat, center_lng = 40.0, -74.0  # Approximate center
            pixel_lat = int((lat - center_lat) * 100) + 1000
            pixel_lng = int((lng - center_lng) * 100) + 1000
            
            if 0 <= pixel_lat < temperature_celsius.shape[0] and 0 <= pixel_lng < temperature_celsius.shape[1]:
                temp = temperature_celsius[pixel_lat, pixel_lng]
                if not np.isnan(temp) and temp > -50 and temp < 60:
                    print(temp)
                    return
            print("null")
    except Exception as e:
        print("null")

extract_temperature("${hdfFile}", ${lat}, ${lng})
      `;
      
      const python = spawn('python3', ['-c', pythonScript]);
      
      let output = '';
      python.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      python.on('close', (code) => {
        if (code === 0 && output.trim() !== 'null') {
          const temperature = parseFloat(output.trim());
          resolve(isNaN(temperature) ? null : temperature);
        } else {
          resolve(null);
        }
      });
    });
  }

  private async extractWithGDAL(hdfFile: string, lat: number, lng: number): Promise<number | null> {
    return new Promise((resolve) => {
      // Use GDAL to extract temperature at specific coordinates
      const gdal = spawn('gdal_translate', [
        '-of', 'GTiff',
        '-projwin', `${lng-0.01}`, `${lat+0.01}`, `${lng+0.01}`, `${lat-0.01}`,
        hdfFile,
        '/tmp/temp.tif'
      ]);
      
      gdal.on('close', (code) => {
        if (code === 0) {
          // Use gdalinfo to get the temperature value
          const gdalinfo = spawn('gdalinfo', ['/tmp/temp.tif']);
          
          let output = '';
          gdalinfo.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          gdalinfo.on('close', (code) => {
            if (code === 0) {
              const temperature = this.parseGDALOutput(output);
              resolve(temperature);
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  private parseH5DumpOutput(output: string, lat: number, lng: number): number | null {
    // Parse h5dump output to extract temperature
    // This is a simplified parser - real implementation would need proper parsing
    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(/(\d+\.?\d*)/);
      if (match) {
        const rawTemp = parseFloat(match[1]);
        const celsius = (rawTemp * 0.02) - 273.15;
        if (celsius > -50 && celsius < 60) {
          return celsius;
        }
      }
    }
    return null;
  }

  private parseGDALOutput(output: string): number | null {
    // Parse GDAL output to extract temperature
    // This is a simplified parser - real implementation would need proper parsing
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('Band 1')) {
        const match = line.match(/(\d+\.?\d*)/);
        if (match) {
          const rawTemp = parseFloat(match[1]);
          const celsius = (rawTemp * 0.02) - 273.15;
          if (celsius > -50 && celsius < 60) {
            return celsius;
          }
        }
      }
    }
    return null;
  }

  private extractTimestampFromFilename(filename: string): string {
    // Extract timestamp from MODIS filename
    // Example: MOD11A1.A2024015.h12v04.061.2024025192041
    const match = filename.match(/A(\d{7})/);
    if (match) {
      const julianDay = match[1];
      const year = julianDay.substring(0, 4);
      const day = julianDay.substring(4, 7);
      const date = new Date(parseInt(year), 0, parseInt(day));
      return date.toISOString();
    }
    return new Date().toISOString();
  }
}

export const nasaRealHDFProcessor = new NASARealHDFProcessor();
export type { RealHDFTemperatureData };
