'use client'

import React from 'react'
import SimpleNASAMap from '@/components/SimpleNASAMap'

export default function NASATestPage() {
  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          NASA Satellite Imagery Test
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            NASA Satellite Imagery Test - SIMPLIFIED
          </h2>
          <p className="text-gray-300 mb-4">
            This is a simplified test to verify NASA GIBS satellite imagery works with Leaflet.js.
            You should see a layer control in the top-right corner to switch between OpenStreetMap and NASA MODIS Terra.
          </p>
          <div className="text-sm text-gray-400 space-y-1">
            <p>• <strong>NASA MODIS Terra</strong> - Real satellite imagery from NASA&apos;s MODIS Terra satellite</p>
            <p>• <strong>OpenStreetMap</strong> - Standard street map for comparison</p>
            <p>• Use the layer control in the top-right corner to switch between layers</p>
            <p>• The NASA layer should show real satellite imagery of Earth</p>
            <p>• Check browser console for any error messages</p>
          </div>
        </div>

        <SimpleNASAMap />
        
        <div className="mt-6 bg-blue-500/20 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">
            How to Test the Layers
          </h3>
          <div className="text-sm text-blue-200 space-y-1">
            <p>• <strong>Look for the layer control</strong> in the top-right corner of the map</p>
            <p>• <strong>Click on different layer names</strong> to switch between them</p>
            <p>• <strong>Temperature layer</strong> shows thermal data (red/yellow = hot, blue = cold)</p>
            <p>• <strong>NDVI layer</strong> shows vegetation (green = healthy, brown = sparse)</p>
            <p>• <strong>Zoom out</strong> to see global coverage (works best at zoom levels 1-6)</p>
            <p>• <strong>Check console</strong> for any error messages if layers don&apos;t load</p>
          </div>
        </div>
      </div>
    </div>
  )
}
