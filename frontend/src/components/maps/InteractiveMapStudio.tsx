'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  MapPin,
  Layers,
  Search,
  Target,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Building,
  Car,
  Train,
  Coffee,
  ChefHat,
  Utensils,
  ShoppingBag,
  Zap,
  Clock,
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Share,
  Bookmark,
  Plus,
  Minus,
  Maximize,
  Navigation,
  MousePointer,
  Circle,
  Square,
  // Polygon, // Not available in lucide-react
  Trash2,
  Filter,
  Globe,
  Satellite,
  Map as MapIcon,
  Camera,
  Crosshair
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapLayer {
  id: string
  name: string
  type: 'heatmap' | 'points' | 'polygons' | 'lines'
  category: 'demographics' | 'traffic' | 'competition' | 'infrastructure'
  isVisible: boolean
  opacity: number
  color: string
  data: any[]
  description: string
  icon: React.ElementType
}

interface AnalysisResult {
  id: string
  location: { lat: number; lng: number; address: string }
  timestamp: Date
  metrics: {
    marketScore: number
    footTraffic: number
    competition: number
    accessibility: number
    demographics: number
  }
  insights: string[]
  recommendations: string[]
  riskFactors: string[]
  confidence: number
}

interface DrawingTool {
  id: string
  name: string
  icon: React.ElementType
  cursor: string
}

