'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderContext {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const ThemeProviderContext = createContext<ThemeProviderContext | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'bitebase-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme
    if (stored) {
      setTheme(stored)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement
    
    let systemTheme: 'dark' | 'light' = 'light'
    
    if (theme === 'system') {
      systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      systemTheme = theme === 'dark' ? 'dark' : 'light'
    }

    setResolvedTheme(systemTheme)

    root.classList.remove('light', 'dark')
    root.classList.add(systemTheme)

    // Update CSS custom properties for theme
    if (systemTheme === 'dark') {
      root.style.setProperty('--background', '0 0% 3.9%')
      root.style.setProperty('--foreground', '0 0% 98%')
      root.style.setProperty('--card', '0 0% 3.9%')
      root.style.setProperty('--card-foreground', '0 0% 98%')
      root.style.setProperty('--popover', '0 0% 3.9%')
      root.style.setProperty('--popover-foreground', '0 0% 98%')
      root.style.setProperty('--primary', '0 0% 98%')
      root.style.setProperty('--primary-foreground', '0 0% 9%')
      root.style.setProperty('--secondary', '0 0% 14.9%')
      root.style.setProperty('--secondary-foreground', '0 0% 98%')
      root.style.setProperty('--muted', '0 0% 14.9%')
      root.style.setProperty('--muted-foreground', '0 0% 63.9%')
      root.style.setProperty('--accent', '0 0% 14.9%')
      root.style.setProperty('--accent-foreground', '0 0% 98%')
      root.style.setProperty('--border', '0 0% 14.9%')
      root.style.setProperty('--input', '0 0% 14.9%')
      root.style.setProperty('--ring', '0 0% 83.1%')
    } else {
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--foreground', '0 0% 3.9%')
      root.style.setProperty('--card', '0 0% 100%')
      root.style.setProperty('--card-foreground', '0 0% 3.9%')
      root.style.setProperty('--popover', '0 0% 100%')
      root.style.setProperty('--popover-foreground', '0 0% 3.9%')
      root.style.setProperty('--primary', '0 0% 9%')
      root.style.setProperty('--primary-foreground', '0 0% 98%')
      root.style.setProperty('--secondary', '0 0% 96.1%')
      root.style.setProperty('--secondary-foreground', '0 0% 9%')
      root.style.setProperty('--muted', '0 0% 96.1%')
      root.style.setProperty('--muted-foreground', '0 0% 45.1%')
      root.style.setProperty('--accent', '0 0% 96.1%')
      root.style.setProperty('--accent-foreground', '0 0% 9%')
      root.style.setProperty('--border', '0 0% 89.8%')
      root.style.setProperty('--input', '0 0% 89.8%')
      root.style.setProperty('--ring', '0 0% 3.9%')
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme,
    resolvedTheme,
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}