import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { AuthService } from '../auth/auth'
import { z } from 'zod'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  phone: z.string().optional()
})

const refreshTokenSchema = z.object({
  refreshToken: z.string()
})

export function createAuthRoutes(authService: AuthService, db: any) {
  const auth = new Hono()

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

  // POST /auth/register
  auth.post('/register', async (c) => {
    try {
      const body = await c.req.json()
      const validation = registerSchema.safeParse(body)

      if (!validation.success) {
        throw new HTTPException(400, { 
          message: 'Validation failed', 
          cause: validation.error.issues 
        })
      }

      const { email, password, firstName, lastName, company, phone } = validation.data

      // Check if user already exists
      const existingUser = await db.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).bind(email).first()

      if (existingUser) {
        throw new HTTPException(409, { message: 'User already exists with this email' })
      }

      // Hash password
      const passwordHash = await hashPassword(password)

      // Create user
      const userId = crypto.randomUUID()
      await db.prepare(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, 
          company, phone, role, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 'active')
      `).bind(
        userId,
        email,
        passwordHash,
        firstName,
        lastName,
        company || null,
        phone || null
      ).run()

      // Get created user
      const user = await db.prepare(
        'SELECT id, email, first_name, last_name, role, status FROM users WHERE id = ?'
      ).bind(userId).first()

      // Generate tokens
      const tokens = await authService.generateTokens(user)

      // Create session
      const sessionToken = await authService.createSession(userId, {
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
        userAgent: c.req.header('user-agent'),
        deviceInfo: 'Web Registration'
      })

      // Store refresh token
      const refreshTokenHash = await hashPassword(tokens.refreshToken)
      await authService.storeRefreshToken(userId, refreshTokenHash, {
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
        userAgent: c.req.header('user-agent'),
        deviceInfo: 'Web Registration'
      })

      return c.json({
        success: true,
        message: 'User registered successfully',
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
          },
          sessionToken
        }
      })

    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      console.error('Registration error:', error)
      throw new HTTPException(500, { message: 'Internal server error during registration' })
    }
  })

  // POST /auth/login
  auth.post('/login', async (c) => {
    try {
      const body = await c.req.json()
      const validation = loginSchema.safeParse(body)

      if (!validation.success) {
        throw new HTTPException(400, { 
          message: 'Validation failed', 
          cause: validation.error.issues 
        })
      }

      const { email, password } = validation.data

      // Get user
      const user = await db.prepare(
        'SELECT * FROM users WHERE email = ? AND status = "active"'
      ).bind(email).first()

      if (!user) {
        throw new HTTPException(401, { message: 'Invalid email or password' })
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash)
      if (!isValidPassword) {
        throw new HTTPException(401, { message: 'Invalid email or password' })
      }

      // Update last login
      await db.prepare(
        'UPDATE users SET last_login_at = datetime("now") WHERE id = ?'
      ).bind(user.id).run()

      // Generate tokens
      const tokens = await authService.generateTokens(user)

      // Create session
      const sessionToken = await authService.createSession(user.id, {
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
        userAgent: c.req.header('user-agent'),
        deviceInfo: 'Web Login'
      })

      // Store refresh token
      const refreshTokenHash = await hashPassword(tokens.refreshToken)
      await authService.storeRefreshToken(user.id, refreshTokenHash, {
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
        userAgent: c.req.header('user-agent'),
        deviceInfo: 'Web Login'
      })

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
          },
          sessionToken
        }
      })

    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      console.error('Login error:', error)
      throw new HTTPException(500, { message: 'Internal server error during login' })
    }
  })

  // POST /auth/refresh
  auth.post('/refresh', async (c) => {
    try {
      const body = await c.req.json()
      const validation = refreshTokenSchema.safeParse(body)

      if (!validation.success) {
        throw new HTTPException(400, { message: 'Invalid refresh token format' })
      }

      const { refreshToken } = validation.data

      // Hash and validate refresh token
      const tokenHash = await hashPassword(refreshToken)
      const storedToken = await authService.validateRefreshToken(tokenHash)

      if (!storedToken) {
        throw new HTTPException(401, { message: 'Invalid or expired refresh token' })
      }

      // Generate new tokens
      const user = {
        id: storedToken.id,
        email: storedToken.email,
        role: storedToken.role
      }
      const tokens = await authService.generateTokens(user)

      // Revoke old refresh token
      await authService.revokeRefreshToken(tokenHash)

      // Store new refresh token
      const newRefreshTokenHash = await hashPassword(tokens.refreshToken)
      await authService.storeRefreshToken(user.id, newRefreshTokenHash, {
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
        userAgent: c.req.header('user-agent'),
        deviceInfo: 'Token Refresh'
      })

      return c.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          }
        }
      })

    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      console.error('Token refresh error:', error)
      throw new HTTPException(500, { message: 'Internal server error during token refresh' })
    }
  })

  // POST /auth/logout
  auth.post('/logout', async (c) => {
    try {
      const sessionToken = c.req.header('x-session-token')
      const refreshToken = (await c.req.json())?.refreshToken

      if (sessionToken) {
        await authService.revokeSession(sessionToken)
      }

      if (refreshToken) {
        const tokenHash = await hashPassword(refreshToken)
        await authService.revokeRefreshToken(tokenHash)
      }

      return c.json({
        success: true,
        message: 'Logout successful'
      })

    } catch (error) {
      console.error('Logout error:', error)
      throw new HTTPException(500, { message: 'Internal server error during logout' })
    }
  })

  // GET /auth/me - Get current user info
  auth.get('/me', async (c) => {
    try {
      const authHeader = c.req.header('Authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HTTPException(401, { message: 'Missing or invalid authorization header' })
      }

      const token = authHeader.substring(7)
      const payload = await authService.verifyToken(token)

      if (!payload) {
        throw new HTTPException(401, { message: 'Invalid or expired token' })
      }

      // Get fresh user data
      const user = await db.prepare(
        'SELECT id, email, first_name, last_name, company, phone, role, status, timezone, language, is_email_verified, created_at, last_login_at FROM users WHERE id = ?'
      ).bind(payload.sub).first()

      if (!user) {
        throw new HTTPException(404, { message: 'User not found' })
      }

      return c.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            company: user.company,
            phone: user.phone,
            role: user.role,
            status: user.status,
            timezone: user.timezone,
            language: user.language,
            isEmailVerified: user.is_email_verified,
            createdAt: user.created_at,
            lastLoginAt: user.last_login_at
          }
        }
      })

    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      console.error('Get user error:', error)
      throw new HTTPException(500, { message: 'Internal server error' })
    }
  })

  return auth
}