// useChart Hook - Main hook for chart functionality
// BiteBase Intelligence 2.0 - Advanced Chart Library

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChartType, ChartInstance, ChartPerformanceConfig } from '../types/chartTypes'
import { useChartProvider } from '../providers/ChartProvider'
import { useCrossFilterProvider } from '../providers/CrossFilterProvider'
import { useThemeProvider } from '../providers/ThemeProvider'
import { chartRegistry } from '../core/ChartRegistry'

// Chart Hook Options
interface UseChartOptions {
  id: string
  type: ChartType
  data: any
  options?: any
  autoResize?: boolean
  enableCrossFilter?: boolean
  enableRealTime?: boolean
  performanceMode?: 'auto' | 'high' | 'balanced' | 'memory'
}

// Chart Hook Return Type
interface UseChartReturn {
  // Chart instance and state
  chartRef: React.RefObject<any>
  chartInstance: ChartInstance | null
  isLoading: boolean
  error: string | null
  isReady: boolean
  
  // Chart controls
  updateData: (newData: any) => void
  updateOptions: (newOptions: any) => void
  resize: () => void
  destroy: () => void
  refresh: () => void
  
  // Export functionality
  exportChart: (format: 'png' | 'jpg' | 'svg') => Promise<string | null>
  
  // Performance metrics
  performanceMetrics: {
    renderTime: number
    dataSize: number
    memoryUsage: number
    lastUpdate: Date
  }
  
  // Real-time data
  enableRealTime: (enabled: boolean) => void
  isRealTimeEnabled: boolean
  
  // Cross-filtering
  applyFilter: (filter: any) => void
  clearFilters: () => void
  activeFilters: any[]
}

