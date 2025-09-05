'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Building, Users, Star, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { googleMapsService, type LocationData, type RestaurantData } from '@/shared/lib/maps/google-maps-service'

interface InteractiveMapProps {
  location: string
  mapView: 'heatmap' | 'satellite'
  onLocationChange?: (location: string) => void
}

interface MapMarker {
  id: string
  lat: number
  lng: number
  type: 'restaurant' | 'competitor' | 'poi'
  data: RestaurantData
}

export function InteractiveMap({ location, mapView, onLocationChange }: InteractiveMapProps) {
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState({ lat: 13.7563, lng: 100.5018 }) // Default to Bangkok

  useEffect(() => {
    const loadLocationData = async () => {
      setIsLoading(true)
      try {
        // Load location intelligence data
        const data = await googleMapsService.getLocationIntelligence(location)
        setLocationData(data)
        setMapCenter(data.coordinates)

        // Create markers from competitor data
        const mapMarkers: MapMarker[] = data.competitors.map((restaurant, index) => ({
          id: restaurant.id,
          lat: restaurant.location.lat + (Math.random() - 0.5) * 0.01, // Add slight variation for visibility
          lng: restaurant.location.lng + (Math.random() - 0.5) * 0.01,
          type: 'competitor',
          data: restaurant
        }))

        setMarkers(mapMarkers)
      } catch (error) {
        console.error('Error loading location data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLocationData()
  }, [location])

  // Convert coordinates to SVG position
  const coordinatesToSVG = (lat: number, lng: number) => {
    const bounds = {
      north: mapCenter.lat + 0.02,
      south: mapCenter.lat - 0.02,
      east: mapCenter.lng + 0.02,
      west: mapCenter.lng - 0.02
    }

    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * 800
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 400

    return { x: Math.max(10, Math.min(790, x)), y: Math.max(10, Math.min(390, y)) }
  }

  if (isLoading) {
    return (
      <div className="h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Map Container */}
      <div className="h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg relative overflow-hidden border">
        {/* Map Background */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 400"
          className="absolute inset-0"
        >
          {/* Grid lines for map feel */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapView === 'heatmap' ? '#22c55e' : '#3b82f6'} strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Heatmap zones */}
          {mapView === 'heatmap' && locationData && (
            <g>
              <circle cx="400" cy="200" r="80" fill="rgba(34, 197, 94, 0.3)" />
              <circle cx="350" cy="180" r="60" fill="rgba(34, 197, 94, 0.4)" />
              <circle cx="450" cy="220" r="50" fill="rgba(34, 197, 94, 0.5)" />
            </g>
          )}

          {/* Restaurant Markers */}
          {markers.map((marker) => {
            const pos = coordinatesToSVG(marker.lat, marker.lng)
            return (
              <g key={marker.id}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={selectedMarker?.id === marker.id ? "8" : "6"}
                  fill={marker.type === 'competitor' ? '#ef4444' : '#22c55e'}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer drop-shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * markers.indexOf(marker) }}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedMarker(selectedMarker?.id === marker.id ? null : marker)}
                />
                <text
                  x={pos.x}
                  y={pos.y - 12}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700 pointer-events-none"
                >
                  {marker.data.name.slice(0, 10)}
                </text>
              </g>
            )
          })}

          {/* Center Location */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <circle cx="400" cy="200" r="10" fill="#0ea5e9" stroke="white" strokeWidth="3" />
            <circle cx="400" cy="200" r="20" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.4">
              <animate attributeName="r" values="10;30;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
          </motion.g>
        </svg>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur">
            <TrendingUp className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Location Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{locationData?.address || location}</span>
          </div>
          {locationData && (
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
              <span>Density: {locationData.populationDensity.toLocaleString()}/km²</span>
              <span>Traffic: {locationData.footTraffic}</span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Marker Details */}
      {selectedMarker && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedMarker.data.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedMarker.data.address}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{selectedMarker.data.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({selectedMarker.data.reviews})</span>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {selectedMarker.data.cuisine}
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">$</span>
                      <span className="text-green-600">{'$'.repeat(selectedMarker.data.priceLevel)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMarker(null)}
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Map Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <Card className="bg-white/70 backdrop-blur">
          <CardContent className="p-3 text-center">
            <Building className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-medium">{markers.length}</div>
            <div className="text-xs text-gray-600">Competitors</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur">
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <div className="text-sm font-medium">{locationData?.footTraffic}</div>
            <div className="text-xs text-gray-600">Foot Traffic</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <div className="text-sm font-medium">
              {locationData ? Math.round(locationData.averageIncome / 1000) + 'K' : 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Avg Income</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}