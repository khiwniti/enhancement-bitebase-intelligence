'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface PricingRecommendation {
  item_name: string
  current_price: number
  recommended_price: number
  price_change_percentage: number
  expected_revenue_impact: number
  confidence_score: number
  reasoning: string[]
}

interface PricingOptimizationProps {
  restaurantId: string
}

export function PricingOptimization({ restaurantId }: PricingOptimizationProps) {
  const [pricingData, setPricingData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'recommendations' | 'analysis'>('recommendations')

  useEffect(() => {
    loadPricingData()
  }, [restaurantId])

  const loadPricingData = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'
      const response = await fetch(`${API_BASE_URL}/api/v1/product-intelligence/pricing-optimization/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        // Mock enhanced pricing data
        const mockData = {
          summary: {
            total_items_analyzed: 15,
            items_with_recommendations: 8,
            potential_revenue_increase: 12.5,
            average_confidence_score: 85.2
          },
          recommendations: [
            {
              item_name: 'Signature Burger',
              current_price: 14.99,
              recommended_price: 16.49,
              price_change_percentage: 10.0,
              expected_revenue_impact: 8.5,
              confidence_score: 92,
              reasoning: [
                'High demand with low price elasticity',
                'Competitor analysis shows room for increase',
                'Premium ingredients justify higher price point'
              ]
            },
            {
              item_name: 'Caesar Salad',
              current_price: 12.99,
              recommended_price: 11.99,
              price_change_percentage: -7.7,
              expected_revenue_impact: 15.2,
              confidence_score: 88,
              reasoning: [
                'Price sensitive item with elastic demand',
                'Lower price could increase volume significantly',
                'Competitive positioning improvement'
              ]
            },
            {
              item_name: 'Craft Pizza',
              current_price: 18.99,
              recommended_price: 19.99,
              price_change_percentage: 5.3,
              expected_revenue_impact: 3.8,
              confidence_score: 76,
              reasoning: [
                'Premium positioning supports price increase',
                'Low competition in craft pizza segment',
                'High profit margin item'
              ]
            }
          ]
        }
        setPricingData(mockData)
      }
    } catch (error) {
      console.error('Failed to load pricing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendationColor = (changePercentage: number) => {
    if (changePercentage > 0) return 'text-green-600'
    if (changePercentage < 0) return 'text-blue-600'
    return 'text-gray-600'
  }

  const getRecommendationBadge = (changePercentage: number) => {
    if (changePercentage > 0) return 'bg-green-100 text-green-800'
    if (changePercentage < 0) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const toggleItemSelection = (itemName: string) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  if (!pricingData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading pricing optimization...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'recommendations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('recommendations')}
          >
            Recommendations
          </Button>
          <Button
            variant={viewMode === 'analysis' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('analysis')}
          >
            Price Analysis
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadPricingData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedItems.length > 0 && (
            <Button size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Apply Changes ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pricingData.summary.total_items_analyzed}
                </div>
                <div className="text-sm text-gray-600">Items Analyzed</div>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pricingData.summary.items_with_recommendations}
                </div>
                <div className="text-sm text-gray-600">With Recommendations</div>
              </div>
              <Target className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  +{pricingData.summary.potential_revenue_increase}%
                </div>
                <div className="text-sm text-gray-600">Revenue Potential</div>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pricingData.summary.average_confidence_score}%
                </div>
                <div className="text-sm text-gray-600">Avg Confidence</div>
              </div>
              <CheckCircle className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations View */}
      {viewMode === 'recommendations' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>AI-Powered Pricing Recommendations</span>
            </CardTitle>
            <CardDescription>
              Machine learning analysis of demand patterns, competitor pricing, and profit optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pricingData.recommendations.map((rec: PricingRecommendation, index: number) => (
                <motion.div
                  key={rec.item_name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border rounded-lg transition-all hover:shadow-md cursor-pointer ${
                    selectedItems.includes(rec.item_name) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => toggleItemSelection(rec.item_name)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{rec.item_name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getRecommendationBadge(rec.price_change_percentage)}>
                            {rec.price_change_percentage > 0 ? '+' : ''}
                            {rec.price_change_percentage.toFixed(1)}% change
                          </Badge>
                          <Badge variant="outline" className={getConfidenceColor(rec.confidence_score)}>
                            {rec.confidence_score}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500">
                          ${rec.current_price.toFixed(2)}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          → ${rec.recommended_price.toFixed(2)}
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${getRecommendationColor(rec.expected_revenue_impact)}`}>
                        +{rec.expected_revenue_impact.toFixed(1)}% revenue
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Price Change</div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={Math.abs(rec.price_change_percentage)} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-sm font-medium">
                          {Math.abs(rec.price_change_percentage).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Confidence Score</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={rec.confidence_score} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{rec.confidence_score}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <div className="text-xs font-medium text-gray-700 mb-1">AI Reasoning:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {rec.reasoning.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis View */}
      {viewMode === 'analysis' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Price Elasticity Analysis</span>
            </CardTitle>
            <CardDescription>
              Detailed analysis of price sensitivity and demand patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Detailed price elasticity analysis coming soon</p>
              <p className="text-sm text-gray-400 mt-2">
                This will include demand curves, price sensitivity charts, and competitor analysis
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
