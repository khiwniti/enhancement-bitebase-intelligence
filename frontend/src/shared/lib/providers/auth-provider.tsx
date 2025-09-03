'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, AuthState, LoginCredentials, SignupData } from '@/shared/types'
import { authApi } from '@/lib/api-client'

// Auth Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Component
interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Verify token and get user profile
      const response = await authApi.getProfile()
      if (response.success && response.data) {
        setState({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        // Invalid token, clear it
        localStorage.removeItem('auth_token')
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      }
    } catch (error: any) {
      // Token is invalid or expired
      localStorage.removeItem('auth_token')
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await authApi.login(credentials)
      if (response.success && response.data) {
        const { user, token } = response.data

        // Store token
        localStorage.setItem('auth_token', token)
        
        // Remember user if requested
        if (credentials.rememberMe) {
          localStorage.setItem('remember_user', 'true')
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }))
      throw error
    }
  }

  // Signup function
  const signup = async (data: SignupData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await authApi.signup(data)
      if (response.success && response.data) {
        const { user, token } = response.data

        // Store token
        localStorage.setItem('auth_token', token)

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error(response.message || 'Signup failed')
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Signup failed',
      }))
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await authApi.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('remember_user')

      // Reset state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })

      // Redirect to login
      router.push('/auth/login')
    }
  }

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await authApi.updateProfile(data)
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          user: response.data,
          isLoading: false,
          error: null,
        }))
      } else {
        throw new Error(response.message || 'Profile update failed')
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Profile update failed',
      }))
      throw error
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken()
      if (response.success && response.data) {
        const { token } = response.data
        localStorage.setItem('auth_token', token)
      }
    } catch (error) {
      // If refresh fails, logout user
      await logout()
    }
  }

  // Clear error function
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!state.isAuthenticated) return

    // Refresh token every 50 minutes (assuming 1-hour expiration)
    const interval = setInterval(() => {
      refreshToken()
    }, 50 * 60 * 1000)

    return () => clearInterval(interval)
  }, [state.isAuthenticated])

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    updateProfile,
    refreshToken,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
