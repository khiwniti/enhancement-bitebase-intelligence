"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface UserPresence {
  user_id: string
  username: string
  avatar_url?: string
  status: 'online' | 'away' | 'offline' | 'editing'
  cursor_position?: {
    x: number
    y: number
    elementId?: string
    elementType?: string
  }
  current_action?: string
  active_element?: string
  color: string
}

interface PresenceIndicatorsProps {
  participants: UserPresence[]
  currentUserId: string
  maxVisible?: number
  showDetails?: boolean
  className?: string
}

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'online':
      return <div className="w-2 h-2 bg-green-500 rounded-full" />
    case 'editing':
      return (
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      )
    case 'away':
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
    case 'offline':
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    default:
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />
  }
}

const UserAvatar: React.FC<{
  user: UserPresence
  size?: 'sm' | 'md' | 'lg'
  showStatus?: boolean
  showTooltip?: boolean
}> = ({ user, size = 'md', showStatus = true, showTooltip = true }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const statusSizes = {
    sm: 'w-1.5 h-1.5 -bottom-0.5 -right-0.5',
    md: 'w-2 h-2 -bottom-0.5 -right-0.5',
    lg: 'w-2.5 h-2.5 -bottom-1 -right-1'
  }

  const getActivityText = () => {
    if (user.current_action === 'editing' && user.active_element) {
      return `Editing ${user.active_element}`
    }
    if (user.current_action === 'commenting') {
      return 'Adding comment'
    }
    if (user.status === 'away') {
      return 'Away'
    }
    return 'Viewing dashboard'
  }

  return (
    <div className="relative group">
      <div
        className={cn(
          "relative rounded-full border-2 flex items-center justify-center overflow-hidden",
          sizeClasses[size]
        )}
        style={{ borderColor: user.color }}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: user.color }}
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}

        {showStatus && (
          <div className={cn(
            "absolute border border-white rounded-full",
            statusSizes[size]
          )}>
            <StatusIcon status={user.status} />
          </div>
        )}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            <div className="font-medium">{user.username}</div>
            <div className="opacity-75">{getActivityText()}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}

const CollaboratorsList: React.FC<{
  participants: UserPresence[]
  currentUserId: string
  maxVisible: number
}> = ({ participants, currentUserId, maxVisible }) => {
  const otherParticipants = participants.filter(p => p.user_id !== currentUserId && p.status !== 'offline')
  const visibleParticipants = otherParticipants.slice(0, maxVisible)
  const hiddenCount = Math.max(0, otherParticipants.length - maxVisible)

  return (
    <div className="flex items-center -space-x-2">
      {visibleParticipants.map((participant) => (
        <UserAvatar
          key={participant.user_id}
          user={participant}
          size="md"
          showStatus={true}
          showTooltip={true}
        />
      ))}
      
      {hiddenCount > 0 && (
        <div className="relative group">
          <div className="w-8 h-8 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
            +{hiddenCount}
          </div>
          
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap max-w-xs">
              <div className="font-medium mb-1">{hiddenCount} more collaborator{hiddenCount !== 1 ? 's' : ''}</div>
              {otherParticipants.slice(maxVisible).map((p) => (
                <div key={p.user_id} className="opacity-75">
                  {p.username} ({p.status})
                </div>
              ))}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DetailedParticipantsList: React.FC<{
  participants: UserPresence[]
  currentUserId: string
}> = ({ participants, currentUserId }) => {
  const otherParticipants = participants.filter(p => p.user_id !== currentUserId)
  const currentUser = participants.find(p => p.user_id === currentUserId)

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4 max-w-xs">
      <h3 className="font-medium text-gray-900 mb-3">
        Active Collaborators ({otherParticipants.filter(p => p.status !== 'offline').length})
      </h3>
      
      <div className="space-y-3">
        {/* Current User */}
        {currentUser && (
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <UserAvatar user={currentUser} size="sm" showTooltip={false} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.username}
                </span>
                <span className="text-xs text-gray-500">(you)</span>
              </div>
              <div className="text-xs text-gray-500">
                {currentUser.current_action === 'editing' && currentUser.active_element
                  ? `Editing ${currentUser.active_element}`
                  : 'Viewing dashboard'
                }
              </div>
            </div>
          </div>
        )}

        {/* Other Participants */}
        {otherParticipants.map((participant) => (
          <div key={participant.user_id} className="flex items-center gap-3">
            <UserAvatar user={participant} size="sm" showTooltip={false} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {participant.username}
                </span>
                <div className="flex items-center gap-1">
                  <StatusIcon status={participant.status} />
                  <span className="text-xs text-gray-500 capitalize">
                    {participant.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {participant.current_action === 'editing' && participant.active_element
                  ? `Editing ${participant.active_element}`
                  : participant.current_action === 'commenting'
                  ? 'Adding comment'
                  : participant.status === 'away'
                  ? 'Away'
                  : 'Viewing dashboard'
                }
              </div>
            </div>
          </div>
        ))}

        {otherParticipants.filter(p => p.status !== 'offline').length === 0 && (
          <div className="text-sm text-gray-500 text-center py-2">
            No other collaborators online
          </div>
        )}
      </div>
    </div>
  )
}

export const PresenceIndicators: React.FC<PresenceIndicatorsProps> = ({
  participants,
  currentUserId,
  maxVisible = 5,
  showDetails = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const activeParticipants = participants.filter(p => p.status !== 'offline')
  const otherActiveParticipants = activeParticipants.filter(p => p.user_id !== currentUserId)

  if (activeParticipants.length === 0) {
    return null
  }

  return (
    <div className={cn("relative", className)}>
      {showDetails || isExpanded ? (
        <div className="relative">
          <DetailedParticipantsList
            participants={participants}
            currentUserId={currentUserId}
          />
          
          {!showDetails && (
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg border px-3 py-2">
            <CollaboratorsList
              participants={participants}
              currentUserId={currentUserId}
              maxVisible={maxVisible}
            />
            
            {otherActiveParticipants.length > 0 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors ml-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PresenceIndicators