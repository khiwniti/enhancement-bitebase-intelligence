'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { LoadingOverlay } from '@/components/ui/Loading'

// Global loading state management
interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

interface LoadingContextType {
  loading: LoadingState
  setLoading: (loading: Partial<LoadingState>) => void
  startLoading: (message?: string) => void
  stopLoading: () => void
  setProgress: (progress: number) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Global error state management
interface ErrorState {
  hasError: boolean
  error?: Error
  context?: string
}

interface ErrorContextType {
  error: ErrorState
  setError: (error: Partial<ErrorState>) => void
  clearError: () => void
  reportError: (error: Error, context?: string) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

// Combined provider props
interface AppStateProviderProps {
  children: ReactNode
  enableGlobalLoading?: boolean
  enableErrorBoundary?: boolean
}

// Loading Provider
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoadingState] = useState<LoadingState>({
    isLoading: false
  })

  const setLoading = (newLoading: Partial<LoadingState>) => {
    setLoadingState(prev => ({ ...prev, ...newLoading }))
  }

  const startLoading = (message?: string) => {
    setLoading({ isLoading: true, message, progress: undefined })
  }

  const stopLoading = () => {
    setLoading({ isLoading: false, message: undefined, progress: undefined })
  }

  const setProgress = (progress: number) => {
    setLoading({ progress: Math.max(0, Math.min(100, progress)) })
  }

  const value: LoadingContextType = {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    setProgress
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

// Error Provider
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setErrorState] = useState<ErrorState>({
    hasError: false
  })

  const setError = (newError: Partial<ErrorState>) => {
    setErrorState(prev => ({ ...prev, ...newError }))
  }

  const clearError = () => {
    setErrorState({ hasError: false })
  }

  const reportError = (error: Error, context?: string) => {
    console.error('Global error reported:', error, context)
    setError({ hasError: true, error, context })

    // Send to error monitoring service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // You can integrate with Sentry, LogRocket, etc.
      // Sentry.captureException(error, { tags: { context } })
    }
  }

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(new Error(event.reason), 'Unhandled Promise Rejection')
      event.preventDefault()
    }

    const handleError = (event: ErrorEvent) => {
      reportError(event.error || new Error(event.message), 'Global Error Handler')
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  const value: ErrorContextType = {
    error,
    setError,
    clearError,
    reportError
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}

// Combined App State Provider
export function AppStateProvider({ 
  children, 
  enableGlobalLoading = true,
  enableErrorBoundary = true 
}: AppStateProviderProps) {
  const content = (
    <ErrorProvider>
      <LoadingProvider>
        <AppStateContent enableGlobalLoading={enableGlobalLoading}>
          {children}
        </AppStateContent>
      </LoadingProvider>
    </ErrorProvider>
  )

  if (enableErrorBoundary) {
    return (
      <ErrorBoundary context="Application">
        {content}
      </ErrorBoundary>
    )
  }

  return content
}

// Internal component to handle global loading overlay
function AppStateContent({ 
  children, 
  enableGlobalLoading 
}: { 
  children: ReactNode
  enableGlobalLoading: boolean 
}) {
  const { loading } = useLoading()

  if (enableGlobalLoading) {
    return (
      <LoadingOverlay 
        isLoading={loading.isLoading} 
        message={loading.message}
      >
        {children}
      </LoadingOverlay>
    )
  }

  return <>{children}</>
}

// Hook for handling async operations with loading and error states
export function useAsyncOperation() {
  const { startLoading, stopLoading, setProgress } = useLoading()
  const { reportError, clearError } = useError()

  const execute = async <T,>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string
      errorContext?: string
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
    }
  ): Promise<T | null> => {
    try {
      clearError()
      startLoading(options?.loadingMessage)
      
      const result = await operation()
      
      stopLoading()
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      stopLoading()
      const err = error instanceof Error ? error : new Error(String(error))
      reportError(err, options?.errorContext)
      options?.onError?.(err)
      return null
    }
  }

  return {
    execute,
    setProgress
  }
}

// Hook for retry logic
export function useRetry() {
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const retry = async <T,>(
    operation: () => Promise<T>,
    onRetry?: (attempt: number) => void
  ): Promise<T | null> => {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setRetryCount(attempt)
          onRetry?.(attempt)
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }

        const result = await operation()
        setRetryCount(0)
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (attempt === maxRetries) {
          break
        }
      }
    }

    if (lastError) {
      throw lastError
    }
    return null
  }

  return {
    retry,
    retryCount,
    maxRetries
  }
}

export default AppStateProvider