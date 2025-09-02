'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'

interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  screenReaderAnnouncements: boolean
  keyboardNavigation: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (settings: Partial<AccessibilitySettings>) => void
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  focusElement: (selector: string) => void
  skipToContent: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    screenReaderAnnouncements: true,
    keyboardNavigation: true,
  })

  const announcementRef = useRef<HTMLDivElement>(null)

  // Initialize accessibility settings
  useEffect(() => {
    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({
          ...prev,
          ...parsed,
          reducedMotion: prefersReducedMotion || parsed.reducedMotion,
          highContrast: prefersHighContrast || parsed.highContrast,
        }))
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error)
      }
    } else {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }))
    }
  }, [])

  // Apply accessibility settings to DOM
  useEffect(() => {
    const root = document.documentElement

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${settings.fontSize}`)

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  // Listen for system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }))
    }

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }))
    }

    motionQuery.addEventListener('change', handleMotionChange)
    contrastQuery.addEventListener('change', handleContrastChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  // Update settings function
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  // Announce message to screen readers
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.screenReaderAnnouncements || !announcementRef.current) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    announcementRef.current.appendChild(announcement)

    // Remove announcement after it's been read
    setTimeout(() => {
      if (announcementRef.current?.contains(announcement)) {
        announcementRef.current.removeChild(announcement)
      }
    }, 1000)
  }

  // Focus element by selector
  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      // Announce focus change for screen readers
      if (element.getAttribute('aria-label') || element.textContent) {
        announce(`Focused on ${element.getAttribute('aria-label') || element.textContent}`)
      }
    }
  }

  // Skip to main content
  const skipToContent = () => {
    focusElement('#main-content')
  }

  // Keyboard navigation handler
  useEffect(() => {
    if (!settings.keyboardNavigation) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to content with Alt+S
      if (event.altKey && event.key === 's') {
        event.preventDefault()
        skipToContent()
      }

      // Focus search with Alt+/
      if (event.altKey && event.key === '/') {
        event.preventDefault()
        focusElement('[role="search"] input, [type="search"]')
      }

      // Focus navigation with Alt+N
      if (event.altKey && event.key === 'n') {
        event.preventDefault()
        focusElement('[role="navigation"] a, nav a')
      }

      // Escape key to close modals/dropdowns
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.closest('[role="dialog"], [role="menu"]')) {
          const closeButton = activeElement.closest('[role="dialog"], [role="menu"]')
            ?.querySelector('[aria-label*="close"], [aria-label*="Close"], .close-button') as HTMLElement
          if (closeButton) {
            closeButton.click()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [settings.keyboardNavigation])

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    announce,
    focusElement,
    skipToContent,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Hook for announcements
export function useAnnouncements() {
  const { announce } = useAccessibility()
  return announce
}
