'use client'

// Base Chart Component - Foundation for all chart types
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { BaseChartProps, ChartDimensions } from '../types/chartTypes'
import { useChartProvider } from '../providers/ChartProvider'
import { useCrossFilterProvider } from '../providers/CrossFilterProvider'
import { useThemeProvider } from '../providers/ThemeProvider'
import { cn } from '@/lib/utils'

// Chart Reference Interface
export interface ChartRef {
  getChart: () => Record<string, unknown> | null
  updateData: (data: Record<string, unknown>) => void
  resize: () => void
  destroy: () => void
  exportChart: (format: 'png' | 'jpg' | 'svg') => string | null
}

// Base Chart Component
export const BaseChart = forwardRef<ChartRef, BaseChartProps>(({
  id,
  type,
  data,
  options = {},
  dimensions = {},
  theme: customTheme,
  performance = {},
  accessibility = {},
  className = '',
  style = {},
  onChartReady,
  onDataClick,
  onHover,
  onResize,
  children
}, ref) => {
  // Refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<Record<string, unknown> | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartReady, setChartReady] = useState(false)

  // Context hooks
  const { registerChart, unregisterChart, updateChart, state: chartState } = useChartProvider()
  const { applyFilter, getActiveFiltersForChart } = useCrossFilterProvider()
  const { theme, getChartColors } = useThemeProvider()

  // Merged configuration
  const mergedTheme = customTheme ? { ...theme, ...customTheme } : theme
  const mergedPerformance = useMemo(() => ({ ...chartState.performance, ...performance }), [chartState.performance, performance])
  const mergedAccessibility = {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    colorBlindFriendly: true,
    highContrast: false,
    ...accessibility
  }

  // Chart dimensions with responsive defaults
  const chartDimensions: Required<ChartDimensions> = {
    width: dimensions.width || 400,
    height: dimensions.height || 300,
    aspectRatio: dimensions.aspectRatio || 2,
    maintainAspectRatio: dimensions.maintainAspectRatio ?? true,
    responsive: dimensions.responsive ?? true
  }

  // Initialize chart
  const initializeChart = useCallback(async () => {
    if (!canvasRef.current || chartInstanceRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      // Dynamic import based on chart type and performance settings
      const chartModule = await loadChartModule(type, mergedPerformance)
      
      if (!chartModule) {
        throw new Error(`Chart type "${type}" is not supported`)
      }

      // Prepare chart configuration
      const chartConfig = prepareChartConfig({
        type,
        data,
        options,
        theme: mergedTheme,
        dimensions: chartDimensions,
        accessibility: mergedAccessibility,
        onDataClick,
        onHover
      })

      // Create chart instance
      const chartInstance = new chartModule.Chart(canvasRef.current, chartConfig)
      chartInstanceRef.current = chartInstance

      // Register with provider
      registerChart(id, type, chartInstance)

      // Setup event listeners
      setupEventListeners(chartInstance)

      // Setup resize observer
      setupResizeObserver()

      setChartReady(true)
      setIsLoading(false)
      
      onChartReady?.(chartInstance)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chart'
      setError(errorMessage)
      setIsLoading(false)
      console.error('Chart initialization error:', err)
    }
  }, [
    type, data, options, mergedTheme, chartDimensions, 
    mergedAccessibility, onDataClick, onHover, onChartReady,
    registerChart, id, mergedPerformance, loadChartModule, prepareChartConfig, setupEventListeners, setupResizeObserver
  ])

  // Load chart module dynamically
  const loadChartModule = useCallback(async (chartType: string, performanceConfig: Record<string, unknown>) => {
    // Implement lazy loading based on performance configuration
    if (performanceConfig.enableLazyLoading) {
      switch (chartType) {
        case 'line':
        case 'bar':
        case 'pie':
        case 'doughnut':
          // Basic Chart.js charts
          return await import('chart.js/auto')
        
        case 'treemap':
          return await import('chartjs-chart-treemap')
        
        case 'sankey':
          return await import('chartjs-chart-sankey')
        
        // Add more dynamic imports for other chart types
        default:
          return await import('chart.js/auto')
      }
    } else {
      // Load all modules upfront
      return await import('chart.js/auto')
    }
  }, [])

  // Prepare chart configuration
  const prepareChartConfig = useCallback((config: Record<string, unknown>) => {
    const { type, data, options, theme, dimensions, accessibility } = config

    // Base configuration
    const chartConfig: Record<string, unknown> = {
      type,
      data: {
        ...data,
        datasets: data.datasets?.map((dataset: Record<string, unknown>, index: number) => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || getChartColors(data.datasets.length)[index],
          borderColor: dataset.borderColor || getChartColors(data.datasets.length)[index],
        }))
      },
      options: {
        responsive: dimensions.responsive,
        maintainAspectRatio: dimensions.maintainAspectRatio,
        aspectRatio: dimensions.aspectRatio,
        
        // Theme-based styling
        color: theme.charts.foreground.primary,
        backgroundColor: theme.charts.background.primary,
        
        // Accessibility enhancements
        plugins: {
          legend: {
            display: true,
            labels: {
              color: theme.charts.legend.text,
              font: {
                family: theme.typography.fontFamily.primary,
                size: theme.typography.fontSize.sm
              }
            }
          },
          tooltip: {
            backgroundColor: theme.charts.tooltip.background,
            titleColor: theme.charts.tooltip.text,
            bodyColor: theme.charts.tooltip.text,
            borderColor: theme.charts.tooltip.border,
            borderWidth: 1
          }
        },
        
        scales: type !== 'pie' && type !== 'doughnut' ? {
          x: {
            grid: {
              color: theme.charts.grid.primary
            },
            ticks: {
              color: theme.charts.axis.text,
              font: {
                family: theme.typography.fontFamily.primary,
                size: theme.typography.fontSize.xs
              }
            }
          },
          y: {
            grid: {
              color: theme.charts.grid.primary
            },
            ticks: {
              color: theme.charts.axis.text,
              font: {
                family: theme.typography.fontFamily.primary,
                size: theme.typography.fontSize.xs
              }
            }
          }
        } : undefined,
        
        // Performance optimizations
        animation: {
          duration: mergedPerformance.animationDuration
        },
        
        // Event handlers
        onClick: config.onDataClick,
        onHover: config.onHover,
        
        // Merge with custom options
        ...options
      }
    }

    // Add accessibility attributes
    if (accessibility.enableScreenReader) {
      chartConfig.options.plugins = {
        ...chartConfig.options.plugins,
        accessibility: {
          enabled: true
        }
      }
    }

    return chartConfig
  }, [getChartColors, mergedPerformance])

  // Setup event listeners
  const setupEventListeners = useCallback((chartInstance: Record<string, unknown>) => {
    // Add custom event listeners for cross-filtering
    chartInstance.options.onClick = (event: Record<string, unknown>, elements: Record<string, unknown>[]) => {
      if (elements.length > 0 && chartState.crossFilter.mode === 'automatic') {
        // Implement automatic cross-filtering logic
        const element = elements[0]
        const dataIndex = element.index
        const datasetIndex = element.datasetIndex
        
        // Create filter based on clicked data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const filterValue = data.labels?.[dataIndex] || data.datasets[datasetIndex].data[dataIndex]
        
        // Apply filter through cross-filter provider
        // This would be implemented based on specific filtering requirements
      }
      
      onDataClick?.(event, elements)
    }
  }, [chartState.crossFilter.mode, data, onDataClick])

  // Setup resize observer
  const setupResizeObserver = useCallback(() => {
    if (!containerRef.current || !chartDimensions.responsive) return

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.resize()
          onResize?.(chartInstanceRef.current, {
            width: entry.contentRect.width,
            height: entry.contentRect.height
          })
        }
      }
    })

    resizeObserverRef.current.observe(containerRef.current)
  }, [chartDimensions.responsive, onResize])

  // Update chart data
  const updateChartData = useCallback((newData: Record<string, unknown>) => {
    if (!chartInstanceRef.current) return

    chartInstanceRef.current.data = newData
    chartInstanceRef.current.update('none') // No animation for performance
    updateChart(id, chartInstanceRef.current)
  }, [id, updateChart])

  // Resize chart
  const resizeChart = useCallback(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resize()
    }
  }, [])

  // Destroy chart
  const destroyChart = useCallback(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
      chartInstanceRef.current = null
    }
    
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
      resizeObserverRef.current = null
    }
    
    unregisterChart(id)
    setChartReady(false)
  }, [id, unregisterChart])

  // Export chart
  const exportChart = useCallback((format: 'png' | 'jpg' | 'svg') => {
    if (!chartInstanceRef.current) return null

    try {
      const canvas = chartInstanceRef.current.canvas
      if (format === 'svg') {
        // SVG export would require additional library
        console.warn('SVG export not implemented yet')
        return null
      }
      
      return canvas.toDataURL(`image/${format}`)
    } catch (error) {
      console.error('Chart export error:', error)
      return null
    }
  }, [])

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getChart: () => chartInstanceRef.current,
    updateData: updateChartData,
    resize: resizeChart,
    destroy: destroyChart,
    exportChart
  }), [updateChartData, resizeChart, destroyChart, exportChart])

  // Initialize chart on mount
  useEffect(() => {
    initializeChart()
    
    return () => {
      destroyChart()
    }
  }, [initializeChart, destroyChart])

  // Update chart when data changes
  useEffect(() => {
    if (chartReady && chartInstanceRef.current) {
      updateChartData(data)
    }
  }, [data, chartReady, updateChartData])

  // Apply active filters
  useEffect(() => {
    const activeFilters = getActiveFiltersForChart(id)
    if (activeFilters.length > 0 && chartInstanceRef.current) {
      // Implement filter application logic
      // This would filter the data and update the chart
    }
  }, [id, getActiveFiltersForChart])

  // Render
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full',
        'chart-container',
        className
      )}
      style={{
        width: chartDimensions.responsive ? '100%' : chartDimensions.width,
        height: chartDimensions.responsive ? '100%' : chartDimensions.height,
        ...style
      }}
      role="img"
      aria-label={accessibility.ariaLabel || `${type} chart`}
      aria-describedby={accessibility.ariaDescription ? `${id}-description` : undefined}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading chart...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-destructive text-sm font-medium mb-2">Chart Error</div>
            <div className="text-xs text-muted-foreground">{error}</div>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <canvas
        ref={canvasRef}
        className={cn(
          'max-w-full max-h-full',
          isLoading || error ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-300'
        )}
        style={{
          width: chartDimensions.responsive ? '100%' : chartDimensions.width,
          height: chartDimensions.responsive ? '100%' : chartDimensions.height
        }}
      />

      {/* Accessibility Description */}
      {accessibility.ariaDescription && (
        <div id={`${id}-description`} className="sr-only">
          {accessibility.ariaDescription}
        </div>
      )}

      {/* Children (for additional overlays or controls) */}
      {children}
    </div>
  )
})

BaseChart.displayName = 'BaseChart'

export default BaseChart