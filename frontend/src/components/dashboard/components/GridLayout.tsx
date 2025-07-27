// Grid Layout Component - Responsive Dashboard Grid with Drag & Drop
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GripVertical, 
  X, 
  Settings, 
  Maximize2, 
  Minimize2,
  Copy,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import { DashboardWidget, GridPosition, GridLayoutConfig } from '../types/dashboardTypes'
import { ChartContainer } from '@/components/charts/core/ChartContainer'
import { cn } from '@/lib/utils'

// Make ResponsiveGridLayout responsive to container width
const ResponsiveGridLayout = WidthProvider(Responsive)

interface GridLayoutProps {
  widgets: DashboardWidget[]
  layoutConfig: GridLayoutConfig
  selectedWidget?: string | null
  showGrid?: boolean
  snapToGrid?: boolean
  isEditing?: boolean
  onLayoutChange?: (layout: Layout[], layouts: { [key: string]: Layout[] }) => void
  onWidgetSelect?: (widgetId: string | null) => void
  onWidgetRemove?: (widgetId: string) => void
  onWidgetDuplicate?: (widgetId: string) => void
  onWidgetConfigure?: (widgetId: string) => void
  onWidgetToggleVisibility?: (widgetId: string) => void
  className?: string
}

interface WidgetWrapperProps {
  widget: DashboardWidget
  isSelected: boolean
  isEditing: boolean
  onSelect: (widgetId: string) => void
  onRemove: (widgetId: string) => void
  onDuplicate: (widgetId: string) => void
  onConfigure: (widgetId: string) => void
  onToggleVisibility: (widgetId: string) => void
}

