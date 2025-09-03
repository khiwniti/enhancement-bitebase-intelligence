import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { AuthService, createAuthMiddleware, requireRole } from './auth/auth'
import { RestaurantService, RestaurantCreateSchema, RestaurantUpdateSchema, RestaurantQuerySchema } from './services/restaurants'

// Import route modules
import { restaurants } from './routes/restaurants'
import { analytics } from './routes/analytics'
import { ai } from './routes/ai'
import { fourP } from './routes/fourp'
import { management } from './routes/management'
import { integrations } from './routes/integrations'

// Types for our Worker environment
interface Env {
  DB: D1Database
  CACHE: KVNamespace
  SESSIONS: KVNamespace
  ANALYTICS: KVNamespace
  JWT_SECRET: string
  CORS_ORIGINS: string
  ENVIRONMENT: string
}

const app = new Hono<{ Bindings: Env }>()

// Initialize auth service helper
function getAuthService(env: Env): AuthService {
  return new AuthService(
    env.JWT_SECRET || 'fallback-secret-key',
    env.DB,
    env.SESSIONS
  )
}

// Hash password helper
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Verify password helper
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}

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
    const { results } = await c.env.DB.prepare("SELECT 1 as test").all()
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

// Authentication routes
app.post('/v1/auth/register', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, firstName, lastName, role = 'user', restaurantId } = body

    if (!email || !password || !firstName || !lastName) {
      return c.json({ 
        success: false, 
        error: 'Email, password, firstName, and lastName are required' 
      }, 400)
    }

    // Check if user already exists
    const existingUser = await c.env.DB
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first()

    if (existingUser) {
      return c.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, 409)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await c.env.DB
      .prepare(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      .bind(email, passwordHash, firstName, lastName, role)
      .run()

    if (!result.success) {
      return c.json({ 
        success: false, 
        error: 'Failed to create user' 
      }, 500)
    }

    // Get the created user
    const user = await c.env.DB
      .prepare('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first()

    // Generate tokens
    const authService = getAuthService(c.env)
    const { accessToken, refreshToken } = await authService.generateTokens(user)

    // Create session
    const sessionToken = await authService.createSession(user.id, {
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent'),
      deviceInfo: 'web'
    })

    return c.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken,
        sessionToken
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error during registration' 
    }, 500)
  }
})

app.post('/v1/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = body

    if (!email || !password) {
      return c.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, 400)
    }

    // Get user by email
    const user = await c.env.DB
      .prepare('SELECT id, email, first_name, last_name, role, password_hash, created_at, updated_at FROM users WHERE email = ?')
      .bind(email)
      .first() as any

    if (!user) {
      return c.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, 401)
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash)
    if (!passwordValid) {
      return c.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, 401)
    }

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user

    // Generate tokens
    const authService = getAuthService(c.env)
    const { accessToken, refreshToken } = await authService.generateTokens(userWithoutPassword)

    // Create session
    const sessionToken = await authService.createSession(user.id, {
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent'),
      deviceInfo: 'web'
    })

    return c.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        sessionToken
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error during login' 
    }, 500)
  }
})

app.post('/v1/auth/refresh', async (c) => {
  try {
    const body = await c.req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return c.json({ 
        success: false, 
        error: 'Refresh token is required' 
      }, 400)
    }

    const authService = getAuthService(c.env)
    const payload = await authService.verifyToken(refreshToken)
    
    if (!payload || payload.type !== 'refresh') {
      return c.json({ 
        success: false, 
        error: 'Invalid refresh token' 
      }, 401)
    }

    // Get user
    const user = await c.env.DB
      .prepare('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = ?')
      .bind(payload.sub)
      .first()

    if (!user) {
      return c.json({ 
        success: false, 
        error: 'User not found' 
      }, 401)
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await authService.generateTokens(user)

    // Create new session
    const sessionToken = await authService.createSession(user.id, {
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent'),
      deviceInfo: 'web'
    })

    return c.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user,
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error during token refresh' 
    }, 500)
  }
})

app.post('/v1/auth/logout', async (c) => {
  try {
    const sessionToken = c.req.header('X-Session-Token')
    
    if (sessionToken) {
      const authService = getAuthService(c.env)
      await authService.revokeSession(sessionToken)
    }

    return c.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error during logout' 
    }, 500)
  }
})

// Protected route example
app.get('/v1/auth/me', async (c) => {
  try {
    const authService = getAuthService(c.env)
    const authMiddleware = createAuthMiddleware(authService)
    await authMiddleware(c, async () => {})
    
    const user = c.get('user')
    return c.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    return c.json({ error: 'Authentication required' }, 401)
  }
})

// Register route modules
app.route('/v1/restaurants', restaurants)
app.route('/v1/analytics', analytics)
app.route('/v1/ai', ai)
app.route('/v1/4p', fourP)
app.route('/v1/management', management)
app.route('/v1/integrations', integrations)

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