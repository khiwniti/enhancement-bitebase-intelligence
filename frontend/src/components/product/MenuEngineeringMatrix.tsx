'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Utensils,
  DollarSign,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface MenuItem {
  item_id: string
  item_name: string
  classification: 'star' | 'plow_horse' | 'puzzle' | 'dog'
  popularity_score: number
  profitability_score: number
  current_price: number
  food_cost_percentage: number
  profit_margin: number
  recommendations: string[]
  sales_volume: number
  revenue_contribution: number
}

interface MenuEngineeringProps {
  restaurantId: string
}

export function MenuEngineeringMatrix({ restaurantId }: MenuEngineeringProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedClassification, setSelectedClassification] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'profitability' | 'revenue'>('popularity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadMenuEngineeringData()
  }, [restaurantId])

  const loadMenuEngineeringData = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'
      const response = await fetch(`${API_BASE_URL}/api/v1/product-intelligence/menu-engineering/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        // Transform the data to include mock additional fields
        const transformedItems = data.data.classifications.map((item: any) => ({
          ...item,
          current_price: Math.random() * 20 + 10, // Mock price
          food_cost_percentage: Math.random() * 15 + 25, // Mock food cost %
          profit_margin: Math.random() * 30 + 50, // Mock profit margin
          sales_volume: Math.floor(Math.random() * 100 + 20), // Mock sales volume
          revenue_contribution: Math.random() * 15 + 5 // Mock revenue contribution %
        }))
        setMenuItems(transformedItems)
      }
    } catch (error) {
      console.error('Failed to load menu engineering data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getClassificationConfig = (classification: string) => {
    switch (classification) {
      case 'star':
        return {
          icon: Star,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeColor: 'bg-green-100 text-green-800',
          title: 'Stars',
          description: 'High popularity & profitability'
        }
      case 'plow_horse':
        return {
          icon: Utensils,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeColor: 'bg-blue-100 text-blue-800',
          title: 'Plow Horses',
          description: 'High popularity, lower profitability'
        }
      case 'puzzle':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          title: 'Puzzles',
          description: 'High profitability, lower popularity'
        }
      case 'dog':
        return {
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeColor: 'bg-red-100 text-red-800',
          title: 'Dogs',
          description: 'Low popularity & profitability'
        }
      default:
        return {
          icon: Minus,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeColor: 'bg-gray-100 text-gray-800',
          title: 'Unknown',
          description: 'Classification pending'
        }
    }
  }

  const filteredItems = menuItems.filter(item => 
    selectedClassification === 'all' || item.classification === selectedClassification
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue: number, bValue: number
    
    switch (sortBy) {
      case 'popularity':
        aValue = a.popularity_score
        bValue = b.popularity_score
        break
      case 'profitability':
        aValue = a.profitability_score
        bValue = b.profitability_score
        break
      case 'revenue':
        aValue = a.revenue_contribution
        bValue = b.revenue_contribution
        break
      default:
        aValue = a.popularity_score
        bValue = b.popularity_score
    }

    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
  })

  const classificationCounts = menuItems.reduce((acc, item) => {
    acc[item.classification] = (acc[item.classification] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Classification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['star', 'plow_horse', 'puzzle', 'dog'].map((classification) => {
          const config = getClassificationConfig(classification)
          const count = classificationCounts[classification] || 0
          const percentage = menuItems.length > 0 ? (count / menuItems.length) * 100 : 0
          
          return (
            <motion.div
              key={classification}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedClassification === classification ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedClassification(
                  selectedClassification === classification ? 'all' : classification
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <config.icon className={`h-6 w-6 ${config.color}`} />
                    <Badge className={config.badgeColor}>
                      {count} items
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900">{config.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{config.description}</p>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of menu</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Items Analysis</CardTitle>
              <CardDescription>
                {selectedClassification === 'all' 
                  ? `Showing all ${menuItems.length} menu items`
                  : `Showing ${filteredItems.length} ${getClassificationConfig(selectedClassification).title.toLowerCase()}`
                }
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                {sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="profitability">Sort by Profitability</option>
                <option value="revenue">Sort by Revenue</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading menu analysis...</p>
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No menu items found for the selected filter</p>
              </div>
            ) : (
              sortedItems.map((item, index) => {
                const config = getClassificationConfig(item.classification)
                
                return (
                  <motion.div
                    key={item.item_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <config.icon className={`h-5 w-5 ${config.color}`} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                          <Badge className={`${config.badgeColor} text-xs`}>
                            {config.title.slice(0, -1)} {/* Remove 's' from plural */}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${item.current_price.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.profit_margin.toFixed(1)}% margin
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Popularity Score</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.popularity_score} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{item.popularity_score.toFixed(1)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Profitability Score</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.profitability_score} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{item.profitability_score.toFixed(1)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Sales Volume</div>
                        <div className="text-sm font-medium">{item.sales_volume} orders</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Revenue Share</div>
                        <div className="text-sm font-medium">{item.revenue_contribution.toFixed(1)}%</div>
                      </div>
                    </div>

                    {item.recommendations.length > 0 && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-1">Recommendations:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {item.recommendations.slice(0, 2).map((rec, idx) => (
                            <li key={idx} className="flex items-start space-x-1">
                              <span className="text-orange-500 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
