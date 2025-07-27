'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarketReportAgent } from '../interactive/MarketReportAgent'
import { EnhancedInteractiveMap } from '../interactive/EnhancedInteractiveMap'
import { MarketResearchPanel } from '../location/MarketResearchPanel'
import { EnhancedAnalytics } from './EnhancedAnalytics'
import { RealTimeMonitoring } from './RealTimeMonitoring'
import { DashboardSettings } from './DashboardSettings'
import { DataExportImport } from './DataExportImport'
import { LocationCoordinates, LocationAnalysisResponse, Restaurant } from '@/types'
import { apiClient } from '@/lib/api-client'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { 
  LayoutDashboard,
  Brain,
  MapPin,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  Activity,
  Bell,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Share,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Eye,
  EyeOff,
  Utensils,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Grid3X3,
  List,
  Sidebar,
  Layers,
  Navigation
} from 'lucide-react'

interface DashboardWidget {
  id: string
  type: 'market-agent' | 'interactive-map' | 'research-panel' | 'analytics' | 'metrics' | 'insights' | 'explorer'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  position: { x: number; y: number }
  visible: boolean
  data?: any
}

interface DashboardStats {
  totalAnalyses: number
  activeLocations: number
  marketScore: number
  revenueProjection: number
  competitorCount: number
  opportunityRating: number
}

interface ImprovedUnifiedDashboardProps {
  className?: string
}

