"use client"

/**
 * BiteBase Intelligence Presence Indicators 2.0
 * Enhanced with food delivery theme and kitchen crew animations
 * Shows real-time presence of collaborative kitchen crew members
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  AnimatedButton,
  AnimatedCard,
  staggerContainer,
  dashboardWidgetVariants
} from '@/components/animations'
import { 
  ChefHat,
  Utensils,
  Pizza,
  Coffee,
  X,
  Info
} from 'lucide-react'

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
      return (
        <motion.div 
          className="w-2.5 h-2.5 bg-food-green rounded-full shadow-sm"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )
    case 'editing':
      return (
        <motion.div 
          className="w-2.5 h-2.5 bg-bitebase-primary rounded-full shadow-sm"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      )
    case 'away':
      return (
        <motion.div 
          className="w-2.5 h-2.5 bg-food-yellow rounded-full shadow-sm"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )
    case 'offline':
      return <div className="w-2.5 h-2.5 bg-gray-400 rounded-full shadow-sm" />
    default:
      return <div className="w-2.5 h-2.5 bg-gray-400 rounded-full shadow-sm" />
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
      return `🍳 Cooking ${user.active_element}`
    }
    if (user.current_action === 'commenting') {
      return '💬 Adding recipe notes'
    }
    if (user.status === 'away') {
      return '☕ Taking a break'
    }
    return '👀 Checking the kitchen'
  }

  const getActivityEmoji = () => {
    if (user.current_action === 'editing') return '🍳'
    if (user.current_action === 'commenting') return '💬'
    if (user.status === 'away') return '☕'
    return '👀'
  }

  return (
    <motion.div 
      className="relative group"
      whileHover={{ scale: 1.1, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        className={cn(
          "relative rounded-full border-2 flex items-center justify-center overflow-hidden shadow-lg",
          sizeClasses[size]
        )}
        style={{ borderColor: user.color }}
        animate={{ 
          boxShadow: user.status === 'editing' ? [
            `0 0 10px ${user.color}30`,
            `0 0 20px ${user.color}50`,
            `0 0 10px ${user.color}30`
          ] : []
        }}
        transition={{ duration: 1.5, repeat: user.status === 'editing' ? Infinity : 0 }}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <motion.div
            className="w-full h-full flex items-center justify-center text-white text-xs font-bold relative"
            style={{ backgroundColor: user.color }}
            animate={{ 
              scale: user.status === 'editing' ? [1, 1.05, 1] : [1]
            }}
            transition={{ duration: 1, repeat: user.status === 'editing' ? Infinity : 0 }}
          >
            {user.username.charAt(0).toUpperCase()}
            
            {/* Activity emoji overlay */}
            <motion.div
              className="absolute -top-1 -right-1 text-xs"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {getActivityEmoji()}
            </motion.div>
          </motion.div>
        )}

        {showStatus && (
          <motion.div 
            className={cn(
              "absolute border-2 border-white rounded-full shadow-sm",
              statusSizes[size]
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <StatusIcon status={user.status} />
          </motion.div>
        )}

        {/* Chef hat for editing users */}
        {user.current_action === 'editing' && (
          <motion.div
            className="absolute -top-2 -left-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs"
            >
              👨‍🍳
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
          initial={{ y: 10, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatedCard
            variant="default"
            className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap border border-gray-700"
          >
            <motion.div 
              className="font-medium flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              👨‍🍳 {user.username}
            </motion.div>
            <motion.div 
              className="opacity-75 mt-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {getActivityText()}
            </motion.div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </AnimatedCard>
        </motion.div>
      )}
    </motion.div>
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
    <motion.div 
      className="flex items-center -space-x-2"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {visibleParticipants.map((participant, index) => (
        <motion.div
          key={participant.user_id}
          variants={{
            hidden: { opacity: 0, scale: 0.8, x: -10 },
            visible: { opacity: 1, scale: 1, x: 0, transition: { delay: index * 0.1 } }
          }}
          whileHover={{ z: 10 }}
        >
          <UserAvatar
            user={participant}
            size="md"
            showStatus={true}
            showTooltip={true}
          />
        </motion.div>
      ))}
      
      {hiddenCount > 0 && (
        <motion.div 
          className="relative group"
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { delay: visibleParticipants.length * 0.1 } }
          }}
          whileHover={{ scale: 1.1, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="w-8 h-8 bg-gradient-to-r from-bitebase-primary/20 to-food-orange/20 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-bitebase-primary shadow-lg"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            +{hiddenCount}
          </motion.div>
          
          <motion.div 
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            <AnimatedCard
              variant="default"
              className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg py-3 px-4 shadow-xl whitespace-nowrap max-w-xs border border-gray-700"
            >
              <motion.div 
                className="font-medium mb-2 flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                👨‍🍳 {hiddenCount} more chef{hiddenCount !== 1 ? 's' : ''} in the kitchen
              </motion.div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {otherParticipants.slice(maxVisible).map((p, index) => (
                  <motion.div 
                    key={p.user_id} 
                    className="opacity-75 flex items-center gap-1 mt-1"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0, transition: { delay: 0.2 + index * 0.1 } }
                    }}
                  >
                    <span className="text-xs">
                      {p.current_action === 'editing' ? '🍳' :
                       p.current_action === 'commenting' ? '💬' :
                       p.status === 'away' ? '☕' : '👀'}
                    </span>
                    {p.username} ({p.status})
                  </motion.div>
                ))}
              </motion.div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
            </AnimatedCard>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
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
    <motion.div 
      className={cn("relative", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {showDetails || isExpanded ? (
          <motion.div 
            key="detailed"
            className="relative"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <DetailedParticipantsList
              participants={participants}
              currentUserId={currentUserId}
            />
            
            {!showDetails && (
              <motion.div
                className="absolute top-3 right-3"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AnimatedButton
                  onClick={() => setIsExpanded(false)}
                  variant="ghost"
                  size="sm"
                  animationType="scale"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </AnimatedButton>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="compact"
            className="relative"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedCard
              variant="default"
              className="flex items-center gap-3 bg-gradient-to-r from-white to-bitebase-primary/5 shadow-xl border-2 border-bitebase-primary/20 px-4 py-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChefHat className="h-4 w-4 text-bitebase-primary" />
              </motion.div>

              <CollaboratorsList
                participants={participants}
                currentUserId={currentUserId}
                maxVisible={maxVisible}
              />
              
              {otherActiveParticipants.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <AnimatedButton
                    onClick={() => setIsExpanded(true)}
                    variant="ghost"
                    size="sm"
                    animationType="bounce"
                    className="h-6 w-6 p-0 text-bitebase-primary hover:text-bitebase-primary/80 ml-2"
                    title="View kitchen crew details"
                  >
                    <Info className="w-3 h-3" />
                  </AnimatedButton>
                </motion.div>
              )}

              {/* Kitchen activity indicator */}
              <motion.div
                className="text-xs text-muted-foreground font-medium"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🍽️ Kitchen Crew
              </motion.div>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PresenceIndicators