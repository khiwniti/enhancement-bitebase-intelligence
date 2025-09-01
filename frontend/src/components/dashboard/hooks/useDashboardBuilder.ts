// Dashboard Builder Hook - Main Hook with TanStack Query Integration
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

import React, { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  Dashboard, 
  DashboardWidget, 
  DashboardBuilderState,
  DashboardAction,
  GridPosition,
  WidgetConfig,
  DEFAULT_GRID_CONFIG,
  DEFAULT_DASHBOARD_SETTINGS,
  DEFAULT_DASHBOARD_THEME,
  ExportOptions,
  ShareSettings,
  ShareResult
} from '../types/dashboardTypes'
import { ChartType } from '@/components/charts/types/chartTypes'
import { useDashboardHistory } from './useDashboardHistory'
import { useDashboardAutoSave } from './useDashboardAutoSave'

interface UseDashboardBuilderOptions {
  dashboardId?: string
  enableAutoSave?: boolean
  enableHistory?: boolean
  maxHistorySteps?: number
  autoSaveInterval?: number
}

interface DashboardAPI {
  getDashboard: (id: string) => Promise<Dashboard>
  saveDashboard: (dashboard: Dashboard) => Promise<Dashboard>
  deleteDashboard: (id: string) => Promise<void>
  duplicateDashboard: (id: string, name: string) => Promise<Dashboard>
  exportDashboard: (id: string, options: ExportOptions) => Promise<Blob>
  importDashboard: (file: File) => Promise<Dashboard>
  shareDashboard: (id: string, settings: ShareSettings) => Promise<ShareResult>
}

// Mock API - Replace with actual API client
const mockAPI: DashboardAPI = {
  getDashboard: async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return createDefaultDashboard(id)
  },
  saveDashboard: async (dashboard: Dashboard) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    return { ...dashboard, updatedAt: new Date() }
  },
  deleteDashboard: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200))
  },
  duplicateDashboard: async (id: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const original = await mockAPI.getDashboard(id)
    return {
      ...original,
      id: `${id}-copy-${Date.now()}`,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  exportDashboard: async (id: string, options: ExportOptions) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const data = JSON.stringify({ dashboardId: id, options })
    return new Blob([data], { type: 'application/json' })
  },
  importDashboard: async (file: File) => {
    const text = await file.text()
    const data = JSON.parse(text)
    return {
      ...data,
      id: `imported-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  shareDashboard: async (id: string, settings: ShareSettings) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      shareUrl: `https://bitebase.app/shared/${id}`,
      shareId: `share-${id}-${Date.now()}`,
      qrCode: `data:image/svg+xml;base64,${btoa('<svg></svg>')}`
    }
  }
}

