// Dashboard Auto-Save Hook
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dashboard, DEFAULT_DASHBOARD_SETTINGS } from '../types/dashboardTypes'

interface UseDashboardAutoSaveOptions {
  enabled?: boolean
  interval?: number // in milliseconds
  onSave?: (dashboard: Dashboard) => Promise<void>
  onSaveSuccess?: (dashboard: Dashboard) => void
  onSaveError?: (error: Error, dashboard: Dashboard) => void
  onSaveStart?: (dashboard: Dashboard) => void
  debounceDelay?: number // debounce user changes before auto-save
  maxRetries?: number
  retryDelay?: number // delay between retries in milliseconds
}

interface UseDashboardAutoSaveReturn {
  // State
  isSaving: boolean
  lastSaved: Date | null
  saveError: Error | null
  isDirty: boolean
  saveCount: number
  
  // Actions
  save: (dashboard: Dashboard) => Promise<void>
  forceSave: (dashboard: Dashboard) => Promise<void>
  pauseAutoSave: () => void
  resumeAutoSave: () => void
  markDirty: () => void
  markClean: () => void
  
  // Configuration
  updateInterval: (newInterval: number) => void
  toggleAutoSave: (enabled: boolean) => void
  
  // Status
  getTimeSinceLastSave: () => number | null
  getNextSaveTime: () => number | null
}

