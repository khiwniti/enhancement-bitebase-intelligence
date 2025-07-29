/**
 * BiteBase Intelligence Natural Language Query Hook
 * Custom React hook for managing NL query processing
 */

import { useState, useCallback, useRef } from 'react'
import type {
  NLQueryRequest,
  NLQueryResponse,
  QuerySuggestionResponse,
  QueryHistoryResponse,
  QueryFeedback,
  UseNLQueryReturn,
  APIResponse
} from '../types/nlQueryTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const useNLQuery = (): UseNLQueryReturn => {
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<NLQueryResponse | null>(null)
  const [suggestions, setSuggestions] = useState<QuerySuggestionResponse | null>(null)
  const [history, setHistory] = useState<QueryHistoryResponse | null>(null)

  // Request cancellation
  const abortControllerRef = useRef<AbortController | null>(null)

  // API request helper
  const makeRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || `HTTP error! status: ${response.status}`)
      }

      return {
        data,
        status: response.status,
        message: 'Success'
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        throw new Error('Request cancelled')
      }
      
      return {
        error: (err as Error).message || 'An unexpected error occurred',
        status: 500
      }
    }
  }, [])

  // Process natural language query
  const processQuery = useCallback(async (request: NLQueryRequest): Promise<NLQueryResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await makeRequest<NLQueryResponse>('/nl-query/process', {
        method: 'POST',
        body: JSON.stringify(request),
      })

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        setResult(response.data)
        return response.data
      }

      return null
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to process query'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest])

  // Validate query without executing
  const validateQuery = useCallback(async (request: NLQueryRequest) => {
    try {
      const response = await makeRequest('/nl-query/validate', {
        method: 'POST',
        body: JSON.stringify(request),
      })

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data as Record<string, unknown>
    } catch (err: unknown) {
      throw new Error((err as Error).message || 'Failed to validate query')
    }
  }, [makeRequest])

  // Get query suggestions
  const getSuggestions = useCallback(async (partialQuery?: string) => {
    try {
      const params = new URLSearchParams()
      if (partialQuery) {
        params.append('partial_query', partialQuery)
      }

      const response = await makeRequest<QuerySuggestionResponse>(
        `/nl-query/suggestions?${params.toString()}`
      )

      if (response.error) {
        console.warn('Failed to get suggestions:', response.error)
        return
      }

      if (response.data) {
        setSuggestions(response.data)
      }
    } catch (err: unknown) {
      console.warn('Failed to get suggestions:', (err as Error).message)
    }
  }, [makeRequest])

  // Get query history
  const getHistory = useCallback(async () => {
    try {
      const response = await makeRequest<QueryHistoryResponse>('/nl-query/history')

      if (response.error) {
        console.warn('Failed to get history:', response.error)
        return
      }

      if (response.data) {
        setHistory(response.data)
      }
    } catch (err: unknown) {
      console.warn('Failed to get history:', (err as Error).message)
    }
  }, [makeRequest])

  // Submit query feedback
  const submitFeedback = useCallback(async (feedback: QueryFeedback) => {
    try {
      const response = await makeRequest('/nl-query/feedback', {
        method: 'POST',
        body: JSON.stringify(feedback),
      })

      if (response.error) {
        throw new Error(response.error)
      }

      // Refresh history after feedback submission
      await getHistory()
    } catch (err: unknown) {
      throw new Error((err as Error).message || 'Failed to submit feedback')
    }
  }, [makeRequest, getHistory])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Clear result state
  const clearResult = useCallback(() => {
    setResult(null)
  }, [])


  return {
    processQuery,
    validateQuery,
    getSuggestions,
    getHistory,
    submitFeedback,
    isLoading,
    error,
    result,
    suggestions,
    history,
    clearError,
    clearResult,
  }
}

export default useNLQuery