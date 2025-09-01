'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LocationCoordinates, LocationAnalysisResponse, Restaurant } from '@/types'
import { apiClient } from '@/lib/api-client'
import { formatNumber, formatCurrency, getScoreColor, getScoreBgColor } from '@/lib/utils'
import { Search, MapPin, TrendingUp, Users, Building, Car, Train, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface MarketResearchPanelProps {
  selectedLocation?: LocationCoordinates
  onLocationChange?: (location: LocationCoordinates) => void
  onAnalysisComplete?: (results: LocationAnalysisResponse) => void
  className?: string
}

export function MarketResearchPanel({
  selectedLocation,
  onLocationChange,
  onAnalysisComplete,
  className = ''
}: MarketResearchPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<LocationAnalysisResponse | null>(null)
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([])
  const [searchParams, setSearchParams] = useState({
    latitude: selectedLocation?.latitude || 40.7589,
    longitude: selectedLocation?.longitude || -73.9851,
    radius_km: 2,
    cuisine_types: [] as string[],
    category: ''
  })

  const cuisineOptions = [
    'italian', 'chinese', 'mexican', 'indian', 'japanese', 'american', 'french', 'thai', 'mediterranean', 'korean'
  ]

  const categoryOptions = [
    'fast_food', 'casual_dining', 'fine_dining', 'cafe', 'bar', 'food_truck', 'bakery', 'pizzeria'
  ]

  useEffect(() => {
    if (selectedLocation) {
      setSearchParams(prev => ({
        ...prev,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      }))
    }
  }, [selectedLocation])

  const handleLocationSearch = async () => {
    if (!searchParams.latitude || !searchParams.longitude) return

    const newLocation: LocationCoordinates = {
      latitude: searchParams.latitude,
      longitude: searchParams.longitude,
      name: `Location (${searchParams.latitude.toFixed(4)}, ${searchParams.longitude.toFixed(4)})`
    }

    onLocationChange?.(newLocation)
  }

  const handleAnalyzeLocation = async () => {
    if (!searchParams.latitude || !searchParams.longitude) return

    setIsAnalyzing(true)
    try {
      // Get location analysis
      const analysisResponse = await apiClient.locations.analyze({
        latitude: searchParams.latitude,
        longitude: searchParams.longitude,
        radius_km: searchParams.radius_km,
        cuisine_types: searchParams.cuisine_types.length > 0 ? searchParams.cuisine_types : undefined,
        category: searchParams.category || undefined
      })

      const typedResponse = analysisResponse as LocationAnalysisResponse
      setAnalysisResults(typedResponse)
      onAnalysisComplete?.(typedResponse)

      // Get nearby restaurants
      const restaurantsResponse = await apiClient.restaurants.nearby({
        latitude: searchParams.latitude,
        longitude: searchParams.longitude,
        radius_km: searchParams.radius_km,
        limit: 50
      })

      setNearbyRestaurants((restaurantsResponse as any)?.restaurants || [])
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleCuisine = (cuisine: string) => {
    setSearchParams(prev => ({
      ...prev,
      cuisine_types: prev.cuisine_types.includes(cuisine)
        ? prev.cuisine_types.filter(c => c !== cuisine)
        : [...prev.cuisine_types, cuisine]
    }))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Market Research Parameters
          </CardTitle>
          <CardDescription>
            Configure your location analysis parameters to generate comprehensive market insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Latitude</label>
              <Input
                type="number"
                step="0.0001"
                value={searchParams.latitude}
                onChange={(e) => setSearchParams(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                placeholder="40.7589"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Longitude</label>
              <Input
                type="number"
                step="0.0001"
                value={searchParams.longitude}
                onChange={(e) => setSearchParams(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                placeholder="-73.9851"
              />
            </div>
          </div>

          {/* Analysis Radius */}
          <div>
            <label className="text-sm font-medium mb-2 block">Analysis Radius (km)</label>
            <Input
              type="number"
              min="0.5"
              max="10"
              step="0.5"
              value={searchParams.radius_km}
              onChange={(e) => setSearchParams(prev => ({ ...prev, radius_km: parseFloat(e.target.value) || 2 }))}
            />
          </div>

          {/* Cuisine Types */}
          <div>
            <label className="text-sm font-medium mb-2 block">Target Cuisine Types</label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={searchParams.cuisine_types.includes(cuisine) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">Restaurant Category</label>
            <select
              className="w-full p-2 border rounded-md"
              value={searchParams.category}
              onChange={(e) => setSearchParams(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleLocationSearch} variant="outline" className="flex-1">
              <MapPin className="h-4 w-4 mr-2" />
              Update Location
            </Button>
            <Button 
              onClick={handleAnalyzeLocation} 
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Market
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Location Intelligence Score</span>
                <div className={`text-2xl font-bold ${getScoreColor(analysisResults.analysis.location_score.overall_score)}`}>
                  {analysisResults.analysis.location_score.overall_score.toFixed(1)}
                </div>
              </CardTitle>
              <CardDescription>
                Confidence Level: {analysisResults.analysis.location_score.confidence_level.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Demographics</span>
                    <span className={`font-semibold ${getScoreColor(analysisResults.analysis.location_score.demographic_score)}`}>
                      {analysisResults.analysis.location_score.demographic_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Competition</span>
                    <span className={`font-semibold ${getScoreColor(analysisResults.analysis.location_score.competition_score)}`}>
                      {analysisResults.analysis.location_score.competition_score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accessibility</span>
                    <span className={`font-semibold ${getScoreColor(analysisResults.analysis.location_score.accessibility_score)}`}>
                      {analysisResults.analysis.location_score.accessibility_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market Potential</span>
                    <span className={`font-semibold ${getScoreColor(analysisResults.analysis.location_score.market_potential_score)}`}>
                      {analysisResults.analysis.location_score.market_potential_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demographic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Population</span>
                    <span className="font-semibold">
                      {formatNumber(analysisResults.analysis.demographic_analysis.estimated_population)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Density</span>
                    <span className="font-semibold">
                      {formatNumber(analysisResults.analysis.demographic_analysis.population_density)}/km²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Median Income</span>
                    <span className="font-semibold">
                      {formatCurrency(analysisResults.analysis.demographic_analysis.median_income)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Age Distribution</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>25-34 (Prime)</span>
                      <span>{analysisResults.analysis.demographic_analysis.age_distribution['25-34']}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>35-44 (Family)</span>
                      <span>{analysisResults.analysis.demographic_analysis.age_distribution['35-44']}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>45-54 (Established)</span>
                      <span>{analysisResults.analysis.demographic_analysis.age_distribution['45-54']}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Competition Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Competitors</span>
                    <span className="font-semibold">
                      {analysisResults.analysis.competition_analysis.total_competitors}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Direct Competitors</span>
                    <span className="font-semibold">
                      {analysisResults.analysis.competition_analysis.direct_competitors}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Market Saturation</span>
                    <Badge variant={
                      analysisResults.analysis.competition_analysis.market_saturation === 'low' ? 'success' :
                      analysisResults.analysis.competition_analysis.market_saturation === 'medium' ? 'warning' : 'destructive'
                    }>
                      {analysisResults.analysis.competition_analysis.market_saturation}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Density</span>
                    <span className="font-semibold">
                      {analysisResults.analysis.competition_analysis.competition_density.toFixed(2)}/km²
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Accessibility Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResults.analysis.accessibility_analysis.transport_modes.walking.walkability_score}
                  </div>
                  <div className="text-sm text-gray-600">Walking Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResults.analysis.accessibility_analysis.transport_modes.transit.public_transport_score}
                  </div>
                  <div className="text-sm text-gray-600">Transit Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisResults.analysis.accessibility_analysis.transport_modes.driving.road_accessibility}
                  </div>
                  <div className="text-sm text-gray-600">Driving Score</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Grade</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {analysisResults.analysis.accessibility_analysis.accessibility_grade}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Market Size</span>
                    <span className="font-semibold">
                      {formatCurrency(analysisResults.analysis.market_analysis.estimated_market_size)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Purchasing Power</span>
                    <span className="font-semibold">
                      {formatCurrency(analysisResults.analysis.market_analysis.purchasing_power)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Market Diversity</span>
                    <span className="font-semibold">
                      {analysisResults.analysis.market_analysis.market_diversity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Opportunities</span>
                    <span className="font-semibold">
                      {analysisResults.analysis.market_analysis.cuisine_opportunities.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights & Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Key Insights
                </h4>
                <ul className="space-y-1">
                  {analysisResults.analysis.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {analysisResults.analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Assessment ({analysisResults.analysis.risk_assessment.risk_level.toUpperCase()})
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Risk Factors:</span>
                    <ul className="mt-1 space-y-1">
                      {analysisResults.analysis.risk_assessment.risk_factors.map((factor, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Mitigation Strategies:</span>
                    <ul className="mt-1 space-y-1">
                      {analysisResults.analysis.risk_assessment.mitigation_strategies.map((strategy, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Nearby Restaurants Summary */}
      {nearbyRestaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Nearby Restaurants ({nearbyRestaurants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nearbyRestaurants.slice(0, 5).map((restaurant) => (
                <div key={restaurant.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{restaurant.name}</div>
                    <div className="text-sm text-gray-600">
                      {restaurant.cuisine_types.slice(0, 2).join(', ')}
                      {restaurant.distance_km && ` • ${restaurant.distance_km.toFixed(1)}km`}
                    </div>
                  </div>
                  {restaurant.average_rating && (
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{restaurant.average_rating.toFixed(1)}</span>
                      </div>
                      <div className="text-xs text-gray-500">{restaurant.total_reviews} reviews</div>
                    </div>
                  )}
                </div>
              ))}
              {nearbyRestaurants.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  And {nearbyRestaurants.length - 5} more restaurants...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}