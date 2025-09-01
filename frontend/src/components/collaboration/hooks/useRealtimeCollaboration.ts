"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface CursorPosition {
  x: number
  y: number
  elementId?: string
  elementType?: string
  selection?: any
}

interface UserPresence {
  user_id: string
  username: string
  avatar_url?: string
  status: 'online' | 'away' | 'offline' | 'editing'
  cursor_position?: CursorPosition
  current_action?: string
  active_element?: string
  color: string
}

interface Operation {
  id: string
  type: string
  dashboard_id: string
  user_id: string
  timestamp: string
  path: string[]
  data: any
  version: number
  dependencies: string[]
}

interface Comment {
  id: string
  elementId: string
  text: string
  position: { x: number; y: number }
  userId: string
  username: string
  timestamp: string
  resolved?: boolean
}

interface SessionState {
  dashboard_id: string
  participants: string[]
  version: number
  state: any
  pending_operations: number
}

interface UseRealtimeCollaborationProps {
  dashboardId: string
  userId: string
  username: string
  avatarUrl?: string
  onOperationApplied?: (operation: Operation) => void
  onStateChanged?: (state: any) => void
}

interface WebSocketMessage {
  type: string
  data: any
}

export const useRealtimeCollaboration = ({
  dashboardId,
  userId,
  username,
  avatarUrl,
  onOperationApplied,
  onStateChanged
}: UseRealtimeCollaborationProps) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  // Collaboration state
  const [participants, setParticipants] = useState<UserPresence[]>([])
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [currentOperation, setCurrentOperation] = useState<Operation | null>(null)
  const [operationHistory, setOperationHistory] = useState<Operation[]>([])
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  
  // WebSocket reference
  const websocket = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const pingTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Constants
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 1000
  const PING_INTERVAL = 30000

  // WebSocket connection management
  const connect = useCallback(() => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      const wsUrl = `${protocol}//${host}/api/v1/collaboration/ws/${dashboardId}/${userId}?username=${encodeURIComponent(username)}&avatar_url=${encodeURIComponent(avatarUrl || '')}`
      
      websocket.current = new WebSocket(wsUrl)

      websocket.current.onopen = () => {
        console.log('WebSocket connected for collaboration')
        setIsConnected(true)
        setConnectionError(null)
        setReconnectAttempts(0)
        
        // Start ping interval
        pingTimer.current = setInterval(() => {
          if (websocket.current?.readyState === WebSocket.OPEN) {
            websocket.current.send(JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            }))
          }
        }, PING_INTERVAL)
      }

      websocket.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleWebSocketMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      websocket.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        
        if (pingTimer.current) {
          clearInterval(pingTimer.current)
          pingTimer.current = null
        }

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts)
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`)
          
          reconnectTimer.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, delay)
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionError('Unable to establish connection after multiple attempts')
        }
      }

      websocket.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionError('Connection error occurred')
      }

    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      setConnectionError('Failed to create connection')
    }
  }, [dashboardId, userId, username, avatarUrl, reconnectAttempts])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'session_joined':
        setSessionState(message.data.session)
        if (message.data.presence?.other_participants) {
          setParticipants(message.data.presence.other_participants.map((p: any) => ({
            ...p,
            status: (['online', 'away', 'offline', 'editing'].includes(p.status) ? p.status : 'online') as 'online' | 'away' | 'offline' | 'editing'
          })))
        }
        if (message.data.dashboard_state && onStateChanged) {
          onStateChanged(message.data.dashboard_state)
        }
        break

      case 'user_joined':
        setParticipants(prev => {
          const existing = prev.find(p => p.user_id === message.data.user_id)
          if (existing) {
            return prev.map(p => 
              p.user_id === message.data.user_id 
                ? { 
                    ...p, 
                    ...message.data.presence,
                    status: (['online', 'away', 'offline', 'editing'].includes(message.data.presence.status) ? message.data.presence.status : 'online') as 'online' | 'away' | 'offline' | 'editing'
                  }
                : p
            )
          }
          return [...prev, {
            ...message.data.presence,
            status: (['online', 'away', 'offline', 'editing'].includes(message.data.presence.status) ? message.data.presence.status : 'online') as 'online' | 'away' | 'offline' | 'editing'
          }]
        })
        break

      case 'user_left':
        setParticipants((message.data.remaining_participants || []).map((p: any) => ({
          ...p,
          status: (['online', 'away', 'offline', 'editing'].includes(p.status) ? p.status : 'online') as 'online' | 'away' | 'offline' | 'editing'
        })))
        break

      case 'operation_applied':
        const operation = message.data.operation as Operation
        setOperationHistory(prev => [...prev, operation])
        setSessionState(prev => prev ? { ...prev, version: message.data.version } : null)
        
        if (onOperationApplied) {
          onOperationApplied(operation)
        }
        break

      case 'operation_processed':
        setCurrentOperation(null)
        setSessionState(prev => prev ? { ...prev, version: message.data.new_version } : null)
        break

      case 'cursor_moved':
        setParticipants(prev => prev.map(p => 
          p.user_id === message.data.user_id
            ? { ...p, cursor_position: message.data.cursor_position }
            : p
        ))
        break

      case 'activity_updated':
        setParticipants(prev => prev.map(p => 
          p.user_id === message.data.user_id
            ? { 
                ...p, 
                current_action: message.data.action,
                active_element: message.data.element_id
              }
            : p
        ))
        break

      case 'sync_response':
        if (message.data.status === 'sync_required') {
          setSessionState(prev => prev ? { ...prev, version: message.data.current_version } : null)
          
          // Apply missing operations
          message.data.operations?.forEach((op: Operation) => {
            setOperationHistory(prev => [...prev, op])
            if (onOperationApplied) {
              onOperationApplied(op)
            }
          })

          if (message.data.dashboard_state && onStateChanged) {
            onStateChanged(message.data.dashboard_state)
          }
        }
        break

      case 'comment_added':
        setComments(prev => [...prev, message.data.comment])
        break

      case 'pong':
        // Heartbeat response - connection is alive
        break

      case 'error':
        console.error('Collaboration error:', message.data)
        setConnectionError(message.data?.message || 'Unknown error occurred')
        break

      default:
        console.warn('Unknown message type:', message.type)
    }
  }, [onOperationApplied, onStateChanged])

  // Send WebSocket message
  const sendMessage = useCallback((message: any) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  // Submit operation
  const submitOperation = useCallback(async (operationData: any) => {
    setCurrentOperation({
      id: `temp-${Date.now()}`,
      type: operationData.operation_type,
      dashboard_id: dashboardId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      path: operationData.path || [],
      data: operationData.operation_data || {},
      version: operationData.version || 0,
      dependencies: operationData.dependencies || []
    })

    const success = sendMessage({
      type: 'operation',
      data: operationData
    })

    if (!success) {
      setCurrentOperation(null)
      throw new Error('Failed to send operation - not connected')
    }
  }, [dashboardId, userId, sendMessage])

  // Update cursor position
  const updateCursorPosition = useCallback((position: CursorPosition) => {
    sendMessage({
      type: 'cursor_move',
      data: position
    })
  }, [sendMessage])

  // Update user activity
  const updateActivity = useCallback((action: string, elementId?: string) => {
    sendMessage({
      type: 'activity_update',
      data: {
        action,
        element_id: elementId
      }
    })
  }, [sendMessage])

  // Sync state
  const syncState = useCallback(() => {
    sendMessage({
      type: 'sync_request',
      data: {
        from_version: sessionState?.version || 0
      }
    })
  }, [sendMessage, sessionState])

  // Add comment
  const addComment = useCallback(async (commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    const comment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      timestamp: new Date().toISOString()
    }

    // Optimistically add comment
    setComments(prev => [...prev, comment])

    // Send to server
    sendMessage({
      type: 'add_comment',
      data: comment
    })
  }, [sendMessage])

  // Initialize connection
  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }
      if (pingTimer.current) {
        clearInterval(pingTimer.current)
      }
      if (websocket.current) {
        websocket.current.close(1000, 'Component unmounting')
      }
    }
  }, [connect])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (websocket.current?.readyState === WebSocket.OPEN) {
        websocket.current.close(1000, 'Component unmounting')
      }
    }
  }, [])

  return {
    // Connection state
    isConnected,
    connectionError,
    reconnectAttempts,

    // Collaboration state
    participants,
    sessionState,
    currentOperation,
    operationHistory,

    // Comments
    comments,

    // Actions
    submitOperation,
    updateCursorPosition,
    updateActivity,
    syncState,
    addComment,

    // Connection management
    connect,
    disconnect: () => {
      if (websocket.current) {
        websocket.current.close(1000, 'Manual disconnect')
      }
    }
  }
}