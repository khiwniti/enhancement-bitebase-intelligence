/**
 * BiteBase Intelligence Natural Language Query Page
 * Dedicated page for natural language query interface
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { NaturalLanguageQueryInterface } from '@/components/nl-query'
import { ChartContainer } from '@/components/charts/core/ChartContainer'
import type { ChartConfig } from '@/components/nl-query/types/nlQueryTypes'

export default function NaturalLanguageQueryPage() {
  const router = useRouter()
  const [generatedCharts, setGeneratedCharts] = useState<Array<{
    id: string
    config: ChartConfig
    data: Record<string, unknown>
    timestamp: Date
  }>>([])

  // Handle chart generation from NL query
  const handleChartGenerated = (chartData: Record<string, unknown>) => {
    // Create a new chart entry
    const newChart = {
      id: `chart-${Date.now()}`,
      config: {
        type: chartData.type || 'bar',
        title: chartData.title || 'Generated Chart',
        description: chartData.description,
        options: chartData.options || {}
      } as ChartConfig,
      data: chartData,
      timestamp: new Date()
    }

    setGeneratedCharts(prev => [newChart, ...prev])
  }

  // Handle adding chart to dashboard
  const handleAddToDashboard = (chartConfig: any) => {
    // Navigate to dashboard builder with chart config
    const chartData = generatedCharts.find(chart => chart.config.title === chartConfig.title)
    if (chartData) {
      // Store chart data in session storage for dashboard builder
      sessionStorage.setItem('pendingChart', JSON.stringify({
        config: chartConfig,
        data: chartData.data
      }))

      // Navigate to dashboard builder
      router.push('/dashboard/builder')
    }
  }

  // Remove chart from generated list
  const handleRemoveChart = (chartId: string) => {
    setGeneratedCharts(prev => prev.filter(chart => chart.id !== chartId))
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Natural Language Query
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ask questions about your restaurant data in plain English
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push('/dashboard/builder')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Dashboard Builder</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Natural Language Query Interface */}
          <div className="lg:col-span-2">
            <NaturalLanguageQueryInterface
              onChartGenerated={handleChartGenerated}
              onAddToDashboard={handleAddToDashboard}
            />
          </div>

          {/* Generated Charts Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Generated Charts
              </h3>

              {generatedCharts.length > 0 ? (
                <div className="space-y-4">
                  {generatedCharts.map((chart) => (
                    <div
                      key={chart.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {chart.config.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToDashboard(chart.config as unknown as Record<string, unknown>)}
                            className="text-xs"
                          >
                            Add to Dashboard
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveChart(chart.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="h-32 mb-2">
                        <ChartContainer
                          id={chart.id}
                          type={chart.config.type as any}
                          data={chart.data as any}
                          options={{
                            ...chart.config.options,
                            maintainAspectRatio: false,
                            plugins: {
                              ...chart.config.options.plugins,
                              legend: {
                                display: false
                              }
                            }
                          } as any}
                          className="h-full"
                        />
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Generated {chart.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8" />
                  </div>
                  <p className="text-sm">No charts generated yet</p>
                  <p className="text-xs mt-1">
                    Ask a question to generate your first chart
                  </p>
                </div>
              )}
            </Card>

            {/* Quick Tips */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Be specific about time periods: &quot;last month&quot;, &quot;Q4 2023&quot;</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Include location details: &quot;downtown location&quot;, &quot;all branches&quot;</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Use comparison words: &quot;compare&quot;, &quot;versus&quot;, &quot;top 10&quot;</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Try trend analysis: &quot;show trends&quot;, &quot;over time&quot;</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
