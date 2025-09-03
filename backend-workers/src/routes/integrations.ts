import { Hono } from 'hono'
import { z } from 'zod'

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  SESSIONS: KVNamespace
  ANALYTICS: KVNamespace
  JWT_SECRET: string
  CORS_ORIGINS: string
  ENVIRONMENT: string
}

// Integration validation schemas
const POSIntegrationSchema = z.object({
  name: z.string().min(1, 'Integration name is required'),
  type: z.enum(['square', 'clover', 'toast', 'revel', 'lightspeed', 'touchbistro']),
  credentials: z.object({
    api_key: z.string().optional(),
    api_secret: z.string().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    environment: z.enum(['sandbox', 'production']).default('sandbox')
  }),
  restaurant_id: z.string().optional(),
  is_active: z.boolean().default(true)
})

const WebhookConfigSchema = z.object({
  url: z.string().url('Valid webhook URL is required'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  secret: z.string().optional(),
  is_active: z.boolean().default(true)
})

const APIProxyRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  url: z.string().url('Valid URL is required'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  timeout: z.number().min(1).max(30000).default(5000)
})

const integrations = new Hono<{ Bindings: Env }>()

// POS System Integrations
integrations.get('/pos', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, type, is_active } = query
    
    // Mock POS integrations data
    const integrations = [
      {
        id: '1',
        name: 'Square POS Integration',
        type: 'square',
        restaurant_id: restaurant_id || 'demo-restaurant-1',
        status: 'connected',
        last_sync: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        sync_frequency: 'hourly',
        data_points: ['orders', 'payments', 'inventory', 'customers'],
        health_score: 95,
        error_count: 0,
        is_active: true
      },
      {
        id: '2',
        name: 'Toast POS Integration',
        type: 'toast',
        restaurant_id: restaurant_id || 'demo-restaurant-2',
        status: 'error',
        last_sync: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        sync_frequency: 'real-time',
        data_points: ['orders', 'payments', 'menu_items'],
        health_score: 65,
        error_count: 3,
        is_active: true
      }
    ]
    
    // Filter by type if provided
    const filteredIntegrations = type 
      ? integrations.filter(i => i.type === type)
      : integrations
    
    return c.json({
      success: true,
      data: {
        integrations: filteredIntegrations,
        summary: {
          total: filteredIntegrations.length,
          connected: filteredIntegrations.filter(i => i.status === 'connected').length,
          error: filteredIntegrations.filter(i => i.status === 'error').length,
          average_health: filteredIntegrations.reduce((sum, i) => sum + i.health_score, 0) / filteredIntegrations.length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching POS integrations:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch POS integrations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Create POS Integration
integrations.post('/pos', async (c) => {
  try {
    const body = await c.req.json()
    const integrationData = POSIntegrationSchema.parse(body)
    
    // Generate integration ID
    const integrationId = crypto.randomUUID()
    
    // In a real implementation, this would save to database and set up actual integration
    const integration = {
      id: integrationId,
      ...integrationData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sync: null,
      health_score: 0,
      error_count: 0
    }
    
    return c.json({
      success: true,
      message: 'POS integration created successfully',
      data: integration
    }, 201)
  } catch (error) {
    console.error('Error creating POS integration:', error)
    return c.json({
      success: false,
      error: 'Failed to create POS integration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Test POS Integration Connection
integrations.post('/pos/:id/test', async (c) => {
  try {
    const id = c.req.param('id')
    
    // Mock connection test
    const testResult = {
      integration_id: id,
      test_status: 'success',
      response_time: Math.floor(Math.random() * 500) + 100,
      data_accessible: true,
      endpoints_verified: ['orders', 'menu', 'payments'],
      test_timestamp: new Date().toISOString(),
      recommendations: [
        'Connection is stable and secure',
        'All required endpoints are accessible',
        'Data sync frequency is optimal'
      ]
    }
    
    return c.json({
      success: true,
      data: testResult
    })
  } catch (error) {
    console.error('Error testing POS integration:', error)
    return c.json({
      success: false,
      error: 'Failed to test POS integration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Sync POS Data
integrations.post('/pos/:id/sync', async (c) => {
  try {
    const id = c.req.param('id')
    const { force = false } = c.req.query()
    
    // Mock sync operation
    const syncResult = {
      integration_id: id,
      sync_id: crypto.randomUUID(),
      status: 'completed',
      started_at: new Date(Date.now() - 1000 * 30).toISOString(),
      completed_at: new Date().toISOString(),
      records_processed: {
        orders: 156,
        payments: 143,
        menu_items: 89,
        customers: 67
      },
      errors: [],
      force_sync: force === 'true'
    }
    
    return c.json({
      success: true,
      data: syncResult
    })
  } catch (error) {
    console.error('Error syncing POS data:', error)
    return c.json({
      success: false,
      error: 'Failed to sync POS data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Third-party Connectors
integrations.get('/connectors', async (c) => {
  try {
    const connectors = [
      {
        id: 'google-my-business',
        name: 'Google My Business',
        category: 'marketing',
        description: 'Sync restaurant information and reviews with Google My Business',
        status: 'available',
        features: ['location_sync', 'review_management', 'analytics'],
        pricing: 'free'
      },
      {
        id: 'facebook-pages',
        name: 'Facebook Pages',
        category: 'social',
        description: 'Manage Facebook page content and customer interactions',
        status: 'available',
        features: ['post_management', 'message_sync', 'insights'],
        pricing: 'free'
      },
      {
        id: 'mailchimp',
        name: 'Mailchimp',
        category: 'marketing',
        description: 'Email marketing and customer communication',
        status: 'available',
        features: ['email_campaigns', 'customer_segmentation', 'automation'],
        pricing: 'paid'
      },
      {
        id: 'deliveroo',
        name: 'Deliveroo',
        category: 'delivery',
        description: 'Food delivery service integration',
        status: 'beta',
        features: ['order_sync', 'menu_management', 'delivery_tracking'],
        pricing: 'commission'
      }
    ]
    
    return c.json({
      success: true,
      data: {
        connectors,
        categories: ['marketing', 'social', 'delivery', 'payment', 'analytics']
      }
    })
  } catch (error) {
    console.error('Error fetching connectors:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch connectors',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Webhook Management
integrations.get('/webhooks', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id } = query
    
    // Mock webhook configurations
    const webhooks = [
      {
        id: '1',
        restaurant_id: restaurant_id || 'demo-restaurant-1',
        url: 'https://api.partner.com/webhooks/orders',
        events: ['order.created', 'order.updated', 'order.cancelled'],
        secret: 'whsec_***redacted***',
        status: 'active',
        last_delivery: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        success_rate: 98.5,
        total_deliveries: 1234,
        failed_deliveries: 18,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
      }
    ]
    
    return c.json({
      success: true,
      data: {
        webhooks,
        summary: {
          total: webhooks.length,
          active: webhooks.filter(w => w.status === 'active').length,
          average_success_rate: webhooks.reduce((sum, w) => sum + w.success_rate, 0) / webhooks.length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch webhooks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Create Webhook
integrations.post('/webhooks', async (c) => {
  try {
    const body = await c.req.json()
    const webhookData = WebhookConfigSchema.parse(body)
    
    const webhookId = crypto.randomUUID()
    const webhook = {
      id: webhookId,
      ...webhookData,
      secret: `whsec_${crypto.randomUUID().replace(/-/g, '')}`,
      status: 'active',
      created_at: new Date().toISOString(),
      last_delivery: null,
      success_rate: 100,
      total_deliveries: 0,
      failed_deliveries: 0
    }
    
    return c.json({
      success: true,
      message: 'Webhook created successfully',
      data: webhook
    }, 201)
  } catch (error) {
    console.error('Error creating webhook:', error)
    return c.json({
      success: false,
      error: 'Failed to create webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// API Proxy for external calls
integrations.post('/proxy', async (c) => {
  try {
    const body = await c.req.json()
    const { method, url, headers = {}, body: requestBody, timeout } = APIProxyRequestSchema.parse(body)
    
    // Security check - only allow certain domains
    const allowedDomains = [
      'api.square.com',
      'api.clover.com', 
      'api.toasttab.com',
      'api.lightspeedhq.com',
      'api.google.com',
      'graph.facebook.com'
    ]
    
    const urlObj = new URL(url)
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return c.json({
        success: false,
        error: 'Domain not allowed for proxy requests'
      }, 403)
    }
    
    // Make the proxied request
    const requestOptions: RequestInit = {
      method,
      headers: {
        'User-Agent': 'BiteBase-Intelligence/1.0',
        ...headers
      }
    }
    
    if (requestBody && method !== 'GET') {
      requestOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody)
      requestOptions.headers = {
        ...requestOptions.headers,
        'Content-Type': 'application/json'
      }
    }
    
    const response = await fetch(url, requestOptions)
    const responseData = await response.text()
    
    let parsedData
    try {
      parsedData = JSON.parse(responseData)
    } catch {
      parsedData = responseData
    }
    
    return c.json({
      success: true,
      data: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedData
      }
    })
  } catch (error) {
    console.error('Error in API proxy:', error)
    return c.json({
      success: false,
      error: 'Failed to proxy API request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Integration Health Check
integrations.get('/health', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id } = query
    
    // Mock health check data
    const healthData = {
      overall_status: 'healthy',
      integrations: {
        pos_systems: {
          status: 'healthy',
          active_connections: 2,
          failed_connections: 0,
          last_check: new Date().toISOString()
        },
        webhooks: {
          status: 'warning',
          active_webhooks: 1,
          failed_deliveries_24h: 3,
          success_rate: 95.2
        },
        third_party_apis: {
          status: 'healthy',
          accessible_services: 5,
          response_time_avg: 245,
          uptime_percentage: 99.8
        }
      },
      recommendations: [
        'Webhook delivery issues detected - check endpoint configuration',
        'Consider implementing retry logic for failed webhook deliveries',
        'All POS integrations are functioning normally'
      ],
      next_maintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
    }
    
    return c.json({
      success: true,
      data: healthData
    })
  } catch (error) {
    console.error('Error checking integration health:', error)
    return c.json({
      success: false,
      error: 'Failed to check integration health',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Integration Logs
integrations.get('/logs', async (c) => {
  try {
    const query = c.req.query()
    const { integration_id, level = 'all', limit = '50' } = query
    
    // Mock integration logs
    const logs = [
      {
        id: '1',
        integration_id: integration_id || 'pos-square-1',
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Successfully synced 45 orders from Square POS',
        metadata: {
          records_processed: 45,
          sync_duration: '2.3s',
          endpoint: '/orders'
        }
      },
      {
        id: '2',
        integration_id: integration_id || 'webhook-orders',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        level: 'warning',
        message: 'Webhook delivery attempt failed, will retry',
        metadata: {
          webhook_url: 'https://api.partner.com/webhooks/orders',
          status_code: 503,
          retry_count: 2
        }
      },
      {
        id: '3',
        integration_id: integration_id || 'connector-gmb',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        level: 'error',
        message: 'Google My Business API rate limit exceeded',
        metadata: {
          api_endpoint: '/locations',
          rate_limit: '100/hour',
          reset_time: new Date(Date.now() + 1000 * 60 * 30).toISOString()
        }
      }
    ]
    
    // Filter by level if specified
    const filteredLogs = level !== 'all' 
      ? logs.filter(log => log.level === level)
      : logs
    
    return c.json({
      success: true,
      data: {
        logs: filteredLogs.slice(0, parseInt(limit)),
        pagination: {
          total: filteredLogs.length,
          limit: parseInt(limit),
          has_more: filteredLogs.length > parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching integration logs:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch integration logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { integrations }