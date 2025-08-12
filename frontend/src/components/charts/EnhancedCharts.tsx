'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSkeleton } from '@/components/ui/enhanced-interactions'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Eye,
  EyeOff,
  Maximize2,
  Download,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Enhanced color palette
const colors = {
  primary: '#74C365',
  secondary: '#E23D28',
  accent: '#F4C431',
  info: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  neutral: '#6C757D'
}

const chartColors = [
  colors.primary,
  colors.secondary,
  colors.accent,
  colors.info,
  colors.success,
  colors.warning,
  colors.error,
  colors.neutral
]

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-lg shadow-xl p-3"
      >
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </motion.div>
    )
  }
  return null
}

// Enhanced Area Chart Component
interface EnhancedAreaChartProps {
  data: any[]
  title: string
  description?: string
  dataKeys: string[]
  colors?: string[]
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  isLoading?: boolean
  formatValue?: (value: any) => string
  className?: string
}

export const EnhancedAreaChart: React.FC<EnhancedAreaChartProps> = ({
  data,
  title,
  description,
  dataKeys,
  colors: customColors = chartColors,
  height = 300,
  showLegend = true,
  showGrid = true,
  isLoading = false,
  formatValue,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (isLoading) {
    return <LoadingSkeleton variant="chart" className={className} />
  }

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis 
          dataKey="name" 
          stroke="#666"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue}
        />
        <Tooltip 
          content={<CustomTooltip formatter={formatValue} />}
          cursor={{ fill: 'rgba(116, 195, 101, 0.1)' }}
        />
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId="1"
            stroke={customColors[index % customColors.length]}
            fill={customColors[index % customColors.length]}
            fillOpacity={0.6}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative", className)}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                className="h-8 w-8 p-0"
              >
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                {chartContent}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// Enhanced Bar Chart Component
interface EnhancedBarChartProps {
  data: any[]
  title: string
  description?: string
  dataKey: string
  color?: string
  height?: number
  isLoading?: boolean
  formatValue?: (value: any) => string
  className?: string
}

export const EnhancedBarChart: React.FC<EnhancedBarChartProps> = ({
  data,
  title,
  description,
  dataKey,
  color = colors.primary,
  height = 300,
  isLoading = false,
  formatValue,
  className
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  if (isLoading) {
    return <LoadingSkeleton variant="chart" className={className} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative", className)}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatValue}
              />
              <Tooltip 
                content={<CustomTooltip formatter={formatValue} />}
                cursor={{ fill: 'rgba(116, 195, 101, 0.1)' }}
              />
              <Bar 
                dataKey={dataKey} 
                fill={color}
                radius={[4, 4, 0, 0]}
                onMouseEnter={(_, index) => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Enhanced Pie Chart Component
interface EnhancedPieChartProps {
  data: any[]
  title: string
  description?: string
  dataKey: string
  nameKey: string
  height?: number
  isLoading?: boolean
  showValues?: boolean
  className?: string
}

export const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({
  data,
  title,
  description,
  dataKey,
  nameKey,
  height = 300,
  isLoading = false,
  showValues = true,
  className
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (isLoading) {
    return <LoadingSkeleton variant="chart" className={className} />
  }

  const renderLabel = (entry: any) => {
    return showValues ? `${entry[nameKey]}: ${entry[dataKey]}` : entry[nameKey]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative", className)}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]}
                    stroke={activeIndex === index ? '#fff' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Real-time Metrics Display
interface RealTimeMetricsProps {
  metrics: Array<{
    label: string
    value: number | string
    change?: number
    trend?: 'up' | 'down' | 'neutral'
    color?: string
    icon?: React.ReactNode
  }>
  title?: string
  className?: string
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  metrics,
  title = "Live Metrics",
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative", className)}
    >
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-5 w-5 text-blue-600" />
            </motion.div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{metric.label}</span>
                  {metric.icon && (
                    <div className="text-gray-400">
                      {metric.icon}
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: metric.color || colors.primary }}
                  >
                    {metric.value}
                  </span>
                  {metric.change !== undefined && (
                    <div className={cn(
                      "flex items-center text-xs",
                      metric.trend === 'up' && "text-green-600",
                      metric.trend === 'down' && "text-red-600",
                      metric.trend === 'neutral' && "text-gray-600"
                    )}>
                      {metric.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {metric.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(metric.change)}%
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Interactive Dashboard Grid
interface DashboardGridProps {
  children: React.ReactNode
  className?: string
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min",
      className
    )}>
      {children}
    </div>
  )
}

// Chart Container with enhanced features
interface ChartContainerProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
  isLoading?: boolean
  error?: string
  className?: string
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  isLoading = false,
  error,
  className
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (isLoading) {
    return <LoadingSkeleton variant="chart" className={className} />
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error loading chart</div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {subtitle && (
                <CardDescription className="mt-1">{subtitle}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  isRefreshing && "animate-spin"
                )} />
              </Button>
              {actions}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default {
  EnhancedAreaChart,
  EnhancedBarChart,
  EnhancedPieChart,
  RealTimeMetrics,
  DashboardGrid,
  ChartContainer
}
