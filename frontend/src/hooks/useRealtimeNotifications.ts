'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Notification types
export interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  user_id: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  expires_at?: string
  action_url?: string
  action_text?: string
}

export interface NotificationUpdate {
  event_type: 'new_notification' | 'notification_read' | 'notification_deleted' | 'initial_notifications' | 'broadcast_notification'
  notification?: Notification
  notifications?: Notification[]
  notification_id?: string
  timestamp: string
}

interface UseRealtimeNotificationsOptions {
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  error: string | null
  connect: () => void
  disconnect: () => void
  markAsRead: (notificationId: string) => void
  deleteNotification: (notificationId: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  sendTestNotification: () => void
}

const WS_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://api.bitebase.ai' 
  : 'ws://localhost:8000'

export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions = {}
): UseRealtimeNotificationsReturn {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options

  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const pingTimer = useRef<NodeJS.Timeout | null>(null)

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((update: NotificationUpdate) => {
    switch (update.event_type) {
      case 'new_notification':
      case 'broadcast_notification':
        if (update.notification) {
          setNotifications(prev => [update.notification!, ...prev])
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted' && update.notification.priority !== 'low') {
            new Notification(update.notification.title, {
              body: update.notification.message,
              icon: '/favicon.ico',
              tag: update.notification.id
            })
          }
        }
        break

      case 'notification_read':
        if (update.notification_id) {
          setNotifications(prev => 
            prev.map(n => 
              n.id === update.notification_id ? { ...n, read: true } : n
            )
          )
        }
        break

      case 'notification_deleted':
        if (update.notification_id) {
          setNotifications(prev => 
            prev.filter(n => n.id !== update.notification_id)
          )
        }
        break

      case 'initial_notifications':
        if (update.notifications) {
          setNotifications(update.notifications)
        }
        break
    }
  }, [])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionStatus('connecting')
      setError(null)

      const wsUrl = `${WS_BASE_URL}/api/v1/notifications/ws/${user.id}`
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('Notifications WebSocket connected')
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
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Handle pong responses separately
          if (data.type === 'pong') {
            return
          }

          // Handle notification updates
          const update: NotificationUpdate = data
          handleRealtimeUpdate(update)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('Notifications WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')

        // Clear ping timer
        if (pingTimer.current) {
          clearInterval(pingTimer.current)
          pingTimer.current = null
        }

        // Attempt reconnection if not intentional disconnect
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          setConnectionStatus('connecting')
          
          reconnectTimer.current = setTimeout(() => {
            connect()
          }, reconnectInterval * reconnectAttempts.current)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionStatus('error')
          setError('Failed to reconnect after multiple attempts')
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('Notifications WebSocket error:', error)
        setConnectionStatus('error')
        setError('WebSocket connection error')
      }

    } catch (err) {
      console.error('Error connecting to notifications WebSocket:', err)
      setConnectionStatus('error')
      setError('Failed to connect to notifications')
    }
  }, [user?.id, reconnectInterval, maxReconnectAttempts, handleRealtimeUpdate])

  // Disconnect from WebSocket
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
      wsRef.current.close(1000, 'Intentional disconnect')
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionStatus('disconnected')
    reconnectAttempts.current = 0
  }, [])

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
        notification_id: notificationId
      }))
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'delete_notification',
        notification_id: notificationId
      }))
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    notifications.filter(n => !n.read).forEach(n => {
      markAsRead(n.id)
    })
  }, [notifications, markAsRead])

  // Clear all notifications
  const clearAll = useCallback(() => {
    notifications.forEach(n => {
      deleteNotification(n.id)
    })
  }, [notifications, deleteNotification])

  // Send test notification (for development)
  const sendTestNotification = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification from the system.',
          priority: 'medium'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send test notification')
      }
    } catch (err) {
      console.error('Error sending test notification:', err)
    }
  }, [user?.id])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
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
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAll,
    sendTestNotification
  }
}
