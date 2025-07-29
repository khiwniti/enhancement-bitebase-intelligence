'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { Bell, Send, Wifi, WifiOff, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react'

export default function TestNotificationsPage() {
  const {
    notifications,
    isConnected,
    connectionStatus,
    markAsRead,
    deleteNotification,
    clearAll
  } = useRealtimeNotifications()

  const [testMessage, setTestMessage] = useState('')

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/v1/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'test-user-123',
          type: 'system',
          title: 'Test Notification',
          message: testMessage || 'This is a test notification from the frontend!',
          priority: 'medium',
          action_url: '/dashboard',
          action_text: 'View Dashboard'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Notification sent:', result)
        setTestMessage('')
      } else {
        console.error('Failed to send notification:', response.status)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'system':
        return <Zap className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Real-time Notifications Test
          </h1>
          <p className="text-slate-600">
            Test the WebSocket-based notification system for BiteBase Intelligence
          </p>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getConnectionIcon()}
                WebSocket Connection Status
              </CardTitle>
              <CardDescription>
                Real-time connection to the notification service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={isConnected ? 'default' : 'secondary'}>
                    {connectionStatus.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {isConnected ? 'Connected to WebSocket' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-sm text-slate-500">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Controls */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Test Notification
              </CardTitle>
              <CardDescription>
                Send a test notification through the REST API to verify WebSocket delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter test message..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={sendTestNotification} disabled={!isConnected}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Live Notifications
              </CardTitle>
              <CardDescription>
                Real-time notifications received via WebSocket
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">Send a test notification to see it appear here instantly</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-white"
                    >
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">
                            {notification.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          {notification.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              HIGH
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{new Date(notification.created_at).toLocaleTimeString()}</span>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              Unread
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
