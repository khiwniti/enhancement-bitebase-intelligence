/**
 * BiteBase Intelligence Real-time Analytics Hook
 * Custom React hook for managing real-time analytics with WebSocket integration
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface RealtimeMetric {
  id: string
  metric_type: string
  value: any
  restaurant_id: string
  timestamp: string
  metadata: Record<string, any>
}

interface RealtimeAnalyticsMessage {
  type: 'connection_established' | 'metrics_update' | 'current_metrics' | 'error' | 'pong'
  metrics?: RealtimeMetric[]
  restaurant_id?: string
  message?: string
  timestamp: string
}

interface UseRealtimeAnalyticsOptions {
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface UseRealtimeAnalyticsReturn {
  metrics: Record<string, RealtimeMetric[]>
  isConnected: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  error: string | null
  connect: () => void
  disconnect: () => void
  subscribeToRestaurants: (restaurantIds: string[]) => void
  unsubscribeFromRestaurants: (restaurantIds: string[]) => void
  getCurrentMetrics: (restaurantId: string) => void
  clearMetrics: () => void
}

const WS_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://api.bitebase.ai' 
  : 'ws://localhost:8000'

export function useRealtimeAnalytics(
  options: UseRealtimeAnalyticsOptions = {}
): UseRealtimeAnalyticsReturn {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options

  const { user } = useAuth()
  const [metrics, setMetrics] = useState<Record<string, RealtimeMetric[]>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const pingTimer = useRef<NodeJS.Timeout | null>(null)
  const subscribedRestaurants = useRef<Set<string>>(new Set())

  const connect = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionStatus('connecting')
      setError(null)

      const wsUrl = `${WS_BASE_URL}/api/v1/realtime-analytics/ws/${user.id}`
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('Real-time analytics WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        setError(null)

        // Start ping interval
        pingTimer.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            }))
          }
        }, 30000) // Ping every 30 seconds

        // Re-subscribe to restaurants if any
        if (subscribedRestaurants.current.size > 0 && wsRef.current) {
          const restaurantIds = Array.from(subscribedRestaurants.current)
          wsRef.current.send(JSON.stringify({
            type: 'subscribe',
            restaurant_ids: restaurantIds,
            timestamp: new Date().toISOString()
          }))
        }
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: RealtimeAnalyticsMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('Real-time analytics WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')

        // Clear ping timer
        if (pingTimer.current) {
          clearInterval(pingTimer.current)
          pingTimer.current = null
        }

        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          setConnectionStatus('connecting')
          
          reconnectTimer.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionStatus('error')
          setError('Max reconnection attempts reached')
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('Real-time analytics WebSocket error:', error)
        setConnectionStatus('error')
        setError('WebSocket connection error')
      }

    } catch (err) {
      console.error('Error creating WebSocket connection:', err)
      setConnectionStatus('error')
      setError('Failed to create WebSocket connection')
    }
  }, [user?.id, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }

    if (pingTimer.current) {
      clearInterval(pingTimer.current)
      pingTimer.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionStatus('disconnected')
    setError(null)
    reconnectAttempts.current = 0
  }, [])

  const handleMessage = useCallback((message: RealtimeAnalyticsMessage) => {
    switch (message.type) {
      case 'connection_established':
        console.log('Real-time analytics connection established')
        break

      case 'metrics_update':
        if (message.metrics) {
          setMetrics(prevMetrics => {
            const newMetrics = { ...prevMetrics }
            
            message.metrics!.forEach(metric => {
              if (!newMetrics[metric.restaurant_id]) {
                newMetrics[metric.restaurant_id] = []
              }
              
              // Update or add metric
              const existingIndex = newMetrics[metric.restaurant_id].findIndex(
                m => m.metric_type === metric.metric_type
              )
              
              if (existingIndex >= 0) {
                newMetrics[metric.restaurant_id][existingIndex] = metric
              } else {
                newMetrics[metric.restaurant_id].push(metric)
              }
            })
            
            return newMetrics
          })
        }
        break

      case 'current_metrics':
        if (message.restaurant_id && message.metrics) {
          setMetrics(prevMetrics => ({
            ...prevMetrics,
            [message.restaurant_id!]: Object.values(message.metrics!)
          }))
        }
        break

      case 'error':
        console.error('Real-time analytics error:', message.message)
        setError(message.message || 'Unknown error')
        break

      case 'pong':
        // Heartbeat response - connection is alive
        break

      default:
        console.warn('Unknown message type:', message.type)
    }
  }, [])

  const subscribeToRestaurants = useCallback((restaurantIds: string[]) => {
    restaurantIds.forEach(id => subscribedRestaurants.current.add(id))

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        restaurant_ids: restaurantIds,
        timestamp: new Date().toISOString()
      }))
    }
  }, [])

  const unsubscribeFromRestaurants = useCallback((restaurantIds: string[]) => {
    restaurantIds.forEach(id => subscribedRestaurants.current.delete(id))

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        restaurant_ids: restaurantIds,
        timestamp: new Date().toISOString()
      }))
    }

    // Remove metrics for unsubscribed restaurants
    setMetrics(prevMetrics => {
      const newMetrics = { ...prevMetrics }
      restaurantIds.forEach(id => {
        delete newMetrics[id]
      })
      return newMetrics
    })
  }, [])

  const getCurrentMetrics = useCallback((restaurantId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'get_current_metrics',
        restaurant_id: restaurantId,
        timestamp: new Date().toISOString()
      }))
    }
  }, [])

  const clearMetrics = useCallback(() => {
    setMetrics({})
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && user?.id) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, user?.id, connect, disconnect])

  return {
    metrics,
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
    subscribeToRestaurants,
    unsubscribeFromRestaurants,
    getCurrentMetrics,
    clearMetrics
  }
}
