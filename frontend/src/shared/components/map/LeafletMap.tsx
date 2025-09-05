'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Import Leaflet types
interface Location {
  lat: number
  lng: number
}

interface Restaurant {
  id: string
  name: string
  location: Location
  rating?: number
  cuisine?: string
}

interface LeafletMapProps {
  restaurants?: Restaurant[]
  center?: Location
  zoom?: number
  height?: string
  className?: string
}

// Dynamically import the map component to prevent SSR issues
const MapComponent = dynamic(
  () => {
    return new Promise<{ default: React.FC<LeafletMapProps> }>((resolve) => {
      // Mock map component for now since we don't have leaflet installed
      const MockMap: React.FC<LeafletMapProps> = ({ restaurants, center, zoom, height, className }) => (
        <div 
          className={`bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center ${className || ''}`}
          style={{ height: height || '400px' }}
        >
          <div className="text-center text-gray-600">
            <div className="mb-2">🗺️</div>
            <p className="text-sm">Interactive Map</p>
            <p className="text-xs text-gray-500">
              {restaurants ? `${restaurants.length} locations` : 'Map will load here'}
            </p>
          </div>
        </div>
      )
      resolve({ default: MockMap })
    })
  },
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center animate-pulse" style={{ height: '400px' }}>
        <div className="text-gray-400">Loading map...</div>
      </div>
    )
  }
)

const LeafletMap: React.FC<LeafletMapProps> = (props) => {
  return <MapComponent {...props} />
}

export default LeafletMap
export type { LeafletMapProps, Restaurant, Location }