const MapLayerControl = ({ 
  layer, 
  onToggle, 
  onOpacityChange 
}: { 
  layer: MapLayer
  onToggle: (id: string) => void
  onOpacityChange: (id: string, opacity: number) => void
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group p-2 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors touch-manipulation"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`p-1.5 rounded-lg bg-${layer.color}-100 dark:bg-${layer.color}-900/20 shrink-0`}>
            <layer.icon className={`h-3 w-3 sm:h-4 sm:w-4 text-${layer.color}-600`} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate">{layer.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{layer.description}</p>
          </div>
        </div>
        
        <Switch
          checked={layer.isVisible}
          onCheckedChange={() => onToggle(layer.id)}
          className="shrink-0 mobile-touch-target"
        />
      </div>
      
      {layer.isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Opacity</span>
            <div className="flex-1">
              <Slider
                value={[layer.opacity]}
                onValueChange={([value]: number[]) => onOpacityChange(layer.id, value)}
                max={100}
                step={10}
                className="flex-1"
              />
            </div>
            <span>{layer.opacity}%</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

const AnalysisPanel = ({ 
  analysis, 
  onClose 
}: { 
  analysis: AnalysisResult
  onClose: () => void
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="absolute top-4 right-2 sm:right-4 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 touch-manipulation"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Location Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{analysis.location.address}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <span className="h-4 w-4">×</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {(analysis.confidence * 100).toFixed(0)}% Confidence
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            {analysis.timestamp.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(analysis.metrics).map(([key, value]) => (
            <div key={key} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {typeof value === 'number' ? value.toFixed(1) : value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div>
          <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Key Insights
          </h4>
          <ul className="space-y-1">
            {analysis.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Zap className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="h-3 w-3 text-blue-500 mt-1 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Factors */}
        {analysis.riskFactors.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Factors
            </h4>
            <ul className="space-y-1">
              {analysis.riskFactors.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <AlertTriangle className="h-3 w-3 text-orange-500 mt-1 shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button size="sm" variant="outline" className="flex-1">
            <Download className="h-3 w-3 mr-2" />
            Export
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Share className="h-3 w-3 mr-2" />
            Share
          </Button>
          <Button size="sm" variant="outline">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

const DrawingToolbar = ({ 
  activeTool, 
  onToolSelect 
}: { 
  activeTool: string | null
  onToolSelect: (toolId: string | null) => void
}) => {
  const tools: DrawingTool[] = [
    { id: 'pointer', name: 'Select', icon: MousePointer, cursor: 'default' },
    { id: 'circle', name: 'Circle', icon: Circle, cursor: 'crosshair' },
    { id: 'rectangle', name: 'Rectangle', icon: Square, cursor: 'crosshair' },
    { id: 'polygon', name: 'Polygon', icon: Square, cursor: 'crosshair' },
  ]

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1 z-40">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={activeTool === tool.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onToolSelect(activeTool === tool.id ? null : tool.id)}
          className="h-8 w-8 p-0"
          title={tool.name}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
      
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Clear all drawings">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function InteractiveMapStudio() {
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'restaurants',
      name: 'Restaurants',
      type: 'points',
      category: 'competition',
      isVisible: true,
      opacity: 80,
      color: 'red',
      data: [],
      description: 'Existing restaurant locations',
      icon: ChefHat
    },
    {
      id: 'foot-traffic',
      name: 'Foot Traffic',
      type: 'heatmap',
      category: 'traffic',
      isVisible: false,
      opacity: 60,
      color: 'blue',
      data: [],
      description: 'Pedestrian density heatmap',
      icon: Users
    },
    {
      id: 'demographics',
      name: 'Demographics',
      type: 'polygons',
      category: 'demographics',
      isVisible: false,
      opacity: 40,
      color: 'green',
      data: [],
      description: 'Population and income data',
      icon: Building
    },
    {
      id: 'transportation',
      name: 'Transportation',
      type: 'points',
      category: 'infrastructure',
      isVisible: false,
      opacity: 90,
      color: 'purple',
      data: [],
      description: 'Subway and bus stops',
      icon: Train
    },
    {
      id: 'retail',
      name: 'Retail Density',
      type: 'heatmap',
      category: 'competition',
      isVisible: false,
      opacity: 50,
      color: 'orange',
      data: [],
      description: 'Shopping and retail concentration',
      icon: ShoppingBag
    }
  ])

  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTool, setActiveTool] = useState<string | null>('pointer')
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [showLayers, setShowLayers] = useState(true)
  const [mapCenter] = useState({ lat: 40.7589, lng: -73.9851 }) // NYC coordinates
  const [zoom, setZoom] = useState(12)

  const mapRef = useRef<HTMLDivElement>(null)

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, isVisible: !layer.isVisible } : layer
    ))
  }, [])

  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, opacity } : layer
    ))
  }, [])

  const performLocationAnalysis = async (location: { lat: number; lng: number; address: string }) => {
    setIsAnalyzing(true)
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))
    
    const analysis: AnalysisResult = {
      id: Date.now().toString(),
      location,
      timestamp: new Date(),
      metrics: {
        marketScore: 7.2 + Math.random() * 2.8,
        footTraffic: 3500 + Math.random() * 2000,
        competition: 2.1 + Math.random() * 2.9,
        accessibility: 8.1 + Math.random() * 1.9,
        demographics: 6.8 + Math.random() * 3.2
      },
      insights: [
        "High foot traffic during lunch hours (11AM-2PM)",
        "Strong demographic match for casual dining",
        "Limited parking but excellent transit access",
        "Growing residential development in area"
      ],
      recommendations: [
        "Consider lunch-focused menu offerings",
        "Target 25-45 age demographic",
        "Leverage proximity to subway station",
        "Plan for seasonal variations in foot traffic"
      ],
      riskFactors: [
        "High commercial rent in prime locations",
        "Increasing competition from food trucks"
      ],
      confidence: 0.78 + Math.random() * 0.2
    }

    setCurrentAnalysis(analysis)
    setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
    setIsAnalyzing(false)
  }

  const handleMapClick = async (event: React.MouseEvent) => {
    if (activeTool !== 'pointer' || isAnalyzing) return

    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to lat/lng (simplified)
    const lat = mapCenter.lat + (rect.height / 2 - y) * 0.0001
    const lng = mapCenter.lng + (x - rect.width / 2) * 0.0001

    // Mock address lookup
    const address = `${Math.floor(Math.random() * 999) + 1} Example St, New York, NY`

    await performLocationAnalysis({ lat, lng, address })
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    // Mock geocoding
    const lat = mapCenter.lat + (Math.random() - 0.5) * 0.02
    const lng = mapCenter.lng + (Math.random() - 0.5) * 0.02

    await performLocationAnalysis({ lat, lng, address: searchQuery })
    setSearchQuery('')
  }

  const layersByCategory = layers.reduce((acc, layer) => {
    if (!acc[layer.category]) acc[layer.category] = []
    acc[layer.category].push(layer)
    return acc
  }, {} as Record<string, MapLayer[]>)

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 flex relative overflow-hidden">
      {/* Layers Sidebar */}
      <AnimatePresence>
        {showLayers && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto z-30"
          >
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Map Layers</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLayers(false)}
                    className="h-8 w-8 p-0"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Map Style */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Map Style</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'streets', name: 'Streets', icon: MapIcon },
                    { id: 'satellite', name: 'Satellite', icon: Satellite },
                    { id: 'terrain', name: 'Terrain', icon: Globe }
                  ].map((style) => (
                    <Button
                      key={style.id}
                      variant={mapStyle === style.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapStyle(style.id as any)}
                      className="flex flex-col h-16 p-2"
                    >
                      <style.icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{style.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Layer Categories */}
              {Object.entries(layersByCategory).map(([category, categoryLayers]) => (
                <div key={category}>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 capitalize flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="space-y-3">
                    {categoryLayers.map((layer) => (
                      <MapLayerControl
                        key={layer.id}
                        layer={layer}
                        onToggle={toggleLayer}
                        onOpacityChange={updateLayerOpacity}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Analysis History */}
              {analysisHistory.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Analysis</h3>
                  <div className="space-y-2">
                    {analysisHistory.slice(0, 5).map((analysis) => (
                      <button
                        key={analysis.id}
                        onClick={() => setCurrentAnalysis(analysis)}
                        className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          Score: {analysis.metrics.marketScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {analysis.location.address}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {analysis.timestamp.toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Show Layers Button */}
        {!showLayers && (
          <Button
            variant="secondary"
            onClick={() => setShowLayers(true)}
            className="absolute top-4 left-4 z-40 shadow-lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            Show Layers
          </Button>
        )}

        {/* Drawing Toolbar */}
        <DrawingToolbar activeTool={activeTool} onToolSelect={setActiveTool} />

        {/* Map Controls */}
        <div className="absolute bottom-4 left-4 space-y-2 z-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(prev => Math.min(prev + 1, 18))}>
              <Plus className="h-4 w-4" />
            </Button>
            <div className="h-px bg-gray-300 dark:bg-gray-600 my-1" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(prev => Math.max(prev - 1, 1))}>
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="secondary" size="sm" className="shadow-lg">
            <Navigation className="h-4 w-4 mr-2" />
            Recenter
          </Button>
        </div>

        {/* Click-to-Analyze Instruction */}
        <AnimatePresence>
          {activeTool === 'pointer' && !currentAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 border border-gray-200 dark:border-gray-700 z-30 pointer-events-none"
            >
              <div className="text-center">
                <Crosshair className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Click Anywhere to Analyze
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Click on any location on the map to get instant market analysis, 
                  foot traffic data, and location recommendations.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Analyzing Location
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Processing market data, foot traffic, demographics, and competition...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Canvas */}
        <div
          ref={mapRef}
          className="w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-blue-100 dark:from-blue-900/20 dark:via-green-900/10 dark:to-blue-900/20 relative overflow-hidden cursor-crosshair"
          onClick={handleMapClick}
          style={{ cursor: activeTool === 'pointer' ? 'crosshair' : 'default' }}
        >
          {/* Mock Map Grid */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full w-px bg-gray-200/30 dark:bg-gray-600/20" style={{ left: `${i * 5}%` }} />
            ))}
            {[...Array(20)].map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-gray-200/30 dark:bg-gray-600/20" style={{ top: `${i * 5}%` }} />
            ))}
          </div>

          {/* Mock Map Markers */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Map Attribution */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded">
            Interactive Map Studio • Click to analyze
          </div>
        </div>

        {/* Analysis Panel */}
        <AnimatePresence>
          {currentAnalysis && (
            <AnalysisPanel
              analysis={currentAnalysis}
              onClose={() => setCurrentAnalysis(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}