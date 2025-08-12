'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
// Note: Using custom SVG chart implementation to avoid recharts dependency issues
// In production, would use recharts, Chart.js, or D3.js
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Download,
  Settings,
  Maximize2,
  BarChart3
} from 'lucide-react'

interface RevenueDataPoint {
  date: string
  actual_revenue: number
  predicted_revenue: number
  confidence_upper: number
  confidence_lower: number
  orders_count: number
  avg_order_value: number
}

interface AdvancedRevenueChartProps {
  data: RevenueDataPoint[]
  title?: string
  showPredictions?: boolean
  showConfidenceBands?: boolean
  height?: number
  className?: string
}

export function AdvancedRevenueChart({
  data,
  title = "Revenue Forecast Analysis",
  showPredictions: initialShowPredictions = true,
  showConfidenceBands: initialShowConfidenceBands = true,
  height = 400,
  className = ""
}: AdvancedRevenueChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [showOrderVolume, setShowOrderVolume] = useState(false)
  const [showPredictions, setShowPredictions] = useState(initialShowPredictions)
  const [showConfidenceBands, setShowConfidenceBands] = useState(initialShowConfidenceBands)

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    return data.slice(-days)
  }, [data, timeRange])

  // Calculate metrics
  const metrics = useMemo(() => {
    if (filteredData.length === 0) return null

    const actualRevenues = filteredData
      .filter(d => d.actual_revenue > 0)
      .map(d => d.actual_revenue)
    
    const totalActual = actualRevenues.reduce((sum, val) => sum + val, 0)
    const avgDaily = totalActual / actualRevenues.length
    
    const lastWeekData = filteredData.slice(-7)
    const prevWeekData = filteredData.slice(-14, -7)
    
    const lastWeekAvg = lastWeekData.reduce((sum, d) => sum + (d.actual_revenue || 0), 0) / 7
    const prevWeekAvg = prevWeekData.reduce((sum, d) => sum + (d.actual_revenue || 0), 0) / 7
    
    const weekOverWeekGrowth = prevWeekAvg > 0 ? ((lastWeekAvg - prevWeekAvg) / prevWeekAvg) * 100 : 0

    // Calculate forecast accuracy
    const actualVsPredicted = filteredData
      .filter(d => d.actual_revenue > 0 && d.predicted_revenue > 0)
      .map(d => Math.abs(d.actual_revenue - d.predicted_revenue) / d.actual_revenue)
    
    const accuracy = actualVsPredicted.length > 0 
      ? (1 - actualVsPredicted.reduce((sum, val) => sum + val, 0) / actualVsPredicted.length) * 100
      : 0

    return {
      totalRevenue: totalActual,
      avgDailyRevenue: avgDaily,
      weekOverWeekGrowth,
      forecastAccuracy: accuracy
    }
  }, [filteredData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    // Custom SVG chart implementation
    const chartWidth = 800
    const chartHeight = height - 100
    const padding = { top: 20, right: 60, bottom: 40, left: 60 }
    const innerWidth = chartWidth - padding.left - padding.right
    const innerHeight = chartHeight - padding.top - padding.bottom

    if (filteredData.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Advanced Revenue Chart</p>
            <p className="text-gray-400 text-sm">
              Interactive time series with confidence bands and forecasting
            </p>
          </div>
        </div>
      )
    }

    // Calculate scales
    const maxRevenue = Math.max(...filteredData.map(d => Math.max(d.actual_revenue, d.predicted_revenue, d.confidence_upper)))
    const minRevenue = Math.min(...filteredData.map(d => Math.min(d.actual_revenue, d.predicted_revenue, d.confidence_lower)))

    const xScale = (index: number) => (index / (filteredData.length - 1)) * innerWidth
    const yScale = (value: number) => innerHeight - ((value - minRevenue) / (maxRevenue - minRevenue)) * innerHeight

    // Generate path data
    const actualPath = filteredData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.actual_revenue)}`)
      .join(' ')

    const predictedPath = filteredData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.predicted_revenue)}`)
      .join(' ')

    return (
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="border border-gray-200 rounded-lg bg-white">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect x={padding.left} y={padding.top} width={innerWidth} height={innerHeight} fill="url(#grid)" />

          {/* Confidence band */}
          {showConfidenceBands && (
            <path
              d={`M ${padding.left} ${padding.top + yScale(filteredData[0].confidence_upper)}
                  ${filteredData.map((d, i) => `L ${padding.left + xScale(i)} ${padding.top + yScale(d.confidence_upper)}`).join(' ')}
                  ${filteredData.slice().reverse().map((d, i) => `L ${padding.left + xScale(filteredData.length - 1 - i)} ${padding.top + yScale(d.confidence_lower)}`).join(' ')}
                  Z`}
              fill="#3B82F6"
              fillOpacity="0.1"
            />
          )}

          {/* Actual revenue line */}
          <path
            d={actualPath}
            stroke="#10B981"
            strokeWidth="3"
            fill="none"
            transform={`translate(${padding.left}, ${padding.top})`}
          />

          {/* Predicted revenue line */}
          {showPredictions && (
            <path
              d={predictedPath}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              transform={`translate(${padding.left}, ${padding.top})`}
            />
          )}

          {/* Data points */}
          {filteredData.map((d, i) => (
            <g key={i}>
              <circle
                cx={padding.left + xScale(i)}
                cy={padding.top + yScale(d.actual_revenue)}
                r="4"
                fill="#10B981"
                stroke="white"
                strokeWidth="2"
              />
              {showPredictions && (
                <circle
                  cx={padding.left + xScale(i)}
                  cy={padding.top + yScale(d.predicted_revenue)}
                  r="3"
                  fill="#3B82F6"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}

          {/* Y-axis */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} stroke="#666" />

          {/* X-axis */}
          <line x1={padding.left} y1={padding.top + innerHeight} x2={padding.left + innerWidth} y2={padding.top + innerHeight} stroke="#666" />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const value = minRevenue + (maxRevenue - minRevenue) * ratio
            const y = padding.top + innerHeight - ratio * innerHeight
            return (
              <g key={ratio}>
                <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#666" />
                <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#666">
                  ${(value / 1000).toFixed(0)}k
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {filteredData.filter((_, i) => i % Math.ceil(filteredData.length / 6) === 0).map((d, i, arr) => {
            const originalIndex = filteredData.indexOf(d)
            const x = padding.left + xScale(originalIndex)
            return (
              <g key={originalIndex}>
                <line x1={x} y1={padding.top + innerHeight} x2={x} y2={padding.top + innerHeight + 5} stroke="#666" />
                <text x={x} y={padding.top + innerHeight + 20} textAnchor="middle" fontSize="12" fill="#666">
                  {formatDate(d.date)}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(${padding.left + 20}, ${padding.top + 20})`}>
            <rect x="0" y="0" width="200" height="60" fill="white" stroke="#ddd" rx="4" />
            <line x1="10" y1="20" x2="30" y2="20" stroke="#10B981" strokeWidth="3" />
            <text x="35" y="24" fontSize="12" fill="#666">Actual Revenue</text>
            {showPredictions && (
              <>
                <line x1="10" y1="40" x2="30" y2="40" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
                <text x="35" y="44" fontSize="12" fill="#666">Predicted Revenue</text>
              </>
            )}
          </g>
        </svg>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span>{title}</span>
            </CardTitle>
            <CardDescription>
              Interactive revenue analysis with forecasting and confidence intervals
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            >
              {chartType === 'line' ? 'Area' : 'Line'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.totalRevenue)}
              </div>
              <div className="text-xs text-gray-500">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.avgDailyRevenue)}
              </div>
              <div className="text-xs text-gray-500">Daily Average</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold flex items-center justify-center space-x-1 ${
                metrics.weekOverWeekGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.weekOverWeekGrowth >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span>{Math.abs(metrics.weekOverWeekGrowth).toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-500">Week over Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.forecastAccuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Forecast Accuracy</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Time Range:</span>
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showPredictions}
                onChange={(e) => setShowPredictions(e.target.checked)}
                className="rounded"
              />
              <span>Show Predictions</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showConfidenceBands}
                onChange={(e) => setShowConfidenceBands(e.target.checked)}
                className="rounded"
              />
              <span>Confidence Bands</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showOrderVolume}
                onChange={(e) => setShowOrderVolume(e.target.checked)}
                className="rounded"
              />
              <span>Order Volume</span>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderChart()}
        </motion.div>
      </CardContent>
    </Card>
  )
}
