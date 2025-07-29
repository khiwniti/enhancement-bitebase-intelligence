'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LocationCoordinates, LocationAnalysisResponse, Restaurant } from '@/types'
import { apiClient } from '@/lib/api-client'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { 
  MapPin, 
  Layers, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  Building, 
  DollarSign,
  Eye,
  EyeOff,
  RotateCcw,
  Maximize2,
  Filter,
  Search,
  Crosshair
} from 'lucide-react'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false })

interface DataLayer {
  id: string
  name: string
  type: 'restaurants' | 'demographics' | 'competition' | 'opportunities' | 'heatmap'
  visible: boolean
  color: string
  data?: any[]
}

interface EnhancedInteractiveMapProps {
  center: [number, number]
  zoom?: number
  restaurants: Restaurant[]
  analysisResults: LocationAnalysisResponse[]
  selectedLocation?: LocationCoordinates
  analysisRadius?: number
  onLocationSelect?: (location: LocationCoordinates) => void
  onRestaurantSelect?: (restaurant: Restaurant) => void
  onMapClick?: (coordinates: LocationCoordinates) => void
  className?: string
}

export function EnhancedInteractiveMap({
  center,
  zoom = 13,
  restaurants,
  analysisResults,
  selectedLocation,
  analysisRadius = 2,
  onLocationSelect,
  onRestaurantSelect,
  onMapClick,
  className = ''
}: EnhancedInteractiveMapProps) {
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [clickAnalysis, setClickAnalysis] = useState<LocationAnalysisResponse | null>(null)
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([
    { id: 'restaurants', name: 'Restaurants', type: 'restaurants', visible: true, color: '#22c55e' },
    { id: 'demographics', name: 'Demographics', type: 'demographics', visible: false, color: '#3b82f6' },
    { id: 'competition', name: 'Competition Heat', type: 'competition', visible: false, color: '#ef4444' },
    { id: 'opportunities', name: 'Opportunities', type: 'opportunities', visible: false, color: '#f59e0b' }
  ])
  const [mapMode, setMapMode] = useState<'explore' | 'analyze' | 'compare'>('explore')
  const [comparisonLocations, setComparisonLocations] = useState<LocationCoordinates[]>([])

  // Handle map click for instant analysis
  const handleMapClick = async (event: any) => {
    if (mapMode !== 'analyze') return

    const { lat, lng } = event.latlng
    const clickedLocation: LocationCoordinates = {
      latitude: lat,
      longitude: lng,
      name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    }

    setIsAnalyzing(true)
    try {
      // Instant location analysis
      const analysis = await apiClient.locations.analyze({
        latitude: lat,
        longitude: lng,
        radius_km: analysisRadius
      })

      setClickAnalysis(analysis as LocationAnalysisResponse)
      onLocationSelect?.(clickedLocation)
      onMapClick?.(clickedLocation)
    } catch (error) {
      console.error('Failed to analyze clicked location:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Toggle data layer visibility
  const toggleDataLayer = (layerId: string) => {
    setDataLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ))
  }

  // Reset map view
  const resetMapView = () => {
    if (mapInstance) {
      mapInstance.setView(center, zoom)
    }
  }

  // Switch map modes
  const switchMapMode = (mode: 'explore' | 'analyze' | 'compare') => {
    setMapMode(mode)
    if (mode === 'compare') {
      setComparisonLocations([])
    }
  }

  // Get restaurant marker color based on rating
  const getRestaurantMarkerColor = (restaurant: Restaurant): string => {
    if (!restaurant.average_rating) return '#6b7280'
    if (restaurant.average_rating >= 4.5) return '#22c55e'
    if (restaurant.average_rating >= 4.0) return '#84cc16'
    if (restaurant.average_rating >= 3.5) return '#f59e0b'
    return '#ef4444'
  }

  // Create custom marker icons
  const createCustomIcon = (color: string, icon: string) => {
    if (typeof window === 'undefined') return null
    
    const L = require('leaflet')
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          ${icon}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      <Card className="card-dark">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Interactive Map Analytics
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Zap className="h-3 w-3 mr-1" />
                  Click to Analyze
                </Badge>
              </CardTitle>
              <CardDescription>
                {mapMode === 'explore' && 'Explore restaurants and market data'}
                {mapMode === 'analyze' && 'Click anywhere on the map for instant location analysis'}
                {mapMode === 'compare' && 'Select multiple locations to compare side-by-side'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={mapMode === 'explore' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchMapMode('explore')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Explore
              </Button>
              <Button
                variant={mapMode === 'analyze' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchMapMode('analyze')}
                className={mapMode === 'analyze' ? 'btn-primary' : ''}
              >
                <Crosshair className="h-4 w-4 mr-2" />
                Analyze
              </Button>
              <Button
                variant={mapMode === 'compare' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchMapMode('compare')}
              >
                <Target className="h-4 w-4 mr-2" />
                Compare
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {/* Data Layer Controls */}
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Data Layers:</span>
              {dataLayers.map((layer) => (
                <Button
                  key={layer.id}
                  variant={layer.visible ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDataLayer(layer.id)}
                  className="text-xs"
                  style={layer.visible ? { backgroundColor: layer.color, borderColor: layer.color } : {}}
                >
                  {layer.visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                  {layer.name}
                </Button>
              ))}
            </div>

            {/* Map Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetMapView}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="card-dark overflow-hidden">
        <div className="relative h-[600px]">
          {/* Loading Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
              <div className="flex items-center gap-3 bg-card p-4 rounded-lg border border-border">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm font-medium">Analyzing location...</span>
              </div>
            </div>
          )}

          {/* Map Mode Indicator */}
          <div className="absolute top-4 left-4 z-[1000]">
            <Badge variant="outline" className={`
              ${mapMode === 'analyze' ? 'bg-primary/10 text-primary border-primary/20' : 
                mapMode === 'compare' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                'bg-muted/10 text-muted-foreground border-muted/20'}
            `}>
              {mapMode === 'explore' && <Eye className="h-3 w-3 mr-1" />}
              {mapMode === 'analyze' && <Crosshair className="h-3 w-3 mr-1" />}
              {mapMode === 'compare' && <Target className="h-3 w-3 mr-1" />}
              {mapMode.charAt(0).toUpperCase() + mapMode.slice(1)} Mode
            </Badge>
          </div>

          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            ref={(mapRef) => {
              if (mapRef) {
                setMapInstance(mapRef)
              }
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Analysis Radius Circle */}
            {selectedLocation && (
              <Circle
                center={[selectedLocation.latitude, selectedLocation.longitude]}
                radius={analysisRadius * 1000} // Convert km to meters
                pathOptions={{
                  color: '#22c55e',
                  fillColor: '#22c55e',
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            )}

            {/* Restaurant Markers */}
            {dataLayers.find(l => l.id === 'restaurants')?.visible && restaurants.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={[restaurant.location.latitude, restaurant.location.longitude]}
                icon={createCustomIcon(getRestaurantMarkerColor(restaurant), '🍽️')}
                eventHandlers={{
                  click: () => onRestaurantSelect?.(restaurant)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-foreground mb-2">{restaurant.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span>{restaurant.cuisine_types.slice(0, 2).join(', ')}</span>
                      </div>
                      {restaurant.average_rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">★</span>
                          <span>{restaurant.average_rating.toFixed(1)} ({restaurant.total_reviews} reviews)</span>
                        </div>
                      )}
                      {restaurant.distance_km && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{restaurant.distance_km.toFixed(1)}km away</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {restaurant.location.address}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Analysis Result Markers */}
            {analysisResults.map((result, index) => (
              <Marker
                key={`analysis-${index}`}
                position={[result.location.latitude, result.location.longitude]}
                icon={createCustomIcon('#3b82f6', '📊')}
              >
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <h3 className="font-semibold text-foreground mb-3">Location Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overall Score</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {result.analysis.location_score.overall_score.toFixed(1)}/10
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Population</span>
                        <span className="text-sm font-medium">
                          {formatNumber(result.analysis.demographic_analysis.estimated_population)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Competitors</span>
                        <span className="text-sm font-medium">
                          {result.analysis.competition_analysis.total_competitors}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Market Size</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(result.analysis.market_analysis.estimated_market_size)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Click Analysis Marker */}
            {clickAnalysis && (
              <Marker
                position={[clickAnalysis.location.latitude, clickAnalysis.location.longitude]}
                icon={createCustomIcon('#f59e0b', '⚡')}
              >
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Instant Analysis
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Market Score</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {clickAnalysis.analysis.location_score.overall_score.toFixed(1)}/10
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-500/10 rounded">
                          <div className="font-semibold text-blue-400">
                            {formatNumber(clickAnalysis.analysis.demographic_analysis.estimated_population)}
                          </div>
                          <div className="text-muted-foreground">Population</div>
                        </div>
                        <div className="text-center p-2 bg-orange-500/10 rounded">
                          <div className="font-semibold text-orange-400">
                            {clickAnalysis.analysis.competition_analysis.total_competitors}
                          </div>
                          <div className="text-muted-foreground">Competitors</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Map Click Handler */}
            <div onClick={handleMapClick} style={{ position: 'absolute', inset: 0, zIndex: 1000, pointerEvents: mapMode === 'analyze' ? 'auto' : 'none' }} />
          </MapContainer>
        </div>
      </Card>

      {/* Quick Analysis Results */}
      {clickAnalysis && (
        <Card className="card-dark border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Instant Location Analysis
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Score: {clickAnalysis.analysis.location_score.overall_score.toFixed(1)}/10
              </Badge>
            </CardTitle>
            <CardDescription>
              AI-powered analysis of clicked location ({clickAnalysis.location.latitude.toFixed(4)}, {clickAnalysis.location.longitude.toFixed(4)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-xl font-bold text-primary">
                  {clickAnalysis.analysis.location_score.overall_score.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-xl font-bold text-blue-400">
                  {formatNumber(clickAnalysis.analysis.demographic_analysis.estimated_population)}
                </div>
                <div className="text-xs text-muted-foreground">Population</div>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                <div className="text-xl font-bold text-orange-400">
                  {clickAnalysis.analysis.competition_analysis.total_competitors}
                </div>
                <div className="text-xs text-muted-foreground">Competitors</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-xl font-bold text-green-400">
                  {formatCurrency(clickAnalysis.analysis.market_analysis.estimated_market_size)}
                </div>
                <div className="text-xs text-muted-foreground">Market Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}