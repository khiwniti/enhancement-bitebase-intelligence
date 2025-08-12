'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Users,
  Thermometer,
  Target,
  Layers,
  Filter,
  Download,
  Maximize2,
  Navigation,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface HeatmapPoint {
  id: string
  lat: number
  lng: number
  intensity: number
  customer_count: number
  time_period: string
  demographic_info?: {
    age_group: string
    income_level: string
    visit_frequency: number
  }
  address?: string
}

interface HeatmapLayer {
  id: string
  name: string
  color: string
  visible: boolean
  data: HeatmapPoint[]
}

interface InteractiveHeatmapProps {
  restaurantLocation: { lat: number; lng: number }
  heatmapData: HeatmapPoint[]
  className?: string
  height?: number
  showControls?: boolean
}

export function InteractiveHeatmap({
  restaurantLocation,
  heatmapData,
  className = "",
  height = 500,
  showControls = true
}: InteractiveHeatmapProps) {
  const [selectedPoint, setSelectedPoint] = useState<HeatmapPoint | null>(null)
  const [activeLayer, setActiveLayer] = useState<string>('density')
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [intensityFilter, setIntensityFilter] = useState<[number, number]>([0, 100])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Generate mock layers for demo
  const layers: HeatmapLayer[] = [
    {
      id: 'density',
      name: 'Customer Density',
      color: '#3B82F6',
      visible: true,
      data: heatmapData
    },
    {
      id: 'revenue',
      name: 'Revenue Hotspots',
      color: '#10B981',
      visible: false,
      data: heatmapData.map(point => ({
        ...point,
        intensity: point.intensity * 0.8 + Math.random() * 20
      }))
    },
    {
      id: 'demographics',
      name: 'Demographics',
      color: '#F59E0B',
      visible: false,
      data: heatmapData.filter(point => point.demographic_info)
    }
  ]

  const [visibleLayers, setVisibleLayers] = useState<HeatmapLayer[]>(layers)

  // Filter data based on current filters
  const filteredData = visibleLayers
    .filter(layer => layer.visible)
    .flatMap(layer => layer.data)
    .filter(point => {
      const timeMatch = timeFilter === 'all' || point.time_period.includes(timeFilter)
      const intensityMatch = point.intensity >= intensityFilter[0] && point.intensity <= intensityFilter[1]
      return timeMatch && intensityMatch
    })

  const getIntensityColor = (intensity: number, layerColor: string = '#3B82F6') => {
    const opacity = Math.max(0.3, intensity / 100)
    const hex = layerColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  const getIntensitySize = (intensity: number) => {
    return Math.max(8, (intensity / 100) * 24)
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 80) return 'Very High'
    if (intensity >= 60) return 'High'
    if (intensity >= 40) return 'Medium'
    if (intensity >= 20) return 'Low'
    return 'Very Low'
  }

  const toggleLayer = (layerId: string) => {
    setVisibleLayers(prev =>
      prev.map(layer =>
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    )
  }

  const calculateStats = () => {
    const totalPoints = filteredData.length
    const avgIntensity = totalPoints > 0 
      ? filteredData.reduce((sum, point) => sum + point.intensity, 0) / totalPoints 
      : 0
    const hotspots = filteredData.filter(point => point.intensity >= 70).length
    const coverage = totalPoints > 0 ? (hotspots / totalPoints) * 100 : 0

    return {
      totalPoints,
      avgIntensity,
      hotspots,
      coverage
    }
  }

  const stats = calculateStats()

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>Customer Density Heatmap</span>
            </CardTitle>
            <CardDescription>
              Interactive visualization of customer distribution and activity patterns
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
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
            <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
            <div className="text-xs text-gray-600">Data Points</div>
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
            <div className="text-2xl font-bold text-purple-600">{stats.coverage.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Coverage</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Controls Panel */}
          {showControls && (
            <div className="lg:w-64 space-y-4">
              {/* Layer Controls */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  Layers
                </h4>
                <div className="space-y-2">
                  {visibleLayers.map((layer) => (
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
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Period
                </h4>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Times</option>
                  <option value="morning">Morning (6-12)</option>
                  <option value="afternoon">Afternoon (12-18)</option>
                  <option value="evening">Evening (18-24)</option>
                </select>
              </div>

              {/* Intensity Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Thermometer className="h-4 w-4 mr-2" />
                  Intensity Range
                </h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensityFilter[0]}
                    onChange={(e) => setIntensityFilter([parseInt(e.target.value), intensityFilter[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensityFilter[1]}
                    onChange={(e) => setIntensityFilter([intensityFilter[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{intensityFilter[0]}%</span>
                    <span>{intensityFilter[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Intensity Legend</h4>
                <div className="space-y-1">
                  {[
                    { range: '80-100%', color: 'bg-red-500', label: 'Very High' },
                    { range: '60-79%', color: 'bg-orange-500', label: 'High' },
                    { range: '40-59%', color: 'bg-yellow-500', label: 'Medium' },
                    { range: '20-39%', color: 'bg-blue-500', label: 'Low' },
                    { range: '0-19%', color: 'bg-green-500', label: 'Very Low' }
                  ].map((item) => (
                    <div key={item.range} className="flex items-center space-x-2 text-xs">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-gray-600">{item.label}</span>
                      <span className="text-gray-400">({item.range})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1">
            <div 
              ref={mapContainerRef}
              className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
              style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}
            >
              {/* Mock Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                {/* Grid Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Restaurant Location */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <MapPin className="h-3 w-3 text-white" />
                </motion.div>

                {/* Heatmap Points */}
                <AnimatePresence>
                  {filteredData.map((point, index) => {
                    const layer = visibleLayers.find(l => l.data.includes(point))
                    const size = getIntensitySize(point.intensity)
                    const color = getIntensityColor(point.intensity, layer?.color)
                    
                    return (
                      <motion.div
                        key={`${point.id}-${index}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="absolute rounded-full cursor-pointer hover:scale-110 transition-transform"
                        style={{
                          width: size,
                          height: size,
                          backgroundColor: color,
                          left: `${20 + (index % 10) * 8}%`,
                          top: `${20 + Math.floor(index / 10) * 8}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => setSelectedPoint(point)}
                        title={`${point.customer_count} customers - ${getIntensityLabel(point.intensity)} intensity`}
                      />
                    )
                  })}
                </AnimatePresence>

                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center shadow-lg">
                    <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Interactive Heatmap</p>
                    <p className="text-sm text-gray-500">
                      Real map integration with Mapbox/Google Maps
                    </p>
                  </div>
                </div>
              </div>

              {/* Point Detail Popup */}
              <AnimatePresence>
                {selectedPoint && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10"
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
                        <Badge className={
                          selectedPoint.intensity >= 70 ? 'bg-red-100 text-red-800' :
                          selectedPoint.intensity >= 40 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {getIntensityLabel(selectedPoint.intensity)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedPoint.time_period}</span>
                      </div>
                      {selectedPoint.demographic_info && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age Group:</span>
                            <span className="font-medium">{selectedPoint.demographic_info.age_group}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Income:</span>
                            <span className="font-medium">{selectedPoint.demographic_info.income_level}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
