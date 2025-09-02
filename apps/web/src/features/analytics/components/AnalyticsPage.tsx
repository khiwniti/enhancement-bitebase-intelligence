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
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  Users,
  Building,
  Clock,
  Star,
  ShoppingCart,
  Zap,
  Target,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const timeRanges = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }
  ]

  const metrics = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '฿2,847,230',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'Total revenue across all restaurants'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: '15,847',
      change: '+8.3%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      description: 'Number of orders processed'
    },
    {
      id: 'customers',
      title: 'Active Customers',
      value: '8,234',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: Users,
      description: 'Unique active customers'
    },
    {
      id: 'restaurants',
      title: 'Partner Restaurants',
      value: '1,247',
      change: '+5.7%',
      changeType: 'positive' as const,
      icon: Building,
      description: 'Active restaurant partners'
    },
    {
      id: 'avgDeliveryTime',
      title: 'Avg Delivery Time',
      value: '28 min',
      change: '-3.2%',
      changeType: 'positive' as const,
      icon: Clock,
      description: 'Average delivery time'
    },
    {
      id: 'satisfaction',
      title: 'Customer Satisfaction',
      value: '4.7/5',
      change: '+0.2',
      changeType: 'positive' as const,
      icon: Star,
      description: 'Average customer rating'
    }
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

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-time Analytics</h1>
              <p className="text-gray-600">Live performance metrics and instant insights</p>
            </div>
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
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div 
          className="flex items-center justify-between bg-white/90 backdrop-blur-xl rounded-lg p-4 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Live Data
          </Badge>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-orange-500 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="flex items-center text-sm">
                    {metric.changeType === 'positive' ? (
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {metric.change}
                    </span>
                    <span className="text-gray-500 ml-1">from last period</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Top Performing Restaurants
                  <Badge variant="secondary">This {timeRange}</Badge>
                </CardTitle>
                <CardDescription>
                  Highest revenue generating partners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{restaurant.name}</p>
                          <p className="text-sm text-gray-500">{restaurant.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{restaurant.revenue}</p>
                        <div className="flex items-center">
                          <ArrowUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">{restaurant.growth}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  AI-Powered Insights
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    AI Generated
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Intelligent recommendations based on your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          insight.priority === 'high' ? 'bg-red-500' : 
                          insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                          <div className="flex items-center mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                insight.priority === 'high' ? 'border-red-200 text-red-700' :
                                insight.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                'border-green-200 text-green-700'
                              }`}
                            >
                              {insight.priority} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
