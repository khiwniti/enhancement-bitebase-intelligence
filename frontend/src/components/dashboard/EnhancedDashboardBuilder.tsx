// Enhanced Dashboard Builder - Main Component
// BiteBase Intelligence 2.0 - Drag & Drop Dashboard Builder

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, closestCenter } from '@dnd-kit/core'
import { ChartProvider } from '@/components/charts/providers/ChartProvider'
import { CrossFilterProvider } from '@/components/charts/providers/CrossFilterProvider'
import { ThemeProvider } from '@/components/charts/providers/ThemeProvider'
import { WidgetPalette } from './components/WidgetPalette'
import { GridLayout } from './components/GridLayout'
import { WidgetConfigPanel } from './components/WidgetConfigPanel'
import { DashboardToolbar } from './components/DashboardToolbar'
import { useDashboardBuilder } from './hooks/useDashboardBuilder'
import { ChartType } from '@/components/charts/types/chartTypes'
import { DragItem, DropResult, ExportOptions, ShareSettings } from './types/dashboardTypes'
import { cn } from '@/lib/utils'

interface EnhancedDashboardBuilderProps {
  dashboardId?: string
  className?: string
  onDashboardChange?: (dashboard: any) => void
  onExport?: (data: Blob, format: string) => void
  onShare?: (result: any) => void
}

