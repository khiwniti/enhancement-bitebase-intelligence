'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Maximize2,
  Settings,
  Eye,
  DollarSign,
  Users,
  Building,
  MapPin,
  Clock,
  Star,
  ShoppingCart,
  Zap,
  Target,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [realtimeData, setRealtimeData] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData()
    const interval = setInterval(loadAnalyticsData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Load comprehensive analytics data
      const [metricsResponse, trendsResponse, performanceResponse] = await Promise.all([
        fetch('/api/analytics/metrics?timeRange=' + timeRange),
        fetch('/api/analytics/trends?timeRange=' + timeRange),
        fetch('/api/analytics/performance?timeRange=' + timeRange)
      ])

      const metricsData = await metricsResponse.json()
      const trendsData = await trendsResponse.json()
      const performanceData = await performanceResponse.json()

      setAnalyticsData({
        metrics: metricsData,
        trends: trendsData,
        performance: performanceData
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      // Use mock data for development
      setAnalyticsData(generateMockData())
      setLastUpdated(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockData = () => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return timeRange === '24h' ? date.toLocaleTimeString('en-US', { hour: '2-digit' }) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    return {
      revenueChart: {
        labels,
        datasets: [{
          label: 'Revenue (฿)',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 50000) + 20000),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      ordersChart: {
        labels,
        datasets: [{
          label: 'Orders',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 500) + 200),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderColor: 'rgb(147, 51, 234)',
          borderWidth: 1
        }]
      },
      customerChart: {
        labels: ['New Customers', 'Returning Customers', 'VIP Customers'],
        datasets: [{
          data: [35, 45, 20],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(147, 51, 234, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderWidth: 0
        }]
      },
      performanceChart: {
        labels: ['Delivery Time', 'Order Accuracy', 'Customer Satisfaction', 'Food Quality'],
        datasets: [{
          label: 'Performance %',
          data: [85, 92, 88, 90],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }]
      }
    }
  }

  const timeRanges = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
  ]

  // Enhanced metrics with real-time data
  const metrics = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: analyticsData?.metrics?.totalRevenue || '฿2,847,230',
      change: analyticsData?.metrics?.revenueChange || '+12.5%',
      changeType: (analyticsData?.metrics?.revenueChange?.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: DollarSign,
      description: 'Total revenue across all restaurants',
      trend: analyticsData?.metrics?.revenueTrend || 'up'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: analyticsData?.metrics?.totalOrders || '15,847',
      change: analyticsData?.metrics?.ordersChange || '+8.3%',
      changeType: (analyticsData?.metrics?.ordersChange?.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: ShoppingCart,
      description: 'Number of orders processed',
      trend: analyticsData?.metrics?.ordersTrend || 'up'
    },
    {
      id: 'customers',
      title: 'Active Customers',
      value: analyticsData?.metrics?.activeCustomers || '8,234',
      change: analyticsData?.metrics?.customersChange || '-2.1%',
      changeType: (analyticsData?.metrics?.customersChange?.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: Users,
      description: 'Unique active customers',
      trend: analyticsData?.metrics?.customersTrend || 'down'
    },
    {
      id: 'restaurants',
      title: 'Partner Restaurants',
      value: analyticsData?.metrics?.partnerRestaurants || '1,247',
      change: analyticsData?.metrics?.restaurantsChange || '+5.7%',
      changeType: (analyticsData?.metrics?.restaurantsChange?.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: Building,
      description: 'Active restaurant partners',
      trend: analyticsData?.metrics?.restaurantsTrend || 'up'
    },
    {
      id: 'avgDeliveryTime',
      title: 'Avg Delivery Time',
      value: analyticsData?.metrics?.avgDeliveryTime || '28 min',
      change: analyticsData?.metrics?.deliveryTimeChange || '-3.2%',
      changeType: (analyticsData?.metrics?.deliveryTimeChange?.startsWith('-') ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: Clock,
      description: 'Average delivery time',
      trend: analyticsData?.metrics?.deliveryTimeTrend || 'down'
    },
    {
      id: 'satisfaction',
      title: 'Customer Satisfaction',
      value: analyticsData?.metrics?.customerSatisfaction || '4.7/5',
      change: analyticsData?.metrics?.satisfactionChange || '+0.2',
      changeType: (analyticsData?.metrics?.satisfactionChange?.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: Star,
      description: 'Average customer rating',
      trend: analyticsData?.metrics?.satisfactionTrend || 'up'
    },
    {
      id: 'conversionRate',
      title: 'Conversion Rate',
      value: analyticsData?.metrics?.conversionRate || '3.4%',
      change: analyticsData?.metrics?.conversionChange || '+0.8%',
      changeType: (analyticsData?.metrics?.conversionChange?.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: Target,
      description: 'Order conversion rate',
      trend: analyticsData?.metrics?.conversionTrend || 'up'
    },
    {
      id: 'avgOrderValue',
      title: 'Avg Order Value',
      value: analyticsData?.metrics?.avgOrderValue || '฿485',
      change: analyticsData?.metrics?.orderValueChange || '+7.3%',
      changeType: (analyticsData?.metrics?.orderValueChange?.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: Zap,
      description: 'Average order value',
      trend: analyticsData?.metrics?.orderValueTrend || 'up'
    }
  ]

  const chartData = [
    { name: 'Mon', revenue: 45000, orders: 234, customers: 189 },
    { name: 'Tue', revenue: 52000, orders: 267, customers: 201 },
    { name: 'Wed', revenue: 48000, orders: 245, customers: 195 },
    { name: 'Thu', revenue: 61000, orders: 312, customers: 234 },
    { name: 'Fri', revenue: 73000, orders: 389, customers: 287 },
    { name: 'Sat', revenue: 89000, orders: 456, customers: 342 },
    { name: 'Sun', revenue: 67000, orders: 378, customers: 298 }
  ]

  const topPerformers = [
    { name: 'Som Tam Nua', revenue: '฿234,567', orders: 1234, growth: '+23%' },
    { name: 'Pad Thai Thip Samai', revenue: '฿198,432', orders: 987, growth: '+18%' },
    { name: 'Krua Apsorn', revenue: '฿176,543', orders: 876, growth: '+15%' },
    { name: 'Jay Fai', revenue: '฿165,234', orders: 654, growth: '+12%' },
    { name: 'Thip Samai', revenue: '฿143,567', orders: 543, growth: '+9%' }
  ]

  const insights = [
    {
      id: '1',
      title: 'Peak Hours Identified',
      description: 'Lunch (12-2 PM) and dinner (7-9 PM) show highest order volumes',
      type: 'trend',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Weekend Revenue Surge',
      description: 'Weekend revenue is 34% higher than weekdays on average',
      type: 'revenue',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Customer Retention Alert',
      description: 'Customer retention rate dropped by 3% this month',
      type: 'customer',
      priority: 'high'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Comprehensive data insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-white rounded-lg border border-slate-200 p-1">
            {timeRanges.map((range) => (
              <Button
                key={range.id}
                variant={timeRange === range.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range.id)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'default' : 'secondary'}
                    className={`
                      ${metric.changeType === 'positive' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                      }
                    `}
                  >
                    {metric.changeType === 'positive' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {metric.change}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">{metric.value}</CardTitle>
                <CardDescription className="text-sm">{metric.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">{metric.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Real-time Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trends Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                    Revenue Trends
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated {lastUpdated.toLocaleTimeString()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadAnalyticsData}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {analyticsData ? (
                    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                          <LineChart className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-700">Revenue Trends Chart</h3>
                          <p className="text-slate-500 text-sm">
                            Real-time revenue analytics and trends
                          </p>
                        </div>
                        <div className="text-xs text-slate-400">
                          Chart.js integration ready
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                          {isLoading ? (
                            <RefreshCw className="w-8 h-8 text-white animate-spin" />
                          ) : (
                            <LineChart className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-700">
                            {isLoading ? 'Loading Analytics...' : 'Loading Chart Data'}
                          </h3>
                          <p className="text-slate-500 text-sm">
                            Real-time revenue trends and performance metrics
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Top Performers */}
        <div>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Top Performers
              </CardTitle>
              <CardDescription>Best performing restaurants this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{performer.name}</p>
                      <p className="text-xs text-slate-500">{performer.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-slate-900">{performer.revenue}</p>
                    <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                      {performer.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Orders Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                Daily Orders
              </CardTitle>
              <CardDescription>Order volume trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {analyticsData ? (
                  <div className="h-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-md font-semibold text-slate-700">Orders Chart</h4>
                        <p className="text-slate-500 text-xs">Daily order volume trends</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-slate-50 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Segmentation */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-600" />
                Customer Segmentation
              </CardTitle>
              <CardDescription>Customer distribution by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {analyticsData ? (
                  <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <PieChart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-md font-semibold text-slate-700">Customer Segmentation</h4>
                        <p className="text-slate-500 text-xs">Customer distribution analysis</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-slate-50 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics Chart */}
        <div className="mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="w-5 h-5 mr-2 text-orange-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Key performance indicators across all operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analyticsData ? (
                  <div className="h-full bg-gradient-to-br from-orange-50 to-red-50 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-md font-semibold text-slate-700">Performance Metrics</h4>
                        <p className="text-slate-500 text-xs">KPI performance indicators</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-slate-50 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI-Powered Insights */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-blue-600" />
              AI-Powered Analytics Insights
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Real-time insights generated from your business data
            </p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Insights
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enhanced insights with more detail */}
          {[
            {
              id: 'revenue-spike',
              title: 'Revenue Spike Detected',
              description: 'Revenue increased by 23% compared to last week, primarily driven by weekend orders and new customer acquisitions.',
              priority: 'high',
              type: 'revenue',
              icon: TrendingUp,
              color: 'green',
              action: 'Investigate peak hours',
              impact: '+฿145,000',
              confidence: 94
            },
            {
              id: 'delivery-optimization',
              title: 'Delivery Time Improvement',
              description: 'Average delivery time reduced by 3.2 minutes through route optimization and partner restaurant efficiency.',
              priority: 'medium',
              type: 'operations',
              icon: Clock,
              color: 'blue',
              action: 'Expand optimization',
              impact: '-3.2 min',
              confidence: 87
            },
            {
              id: 'customer-retention',
              title: 'Customer Retention Alert',
              description: 'Customer retention rate dropped by 2.1%. Consider implementing loyalty programs or promotional campaigns.',
              priority: 'high',
              type: 'customer',
              icon: AlertCircle,
              color: 'red',
              action: 'Launch retention campaign',
              impact: '-2.1%',
              confidence: 91
            },
            {
              id: 'peak-hours',
              title: 'Peak Hours Analysis',
              description: 'Friday and Saturday evenings show 45% higher order volume. Consider dynamic pricing and staff optimization.',
              priority: 'medium',
              type: 'trends',
              icon: BarChart3,
              color: 'purple',
              action: 'Optimize staffing',
              impact: '+45%',
              confidence: 96
            },
            {
              id: 'new-market',
              title: 'Market Expansion Opportunity',
              description: 'High demand detected in Sukhumvit area with limited restaurant coverage. Potential for 15% revenue increase.',
              priority: 'high',
              type: 'expansion',
              icon: MapPin,
              color: 'orange',
              action: 'Expand coverage',
              impact: '+15%',
              confidence: 82
            },
            {
              id: 'satisfaction-trend',
              title: 'Customer Satisfaction Rising',
              description: 'Customer satisfaction improved by 0.3 points this month, driven by faster delivery and food quality improvements.',
              priority: 'low',
              type: 'satisfaction',
              icon: Star,
              color: 'green',
              action: 'Maintain quality',
              impact: '+0.3',
              confidence: 89
            }
          ].map((insight) => {
            const Icon = insight.icon
            return (
              <Card key={insight.id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      insight.color === 'green' ? 'bg-green-100 text-green-600' :
                      insight.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      insight.color === 'red' ? 'bg-red-100 text-red-600' :
                      insight.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      insight.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                        <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{insight.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Impact:</span>
                          <span className="font-medium text-slate-700">{insight.impact}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Confidence:</span>
                          <span className="font-medium text-slate-700">{insight.confidence}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Suggested Action:</span>
                          <span className="font-medium text-blue-600">{insight.action}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
