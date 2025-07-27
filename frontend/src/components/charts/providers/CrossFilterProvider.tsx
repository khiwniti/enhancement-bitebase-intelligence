'use client'

// Cross Filter Provider - Manages chart filtering and interactions
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { 
  FilterManagerState, 
  CrossFilterConfig, 
  FilterEvent, 
  FilterGroup, 
  ChartFilterState,
  FilterHistoryEntry,
  FilterBridgeConfig,
  UseFilterReturn
} from '../types/filterTypes'

// Cross Filter Actions
type CrossFilterAction =
  | { type: 'SET_CONFIG'; payload: Partial<CrossFilterConfig> }
  | { type: 'APPLY_FILTER'; payload: { chartId: string; filter: FilterGroup } }
  | { type: 'REMOVE_FILTER'; payload: { chartId: string; filterId: string } }
  | { type: 'CLEAR_FILTERS'; payload: { chartId?: string } }
  | { type: 'TOGGLE_MODE' }
  | { type: 'ADD_HISTORY'; payload: FilterHistoryEntry }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'ADD_BRIDGE'; payload: FilterBridgeConfig }
  | { type: 'REMOVE_BRIDGE'; payload: { sourceChartId: string; targetChartId: string } }
  | { type: 'SET_PROCESSING'; payload: boolean }

// Cross Filter Context Value
interface CrossFilterContextValue extends UseFilterReturn {
  state: FilterManagerState
  addBridge: (bridge: FilterBridgeConfig) => void
  removeBridge: (sourceChartId: string, targetChartId: string) => void
  getActiveFiltersForChart: (chartId: string) => FilterGroup[]
  getBridgesForChart: (chartId: string) => FilterBridgeConfig[]
}

// Default configuration
const defaultConfig: CrossFilterConfig = {
  mode: 'automatic',
  bidirectional: true,
  debounceMs: 300,
  maxFilters: 10,
  enableHistory: true,
  persistFilters: false
}

// Initial state
const initialState: FilterManagerState = {
  config: defaultConfig,
  activeFilters: {},
  history: [],
  bridges: [],
  performance: [],
  isProcessing: false,
  lastUpdate: new Date()
}

// Reducer
function crossFilterReducer(state: FilterManagerState, action: CrossFilterAction): FilterManagerState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      }

    case 'APPLY_FILTER': {
      const { chartId, filter } = action.payload
      const existingFilter = state.activeFilters[chartId]
      
      const newFilterState: ChartFilterState = {
        chartId,
        isActive: true,
        filters: existingFilter ? [...existingFilter.filters, filter] : [filter],
        appliedAt: new Date(),
        affectedDataPoints: 0 // This would be calculated based on actual data
      }

      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          [chartId]: newFilterState
        },
        lastUpdate: new Date()
      }
    }

    case 'REMOVE_FILTER': {
      const { chartId, filterId } = action.payload
      const existingFilter = state.activeFilters[chartId]
      
      if (!existingFilter) return state

      const updatedFilters = existingFilter.filters.filter(f => f.id !== filterId)
      
      if (updatedFilters.length === 0) {
        const { [chartId]: removed, ...remainingFilters } = state.activeFilters
        return {
          ...state,
          activeFilters: remainingFilters,
          lastUpdate: new Date()
        }
      }

      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          [chartId]: {
            ...existingFilter,
            filters: updatedFilters,
            appliedAt: new Date()
          }
        },
        lastUpdate: new Date()
      }
    }

    case 'CLEAR_FILTERS': {
      const { chartId } = action.payload
      
      if (chartId) {
        const { [chartId]: removed, ...remainingFilters } = state.activeFilters
        return {
          ...state,
          activeFilters: remainingFilters,
          lastUpdate: new Date()
        }
      }

      return {
        ...state,
        activeFilters: {},
        lastUpdate: new Date()
      }
    }

    case 'TOGGLE_MODE':
      return {
        ...state,
        config: {
          ...state.config,
          mode: state.config.mode === 'automatic' ? 'manual' : 'automatic'
        }
      }

    case 'ADD_HISTORY':
      const newHistory = [action.payload, ...state.history.slice(0, 49)] // Keep last 50 entries
      return {
        ...state,
        history: newHistory
      }

    case 'UNDO': {
      const lastEntry = state.history[0]
      if (!lastEntry || !lastEntry.canUndo) return state

      return {
        ...state,
        activeFilters: lastEntry.previousState.reduce((acc, filterState) => {
          acc[filterState.chartId] = filterState
          return acc
        }, {} as Record<string, ChartFilterState>),
        history: state.history.slice(1)
      }
    }

    case 'REDO': {
      const lastEntry = state.history[0]
      if (!lastEntry || !lastEntry.canRedo) return state

      return {
        ...state,
        activeFilters: lastEntry.newState.reduce((acc, filterState) => {
          acc[filterState.chartId] = filterState
          return acc
        }, {} as Record<string, ChartFilterState>),
        history: state.history.slice(1)
      }
    }

    case 'ADD_BRIDGE':
      return {
        ...state,
        bridges: [...state.bridges, action.payload]
      }

    case 'REMOVE_BRIDGE': {
      const { sourceChartId, targetChartId } = action.payload
      return {
        ...state,
        bridges: state.bridges.filter(
          bridge => !(bridge.sourceChartId === sourceChartId && 
                     bridge.targetChartIds.includes(targetChartId))
        )
      }
    }

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      }

    default:
      return state
  }
}

