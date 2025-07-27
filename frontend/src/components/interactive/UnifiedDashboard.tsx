'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarketReportAgent } from './MarketReportAgent'
import { EnhancedInteractiveMap } from './EnhancedInteractiveMap'
import { MarketResearchPanel } from '@/components/location/MarketResearchPanel'
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
  EyeOff
} from 'lucide-react'

interface DashboardWidget {
  id: string
  type: 'market-agent' | 'interactive-map' | 'research-panel' | 'analytics' | 'metrics'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  position: { x: number; y: number }
  visible: boolean
  data?: any
}

interface UnifiedDashboardProps {
  className?: string
}

export function UnifiedDashboard({ className = '' }: UnifiedDashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>({
    latitude: 40.7589,
    longitude: -73.9851,
    name: 'Times Square, NYC'
  })
  const [analysisResults, setAnalysisResults] = useState<LocationAnalysisResponse[]>([])
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([])
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
      title: 'Key Performance Metrics',
      size: 'medium',
      position: { x: 1, y: 1 },
      visible: true
    }
  ])
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'tabs' | 'sidebar'>('grid')

  // Load initial data
  useEffect(() => {
    loadNearbyRestaurants()
    if (isRealTimeEnabled) {
      const interval = setInterval(() => {
        setLastUpdate(new Date())
        // Simulate real-time updates
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [selectedLocation, isRealTimeEnabled])

  const loadNearbyRestaurants = async () => {
    try {
      const response = await apiClient.restaurants.nearby({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        radius_km: 2,
        limit: 50
      })
      setNearbyRestaurants((response as any).restaurants || [])
    } catch (error) {
      console.error('Failed to load nearby restaurants:', error)
    }
  }

  const handleLocationSelect = (location: LocationCoordinates) => {
    setSelectedLocation(location)
  }

  const handleAnalysisComplete = (results: LocationAnalysisResponse) => {
    setAnalysisResults(prev => [results, ...prev.slice(0, 4)]) // Keep last 5 analyses
  }

  const toggleWidget = (widgetId: string) => {
    setDashboardWidgets(prev => prev.map(widget => 
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    ))
  }

  const exportDashboard = async () => {
    const dashboardData = {
      selectedLocation,
      analysisResults,
      nearbyRestaurants,
      widgets: dashboardWidgets,
      exportedAt: new Date()
    }

    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bitebase-dashboard-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const refreshDashboard = async () => {
    setLastUpdate(new Date())
    await loadNearbyRestaurants()
    // Trigger refresh for all widgets
  }

  const getWidgetGridClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1'
      case 'medium': return 'col-span-1 row-span-2'
      case 'large': return 'col-span-2 row-span-2'
      case 'full': return 'col-span-3 row-span-3'
      default: return 'col-span-1 row-span-1'
    }
  }

  const renderWidget = (widget: DashboardWidget) => {
    if (!widget.visible) return null

    const baseClasses = `${getWidgetGridClass(widget.size)} transition-all duration-300`

    switch (widget.type) {
      case 'market-agent':
        return (
          <div key={widget.id} className={baseClasses}>
            <MarketReportAgent
              selectedLocation={selectedLocation}
              onReportGenerated={(report) => console.log('Report generated:', report)}
              className="h-full"
            />
          </div>
        )

      case 'interactive-map':
        return (
          <div key={widget.id} className={baseClasses}>
            <EnhancedInteractiveMap
              center={[selectedLocation.latitude, selectedLocation.longitude]}
              zoom={14}
              restaurants={nearbyRestaurants}
              analysisResults={analysisResults}
              selectedLocation={selectedLocation}
              analysisRadius={2}
              onLocationSelect={handleLocationSelect}
              onRestaurantSelect={(restaurant) => console.log('Restaurant selected:', restaurant)}
              onMapClick={handleLocationSelect}
              className="h-full"
            />
          </div>
        )

      case 'research-panel':
        return (
          <div key={widget.id} className={baseClasses}>
            <MarketResearchPanel
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationSelect}
              onAnalysisComplete={handleAnalysisComplete}
              className="h-full"
            />
          </div>
        )

      case 'metrics':
        return (
          <div key={widget.id} className={baseClasses}>
            <Card className="card-dark h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Activity className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Real-time business intelligence metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {analysisResults.length > 0 ? analysisResults[0].analysis.location_score.overall_score.toFixed(1) : '8.5'}
                    </div>
                    <div className="text-xs text-muted-foreground">Current Location Score</div>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {nearbyRestaurants.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Nearby Restaurants</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {analysisResults.length > 0 ? 
                        formatCurrency(analysisResults[0].analysis.market_analysis.estimated_market_size) : 
                        '$2.5M'
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Market Size</div>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">
                      {analysisResults.length > 0 ? 
                        analysisResults[0].analysis.competition_analysis.total_competitors : 
                        '12'
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Competitors</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Market Trends</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Restaurant Density</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-3/4"></div>
                        </div>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Market Saturation</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 w-1/2"></div>
                        </div>
                        <span className="text-sm font-medium">50%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Growth Potential</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 w-4/5"></div>
                        </div>
                        <span className="text-sm font-medium">80%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Dashboard Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">BiteBase Intelligence 2.0</h1>
                  <p className="text-xs text-muted-foreground">Interactive Analytics Dashboard</p>
                </div>
              </div>
              
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Activity className="h-3 w-3 mr-1" />
                {isRealTimeEnabled ? 'Live Data' : 'Static Data'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-xs text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshDashboard}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportDashboard}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Controls */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Dashboard Widgets</h2>
            <div className="flex items-center gap-2">
              {dashboardWidgets.map((widget) => (
                <Button
                  key={widget.id}
                  variant={widget.visible ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleWidget(widget.id)}
                  className="text-xs"
                >
                  {widget.visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                  {widget.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={dashboardLayout === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDashboardLayout('grid')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={dashboardLayout === 'tabs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDashboardLayout('tabs')}
            >
              <Target className="h-4 w-4 mr-2" />
              Tabs
            </Button>
            <Button
              variant={dashboardLayout === 'sidebar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDashboardLayout('sidebar')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Sidebar
            </Button>
          </div>
        </div>

        {/* Current Location Display */}
        <Card className="card-dark mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">{selectedLocation.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {analysisResults.length > 0 ? analysisResults[0].analysis.location_score.overall_score.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {nearbyRestaurants.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {analysisResults.length > 0 ? 
                      analysisResults[0].analysis.competition_analysis.market_saturation.toUpperCase() : 
                      'MEDIUM'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">Competition</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-3 gap-6 auto-rows-min">
          {dashboardWidgets.map(renderWidget)}
        </div>
      </div>
    </div>
  )
}