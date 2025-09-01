// Enhanced Dashboard Builder Page
// BiteBase Intelligence 2.0 - Interactive Dashboard Builder

'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { EnhancedDashboardBuilder } from '@/components/dashboard'

// Create a query client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

export default function DashboardBuilderPage() {
  const handleDashboardChange = (dashboard: Record<string, unknown>) => {
    console.log('Dashboard changed:', dashboard)
    // You can add analytics tracking here
  }

  const handleExport = (data: Blob, format: string) => {
    console.log(`Dashboard exported as ${format}:`, data)
    // You can add export analytics here
  }

  const handleShare = (result: { shareUrl?: string }) => {
    console.log('Dashboard shared:', result)
    // You can add sharing analytics here

    // Show success message or copy link to clipboard
    if (result.shareUrl) {
      navigator.clipboard.writeText(result.shareUrl).then(() => {
        // Show toast notification
        console.log('Share URL copied to clipboard')
      })
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <EnhancedDashboardBuilder
          dashboardId="default-dashboard"
          onDashboardChange={handleDashboardChange}
          onExport={handleExport}
          onShare={handleShare}
          className="h-full"
        />
      </DashboardLayout>
    </QueryClientProvider>
  )
}