export function useDashboardAutoSave(
  dashboard: Dashboard | null,
  options: UseDashboardAutoSaveOptions = {}
): UseDashboardAutoSaveReturn {
  const {
    enabled = DEFAULT_DASHBOARD_SETTINGS.autoSave,
    interval = DEFAULT_DASHBOARD_SETTINGS.autoSaveInterval,
    onSave,
    onSaveSuccess,
    onSaveError,
    onSaveStart,
    debounceDelay = 1000,
    maxRetries = 3,
    retryDelay = 2000
  } = options

  // State
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [saveCount, setSaveCount] = useState(0)
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(enabled)
  const [currentInterval, setCurrentInterval] = useState(interval)
  const [isPaused, setIsPaused] = useState(false)

  // Refs
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const lastDashboardRef = useRef<Dashboard | null>(dashboard)
  const saveInProgressRef = useRef(false)

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Track dashboard changes
  useEffect(() => {
    if (!dashboard || !lastDashboardRef.current) {
      lastDashboardRef.current = dashboard
      return
    }

    // Check if dashboard has actually changed
    const hasChanged = JSON.stringify(dashboard) !== JSON.stringify(lastDashboardRef.current)
    
    if (hasChanged) {
      setIsDirty(true)
      setSaveError(null)
      lastDashboardRef.current = dashboard
      
      // Debounce auto-save
      if (isAutoSaveEnabled && !isPaused) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        
        debounceTimerRef.current = setTimeout(() => {
          scheduleAutoSave()
        }, debounceDelay)
      }
    }
  }, [dashboard, isAutoSaveEnabled, isPaused, debounceDelay])

  // Schedule auto-save
  const scheduleAutoSave = useCallback(() => {
    if (!isAutoSaveEnabled || isPaused || !dashboard || !isDirty) {
      return
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (dashboard && isDirty && !saveInProgressRef.current) {
        performSave(dashboard, false)
      }
    }, currentInterval)
  }, [isAutoSaveEnabled, isPaused, dashboard, isDirty, currentInterval])

  // Perform save operation
  const performSave = useCallback(async (
    dashboardToSave: Dashboard, 
    isManual: boolean = false
  ): Promise<void> => {
    if (saveInProgressRef.current) {
      return
    }

    saveInProgressRef.current = true
    setIsSaving(true)
    setSaveError(null)

    try {
      onSaveStart?.(dashboardToSave)
      
      if (onSave) {
        await onSave(dashboardToSave)
      }

      // Success
      setLastSaved(new Date())
      setIsDirty(false)
      setSaveCount(prev => prev + 1)
      retryCountRef.current = 0
      
      onSaveSuccess?.(dashboardToSave)
      
      // Schedule next auto-save if enabled and not manual
      if (!isManual && isAutoSaveEnabled && !isPaused) {
        scheduleAutoSave()
      }
      
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Save failed')
      setSaveError(saveError)
      onSaveError?.(saveError, dashboardToSave)
      
      // Retry logic for auto-saves
      if (!isManual && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        
        setTimeout(() => {
          if (dashboard && isDirty) {
            performSave(dashboard, false)
          }
        }, retryDelay * retryCountRef.current) // Exponential backoff
      }
    } finally {
      setIsSaving(false)
      saveInProgressRef.current = false
    }
  }, [
    onSave, 
    onSaveStart, 
    onSaveSuccess, 
    onSaveError, 
    isAutoSaveEnabled, 
    isPaused, 
    maxRetries, 
    retryDelay,
    scheduleAutoSave,
    dashboard,
    isDirty
  ])

  // Manual save
  const save = useCallback(async (dashboardToSave: Dashboard): Promise<void> => {
    await performSave(dashboardToSave, true)
  }, [performSave])

  // Force save (ignores dirty state)
  const forceSave = useCallback(async (dashboardToSave: Dashboard): Promise<void> => {
    const wasDirty = isDirty
    setIsDirty(true)
    await performSave(dashboardToSave, true)
    if (!wasDirty) {
      setIsDirty(false)
    }
  }, [performSave, isDirty])

  // Pause auto-save
  const pauseAutoSave = useCallback(() => {
    setIsPaused(true)
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  // Resume auto-save
  const resumeAutoSave = useCallback(() => {
    setIsPaused(false)
    if (isAutoSaveEnabled && isDirty && dashboard) {
      scheduleAutoSave()
    }
  }, [isAutoSaveEnabled, isDirty, dashboard, scheduleAutoSave])

  // Mark as dirty
  const markDirty = useCallback(() => {
    setIsDirty(true)
    setSaveError(null)
  }, [])

  // Mark as clean
  const markClean = useCallback(() => {
    setIsDirty(false)
  }, [])

  // Update interval
  const updateInterval = useCallback((newInterval: number) => {
    setCurrentInterval(newInterval)
    
    // Reschedule if auto-save is active
    if (isAutoSaveEnabled && !isPaused && isDirty) {
      scheduleAutoSave()
    }
  }, [isAutoSaveEnabled, isPaused, isDirty, scheduleAutoSave])

  // Toggle auto-save
  const toggleAutoSave = useCallback((enableAutoSave: boolean) => {
    setIsAutoSaveEnabled(enableAutoSave)
    
    if (enableAutoSave && !isPaused && isDirty && dashboard) {
      scheduleAutoSave()
    } else if (!enableAutoSave) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isPaused, isDirty, dashboard, scheduleAutoSave])

  // Get time since last save
  const getTimeSinceLastSave = useCallback((): number | null => {
    if (!lastSaved) return null
    return Date.now() - lastSaved.getTime()
  }, [lastSaved])

  // Get next save time
  const getNextSaveTime = useCallback((): number | null => {
    if (!isAutoSaveEnabled || isPaused || !isDirty) return null
    
    const timeSinceLastChange = lastDashboardRef.current ? 
      Date.now() - new Date(lastDashboardRef.current.updatedAt).getTime() : 0
    
    return Math.max(0, currentInterval - timeSinceLastChange)
  }, [isAutoSaveEnabled, isPaused, isDirty, currentInterval])

  return {
    // State
    isSaving,
    lastSaved,
    saveError,
    isDirty,
    saveCount,
    
    // Actions
    save,
    forceSave,
    pauseAutoSave,
    resumeAutoSave,
    markDirty,
    markClean,
    
    // Configuration
    updateInterval,
    toggleAutoSave,
    
    // Status
    getTimeSinceLastSave,
    getNextSaveTime
  }
}

// Hook for auto-save status display
export function useAutoSaveStatus(autoSave: UseDashboardAutoSaveReturn) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'dirty'>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')

  useEffect(() => {
    if (autoSave.isSaving) {
      setStatus('saving')
      setStatusMessage('Saving...')
    } else if (autoSave.saveError) {
      setStatus('error')
      setStatusMessage(`Save failed: ${autoSave.saveError.message}`)
    } else if (autoSave.isDirty) {
      setStatus('dirty')
      setStatusMessage('Unsaved changes')
    } else if (autoSave.lastSaved) {
      setStatus('saved')
      const timeSince = autoSave.getTimeSinceLastSave()
      if (timeSince !== null) {
        const seconds = Math.floor(timeSince / 1000)
        const minutes = Math.floor(seconds / 60)
        
        if (minutes > 0) {
          setStatusMessage(`Saved ${minutes}m ago`)
        } else {
          setStatusMessage(`Saved ${seconds}s ago`)
        }
      } else {
        setStatusMessage('Saved')
      }
    } else {
      setStatus('idle')
      setStatusMessage('')
    }
  }, [
    autoSave.isSaving,
    autoSave.saveError,
    autoSave.isDirty,
    autoSave.lastSaved,
    autoSave.getTimeSinceLastSave
  ])

  return {
    status,
    statusMessage,
    getStatusColor: () => {
      switch (status) {
        case 'saving': return 'text-blue-500'
        case 'saved': return 'text-green-500'
        case 'error': return 'text-red-500'
        case 'dirty': return 'text-yellow-500'
        default: return 'text-muted-foreground'
      }
    },
    getStatusIcon: () => {
      switch (status) {
        case 'saving': return '⏳'
        case 'saved': return '✓'
        case 'error': return '⚠️'
        case 'dirty': return '●'
        default: return ''
      }
    }
  }
}