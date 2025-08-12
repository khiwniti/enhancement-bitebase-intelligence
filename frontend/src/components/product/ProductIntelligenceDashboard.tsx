'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FoodCostAnalyzer } from './FoodCostAnalyzer'
import { MenuEngineeringMatrix } from './MenuEngineeringMatrix'
import {
  ChefHat,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
  Target,
  Star,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  Utensils,
  Package,
  Percent,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface MenuEngineeringData {
  summary: {
    total_items: number
    health_score: number
    counts: {
      star: number
      dog: number
      plow_horse: number
      puzzle: number
    }
  }
  classifications: Array<{
    item_id: string
    item_name: string
    classification: string
    popularity_score: number
    profitability_score: number
    recommendations: string[]
  }>
}

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
    }
  }>
}

export function ProductIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [menuEngineeringData, setMenuEngineeringData] = useState<MenuEngineeringData | null>(null)
  const [foodCostData, setFoodCostData] = useState<FoodCostData | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState('restaurant-1')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadProductIntelligenceData()
  }, [selectedRestaurant])

  const loadProductIntelligenceData = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'
      
      // Load menu engineering data
      const menuResponse = await fetch(`${API_BASE_URL}/api/v1/product-intelligence/menu-engineering/${selectedRestaurant}`)
      const menuData = await menuResponse.json()
      if (menuData.success) {
        setMenuEngineeringData(menuData.data)
      }

      // Load food cost data
      const costResponse = await fetch(`${API_BASE_URL}/api/v1/product-intelligence/food-costs/${selectedRestaurant}`)
      const costData = await costResponse.json()
      if (costData.success) {
        setFoodCostData(costData.data)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load product intelligence data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'star': return 'bg-green-100 text-green-800 border-green-200'
      case 'plow_horse': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'puzzle': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'dog': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'star': return <Star className="h-4 w-4" />
      case 'plow_horse': return <Utensils className="h-4 w-4" />
      case 'puzzle': return <AlertTriangle className="h-4 w-4" />
      case 'dog': return <TrendingDown className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Intelligence</h1>
              <p className="text-gray-600">Menu engineering, cost analysis, and pricing optimization</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadProductIntelligenceData}
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
              <CardTitle className="text-sm font-medium text-gray-600">Menu Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {menuEngineeringData?.summary.health_score || 0}/10
                </div>
                <Star className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on menu engineering analysis
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Food Cost %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {foodCostData?.overall_metrics.overall_food_cost_percentage?.toFixed(1) || 0}%
                </div>
                <Percent className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Target: {foodCostData?.overall_metrics.target_food_cost_percentage || 30}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Star Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {menuEngineeringData?.summary.counts.star || 0}
                </div>
                <Star className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                High popularity & profitability
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Items Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {(menuEngineeringData?.summary.counts.dog || 0) + (menuEngineeringData?.summary.counts.puzzle || 0)}
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dogs + Puzzles requiring action
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
              <TabsTrigger value="menu-engineering">Menu Engineering</TabsTrigger>
              <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Menu Engineering Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Menu Engineering Matrix</span>
                  </CardTitle>
                  <CardDescription>
                    Distribution of menu items across the classic menu engineering categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-800">
                        {menuEngineeringData?.summary.counts.star || 0}
                      </div>
                      <div className="text-sm text-green-600">Stars</div>
                      <div className="text-xs text-gray-500 mt-1">Promote heavily</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Utensils className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-800">
                        {menuEngineeringData?.summary.counts.plow_horse || 0}
                      </div>
                      <div className="text-sm text-blue-600">Plow Horses</div>
                      <div className="text-xs text-gray-500 mt-1">Increase margins</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-800">
                        {menuEngineeringData?.summary.counts.puzzle || 0}
                      </div>
                      <div className="text-sm text-yellow-600">Puzzles</div>
                      <div className="text-xs text-gray-500 mt-1">Increase popularity</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-800">
                        {menuEngineeringData?.summary.counts.dog || 0}
                      </div>
                      <div className="text-sm text-red-600">Dogs</div>
                      <div className="text-xs text-gray-500 mt-1">Consider removal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Analysis Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Cost Analysis Summary</span>
                  </CardTitle>
                  <CardDescription>
                    Overall food cost performance and variance from targets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {foodCostData?.overall_metrics.overall_food_cost_percentage?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Current Food Cost</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Target: {foodCostData?.overall_metrics.target_food_cost_percentage || 30}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        (foodCostData?.overall_metrics.variance_from_target || 0) > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {(foodCostData?.overall_metrics.variance_from_target || 0) > 0 ? '+' : ''}
                        {foodCostData?.overall_metrics.variance_from_target?.toFixed(1) || '0.0'}%
                      </div>
                      <div className="text-sm text-gray-600">Variance from Target</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(foodCostData?.overall_metrics.variance_from_target || 0) > 0 
                          ? 'Above target' 
                          : 'Within target'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        ${foodCostData?.overall_metrics.total_estimated_food_cost?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Food Costs</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Revenue: ${foodCostData?.overall_metrics.total_estimated_revenue?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="menu-engineering">
              <MenuEngineeringMatrix restaurantId={selectedRestaurant} />
            </TabsContent>

            <TabsContent value="cost-analysis">
              <FoodCostAnalyzer restaurantId={selectedRestaurant} />
            </TabsContent>

            <TabsContent value="pricing">
              {/* Pricing Optimization view */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Optimization</CardTitle>
                  <CardDescription>
                    AI-powered pricing recommendations and profit optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Pricing Optimization component will be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-500"
        >
          Last updated: {lastUpdated.toLocaleString()}
        </motion.div>
      </div>
    </div>
  )
}
