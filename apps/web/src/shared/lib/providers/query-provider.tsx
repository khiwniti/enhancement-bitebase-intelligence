'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

// Query client configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 5 minutes
        staleTime: 5 * 60 * 1000,
        // Cache time: 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus in production
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        // Don't refetch on reconnect by default
        refetchOnReconnect: false,
        // Don't refetch on mount if data exists and is not stale
        refetchOnMount: false,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        // Retry delay: 1 second
        retryDelay: 1000,
      },
    },
  })
}

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client instance (only once per app lifecycle)
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  )
}

// Query keys for consistent caching
export const queryKeys = {
  // Auth queries
  auth: {
    profile: ['auth', 'profile'] as const,
    permissions: ['auth', 'permissions'] as const,
  },
  
  // Dashboard queries
  dashboards: {
    all: ['dashboards'] as const,
    list: (params?: any) => ['dashboards', 'list', params] as const,
    detail: (id: string) => ['dashboards', 'detail', id] as const,
    widgets: (dashboardId: string) => ['dashboards', dashboardId, 'widgets'] as const,
  },
  
  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    metrics: (params?: any) => ['analytics', 'metrics', params] as const,
    chart: (chartId: string, params?: any) => ['analytics', 'chart', chartId, params] as const,
    insights: (params?: any) => ['analytics', 'insights', params] as const,
    reports: (params?: any) => ['analytics', 'reports', params] as const,
  },
  
  // Natural Language Query
  nlQuery: {
    all: ['nl-query'] as const,
    suggestions: (query: string) => ['nl-query', 'suggestions', query] as const,
    history: (limit?: number) => ['nl-query', 'history', limit] as const,
  },
  
  // Insights queries
  insights: {
    all: ['insights'] as const,
    list: (params?: any) => ['insights', 'list', params] as const,
    detail: (id: string) => ['insights', 'detail', id] as const,
    metrics: ['insights', 'metrics'] as const,
  },
  
  // Notifications queries
  notifications: {
    all: ['notifications'] as const,
    list: (params?: any) => ['notifications', 'list', params] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  
  // Settings queries
  settings: {
    all: ['settings'] as const,
    profile: ['settings', 'profile'] as const,
    integrations: ['settings', 'integrations'] as const,
  },
  
  // Location queries
  locations: {
    all: ['locations'] as const,
    list: (params?: any) => ['locations', 'list', params] as const,
    detail: (id: string) => ['locations', 'detail', id] as const,
    analytics: (id: string, params?: any) => ['locations', id, 'analytics', params] as const,
  },
}

// Mutation keys for consistent invalidation
export const mutationKeys = {
  // Auth mutations
  auth: {
    login: ['auth', 'login'] as const,
    logout: ['auth', 'logout'] as const,
    signup: ['auth', 'signup'] as const,
    updateProfile: ['auth', 'update-profile'] as const,
  },
  
  // Dashboard mutations
  dashboards: {
    create: ['dashboards', 'create'] as const,
    update: ['dashboards', 'update'] as const,
    delete: ['dashboards', 'delete'] as const,
    duplicate: ['dashboards', 'duplicate'] as const,
  },
  
  // Analytics mutations
  analytics: {
    executeQuery: ['analytics', 'execute-query'] as const,
    generateReport: ['analytics', 'generate-report'] as const,
    exportData: ['analytics', 'export-data'] as const,
  },
  
  // Natural Language Query mutations
  nlQuery: {
    processQuery: ['nl-query', 'process'] as const,
    saveQuery: ['nl-query', 'save'] as const,
  },
  
  // Insights mutations
  insights: {
    acknowledge: ['insights', 'acknowledge'] as const,
    dismiss: ['insights', 'dismiss'] as const,
    generate: ['insights', 'generate'] as const,
  },
  
  // Notifications mutations
  notifications: {
    markAsRead: ['notifications', 'mark-as-read'] as const,
    markAllAsRead: ['notifications', 'mark-all-as-read'] as const,
    delete: ['notifications', 'delete'] as const,
  },
  
  // Settings mutations
  settings: {
    update: ['settings', 'update'] as const,
    updateIntegration: ['settings', 'update-integration'] as const,
  },
}

// Helper function to invalidate related queries
export const invalidateQueries = {
  auth: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile })
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.permissions })
  },
  
  dashboards: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboards.all })
  },
  
  analytics: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
  },
  
  insights: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.insights.all })
  },
  
  notifications: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
  },
  
  settings: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.all })
  },
}