export function ImprovedUnifiedDashboard({ className = '' }: ImprovedUnifiedDashboardProps) {
  // Core state management
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>({
    latitude: 40.7589,
    longitude: -73.9851,
    name: 'Times Square, NYC'
  })
  const [analysisResults, setAnalysisResults] = useState<LocationAnalysisResponse[]>([])
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    activeLocations: 0,
    marketScore: 0,
    revenueProjection: 0,
    competitorCount: 0,
    opportunityRating: 0
  })

  // UI state management
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'tabs' | 'sidebar'>('tabs')
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Widget management
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([
    {
      id: 'market-agent',
      type: 'market-agent',
      title: 'AI Market Report Agent',
      size: 'large',
      position: { x: 0, y: 0 },
      visible: true
    },
    {
      id: 'interactive-map',
      type: 'interactive-map',
      title: 'Interactive Map Analytics',
      size: 'large',
      position: { x: 1, y: 0 },
      visible: true
    },
    {
      id: 'research-panel',
      type: 'research-panel',
      title: 'Market Research Controls',
      size: 'medium',
      position: { x: 0, y: 1 },
      visible: true
    },
    {
      id: 'metrics',
      type: 'metrics',
      title: 'Performance Metrics',
      size: 'medium',
      position: { x: 1, y: 1 },
      visible: true
    },
    {
      id: 'insights',
      type: 'insights',
      title: 'AI Insights & Recommendations',
      size: 'medium',
      position: { x: 0, y: 2 },
      visible: true
    },
    {
      id: 'explorer',
      type: 'explorer',
      title: 'Restaurant Explorer',
      size: 'medium',
      position: { x: 1, y: 2 },
      visible: true
    }
  ])

  // Data loading functions
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Mock data for demonstration - replace with actual API calls
      setDashboardStats({
        totalAnalyses: 42,
        activeLocations: 8,
        marketScore: 8.5,
        revenueProjection: 125000,
        competitorCount: 15,
        opportunityRating: 4
      })

      // Mock nearby restaurants data
      setNearbyRestaurants([
        {
          id: '1',
          name: 'Pizza Palace',
          location: {
            latitude: 40.7580,
            longitude: -73.9855,
            address: '123 Main St',
            city: 'New York',
            country: 'USA'
          },
          category: 'restaurant',
          cuisine_types: ['Italian'],
          is_active: true,
          total_reviews: 245,
          data_quality_score: 0.95,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          rating: 4.5,
          distance: 0.2,
          latitude: 40.7580,
          longitude: -73.9855
        },
        {
          id: '2',
          name: 'Burger Barn',
          location: {
            latitude: 40.7595,
            longitude: -73.9845,
            address: '456 Oak Ave',
            city: 'New York',
            country: 'USA'
          },
          category: 'restaurant',
          cuisine_types: ['American'],
          is_active: true,
          total_reviews: 189,
          data_quality_score: 0.92,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          rating: 4.2,
          distance: 0.3,
          latitude: 40.7595,
          longitude: -73.9845
        },
        {
          id: '3',
          name: 'Sushi Spot',
          location: {
            latitude: 40.7575,
            longitude: -73.9860,
            address: '789 Pine St',
            city: 'New York',
            country: 'USA'
          },
          category: 'restaurant',
          cuisine_types: ['Japanese'],
          is_active: true,
          total_reviews: 312,
          data_quality_score: 0.97,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          rating: 4.7,
          distance: 0.4,
          latitude: 40.7575,
          longitude: -73.9860
        },
        {
          id: '4',
          name: 'Taco Time',
          location: {
            latitude: 40.7600,
            longitude: -73.9840,
            address: '321 Elm Dr',
            city: 'New York',
            country: 'USA'
          },
          category: 'restaurant',
          cuisine_types: ['Mexican'],
          is_active: true,
          total_reviews: 156,
          data_quality_score: 0.88,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          rating: 4.1,
          distance: 0.5,
          latitude: 40.7600,
          longitude: -73.9840
        },
        {
          id: '5',
          name: 'Coffee Corner',
          location: {
            latitude: 40.7585,
            longitude: -73.9850,
            address: '654 Maple Ln',
            city: 'New York',
            country: 'USA'
          },
          category: 'restaurant',
          cuisine_types: ['Cafe'],
          is_active: true,
          total_reviews: 98,
          data_quality_score: 0.90,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          rating: 4.3,
          distance: 0.1,
          latitude: 40.7585,
          longitude: -73.9850
        }
      ])

      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedLocation])

  const handleLocationAnalysis = useCallback(async (location: LocationCoordinates) => {
    try {
      // Mock analysis response - replace with actual API call
      const mockAnalysis: LocationAnalysisResponse = {
        location: { ...location, radius_km: location.radius_km || 1.0 },
        marketScore: 8.5,
        competitorCount: 12,
        populationDensity: 15000,
        averageIncome: 75000,
        analysis: {
          location_score: {
            overall_score: 8.5,
            demographic_score: 8.0,
            competition_score: 7.5,
            accessibility_score: 8.5,
            market_potential_score: 8.8,
            confidence_level: 'high' as const
          },
          competition_analysis: {
            total_competitors: 12,
            direct_competitors: 8,
            competition_density: 7.5,
            market_saturation: 'medium' as const,
            average_competitor_rating: 4.2
          },
          demographic_analysis: {
            population_density: 15000,
            estimated_population: 45000,
            median_income: 75000,
            age_distribution: {
              '18-24': 15,
              '25-34': 25,
              '35-44': 20,
              '45-54': 20,
              '55-64': 15,
              '65+': 5
            },
            income_distribution: {
              'low': 20,
              'middle': 50,
              'high': 30
            },
            household_composition: {
              single: 30,
              couple: 35,
              family_with_children: 35,
              other: 0
            },
            education_level: {
              high_school: 25,
              college: 45,
              graduate: 30
            }
          },
          accessibility_analysis: {
            overall_accessibility_score: 8.5,
            transport_modes: {
              walking: {
                walkability_score: 8.0,
                pedestrian_infrastructure: 'good',
                safety_score: 8.5,
                nearby_amenities: 15
              },
              transit: {
                public_transport_score: 9.0,
                nearest_station_distance_m: 300,
                service_frequency: 'high',
                route_connectivity: 8.5
              },
              driving: {
                parking_availability: 'good',
                traffic_congestion: 'moderate',
                road_accessibility: 7.5,
                highway_access: 'good'
              }
            },
            accessibility_grade: 'A-'
          },
          market_analysis: {
            estimated_market_size: 2500000,
            purchasing_power: 8.2,
            market_diversity: 7.8,
            cuisine_opportunities: ['Italian', 'Asian Fusion', 'Healthy Options']
          },
          insights: [
            'High foot traffic area with strong market potential',
            'Demographics favor premium dining options',
            'Strong public transport accessibility'
          ],
          recommendations: [
            'Consider premium pricing strategy',
            'Focus on lunch and dinner crowds',
            'Leverage public transport accessibility'
          ],
          risk_assessment: {
            risk_level: 'medium' as const,
            risk_factors: ['High competition', 'Premium rent costs'],
            mitigation_strategies: ['Differentiation', 'Strong marketing']
          },
          analysis_metadata: {
            analysis_date: new Date().toISOString(),
            radius_km: 1.0,
            target_cuisine_types: ['Italian', 'American'],
            target_category: 'restaurant'
          }
        },
        timestamp: new Date().toISOString()
      }
      
      setAnalysisResults(prev => [mockAnalysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
      setSelectedLocation(location)
    } catch (err) {
      console.error('Failed to analyze location:', err)
      setError('Failed to analyze location. Please try again.')
    }
  }, [])

  // Real-time data updates
  useEffect(() => {
    if (isRealTimeEnabled) {
      const interval = setInterval(() => {
        loadDashboardData()
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isRealTimeEnabled, loadDashboardData])

  // Initial data load
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Widget management functions
  const toggleWidget = (widgetId: string) => {
    setDashboardWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    )
  }

  const renderMetricsWidget = () => (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-400" />
          Performance Metrics
        </CardTitle>
        <CardDescription className="text-gray-400">
          Real-time business intelligence metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Market Score</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {dashboardStats.marketScore}/10
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Active Locations</span>
              <span className="text-white font-medium">{formatNumber(dashboardStats.activeLocations)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Revenue Projection</span>
              <span className="text-white font-medium">{formatCurrency(dashboardStats.revenueProjection)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Competitors</span>
              <span className="text-white font-medium">{formatNumber(dashboardStats.competitorCount)}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Opportunity Rating</span>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= dashboardStats.opportunityRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white font-medium">{dashboardStats.opportunityRating}/5</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderInsightsWidget = () => (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Insights & Recommendations
        </CardTitle>
        <CardDescription className="text-gray-400">
          Intelligent market analysis and suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">High Opportunity Zone</p>
              <p className="text-xs text-gray-400 mt-1">
                Current location shows strong market potential with low competition density.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">Market Saturation Alert</p>
              <p className="text-xs text-gray-400 mt-1">
                Consider expanding radius or exploring adjacent neighborhoods.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">Growth Trend Detected</p>
              <p className="text-xs text-gray-400 mt-1">
                Foot traffic in this area has increased 15% over the last quarter.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderExplorerWidget = () => (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Utensils className="h-5 w-5 text-orange-400" />
          Restaurant Explorer
        </CardTitle>
        <CardDescription className="text-gray-400">
          Nearby restaurants and competition analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {nearbyRestaurants.slice(0, 5).map((restaurant, index) => (
            <div key={restaurant.id || index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Utensils className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{restaurant.name}</p>
                  <p className="text-xs text-gray-400">{restaurant.cuisine_types?.[0] || 'Restaurant'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-300">{restaurant.rating || 'N/A'}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round((restaurant.distance || 0) * 1000)}m
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Generate Market Analysis</h3>
                    <p className="text-gray-400 text-sm">
                      Get AI-powered insights for your selected location
                    </p>
                  </div>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleLocationAnalysis(selectedLocation)}
                    disabled={isLoading}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {isLoading ? 'Analyzing...' : 'Analyze Location'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderMetricsWidget()}
              {renderInsightsWidget()}
            </div>
          </div>
        )
      
      case 'market-analysis':
        return (
          <div className="space-y-6">
            <MarketReportAgent 
              selectedLocation={selectedLocation}
              onReportGenerated={(report) => {
                console.log('Report generated:', report)
              }}
            />
          </div>
        )
      
      case 'interactive-map':
        return (
          <div className="space-y-6">
            <EnhancedInteractiveMap
              center={[selectedLocation.latitude, selectedLocation.longitude]}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              analysisResults={analysisResults}
              restaurants={nearbyRestaurants}
            />
          </div>
        )
      
      case 'research':
        return (
          <div className="space-y-6">
            <MarketResearchPanel
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onAnalysisComplete={(results) => {
                setAnalysisResults(prev => [results, ...prev.slice(0, 9)])
              }}
            />
          </div>
        )
      
      case 'explorer':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderExplorerWidget()}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">Competition Analysis</CardTitle>
                  <CardDescription className="text-gray-400">
                    Competitive landscape overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Direct Competitors</span>
                      <Badge variant="outline" className="text-red-400 border-red-400">
                        {dashboardStats.competitorCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Market Density</span>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        Medium
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Avg. Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white">4.2</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <EnhancedAnalytics />
          </div>
        )
      
      case 'monitoring':
        return (
          <div className="space-y-6">
            <RealTimeMonitoring />
          </div>
        )
      
      case 'settings':
        return (
          <div className="space-y-6">
            <DashboardSettings onSettingsChange={(settings) => {
              console.log('Settings updated:', settings)
              // Apply settings to dashboard
            }} />
          </div>
        )
      
      case 'data':
        return (
          <div className="space-y-6">
            <DataExportImport />
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                BiteBase Intelligence 2.0
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Interactive Market Analysis Dashboard
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Real-time toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                className={`border-gray-600 ${
                  isRealTimeEnabled 
                    ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                    : 'text-gray-400'
                }`}
              >
                <Activity className="h-4 w-4 mr-2" />
                {isRealTimeEnabled ? 'Live' : 'Paused'}
              </Button>
              
              {/* Layout toggle */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDashboardLayout('tabs')}
                  className={`h-8 px-3 ${
                    dashboardLayout === 'tabs' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDashboardLayout('grid')}
                  className={`h-8 px-3 ${
                    dashboardLayout === 'grid' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                disabled={isLoading}
                className="border-gray-600 text-gray-400 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Status bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{selectedLocation.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="market-analysis" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Reports</span>
            </TabsTrigger>
            <TabsTrigger 
              value="interactive-map" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger 
              value="research" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Research</span>
            </TabsTrigger>
            <TabsTrigger 
              value="explorer" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Explorer</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="data" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}