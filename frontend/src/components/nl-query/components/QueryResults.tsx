/**
 * BiteBase Intelligence Query Results Component
 * Displays the results of natural language query processing
 */

'use client'

import React, { useState } from 'react'
import { 
  BarChart3, 
  Download, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Zap
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer } from '@/components/charts/core/ChartContainer'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import type { QueryResultsProps } from '../types/nlQueryTypes'

export const QueryResults: React.FC<QueryResultsProps> = ({
  result,
  onAddToDashboard,
  onRegenerateChart
}) => {
  const [activeTab, setActiveTab] = useState('chart')
  const [isExporting, setIsExporting] = useState(false)

  // Handle chart export
  const handleExport = async (format: 'png' | 'pdf' | 'csv') => {
    setIsExporting(true)
    try {
      // Implementation would depend on chart library
      console.log(`Exporting chart as ${format}`)
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle add to dashboard
  const handleAddToDashboard = () => {
    if (result.chart_config && onAddToDashboard) {
      onAddToDashboard(result.chart_config)
    }
  }

  // Format execution time
  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Get status color based on confidence
  const getStatusColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get status icon based on success and confidence
  const getStatusIcon = () => {
    if (!result.success) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
    if (result.confidence.overall_confidence >= 0.8) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Query Results
            </h3>
            <Badge variant={result.success ? 'default' : 'destructive'}>
              {result.success ? 'Success' : 'Failed'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            "{result.original_query}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {result.success && result.chart_config && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToDashboard}
                className="flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add to Dashboard</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('png')}
                disabled={isExporting}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateChart}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Regenerate</span>
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{formatExecutionTime(result.execution_time_ms)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Database className="h-4 w-4" />
          <span>{result.chart_data?.metadata?.total_records || 0} records</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Zap className="h-4 w-4" />
          <span className={getStatusColor(result.confidence.overall_confidence)}>
            {Math.round(result.confidence.overall_confidence * 100)}% confidence
          </span>
        </div>
      </div>

      {/* Confidence Indicator */}
      <ConfidenceIndicator confidence={result.confidence} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="query">Query Details</TabsTrigger>
        </TabsList>

        {/* Chart Tab */}
        <TabsContent value="chart" className="space-y-4">
          {result.success && result.chart_data && result.chart_config ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  {result.chart_config.title}
                </h4>
                <Badge variant="outline">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {result.chart_config.type}
                </Badge>
              </div>
              
              <ChartContainer
                type={result.chart_config.type as string}
                data={result.chart_data}
                options={result.chart_config.options}
                className="h-96"
              />
              
              {result.chart_config.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result.chart_config.description}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No chart data available</p>
              {result.errors.length > 0 && (
                <div className="mt-4 text-sm text-red-600 dark:text-red-400">
                  {result.errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-4">
          {result.chart_data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  Raw Data
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                >
                  Export CSV
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Label
                      </th>
                      {result.chart_data.datasets.map((dataset, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {dataset.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {result.chart_data.labels.map((label, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {label}
                        </td>
                        {result.chart_data!.datasets.map((dataset, datasetIndex) => (
                          <td
                            key={datasetIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                          >
                            {dataset.data[index] || 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data available</p>
            </div>
          )}
        </TabsContent>

        {/* Query Details Tab */}
        <TabsContent value="query" className="space-y-4">
          <div className="space-y-6">
            {/* Intent Analysis */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Intent Analysis
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {result.processed_query.intent.intent_type.replace('_', ' ').toUpperCase()}
                  </span>
                  <Badge variant="outline">
                    {Math.round(result.processed_query.intent.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result.processed_query.intent.description}
                </p>
              </div>
            </div>

            {/* Extracted Entities */}
            {result.processed_query.entities.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Extracted Entities
                </h4>
                <div className="space-y-2">
                  {result.processed_query.entities.map((entity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    >
                      <div>
                        <span className="text-sm font-medium capitalize">
                          {entity.entity_type.replace('_', ' ')}:
                        </span>
                        <span className="text-sm ml-2">{entity.value}</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round(entity.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated SQL */}
            {result.generated_sql && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Generated SQL
                </h4>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    {result.generated_sql}
                  </pre>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Suggestions for Improvement
                </h4>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="text-blue-500">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

export default QueryResults