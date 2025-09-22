export const apiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'MoonLight Urban Planning Tool API',
    description: 'Comprehensive API for NASA data integration, weather monitoring, and urban planning analytics',
    version: '1.0.0',
    contact: {
      name: 'MoonLight Team',
      email: 'contact@moonlight-urban.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  paths: {
    '/api/gibs': {
      get: {
        summary: 'Get GIBS WMTS Tile URL',
        description: 'Returns a WMTS URL for a given NASA GIBS layer and date',
        parameters: [
          { name: 'layer', in: 'query', required: true, schema: { type: 'string' }, example: 'MODIS_Terra_CorrectedReflectance_TrueColor' },
          { name: 'date', in: 'query', required: false, schema: { type: 'string' }, example: '2025-09-22' }
        ],
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/nasa-wmts': {
      get: {
        summary: 'Get NASA WMTS capabilities',
        description: 'Proxy to NASA GIBS WMTS capabilities',
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/appeears': {
      get: {
        summary: 'AppEEARS health/check',
        description: 'Checks connectivity or example request to NASA AppEEARS',
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/landsat': {
      get: {
        summary: 'Query Landsat STAC',
        description: 'Queries Landsat STAC by bbox or coords/date',
        parameters: [
          { name: 'bbox', in: 'query', required: false, schema: { type: 'string' }, example: '-74.1,40.7,-73.9,40.8' }
        ],
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/nasa-modis': {
      get: {
        summary: 'Get MODIS Satellite Data',
        description: 'Retrieve MODIS satellite data for temperature, vegetation, and albedo analysis',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude coordinate (-90 to 90)',
            example: 40.7128
          },
          {
            name: 'lng',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude coordinate (-180 to 180)',
            example: -74.0060
          },
          {
            name: 'dataType',
            in: 'query',
            required: true,
            schema: { 
              type: 'string',
              enum: ['temperature', 'vegetation', 'albedo']
            },
            description: 'Type of data to retrieve',
            example: 'temperature'
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        dataType: { type: 'string' },
                        product: { type: 'string' },
                        description: { type: 'string' },
                        location: {
                          type: 'object',
                          properties: {
                            lat: { type: 'number' },
                            lng: { type: 'number' }
                          }
                        },
                        temporal: { type: 'string' },
                        granules: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              title: { type: 'string' },
                              timeStart: { type: 'string' },
                              timeEnd: { type: 'string' },
                              cloudCover: { type: 'string' },
                              granuleSize: { type: 'string' }
                            }
                          }
                        },
                        summary: {
                          type: 'object',
                          properties: {
                            totalGranules: { type: 'number' },
                            averageCloudCover: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request - invalid parameters'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/firms': {
      get: {
        summary: 'Get FIRMS Fire Detection Data',
        description: 'Retrieve real-time fire detection data from NASA FIRMS',
        parameters: [
          {
            name: 'north',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Northern boundary latitude',
            example: 40.8
          },
          {
            name: 'south',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Southern boundary latitude',
            example: 40.6
          },
          {
            name: 'east',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Eastern boundary longitude',
            example: -73.9
          },
          {
            name: 'west',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Western boundary longitude',
            example: -74.1
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          latitude: { type: 'number' },
                          longitude: { type: 'number' },
                          brightness: { type: 'number' },
                          confidence: { type: 'string' },
                          satellite: { type: 'string' },
                          acq_date: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/noaa-weather': {
      get: {
        summary: 'Get NOAA Weather Data',
        description: 'Retrieve NOAA weather forecast data',
        parameters: [
          {
            name: 'coords',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Coordinates in format "lat,lng"',
            example: '40.7128,-74.0060'
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    location: { type: 'object' },
                    current: {
                      type: 'object',
                      properties: {
                        temperature: { type: 'number' },
                        humidity: { type: 'number' },
                        windSpeed: { type: 'string' },
                        windDirection: { type: 'string' },
                        shortForecast: { type: 'string' },
                        precipitationProbability: { type: 'number' }
                      }
                    },
                    forecast: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          temperature: { type: 'number' },
                          humidity: { type: 'number' },
                          windSpeed: { type: 'string' },
                          shortForecast: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/weather': {
      get: {
        summary: 'Get Weather Data (alias)',
        description: 'Convenience endpoint for weather data',
        parameters: [
          { name: 'coords', in: 'query', required: false, schema: { type: 'string' }, example: '40.7128,-74.0060' }
        ],
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/population': {
      get: {
        summary: 'Get Population Data',
        description: 'Retrieve population and demographic data from SEDAC',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude coordinate',
            example: 40.7128
          },
          {
            name: 'lng',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude coordinate',
            example: -74.0060
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        city: { type: 'string' },
                        population: { type: 'number' },
                        density: { type: 'number' },
                        area: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/waqi': {
      get: {
        summary: 'Get Air Quality Data',
        description: 'Retrieve air quality index data from WAQI',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude coordinate',
            example: 40.7128
          },
          {
            name: 'lng',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude coordinate',
            example: -74.0060
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        aqi: { type: 'number' },
                        level: { type: 'string' },
                        pm25: { type: 'number' },
                        pm10: { type: 'number' },
                        o3: { type: 'number' },
                        no2: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/nasa-earthdata': {
      get: {
        summary: 'Get NASA Earthdata',
        description: 'Retrieve NASA Earthdata collection information',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude coordinate',
            example: 40.7128
          },
          {
            name: 'lng',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude coordinate',
            example: -74.0060
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        collections: { type: 'array' },
                        totalHits: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/nasa-landsat': {
      get: {
        summary: 'Get Landsat Data',
        description: 'Retrieve Landsat satellite imagery data',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude coordinate',
            example: 40.7128
          },
          {
            name: 'lng',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude coordinate',
            example: -74.0060
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        granules: { type: 'array' },
                        totalHits: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/dashboard': {
      get: {
        summary: 'Get Dashboard Data',
        description: 'Retrieve comprehensive dashboard data including all metrics',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude coordinate',
            example: 40.7128
          },
          {
            name: 'lng',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude coordinate',
            example: -74.0060
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        temperature: { type: 'object' },
                        airQuality: { type: 'object' },
                        vegetation: { type: 'object' },
                        precipitation: { type: 'object' },
                        fire: { type: 'object' },
                        population: { type: 'object' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/open-meteo': {
      get: {
        summary: 'Open-Meteo General Weather Data',
        description: 'Get current weather, daily summary, and air quality data from Open-Meteo (Weather API Ground)',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude coordinate (-90 to 90)',
            example: 40.7128
          },
          {
            name: 'lng',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude coordinate (-180 to 180)',
            example: -74.0060
          },
          {
            name: 'timezone',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Timezone (default: auto)',
            example: 'auto'
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    source: { type: 'string', example: 'Open-Meteo (Weather API Ground)' },
                    location: {
                      type: 'object',
                      properties: {
                        lat: { type: 'number' },
                        lng: { type: 'number' }
                      }
                    },
                    current: {
                      type: 'object',
                      properties: {
                        temperatureC: { type: 'number' },
                        apparentTemperatureC: { type: 'number' },
                        humidityPct: { type: 'number' },
                        pressureHpa: { type: 'number' },
                        windSpeed10m: { type: 'number' },
                        windDirection10m: { type: 'number' },
                        precipitationMm: { type: 'number' },
                        aqiEuropean: { type: 'number' },
                        pm25: { type: 'number' },
                        pm10: { type: 'number' },
                        ozone: { type: 'number' }
                      }
                    },
                    daily: {
                      type: 'object',
                      properties: {
                        date: { type: 'string' },
                        tempMaxC: { type: 'number' },
                        tempMinC: { type: 'number' },
                        precipSumMm: { type: 'number' },
                        uvIndexMax: { type: 'number' },
                        shortwaveRadiationSum: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/open-meteo-history': {
      get: {
        summary: 'Open-Meteo Historical Weather Data',
        description: 'Get 7-day historical hourly weather and air quality data from Open-Meteo',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude coordinate (-90 to 90)',
            example: 40.7128
          },
          {
            name: 'lng',
            in: 'query',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude coordinate (-180 to 180)',
            example: -74.0060
          },
          {
            name: 'days',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 16 },
            description: 'Number of days to retrieve (1-16, default: 7)',
            example: 7
          },
          {
            name: 'timezone',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Timezone (default: auto)',
            example: 'auto'
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    source: { type: 'string', example: 'Open-Meteo (Weather API Ground)' },
                    location: {
                      type: 'object',
                      properties: {
                        lat: { type: 'number' },
                        lng: { type: 'number' }
                      }
                    },
                    days: { type: 'integer' },
                    hourly: {
                      type: 'object',
                      properties: {
                        time: { type: 'array', items: { type: 'string' } },
                        temperatureC: { type: 'array', items: { type: 'number' } },
                        humidityPct: { type: 'array', items: { type: 'number' } },
                        precipitationMm: { type: 'array', items: { type: 'number' } },
                        cloudCoverPct: { type: 'array', items: { type: 'number' } },
                        pressureHpa: { type: 'array', items: { type: 'number' } },
                        windSpeed10m: { type: 'array', items: { type: 'number' } }
                      }
                    },
                    airQualityHourly: {
                      type: 'object',
                      properties: {
                        time: { type: 'array', items: { type: 'string' } },
                        aqiEuropean: { type: 'array', items: { type: 'number' } },
                        pm25: { type: 'array', items: { type: 'number' } },
                        pm10: { type: 'array', items: { type: 'number' } },
                        ozone: { type: 'array', items: { type: 'number' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}
