'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import { LocationCoordinates, Restaurant, LocationAnalysisResponse } from '@/types'

// Dynamic import for client-side only map component
const InteractiveMap = dynamic(() => import('./InteractiveMap').then(mod => ({ default: mod.InteractiveMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700">Loading Interactive Map...</h3>
          <p className="text-slate-500 text-sm">Initializing geospatial analytics</p>
        </div>
      </div>
    </div>
  )
})
import {
  MapPin,
  Target,
  Layers,
  Filter,
  Download,
  Share,
  RefreshCw,
  Maximize2,
  Search,
  Plus,
  TrendingUp,
  Building,
  Crosshair,
  Zap
} from 'lucide-react'

export function LocationIntelligencePage() {
  const [selectedLayer, setSelectedLayer] = useState('restaurants')
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.7563, 100.5018]) // Bangkok center
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null)
  const [analysisRadius, setAnalysisRadius] = useState(2.0) // km
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([])
  const [analysisResults, setAnalysisResults] = useState<LocationAnalysisResponse[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false)

  const mapLayers = [
    { id: 'restaurants', label: 'Restaurants', count: 2847, color: 'bg-blue-500' },
    { id: 'competitors', label: 'Competitors', count: 1234, color: 'bg-red-500' },
    { id: 'demographics', label: 'Demographics', count: 156, color: 'bg-green-500' },
    { id: 'traffic', label: 'Traffic Patterns', count: 89, color: 'bg-purple-500' }
  ]

  // Load nearby restaurants when location is selected
  const loadNearbyRestaurants = async (location: LocationCoordinates) => {
    if (!location) return

    setIsLoadingRestaurants(true)
    try {
      const response = await apiClient.restaurants.nearby({
        latitude: location.latitude,
        longitude: location.longitude,
        radius_km: analysisRadius,
        limit: 100
      }) as { restaurants: Restaurant[] }
      setNearbyRestaurants(response.restaurants || [])
    } catch (error) {
      console.error('Failed to load nearby restaurants:', error)
      setNearbyRestaurants([])
    } finally {
      setIsLoadingRestaurants(false)
    }
  }

  // Perform location analysis
  const analyzeLocation = async (location: LocationCoordinates) => {
    if (!location) return

    setIsAnalyzing(true)
    try {
      const response = await apiClient.locations.analyze({
        latitude: location.latitude,
        longitude: location.longitude,
        radius_km: analysisRadius
      }) as LocationAnalysisResponse
      setAnalysisResults(prev => [response, ...prev.slice(0, 4)]) // Keep last 5 analyses
    } catch (error) {
      console.error('Failed to analyze location:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle location selection from map
  const handleLocationSelect = async (location: LocationCoordinates) => {
    setSelectedLocation(location)
    await Promise.all([
      loadNearbyRestaurants(location),
      analyzeLocation(location)
    ])
  }

  // Handle radius change
  const handleRadiusChange = (newRadius: number[]) => {
    setAnalysisRadius(newRadius[0])
    if (selectedLocation) {
      loadNearbyRestaurants(selectedLocation)
    }
  }

  const insights = [
    {
      id: '1',
      title: 'High Opportunity Zone',
      location: 'Sukhumvit Soi 11',
      score: 92,
      type: 'opportunity',
      metrics: { footTraffic: '+45%', competition: 'Low', avgRevenue: '฿67,500' }
    },
    {
      id: '2',
      title: 'Saturated Market',
      location: 'Siam Square',
      score: 34,
      type: 'warning',
      metrics: { footTraffic: '+12%', competition: 'High', avgRevenue: '฿34,200' }
    },
    {
      id: '3',
      title: 'Emerging Area',
      location: 'Thonglor District',
      score: 78,
      type: 'emerging',
      metrics: { footTraffic: '+67%', competition: 'Medium', avgRevenue: '฿52,800' }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Location Intelligence</h1>
          <p className="text-slate-600 mt-1">
            Interactive map analytics for restaurant market research
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Layers className="w-5 h-5 mr-2 text-blue-600" />
                Map Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mapLayers.map((layer) => (
                <div
                  key={layer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedLayer === layer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                      <span className="font-medium text-sm">{layer.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {layer.count}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Analyze Bangkok center
                  const bangkokCenter = { latitude: 13.7563, longitude: 100.5018, name: 'Bangkok Center' }
                  handleLocationSelect(bangkokCenter)
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Analyze Bangkok Center
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Analyze Sukhumvit area
                  const sukhumvit = { latitude: 13.7307, longitude: 100.5418, name: 'Sukhumvit' }
                  handleLocationSelect(sukhumvit)
                }}
              >
                <Building className="w-4 h-4 mr-2" />
                Analyze Sukhumvit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Analyze Siam area
                  const siam = { latitude: 13.7459, longitude: 100.5340, name: 'Siam Square' }
                  handleLocationSelect(siam)
                }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze Siam Square
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled={analysisResults.length === 0}
                onClick={() => {
                  if (analysisResults.length > 0) {
                    console.log('Exporting analysis results:', analysisResults)
                    // In a real app, this would trigger a PDF/CSV export
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report ({analysisResults.length})
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Map */}
        <div className="lg:col-span-3">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 h-[600px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Interactive Map Dashboard
                  {isAnalyzing && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200">
                      <Zap className="w-3 h-3 mr-1" />
                      Analyzing...
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLocation(null)}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Buffer Radius Controls */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Crosshair className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Analysis Radius:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={analysisRadius}
                    onChange={(e) => handleRadiusChange([parseFloat(e.target.value)])}
                    className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 min-w-[3rem]">{analysisRadius} km</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  {nearbyRestaurants.length} restaurants
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-full pb-6">
              <div className="w-full h-[480px]">
                <InteractiveMap
                  center={mapCenter}
                  zoom={13}
                  restaurants={nearbyRestaurants}
                  analysisResults={analysisResults}
                  selectedLocation={selectedLocation || undefined}
                  analysisRadius={analysisRadius}
                  onLocationSelect={handleLocationSelect}
                  onRestaurantSelect={(restaurant) => console.log('Selected restaurant:', restaurant)}
                  className="h-full w-full rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-time Analysis Results */}
      {analysisResults.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Real-time Analysis Results</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysisResults.slice(0, 2).map((result, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-slate-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Location Analysis</span>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Score: {Math.round(result.analysis.location_score.overall_score)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Lat: {result.location.latitude.toFixed(4)}, Lng: {result.location.longitude.toFixed(4)}
                    ({result.location.radius_km}km radius)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Demographics:</span>
                        <span className="font-medium">{Math.round(result.analysis.location_score.demographic_score)}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Competition:</span>
                        <span className="font-medium">{Math.round(result.analysis.location_score.competition_score)}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Accessibility:</span>
                        <span className="font-medium">{Math.round(result.analysis.location_score.accessibility_score)}/100</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Market Potential:</span>
                        <span className="font-medium">{Math.round(result.analysis.location_score.market_potential_score)}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Population:</span>
                        <span className="font-medium">{result.analysis.demographic_analysis.estimated_population.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Competitors:</span>
                        <span className="font-medium">{result.analysis.competition_analysis.total_competitors}</span>
                      </div>
                    </div>
                  </div>
                  {result.analysis.insights.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Key Insights:</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {result.analysis.insights.slice(0, 3).map((insight, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Location Insights */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Sample Location Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={insight.type === 'opportunity' ? 'default' : insight.type === 'warning' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {insight.type}
                  </Badge>
                  <span className="text-2xl font-bold text-slate-900">{insight.score}</span>
                </div>
                <CardTitle className="text-lg">{insight.title}</CardTitle>
                <CardDescription>{insight.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Foot Traffic:</span>
                    <span className="font-medium">{insight.metrics.footTraffic}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Competition:</span>
                    <span className="font-medium">{insight.metrics.competition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg Revenue:</span>
                    <span className="font-medium">{insight.metrics.avgRevenue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
