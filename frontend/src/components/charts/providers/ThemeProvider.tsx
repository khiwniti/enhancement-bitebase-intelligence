'use client'

// Theme Provider - Manages chart theming and styling
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ThemeConfig, ThemeVariant, UseThemeReturn, BiteBaseThemeExtensions } from '../types/themeTypes'

// Theme Context Value
interface ThemeContextValue extends UseThemeReturn {
  bitebaseExtensions: BiteBaseThemeExtensions
  applyThemeToChart: (chartId: string, customizations?: Partial<ThemeConfig>) => void
  resetChartTheme: (chartId: string) => void
}

// BiteBase specific theme extensions
const bitebaseExtensions: BiteBaseThemeExtensions = {
  brand: {
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#00ff88',
    dark: '#0f172a',
    darker: '#020617',
    light: '#1e293b'
  },
  dashboard: {
    background: '#020617',
    cardBackground: '#0f172a',
    headerBackground: '#1e293b',
    sidebarBackground: '#0f172a'
  },
  charts: {
    restaurant: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
    analytics: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
    location: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
    performance: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']
  },
  status: {
    online: '#22c55e',
    offline: '#6b7280',
    processing: '#f59e0b',
    error: '#ef4444',
    success: '#10b981'
  }
}

// Default BiteBase theme
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

// Light theme variant
const lightThemeVariant: ThemeVariant = {
  name: 'BiteBase Light',
  baseTheme: 'BiteBase Dark',
  description: 'Light theme variant for BiteBase charts',
  overrides: {
    mode: 'light',
    charts: {
      background: { primary: '#ffffff', secondary: '#f8fafc', transparent: 'transparent' },
      foreground: { primary: '#0f172a', secondary: '#475569', muted: '#64748b' },
      border: { primary: '#e2e8f0', secondary: '#cbd5e1', muted: '#94a3b8' },
      grid: { primary: '#e2e8f0', secondary: '#cbd5e1', subtle: '#f1f5f9' },
      axis: { line: '#e2e8f0', text: '#475569', title: '#0f172a' },
      legend: { background: '#f8fafc', text: '#0f172a', border: '#e2e8f0' },
      tooltip: { background: '#ffffff', text: '#0f172a', border: '#e2e8f0', shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
    }
  }
}

// Context
const ThemeContext = createContext<ThemeContextValue | null>(null)

// Provider Props
interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: ThemeConfig
  initialVariant?: ThemeVariant
}

// Provider Component
export function ThemeProvider({ 
  children, 
  initialTheme = defaultTheme,
  initialVariant
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(initialTheme)
  const [variant, setVariantState] = useState<ThemeVariant | undefined>(initialVariant)
  const [chartCustomizations, setChartCustomizations] = useState<Record<string, Partial<ThemeConfig>>>({})

  // Theme management functions
  const setTheme = useCallback((newTheme: ThemeConfig) => {
    setThemeState(newTheme)
    // Persist theme to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bitebase-chart-theme', JSON.stringify(newTheme))
    }
  }, [])

  const setVariant = useCallback((newVariant: ThemeVariant) => {
    setVariantState(newVariant)
    // Apply variant overrides to theme
    const mergedTheme = { ...theme, ...newVariant.overrides }
    setThemeState(mergedTheme)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('bitebase-chart-variant', JSON.stringify(newVariant))
    }
  }, [theme])

  const toggleMode = useCallback(() => {
    const newMode = theme.mode === 'dark' ? 'light' : 'dark'
    const newTheme = newMode === 'light' ? 
      { ...theme, ...lightThemeVariant.overrides } : 
      defaultTheme
    
    setTheme(newTheme)
  }, [theme, setTheme])

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme)
    setVariantState(undefined)
    setChartCustomizations({})
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bitebase-chart-theme')
      localStorage.removeItem('bitebase-chart-variant')
    }
  }, [setTheme])

  const applyThemeToChart = useCallback((chartId: string, customizations?: Partial<ThemeConfig>) => {
    if (customizations) {
      setChartCustomizations(prev => ({
        ...prev,
        [chartId]: customizations
      }))
    }
  }, [])

  const resetChartTheme = useCallback((chartId: string) => {
    setChartCustomizations(prev => {
      const { [chartId]: removed, ...rest } = prev
      return rest
    })
  }, [])

  // Utility functions
  const getChartColors = useCallback((count: number) => {
    const allColors = [
      ...theme.colors.primary,
      ...theme.colors.secondary,
      ...theme.colors.accent
    ]
    
    const colors: string[] = []
    for (let i = 0; i < count; i++) {
      colors.push(allColors[i % allColors.length])
    }
    
    return colors
  }, [theme.colors])

  const getCSSVariables = useCallback(() => {
    const variables: Record<string, string> = {}
    
    // Color variables
    theme.colors.primary.forEach((color, index) => {
      variables[`--chart-primary-${index}`] = color
    })
    
    theme.colors.secondary.forEach((color, index) => {
      variables[`--chart-secondary-${index}`] = color
    })
    
    // Chart-specific variables
    Object.entries(theme.charts).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          variables[`--chart-${key}-${subKey}`] = subValue
        })
      } else {
        variables[`--chart-${key}`] = value
      }
    })
    
    // Typography variables
    variables['--chart-font-family'] = theme.typography.fontFamily.primary
    variables['--chart-font-size-base'] = `${theme.typography.fontSize.base}px`
    
    return variables
  }, [theme])

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('bitebase-chart-theme')
      const savedVariant = localStorage.getItem('bitebase-chart-variant')
      
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme)
          setThemeState(parsedTheme)
        } catch (error) {
          console.warn('Failed to parse saved theme:', error)
        }
      }
      
      if (savedVariant) {
        try {
          const parsedVariant = JSON.parse(savedVariant)
          setVariantState(parsedVariant)
        } catch (error) {
          console.warn('Failed to parse saved variant:', error)
        }
      }
    }
  }, [])

  // Apply CSS variables to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const variables = getCSSVariables()
      const root = document.documentElement
      
      Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
    }
  }, [getCSSVariables])

  const contextValue: ThemeContextValue = {
    theme,
    variant,
    mode: theme.mode,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    setTheme,
    setVariant,
    toggleMode,
    getChartColors,
    getCSSVariables,
    bitebaseExtensions,
    applyThemeToChart,
    resetChartTheme
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme context
export function useThemeProvider() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeProvider must be used within a ThemeProvider')
  }
  return context
}

// Export default theme and variants for external use
export { defaultTheme, lightThemeVariant, bitebaseExtensions }