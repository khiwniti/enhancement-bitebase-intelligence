'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  DashboardCard, 
  AnimatedButton, 
  FloatingFoodIcons,
  dashboardWidgetVariants,
  staggerContainer,
  deliveryVariants 
} from '@/components/animations'
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
      setNearbyRestaurants((response as any)?.restaurants || [])
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
          <motion.div 
            key={widget.id} 
            className={baseClasses}
            variants={dashboardWidgetVariants}
            initial="hidden"
            animate="visible"
            custom={widget.position.x + widget.position.y}
          >
            <DashboardCard className="card-dark h-full relative overflow-hidden">
              <motion.div
                className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-bitebase-primary/20 to-food-orange/20 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <BarChart3 className="h-5 w-5 text-bitebase-primary" />
                  </motion.div>
                  📊 Performance Metrics
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Badge variant="outline" className="bg-bitebase-primary/10 text-bitebase-primary border-bitebase-primary/20">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                      </motion.div>
                      Live 📡
                    </Badge>
                  </motion.div>
                </CardTitle>
                <CardDescription>
                  Real-time business intelligence metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className="text-center p-3 bg-bitebase-primary/10 rounded-lg border border-bitebase-primary/20"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { delay: 0.1 } }
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-bitebase-primary"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {analysisResults.length > 0 ? analysisResults[0].analysis.location_score.overall_score.toFixed(1) : '8.5'}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">Location Score ⭐</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { delay: 0.2 } }
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-blue-400"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    >
                      {nearbyRestaurants.length}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">Restaurants 🍽️</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { delay: 0.3 } }
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-green-400"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.0 }}
                    >
                      {analysisResults.length > 0 ? 
                        formatCurrency(analysisResults[0].analysis.market_analysis.estimated_market_size) : 
                        '$2.5M'
                      }
                    </motion.div>
                    <div className="text-xs text-muted-foreground">Market Size 💰</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { delay: 0.4 } }
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-orange-400"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    >
                      {analysisResults.length > 0 ? 
                        analysisResults[0].analysis.competition_analysis.total_competitors : 
                        '12'
                      }
                    </motion.div>
                    <div className="text-xs text-muted-foreground">Competitors 🏆</div>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    📈 Market Trends
                  </h4>
                  <motion.div 
                    className="space-y-2"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div 
                      className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-bitebase-primary/5 to-transparent"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { delay: 0.9 } }
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <span className="text-sm text-muted-foreground">🏪 Restaurant Density</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-bitebase-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ delay: 1.0, duration: 1 }}
                          />
                        </div>
                        <motion.span 
                          className="text-sm font-medium text-bitebase-primary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.5 }}
                        >
                          75%
                        </motion.span>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-orange-500/5 to-transparent"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { delay: 1.0 } }
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <span className="text-sm text-muted-foreground">📊 Market Saturation</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-orange-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "50%" }}
                            transition={{ delay: 1.1, duration: 1 }}
                          />
                        </div>
                        <motion.span 
                          className="text-sm font-medium text-orange-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.6 }}
                        >
                          50%
                        </motion.span>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-green-500/5 to-transparent"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { delay: 1.1 } }
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <span className="text-sm text-muted-foreground">🚀 Growth Potential</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-green-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "80%" }}
                            transition={{ delay: 1.2, duration: 1 }}
                          />
                        </div>
                        <motion.span 
                          className="text-sm font-medium text-green-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.7 }}
                        >
                          80%
                        </motion.span>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </DashboardCard>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div 
      className={`min-h-screen bg-background relative ${className}`}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Floating Food Icons Background */}
      <FloatingFoodIcons className="opacity-10" />
      
      {/* Dashboard Header */}
      <motion.div 
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="w-8 h-8 bg-delivery-hero rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-xl font-bold bg-gradient-to-r from-bitebase-primary to-food-orange bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    🍽️ BiteBase Intelligence 2.0
                  </motion.h1>
                  <motion.p 
                    className="text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Restaurant Intelligence Platform
                  </motion.p>
                </div>
              </div>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <Badge variant="outline" className="bg-bitebase-primary/10 text-bitebase-primary border-bitebase-primary/20">
                  <motion.div
                    animate={{ rotate: isRealTimeEnabled ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isRealTimeEnabled ? Infinity : 0, ease: 'linear' }}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                  </motion.div>
                  {isRealTimeEnabled ? 'Live Data 📡' : 'Static Data'}
                </Badge>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              <motion.div 
                className="text-xs text-muted-foreground"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Last updated: {lastUpdate.toLocaleTimeString()}
              </motion.div>
              
              <div className="flex items-center gap-2">
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  onClick={refreshDashboard}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Refresh
                </AnimatedButton>
                
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  onClick={exportDashboard}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Export
                </AnimatedButton>
                
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  leftIcon={<Share className="h-4 w-4" />}
                >
                  Share
                </AnimatedButton>
                
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Controls */}
      <motion.div 
        className="container mx-auto px-6 py-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="flex items-center justify-between mb-6"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
          }}
        >
          <div className="flex items-center gap-4">
            <motion.h2 
              className="text-lg font-semibold bg-gradient-to-r from-bitebase-primary to-food-orange bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              🎛️ Dashboard Controls
            </motion.h2>
            <motion.div 
              className="flex items-center gap-2"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {dashboardWidgets.map((widget, index) => (
                <motion.div
                  key={widget.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: index * 0.1 + 0.3 }
                    }
                  }}
                >
                  <AnimatedButton
                    variant={widget.visible ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                    leftIcon={widget.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    animationType="scale"
                    className="text-xs"
                  >
                    {widget.title}
                  </AnimatedButton>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            className="flex items-center gap-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { delay: 0.4 } }
              }}
            >
              <AnimatedButton
                variant={dashboardLayout === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setDashboardLayout('grid')}
                leftIcon={<LayoutDashboard className="h-4 w-4" />}
                animationType="bounce"
              >
                Grid
              </AnimatedButton>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { delay: 0.5 } }
              }}
            >
              <AnimatedButton
                variant={dashboardLayout === 'tabs' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setDashboardLayout('tabs')}
                leftIcon={<Target className="h-4 w-4" />}
                animationType="bounce"
              >
                Tabs
              </AnimatedButton>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { delay: 0.6 } }
              }}
            >
              <AnimatedButton
                variant={dashboardLayout === 'sidebar' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setDashboardLayout('sidebar')}
                leftIcon={<Globe className="h-4 w-4" />}
                animationType="bounce"
              >
                Sidebar
              </AnimatedButton>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Current Location Display */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.7 } }
          }}
        >
          <DashboardCard className="card-dark mb-6 relative overflow-hidden">
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-bitebase-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <MapPin className="h-5 w-5 text-bitebase-primary" />
                  </motion.div>
                  <div>
                    <motion.h3 
                      className="font-semibold text-foreground flex items-center gap-2"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      📍 {selectedLocation.name}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                    >
                      {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                    </motion.p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className="text-center p-3 bg-bitebase-primary/10 rounded-lg"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { delay: 1.1 } }
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div 
                      className="text-lg font-bold text-bitebase-primary"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {analysisResults.length > 0 ? analysisResults[0].analysis.location_score.overall_score.toFixed(1) : '--'}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">Score ⭐</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-blue-500/10 rounded-lg"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { delay: 1.2 } }
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div 
                      className="text-lg font-bold text-blue-400"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      {nearbyRestaurants.length}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">Restaurants 🍽️</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-green-500/10 rounded-lg"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { delay: 1.3 } }
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div 
                      className="text-lg font-bold text-green-400"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.0 }}
                    >
                      {analysisResults.length > 0 ? 
                        analysisResults[0].analysis.competition_analysis.market_saturation.toUpperCase() : 
                        'MEDIUM'
                      }
                    </motion.div>
                    <div className="text-xs text-muted-foreground">Competition 🏆</div>
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </DashboardCard>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div 
          className="grid grid-cols-3 gap-6 auto-rows-min"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {dashboardWidgets.map((widget, index) => (
            <motion.div
              key={widget.id}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 20 },
                visible: { 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { 
                    delay: index * 0.1 + 1.5,
                    duration: 0.5,
                    ease: 'easeOut'
                  }
                }
              }}
            >
              {renderWidget(widget)}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}