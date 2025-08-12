'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Utensils,
  Settings,
  ChevronRight,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Zap,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { aiInsightsEngine, BusinessMetrics, AIInsight } from '@/services/ai/AIInsightsEngine'
import { exportService } from '@/services/export/ExportService'

interface AIInsightsDashboardProps {
  restaurantId: string
  className?: string
}

export function AIInsightsDashboard({ restaurantId, className = "" }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [implementedActions, setImplementedActions] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadAIInsights()
  }, [restaurantId])

  const loadAIInsights = async () => {
    setIsLoading(true)
    try {
      // Mock business metrics - in production, would fetch from API
      const mockMetrics: BusinessMetrics = {
        revenue: {
          current: 125000,
          previous: 118000,
          trend: 'up',
          forecast: [125000, 128000, 132000, 135000, 140000]
        },
        customers: {
          total: 2450,
          new: 380,
          returning: 2070,
          churn_rate: 12.5
        },
        menu: {
          items: [
            { name: 'Signature Burger', sales: 450, profit_margin: 75, popularity_score: 85 },
            { name: 'Caesar Salad', sales: 320, profit_margin: 68, popularity_score: 72 },
            { name: 'Fish Tacos', sales: 180, profit_margin: 45, popularity_score: 25 },
            { name: 'Pasta Primavera', sales: 95, profit_margin: 52, popularity_score: 18 }
          ],
          performance: 'good'
        },
        operations: {
          peak_hours: ['12:00', '13:00', '18:00', '19:00'],
          staff_efficiency: 78,
          cost_ratios: {
            food_cost: 32,
            labor_cost: 28,
            overhead: 15
          }
        }
      }

      const generatedInsights = await aiInsightsEngine.generateInsights(mockMetrics, {
        focus_areas: ['revenue', 'menu', 'customers', 'operations'],
        time_horizon: 'medium',
        risk_tolerance: 'moderate'
      })

      setInsights(generatedInsights)
    } catch (error) {
      console.error('Failed to load AI insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'recommendation': return <Target className="h-5 w-5 text-blue-500" />
      case 'trend': return <TrendingUp className="h-5 w-5 text-green-500" />
      default: return <Brain className="h-5 w-5 text-purple-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="h-4 w-4" />
      case 'customers': return <Users className="h-4 w-4" />
      case 'menu': return <Utensils className="h-4 w-4" />
      case 'operations': return <Settings className="h-4 w-4" />
      case 'marketing': return <Zap className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredInsights = insights.filter(insight => {
    const categoryMatch = filterCategory === 'all' || insight.category === filterCategory
    const priorityMatch = filterPriority === 'all' || insight.priority === filterPriority
    return categoryMatch && priorityMatch
  })

  const markActionImplemented = (insightId: string, actionIndex: number) => {
    const actionKey = `${insightId}-${actionIndex}`
    setImplementedActions(prev => new Set([...prev, actionKey]))
  }

  const exportInsights = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const reportData = exportService.generateReportData(
        'AI Business Insights Report',
        insights.map(insight => ({
          title: insight.title,
          type: insight.type,
          priority: insight.priority,
          category: insight.category,
          description: insight.description,
          revenue_potential: insight.impact.revenue_potential,
          confidence: insight.impact.confidence,
          timeframe: insight.impact.timeframe,
          actions_count: insight.actions.length
        })),
        restaurantId,
        'ai_insights'
      )

      await exportService.exportDashboard(reportData, {
        format,
        filename: `ai-insights-${restaurantId}-${new Date().toISOString().split('T')[0]}.${format}`,
        includeMetadata: true
      })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const calculateTotalImpact = () => {
    return filteredInsights.reduce((total, insight) => total + insight.impact.revenue_potential, 0)
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Generating AI insights...</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <span>AI Business Insights</span>
          </h3>
          <p className="text-gray-600">Machine learning-powered recommendations for your restaurant</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => exportInsights('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadAIInsights} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Insights</p>
                <p className="text-2xl font-bold text-gray-900">{filteredInsights.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredInsights.filter(i => i.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(calculateTotalImpact() / 1000).toFixed(0)}k
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
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredInsights.length > 0 
                    ? Math.round(filteredInsights.reduce((sum, i) => sum + i.impact.confidence, 0) / filteredInsights.length)
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filters:</span>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="revenue">Revenue</option>
          <option value="menu">Menu</option>
          <option value="customers">Customers</option>
          <option value="operations">Operations</option>
          <option value="marketing">Marketing</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getInsightIcon(insight.type)}
                        <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          {getCategoryIcon(insight.category)}
                          <span>{insight.category}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{insight.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600 flex items-center justify-center">
                            {insight.impact.revenue_potential >= 0 ? (
                              <ArrowUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDown className="h-4 w-4 mr-1" />
                            )}
                            ${Math.abs(insight.impact.revenue_potential).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Revenue Impact</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{insight.impact.confidence}%</div>
                          <div className="text-xs text-gray-600">Confidence</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600 flex items-center justify-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {insight.impact.timeframe}
                          </div>
                          <div className="text-xs text-gray-600">Timeframe</div>
                        </div>
                      </div>

                      {/* Action Items */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Recommended Actions:</h5>
                        <div className="space-y-2">
                          {insight.actions.map((action, actionIndex) => {
                            const actionKey = `${insight.id}-${actionIndex}`
                            const isImplemented = implementedActions.has(actionKey)
                            
                            return (
                              <div
                                key={actionIndex}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  isImplemented ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    isImplemented ? 'text-green-800 line-through' : 'text-gray-900'
                                  }`}>
                                    {action.action}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">{action.expected_outcome}</p>
                                  <Badge 
                                    variant="outline" 
                                    className="mt-1 text-xs"
                                  >
                                    {action.effort} effort
                                  </Badge>
                                </div>
                                <Button
                                  variant={isImplemented ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => markActionImplemented(insight.id, actionIndex)}
                                  disabled={isImplemented}
                                >
                                  {isImplemented ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    'Mark Done'
                                  )}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-8">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No insights match your current filters</p>
          <p className="text-gray-400 text-sm">Try adjusting your filter criteria</p>
        </div>
      )}
    </div>
  )
}
