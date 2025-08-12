'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Users,
  Layers,
  Navigation,
  Maximize2,
  Download,
  Settings,
  Target,
  Thermometer,
  Clock,
  Filter
} from 'lucide-react'

// Mock Mapbox implementation for demo (would use real Mapbox in production)
interface MapboxHeatmapProps {
  restaurantLocation: { lat: number; lng: number }
  heatmapData: Array<{
    id: string
    lat: number
    lng: number
    intensity: number
    customer_count: number
    time_period: string
    demographic_info?: any
  }>
  className?: string
  height?: number
}

interface MapLayer {
  id: string
  name: string
  type: 'heatmap' | 'circle' | 'cluster'
  visible: boolean
  color: string
  data: any[]
}

export function MapboxHeatmap({
  restaurantLocation,
  heatmapData,
  className = "",
  height = 600
}: MapboxHeatmapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<any>(null)
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets')
  const [zoom, setZoom] = useState(13)
  const [center, setCenter] = useState(restaurantLocation)

  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'customer-heatmap',
      name: 'Customer Density',
      type: 'heatmap',
      visible: true,
      color: '#3B82F6',
      data: heatmapData
    },
    {
      id: 'revenue-points',
      name: 'Revenue Hotspots',
      type: 'circle',
      visible: false,
      color: '#10B981',
      data: heatmapData.filter(p => p.intensity > 60)
    },
    {
      id: 'customer-clusters',
      name: 'Customer Clusters',
      type: 'cluster',
      visible: false,
      color: '#F59E0B',
      data: heatmapData
    }
  ])

  // Mock Mapbox initialization
  useEffect(() => {
    const initializeMap = async () => {
      // In production, this would initialize real Mapbox GL JS
      console.log('Initializing Mapbox with access token...')
      
      // Simulate map loading
      setTimeout(() => {
        setIsLoaded(true)
      }, 1000)
    }

    initializeMap()
  }, [])

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ))
  }, [])

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return '#EF4444' // red-500
    if (intensity >= 60) return '#F97316' // orange-500
    if (intensity >= 40) return '#EAB308' // yellow-500
    if (intensity >= 20) return '#3B82F6' // blue-500
    return '#10B981' // green-500
  }

  const getPointSize = (intensity: number) => {
    return Math.max(6, (intensity / 100) * 20)
  }

  const calculateStats = () => {
    const visibleData = layers
      .filter(layer => layer.visible)
      .flatMap(layer => layer.data)
    
    const totalCustomers = visibleData.reduce((sum, point) => sum + point.customer_count, 0)
    const avgIntensity = visibleData.length > 0 
      ? visibleData.reduce((sum, point) => sum + point.intensity, 0) / visibleData.length 
      : 0
    const hotspots = visibleData.filter(point => point.intensity >= 70).length
    
    return {
      totalCustomers,
      avgIntensity,
      hotspots,
      dataPoints: visibleData.length
    }
  }

  const stats = calculateStats()

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>Geographic Intelligence</span>
            </CardTitle>
            <CardDescription>
              Real-time customer density and revenue mapping powered by Mapbox
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
            <div className="text-xs text-gray-600">Total Customers</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.avgIntensity.toFixed(1)}</div>
            <div className="text-xs text-gray-600">Avg Intensity</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.hotspots}</div>
            <div className="text-xs text-gray-600">Hotspots</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.dataPoints}</div>
            <div className="text-xs text-gray-600">Data Points</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Map Controls */}
          <div className="lg:w-64 space-y-4">
            {/* Map Style */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Layers className="h-4 w-4 mr-2" />
                Map Style
              </h4>
              <div className="grid grid-cols-3 gap-1">
                {(['streets', 'satellite', 'dark'] as const).map((style) => (
                  <Button
                    key={style}
                    variant={mapStyle === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMapStyle(style)}
                    className="text-xs"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>

            {/* Layer Controls */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Data Layers
              </h4>
              <div className="space-y-2">
                {layers.map((layer) => (
                  <label key={layer.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleLayer(layer.id)}
                      className="rounded"
                    />
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: layer.color }}
                    />
                    <span>{layer.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {layer.type}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* Map Controls */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Navigation className="h-4 w-4 mr-2" />
                Navigation
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Zoom:</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setZoom(Math.max(1, zoom - 1))}
                    >
                      -
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{zoom}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setZoom(Math.min(20, zoom + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setCenter(restaurantLocation)
                    setZoom(13)
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Center on Restaurant
                </Button>
              </div>
            </div>

            {/* Legend */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Intensity Scale</h4>
              <div className="space-y-1">
                {[
                  { range: '80-100%', color: '#EF4444', label: 'Very High' },
                  { range: '60-79%', color: '#F97316', label: 'High' },
                  { range: '40-59%', color: '#EAB308', label: 'Medium' },
                  { range: '20-39%', color: '#3B82F6', label: 'Low' },
                  { range: '0-19%', color: '#10B981', label: 'Very Low' }
                ].map((item) => (
                  <div key={item.range} className="flex items-center space-x-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-gray-400">({item.range})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1">
            <div 
              ref={mapContainerRef}
              className="relative rounded-lg overflow-hidden border border-gray-200"
              style={{ height }}
            >
              {!isLoaded ? (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading Mapbox...</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Mock Mapbox Container */}
                  <div className={`absolute inset-0 ${
                    mapStyle === 'satellite' ? 'bg-green-900' :
                    mapStyle === 'dark' ? 'bg-gray-900' :
                    'bg-gray-100'
                  }`}>
                    {/* Mock map tiles pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-20">
                      <defs>
                        <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#mapGrid)" />
                    </svg>

                    {/* Restaurant Location */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-20"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <MapPin className="h-4 w-4 text-white" />
                    </motion.div>

                    {/* Heatmap Points */}
                    {layers
                      .filter(layer => layer.visible)
                      .flatMap(layer => layer.data)
                      .map((point, index) => {
                        const size = getPointSize(point.intensity)
                        const color = getIntensityColor(point.intensity)
                        
                        return (
                          <motion.div
                            key={`${point.id}-${index}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 0.7, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className="absolute rounded-full cursor-pointer hover:scale-110 transition-transform z-10"
                            style={{
                              width: size,
                              height: size,
                              backgroundColor: color,
                              left: `${30 + (index % 8) * 10}%`,
                              top: `${25 + Math.floor(index / 8) * 12}%`,
                              transform: 'translate(-50%, -50%)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                            onClick={() => setSelectedPoint(point)}
                          />
                        )
                      })}

                    {/* Mapbox Attribution */}
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
                      © Mapbox © OpenStreetMap
                    </div>

                    {/* Demo Notice */}
                    <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Demo Mode - Real Mapbox Integration Ready
                    </div>
                  </div>

                  {/* Point Detail Popup */}
                  {selectedPoint && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Location Details</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPoint(null)}
                        >
                          ×
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customers:</span>
                          <span className="font-medium">{selectedPoint.customer_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Intensity:</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {selectedPoint.intensity.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{selectedPoint.time_period}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
