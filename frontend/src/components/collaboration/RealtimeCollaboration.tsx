"use client"

/**
 * BiteBase Intelligence Real-time Collaboration Component 2.0
 * Enhanced with food delivery theme and advanced animations
 * Provides real-time presence tracking, cursors, and comments for collaborative editing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeCollaboration } from './hooks/useRealtimeCollaboration'
import { PresenceIndicators } from './PresenceIndicators'
import { CollaborationCursors } from './CollaborationCursors'
import { CommentSystem } from './CommentSystem'
import { VersionHistory } from './VersionHistory'
import { cn } from '@/lib/utils'
import {
  AnimatedButton,
  AnimatedCard,
  FloatingFoodIcons,
  staggerContainer,
  dashboardWidgetVariants
} from '@/components/animations'
import { 
  Users, 
  MessageCircle, 
  History, 
  Sync, 
  Wifi, 
  WifiOff,
  ChefHat,
  Utensils,
  Pizza,
  Truck
} from 'lucide-react'

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
    <motion.div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full",
        "collaboration-container",
        className
      )}
      data-collaboration-enabled={isCollaborationEnabled}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating food background for collaboration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingFoodIcons className="opacity-3" />
      </div>

      {/* Enhanced Connection Status */}
      <motion.div 
        className="absolute top-4 right-4 z-50"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatedCard
          variant="collaboration"
          className={cn(
            "flex items-center gap-3 px-4 py-3 shadow-xl text-sm font-medium border-2",
            isConnected 
              ? "bg-gradient-to-r from-food-green/10 to-green-100 text-food-green border-food-green/30" 
              : "bg-gradient-to-r from-food-red/10 to-red-100 text-food-red border-food-red/30"
          )}
        >
          <motion.div
            animate={{ 
              scale: isConnected ? [1, 1.2, 1] : [1],
              rotate: isConnected ? [0, 360] : [0]
            }}
            transition={{ 
              duration: isConnected ? 2 : 0,
              repeat: isConnected ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {isConnected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
          </motion.div>
          
          <div className="flex items-center gap-2">
            <motion.div 
              className={cn(
                "w-3 h-3 rounded-full shadow-sm",
                isConnected ? "bg-food-green" : "bg-food-red"
              )}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <span className="flex items-center gap-1">
              {isConnected ? '🍽️ Kitchen Connected' : '🚫 Kitchen Offline'}
            </span>
          </div>
          
          {connectionError && (
            <motion.span 
              className="text-xs opacity-75 ml-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ({connectionError})
            </motion.span>
          )}
        </AnimatedCard>
      </motion.div>

      {/* Enhanced Collaboration Controls */}
      <motion.div 
        className="absolute top-4 left-4 z-50"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className="flex items-center gap-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Enhanced Toggle Collaboration */}
          <motion.div variants={dashboardWidgetVariants}>
            <AnimatedButton
              onClick={() => setIsCollaborationEnabled(!isCollaborationEnabled)}
              variant={isCollaborationEnabled ? "delivery" : "secondary"}
              size="sm"
              animationType="bounce"
              leftIcon={<Users className="h-4 w-4" />}
              className={cn(
                "font-medium shadow-lg",
                isCollaborationEnabled
                  ? "bg-gradient-to-r from-bitebase-primary to-food-orange text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gray-300"
              )}
            >
              {isCollaborationEnabled ? '👥 Kitchen Crew ON' : '🚫 Solo Chef'}
            </AnimatedButton>
          </motion.div>

          {/* Enhanced Comments Toggle */}
          <motion.div variants={dashboardWidgetVariants}>
            <AnimatedButton
              onClick={() => setShowComments(!showComments)}
              variant={showComments ? "secondary" : "ghost"}
              size="sm"
              animationType="food"
              leftIcon={<MessageCircle className="h-4 w-4" />}
              className={cn(
                "font-medium shadow-lg relative",
                showComments
                  ? "bg-gradient-to-r from-food-yellow/20 to-yellow-100 text-food-yellow border-food-yellow/40"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gray-300"
              )}
            >
              💬 Recipe Notes
              {comments.length > 0 && (
                <motion.span 
                  className="absolute -top-2 -right-2 bg-food-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {comments.length}
                </motion.span>
              )}
            </AnimatedButton>
          </motion.div>

          {/* Enhanced Version History Toggle */}
          <motion.div variants={dashboardWidgetVariants}>
            <AnimatedButton
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              variant={showVersionHistory ? "secondary" : "ghost"}
              size="sm"
              animationType="scale"
              leftIcon={<History className="h-4 w-4" />}
              className={cn(
                "font-medium shadow-lg",
                showVersionHistory
                  ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gray-300"
              )}
            >
              📚 Recipe History
            </AnimatedButton>
          </motion.div>

          {/* Enhanced Sync State */}
          <motion.div variants={dashboardWidgetVariants}>
            <AnimatedButton
              onClick={syncState}
              variant="ghost"
              size="sm"
              animationType="delivery"
              leftIcon={<Sync className="h-4 w-4" />}
              className="font-medium shadow-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:bg-gray-300"
            >
              🔄 Sync Kitchen
            </AnimatedButton>
          </motion.div>

          {/* Participant count indicator */}
          {participants.length > 1 && (
            <motion.div 
              className="flex items-center gap-2 bg-bitebase-primary/10 px-3 py-2 rounded-lg border border-bitebase-primary/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChefHat className="h-4 w-4 text-bitebase-primary" />
              </motion.div>
              <span className="text-sm font-medium text-bitebase-primary">
                {participants.filter(p => p.status !== 'offline').length} 👨‍🍳 Chefs
              </span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

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

      {/* Enhanced Current Operation Indicator */}
      <AnimatePresence>
        {currentOperation && (
          <motion.div 
            className="absolute bottom-4 right-4 z-40"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedCard 
              variant="operation"
              className="bg-gradient-to-r from-bitebase-primary/10 to-blue-100 text-bitebase-primary px-4 py-3 shadow-xl border border-bitebase-primary/30"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Pizza className="h-4 w-4" />
                </motion.div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">🍳 Kitchen Processing:</span>
                  <motion.span 
                    className="capitalize"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {currentOperation.type}
                  </motion.span>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Collaboration Status Toast */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedCard 
              variant="status"
              className="bg-gradient-to-r from-food-yellow/10 to-yellow-100 text-food-yellow px-6 py-4 shadow-xl border border-food-yellow/30"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Truck className="h-5 w-5" />
                </motion.div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🔄
                  </motion.div>
                  <span className="font-medium">Reconnecting to kitchen crew...</span>
                </div>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex space-x-1"
                >
                  <div className="w-1 h-1 bg-food-yellow rounded-full"></div>
                  <div className="w-1 h-1 bg-food-yellow rounded-full"></div>
                  <div className="w-1 h-1 bg-food-yellow rounded-full"></div>
                </motion.div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating kitchen decorations */}
      <motion.div 
        className="fixed bottom-6 right-20 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-2xl"
        >
          👨‍🍳
        </motion.div>
      </motion.div>
    </div>
  )
}

export default RealtimeCollaboration