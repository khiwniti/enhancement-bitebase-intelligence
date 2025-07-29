'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Settings, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  MoreVertical
} from 'lucide-react'
import { useRealtimeNotifications, Notification } from '@/hooks/useRealtimeNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NotificationCenterProps {
  className?: string
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-600 border-gray-200',
  medium: 'bg-blue-100 text-blue-600 border-blue-200',
  high: 'bg-orange-100 text-orange-600 border-orange-200',
  urgent: 'bg-red-100 text-red-600 border-red-200'
}

const priorityIcons = {
  low: Info,
  medium: AlertCircle,
  high: AlertTriangle,
  urgent: AlertCircle
}

const typeIcons = {
  system: Settings,
  dashboard_shared: CheckCircle,
  report_ready: CheckCircle,
  ai_insight: AlertCircle,
  data_source_connected: CheckCircle,
  data_source_error: AlertTriangle,
  user_mention: AlertCircle,
  collaboration_invite: CheckCircle,
  export_complete: CheckCircle,
  alert_triggered: AlertTriangle,
  maintenance: Settings
}

function NotificationItem({ 
  notification, 
  onMarkRead, 
  onDelete 
}: { 
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const PriorityIcon = priorityIcons[notification.priority as keyof typeof priorityIcons] || Info
  const TypeIcon = typeIcons[notification.type as keyof typeof typeIcons] || Info
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50/50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${priorityColors[notification.priority as keyof typeof priorityColors]}`}>
          <TypeIcon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {notification.message}
              </p>
              
              {/* Action button */}
              {notification.action_url && notification.action_text && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => window.open(notification.action_url, '_blank')}
                >
                  {notification.action_text}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.read && (
                    <DropdownMenuItem onClick={() => onMarkRead(notification.id)}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete(notification.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {notification.type.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-gray-400">
              {formatTime(notification.created_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  const {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAll,
    sendTestNotification
  } = useRealtimeNotifications()

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <div className={className}>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Connection Status Indicator */}
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'connecting' ? 'bg-yellow-500' :
          connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
        }`} />
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="text-xs"
                  >
                    All ({notifications.length})
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                    className="text-xs"
                  >
                    Unread ({unreadCount})
                  </Button>
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs text-red-600"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear all
                    </Button>
                  </div>
                )}
              </div>

              {/* Notifications List */}
              <ScrollArea className="flex-1">
                <AnimatePresence>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Status: {connectionStatus === 'connected' ? 'Connected' : 
                            connectionStatus === 'connecting' ? 'Connecting...' :
                            connectionStatus === 'error' ? 'Connection error' : 'Disconnected'}
                  </span>
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={sendTestNotification}
                      className="text-xs"
                    >
                      Test
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