export function EnhancedDashboardBuilder({
  dashboardId,
  className = '',
  onDashboardChange,
  onExport,
  onShare
}: EnhancedDashboardBuilderProps) {
  // Dashboard builder state
  const dashboardBuilder = useDashboardBuilder({
    dashboardId,
    enableAutoSave: true,
    enableHistory: true,
    maxHistorySteps: 50,
    autoSaveInterval: 30000
  })

  // Local UI state
  const [showWidgetPalette, setShowWidgetPalette] = useState(true)
  const [configPanelWidget, setConfigPanelWidget] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const dragData = active.data.current

    if (dragData?.type === 'chart-type') {
      setDraggedItem({
        id: active.id as string,
        type: 'chart-type',
        chartType: dragData.chartType
      })
    } else if (dragData?.type === 'widget') {
      setDraggedItem({
        id: active.id as string,
        type: 'widget',
        widget: dragData.widget
      })
    }
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle drag over logic if needed
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !draggedItem) {
      setDraggedItem(null)
      return
    }

    const overData = over.data.current

    // Handle dropping chart type onto grid
    if (draggedItem.type === 'chart-type' && overData?.type === 'grid-area') {
      const chartType = draggedItem.chartType as ChartType
      
      // Calculate drop position (simplified - you might want more sophisticated positioning)
      const dropPosition = {
        x: 0,
        y: 0,
        w: 4,
        h: 3
      }

      // Find available position
      const occupiedPositions = dashboardBuilder.dashboard.widgets.map(w => w.position)
      let foundPosition = false
      let testY = 0

      while (!foundPosition && testY < 20) {
        let testX = 0
        while (testX <= 4 && !foundPosition) {
          const testPosition = { x: testX, y: testY, w: 4, h: 3 }
          const hasCollision = occupiedPositions.some(pos => 
            testPosition.x < pos.x + pos.w &&
            testPosition.x + testPosition.w > pos.x &&
            testPosition.y < pos.y + pos.h &&
            testPosition.y + testPosition.h > pos.y
          )
          
          if (!hasCollision) {
            dropPosition.x = testX
            dropPosition.y = testY
            foundPosition = true
          }
          testX += 1
        }
        testY += 1
      }

      dashboardBuilder.addWidget(chartType, dropPosition)
    }

    setDraggedItem(null)
  }, [draggedItem, dashboardBuilder])

  // Handle widget selection from palette
  const handleWidgetSelect = useCallback((chartType: ChartType) => {
    dashboardBuilder.addWidget(chartType)
  }, [dashboardBuilder])

  // Handle widget configuration
  const handleWidgetConfigure = useCallback((widgetId: string) => {
    setConfigPanelWidget(widgetId)
  }, [])

  // Handle widget configuration save
  const handleConfigSave = useCallback((widgetId: string, config: any) => {
    dashboardBuilder.updateWidget(widgetId, config)
    setConfigPanelWidget(null)
  }, [dashboardBuilder])

  // Handle export
  const handleExport = useCallback(async (format: 'json' | 'pdf' | 'png') => {
    if (isExporting) return

    setIsExporting(true)
    try {
      const exportOptions: ExportOptions = {
        format,
        includeData: true,
        includeConfig: true,
        quality: format === 'png' ? 0.9 : undefined,
        width: format !== 'json' ? 1920 : undefined,
        height: format !== 'json' ? 1080 : undefined
      }

      const blob = await dashboardBuilder.exportDashboard(exportOptions)
      onExport?.(blob, format)
      
      // Also trigger download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [isExporting, dashboardBuilder, onExport])

  // Handle share
  const handleShare = useCallback(async () => {
    if (isSharing) return

    setIsSharing(true)
    try {
      const shareSettings: ShareSettings = {
        isPublic: true,
        allowEdit: false,
        allowComment: true
      }

      const result = await dashboardBuilder.shareDashboard(shareSettings)
      onShare?.(result)
    } catch (error) {
      console.error('Share failed:', error)
    } finally {
      setIsSharing(false)
    }
  }, [isSharing, dashboardBuilder, onShare])

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    dashboardBuilder.setZoom(Math.min((dashboardBuilder.zoom || 1) + 0.1, 2))
  }, [dashboardBuilder])

  const handleZoomOut = useCallback(() => {
    dashboardBuilder.setZoom(Math.max((dashboardBuilder.zoom || 1) - 0.1, 0.25))
  }, [dashboardBuilder])

  const handleResetZoom = useCallback(() => {
    dashboardBuilder.setZoom(1)
  }, [dashboardBuilder])

  // Handle add widget from toolbar
  const handleAddWidget = useCallback(() => {
    setShowWidgetPalette(true)
  }, [])

  // Get selected widget for config panel
  const selectedWidgetForConfig = useMemo(() => {
    if (!configPanelWidget) return null
    return dashboardBuilder.dashboard.widgets.find(w => w.id === configPanelWidget) || null
  }, [configPanelWidget, dashboardBuilder.dashboard.widgets])

  // Notify parent of dashboard changes
  React.useEffect(() => {
    onDashboardChange?.(dashboardBuilder.dashboard)
  }, [dashboardBuilder.dashboard, onDashboardChange])

  if (dashboardBuilder.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (dashboardBuilder.error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground mb-4">{dashboardBuilder.error}</p>
          <button
            onClick={() => dashboardBuilder.refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <ChartProvider>
      <CrossFilterProvider>
        <ThemeProvider>
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className={cn('h-screen flex flex-col bg-background', className)}>
              {/* Toolbar */}
              <DashboardToolbar
                isDirty={dashboardBuilder.isDirty}
                isSaving={dashboardBuilder.isSaving}
                canUndo={dashboardBuilder.canUndo}
                canRedo={dashboardBuilder.canRedo}
                isPreviewMode={dashboardBuilder.isPreviewMode}
                showGrid={dashboardBuilder.showGrid}
                snapToGrid={dashboardBuilder.snapToGrid}
                zoom={dashboardBuilder.zoom}
                selectedWidget={dashboardBuilder.selectedWidget}
                autoSave={dashboardBuilder.autoSave}
                onSave={dashboardBuilder.saveDashboard}
                onUndo={dashboardBuilder.undo}
                onRedo={dashboardBuilder.redo}
                onTogglePreview={dashboardBuilder.togglePreviewMode}
                onToggleGrid={dashboardBuilder.toggleGrid}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                onExport={handleExport}
                onShare={handleShare}
                onRefresh={dashboardBuilder.refetch}
                onAddWidget={handleAddWidget}
              />

              {/* Main Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Widget Palette Sidebar */}
                {showWidgetPalette && !dashboardBuilder.isPreviewMode && (
                  <div className="w-80 border-r bg-muted/30 flex flex-col">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Widget Palette</h2>
                        <button
                          onClick={() => setShowWidgetPalette(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <WidgetPalette
                        onWidgetSelect={handleWidgetSelect}
                        disabled={dashboardBuilder.isPreviewMode}
                        className="h-full"
                      />
                    </div>
                  </div>
                )}

                {/* Dashboard Grid */}
                <div className="flex-1 overflow-hidden">
                  <GridLayout
                    widgets={dashboardBuilder.dashboard.widgets}
                    layoutConfig={dashboardBuilder.dashboard.layout}
                    selectedWidget={dashboardBuilder.selectedWidget}
                    showGrid={dashboardBuilder.showGrid}
                    snapToGrid={dashboardBuilder.snapToGrid}
                    isEditing={!dashboardBuilder.isPreviewMode}
                    onLayoutChange={(layout, layouts) => {
                      // Handle layout changes
                      
                    }}
                    onWidgetSelect={dashboardBuilder.selectWidget}
                    onWidgetRemove={dashboardBuilder.removeWidget}
                    onWidgetDuplicate={(widgetId) => {
                      const widget = dashboardBuilder.dashboard.widgets.find(w => w.id === widgetId)
                      if (widget && widget.chartType) {
                        dashboardBuilder.addWidget(widget.chartType)
                      }
                    }}
                    onWidgetConfigure={handleWidgetConfigure}
                    onWidgetToggleVisibility={(widgetId) => {
                      const widget = dashboardBuilder.dashboard.widgets.find(w => w.id === widgetId)
                      if (widget) {
                        dashboardBuilder.updateWidget(widgetId, {
                          config: {
                            ...widget.config,
                            exportable: !widget.config.exportable
                          }
                        })
                      }
                    }}
                    className="h-full"
                  />
                </div>
              </div>

              {/* Widget Configuration Panel */}
              <WidgetConfigPanel
                widget={selectedWidgetForConfig}
                isOpen={!!configPanelWidget}
                onClose={() => setConfigPanelWidget(null)}
                onSave={handleConfigSave}
              />

              {/* Drag Overlay */}
              {draggedItem && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium shadow-lg">
                    Adding {draggedItem.chartType || 'widget'} to dashboard
                  </div>
                </div>
              )}

              {/* Loading Overlays */}
              {isExporting && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-background border rounded-lg p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Exporting dashboard...</span>
                    </div>
                  </div>
                </div>
              )}

              {isSharing && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-background border rounded-lg p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Sharing dashboard...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DndContext>
        </ThemeProvider>
      </CrossFilterProvider>
    </ChartProvider>
  )
}

// Export default
export default EnhancedDashboardBuilder