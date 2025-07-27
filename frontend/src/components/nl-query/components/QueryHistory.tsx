/**
 * BiteBase Intelligence Query History Component
 * Displays user's previous natural language queries and statistics
 */

'use client'

import React, { useState } from 'react'
import { 
  History, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  Search,
  X,
  Filter
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { QueryHistoryProps } from '../types/nlQueryTypes'

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  history,
  onQuerySelect,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'successful' | 'failed'>('all')

  // Filter queries based on search term and filter type
  const filteredQueries = history.queries.filter(query => {
    const matchesSearch = query.query.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'successful' && query.success) ||
      (filterType === 'failed' && !query.success)
    
    return matchesSearch && matchesFilter
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  // Format execution time
  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Get chart type icon
  const getChartTypeIcon = (chartType?: string) => {
    switch (chartType) {
      case 'bar':
      case 'line':
      case 'area':
        return <BarChart3 className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Query History
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Queries</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {history.total}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {Math.round(history.success_rate * 100)}%
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {Math.round(history.avg_confidence * 100)}%
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {history.queries.filter(q => {
              const queryDate = new Date(q.created_at)
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return queryDate > weekAgo
            }).length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'successful' | 'failed')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">All</option>
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Popular Patterns */}
      {history.popular_patterns.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Popular Query Patterns
          </h4>
          <div className="flex flex-wrap gap-2">
            {history.popular_patterns.map((pattern, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {pattern}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Query List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredQueries.length > 0 ? (
          filteredQueries.map((query) => (
            <div
              key={query.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => onQuerySelect(query.query)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    {query.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {query.query}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(query.created_at)}</span>
                    <span>{formatExecutionTime(query.execution_time_ms)}</span>
                    <span>Confidence: {Math.round(query.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {query.chart_type && (
                    <Badge variant="outline" className="text-xs">
                      {getChartTypeIcon(query.chart_type)}
                      <span className="ml-1 capitalize">{query.chart_type}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No queries found</p>
            {searchTerm && (
              <p className="text-sm mt-2">
                Try adjusting your search or filter criteria
              </p>
            )}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredQueries.length > 0 && filteredQueries.length < history.total && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            Load More Queries
          </Button>
        </div>
      )}
    </Card>
  )
}

export default QueryHistory