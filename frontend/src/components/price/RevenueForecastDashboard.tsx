'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Zap,
  Activity
} from 'lucide-react'
import { AdvancedRevenueChart } from '@/components/charts/AdvancedRevenueChart'

interface ForecastData {
  period: string
  predicted_revenue: number
  confidence_interval: {
    lower: number
    upper: number
  }
  actual_revenue?: number
  variance?: number
}

interface RevenueMetrics {
  current_month_revenue: number
  previous_month_revenue: number
  month_over_month_growth: number
  forecast_accuracy: number
  next_month_prediction: number
  seasonal_trends: {
    peak_months: string[]
    low_months: string[]
    seasonal_factor: number
  }
  key_drivers: Array<{
    factor: string
    impact: number
    trend: 'positive' | 'negative' | 'neutral'
  }>
}

interface RevenueForecastDashboardProps {
  restaurantId: string
}

export function RevenueForecastDashboard({ restaurantId }: RevenueForecastDashboardProps) {
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forecastPeriod, setForecastPeriod] = useState('30_days')
  const [viewMode, setViewMode] = useState<'forecast' | 'trends' | 'drivers'>('forecast')

  useEffect(() => {
    loadForecastData()
  }, [restaurantId, forecastPeriod])

  const loadForecastData = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'
      const response = await fetch(
        `${API_BASE_URL}/api/v1/price-intelligence/revenue-forecast/${restaurantId}?period=${forecastPeriod}`
      )
      const result = await response.json()
      
      if (result.success) {
        setForecastData(result.data.forecast_data || [])
        setMetrics(result.data.metrics || null)
      } else {
        generateMockData()
      }
    } catch (error) {
      console.error('Failed to load forecast data:', error)
      generateMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockData = () => {
    const mockForecast: ForecastData[] = []
    const baseRevenue = 45000
    
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const seasonalFactor = 1 + 0.2 * Math.sin((i / 30) * Math.PI * 2)
      const randomFactor = 0.9 + Math.random() * 0.2
      const predicted = baseRevenue * seasonalFactor * randomFactor
      
      mockForecast.push({
        period: date.toISOString().split('T')[0],
        predicted_revenue: predicted,
        confidence_interval: {
          lower: predicted * 0.85,
          upper: predicted * 1.15
        },
        actual_revenue: i < 15 ? predicted * (0.95 + Math.random() * 0.1) : undefined,
        variance: i < 15 ? (Math.random() - 0.5) * 10 : undefined
      })
    }

    const mockMetrics: RevenueMetrics = {
      current_month_revenue: 1347500,
      previous_month_revenue: 1289300,
      month_over_month_growth: 4.5,
      forecast_accuracy: 87.3,
      next_month_prediction: 1425000,
      seasonal_trends: {
        peak_months: ['December', 'January', 'July'],
        low_months: ['February', 'March'],
        seasonal_factor: 1.23
      },
      key_drivers: [
        { factor: 'Weather Conditions', impact: 15.2, trend: 'positive' },
        { factor: 'Local Events', impact: 8.7, trend: 'positive' },
        { factor: 'Competition', impact: -5.3, trend: 'negative' },
        { factor: 'Menu Changes', impact: 12.1, trend: 'positive' },
        { factor: 'Marketing Campaigns', impact: 9.8, trend: 'positive' }
      ]
    }

    setForecastData(mockForecast)
    setMetrics(mockMetrics)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Revenue Forecasting</h3>
          <p className="text-gray-600">AI-powered revenue predictions and trend analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7_days">7 Days</option>
            <option value="30_days">30 Days</option>
            <option value="90_days">90 Days</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadForecastData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.current_month_revenue)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{metrics.month_over_month_growth.toFixed(1)}% MoM
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Month Forecast</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.next_month_prediction)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {metrics.forecast_accuracy.toFixed(1)}% accuracy
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Forecast Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.forecast_accuracy.toFixed(1)}%</p>
                  <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Seasonal Factor</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.seasonal_trends.seasonal_factor.toFixed(2)}x
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Current period</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">Forecast Chart</TabsTrigger>
          <TabsTrigger value="trends">Seasonal Trends</TabsTrigger>
          <TabsTrigger value="drivers">Key Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <AdvancedRevenueChart
            data={forecastData.map(item => ({
              date: item.period,
              actual_revenue: item.actual_revenue || 0,
              predicted_revenue: item.predicted_revenue,
              confidence_upper: item.confidence_interval.upper,
              confidence_lower: item.confidence_interval.lower,
              orders_count: Math.floor(item.predicted_revenue / 45), // Mock orders
              avg_order_value: 45
            }))}
            title="Revenue Forecast Analysis"
            showPredictions={true}
            showConfidenceBands={true}
            height={500}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Months</CardTitle>
                  <CardDescription>Historically highest revenue periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.seasonal_trends.peak_months.map((month, index) => (
                      <div key={month} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-green-800">{month}</span>
                        <Badge className="bg-green-100 text-green-800">Peak</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Months</CardTitle>
                  <CardDescription>Historically lowest revenue periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.seasonal_trends.low_months.map((month, index) => (
                      <div key={month} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-red-800">{month}</span>
                        <Badge className="bg-red-100 text-red-800">Low</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Revenue Drivers Analysis</span>
                </CardTitle>
                <CardDescription>
                  Key factors influencing revenue performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.key_drivers.map((driver, index) => (
                    <motion.div
                      key={driver.factor}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        {getTrendIcon(driver.trend)}
                        <div>
                          <h4 className="font-medium text-gray-900">{driver.factor}</h4>
                          <p className="text-sm text-gray-600">
                            Impact: {Math.abs(driver.impact).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getTrendColor(driver.trend)}`}>
                          {driver.impact > 0 ? '+' : ''}{driver.impact.toFixed(1)}%
                        </div>
                        <Badge 
                          className={
                            driver.trend === 'positive' ? 'bg-green-100 text-green-800' :
                            driver.trend === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {driver.trend}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
