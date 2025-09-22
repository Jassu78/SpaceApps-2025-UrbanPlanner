'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock,
  Globe,
  Database,
  Zap
} from 'lucide-react'

// We'll load Swagger UI via CDN to avoid React strict mode warnings from swagger-ui-react

// Import the API spec
import { apiSpec } from '@/lib/apiSpec'

interface ApiTestResult {
  endpoint: string
  method: string
  status: 'success' | 'error' | 'loading'
  responseTime?: number
  statusCode?: number
  error?: string
  data?: any
}

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<ApiTestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [swaggerReady, setSwaggerReady] = useState(false)

  // Load Swagger UI script and css from CDN once on mount
  useEffect(() => {
    const existing = document.getElementById('swagger-ui-script') as HTMLScriptElement | null
    const existingCss = document.getElementById('swagger-ui-css') as HTMLLinkElement | null
    if (!existingCss) {
      const link = document.createElement('link')
      link.id = 'swagger-ui-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css'
      document.head.appendChild(link)
    }
    if (existing) {
      setSwaggerReady(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'swagger-ui-script'
    script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js'
    script.async = true
    script.onload = () => setSwaggerReady(true)
    document.body.appendChild(script)
  }, [])

  const testAllApis = async () => {
    setIsRunningTests(true)
    setTestResults([])

    const testCases = [
      {
        name: 'MODIS Data',
        endpoint: '/api/nasa-modis?lat=40.7128&lng=-74.0060&dataType=temperature',
        method: 'GET'
      },
      {
        name: 'FIRMS Fire Data',
        endpoint: '/api/firms?north=40.8&south=40.6&east=-73.9&west=-74.1',
        method: 'GET'
      },
      {
        name: 'NOAA Weather Data',
        endpoint: '/api/noaa-weather?coords=40.7128,-74.0060',
        method: 'GET'
      },
      {
        name: 'Weather Data (Alias)',
        endpoint: '/api/weather?coords=40.7128,-74.0060',
        method: 'GET'
      },
      {
        name: 'Population Data',
        endpoint: '/api/population',
        method: 'POST',
        body: { lat: 40.7128, lng: -74.0060 }
      },
      {
        name: 'Air Quality Data',
        endpoint: '/api/waqi?lat=40.7128&lng=-74.0060',
        method: 'GET'
      },
      {
        name: 'NASA Earthdata',
        endpoint: '/api/nasa-earthdata?lat=40.7128&lng=-74.0060',
        method: 'GET'
      },
      {
        name: 'Open-Meteo (General)',
        endpoint: '/api/open-meteo?lat=40.7128&lng=-74.0060',
        method: 'GET'
      },
      {
        name: 'Open-Meteo (7-day History)',
        endpoint: '/api/open-meteo-history?lat=40.7128&lng=-74.0060&days=7',
        method: 'GET'
      },
      {
        name: 'Landsat Data',
        endpoint: '/api/nasa-landsat?lat=40.7128&lng=-74.0060',
        method: 'GET'
      },
      {
        name: 'GIBS WMTS URL',
        endpoint: '/api/gibs?layer=modis_terra_truecolor&z=2&x=1&y=1&time=2025-09-22',
        method: 'GET'
      },
      {
        name: 'NASA WMTS Capabilities',
        endpoint: '/api/nasa-wmts',
        method: 'GET'
      },
      {
        name: 'AppEEARS',
        endpoint: '/api/appeears',
        method: 'GET'
      },
      {
        name: 'Landsat STAC',
        endpoint: '/api/landsat?bbox=-74.1,40.7,-73.9,40.8',
        method: 'GET'
      },
      {
        name: 'Dashboard Data',
        endpoint: '/api/dashboard?lat=40.7128&lng=-74.0060',
        method: 'GET'
      }
    ]

    for (const testCase of testCases) {
      const startTime = Date.now()
      
      try {
        const response = await fetch(testCase.endpoint, {
          method: testCase.method,
          headers: testCase.body ? { 'Content-Type': 'application/json' } : undefined,
          body: testCase.body ? JSON.stringify(testCase.body) : undefined
        })
        const responseTime = Date.now() - startTime
        const data = await response.json()

        setTestResults(prev => [...prev, {
          endpoint: testCase.name,
          method: testCase.method,
          status: response.ok ? 'success' : 'error',
          responseTime,
          statusCode: response.status,
          data: response.ok ? data : undefined,
          error: response.ok ? undefined : data.error || 'Unknown error'
        }])
      } catch (error) {
        const responseTime = Date.now() - startTime
        setTestResults(prev => [...prev, {
          endpoint: testCase.name,
          method: testCase.method,
          status: 'error',
          responseTime,
          error: error instanceof Error ? error.message : 'Network error'
        }])
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunningTests(false)
  }

  // Initialize Swagger UI when script is ready
  useEffect(() => {
    if (!swaggerReady) return
    // @ts-expect-error global from swagger-ui-dist
    const SwaggerUIBundle = (window as any).SwaggerUIBundle
    if (!SwaggerUIBundle) return
    SwaggerUIBundle({
      spec: apiSpec,
      dom_id: '#swagger-ui',
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      tryItOutEnabled: true,
      withCredentials: false,
      requestInterceptor: (req: any) => req,
      responseInterceptor: (res: any) => res,
    })
  }, [swaggerReady])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'loading':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>
      case 'loading':
        return <Badge className="bg-yellow-500">Loading</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6 shadow-2xl">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            API Testing Center
          </h1>
          <p className="text-xl text-slate-200 max-w-4xl mx-auto leading-relaxed">
            Test and explore all MoonLight Urban Planning Tool APIs with interactive documentation and real-time testing capabilities.
          </p>
        </div>

        {/* API Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">NASA APIs</h3>
              </div>
              <p className="text-slate-600 text-base mb-4 leading-relaxed">MODIS, FIRMS, Landsat, Earthdata</p>
              <Badge className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold">4 Endpoints</Badge>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Weather APIs</h3>
              </div>
              <p className="text-slate-600 text-base mb-4 leading-relaxed">NOAA Weather, Air Quality</p>
              <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold">2 Endpoints</Badge>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Data APIs</h3>
              </div>
              <p className="text-slate-600 text-base mb-4 leading-relaxed">Population, Dashboard</p>
              <Badge className="bg-purple-500 text-white px-4 py-2 text-sm font-semibold">2 Endpoints</Badge>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                  <TestTube className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Total APIs</h3>
              </div>
              <p className="text-slate-600 text-base mb-4 leading-relaxed">All endpoints combined</p>
              <Badge className="bg-orange-500 text-white px-4 py-2 text-sm font-semibold">8 Endpoints</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <Card className="mb-12 bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              API Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Button 
                  onClick={testAllApis}
                  disabled={isRunningTests}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isRunningTests ? (
                    <>
                      <Clock className="w-5 h-5 mr-3 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5 mr-3" />
                      Test All APIs
                    </>
                  )}
                </Button>
                
                <div className="text-lg text-slate-600 font-medium">
                  {testResults.length > 0 && (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {testResults.filter(r => r.status === 'success').length} of {testResults.length} tests passed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mb-12 bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="text-xl font-semibold text-slate-800">{result.endpoint}</h4>
                        <p className="text-slate-600 text-base">{result.method}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {result.responseTime && (
                        <div className="text-center">
                          <span className="text-2xl font-bold text-slate-700">
                            {result.responseTime}ms
                          </span>
                          <p className="text-sm text-slate-500">Response Time</p>
                        </div>
                      )}
                      {result.statusCode && (
                        <Badge 
                          className={`px-4 py-2 text-sm font-semibold ${
                            result.statusCode >= 200 && result.statusCode < 300 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {result.statusCode}
                        </Badge>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Swagger UI Documentation */}
        <Card className="mb-12 bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              Interactive API Documentation
            </CardTitle>
            <p className="text-lg text-slate-600 mt-2">
              Use the interactive documentation below to test API endpoints with different parameters.
            </p>
          </CardHeader>
          <CardContent>
            <div className="swagger-ui-container bg-white rounded-xl p-6 border border-slate-200">
              <div id="swagger-ui" />
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints List */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-slate-500 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              Available Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(apiSpec.paths).map(([path, methods]) => (
                <div key={path} className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 font-mono">{path}</h4>
                  <div className="space-y-3">
                    {Object.entries(methods).map(([method, details]) => (
                      <div key={method} className="flex items-center gap-3">
                        <Badge 
                          className={`px-3 py-1 text-sm font-semibold ${
                            method === 'get' ? 'bg-green-500 text-white' : 
                            method === 'post' ? 'bg-blue-500 text-white' : 
                            'bg-gray-500 text-white'
                          }`}
                        >
                          {method.toUpperCase()}
                        </Badge>
                        <span className="text-slate-700 text-base font-medium">
                          {(details as any).summary}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .swagger-ui-container {
          background: white;
          border-radius: 12px;
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px 12px 0 0;
        }
        .swagger-ui .info .title {
          color: #1e293b;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .swagger-ui .info .description {
          color: #475569;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        .swagger-ui .scheme-container {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
        }
        .swagger-ui .opblock {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          margin: 16px 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .swagger-ui .opblock .opblock-summary {
          color: #1e293b;
          font-weight: 600;
          font-size: 1.1rem;
        }
        .swagger-ui .opblock .opblock-summary-description {
          color: #64748b;
          font-size: 1rem;
        }
        .swagger-ui .opblock .opblock-section-header h4 {
          color: #1e293b;
          font-weight: 600;
        }
        .swagger-ui .opblock .opblock-section-header label {
          color: #64748b;
          font-weight: 500;
        }
        .swagger-ui .opblock .opblock-description-wrapper p {
          color: #475569;
          line-height: 1.6;
        }
        .swagger-ui .parameter__name {
          color: #1e293b;
          font-weight: 600;
        }
        .swagger-ui .parameter__type {
          color: #7c3aed;
          font-weight: 500;
        }
        .swagger-ui .parameter__description {
          color: #64748b;
          line-height: 1.5;
        }
        .swagger-ui .response-col_status {
          color: #1e293b;
          font-weight: 600;
        }
        .swagger-ui .response-col_description__inner p {
          color: #475569;
          line-height: 1.6;
        }
        .swagger-ui .btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 600;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
          transition: all 0.2s;
        }
        .swagger-ui .btn:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
        }
        .swagger-ui .btn.execute {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
        }
        .swagger-ui .btn.execute:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 6px 8px -1px rgba(16, 185, 129, 0.4);
        }
        .swagger-ui .response-col_status .response-col_status-code {
          color: #1e293b;
          font-weight: 600;
        }
        .swagger-ui .response-col_description__inner .response-col_description__inner {
          color: #475569;
        }
        .swagger-ui .highlight-code {
          background: #f1f5f9;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
        }
        .swagger-ui .microlight {
          background: #f1f5f9;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
        }
        .swagger-ui .opblock.opblock-get {
          border-left: 4px solid #10b981;
        }
        .swagger-ui .opblock.opblock-post {
          border-left: 4px solid #3b82f6;
        }
        .swagger-ui .opblock.opblock-put {
          border-left: 4px solid #f59e0b;
        }
        .swagger-ui .opblock.opblock-delete {
          border-left: 4px solid #ef4444;
        }
      `}</style>
    </div>
  )
}
