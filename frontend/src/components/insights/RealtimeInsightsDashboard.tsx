/**
 * BiteBase Intelligence Real-time Insights Dashboard
 * Main dashboard component for displaying and managing automated insights
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Filter, 
  Download, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus
} from 'lucide-react'

import InsightCard from './components/InsightCard'
import useRealtimeInsights from './hooks/useRealtimeInsights'
import type { 
  RealtimeInsightsDashboardProps,
  InsightSearchParams,
  InsightFeedbackCreate,
  InsightResponse,
  InsightSeverityEnum,
  InsightStatusEnum,
  InsightTypeEnum
} from './types/insightsTypes'

const RealtimeInsightsDashboard: React.FC<RealtimeInsightsDashboardProps> = ({
  userId = 'current-user',
  restaurantId,
  autoRefresh = true,
  refreshInterval = 30000,
  showFilters = true,
  showMetrics = true,
  compact = false
}) => {
  // Hooks
  const {
    insights,
    isLoading,
    error,
    isConnected,
    connectionStatus,
    metrics,
    fetchInsights,
    updateInsight,
    submitFeedback,
    generateInsights,
    getMetrics,
    subscribeToRestaurant,
    clearError
  } = useRealtimeInsights(userId)

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Partial<InsightSearchParams>>({
    limit: 20,
    sort_by: 'detected_at',
    sort_order: 'desc'
  })
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectedInsights, setSelectedInsights] = useState<Set<string>>(new Set())

  // Filter insights based on search query
  const filteredInsights = insights.filter(insight => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      insight.title.toLowerCase().includes(query) ||
      insight.description.toLowerCase().includes(query) ||
      insight.explanation.toLowerCase().includes(query)
    )
  })

  // Group insights by severity for display
  const insightsBySeverity = filteredInsights.reduce((acc, insight) => {
    if (!acc[insight.severity]) {
      acc[insight.severity] = []
    }
    acc[insight.severity].push(insight)
    return acc
  }, {} as Record<InsightSeverityEnum, InsightResponse[]>)

  // Calculate summary statistics
  const summaryStats = {
    total: filteredInsights.length,
    active: filteredInsights.filter(i => i.status === 'active').length,
    critical: filteredInsights.filter(i => i.severity === 'critical').length,
    avgConfidence: filteredInsights.length > 0 
      ? filteredInsights.reduce((sum, i) => sum + i.confidence_score, 0) / filteredInsights.length 
      : 0
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await fetchInsights({
        ...filters,
        restaurant_id: restaurantId
      })
      
      if (showMetrics) {
        await getMetrics()
      }
    }

    loadData()
  }, [fetchInsights, getMetrics, showMetrics, restaurantId, filters])

  // Subscribe to restaurant updates
  useEffect(() => {
    if (restaurantId && isConnected) {
      subscribeToRestaurant(restaurantId)
    }
  }, [restaurantId, isConnected, subscribeToRestaurant])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      await fetchInsights({
        ...filters,
        restaurant_id: restaurantId
      })
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchInsights, filters, restaurantId])

  // Handle insight actions
  const handleAcknowledge = useCallback(async (insightId: string) => {
    try {
      await updateInsight(insightId, {
        status: 'acknowledged',
        acknowledged_by: userId
      })
    } catch (error) {
      console.error('Failed to acknowledge insight:', error)
    }
  }, [updateInsight, userId])

  const handleResolve = useCallback(async (insightId: string) => {
    try {
      await updateInsight(insightId, {
        status: 'resolved',
        resolved_by: userId
      })
    } catch (error) {
      console.error('Failed to resolve insight:', error)
    }
  }, [updateInsight, userId])

  const handleDismiss = useCallback(async (insightId: string) => {
    try {
      await updateInsight(insightId, {
        status: 'dismissed'
      })
    } catch (error) {
      console.error('Failed to dismiss insight:', error)
    }
  }, [updateInsight])

  const handleFeedback = useCallback(async (insightId: string, feedback: InsightFeedbackCreate) => {
    try {
      await submitFeedback(insightId, {
        ...feedback,
        user_id: userId
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }, [submitFeedback, userId])

  const handleGenerateInsights = useCallback(async () => {
    try {
      await generateInsights({
        restaurant_ids: restaurantId ? [restaurantId] : undefined,
        force_regenerate: true
      })
    } catch (error) {
      console.error('Failed to generate insights:', error)
    }
  }, [generateInsights, restaurantId])

  const handleRefresh = useCallback(async () => {
    await fetchInsights({
      ...filters,
      restaurant_id: restaurantId
    })
  }, [fetchInsights, filters, restaurantId])

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500' : 
        connectionStatus === 'connecting' ? 'bg-yellow-500' : 
        'bg-red-500'
      }`} />
      <span className="text-xs text-gray-500 capitalize">
        {connectionStatus}
      </span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-time Insights</h1>
          <p className="text-gray-600">Automated business intelligence and anomaly detection</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ConnectionStatus />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateInsights}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generate</span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Insights</p>
                  <p className="text-2xl font-bold">{summaryStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{summaryStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Critical</p>
                  <p className="text-2xl font-bold">{summaryStats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold">{Math.round(summaryStats.avgConfidence * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {showFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={filters.severity || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    severity: e.target.value as InsightSeverityEnum || undefined
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: e.target.value as InsightStatusEnum || undefined
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={filters.insight_type || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    insight_type: e.target.value as InsightTypeEnum || undefined
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="revenue_anomaly">Revenue Anomaly</option>
                  <option value="customer_pattern_change">Customer Pattern</option>
                  <option value="menu_performance">Menu Performance</option>
                  <option value="seasonal_trend">Seasonal Trend</option>
                  <option value="location_comparison">Location Comparison</option>
                  <option value="operational_insight">Operational</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  limit: 20,
                  sort_by: 'detected_at',
                  sort_order: 'desc'
                })}
              >
                Clear Filters
              </Button>
              
              <Button
                size="sm"
                onClick={() => {
                  fetchInsights({
                    ...filters,
                    restaurant_id: restaurantId
                  })
                  setShowFiltersPanel(false)
                }}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights List */}
      <div className="space-y-4">
        {isLoading && filteredInsights.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading insights...</span>
          </div>
        ) : filteredInsights.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? "Try adjusting your search or filters" 
                  : "No insights have been generated yet"}
              </p>
              <Button onClick={handleGenerateInsights} disabled={isLoading}>
                Generate Insights
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Group by severity and display
          Object.entries(insightsBySeverity)
            .sort(([a], [b]) => {
              const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
              return severityOrder[a as InsightSeverityEnum] - severityOrder[b as InsightSeverityEnum]
            })
            .map(([severity, severityInsights]) => (
              <div key={severity}>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className={
                    severity === 'critical' ? 'bg-red-100 text-red-800' :
                    severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {severity.toUpperCase()} ({severityInsights.length})
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {severityInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onAcknowledge={handleAcknowledge}
                      onResolve={handleResolve}
                      onDismiss={handleDismiss}
                      onFeedback={handleFeedback}
                      compact={compact}
                      showActions={true}
                    />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Load More */}
      {filteredInsights.length >= (filters.limit || 20) && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              setFilters(prev => ({
                ...prev,
                limit: (prev.limit || 20) + 20
              }))
            }}
            disabled={isLoading}
          >
            Load More Insights
          </Button>
        </div>
      )}
    </div>
  )
}

export default RealtimeInsightsDashboard