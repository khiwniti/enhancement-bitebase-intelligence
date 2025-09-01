"use client"

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

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

interface CollaborationCursorsProps {
  participants: UserPresence[]
  currentUserId: string
  containerRef: React.RefObject<HTMLElement>
  className?: string
}

interface AnimatedCursorProps {
  user: UserPresence
  position: CursorPosition
  containerRef: React.RefObject<HTMLElement>
  isVisible: boolean
}

const CursorIcon: React.FC<{ color: string; className?: string }> = ({ color, className }) => (
  <svg
    className={cn("w-4 h-4", className)}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.5 2L3 21.5L8.5 19L14 21.5L8.5 2Z"
      fill={color}
      stroke="white"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
)

const UserCursorLabel: React.FC<{
  username: string
  color: string
  action?: string
  elementType?: string
}> = ({ username, color, action, elementType }) => {
  const getActionText = () => {
    if (action === 'editing' && elementType) {
      return `editing ${elementType}`
    }
    if (action === 'commenting') {
      return 'commenting'
    }
    return 'viewing'
  }

  return (
    <div className="ml-2 pointer-events-none">
      <div
        className="px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap shadow-lg"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-1">
          <span>{username}</span>
          {action && action !== 'viewing' && (
            <span className="opacity-75">• {getActionText()}</span>
          )}
        </div>
        {/* Arrow pointing to cursor */}
        <div
          className="absolute top-full left-2 border-4 border-transparent"
          style={{ borderTopColor: color }}
        />
      </div>
    </div>
  )
}

const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  user,
  position,
  containerRef,
  isVisible
}) => {
  const [cursorStyle, setCursorStyle] = useState<React.CSSProperties>({})
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !isVisible) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    // Convert percentage to pixel coordinates
    const x = (position.x / 100) * rect.width
    const y = (position.y / 100) * rect.height

    // Trigger animation
    setIsAnimating(true)
    
    setCursorStyle({
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(0, 0)',
      transition: 'all 0.15s ease-out',
      zIndex: 1000,
      pointerEvents: 'none'
    })

    // Reset animation flag
    const timer = setTimeout(() => setIsAnimating(false), 150)
    return () => clearTimeout(timer)
  }, [position, containerRef, isVisible])

  if (!isVisible || !position) return null

  return (
    <div
      style={cursorStyle}
      className={cn(
        "flex items-start transition-opacity duration-200",
        isAnimating && "scale-110",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <CursorIcon 
        color={user.color} 
        className={cn(
          "drop-shadow-lg transition-transform duration-150",
          isAnimating && "scale-110"
        )}
      />
      
      <UserCursorLabel
        username={user.username}
        color={user.color}
        action={user.current_action}
        elementType={position.elementType}
      />
    </div>
  )
}

const SelectionHighlight: React.FC<{
  user: UserPresence
  containerRef: React.RefObject<HTMLElement>
}> = ({ user, containerRef }) => {
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!user.active_element || !user.cursor_position || !containerRef.current) {
      setIsVisible(false)
      return
    }

    // Find the element being edited
    const targetElement = document.getElementById(user.active_element) ||
                         document.querySelector(`[data-element-id="${user.active_element}"]`)

    if (!targetElement) {
      setIsVisible(false)
      return
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const elementRect = targetElement.getBoundingClientRect()

    // Calculate relative position within container
    const left = elementRect.left - containerRect.left
    const top = elementRect.top - containerRect.top
    const width = elementRect.width
    const height = elementRect.height

    setHighlightStyle({
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: `2px solid ${user.color}`,
      backgroundColor: `${user.color}10`, // 10% opacity
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: 999,
      transition: 'all 0.2s ease-out'
    })

    setIsVisible(true)
  }, [user.active_element, user.cursor_position, user.color, containerRef])

  if (!isVisible) return null

  return (
    <div style={highlightStyle} className="animate-pulse">
      {/* Optional: Add a label showing what's being edited */}
      <div
        className="absolute -top-6 left-0 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
        style={{ backgroundColor: user.color }}
      >
        {user.username} editing
      </div>
    </div>
  )
}

export const CollaborationCursors: React.FC<CollaborationCursorsProps> = ({
  participants,
  currentUserId,
  containerRef,
  className
}) => {
  const [visibleCursors, setVisibleCursors] = useState<Set<string>>(new Set())

  // Filter out current user and offline participants
  const otherParticipants = participants.filter(
    p => p.user_id !== currentUserId && 
         p.status !== 'offline' && 
         p.cursor_position
  )

  // Manage cursor visibility with fade in/out
  useEffect(() => {
    const activeUserIds = new Set(otherParticipants.map(p => p.user_id))
    
    // Add new cursors
    activeUserIds.forEach(userId => {
      if (!visibleCursors.has(userId)) {
        setVisibleCursors(prev => new Set([...prev, userId]))
      }
    })

    // Remove old cursors with delay for smooth fade out
    visibleCursors.forEach(userId => {
      if (!activeUserIds.has(userId)) {
        setTimeout(() => {
          setVisibleCursors(prev => {
            const next = new Set(prev)
            next.delete(userId)
            return next
          })
        }, 200) // Delay to allow fade out animation
      }
    })
  }, [otherParticipants, visibleCursors])

  if (!containerRef.current || otherParticipants.length === 0) {
    return null
  }

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Render cursors */}
      {otherParticipants.map((participant) => (
        <AnimatedCursor
          key={`cursor-${participant.user_id}`}
          user={participant}
          position={participant.cursor_position!}
          containerRef={containerRef}
          isVisible={visibleCursors.has(participant.user_id)}
        />
      ))}

      {/* Render selection highlights */}
      {otherParticipants
        .filter(p => p.current_action === 'editing' && p.active_element)
        .map((participant) => (
          <SelectionHighlight
            key={`selection-${participant.user_id}`}
            user={participant}
            containerRef={containerRef}
          />
        ))}

      {/* Render any special collaborative indicators */}
      {otherParticipants
        .filter(p => p.current_action === 'commenting')
        .map((participant) => (
          <div
            key={`comment-indicator-${participant.user_id}`}
            className="absolute pointer-events-none"
            style={{
              left: `${participant.cursor_position!.x}%`,
              top: `${participant.cursor_position!.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1001
            }}
          >
            <div
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: participant.color }}
            />
            <div
              className="w-3 h-3 rounded-full absolute inset-0"
              style={{ backgroundColor: participant.color }}
            />
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
              <div
                className="px-2 py-1 text-xs text-white rounded whitespace-nowrap"
                style={{ backgroundColor: participant.color }}
              >
                💬 {participant.username}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

export default CollaborationCursors