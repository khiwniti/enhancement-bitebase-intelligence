'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Calculator,
  Target,
  Zap,
  Users,
  Calendar,
  RefreshCw,
  Download,
  Settings,
  Activity,
  PieChart
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { RevenueForecastDashboard } from './RevenueForecastDashboard'

interface RevenueForecastData {
  current_month_revenue: number
  forecasted_revenue: number
  growth_percentage: number
  confidence_interval: {
    lower: number
    upper: number
  }
  monthly_forecast: Array<{
    month: string
    predicted_revenue: number
    confidence: number
  }>
}

interface CustomerSpendingData {
  average_order_value: number
  customer_lifetime_value: number
  spending_segments: Array<{
    segment: string
    avg_spending: number
    customer_count: number
    percentage: number
  }>
  spending_trends: {
    trend: 'increasing' | 'decreasing' | 'stable'
    percentage_change: number
    period: string
  }
}

interface PriceElasticityData {
  overall_elasticity: number
  item_elasticity: Array<{
    item_name: string
    elasticity_coefficient: number
    demand_sensitivity: 'high' | 'medium' | 'low'
    optimal_price_range: {
      min: number
      max: number
    }
  }>
  market_analysis: {
    competitor_pricing: Array<{
      competitor: string
      avg_price: number
      market_position: string
    }>
  }
}

export function PriceIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [revenueForecast, setRevenueForecast] = useState<RevenueForecastData | null>(null)
  const [customerSpending, setCustomerSpending] = useState<CustomerSpendingData | null>(null)
  const [priceElasticity, setPriceElasticity] = useState<PriceElasticityData | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState('restaurant-1')

  useEffect(() => {
    loadPriceIntelligenceData()
  }, [selectedRestaurant])

  const loadPriceIntelligenceData = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockRevenueForecast: RevenueForecastData = {
        current_month_revenue: 125000,
        forecasted_revenue: 142000,
        growth_percentage: 13.6,
        confidence_interval: {
          lower: 135000,
          upper: 149000
        },
        monthly_forecast: [
          { month: 'Jan', predicted_revenue: 142000, confidence: 92 },
          { month: 'Feb', predicted_revenue: 148000, confidence: 89 },
          { month: 'Mar', predicted_revenue: 155000, confidence: 85 },
          { month: 'Apr', predicted_revenue: 162000, confidence: 82 }
        ]
      }

      const mockCustomerSpending: CustomerSpendingData = {
        average_order_value: 28.50,
        customer_lifetime_value: 485.00,
        spending_segments: [
          { segment: 'High Spenders', avg_spending: 65.00, customer_count: 234, percentage: 15.2 },
          { segment: 'Regular Customers', avg_spending: 32.00, customer_count: 892, percentage: 58.1 },
          { segment: 'Occasional Diners', avg_spending: 18.50, customer_count: 410, percentage: 26.7 }
        ],
        spending_trends: {
          trend: 'increasing',
          percentage_change: 8.3,
          period: 'last 3 months'
        }
      }

      const mockPriceElasticity: PriceElasticityData = {
        overall_elasticity: -1.2,
        item_elasticity: [
          {
            item_name: 'Signature Burger',
            elasticity_coefficient: -0.8,
            demand_sensitivity: 'low',
            optimal_price_range: { min: 14.99, max: 18.99 }
          },
          {
            item_name: 'Caesar Salad',
            elasticity_coefficient: -1.8,
            demand_sensitivity: 'high',
            optimal_price_range: { min: 10.99, max: 13.99 }
          },
          {
            item_name: 'Craft Pizza',
            elasticity_coefficient: -1.1,
            demand_sensitivity: 'medium',
            optimal_price_range: { min: 16.99, max: 21.99 }
          }
        ],
        market_analysis: {
          competitor_pricing: [
            { competitor: 'Competitor A', avg_price: 24.50, market_position: 'Premium' },
            { competitor: 'Competitor B', avg_price: 18.75, market_position: 'Mid-range' },
            { competitor: 'Competitor C', avg_price: 15.25, market_position: 'Budget' }
          ]
        }
      }

      setRevenueForecast(mockRevenueForecast)
      setCustomerSpending(mockCustomerSpending)
      setPriceElasticity(mockPriceElasticity)
    } catch (error) {
      console.error('Failed to load price intelligence data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600'
      case 'decreasing': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getElasticitySensitivity = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Price Intelligence</h1>
              <p className="text-gray-600">Revenue forecasting, spending analysis, and price optimization</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPriceIntelligenceData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Forecasted Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  ${revenueForecast?.forecasted_revenue.toLocaleString() || 0}
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-green-600 mt-1">
                +{revenueForecast?.growth_percentage.toFixed(1) || 0}% projected growth
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  ${customerSpending?.average_order_value.toFixed(2) || 0}
                </div>
                <Calculator className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Per customer transaction
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Customer LTV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  ${customerSpending?.customer_lifetime_value.toFixed(0) || 0}
                </div>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lifetime customer value
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Price Elasticity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {priceElasticity?.overall_elasticity.toFixed(1) || 0}
                </div>
                <Target className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Overall demand sensitivity
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue-forecast">Revenue Forecast</TabsTrigger>
              <TabsTrigger value="customer-spending">Customer Spending</TabsTrigger>
              <TabsTrigger value="price-elasticity">Price Elasticity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Revenue Forecast Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5" />
                    <span>Revenue Forecast Summary</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered revenue predictions for the next 4 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        ${revenueForecast?.forecasted_revenue.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">Next month forecast</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Confidence Range:</span>
                          <span className="font-medium">
                            ${revenueForecast?.confidence_interval.lower.toLocaleString()} - 
                            ${revenueForecast?.confidence_interval.upper.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Growth Rate:</span>
                          <span className="font-medium text-green-600">
                            +{revenueForecast?.growth_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {revenueForecast?.monthly_forecast.map((month, index) => (
                        <div key={month.month} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium text-gray-900">{month.month}</span>
                          <div className="text-right">
                            <div className="font-semibold">${month.predicted_revenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{month.confidence}% confidence</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Spending Segments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Customer Spending Segments</span>
                  </CardTitle>
                  <CardDescription>
                    Customer segmentation based on spending patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerSpending?.spending_segments.map((segment, index) => (
                      <div key={segment.segment} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900">{segment.segment}</div>
                            <div className="text-sm text-gray-500">
                              {segment.customer_count} customers • {segment.percentage}% of total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${segment.avg_spending.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">avg spending</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue-forecast">
              <RevenueForecastDashboard restaurantId={selectedRestaurant} />
            </TabsContent>

            <TabsContent value="customer-spending">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Spending Analysis</CardTitle>
                  <CardDescription>
                    Detailed analysis of customer spending patterns and behaviors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Customer spending analysis coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="price-elasticity">
              <Card>
                <CardHeader>
                  <CardTitle>Price Elasticity Analysis</CardTitle>
                  <CardDescription>
                    Understanding how price changes affect demand for your menu items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceElasticity?.item_elasticity.map((item, index) => (
                      <div key={item.item_name} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                            <Badge className={getElasticitySensitivity(item.demand_sensitivity)}>
                              {item.demand_sensitivity} sensitivity
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {item.elasticity_coefficient.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">elasticity coefficient</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Optimal price range: ${item.optimal_price_range.min} - ${item.optimal_price_range.max}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
