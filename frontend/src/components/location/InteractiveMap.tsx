'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import { Icon, LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocationCoordinates, Restaurant, LocationAnalysisResponse } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistance, getScoreColor } from '@/lib/utils'

// Fix for default markers in react-leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const restaurantIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRUY0NDQ0Ii8+Cjwvc3ZnPgo=',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
})

const analysisIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMzMzM0ZGIi8+Cjwvc3ZnPgo=',
  iconSize: [35, 35],
  iconAnchor: [17.5, 17.5],
  popupAnchor: [0, -17.5]
})

interface InteractiveMapProps {
  center: [number, number]
  zoom?: number
  restaurants?: Restaurant[]
  analysisResults?: LocationAnalysisResponse[]
  selectedLocation?: LocationCoordinates
  analysisRadius?: number
  onLocationSelect?: (location: LocationCoordinates) => void
  onRestaurantSelect?: (restaurant: Restaurant) => void
  className?: string
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (location: LocationCoordinates) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          name: `Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
        })
      }
    }
  })
  return null
}

export function InteractiveMap({
  center,
  zoom = 13,
  restaurants = [],
  analysisResults = [],
  selectedLocation,
  analysisRadius = 2,
  onLocationSelect,
  onRestaurantSelect,
  className = ''
}: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationSelect={onLocationSelect} />

        {/* Selected Location Marker */}
        {selectedLocation && (
          <>
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
              icon={analysisIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-blue-600">Selected Location</h3>
                  <p className="text-sm text-gray-600">{selectedLocation.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
            
            {/* Analysis Radius Circle */}
            <Circle
              center={[selectedLocation.latitude, selectedLocation.longitude]}
              radius={analysisRadius * 1000} // Convert km to meters
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}

        {/* Restaurant Markers */}
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.location.latitude, restaurant.location.longitude]}
            icon={restaurantIcon}
            eventHandlers={{
              click: () => onRestaurantSelect?.(restaurant)
            }}
          >
            <Popup>
              <Card className="w-64 border-0 shadow-none">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-red-600">{restaurant.name}</h3>
                      {restaurant.brand && (
                        <p className="text-sm text-gray-600">{restaurant.brand}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {restaurant.cuisine_types.slice(0, 3).map((cuisine) => (
                        <Badge key={cuisine} variant="secondary" className="text-xs">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p className="text-gray-600">{restaurant.location.address}</p>
                      <p className="text-gray-600">{restaurant.location.city}</p>
                      
                      {restaurant.distance_km && (
                        <p className="text-blue-600 font-medium">
                          {formatDistance(restaurant.distance_km)} away
                        </p>
                      )}
                      
                      {restaurant.average_rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{restaurant.average_rating.toFixed(1)}</span>
                          <span className="text-gray-500">({restaurant.total_reviews} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}

        {/* Analysis Results Markers */}
        {analysisResults.map((result, index) => (
          <Marker
            key={`analysis-${index}`}
            position={[result.location.latitude, result.location.longitude]}
            icon={analysisIcon}
          >
            <Popup>
              <Card className="w-80 border-0 shadow-none">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-blue-600">Location Analysis</h3>
                      <p className="text-xs text-gray-500">
                        {result.location.latitude.toFixed(4)}, {result.location.longitude.toFixed(4)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className={`font-bold ${getScoreColor(result.analysis.location_score.overall_score)}`}>
                          {result.analysis.location_score.overall_score.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Demographics</span>
                          <span className={getScoreColor(result.analysis.location_score.demographic_score)}>
                            {result.analysis.location_score.demographic_score.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Competition</span>
                          <span className={getScoreColor(result.analysis.location_score.competition_score)}>
                            {result.analysis.location_score.competition_score.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accessibility</span>
                          <span className={getScoreColor(result.analysis.location_score.accessibility_score)}>
                            {result.analysis.location_score.accessibility_score.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Potential</span>
                          <span className={getScoreColor(result.analysis.location_score.market_potential_score)}>
                            {result.analysis.location_score.market_potential_score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600">
                          <strong>Population:</strong> {result.analysis.demographic_analysis.estimated_population.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>Competitors:</strong> {result.analysis.competition_analysis.total_competitors}
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>Market Size:</strong> ${result.analysis.market_analysis.estimated_market_size.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}