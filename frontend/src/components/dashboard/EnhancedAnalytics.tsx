'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MapPin, 
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface AnalyticsData {
  revenue: {
    current: number
    previous: number
    growth: number
    trend: 'up' | 'down' | 'stable'
  }
  customers: {
    total: number
    new: number
    returning: number
    growth: number
  }
  locations: {
    active: number
    performance: Array<{
      id: string
      name: string
      revenue: number
      customers: number
      rating: number
      status: 'excellent' | 'good' | 'needs_attention'
    }>
  }
  marketMetrics: {
    marketShare: number
    competitorCount: number
    opportunityScore: number
    riskLevel: 'low' | 'medium' | 'high'
  }
}

interface EnhancedAnalyticsProps {
  className?: string
}

export function EnhancedAnalytics({ className = '' }: EnhancedAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: {
      current: 125000,
      previous: 110000,
      growth: 13.6,
      trend: 'up'
    },
    customers: {
      total: 2450,
      new: 320,
      returning: 2130,
      growth: 8.2
    },
    locations: {
      active: 8,
      performance: [
        {
          id: '1',
          name: 'Times Square Location',
          revenue: 45000,
          customers: 850,
          rating: 4.7,
          status: 'excellent'
        },
        {
          id: '2',
          name: 'Brooklyn Heights',
          revenue: 32000,
          customers: 620,
          rating: 4.3,
          status: 'good'
        },
        {
          id: '3',
          name: 'Lower East Side',
          revenue: 28000,
          customers: 480,
          rating: 3.9,
          status: 'needs_attention'
        }
      ]
    },
    marketMetrics: {
      marketShare: 8.3,
      competitorCount: 15,
      opportunityScore: 8.5,
      riskLevel: 'low'
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const refreshAnalytics = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-400 bg-green-500/20 border-green-500/50'
      case 'good':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
      case 'needs_attention':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/50'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500/50'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(analyticsData.revenue.current)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    +{analyticsData.revenue.growth}%
                  </span>
                  <span className="text-gray-400 text-sm">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Customers</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatNumber(analyticsData.customers.total)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    +{analyticsData.customers.growth}%
                  </span>
                  <span className="text-gray-400 text-sm">growth</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Locations</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {analyticsData.locations.active}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">All operational</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Market Share</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {analyticsData.marketMetrics.marketShare}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Growing</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LineChart className="h-5 w-5 text-green-400" />
            Revenue Trend
          </CardTitle>
          <CardDescription className="text-gray-400">
            Monthly revenue performance over the last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Chart visualization would go here</p>
              <p className="text-gray-500 text-sm">Integration with Chart.js or similar library</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLocationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Location Performance</h3>
          <p className="text-gray-400 text-sm">Monitor performance across all locations</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAnalytics}
          disabled={isLoading}
          className="border-gray-600 text-gray-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {analyticsData.locations.performance.map((location) => (
          <Card key={location.id} className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{location.name}</CardTitle>
                <Badge className={getStatusColor(location.status)}>
                  {location.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Revenue</p>
                  <p className="text-white font-semibold">{formatCurrency(location.revenue)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Customers</p>
                  <p className="text-white font-semibold">{formatNumber(location.customers)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400 text-sm">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{location.rating}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderMarketTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              Market Position
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your position in the competitive landscape
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Market Share</span>
              <span className="text-white font-semibold">{analyticsData.marketMetrics.marketShare}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Opportunity Score</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {analyticsData.marketMetrics.opportunityScore}/10
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Risk Level</span>
              <Badge className={getRiskColor(analyticsData.marketMetrics.riskLevel)}>
                {analyticsData.marketMetrics.riskLevel}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Direct Competitors</span>
              <span className="text-white font-semibold">{analyticsData.marketMetrics.competitorCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Growth Opportunities
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI-identified expansion opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">High-Growth Market</p>
                <p className="text-xs text-gray-400 mt-1">
                  Brooklyn area shows 25% YoY growth potential
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Underserved Demographics</p>
                <p className="text-xs text-gray-400 mt-1">
                  Young professionals segment has low competition
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Star className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Premium Positioning</p>
                <p className="text-xs text-gray-400 mt-1">
                  Market ready for higher-end dining options
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400 mt-1">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-400 border-green-400">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
            disabled={isLoading}
            className="border-gray-600 text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="locations" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger 
            value="market" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Target className="h-4 w-4" />
            Market
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          {renderLocationsTab()}
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {renderMarketTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}