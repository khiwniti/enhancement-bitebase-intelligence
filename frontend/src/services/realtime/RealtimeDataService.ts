/**
 * Real-time Data Service for BiteBase Intelligence
 * Handles WebSocket connections, data streaming, and live updates
 */

interface RealtimeDataEvent {
  type: 'revenue_update' | 'order_placed' | 'customer_activity' | 'menu_performance' | 'alert'
  timestamp: string
  restaurant_id: string
  data: any
}

interface RealtimeSubscription {
  id: string
  restaurant_id: string
  data_types: string[]
  callback: (event: RealtimeDataEvent) => void
}

interface RealtimeMetrics {
  current_revenue: number
  orders_today: number
  active_customers: number
  peak_hour_indicator: boolean
  trending_items: Array<{
    item_name: string
    orders_count: number
    trend: 'up' | 'down' | 'stable'
  }>
}

class RealtimeDataService {
  private ws: WebSocket | null = null
  private subscriptions: Map<string, RealtimeSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnected = false
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.bitebase.app/ws'
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('✅ Real-time connection established')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.resubscribeAll()
      }

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimeDataEvent = JSON.parse(event.data)
          this.handleRealtimeEvent(data)
        } catch (error) {
          console.error('Failed to parse real-time data:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('🔌 Real-time connection closed')
        this.isConnected = false
        this.stopHeartbeat()
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('❌ Real-time connection error:', error)
      }

    } catch (error) {
      console.error('Failed to establish real-time connection:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('❌ Max reconnection attempts reached. Switching to polling mode.')
      this.startPollingMode()
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private resubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      this.sendSubscription(subscription)
    })
  }

  private sendSubscription(subscription: RealtimeSubscription) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        subscription_id: subscription.id,
        restaurant_id: subscription.restaurant_id,
        data_types: subscription.data_types
      }))
    }
  }

  private handleRealtimeEvent(event: RealtimeDataEvent) {
    // Find relevant subscriptions
    this.subscriptions.forEach((subscription) => {
      if (subscription.restaurant_id === event.restaurant_id &&
          subscription.data_types.includes(event.type)) {
        try {
          subscription.callback(event)
        } catch (error) {
          console.error('Error in subscription callback:', error)
        }
      }
    })
  }

  private startPollingMode() {
    // Fallback to polling when WebSocket fails
    console.log('🔄 Starting polling mode for real-time data')
    
    setInterval(async () => {
      for (const subscription of this.subscriptions.values()) {
        try {
          const data = await this.fetchPollingData(subscription.restaurant_id, subscription.data_types)
          if (data) {
            subscription.callback({
              type: 'revenue_update',
              timestamp: new Date().toISOString(),
              restaurant_id: subscription.restaurant_id,
              data
            })
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }
    }, 10000) // Poll every 10 seconds
  }

  private async fetchPollingData(restaurantId: string, dataTypes: string[]): Promise<any> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/realtime-analytics/current/${restaurantId}`)
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('Failed to fetch polling data:', error)
      return null
    }
  }

  // Public API
  subscribe(
    restaurantId: string, 
    dataTypes: string[], 
    callback: (event: RealtimeDataEvent) => void
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      restaurant_id: restaurantId,
      data_types: dataTypes,
      callback
    }

    this.subscriptions.set(subscriptionId, subscription)

    // Send subscription if connected
    if (this.isConnected) {
      this.sendSubscription(subscription)
    }

    return subscriptionId
  }

  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        subscription_id: subscriptionId
      }))
    }
    this.subscriptions.delete(subscriptionId)
  }

  // Generate mock real-time data for demo purposes
  generateMockRealtimeData(restaurantId: string): RealtimeMetrics {
    const baseRevenue = 45000
    const currentHour = new Date().getHours()
    const isPeakHour = currentHour >= 11 && currentHour <= 14 || currentHour >= 17 && currentHour <= 21

    return {
      current_revenue: baseRevenue + Math.random() * 5000,
      orders_today: Math.floor(120 + Math.random() * 50),
      active_customers: Math.floor(15 + Math.random() * 25),
      peak_hour_indicator: isPeakHour,
      trending_items: [
        { item_name: 'Signature Burger', orders_count: 23, trend: 'up' },
        { item_name: 'Caesar Salad', orders_count: 18, trend: 'stable' },
        { item_name: 'Fish Tacos', orders_count: 15, trend: 'up' },
        { item_name: 'Pasta Primavera', orders_count: 12, trend: 'down' },
        { item_name: 'Chocolate Cake', orders_count: 9, trend: 'up' }
      ]
    }
  }

  // Simulate real-time events for demo
  startMockDataStream(restaurantId: string, callback: (event: RealtimeDataEvent) => void) {
    const eventTypes: RealtimeDataEvent['type'][] = [
      'revenue_update', 'order_placed', 'customer_activity', 'menu_performance'
    ]

    const interval = setInterval(() => {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const mockEvent: RealtimeDataEvent = {
        type: eventType,
        timestamp: new Date().toISOString(),
        restaurant_id: restaurantId,
        data: this.generateMockEventData(eventType)
      }

      callback(mockEvent)
    }, 3000 + Math.random() * 7000) // Random interval between 3-10 seconds

    return interval
  }

  private generateMockEventData(eventType: RealtimeDataEvent['type']) {
    switch (eventType) {
      case 'revenue_update':
        return {
          amount: Math.random() * 100 + 20,
          total_today: Math.random() * 5000 + 40000
        }
      case 'order_placed':
        return {
          order_id: `ORD_${Date.now()}`,
          items: ['Burger', 'Fries', 'Drink'],
          total: Math.random() * 50 + 15,
          customer_type: ['new', 'returning', 'vip'][Math.floor(Math.random() * 3)]
        }
      case 'customer_activity':
        return {
          action: ['entered', 'seated', 'ordered', 'paid'][Math.floor(Math.random() * 4)],
          customer_count: Math.floor(Math.random() * 5) + 1
        }
      case 'menu_performance':
        return {
          item_name: ['Signature Burger', 'Caesar Salad', 'Fish Tacos'][Math.floor(Math.random() * 3)],
          performance_change: (Math.random() - 0.5) * 20
        }
      default:
        return {}
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
    this.stopHeartbeat()
    this.subscriptions.clear()
  }
}

// Singleton instance
export const realtimeDataService = new RealtimeDataService()
export type { RealtimeDataEvent, RealtimeMetrics }
