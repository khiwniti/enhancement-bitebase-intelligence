import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

// Types for our Worker environment
interface Env {
  BITEBASE_DB: D1Database
  CACHE: KVNamespace
  SESSIONS: KVNamespace
  ANALYTICS: KVNamespace
  JWT_SECRET: string
  CORS_ORIGINS: string
  ENVIRONMENT: string
}

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://bitebase-intelligence.vercel.app'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'BiteBase Intelligence API - Cloudflare Workers',
    version: '2.0.0',
    status: 'operational',
    environment: c.env.ENVIRONMENT || 'development'
  })
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'bitebase-intelligence-workers',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  })
})

// Test database connection
app.get('/test-db', async (c) => {
  try {
    const { results } = await c.env.BITEBASE_DB.prepare("SELECT 1 as test").all()
    return c.json({ 
      status: 'connected',
      database: 'D1',
      result: results 
    })
  } catch (error) {
    return c.json({ 
      status: 'error', 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Test KV storage
app.get('/test-kv', async (c) => {
  try {
    const testKey = 'health-check'
    const testValue = new Date().toISOString()
    
    await c.env.CACHE.put(testKey, testValue)
    const retrievedValue = await c.env.CACHE.get(testKey)
    
    return c.json({
      status: 'connected',
      storage: 'KV',
      test: {
        stored: testValue,
        retrieved: retrievedValue,
        match: testValue === retrievedValue
      }
    })
  } catch (error) {
    return c.json({ 
      status: 'error', 
      error: 'KV storage test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Basic auth test endpoint
app.post('/v1/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    
    if (!body.email || !body.password) {
      return c.json({
        success: false,
        message: 'Email and password are required'
      }, 400)
    }

    // Simple test - just return success for any credentials
    return c.json({
      success: true,
      message: 'Login test successful',
      data: {
        user: {
          email: body.email,
          role: 'admin'
        },
        token: 'test-token-' + Date.now()
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({
      success: false,
      message: 'Internal server error during login'
    }, 500)
  }
})

// Default 404 handler
app.notFound((c) => {
  return c.json({
    error: true,
    message: 'Endpoint not found',
    status_code: 404
  }, 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({
    error: true,
    message: 'Internal server error',
    status_code: 500
  }, 500)
})

export default app