import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { HTTPException } from 'hono/http-exception'
import { AuthService, createAuthMiddleware } from './auth/auth'

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
  origin: (origin) => {
    if (!origin) return true
    // Parse CORS_ORIGINS from environment
    const allowedOrigins = ['http://localhost:3000', 'https://bitebase-intelligence.vercel.app']
    return allowedOrigins.includes(origin)
  },
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Initialize services middleware
app.use('*', async (c, next) => {
  // Initialize auth service
  const authService = new AuthService(
    c.env.JWT_SECRET || 'default-dev-secret-key',
    c.env.BITEBASE_DB,
    c.env.SESSIONS
  )
  
  c.set('authService', authService)
  c.set('db', c.env.BITEBASE_DB)
  c.set('cacheKV', c.env.CACHE)
  c.set('analyticsKV', c.env.ANALYTICS)
  
  await next()
})

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'BiteBase Intelligence API - Cloudflare Workers',
    version: '2.0.0',
    status: 'operational',
    docs: '/docs',
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

// API v1 routes with authentication
const v1 = new Hono<{ Bindings: Env }>()

// Public auth routes - simplified for testing
v1.post('/auth/login', async (c) => {
  const authService = c.get('authService') as AuthService
  const db = c.get('db') as D1Database
  
  try {
    const body = await c.req.json()
    
    // Basic validation
    if (!body.email || !body.password) {
      return c.json({
        success: false,
        message: 'Email and password are required'
      }, 400)
    }

    // Hash password utility
    async function hashPassword(password: string): Promise<string> {
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    // Verify password utility
    async function verifyPassword(password: string, hash: string): Promise<boolean> {
      const hashedInput = await hashPassword(password)
      return hashedInput === hash
    }

    const { email, password } = body

    // Get user
    const user = await db.prepare(
      'SELECT * FROM users WHERE email = ? AND status = "active"'
    ).bind(email).first()

    if (!user) {
      return c.json({
        success: false,
        message: 'Invalid email or password'
      }, 401)
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return c.json({
        success: false,
        message: 'Invalid email or password'
      }, 401)
    }

    // Update last login
    await db.prepare(
      'UPDATE users SET last_login_at = datetime("now") WHERE id = ?'
    ).bind(user.id).run()

    // Generate tokens
    const tokens = await authService.generateTokens(user)

    return c.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
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

// Protected routes
const protectedRoutes = new Hono<{ Bindings: Env }>()
protectedRoutes.use('*', async (c, next) => {
  const authService = c.get('authService') as AuthService
  const middleware = createAuthMiddleware(authService)
  await middleware(c, next)
})

// Protected health check
protectedRoutes.get('/health', (c) => {
  const user = c.get('user')
  return c.json({
    success: true,
    message: 'Authenticated endpoint working',
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    timestamp: new Date().toISOString()
  })
})

// Test database connection (protected)
protectedRoutes.get('/test-db', async (c) => {
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

// Test KV storage (protected)
protectedRoutes.get('/test-kv', async (c) => {
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

// Mount protected routes
v1.route('/api', protectedRoutes)

// Mount v1 routes
app.route('/v1', v1)

// Legacy v2 routes for backwards compatibility
app.get('/api/v2/test-db', async (c) => {
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

app.get('/api/v2/test-kv', async (c) => {
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
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        message: err.message,
        status: err.status,
        cause: err.cause
      }
    }, err.status)
  }

  console.error('Unhandled error:', err)
  return c.json({
    error: true,
    message: 'Internal server error',
    status_code: 500
  }, 500)
})

export default app