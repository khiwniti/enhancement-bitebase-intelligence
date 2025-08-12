'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle
} from 'lucide-react'
import { realtimeDataService, RealtimeDataEvent, RealtimeMetrics } from '@/services/realtime/RealtimeDataService'

interface RealtimeMetricsWidgetProps {
  restaurantId: string
  className?: string
  showConnectionStatus?: boolean
}

interface LiveMetric {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
}

export function RealtimeMetricsWidget({ 
  restaurantId, 
  className = '',
  showConnectionStatus = true 
}: RealtimeMetricsWidgetProps) {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [recentEvents, setRecentEvents] = useState<RealtimeDataEvent[]>([])
  const subscriptionRef = useRef<string | null>(null)
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize real-time connection
    setIsConnected(realtimeDataService.getConnectionStatus())
    
    // Subscribe to real-time updates
    subscriptionRef.current = realtimeDataService.subscribe(
      restaurantId,
      ['revenue_update', 'order_placed', 'customer_activity', 'menu_performance'],
      handleRealtimeEvent
    )

    // Start mock data stream for demo
    mockIntervalRef.current = realtimeDataService.startMockDataStream(
      restaurantId,
      handleRealtimeEvent
    )

    // Load initial data
    loadInitialMetrics()

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setIsConnected(realtimeDataService.getConnectionStatus())
    }, 5000)

    return () => {
      if (subscriptionRef.current) {
        realtimeDataService.unsubscribe(subscriptionRef.current)
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current)
      }
      clearInterval(statusInterval)
    }
  }, [restaurantId])

  const loadInitialMetrics = () => {
    const initialData = realtimeDataService.generateMockRealtimeData(restaurantId)
    setMetrics(initialData)
    setLastUpdate(new Date())
  }

  const handleRealtimeEvent = (event: RealtimeDataEvent) => {
    setLastUpdate(new Date())
    
    // Add to recent events
    setRecentEvents(prev => {
      const newEvents = [event, ...prev.slice(0, 4)] // Keep last 5 events
      return newEvents
    })

    // Update metrics based on event type
    setMetrics(prev => {
      if (!prev) return prev

      const updated = { ...prev }

      switch (event.type) {
        case 'revenue_update':
          updated.current_revenue = event.data.total_today || updated.current_revenue
          break
        case 'order_placed':
          updated.orders_today += 1
          updated.active_customers = Math.max(1, updated.active_customers + Math.floor(Math.random() * 3) - 1)
          break
        case 'customer_activity':
          if (event.data.action === 'entered') {
            updated.active_customers += event.data.customer_count || 1
          } else if (event.data.action === 'paid') {
            updated.active_customers = Math.max(0, updated.active_customers - (event.data.customer_count || 1))
          }
          break
        case 'menu_performance':
          // Update trending items
          const itemIndex = updated.trending_items.findIndex(
            item => item.item_name === event.data.item_name
          )
          if (itemIndex >= 0) {
            updated.trending_items[itemIndex].orders_count += 1
            updated.trending_items[itemIndex].trend = event.data.performance_change > 0 ? 'up' : 'down'
          }
          break
      }

      return updated
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />
      default: return <div className="h-3 w-3" />
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'revenue_update': return <DollarSign className="h-4 w-4 text-green-500" />
      case 'order_placed': return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case 'customer_activity': return <Users className="h-4 w-4 text-purple-500" />
      case 'menu_performance': return <TrendingUp className="h-4 w-4 text-orange-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventDescription = (event: RealtimeDataEvent) => {
    switch (event.type) {
      case 'revenue_update':
        return `Revenue updated: ${formatCurrency(event.data.amount || 0)}`
      case 'order_placed':
        return `New order: ${event.data.items?.join(', ') || 'Items'} - ${formatCurrency(event.data.total || 0)}`
      case 'customer_activity':
        return `Customer ${event.data.action}: ${event.data.customer_count || 1} people`
      case 'menu_performance':
        return `${event.data.item_name} performance ${event.data.performance_change > 0 ? 'increased' : 'decreased'}`
      default:
        return 'Activity update'
    }
  }

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-500">Loading real-time data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const liveMetrics: LiveMetric[] = [
    {
      label: 'Today\'s Revenue',
      value: formatCurrency(metrics.current_revenue),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      trend: 'up'
    },
    {
      label: 'Orders Today',
      value: metrics.orders_today,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'text-blue-600',
      trend: 'up'
    },
    {
      label: 'Active Customers',
      value: metrics.active_customers,
      icon: <Users className="h-5 w-5" />,
      color: 'text-purple-600',
      trend: 'stable'
    }
  ]

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <span>Live Metrics</span>
            </CardTitle>
            <CardDescription>Real-time restaurant performance</CardDescription>
          </div>
          {showConnectionStatus && (
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                  <Wifi className="h-3 w-3" />
                  <span>Live</span>
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 flex items-center space-x-1">
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </Badge>
              )}
              {lastUpdate && (
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(lastUpdate)}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {liveMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                </div>
                {metric.trend && getTrendIcon(metric.trend)}
              </div>
              <div className={`text-2xl font-bold ${metric.color} mt-1`}>
                {metric.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Peak Hour Indicator */}
        {metrics.peak_hour_indicator && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-800">Peak Hour Active</span>
              <Badge className="bg-orange-100 text-orange-800">High Traffic</Badge>
            </div>
          </motion.div>
        )}

        {/* Trending Items */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Trending Items</h4>
          <div className="space-y-2">
            {metrics.trending_items.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.item_name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">{item.item_name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">{item.orders_count}</span>
                  {getTrendIcon(item.trend)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <AnimatePresence>
              {recentEvents.map((event, index) => (
                <motion.div
                  key={`${event.timestamp}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center space-x-2 text-xs text-gray-600 bg-white rounded p-2 border"
                >
                  {getEventIcon(event.type)}
                  <span className="flex-1">{getEventDescription(event)}</span>
                  <span className="text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
