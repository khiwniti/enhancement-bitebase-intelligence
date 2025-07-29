'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AlertCircle, Lock } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  requireAllRoles?: boolean
  fallback?: React.ReactNode
}

export function RoleGuard({ 
  children, 
  allowedRoles = [], 
  requireAllRoles = false,
  fallback 
}: RoleGuardProps) {
  const { user } = useAuth()

  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    return <>{children}</>
  }

  // If user is not authenticated, don't render
  if (!user) {
    return null
  }

  const userRole = user.role || 'user'
  const userRoles = Array.isArray(userRole) ? userRole : [userRole]

  const hasAccess = requireAllRoles
    ? allowedRoles.every(role => userRoles.includes(role))
    : allowedRoles.some(role => userRoles.includes(role))

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Restricted</h3>
          <p className="text-slate-600 mb-4">
            You don't have permission to access this feature. Please contact your administrator if you believe this is an error.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-700">
              <p className="font-medium">Required roles:</p>
              <p>{allowedRoles.join(', ')}</p>
              <p className="mt-1">Your role: {userRole}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component for easier usage
export function withRoles<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[],
  options?: { requireAllRoles?: boolean; fallback?: React.ReactNode }
) {
  return function RoleProtectedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} {...options}>
        <Component {...props} />
      </RoleGuard>
    )
  }
}

// Common role constants
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANALYST: 'analyst',
  USER: 'user',
  VIEWER: 'viewer'
} as const

// Common role groups
export const ROLE_GROUPS = {
  ADMIN_ONLY: [ROLES.ADMIN],
  MANAGEMENT: [ROLES.ADMIN, ROLES.MANAGER],
  ANALYSTS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST],
  ALL_USERS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.USER],
  VIEWERS_AND_UP: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.USER, ROLES.VIEWER]
} as const
