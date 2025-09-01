// Dashboard Toolbar Component - Main Controls and Actions
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Undo, 
  Redo, 
  Eye, 
  EyeOff, 
  Grid3X3, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Share, 
  Settings, 
  RefreshCw,
  Play,
  Pause,
  MoreHorizontal,
  FileText,
  Image,
  Printer,
  Copy,
  Trash2,
  Plus,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useAutoSaveStatus } from '../hooks/useDashboardAutoSave'
import { useHistoryKeyboardShortcuts } from '../hooks/useDashboardHistory'
import { cn } from '@/lib/utils'

interface DashboardToolbarProps {
  // Dashboard state
  isDirty?: boolean
  isSaving?: boolean
  canUndo?: boolean
  canRedo?: boolean
  isPreviewMode?: boolean
  showGrid?: boolean
  snapToGrid?: boolean
  zoom?: number
  selectedWidget?: string | null
  
  // Auto-save status
  autoSave?: {
    isSaving: boolean
    lastSaved: Date | null
    saveError: Error | null
    isDirty: boolean
    saveCount: number
    getTimeSinceLastSave: () => number | null
  }
  
  // Actions
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onTogglePreview?: () => void
  onToggleGrid?: () => void
  onToggleSnapToGrid?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
  onExport?: (format: 'json' | 'pdf' | 'png') => void
  onShare?: () => void
  onRefresh?: () => void
  onClearDashboard?: () => void
  onAddWidget?: () => void
  onSettings?: () => void
  
  className?: string
}

// Auto-save status indicator
function AutoSaveIndicator({ autoSave }: { autoSave?: DashboardToolbarProps['autoSave'] }) {
  const autoSaveStatus = useAutoSaveStatus(autoSave as any)
  
  if (!autoSave) return null

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
      <div className={cn('flex items-center gap-1 text-xs', autoSaveStatus.getStatusColor())}>
        <span className="text-sm">{autoSaveStatus.getStatusIcon()}</span>
        <span>{autoSaveStatus.statusMessage}</span>
      </div>
      {autoSave.isSaving && (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  )
}

// Zoom controls
function ZoomControls({ 
  zoom = 1, 
  onZoomIn, 
  onZoomOut, 
  onResetZoom 
}: {
  zoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
}) {
  return (
    <div className="flex items-center gap-1 border rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomOut}
        disabled={zoom <= 0.25}
        className="h-8 w-8 p-0"
        title="Zoom out"
      >
        <ZoomOut className="h-3 w-3" />
      </Button>
      
      <button
        onClick={onResetZoom}
        className="px-2 py-1 text-xs font-mono hover:bg-muted rounded transition-colors min-w-[3rem] text-center"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomIn}
        disabled={zoom >= 2}
        className="h-8 w-8 p-0"
        title="Zoom in"
      >
        <ZoomIn className="h-3 w-3" />
      </Button>
    </div>
  )
}

// Export dropdown menu
function ExportMenu({ onExport }: { onExport?: (format: 'json' | 'pdf' | 'png') => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full right-0 mt-1 w-48 bg-background border rounded-md shadow-lg z-20">
            <div className="p-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-sm"
                onClick={() => {
                  onExport?.('json')
                  setIsOpen(false)
                }}
              >
                <FileText className="h-4 w-4" />
                Export as JSON
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-sm"
                onClick={() => {
                  onExport?.('png')
                  setIsOpen(false)
                }}
              >
                <Image className="h-4 w-4" />
                Export as PNG
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-sm"
                onClick={() => {
                  onExport?.('pdf')
                  setIsOpen(false)
                }}
              >
                <Printer className="h-4 w-4" />
                Export as PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function DashboardToolbar({
  isDirty = false,
  isSaving = false,
  canUndo = false,
  canRedo = false,
  isPreviewMode = false,
  showGrid = true,
  snapToGrid = true,
  zoom = 1,
  selectedWidget,
  autoSave,
  onSave,
  onUndo,
  onRedo,
  onTogglePreview,
  onToggleGrid,
  onToggleSnapToGrid,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExport,
  onShare,
  onRefresh,
  onClearDashboard,
  onAddWidget,
  onSettings,
  className = ''
}: DashboardToolbarProps) {
  const { getShortcutText } = useHistoryKeyboardShortcuts()

  return (
    <div className={cn(
      'flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      {/* Left Section - Main Actions */}
      <div className="flex items-center gap-2">
        {/* Save Button */}
        <Button
          onClick={onSave}
          disabled={!isDirty || isSaving}
          size="sm"
          className="gap-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </Button>

        {/* Undo/Redo */}
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 rounded-r-none border-r"
            title={`Undo (${getShortcutText('undo')})`}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 rounded-l-none"
            title={`Redo (${getShortcutText('redo')})`}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Widget */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddWidget}
          className="gap-2"
          disabled={isPreviewMode}
        >
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>

        {/* Separator */}
        <div className="w-px h-6 bg-border" />

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={onTogglePreview}
            className="gap-2"
          >
            {isPreviewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isPreviewMode ? 'Preview' : 'Edit'}
          </Button>

          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={onToggleGrid}
            disabled={isPreviewMode}
            title="Toggle grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetZoom={onResetZoom}
        />
      </div>

      {/* Center Section - Status */}
      <div className="flex items-center gap-4">
        {/* Auto-save Status */}
        <AutoSaveIndicator autoSave={autoSave} />

        {/* Selected Widget Info */}
        {selectedWidget && !isPreviewMode && (
          <Badge variant="outline" className="gap-1">
            <Settings className="h-3 w-3" />
            Widget Selected
          </Badge>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </div>
      </div>

      {/* Right Section - Secondary Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          title="Refresh dashboard"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Export */}
        <ExportMenu onExport={onExport} />

        {/* Share */}
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="gap-2"
        >
          <Share className="h-4 w-4" />
          Share
        </Button>

        {/* More Actions */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
          title="Dashboard settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Compact toolbar for mobile
export function CompactDashboardToolbar({
  isDirty = false,
  isSaving = false,
  canUndo = false,
  canRedo = false,
  isPreviewMode = false,
  onSave,
  onUndo,
  onRedo,
  onTogglePreview,
  onAddWidget,
  className = ''
}: Pick<DashboardToolbarProps, 
  'isDirty' | 'isSaving' | 'canUndo' | 'canRedo' | 'isPreviewMode' | 
  'onSave' | 'onUndo' | 'onRedo' | 'onTogglePreview' | 'onAddWidget' | 'className'
>) {
  return (
    <div className={cn(
      'flex items-center justify-between p-2 border-b bg-background',
      className
    )}>
      {/* Essential Actions */}
      <div className="flex items-center gap-1">
        <Button
          onClick={onSave}
          disabled={!isDirty || isSaving}
          size="sm"
          variant={isDirty ? "default" : "outline"}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Mode Toggle */}
      <Button
        variant={isPreviewMode ? "default" : "outline"}
        size="sm"
        onClick={onTogglePreview}
      >
        {isPreviewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>

      {/* Add Widget */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddWidget}
        disabled={isPreviewMode}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}