'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Bell, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Settings,
  Filter
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface RealTimeEvent {
  id: string
  type: 'customer' | 'revenue' | 'alert' | 'competitor' | 'market'
  title: string
  description: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  location?: string
  value?: number
  change?: number
}

interface LiveMetric {
  id: string
  name: string
  value: number
  previousValue: number
  change: number
  trend: 'up' | 'down' | 'stable'
  unit: 'currency' | 'number' | 'percentage'
  isActive: boolean
}

interface RealTimeMonitoringProps {
  className?: string
}

export function RealTimeMonitoring({ className = '' }: RealTimeMonitoringProps) {
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [events, setEvents] = useState<RealTimeEvent[]>([])
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([
    {
      id: 'revenue',
      name: 'Revenue',
      value: 125000,
      previousValue: 123500,
      change: 1.2,
      trend: 'up',
      unit: 'currency',
      isActive: true
    },
    {
      id: 'customers',
      name: 'Active Customers',
      value: 2450,
      previousValue: 2420,
      change: 1.2,
      trend: 'up',
      unit: 'number',
      isActive: true
    },
    {
      id: 'conversion',
      name: 'Conversion Rate',
      value: 8.5,
      previousValue: 8.2,
      change: 3.7,
      trend: 'up',
      unit: 'percentage',
      isActive: true
    },
    {
      id: 'market_share',
      name: 'Market Share',
      value: 8.3,
      previousValue: 8.1,
      change: 2.5,
      trend: 'up',
      unit: 'percentage',
      isActive: true
    }
  ])
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([
    'customer', 'revenue', 'alert', 'competitor', 'market'
  ])

  // Simulate real-time events
  const generateRandomEvent = useCallback((): RealTimeEvent => {
    const eventTypes = ['customer', 'revenue', 'alert', 'competitor', 'market'] as const
    const severities = ['low', 'medium', 'high', 'critical'] as const
    const locations = ['Times Square', 'Brooklyn Heights', 'Lower East Side', 'Midtown', 'SoHo']
    
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    const eventTemplates = {
      customer: [
        { title: 'New Customer Registration', description: 'New customer signed up for premium plan' },
        { title: 'Customer Feedback', description: 'Received 5-star review from customer' },
        { title: 'Customer Churn Alert', description: 'Customer cancelled subscription' }
      ],
      revenue: [
        { title: 'Revenue Milestone', description: 'Monthly revenue target achieved' },
        { title: 'Large Order Placed', description: 'High-value order received' },
        { title: 'Revenue Dip', description: 'Revenue below expected threshold' }
      ],
      alert: [
        { title: 'System Alert', description: 'High traffic detected on platform' },
        { title: 'Performance Warning', description: 'Response time above normal' },
        { title: 'Security Alert', description: 'Unusual login activity detected' }
      ],
      competitor: [
        { title: 'Competitor Analysis', description: 'New competitor opened nearby' },
        { title: 'Price Change Alert', description: 'Competitor adjusted pricing' },
        { title: 'Market Movement', description: 'Competitor launched new service' }
      ],
      market: [
        { title: 'Market Opportunity', description: 'New market segment identified' },
        { title: 'Trend Alert', description: 'Emerging food trend detected' },
        { title: 'Demographic Shift', description: 'Population change in target area' }
      ]
    }
    
    const templates = eventTemplates[type]
    const template = templates[Math.floor(Math.random() * templates.length)]
    
    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: template.title,
      description: `${template.description} in ${location}`,
      timestamp: new Date(),
      severity,
      location,
      value: Math.floor(Math.random() * 10000),
      change: (Math.random() - 0.5) * 20
    }
  }, [])

  // Update live metrics
  const updateMetrics = useCallback(() => {
    setLiveMetrics(prev => prev.map(metric => {
      const change = (Math.random() - 0.5) * 5 // Random change between -2.5% and +2.5%
      const newValue = metric.value * (1 + change / 100)
      const trend = newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable'
      
      return {
        ...metric,
        previousValue: metric.value,
        value: newValue,
        change: ((newValue - metric.value) / metric.value) * 100,
        trend
      }
    }))
  }, [])

  // Real-time monitoring effect
  useEffect(() => {
    if (!isMonitoring) return

    const eventInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of new event every 5 seconds
        const newEvent = generateRandomEvent()
        if (selectedEventTypes.includes(newEvent.type)) {
          setEvents(prev => [newEvent, ...prev.slice(0, 49)]) // Keep last 50 events
          
          // Play sound for critical events
          if (soundEnabled && newEvent.severity === 'critical') {
            // In a real app, you'd play an actual sound
            console.log('🔊 Critical alert sound')
          }
        }
      }
    }, 5000)

    const metricsInterval = setInterval(updateMetrics, 10000) // Update metrics every 10 seconds

    return () => {
      clearInterval(eventInterval)
      clearInterval(metricsInterval)
    }
  }, [isMonitoring, generateRandomEvent, updateMetrics, selectedEventTypes, soundEnabled])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/50'
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/50'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      case 'low':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <Users className="h-4 w-4" />
      case 'revenue':
        return <TrendingUp className="h-4 w-4" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />
      case 'competitor':
        return <Eye className="h-4 w-4" />
      case 'market':
        return <MapPin className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const formatMetricValue = (metric: LiveMetric) => {
    switch (metric.unit) {
      case 'currency':
        return formatCurrency(metric.value)
      case 'percentage':
        return `${metric.value.toFixed(1)}%`
      case 'number':
        return formatNumber(Math.round(metric.value))
      default:
        return metric.value.toString()
    }
  }

  const toggleEventType = (type: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Real-Time Monitoring</h2>
          <p className="text-gray-400 mt-1">Live business intelligence and alerts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`border-gray-600 ${
              soundEnabled 
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
                : 'text-gray-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`border-gray-600 ${
              isMonitoring 
                ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                : 'text-gray-400'
            }`}
          >
            {isMonitoring ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {isMonitoring ? 'Monitoring' : 'Paused'}
          </Button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {liveMetrics.map((metric) => (
          <Card key={metric.id} className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{metric.name}</span>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-400" />}
                  {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
                  {metric.trend === 'stable' && <Activity className="h-3 w-3 text-gray-400" />}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">
                  {formatMetricValue(metric)}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    metric.change > 0 
                      ? 'text-green-400 border-green-400' 
                      : metric.change < 0 
                        ? 'text-red-400 border-red-400'
                        : 'text-gray-400 border-gray-400'
                  }`}
                >
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event Filters */}
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-400" />
              Event Filters
            </CardTitle>
            <Badge variant="outline" className="text-green-400 border-green-400">
              {events.length} events
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['customer', 'revenue', 'alert', 'competitor', 'market'].map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => toggleEventType(type)}
                className={`capitalize ${
                  selectedEventTypes.includes(type)
                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                    : 'border-gray-600 text-gray-400 hover:text-white'
                }`}
              >
                {getEventIcon(type)}
                <span className="ml-2">{type}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Events */}
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Live Events
            {isMonitoring && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2" />
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Real-time business events and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No events yet</p>
                <p className="text-gray-500 text-sm">
                  {isMonitoring ? 'Monitoring for new events...' : 'Start monitoring to see events'}
                </p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <span className="text-gray-400 text-xs">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{event.description}</p>
                    {event.value && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-500 text-xs">Value:</span>
                        <span className="text-white text-xs font-medium">
                          {formatCurrency(event.value)}
                        </span>
                        {event.change && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              event.change > 0 
                                ? 'text-green-400 border-green-400' 
                                : 'text-red-400 border-red-400'
                            }`}
                          >
                            {event.change > 0 ? '+' : ''}{event.change.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}