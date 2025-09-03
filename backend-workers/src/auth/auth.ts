import { sign, verify } from '@tsndr/cloudflare-worker-jwt'
import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export interface JWTPayload {
  sub: string // user id
  email: string
  role: 'admin' | 'manager' | 'user' | 'viewer'
  iat: number
  exp: number
}

export interface SessionData {
  userId: string
  email: string
  role: string
  deviceInfo?: string
  ipAddress?: string
  userAgent?: string
}

export class AuthService {
  private jwtSecret: string
  public db: any
  private sessionsKV: any

  constructor(db: any, sessionsKV: any, jwtSecret: string) {
    this.db = db
    this.sessionsKV = sessionsKV
    this.jwtSecret = jwtSecret
  }

  async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const now = Math.floor(Date.now() / 1000)
    const accessTokenPayload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + (15 * 60) // 15 minutes
    }

    const refreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
      iat: now,
      exp: now + (7 * 24 * 60 * 60) // 7 days
    }

    const accessToken = await sign(accessTokenPayload, this.jwtSecret)
    const refreshToken = await sign(refreshTokenPayload, this.jwtSecret)

    return { accessToken, refreshToken }
  }

  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const isValid = await verify(token, this.jwtSecret)
      if (!isValid) return null

      const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload
      
      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null
      }

      return payload
    } catch (error) {
      console.error('Token verification error:', error)
      return null
    }
  }

  async createSession(userId: string, metadata: {
    ipAddress?: string
    userAgent?: string
    deviceInfo?: string
  }): Promise<string> {
    const sessionId = crypto.randomUUID()
    const sessionToken = crypto.randomUUID()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() // 30 days

    // Store session in D1
    await this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, session_token, ip_address, user_agent, device_info, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      userId,
      sessionToken,
      metadata.ipAddress || null,
      metadata.userAgent || null,
      metadata.deviceInfo || null,
      expiresAt
    ).run()

    // Cache session in KV for fast access
    const sessionData: SessionData = {
      userId,
      email: '', // Will be filled when needed
      role: '',
      ...metadata
    }
    
    await this.sessionsKV.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
      expirationTtl: 30 * 24 * 60 * 60 // 30 days
    })

    return sessionToken
  }

  async getSession(sessionToken: string): Promise<SessionData | null> {
    try {
      // Try KV first for speed
      const cachedSession = await this.sessionsKV.get(`session:${sessionToken}`)
      if (cachedSession) {
        return JSON.parse(cachedSession)
      }

      // Fall back to D1
      const session = await this.db.prepare(`
        SELECT us.*, u.email, u.role 
        FROM user_sessions us
        JOIN users u ON u.id = us.user_id
        WHERE us.session_token = ? AND us.is_active = 1 AND us.expires_at > datetime('now')
      `).bind(sessionToken).first()

      if (!session) return null

      const sessionData: SessionData = {
        userId: session.user_id,
        email: session.email,
        role: session.role,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address,
        userAgent: session.user_agent
      }

      // Cache back to KV
      await this.sessionsKV.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
        expirationTtl: 30 * 24 * 60 * 60
      })

      return sessionData
    } catch (error) {
      console.error('Session retrieval error:', error)
      return null
    }
  }

  async revokeSession(sessionToken: string): Promise<void> {
    // Remove from KV
    await this.sessionsKV.delete(`session:${sessionToken}`)
    
    // Mark as inactive in D1
    await this.db.prepare(`
      UPDATE user_sessions 
      SET is_active = 0, revoked_at = datetime('now')
      WHERE session_token = ?
    `).bind(sessionToken).run()
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    // Get all active sessions for user
    const sessions = await this.db.prepare(`
      SELECT session_token FROM user_sessions 
      WHERE user_id = ? AND is_active = 1
    `).bind(userId).all()

    // Remove from KV
    for (const session of sessions.results) {
      await this.sessionsKV.delete(`session:${session.session_token}`)
    }

    // Mark all as inactive in D1
    await this.db.prepare(`
      UPDATE user_sessions 
      SET is_active = 0, revoked_at = datetime('now')
      WHERE user_id = ?
    `).bind(userId).run()
  }

  async storeRefreshToken(userId: string, tokenHash: string, metadata: {
    deviceInfo?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<string> {
    const refreshTokenId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 days

    await this.db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, device_info, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      refreshTokenId,
      userId,
      tokenHash,
      metadata.deviceInfo || null,
      metadata.ipAddress || null,
      metadata.userAgent || null,
      expiresAt
    ).run()

    return refreshTokenId
  }

  async validateRefreshToken(tokenHash: string): Promise<any | null> {
    const refreshToken = await this.db.prepare(`
      SELECT rt.*, u.id, u.email, u.role, u.status
      FROM refresh_tokens rt
      JOIN users u ON u.id = rt.user_id
      WHERE rt.token_hash = ? AND rt.is_active = 1 AND rt.expires_at > datetime('now')
    `).bind(tokenHash).first()

    return refreshToken || null
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.db.prepare(`
      UPDATE refresh_tokens 
      SET is_active = 0, revoked_at = datetime('now')
      WHERE token_hash = ?
    `).bind(tokenHash).run()
  }

  // Authentication methods
  async register(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    role?: string
  }): Promise<{ user: any; accessToken: string; refreshToken: string; sessionToken: string }> {
    // Check if user already exists
    const existingUser = await this.db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(userData.email).first()

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const passwordHash = await this.hashPassword(userData.password)
    const userId = crypto.randomUUID()

    // Create user
    await this.db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `).bind(
      userId,
      userData.email,
      passwordHash,
      userData.first_name,
      userData.last_name,
      userData.role || 'user'
    ).run()

    // Get the created user
    const user = await this.db.prepare(
      'SELECT id, email, first_name, last_name, role, status, created_at FROM users WHERE id = ?'
    ).bind(userId).first()

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user)
    const sessionToken = await this.createSession(userId, {})

    // Store refresh token
    const refreshTokenHash = await this.hashPassword(refreshToken)
    await this.storeRefreshToken(userId, refreshTokenHash, {})

    return {
      user,
      accessToken,
      refreshToken,
      sessionToken
    }
  }

  async login(email: string, password: string): Promise<{
    success: boolean
    data?: { user: any; accessToken: string; refreshToken: string; sessionToken: string }
    error?: string
  }> {
    try {
      console.log('AUTH: Starting login for email:', email)
      
      // Get user by email
      console.log('AUTH: Looking up user in database')
      const user = await this.db.prepare(
        'SELECT id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = ?'
      ).bind(email).first()

      if (!user) {
        console.log('AUTH: User not found')
        return { success: false, error: 'Invalid email or password' }
      }

      console.log('AUTH: User found, checking status:', user.status)
      if (user.status !== 'active') {
        console.log('AUTH: User status is not active')
        return { success: false, error: 'Account is not active' }
      }

      // Verify password
      console.log('AUTH: Verifying password')
      const isPasswordValid = await this.verifyPassword(password, user.password_hash)
      if (!isPasswordValid) {
        console.log('AUTH: Password verification failed')
        return { success: false, error: 'Invalid email or password' }
      }

      console.log('AUTH: Password verified, generating tokens')
      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user)
      console.log('AUTH: Tokens generated, creating session')
      
      const sessionToken = await this.createSession(user.id, {})
      console.log('AUTH: Session created, storing refresh token')

      // Store refresh token
      const refreshTokenHash = await this.hashPassword(refreshToken)
      await this.storeRefreshToken(user.id, refreshTokenHash, {})
      console.log('AUTH: Refresh token stored')

      // Remove password_hash from user object before returning
      const { password_hash, ...userWithoutPassword } = user

      console.log('AUTH: Login successful, returning data')
      return {
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
          sessionToken
        }
      }
    } catch (error) {
      console.error('AUTH ERROR: Login error:', error)
      console.error('AUTH ERROR: Stack:', error instanceof Error ? error.stack : 'No stack')
      return { success: false, error: 'Internal server error' }
    }
  }

  async refreshToken(refreshToken: string): Promise<{
    success: boolean
    data?: { accessToken: string; refreshToken: string; sessionToken: string }
    error?: string
  }> {
    try {
      const refreshTokenHash = await this.hashPassword(refreshToken)
      const tokenData = await this.validateRefreshToken(refreshTokenHash)

      if (!tokenData) {
        return { success: false, error: 'Invalid or expired refresh token' }
      }

      // Revoke old refresh token
      await this.revokeRefreshToken(refreshTokenHash)

      // Generate new tokens
      const user = {
        id: tokenData.user_id,
        email: tokenData.email,
        role: tokenData.role,
        status: tokenData.status
      }

      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user)
      const sessionToken = await this.createSession(user.id, {})

      // Store new refresh token
      const newRefreshTokenHash = await this.hashPassword(newRefreshToken)
      await this.storeRefreshToken(user.id, newRefreshTokenHash, {})

      return {
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          sessionToken
        }
      }
    } catch (error) {
      console.error('Refresh token error:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  // Password utilities
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }
}

// Middleware factory
export function createAuthMiddleware(authService: AuthService) {
  return async (c: Context, next: () => Promise<void>) => {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)
    const payload = await authService.verifyToken(token)

    if (!payload) {
      throw new HTTPException(401, { message: 'Invalid or expired token' })
    }

    // Add user info to context
    c.set('user', {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    })

    await next()
  }
}

// Role-based access control middleware
export function requireRole(requiredRole: 'admin' | 'manager' | 'user' | 'viewer') {
  const roleHierarchy = {
    'viewer': 0,
    'user': 1,
    'manager': 2,
    'admin': 3
  }

  return async (c: Context, next: () => Promise<void>) => {
    const user = c.get('user')
    if (!user) {
      throw new HTTPException(401, { message: 'Authentication required' })
    }

    const userRoleLevel = roleHierarchy[user.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      throw new HTTPException(403, { message: 'Insufficient permissions' })
    }

    await next()
  }
}

// Optional auth middleware (doesn't throw if no auth)
export function optionalAuth(authService: AuthService) {
  return async (c: Context, next: () => Promise<void>) => {
    const authHeader = c.req.header('Authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = await authService.verifyToken(token)

      if (payload) {
        c.set('user', {
          id: payload.sub,
          email: payload.email,
          role: payload.role
        })
      }
    }

    await next()
  }
}