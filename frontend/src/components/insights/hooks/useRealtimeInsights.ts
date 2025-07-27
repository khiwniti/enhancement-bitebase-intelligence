/**
 * BiteBase Intelligence Real-time Insights Hook
 * Custom React hook for managing real-time insights with WebSocket integration
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  InsightResponse,
  InsightListResponse,
  InsightSearchParams,
  InsightFeedbackCreate,
  InsightGenerationRequest,
  RealtimeInsightUpdate,
  UseRealtimeInsightsReturn,
  APIResponse
} from '../types/insightsTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1'

export const useRealtimeInsights = (userId?: string): UseRealtimeInsightsReturn => {
  // State management
  const [insights, setInsights] = useState<InsightResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [metrics, setMetrics] = useState<any>(null)

  // Refs for WebSocket and cleanup
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

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
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request cancelled')
      }
      
      return {
        error: err.message || 'An unexpected error occurred',
        status: 500
      }
    }
  }, [])

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionStatus('connecting')
      const wsUrl = `${WS_BASE_URL}/insights/ws/${userId}`
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        setError(null)
      }

      wsRef.current.onmessage = (event) => {
        try {
          const update: RealtimeInsightUpdate = JSON.parse(event.data)
          handleRealtimeUpdate(update)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connectWebSocket()
          }, delay)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
        setError('WebSocket connection error')
      }

    } catch (err) {
      console.error('Error creating WebSocket connection:', err)
      setConnectionStatus('error')
      setError('Failed to establish WebSocket connection')
    }
  }, [userId])

  // Handle real-time updates from WebSocket
  const handleRealtimeUpdate = useCallback((update: RealtimeInsightUpdate) => {
    switch (update.event_type) {
      case 'new_insight':
        if (update.insight) {
          setInsights(prev => [update.insight!, ...prev])
        }
        break

      case 'insight_updated':
        if (update.insight) {
          setInsights(prev => 
            prev.map(insight => 
              insight.id === update.insight!.id ? update.insight! : insight
            )
          )
        }
        break

      case 'insight_deleted':
        if (update.insight_id) {
          setInsights(prev => 
            prev.filter(insight => insight.id !== update.insight_id)
          )
        }
        break

      case 'metrics_updated':
        if (update.metrics) {
          setMetrics(update.metrics)
        }
        break

      default:
        console.log('Unknown update type:', update.event_type)
    }
  }, [])

  // Fetch insights with filtering and pagination
  const fetchInsights = useCallback(async (params?: Partial<InsightSearchParams>) => {
    setIsLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      if (params?.insight_type) searchParams.append('insight_type', params.insight_type)
      if (params?.severity) searchParams.append('severity', params.severity)
      if (params?.status) searchParams.append('status', params.status)
      if (params?.restaurant_id) searchParams.append('restaurant_id', params.restaurant_id.toString())
      if (params?.min_confidence) searchParams.append('min_confidence', params.min_confidence.toString())
      if (params?.min_impact) searchParams.append('min_impact', params.min_impact.toString())
      if (params?.date_from) searchParams.append('date_from', params.date_from.toISOString())
      if (params?.date_to) searchParams.append('date_to', params.date_to.toISOString())
      if (params?.skip) searchParams.append('skip', params.skip.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.sort_by) searchParams.append('sort_by', params.sort_by)
      if (params?.sort_order) searchParams.append('sort_order', params.sort_order)

      const response = await makeRequest<InsightListResponse>(
        `/insights?${searchParams.toString()}`
      )

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        setInsights(response.data.insights)
        return response.data
      }

      return null
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch insights'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest])

  // Get a specific insight
  const getInsight = useCallback(async (insightId: string) => {
    try {
      const response = await makeRequest<InsightResponse>(`/insights/${insightId}`)

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch insight')
    }
  }, [makeRequest])

  // Update insight (acknowledge, resolve, etc.)
  const updateInsight = useCallback(async (insightId: string, updates: any) => {
    try {
      const response = await makeRequest<InsightResponse>(`/insights/${insightId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      if (response.error) {
        throw new Error(response.error)
      }

      // Update local state
      if (response.data) {
        setInsights(prev => 
          prev.map(insight => 
            insight.id === insightId ? response.data! : insight
          )
        )
      }

      return response.data
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update insight')
    }
  }, [makeRequest])

  // Submit feedback for an insight
  const submitFeedback = useCallback(async (insightId: string, feedback: InsightFeedbackCreate) => {
    try {
      const response = await makeRequest(`/insights/${insightId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedback),
      })

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err: any) {
      throw new Error(err.message || 'Failed to submit feedback')
    }
  }, [makeRequest])

  // Generate insights manually
  const generateInsights = useCallback(async (request: InsightGenerationRequest) => {
    try {
      const response = await makeRequest('/insights/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      })

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err: any) {
      throw new Error(err.message || 'Failed to generate insights')
    }
  }, [makeRequest])

  // Get insights metrics
  const getMetrics = useCallback(async (periodType = 'daily', daysBack = 7) => {
    try {
      const response = await makeRequest(`/insights/metrics/summary?period_type=${periodType}&days_back=${daysBack}`)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setMetrics(response.data)
      }

      return response.data
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch metrics')
    }
  }, [makeRequest])

  // Send WebSocket message
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  // Subscribe to restaurant insights
  const subscribeToRestaurant = useCallback((restaurantId: string) => {
    sendMessage({
      type: 'subscribe_restaurant',
      restaurant_id: restaurantId
    })
  }, [sendMessage])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  // Initialize WebSocket connection
  useEffect(() => {
    if (userId) {
      connectWebSocket()
    }

    return () => {
      disconnect()
    }
  }, [userId, connectWebSocket, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      disconnect()
    }
  }, [disconnect])

  // Ping WebSocket to keep connection alive
  useEffect(() => {
    if (!isConnected) return

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' })
    }, 30000) // Ping every 30 seconds

    return () => clearInterval(pingInterval)
  }, [isConnected, sendMessage])

  return {
    // State
    insights,
    isLoading,
    error,
    isConnected,
    connectionStatus,
    metrics,

    // Actions
    fetchInsights,
    getInsight,
    updateInsight,
    submitFeedback,
    generateInsights,
    getMetrics,
    subscribeToRestaurant,
    clearError,
    disconnect,

    // WebSocket
    sendMessage,
  }
}

export default useRealtimeInsights