// Context
const CrossFilterContext = createContext<CrossFilterContextValue | null>(null)

// Provider Props
interface CrossFilterProviderProps {
  children: React.ReactNode
  config?: Partial<CrossFilterConfig>
}

// Provider Component
export function CrossFilterProvider({ children, config: customConfig }: CrossFilterProviderProps) {
  const [state, dispatch] = useReducer(crossFilterReducer, {
    ...initialState,
    config: customConfig ? { ...defaultConfig, ...customConfig } : defaultConfig
  })

  // Debounced filter application
  const debouncedApplyFilter = useCallback(
    debounce((chartId: string, filter: FilterGroup) => {
      dispatch({ type: 'APPLY_FILTER', payload: { chartId, filter } })
    }, state.config.debounceMs),
    [state.config.debounceMs]
  )

  // Filter management functions
  const applyFilter = useCallback((chartId: string, filter: FilterGroup) => {
    if (state.config.mode === 'automatic') {
      debouncedApplyFilter(chartId, filter)
    } else {
      dispatch({ type: 'APPLY_FILTER', payload: { chartId, filter } })
    }
  }, [state.config.mode, debouncedApplyFilter])

  const removeFilter = useCallback((chartId: string, filterId: string) => {
    dispatch({ type: 'REMOVE_FILTER', payload: { chartId, filterId } })
  }, [])

  const clearFilters = useCallback((chartId?: string) => {
    dispatch({ type: 'CLEAR_FILTERS', payload: { chartId } })
  }, [])

  const toggleMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_MODE' })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  const addBridge = useCallback((bridge: FilterBridgeConfig) => {
    dispatch({ type: 'ADD_BRIDGE', payload: bridge })
  }, [])

  const removeBridge = useCallback((sourceChartId: string, targetChartId: string) => {
    dispatch({ type: 'REMOVE_BRIDGE', payload: { sourceChartId, targetChartId } })
  }, [])

  // Helper functions
  const getActiveFiltersForChart = useCallback((chartId: string) => {
    return state.activeFilters[chartId]?.filters || []
  }, [state.activeFilters])

  const getBridgesForChart = useCallback((chartId: string) => {
    return state.bridges.filter(bridge => 
      bridge.sourceChartId === chartId || bridge.targetChartIds.includes(chartId)
    )
  }, [state.bridges])

  const exportFilters = useCallback(() => {
    return {
      version: '1.0.0',
      exportedAt: new Date(),
      filters: Object.values(state.activeFilters).flatMap(filterState => filterState.filters),
      metadata: {
        chartIds: Object.keys(state.activeFilters),
        datasetIds: [], // Would be populated based on actual data
        fieldMappings: {}
      }
    }
  }, [state.activeFilters])

  const importFilters = useCallback((filterExport: any) => {
    // Implementation would depend on the specific import format
    console.log('Import filters:', filterExport)
  }, [])

  // Computed values
  const filters = Object.values(state.activeFilters).flatMap(filterState => filterState.filters)
  const activeFilters = Object.values(state.activeFilters)
  const isFiltering = state.isProcessing || Object.keys(state.activeFilters).length > 0
  const canUndo = state.history.length > 0 && state.history[0].canUndo
  const canRedo = state.history.length > 0 && state.history[0].canRedo

  const contextValue: CrossFilterContextValue = {
    state,
    filters,
    activeFilters,
    isFiltering,
    applyFilter,
    removeFilter,
    clearFilters,
    toggleMode,
    canUndo,
    canRedo,
    undo,
    redo,
    exportFilters,
    importFilters,
    addBridge,
    removeBridge,
    getActiveFiltersForChart,
    getBridgesForChart
  }

  return (
    <CrossFilterContext.Provider value={contextValue}>
      {children}
    </CrossFilterContext.Provider>
  )
}

// Hook to use cross filter context
export function useCrossFilterProvider() {
  const context = useContext(CrossFilterContext)
  if (!context) {
    throw new Error('useCrossFilterProvider must be used within a CrossFilterProvider')
  }
  return context
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}