// Widget wrapper component with controls
function WidgetWrapper({
  widget,
  isSelected,
  isEditing,
  onSelect,
  onRemove,
  onDuplicate,
  onConfigure,
  onToggleVisibility
}: WidgetWrapperProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  const handleRetry = useCallback(() => {
    setHasError(false)
  }, [])

  return (
    <div
      className={cn(
        'relative h-full group transition-all duration-200',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isHovered && 'shadow-lg',
        !widget.config.clickable && 'pointer-events-none'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(widget.id)}
    >
      {/* Widget Controls Overlay */}
      {isEditing && (isHovered || isSelected) && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 opacity-90 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility(widget.id)
            }}
            title="Toggle visibility"
          >
            {widget.config.exportable ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 opacity-90 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onConfigure(widget.id)
            }}
            title="Configure widget"
          >
            <Settings className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 opacity-90 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(widget.id)
            }}
            title="Duplicate widget"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 p-0 opacity-90 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(widget.id)
            }}
            title="Remove widget"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Drag Handle */}
      {isEditing && (
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="drag-handle cursor-move p-1 bg-background/80 rounded border">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Widget Status Indicators */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex gap-1">
        {widget.type === 'chart' && widget.chartType && (
          <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-background/80">
            {widget.chartType}
          </Badge>
        )}
        {hasError && (
          <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
            Error
          </Badge>
        )}
      </div>

      {/* Widget Content */}
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          {/* Widget Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm truncate">{widget.title}</h3>
            {widget.description && (
              <div className="text-xs text-muted-foreground truncate ml-2">
                {widget.description}
              </div>
            )}
          </div>

          {/* Widget Body */}
          <div className="flex-1 min-h-0">
            {hasError ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Failed to load widget
                </p>
                <Button size="sm" variant="outline" onClick={handleRetry}>
                  Retry
                </Button>
              </div>
            ) : widget.type === 'chart' && widget.chartType && widget.config.chartProps ? (
              <ChartContainer
                id={widget.config.chartProps.id || widget.id}
                type={widget.chartType}
                data={widget.config.chartProps.data || { labels: [], datasets: [] }}
                options={widget.config.chartProps.options}
                className="h-full"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No content configured</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function GridLayout({
  widgets,
  layoutConfig,
  selectedWidget,
  showGrid = true,
  snapToGrid = true,
  isEditing = true,
  onLayoutChange,
  onWidgetSelect,
  onWidgetRemove,
  onWidgetDuplicate,
  onWidgetConfigure,
  onWidgetToggleVisibility,
  className = ''
}: GridLayoutProps) {
  // Convert widgets to react-grid-layout format
  const layouts = useMemo(() => {
    const baseLayout = widgets.map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: 1,
      minH: 1,
      maxW: layoutConfig.cols.xl,
      maxH: 20
    }))

    return {
      xl: baseLayout,
      lg: baseLayout,
      md: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, layoutConfig.cols.md),
        x: Math.min(item.x, layoutConfig.cols.md - item.w)
      })),
      sm: baseLayout.map(item => ({
        ...item,
        w: Math.min(item.w, layoutConfig.cols.sm),
        x: Math.min(item.x, layoutConfig.cols.sm - item.w)
      }))
    }
  }, [widgets, layoutConfig.cols])

  // Handle layout changes
  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    onLayoutChange?.(layout, allLayouts)
  }, [onLayoutChange])

  // Droppable area for new widgets
  const { setNodeRef, isOver } = useDroppable({
    id: 'dashboard-grid',
    data: {
      type: 'grid-area'
    }
  })

  // Handle widget interactions
  const handleWidgetSelect = useCallback((widgetId: string) => {
    onWidgetSelect?.(widgetId === selectedWidget ? null : widgetId)
  }, [onWidgetSelect, selectedWidget])

  const handleWidgetRemove = useCallback((widgetId: string) => {
    onWidgetRemove?.(widgetId)
  }, [onWidgetRemove])

  const handleWidgetDuplicate = useCallback((widgetId: string) => {
    onWidgetDuplicate?.(widgetId)
  }, [onWidgetDuplicate])

  const handleWidgetConfigure = useCallback((widgetId: string) => {
    onWidgetConfigure?.(widgetId)
  }, [onWidgetConfigure])

  const handleWidgetToggleVisibility = useCallback((widgetId: string) => {
    onWidgetToggleVisibility?.(widgetId)
  }, [onWidgetToggleVisibility])

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative h-full w-full',
        showGrid && 'bg-grid-pattern',
        isOver && 'bg-primary/5 border-2 border-dashed border-primary',
        className
      )}
      style={{
        backgroundSize: snapToGrid ? `${layoutConfig.rowHeight}px ${layoutConfig.rowHeight}px` : undefined
      }}
    >
      {widgets.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Empty Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              Drag charts from the widget palette to start building your dashboard.
            </p>
            {isEditing && (
              <div className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> You can also click on chart types in the palette to add them at the default position.
              </div>
            )}
          </div>
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={layoutConfig.breakpoints as unknown as { [key: string]: number }}
          cols={layoutConfig.cols}
          rowHeight={layoutConfig.rowHeight}
          margin={layoutConfig.margin}
          containerPadding={layoutConfig.containerPadding}
          isDraggable={isEditing && layoutConfig.isDraggable}
          isResizable={isEditing && layoutConfig.isResizable}
          useCSSTransforms={layoutConfig.useCSSTransforms}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          resizeHandles={['se']}
          compactType="vertical"
          preventCollision={false}
        >
          {widgets.map(widget => (
            <div key={widget.id} className="widget-container">
              <WidgetWrapper
                widget={widget}
                isSelected={selectedWidget === widget.id}
                isEditing={isEditing}
                onSelect={handleWidgetSelect}
                onRemove={handleWidgetRemove}
                onDuplicate={handleWidgetDuplicate}
                onConfigure={handleWidgetConfigure}
                onToggleVisibility={handleWidgetToggleVisibility}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}

      {/* Drop indicator overlay */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-full border-2 border-dashed border-primary bg-primary/10 rounded-lg flex items-center justify-center">
            <div className="text-primary font-medium">
              Drop chart here to add to dashboard
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// CSS for grid pattern (add to global styles)
export const gridLayoutStyles = `
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
}

.react-grid-layout {
  position: relative;
}

.react-grid-item {
  transition: all 200ms ease;
  transition-property: left, top;
}

.react-grid-item.cssTransforms {
  transition-property: transform;
}

.react-grid-item > .react-resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  bottom: 0;
  right: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0tNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAgNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDRjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXptLTUtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDRjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXoiLz4KPHN2Zz4K') no-repeat;
  background-position: bottom right;
  padding: 0 3px 3px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: se-resize;
}

.react-grid-item.react-grid-placeholder {
  background: rgba(59, 130, 246, 0.15);
  opacity: 0.2;
  transition-duration: 100ms;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  border: 2px dashed rgba(59, 130, 246, 0.5);
  border-radius: 8px;
}

.react-grid-item.react-draggable-dragging {
  transition: none;
  z-index: 3;
  opacity: 0.8;
}

.react-grid-item.react-grid-placeholder {
  background: rgba(59, 130, 246, 0.15);
  opacity: 0.2;
  transition-duration: 100ms;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
`