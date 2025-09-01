/**
 * BiteBase Intelligence Real-time Analytics Dashboard
 * Live dashboard with real-time metrics and updates
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Wifi, 
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics'
import { useAuth } from '@/contexts/AuthContext'

interface RealtimeAnalyticsDashboardProps {
  restaurantId: string
  className?: string
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  isLoading?: boolean
  lastUpdated?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  isLoading = false,
  lastUpdated 
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isLoading ? (
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        ) : (
          value
        )}
      </div>
      {change !== undefined && (
        <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}% from last hour
        </p>
      )}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground mt-1">
          Updated {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </CardContent>
    {isLoading && (
      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
        <RefreshCw className="h-4 w-4 animate-spin" />
      </div>
    )}
  </Card>
)

const RealtimeAnalyticsDashboard: React.FC<RealtimeAnalyticsDashboardProps> = ({
  restaurantId,
  className = ''
}) => {
  const { user } = useAuth()
  const {
    metrics,
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
    subscribeToRestaurants,
    unsubscribeFromRestaurants,
    getCurrentMetrics
  } = useRealtimeAnalytics()

  const [selectedTab, setSelectedTab] = useState('overview')
  const [isInitialized, setIsInitialized] = useState(false)

  // Get metrics for current restaurant
  const restaurantMetrics = metrics[restaurantId] || []
  const metricsMap = restaurantMetrics.reduce((acc, metric) => {
    acc[metric.metric_type] = metric
    return acc
  }, {} as Record<string, any>)

  // Initialize subscription
  useEffect(() => {
    if (!isInitialized && isConnected && restaurantId) {
      subscribeToRestaurants([restaurantId])
      getCurrentMetrics(restaurantId)
      setIsInitialized(true)
    }
  }, [isConnected, restaurantId, subscribeToRestaurants, getCurrentMetrics, isInitialized])

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (restaurantId) {
        unsubscribeFromRestaurants([restaurantId])
      }
    }
  }, [restaurantId, unsubscribeFromRestaurants])

  const connectionStatusColor = {
    connected: 'text-green-600',
    connecting: 'text-yellow-600',
    disconnected: 'text-gray-600',
    error: 'text-red-600'
  }[connectionStatus]

  const connectionStatusIcon = {
    connected: <Wifi className="h-4 w-4" />,
    connecting: <RefreshCw className="h-4 w-4 animate-spin" />,
    disconnected: <WifiOff className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />
  }[connectionStatus]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Real-time Analytics</h2>
          <p className="text-muted-foreground">
            Live dashboard with real-time metrics and updates
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${connectionStatusColor}`}>
            {connectionStatusIcon}
            <span className="text-sm font-medium capitalize">
              {connectionStatus}
            </span>
          </div>
          
          {connectionStatus === 'error' && (
            <Button
              variant="outline"
              size="sm"
              onClick={connect}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reconnect</span>
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Connection Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </motion.div>
      )}

      {/* Real-time Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Current Revenue"
          value={metricsMap.current_revenue ? `$${metricsMap.current_revenue.value.toLocaleString()}` : '$0'}
          change={5.2}
          icon={<DollarSign />}
          isLoading={!isConnected}
          lastUpdated={metricsMap.current_revenue?.timestamp}
        />
        
        <MetricCard
          title="Active Customers"
          value={metricsMap.active_customers?.value || 0}
          change={-2.1}
          icon={<Users />}
          isLoading={!isConnected}
          lastUpdated={metricsMap.active_customers?.timestamp}
        />
        
        <MetricCard
          title="Orders/Hour"
          value="24"
          change={8.3}
          icon={<TrendingUp />}
          isLoading={!isConnected}
        />
        
        <MetricCard
          title="Avg Order Value"
          value="$32.50"
          change={1.7}
          icon={<Activity />}
          isLoading={!isConnected}
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Live Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Kitchen Efficiency</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Speed</span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Updates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AnimatePresence>
                    {restaurantMetrics.slice(0, 5).map((metric, index) => (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {metric.metric_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {restaurantMetrics.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No real-time data available</p>
                      <p className="text-xs">Check your connection status</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Tracking</CardTitle>
              <CardDescription>Real-time revenue metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Revenue analytics coming soon</p>
                <p className="text-sm">Real-time revenue charts and forecasting</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>Live customer behavior and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Customer analytics coming soon</p>
                <p className="text-sm">Real-time customer tracking and insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Menu Performance</CardTitle>
              <CardDescription>Live menu item analytics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsMap.top_menu_items ? (
                <div className="space-y-4">
                  <h4 className="font-medium">Top Performing Items</h4>
                  <div className="space-y-2">
                    {metricsMap.top_menu_items.value.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.revenue.toFixed(2)}</p>
                          <Badge variant="secondary">#{index + 1}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Menu analytics loading...</p>
                  <p className="text-sm">Real-time menu performance data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RealtimeAnalyticsDashboard
