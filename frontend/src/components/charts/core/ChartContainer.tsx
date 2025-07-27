'use client'

// Chart Container - Wrapper component with additional functionality
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BaseChart, ChartRef } from './BaseChart'
import { BaseChartProps } from '../types/chartTypes'
import { cn } from '@/lib/utils'
import { 
  Maximize2, 
  Minimize2, 
  Download, 
  Settings, 
  RefreshCw,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'

// Container Props
interface ChartContainerProps extends BaseChartProps {
  title?: string
  description?: string
  showHeader?: boolean
  showControls?: boolean
  allowFullscreen?: boolean
  allowExport?: boolean
  allowRefresh?: boolean
  allowFilter?: boolean
  allowToggleVisibility?: boolean
  isFullscreen?: boolean
  isVisible?: boolean
  loading?: boolean
  error?: string | null
  onFullscreenToggle?: (isFullscreen: boolean) => void
  onExport?: (format: 'png' | 'jpg' | 'svg') => void
  onRefresh?: () => void
  onFilterToggle?: () => void
  onVisibilityToggle?: (isVisible: boolean) => void
  onSettingsClick?: () => void
  headerActions?: React.ReactNode
  footerContent?: React.ReactNode
}

export function ChartContainer({
  // Chart props
  id,
  type,
  data,
  options,
  dimensions,
  theme,
  performance,
  accessibility,
  onChartReady,
  onDataClick,
  onHover,
  onResize,
  
  // Container props
  title,
  description,
  showHeader = true,
  showControls = true,
  allowFullscreen = true,
  allowExport = true,
  allowRefresh = true,
  allowFilter = true,
  allowToggleVisibility = true,
  isFullscreen = false,
  isVisible = true,
  loading = false,
  error = null,
  onFullscreenToggle,
  onExport,
  onRefresh,
  onFilterToggle,
  onVisibilityToggle,
  onSettingsClick,
  headerActions,
  footerContent,
  className,
  style,
  children
}: ChartContainerProps) {
  // Local state
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // Chart reference
  const chartRef = useRef<ChartRef>(null)

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    const newFullscreenState = !isFullscreen
    onFullscreenToggle?.(newFullscreenState)
  }, [isFullscreen, onFullscreenToggle])

  // Handle export
  const handleExport = useCallback(async (format: 'png' | 'jpg' | 'svg') => {
    if (!chartRef.current) return

    try {
      setIsExporting(true)
      
      const dataUrl = chartRef.current.exportChart(format)
      if (dataUrl) {
        // Create download link
        const link = document.createElement('a')
        link.download = `${title || type}-chart-${Date.now()}.${format}`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      onExport?.(format)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [title, type, onExport])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true)
      
      // Refresh chart data
      if (chartRef.current) {
        chartRef.current.resize()
      }
      
      onRefresh?.()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh])

  // Handle filter toggle
  const handleFilterToggle = useCallback(() => {
    setShowFilters(prev => !prev)
    onFilterToggle?.()
  }, [onFilterToggle])

  // Handle visibility toggle
  const handleVisibilityToggle = useCallback(() => {
    const newVisibility = !isVisible
    onVisibilityToggle?.(newVisibility)
  }, [isVisible, onVisibilityToggle])

  // Render controls
  const renderControls = () => {
    if (!showControls) return null

    return (
      <div className="flex items-center gap-1">
        {allowToggleVisibility && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVisibilityToggle}
            className="h-8 w-8 p-0"
            title={isVisible ? 'Hide chart' : 'Show chart'}
          >
            {isVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        )}

        {allowFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFilterToggle}
            className={cn(
              "h-8 w-8 p-0",
              showFilters && "bg-primary/10 text-primary"
            )}
            title="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}

        {allowRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
            title="Refresh chart"
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isRefreshing && "animate-spin"
            )} />
          </Button>
        )}

        {allowExport && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('png')}
              disabled={isExporting}
              className="h-8 w-8 p-0"
              title="Export chart"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}

        {allowFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreenToggle}
            className="h-8 w-8 p-0"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}

        {onSettingsClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="h-8 w-8 p-0"
            title="Chart settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {headerActions}
      </div>
    )
  }

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null

    return (
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-lg font-semibold">
                {title}
                {!isVisible && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Hidden
                  </Badge>
                )}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {renderControls()}
        </div>
      </CardHeader>
    )
  }

  // Render chart content
  const renderChartContent = () => {
    if (!isVisible) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <EyeOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chart is hidden</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-destructive">
          <div className="text-center">
            <div className="text-sm font-medium mb-1">Chart Error</div>
            <div className="text-xs text-muted-foreground">{error}</div>
          </div>
        </div>
      )
    }

    return (
      <BaseChart
        ref={chartRef}
        id={id}
        type={type}
        data={data}
        options={options}
        dimensions={dimensions}
        theme={theme}
        performance={performance}
        accessibility={accessibility}
        onChartReady={onChartReady}
        onDataClick={onDataClick}
        onHover={onHover}
        onResize={onResize}
        className="w-full h-full"
      >
        {children}
      </BaseChart>
    )
  }

  // Container classes
  const containerClasses = cn(
    'chart-container-wrapper',
    'transition-all duration-300',
    isFullscreen && 'fixed inset-0 z-50 bg-background',
    !isFullscreen && 'relative',
    className
  )

  const cardClasses = cn(
    'h-full',
    'card-dark',
    isFullscreen && 'h-screen rounded-none border-0',
    !isVisible && 'opacity-75'
  )

  return (
    <div className={containerClasses} style={style}>
      <Card className={cardClasses}>
        {renderHeader()}
        
        <CardContent className={cn(
          "flex-1",
          showHeader ? "pt-0" : "pt-6",
          isFullscreen ? "h-[calc(100vh-120px)]" : "h-full"
        )}>
          {/* Filter Panel */}
          {showFilters && allowFilter && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
              <div className="text-sm font-medium mb-2">Chart Filters</div>
              <div className="text-xs text-muted-foreground">
                Filter controls would be implemented here based on chart data
              </div>
            </div>
          )}

          {/* Chart Content */}
          <div className={cn(
            "relative",
            isFullscreen ? "h-full" : "h-64 min-h-[16rem]"
          )}>
            {renderChartContent()}
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Content */}
          {footerContent && (
            <div className="mt-4 pt-4 border-t border-border">
              {footerContent}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ChartContainer