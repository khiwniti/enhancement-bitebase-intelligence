'use client'

import { useState, useCallback } from 'react'
import { useLoading, useError } from '@/contexts/AppStateContext'

// Generic API state management
interface ApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  success: boolean
}

interface UseApiOptions {
  loadingMessage?: string
  errorContext?: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showGlobalLoading?: boolean
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  })

  const { startLoading, stopLoading } = useLoading()
  const { reportError, clearError } = useError()

  const execute = useCallback(async (
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null, 
        success: false 
      }))

      if (options.showGlobalLoading) {
        startLoading(options.loadingMessage)
      }

      clearError()

      const result = await apiCall()

      setState({
        data: result,
        loading: false,
        error: null,
        success: true
      })

      if (options.showGlobalLoading) {
        stopLoading()
      }

      options.onSuccess?.(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
        success: false
      }))

      if (options.showGlobalLoading) {
        stopLoading()
      }

      if (options.errorContext) {
        reportError(err, options.errorContext)
      }

      options.onError?.(err)
      return null
    }
  }, [startLoading, stopLoading, reportError, clearError, options])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

// Hook specifically for form submissions
interface UseFormSubmissionOptions extends UseApiOptions {
  resetOnSuccess?: boolean
  validationErrors?: Record<string, string>
}

export function useFormSubmission<T = any>(options: UseFormSubmissionOptions = {}) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const api = useApi<T>({
    ...options,
    loadingMessage: options.loadingMessage || 'Submitting...',
    errorContext: options.errorContext || 'Form Submission'
  })

  const submit = useCallback(async (
    data: any,
    submitFunction: (data: any) => Promise<T>
  ): Promise<T | null> => {
    // Clear validation errors
    setValidationErrors({})

    try {
      const result = await api.execute(() => submitFunction(data))
      
      if (result && options.resetOnSuccess) {
        api.reset()
      }
      
      return result
    } catch (error) {
      // Handle validation errors specifically
      if (error instanceof Error && error.message.includes('validation')) {
        try {
          const parsed = JSON.parse(error.message)
          if (parsed.errors) {
            setValidationErrors(parsed.errors)
          }
        } catch {
          // Not a validation error
        }
      }
      return null
    }
  }, [api, options.resetOnSuccess])

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({})
  }, [])

  return {
    ...api,
    submit,
    validationErrors,
    clearValidationErrors,
    isSubmitting: api.loading
  }
}

// Hook for data fetching with caching
interface UseFetchOptions extends UseApiOptions {
  cacheKey?: string
  cacheDuration?: number // in milliseconds
  refetchOnMount?: boolean
  dependencies?: any[]
}

const cache = new Map<string, { data: any; timestamp: number }>()

export function useFetch<T = any>(
  fetchFunction: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  const api = useApi<T>(options)
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    refetchOnMount = true,
    dependencies = []
  } = options

  // Check cache
  const getCachedData = useCallback(() => {
    if (!cacheKey) return null
    
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data
    }
    return null
  }, [cacheKey, cacheDuration])

  // Set cache
  const setCachedData = useCallback((data: T) => {
    if (cacheKey) {
      cache.set(cacheKey, { data, timestamp: Date.now() })
    }
  }, [cacheKey])

  const fetch = useCallback(async (force = false): Promise<T | null> => {
    if (!force) {
      const cached = getCachedData()
      if (cached) {
        return cached
      }
    }

    const result = await api.execute(fetchFunction)
    if (result) {
      setCachedData(result)
    }
    return result
  }, [api, fetchFunction, getCachedData, setCachedData])

  // Auto-fetch on mount or dependency change
  useState(() => {
    if (refetchOnMount) {
      fetch()
    }
  })

  // Refetch when dependencies change
  useState(() => {
    if (dependencies.length > 0) {
      fetch()
    }
  })

  const refetch = useCallback(() => fetch(true), [fetch])

  return {
    ...api,
    fetch,
    refetch,
    cached: getCachedData() !== null
  }
}

// Hook for infinite scroll/pagination
interface UsePaginationOptions extends UseApiOptions {
  pageSize?: number
  initialPage?: number
}

export function usePagination<T = any>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
  options: UsePaginationOptions = {}
) {
  const [items, setItems] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(options.initialPage || 1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState<number | undefined>()
  
  const api = useApi<{ data: T[]; hasMore: boolean; total?: number }>(options)
  const pageSize = options.pageSize || 20

  const loadPage = useCallback(async (page: number, reset = false): Promise<void> => {
    const result = await api.execute(() => fetchFunction(page, pageSize))
    
    if (result) {
      setItems(prev => reset ? result.data : [...prev, ...result.data])
      setHasMore(result.hasMore)
      setTotal(result.total)
      setCurrentPage(page)
    }
  }, [api, fetchFunction, pageSize])

  const loadNext = useCallback(() => {
    if (hasMore && !api.loading) {
      loadPage(currentPage + 1)
    }
  }, [hasMore, api.loading, currentPage, loadPage])

  const refresh = useCallback(() => {
    setItems([])
    setCurrentPage(1)
    setHasMore(true)
    loadPage(1, true)
  }, [loadPage])

  // Initial load
  useState(() => {
    loadPage(1, true)
  })

  return {
    items,
    loading: api.loading,
    error: api.error,
    hasMore,
    total,
    currentPage,
    loadNext,
    refresh,
    reset: api.reset
  }
}

export default {
  useApi,
  useFormSubmission,
  useFetch,
  usePagination
}