// Main useChart hook
export function useChart({
  id,
  type,
  data,
  options = {},
  autoResize = true,
  enableCrossFilter = true,
  enableRealTime = false,
  performanceMode = 'auto'
}: UseChartOptions): UseChartReturn {
  // Refs and state
  const chartRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(enableRealTime)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    dataSize: 0,
    memoryUsage: 0,
    lastUpdate: new Date()
  })

  // Context hooks
  const { getChart, registerChart, unregisterChart, updateChart, state } = useChartProvider()
  const { applyFilter: applyGlobalFilter, getActiveFiltersForChart } = useCrossFilterProvider()
  const { theme, getChartColors } = useThemeProvider()

  // Get chart instance
  const chartInstance = getChart(id)

  // Initialize chart
  const initializeChart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load chart module
      const chartModule = await chartRegistry.loadChart(type)
      
      if (!chartModule) {
        throw new Error(`Failed to load chart type: ${type}`)
      }

      // Performance configuration
      const perfConfig = getPerformanceConfig(performanceMode, data)
      
      // Create chart configuration
      const chartConfig = {
        type,
        data: processChartData(data, type, theme),
        options: mergeChartOptions(options, type, theme, perfConfig)
      }

      // Register chart
      registerChart(id, type, chartModule)
      
      setIsReady(true)
      setIsLoading(false)
      
      // Update performance metrics
      updatePerformanceMetrics()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chart'
      setError(errorMessage)
      setIsLoading(false)
      console.error('Chart initialization error:', err)
    }
  }, [id, type, data, options, performanceMode, theme, registerChart])

  // Update chart data
  const updateData = useCallback((newData: any) => {
    if (!chartInstance) return

    try {
      const processedData = processChartData(newData, type, theme)
      updateChart(id, { ...chartInstance, data: processedData })
      updatePerformanceMetrics()
    } catch (err) {
      console.error('Failed to update chart data:', err)
    }
  }, [chartInstance, id, type, theme, updateChart])

  // Update chart options
  const updateOptions = useCallback((newOptions: any) => {
    if (!chartInstance) return

    try {
      const mergedOptions = mergeChartOptions(newOptions, type, theme, getPerformanceConfig(performanceMode, data))
      updateChart(id, { ...chartInstance, options: mergedOptions })
    } catch (err) {
      console.error('Failed to update chart options:', err)
    }
  }, [chartInstance, id, type, theme, performanceMode, data, updateChart])

  // Resize chart
  const resize = useCallback(() => {
    if (chartRef.current && chartRef.current.resize) {
      chartRef.current.resize()
    }
  }, [])

  // Destroy chart
  const destroy = useCallback(() => {
    if (chartInstance) {
      unregisterChart(id)
      setIsReady(false)
    }
  }, [chartInstance, id, unregisterChart])

  // Refresh chart
  const refresh = useCallback(() => {
    if (chartInstance) {
      updateData(data)
      resize()
    }
  }, [chartInstance, data, updateData, resize])

  // Export chart
  const exportChart = useCallback(async (format: 'png' | 'jpg' | 'svg'): Promise<string | null> => {
    if (!chartRef.current || !chartRef.current.exportChart) {
      return null
    }

    try {
      return await chartRef.current.exportChart(format)
    } catch (err) {
      console.error('Failed to export chart:', err)
      return null
    }
  }, [])

  // Enable/disable real-time updates
  const enableRealTimeUpdates = useCallback((enabled: boolean) => {
    setIsRealTimeEnabled(enabled)
  }, [])

  // Apply filter
  const applyFilter = useCallback((filter: any) => {
    if (enableCrossFilter) {
      applyGlobalFilter(id, filter)
    }
  }, [enableCrossFilter, id, applyGlobalFilter])

  // Clear filters
  const clearFilters = useCallback(() => {
    if (enableCrossFilter) {
      // Implementation would clear filters for this chart
    }
  }, [enableCrossFilter])

  // Get active filters
  const activeFilters = enableCrossFilter ? getActiveFiltersForChart(id) : []

  // Update performance metrics
  const updatePerformanceMetrics = useCallback(() => {
    const dataSize = JSON.stringify(data).length
    const renderTime = performance.now() // This would be measured properly
    
    setPerformanceMetrics({
      renderTime,
      dataSize,
      memoryUsage: 0, // This would be calculated based on actual memory usage
      lastUpdate: new Date()
    })
  }, [data])

  // Auto-resize setup
  useEffect(() => {
    if (!autoResize) return

    const handleResize = () => {
      resize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [autoResize, resize])

  // Initialize chart on mount
  useEffect(() => {
    initializeChart()
    
    return () => {
      destroy()
    }
  }, [initializeChart, destroy])

  // Update chart when data changes
  useEffect(() => {
    if (isReady && chartInstance) {
      updateData(data)
    }
  }, [data, isReady, chartInstance, updateData])

  // Real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled || !isReady) return

    const interval = setInterval(() => {
      // This would fetch new data and update the chart
      // For now, it's just a placeholder
      refresh()
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isRealTimeEnabled, isReady, refresh])

  return {
    chartRef,
    chartInstance,
    isLoading,
    error,
    isReady,
    updateData,
    updateOptions,
    resize,
    destroy,
    refresh,
    exportChart,
    performanceMetrics,
    enableRealTime: enableRealTimeUpdates,
    isRealTimeEnabled,
    applyFilter,
    clearFilters,
    activeFilters
  }
}

// Helper functions
function getPerformanceConfig(mode: string, data: any): ChartPerformanceConfig {
  const dataSize = JSON.stringify(data).length
  
  switch (mode) {
    case 'high':
      return {
        enableLazyLoading: false,
        enableVirtualization: false,
        maxDataPoints: Infinity,
        animationDuration: 750,
        enableWebGL: true,
        cacheStrategy: 'memory'
      }
    
    case 'balanced':
      return {
        enableLazyLoading: true,
        enableVirtualization: dataSize > 50000,
        maxDataPoints: 10000,
        animationDuration: 500,
        enableWebGL: dataSize > 100000,
        cacheStrategy: 'memory'
      }
    
    case 'memory':
      return {
        enableLazyLoading: true,
        enableVirtualization: true,
        maxDataPoints: 5000,
        animationDuration: 250,
        enableWebGL: false,
        cacheStrategy: 'none'
      }
    
    default: // auto
      return {
        enableLazyLoading: dataSize > 10000,
        enableVirtualization: dataSize > 50000,
        maxDataPoints: dataSize > 100000 ? 5000 : 10000,
        animationDuration: dataSize > 50000 ? 250 : 500,
        enableWebGL: dataSize > 100000,
        cacheStrategy: 'memory'
      }
  }
}

function processChartData(data: any, type: ChartType, theme: any): any {
  // Process data based on chart type and theme
  return {
    ...data,
    datasets: data.datasets?.map((dataset: any, index: number) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || theme.colors.primary[index % theme.colors.primary.length],
      borderColor: dataset.borderColor || theme.colors.primary[index % theme.colors.primary.length]
    }))
  }
}

function mergeChartOptions(options: any, type: ChartType, theme: any, perfConfig: ChartPerformanceConfig): any {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: perfConfig.animationDuration
    },
    plugins: {
      legend: {
        labels: {
          color: theme.charts.legend.text,
          font: {
            family: theme.typography.fontFamily.primary
          }
        }
      },
      tooltip: {
        backgroundColor: theme.charts.tooltip.background,
        titleColor: theme.charts.tooltip.text,
        bodyColor: theme.charts.tooltip.text
      }
    }
  }

  return { ...baseOptions, ...options }
}

export default useChart