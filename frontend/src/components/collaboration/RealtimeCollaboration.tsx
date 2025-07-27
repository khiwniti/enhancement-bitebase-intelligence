"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimeCollaboration } from './hooks/useRealtimeCollaboration'
import { PresenceIndicators } from './PresenceIndicators'
import { CollaborationCursors } from './CollaborationCursors'
import { CommentSystem } from './CommentSystem'
import { VersionHistory } from './VersionHistory'
import { cn } from '@/lib/utils'

interface RealtimeCollaborationProps {
  dashboardId: string
  userId: string
  username: string
  avatarUrl?: string
  onOperationApplied?: (operation: any) => void
  onStateChanged?: (state: any) => void
  className?: string
  children: React.ReactNode
}

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
  status: string
  cursor_position?: CursorPosition
  current_action?: string
  active_element?: string
  color: string
}

export const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  dashboardId,
  userId,
  username,
  avatarUrl,
  onOperationApplied,
  onStateChanged,
  className,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isCollaborationEnabled, setIsCollaborationEnabled] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  
  const {
    isConnected,
    participants,
    currentOperation,
    sessionState,
    connectionError,
    submitOperation,
    updateCursorPosition,
    updateActivity,
    syncState,
    comments,
    addComment,
    operationHistory
  } = useRealtimeCollaboration({
    dashboardId,
    userId,
    username,
    avatarUrl,
    onOperationApplied,
    onStateChanged
  })

  // Handle mouse movement for cursor tracking
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isConnected || !isCollaborationEnabled) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // Get element under cursor
    const elementUnderCursor = event.target as HTMLElement
    const elementId = elementUnderCursor?.id || elementUnderCursor?.dataset?.elementId
    const elementType = elementUnderCursor?.dataset?.elementType || 
                       elementUnderCursor?.tagName?.toLowerCase()

    updateCursorPosition({
      x,
      y,
      elementId,
      elementType
    })
  }, [isConnected, isCollaborationEnabled, updateCursorPosition])

  // Handle element selection
  const handleElementClick = useCallback((event: MouseEvent) => {
    if (!isConnected || !isCollaborationEnabled) return

    const element = event.target as HTMLElement
    const elementId = element?.id || element?.dataset?.elementId

    if (elementId) {
      setSelectedElement(elementId)
      updateActivity('editing', elementId)
    }
  }, [isConnected, isCollaborationEnabled, updateActivity])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isConnected) return

    // Ctrl/Cmd + / to toggle comments
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault()
      setShowComments(!showComments)
    }

    // Ctrl/Cmd + H to toggle version history
    if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
      event.preventDefault()
      setShowVersionHistory(!showVersionHistory)
    }

    // Escape to deselect element
    if (event.key === 'Escape') {
      setSelectedElement(null)
      updateActivity('viewing')
    }
  }, [isConnected, showComments, showVersionHistory, updateActivity])

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Add event listeners
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('click', handleElementClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('click', handleElementClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleMouseMove, handleElementClick, handleKeyDown])

  // Handle operation submission
  const handleSubmitOperation = useCallback(async (operationType: string, path: string[], data: any) => {
    if (!isConnected) return

    try {
      await submitOperation({
        operation_type: operationType,
        path,
        operation_data: data,
        version: sessionState?.version || 0
      })
    } catch (error) {
      console.error('Failed to submit operation:', error)
    }
  }, [isConnected, submitOperation, sessionState])

  // Handle adding comments
  const handleAddComment = useCallback(async (elementId: string, text: string, position?: { x: number, y: number }) => {
    try {
      await addComment({
        elementId,
        text,
        position: position || { x: 0, y: 0 },
        userId,
        username
      })
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }, [addComment, userId, username])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full",
        "collaboration-container",
        className
      )}
      data-collaboration-enabled={isCollaborationEnabled}
    >
      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-50">
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-sm",
          isConnected 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-red-100 text-red-800 border border-red-200"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          {isConnected ? 'Connected' : 'Disconnected'}
          {connectionError && (
            <span className="text-xs opacity-75">({connectionError})</span>
          )}
        </div>
      </div>

      {/* Collaboration Controls */}
      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-center gap-2">
          {/* Toggle Collaboration */}
          <button
            onClick={() => setIsCollaborationEnabled(!isCollaborationEnabled)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isCollaborationEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            )}
          >
            {isCollaborationEnabled ? 'Collaboration On' : 'Collaboration Off'}
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              showComments
                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            )}
          >
            Comments ({comments.length})
          </button>

          {/* Version History Toggle */}
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              showVersionHistory
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            )}
          >
            History
          </button>

          {/* Sync State */}
          <button
            onClick={syncState}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
          >
            Sync
          </button>
        </div>
      </div>

      {/* Presence Indicators */}
      {isConnected && isCollaborationEnabled && (
        <PresenceIndicators
          participants={participants}
          currentUserId={userId}
          className="absolute bottom-4 left-4 z-40"
        />
      )}

      {/* Collaboration Cursors */}
      {isConnected && isCollaborationEnabled && (
        <CollaborationCursors
          participants={participants}
          currentUserId={userId}
          containerRef={containerRef}
        />
      )}

      {/* Main Content */}
      <div className="relative w-full h-full">
        {children}
      </div>

      {/* Selected Element Indicator */}
      {selectedElement && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <div 
            className="absolute border-2 border-blue-500 bg-blue-500/10 rounded"
            style={{
              // Position based on selected element
              // This would need to be calculated based on actual element position
            }}
          />
        </div>
      )}

      {/* Comment System Overlay */}
      {showComments && (
        <CommentSystem
          comments={comments}
          onAddComment={handleAddComment}
          onClose={() => setShowComments(false)}
          dashboardId={dashboardId}
          userId={userId}
          username={username}
          className="absolute inset-y-0 right-0 w-80 z-50"
        />
      )}

      {/* Version History Sidebar */}
      {showVersionHistory && (
        <VersionHistory
          operations={operationHistory}
          currentVersion={sessionState?.version || 0}
          onClose={() => setShowVersionHistory(false)}
          onRestoreVersion={(version) => {
            // Handle version restoration
            console.log('Restore to version:', version)
          }}
          className="absolute inset-y-0 left-0 w-80 z-50"
        />
      )}

      {/* Current Operation Indicator */}
      {currentOperation && (
        <div className="absolute bottom-4 right-4 z-40">
          <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg shadow-lg text-sm">
            Processing: {currentOperation.type}
          </div>
        </div>
      )}

      {/* Collaboration Status Toast */}
      {!isConnected && (
        <div className="absolute bottom-4 center-4 z-50">
          <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg shadow-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
              <span>Reconnecting to collaboration session...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RealtimeCollaboration