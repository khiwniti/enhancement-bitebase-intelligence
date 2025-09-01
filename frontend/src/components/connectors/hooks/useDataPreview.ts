/**
 * BiteBase Intelligence Data Preview Hook
 * Custom React hook for managing data preview and sampling
 */

import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  PreviewResult,
  QueryResult,
  QueryRequest,
  PreviewRequest,
  UseQueryReturn
} from '../types/connectorTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface APIError extends Error {
  status?: number
  statusText?: string
}

class PreviewAPIError extends Error implements APIError {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'PreviewAPIError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new PreviewAPIError(
      errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText
    )
  }
  
  return response.json()
}

// API client for data preview operations
const previewAPI = {
  // Preview data from a table
  previewData: async (request: PreviewRequest): Promise<PreviewResult> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return handleResponse<PreviewResult>(response)
  },

  // Execute a custom query
  executeQuery: async (request: QueryRequest): Promise<QueryResult> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return handleResponse<QueryResult>(response)
  }
}

export function useDataPreview(): UseQueryReturn {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Execute query mutation
  const executeQueryMutation = useMutation({
    mutationFn: (request: QueryRequest) => previewAPI.executeQuery(request),
    onMutate: () => {
      setLoading(true)
      setError(undefined)
    },
    onSuccess: () => {
      setLoading(false)
      setError(undefined)
    },
    onError: (error: PreviewAPIError) => {
      setLoading(false)
      setError(error.message)
    }
  })

  // Preview data mutation
  const previewDataMutation = useMutation({
    mutationFn: (request: PreviewRequest) => previewAPI.previewData(request),
    onMutate: () => {
      setLoading(true)
      setError(undefined)
    },
    onSuccess: () => {
      setLoading(false)
      setError(undefined)
    },
    onError: (error: PreviewAPIError) => {
      setLoading(false)
      setError(error.message)
    }
  })

  // Execute a query
  const executeQuery = useCallback(async (request: QueryRequest): Promise<QueryResult> => {
    try {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      setError(undefined)
      const result = await executeQueryMutation.mutateAsync(request)
      
      // Cache the result for potential reuse
      queryClient.setQueryData(
        ['query-result', request.connector_id, request.query], 
        result
      )
      
      return result
    } catch (error) {
      if (error instanceof PreviewAPIError) {
        setError(error.message)
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute query'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [executeQueryMutation, queryClient])

  // Preview data from a table
  const previewData = useCallback(async (request: PreviewRequest): Promise<PreviewResult> => {
    try {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      setError(undefined)
      const result = await previewDataMutation.mutateAsync(request)
      
      // Cache the result for potential reuse
      queryClient.setQueryData(
        ['preview-result', request.connector_id, request.table_name], 
        result
      )
      
      return result
    } catch (error) {
      if (error instanceof PreviewAPIError) {
        setError(error.message)
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to preview data'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [previewDataMutation, queryClient])

  // Clear error
  const clearError = useCallback(() => {
    setError(undefined)
  }, [])

  // Cancel current operation
  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Reset mutations
    executeQueryMutation.reset()
    previewDataMutation.reset()
    
    setLoading(false)
    setError(undefined)
  }, [executeQueryMutation, previewDataMutation])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Determine loading state
  const isLoading = loading || 
    executeQueryMutation.isPending || 
    previewDataMutation.isPending

  return {
    // Actions
    executeQuery,
    previewData,

    // State
    loading: isLoading,
    error
  }
}

export default useDataPreview