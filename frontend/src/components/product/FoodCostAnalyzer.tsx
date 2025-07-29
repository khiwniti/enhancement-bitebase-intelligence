'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  PieChart,
  BarChart3,
  Package,
  Percent,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface FoodCostData {
  overall_metrics: {
    overall_food_cost_percentage: number
    target_food_cost_percentage: number
    variance_from_target: number
    total_estimated_food_cost: number
    total_estimated_revenue: number
  }
  item_analyses: Array<{
    item_name: string
    cost_analysis: {
      food_cost_percentage: number
      profit_margin: number
      total_cost: number
      ingredient_breakdown: Array<{
        ingredient_name: string
        cost_per_unit: number
        quantity_used: number
        total_cost: number
        percentage_of_item_cost: number
      }>
    }
  }>
  trends: {
    cost_trend: 'increasing' | 'decreasing' | 'stable'
    trend_percentage: number
    period: string
  }
}

interface FoodCostAnalyzerProps {
  restaurantId: string
}

export function FoodCostAnalyzer({ restaurantId }: FoodCostAnalyzerProps) {
  const [foodCostData, setFoodCostData] = useState<FoodCostData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'items' | 'trends'>('overview')

  useEffect(() => {
    loadFoodCostData()
  }, [restaurantId])

  const loadFoodCostData = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'
      const response = await fetch(`${API_BASE_URL}/api/v1/product-intelligence/food-costs/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        // Enhance data with mock ingredient breakdown
        const enhancedData = {
          ...data.data,
          item_analyses: data.data.item_analyses.map((item: any) => ({
            ...item,
            cost_analysis: {
              ...item.cost_analysis,
              ingredient_breakdown: [
                {
                  ingredient_name: 'Primary Protein',
                  cost_per_unit: Math.random() * 5 + 2,
                  quantity_used: Math.random() * 0.5 + 0.2,
                  total_cost: Math.random() * 3 + 1,
                  percentage_of_item_cost: Math.random() * 40 + 30
                },
                {
                  ingredient_name: 'Vegetables',
                  cost_per_unit: Math.random() * 2 + 0.5,
                  quantity_used: Math.random() * 0.3 + 0.1,
                  total_cost: Math.random() * 1.5 + 0.5,
                  percentage_of_item_cost: Math.random() * 20 + 15
                },
                {
                  ingredient_name: 'Seasonings & Spices',
                  cost_per_unit: Math.random() * 1 + 0.2,
                  quantity_used: Math.random() * 0.1 + 0.05,
                  total_cost: Math.random() * 0.5 + 0.1,
                  percentage_of_item_cost: Math.random() * 10 + 5
                }
              ]
            }
          })),
          trends: {
            cost_trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
            trend_percentage: Math.random() * 10 + 2,
            period: 'last 30 days'
          }
        }
        setFoodCostData(enhancedData)
      }
    } catch (error) {
      console.error('Failed to load food cost data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCostStatusColor = (percentage: number, target: number) => {
    const variance = percentage - target
    if (variance <= 0) return 'text-green-600'
    if (variance <= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCostStatusBadge = (percentage: number, target: number) => {
    const variance = percentage - target
    if (variance <= 0) return 'bg-green-100 text-green-800'
    if (variance <= 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Target className="h-4 w-4 text-blue-500" />
    }
  }

  if (!foodCostData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading food cost analysis...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('overview')}
          >
            Overview
          </Button>
          <Button
            variant={viewMode === 'items' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('items')}
          >
            Item Analysis
          </Button>
          <Button
            variant={viewMode === 'trends' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('trends')}
          >
            Cost Trends
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadFoodCostData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Current Food Cost %</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    {foodCostData.overall_metrics.overall_food_cost_percentage.toFixed(1)}%
                  </div>
                  <Percent className="h-6 w-6 text-blue-500" />
                </div>
                <div className="mt-2">
                  <Badge className={getCostStatusBadge(
                    foodCostData.overall_metrics.overall_food_cost_percentage,
                    foodCostData.overall_metrics.target_food_cost_percentage
                  )}>
                    Target: {foodCostData.overall_metrics.target_food_cost_percentage}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Variance from Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-3xl font-bold ${getCostStatusColor(
                    foodCostData.overall_metrics.overall_food_cost_percentage,
                    foodCostData.overall_metrics.target_food_cost_percentage
                  )}`}>
                    {foodCostData.overall_metrics.variance_from_target > 0 ? '+' : ''}
                    {foodCostData.overall_metrics.variance_from_target.toFixed(1)}%
                  </div>
                  {foodCostData.overall_metrics.variance_from_target > 0 ? (
                    <ArrowUp className="h-6 w-6 text-red-500" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {foodCostData.overall_metrics.variance_from_target > 0 
                    ? 'Above target - needs attention' 
                    : 'Within target range'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Food Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    ${foodCostData.overall_metrics.total_estimated_food_cost.toLocaleString()}
                  </div>
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Revenue: ${foodCostData.overall_metrics.total_estimated_revenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Cost Trend Analysis</span>
              </CardTitle>
              <CardDescription>
                Food cost trends over the {foodCostData.trends.period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {getTrendIcon(foodCostData.trends.cost_trend)}
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {foodCostData.trends.cost_trend === 'increasing' ? 'Increasing' : 
                     foodCostData.trends.cost_trend === 'decreasing' ? 'Decreasing' : 'Stable'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {foodCostData.trends.trend_percentage.toFixed(1)}% change over {foodCostData.trends.period}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Items Analysis Mode */}
      {viewMode === 'items' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Item-by-Item Cost Analysis</CardTitle>
              <CardDescription>
                Detailed food cost breakdown for each menu item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {foodCostData.item_analyses.map((item, index) => (
                  <motion.div
                    key={item.item_name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedItem(
                      selectedItem === item.item_name ? null : item.item_name
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge className={getCostStatusBadge(
                            item.cost_analysis.food_cost_percentage,
                            foodCostData.overall_metrics.target_food_cost_percentage
                          )}>
                            {item.cost_analysis.food_cost_percentage.toFixed(1)}% food cost
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {item.cost_analysis.profit_margin.toFixed(1)}% margin
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${item.cost_analysis.total_cost.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total cost</div>
                      </div>
                    </div>

                    {selectedItem === item.item_name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <h5 className="font-medium text-gray-900 mb-3">Ingredient Breakdown</h5>
                        <div className="space-y-2">
                          {item.cost_analysis.ingredient_breakdown.map((ingredient, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">
                                    {ingredient.ingredient_name}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    ${ingredient.total_cost.toFixed(2)}
                                  </span>
                                </div>
                                <Progress 
                                  value={ingredient.percentage_of_item_cost} 
                                  className="h-2 mt-1" 
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {ingredient.percentage_of_item_cost.toFixed(1)}% of item cost
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends Mode */}
      {viewMode === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Cost Trends & Forecasting</span>
            </CardTitle>
            <CardDescription>
              Historical trends and future cost projections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Detailed trend analysis coming soon</p>
              <p className="text-sm text-gray-400 mt-2">
                This will include historical cost charts, seasonal patterns, and AI-powered forecasting
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
