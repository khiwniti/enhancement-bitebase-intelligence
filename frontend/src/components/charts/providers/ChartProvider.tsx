'use client'

// Chart Provider - Main Context Provider
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { ChartInstance, ChartType, ChartPerformanceConfig, ChartTheme } from '../types/chartTypes'
import { FilterManagerState, CrossFilterConfig } from '../types/filterTypes'
import { ThemeConfig } from '../types/themeTypes'

// Chart Provider State
interface ChartProviderState {
  charts: Record<string, ChartInstance>
  theme: ThemeConfig
  performance: ChartPerformanceConfig
  crossFilter: CrossFilterConfig
  isInitialized: boolean
  error: string | null
}

// Chart Provider Actions
type ChartProviderAction =
  | { type: 'REGISTER_CHART'; payload: { id: string; type: ChartType; chart: any } }
  | { type: 'UNREGISTER_CHART'; payload: { id: string } }
  | { type: 'UPDATE_CHART'; payload: { id: string; chart: any } }
  | { type: 'SET_THEME'; payload: ThemeConfig }
  | { type: 'SET_PERFORMANCE'; payload: Partial<ChartPerformanceConfig> }
  | { type: 'SET_CROSS_FILTER'; payload: Partial<CrossFilterConfig> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INITIALIZE'; payload: { theme: ThemeConfig; performance: ChartPerformanceConfig } }

// Chart Provider Context
interface ChartProviderContextValue {
  state: ChartProviderState
  registerChart: (id: string, type: ChartType, chart: any) => void
  unregisterChart: (id: string) => void
  updateChart: (id: string, chart: any) => void
  setTheme: (theme: ThemeConfig) => void
  setPerformance: (config: Partial<ChartPerformanceConfig>) => void
  setCrossFilter: (config: Partial<CrossFilterConfig>) => void
  getChart: (id: string) => ChartInstance | undefined
  getAllCharts: () => ChartInstance[]
  getChartsByType: (type: ChartType) => ChartInstance[]
}

// Default theme configuration
const defaultTheme: ThemeConfig = {
  name: 'BiteBase Dark',
  mode: 'dark',
  colors: {
    primary: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
    secondary: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
    accent: ['#00ff88', '#10b981', '#059669', '#047857', '#065f46'],
    neutral: ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'],
    semantic: {
      success: ['#22c55e', '#16a34a', '#15803d'],
      warning: ['#f59e0b', '#d97706', '#b45309'],
      error: ['#ef4444', '#dc2626', '#b91c1c'],
      info: ['#3b82f6', '#2563eb', '#1d4ed8']
    }
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      monospace: 'JetBrains Mono, Fira Code, monospace'
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    padding: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    margin: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    gap: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
  },
  borders: {
    width: { thin: 1, normal: 2, thick: 4 },
    radius: { none: 0, sm: 4, md: 8, lg: 12, full: 9999 },
    style: { solid: 'solid', dashed: 'dashed', dotted: 'dotted' }
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(34, 197, 94, 0.3)'
  },
  animations: {
    duration: { fast: 150, normal: 300, slow: 500 },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    transition: {
      all: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      colors: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  charts: {
    background: { primary: '#0f172a', secondary: '#1e293b', transparent: 'transparent' },
    foreground: { primary: '#f8fafc', secondary: '#cbd5e1', muted: '#94a3b8' },
    border: { primary: '#334155', secondary: '#475569', muted: '#64748b' },
    grid: { primary: '#334155', secondary: '#475569', subtle: '#1e293b' },
    axis: { line: '#334155', text: '#cbd5e1', title: '#f8fafc' },
    legend: { background: '#1e293b', text: '#f8fafc', border: '#334155' },
    tooltip: { background: '#1e293b', text: '#f8fafc', border: '#334155', shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }
  }
}

// Default performance configuration
const defaultPerformance: ChartPerformanceConfig = {
  enableLazyLoading: true,
  enableVirtualization: true,
  maxDataPoints: 10000,
  animationDuration: 300,
  enableWebGL: false,
  cacheStrategy: 'memory'
}

// Default cross-filter configuration
const defaultCrossFilter: CrossFilterConfig = {
  mode: 'automatic',
  bidirectional: true,
  debounceMs: 300,
  maxFilters: 10,
  enableHistory: true,
  persistFilters: false
}

// Initial state
const initialState: ChartProviderState = {
  charts: {},
  theme: defaultTheme,
  performance: defaultPerformance,
  crossFilter: defaultCrossFilter,
  isInitialized: false,
  error: null
}

// Reducer
function chartProviderReducer(state: ChartProviderState, action: ChartProviderAction): ChartProviderState {
  switch (action.type) {
    case 'REGISTER_CHART':
      return {
        ...state,
        charts: {
          ...state.charts,
          [action.payload.id]: {
            id: action.payload.id,
            type: action.payload.type,
            chart: action.payload.chart,
            container: null,
            isVisible: true,
            lastUpdate: new Date(),
            performanceMetrics: {
              renderTime: 0,
              dataSize: 0,
              memoryUsage: 0
            }
          }
        }
      }

    case 'UNREGISTER_CHART':
      const { [action.payload.id]: removed, ...remainingCharts } = state.charts
      return {
        ...state,
        charts: remainingCharts
      }

    case 'UPDATE_CHART':
      return {
        ...state,
        charts: {
          ...state.charts,
          [action.payload.id]: {
            ...state.charts[action.payload.id],
            chart: action.payload.chart,
            lastUpdate: new Date()
          }
        }
      }

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      }

    case 'SET_PERFORMANCE':
      return {
        ...state,
        performance: {
          ...state.performance,
          ...action.payload
        }
      }

    case 'SET_CROSS_FILTER':
      return {
        ...state,
        crossFilter: {
          ...state.crossFilter,
          ...action.payload
        }
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }

    case 'INITIALIZE':
      return {
        ...state,
        theme: action.payload.theme,
        performance: action.payload.performance,
        isInitialized: true
      }

    default:
      return state
  }
}

// Context
const ChartProviderContext = createContext<ChartProviderContextValue | null>(null)

// Provider Props
interface ChartProviderProps {
  children: React.ReactNode
  theme?: Partial<ThemeConfig>
  performance?: Partial<ChartPerformanceConfig>
  crossFilter?: Partial<CrossFilterConfig>
}

// Provider Component
export function ChartProvider({ 
  children, 
  theme: customTheme,
  performance: customPerformance,
  crossFilter: customCrossFilter
}: ChartProviderProps) {
  const [state, dispatch] = useReducer(chartProviderReducer, initialState)

  // Initialize provider
  useEffect(() => {
    const mergedTheme = customTheme ? { ...defaultTheme, ...customTheme } : defaultTheme
    const mergedPerformance = customPerformance ? { ...defaultPerformance, ...customPerformance } : defaultPerformance
    
    dispatch({
      type: 'INITIALIZE',
      payload: {
        theme: mergedTheme,
        performance: mergedPerformance
      }
    })

    if (customCrossFilter) {
      dispatch({
        type: 'SET_CROSS_FILTER',
        payload: customCrossFilter
      })
    }
  }, [customTheme, customPerformance, customCrossFilter])

  // Chart management functions
  const registerChart = useCallback((id: string, type: ChartType, chart: any) => {
    dispatch({ type: 'REGISTER_CHART', payload: { id, type, chart } })
  }, [])

  const unregisterChart = useCallback((id: string) => {
    dispatch({ type: 'UNREGISTER_CHART', payload: { id } })
  }, [])

  const updateChart = useCallback((id: string, chart: any) => {
    dispatch({ type: 'UPDATE_CHART', payload: { id, chart } })
  }, [])

  const setTheme = useCallback((theme: ThemeConfig) => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }, [])

  const setPerformance = useCallback((config: Partial<ChartPerformanceConfig>) => {
    dispatch({ type: 'SET_PERFORMANCE', payload: config })
  }, [])

  const setCrossFilter = useCallback((config: Partial<CrossFilterConfig>) => {
    dispatch({ type: 'SET_CROSS_FILTER', payload: config })
  }, [])

  const getChart = useCallback((id: string) => {
    return state.charts[id]
  }, [state.charts])

  const getAllCharts = useCallback(() => {
    return Object.values(state.charts)
  }, [state.charts])

  const getChartsByType = useCallback((type: ChartType) => {
    return Object.values(state.charts).filter(chart => chart.type === type)
  }, [state.charts])

  const contextValue: ChartProviderContextValue = {
    state,
    registerChart,
    unregisterChart,
    updateChart,
    setTheme,
    setPerformance,
    setCrossFilter,
    getChart,
    getAllCharts,
    getChartsByType
  }

  return (
    <ChartProviderContext.Provider value={contextValue}>
      {children}
    </ChartProviderContext.Provider>
  )
}

// Hook to use chart context
export function useChartProvider() {
  const context = useContext(ChartProviderContext)
  if (!context) {
    throw new Error('useChartProvider must be used within a ChartProvider')
  }
  return context
}