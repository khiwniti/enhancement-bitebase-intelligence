// Dashboard History Hook - Undo/Redo Functionality
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

import React, { useCallback, useRef, useState } from 'react'
import { 
  Dashboard, 
  DashboardHistoryState, 
  DashboardAction,
  DEFAULT_DASHBOARD_SETTINGS 
} from '../types/dashboardTypes'

interface UseDashboardHistoryOptions {
  maxHistorySteps?: number
  enableKeyboardShortcuts?: boolean
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void
}

interface UseDashboardHistoryReturn {
  // State
  history: DashboardHistoryState[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  
  // Actions
  pushState: (dashboard: Dashboard, action: DashboardAction, description?: string) => void
  undo: () => Dashboard | null
  redo: () => Dashboard | null
  clearHistory: () => void
  goToHistoryIndex: (index: number) => Dashboard | null
  
  // Utilities
  getHistoryPreview: () => DashboardHistoryState[]
  exportHistory: () => string
  importHistory: (historyJson: string) => boolean
}

export function useDashboardHistory(
  initialDashboard: Dashboard,
  options: UseDashboardHistoryOptions = {}
): UseDashboardHistoryReturn {
  const {
    maxHistorySteps = DEFAULT_DASHBOARD_SETTINGS.maxHistorySteps,
    enableKeyboardShortcuts = true,
    onHistoryChange
  } = options

  // History state
  const [history, setHistory] = useState<DashboardHistoryState[]>([
    {
      dashboard: initialDashboard,
      timestamp: new Date(),
      action: { type: 'UPDATE_DASHBOARD', payload: initialDashboard },
      description: 'Initial state'
    }
  ])
  
  const [historyIndex, setHistoryIndex] = useState(0)
  const keyboardListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null)

  // Computed values
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Keyboard shortcuts handler
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    if (!enableKeyboardShortcuts) return

    const isCtrlOrCmd = e.ctrlKey || e.metaKey
    
    if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault()
      redo()
    }
  }, [enableKeyboardShortcuts])

  // Setup keyboard listeners
  React.useEffect(() => {
    if (enableKeyboardShortcuts) {
      keyboardListenerRef.current = handleKeyboardShortcuts
      document.addEventListener('keydown', handleKeyboardShortcuts)
      
      return () => {
        if (keyboardListenerRef.current) {
          document.removeEventListener('keydown', keyboardListenerRef.current)
        }
      }
    }
  }, [handleKeyboardShortcuts, enableKeyboardShortcuts])

  // Notify history changes
  React.useEffect(() => {
    onHistoryChange?.(canUndo, canRedo)
  }, [canUndo, canRedo, onHistoryChange])

  // Push new state to history
  const pushState = useCallback((
    dashboard: Dashboard, 
    action: DashboardAction, 
    description?: string
  ) => {
    const newHistoryState: DashboardHistoryState = {
      dashboard: JSON.parse(JSON.stringify(dashboard)), // Deep clone
      timestamp: new Date(),
      action,
      description: description || getActionDescription(action)
    }

    setHistory(prevHistory => {
      // Remove any future history if we're not at the end
      const truncatedHistory = prevHistory.slice(0, historyIndex + 1)
      
      // Add new state
      const newHistory = [...truncatedHistory, newHistoryState]
      
      // Limit history size
      if (newHistory.length > maxHistorySteps) {
        return newHistory.slice(-maxHistorySteps)
      }
      
      return newHistory
    })

    setHistoryIndex(prevIndex => {
      const newIndex = Math.min(prevIndex + 1, maxHistorySteps - 1)
      return newIndex
    })
  }, [historyIndex, maxHistorySteps])

  // Undo operation
  const undo = useCallback((): Dashboard | null => {
    if (!canUndo) return null

    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    
    return history[newIndex].dashboard
  }, [canUndo, historyIndex, history])

  // Redo operation
  const redo = useCallback((): Dashboard | null => {
    if (!canRedo) return null

    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    
    return history[newIndex].dashboard
  }, [canRedo, historyIndex, history])

  // Clear all history
  const clearHistory = useCallback(() => {
    const currentState = history[historyIndex]
    setHistory([currentState])
    setHistoryIndex(0)
  }, [history, historyIndex])

  // Go to specific history index
  const goToHistoryIndex = useCallback((index: number): Dashboard | null => {
    if (index < 0 || index >= history.length) return null

    setHistoryIndex(index)
    return history[index].dashboard
  }, [history])

  // Get history preview for UI
  const getHistoryPreview = useCallback((): DashboardHistoryState[] => {
    return history.map((state, index) => ({
      ...state,
      dashboard: {
        ...state.dashboard,
        widgets: [] // Remove widgets for preview to reduce size
      }
    }))
  }, [history])

  // Export history as JSON
  const exportHistory = useCallback((): string => {
    const exportData = {
      history: getHistoryPreview(),
      currentIndex: historyIndex,
      exportedAt: new Date(),
      version: '1.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }, [getHistoryPreview, historyIndex])

  // Import history from JSON
  const importHistory = useCallback((historyJson: string): boolean => {
    try {
      const importData = JSON.parse(historyJson)
      
      if (!importData.history || !Array.isArray(importData.history)) {
        return false
      }

      // Validate history structure
      const isValidHistory = importData.history.every((state: any) => 
        state.dashboard && 
        state.timestamp && 
        state.action && 
        state.description
      )

      if (!isValidHistory) {
        return false
      }

      setHistory(importData.history)
      setHistoryIndex(Math.min(importData.currentIndex || 0, importData.history.length - 1))
      
      return true
    } catch (error) {
      console.error('Failed to import history:', error)
      return false
    }
  }, [])

  return {
    // State
    history,
    historyIndex,
    canUndo,
    canRedo,
    
    // Actions
    pushState,
    undo,
    redo,
    clearHistory,
    goToHistoryIndex,
    
    // Utilities
    getHistoryPreview,
    exportHistory,
    importHistory
  }
}

// Helper function to generate action descriptions
function getActionDescription(action: DashboardAction): string {
  switch (action.type) {
    case 'ADD_WIDGET':
      return `Added ${action.payload?.chartType || 'widget'}`
    case 'REMOVE_WIDGET':
      return `Removed widget`
    case 'UPDATE_WIDGET':
      return `Updated widget configuration`
    case 'MOVE_WIDGET':
      return `Moved widget`
    case 'RESIZE_WIDGET':
      return `Resized widget`
    case 'UPDATE_DASHBOARD':
      return `Updated dashboard settings`
    case 'IMPORT_DASHBOARD':
      return `Imported dashboard`
    case 'CLEAR_DASHBOARD':
      return `Cleared dashboard`
    default:
      return `Dashboard action: ${action.type}`
  }
}

// Hook for keyboard shortcut status
export function useHistoryKeyboardShortcuts() {
  const [shortcuts] = useState({
    undo: {
      key: 'Ctrl+Z',
      mac: '⌘Z',
      description: 'Undo last action'
    },
    redo: {
      key: 'Ctrl+Y',
      mac: '⌘Y',
      description: 'Redo last undone action'
    },
    redoAlt: {
      key: 'Ctrl+Shift+Z',
      mac: '⌘⇧Z',
      description: 'Redo last undone action (alternative)'
    }
  })

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return {
    shortcuts,
    isMac,
    getShortcutText: (action: 'undo' | 'redo') => {
      const shortcut = shortcuts[action]
      return isMac ? shortcut.mac : shortcut.key
    }
  }
}