export function useDashboardBuilder(options: UseDashboardBuilderOptions = {}) {
  const {
    dashboardId,
    enableAutoSave = true,
    enableHistory = true,
    maxHistorySteps = 50,
    autoSaveInterval = 30000
  } = options

  const queryClient = useQueryClient()
  
  // Local state
  const [builderState, setBuilderState] = useState<Partial<DashboardBuilderState>>({
    selectedWidget: null,
    draggedWidget: null,
    isEditing: true,
    isPreviewMode: false,
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
    zoom: 1,
    isLoading: false,
    error: null
  })

  // Query for dashboard data
  const {
    data: dashboard,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: () => dashboardId ? mockAPI.getDashboard(dashboardId) : Promise.resolve(createDefaultDashboard()),
    enabled: !!dashboardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const currentDashboard = dashboard || createDefaultDashboard()

  // History management
  const history = useDashboardHistory(currentDashboard, {
    maxHistorySteps,
    enableKeyboardShortcuts: enableHistory,
    onHistoryChange: (canUndo, canRedo) => {
      // Update builder state with history status
      setBuilderState(prev => ({ ...prev, canUndo, canRedo }))
    }
  })

  // Auto-save functionality
  const autoSave = useDashboardAutoSave(currentDashboard, {
    enabled: enableAutoSave,
    interval: autoSaveInterval,
    onSave: async (dashboardToSave) => {
      if (dashboardId) {
        await saveDashboardMutation.mutateAsync(dashboardToSave)
      }
    },
    onSaveSuccess: (dashboard) => {
      // Update query cache
      queryClient.setQueryData(['dashboard', dashboardId], dashboard)
    },
    onSaveError: (error) => {
      setBuilderState(prev => ({ ...prev, error: error.message }))
    }
  })

  // Mutations
  const saveDashboardMutation = useMutation({
    mutationFn: mockAPI.saveDashboard,
    onSuccess: (savedDashboard) => {
      queryClient.setQueryData(['dashboard', dashboardId], savedDashboard)
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
    },
    onError: (error) => {
      setBuilderState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Save failed' 
      }))
    }
  })

  const deleteDashboardMutation = useMutation({
    mutationFn: mockAPI.deleteDashboard,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['dashboard', dashboardId] })
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
    }
  })

  const duplicateDashboardMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      mockAPI.duplicateDashboard(id, name),
    onSuccess: (newDashboard) => {
      queryClient.setQueryData(['dashboard', newDashboard.id], newDashboard)
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
    }
  })

  const exportDashboardMutation = useMutation({
    mutationFn: ({ id, options }: { id: string; options: ExportOptions }) =>
      mockAPI.exportDashboard(id, options)
  })

  const importDashboardMutation = useMutation({
    mutationFn: mockAPI.importDashboard,
    onSuccess: (importedDashboard) => {
      queryClient.setQueryData(['dashboard', importedDashboard.id], importedDashboard)
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
    }
  })

  const shareDashboardMutation = useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: ShareSettings }) =>
      mockAPI.shareDashboard(id, settings)
  })

  // Widget operations
  const addWidget = useCallback((chartType: ChartType, position?: GridPosition) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'chart',
      chartType,
      title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      position: position || { x: 0, y: 0, w: 4, h: 3 },
      config: {
        chartProps: {
          id: `chart-${Date.now()}`,
          type: chartType,
          data: { labels: [], datasets: [] }
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }

    const updatedDashboard = {
      ...currentDashboard,
      widgets: [...currentDashboard.widgets, newWidget],
      updatedAt: new Date(),
      version: currentDashboard.version + 1
    }

    // Update query cache
    queryClient.setQueryData(['dashboard', dashboardId], updatedDashboard)
    
    // Add to history
    if (enableHistory) {
      history.pushState(updatedDashboard, {
        type: 'ADD_WIDGET',
        payload: { widget: newWidget, chartType },
        widgetId: newWidget.id
      })
    }

    // Mark as dirty for auto-save
    autoSave.markDirty()

    return newWidget
  }, [currentDashboard, dashboardId, queryClient, enableHistory, history, autoSave])

  const removeWidget = useCallback((widgetId: string) => {
    const widgetToRemove = currentDashboard.widgets.find(w => w.id === widgetId)
    if (!widgetToRemove) return

    const updatedDashboard = {
      ...currentDashboard,
      widgets: currentDashboard.widgets.filter(w => w.id !== widgetId),
      updatedAt: new Date(),
      version: currentDashboard.version + 1
    }

    queryClient.setQueryData(['dashboard', dashboardId], updatedDashboard)
    
    if (enableHistory) {
      history.pushState(updatedDashboard, {
        type: 'REMOVE_WIDGET',
        payload: { widget: widgetToRemove },
        widgetId
      })
    }

    autoSave.markDirty()
  }, [currentDashboard, dashboardId, queryClient, enableHistory, history, autoSave])

  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    const updatedDashboard = {
      ...currentDashboard,
      widgets: currentDashboard.widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, ...updates, updatedAt: new Date(), version: widget.version + 1 }
          : widget
      ),
      updatedAt: new Date(),
      version: currentDashboard.version + 1
    }

    queryClient.setQueryData(['dashboard', dashboardId], updatedDashboard)
    
    if (enableHistory) {
      history.pushState(updatedDashboard, {
        type: 'UPDATE_WIDGET',
        payload: { updates },
        widgetId
      })
    }

    autoSave.markDirty()
  }, [currentDashboard, dashboardId, queryClient, enableHistory, history, autoSave])

  const moveWidget = useCallback((widgetId: string, newPosition: GridPosition) => {
    updateWidget(widgetId, { position: newPosition })
    
    if (enableHistory) {
      history.pushState(currentDashboard, {
        type: 'MOVE_WIDGET',
        payload: { newPosition },
        widgetId
      })
    }
  }, [updateWidget, enableHistory, history, currentDashboard])

  const resizeWidget = useCallback((widgetId: string, newPosition: GridPosition) => {
    updateWidget(widgetId, { position: newPosition })
    
    if (enableHistory) {
      history.pushState(currentDashboard, {
        type: 'RESIZE_WIDGET',
        payload: { newPosition },
        widgetId
      })
    }
  }, [updateWidget, enableHistory, history, currentDashboard])

  // Builder state operations
  const selectWidget = useCallback((widgetId: string | null) => {
    setBuilderState(prev => ({ ...prev, selectedWidget: widgetId }))
  }, [])

  const togglePreviewMode = useCallback(() => {
    setBuilderState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))
  }, [])

  const toggleGrid = useCallback(() => {
    setBuilderState(prev => ({ ...prev, showGrid: !prev.showGrid }))
  }, [])

  const setZoom = useCallback((zoom: number) => {
    setBuilderState(prev => ({ ...prev, zoom: Math.max(0.25, Math.min(2, zoom)) }))
  }, [])

  // Dashboard operations
  const saveDashboard = useCallback(async () => {
    if (dashboardId) {
      await saveDashboardMutation.mutateAsync(currentDashboard)
    }
  }, [dashboardId, saveDashboardMutation, currentDashboard])

  const exportDashboard = useCallback(async (options: ExportOptions) => {
    if (dashboardId) {
      return await exportDashboardMutation.mutateAsync({ id: dashboardId, options })
    }
    throw new Error('No dashboard to export')
  }, [dashboardId, exportDashboardMutation])

  const shareDashboard = useCallback(async (settings: ShareSettings) => {
    if (dashboardId) {
      return await shareDashboardMutation.mutateAsync({ id: dashboardId, settings })
    }
    throw new Error('No dashboard to share')
  }, [dashboardId, shareDashboardMutation])

  // Computed values
  const isDirty = autoSave.isDirty
  const isSaving = autoSave.isSaving || saveDashboardMutation.isPending
  const canUndo = enableHistory && history.canUndo
  const canRedo = enableHistory && history.canRedo

  return {
    // Dashboard data
    dashboard: currentDashboard,
    isLoading,
    error: error?.message || builderState.error,
    
    // Builder state
    selectedWidget: builderState.selectedWidget,
    isPreviewMode: builderState.isPreviewMode,
    showGrid: builderState.showGrid,
    snapToGrid: builderState.snapToGrid,
    gridSize: builderState.gridSize,
    zoom: builderState.zoom,
    
    // Status
    isDirty,
    isSaving,
    canUndo,
    canRedo,
    
    // Widget operations
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    resizeWidget,
    
    // Selection
    selectWidget,
    
    // View controls
    togglePreviewMode,
    toggleGrid,
    setZoom,
    
    // History operations
    undo: enableHistory ? history.undo : () => null,
    redo: enableHistory ? history.redo : () => null,
    clearHistory: enableHistory ? history.clearHistory : () => {},
    
    // Dashboard operations
    saveDashboard,
    exportDashboard,
    shareDashboard,
    refetch,
    
    // Auto-save
    autoSave,
    
    // Mutations (for loading states)
    mutations: {
      save: saveDashboardMutation,
      delete: deleteDashboardMutation,
      duplicate: duplicateDashboardMutation,
      export: exportDashboardMutation,
      import: importDashboardMutation,
      share: shareDashboardMutation
    }
  }
}

// Helper function to create default dashboard
function createDefaultDashboard(id?: string): Dashboard {
  return {
    id: id || `dashboard-${Date.now()}`,
    name: 'New Dashboard',
    description: 'A new interactive dashboard',
    widgets: [],
    layout: DEFAULT_GRID_CONFIG,
    theme: DEFAULT_DASHBOARD_THEME,
    settings: DEFAULT_DASHBOARD_SETTINGS,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    isPublic: false,
    tags: [],
    author: 'current-user'
  }
}