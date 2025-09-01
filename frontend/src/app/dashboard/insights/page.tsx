/**
 * BiteBase Intelligence Insights Dashboard Page
 * Main page for the automated insights system
 */

'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { RealtimeInsightsDashboard } from '@/components/insights'

export default function InsightsDashboardPage() {
  return (
    <DashboardLayout>
      <RealtimeInsightsDashboard
        userId="current-user" // This would come from authentication context
        autoRefresh={true}
        refreshInterval={30000}
        showFilters={true}
        showMetrics={true}
        compact={false}
      />
    </DashboardLayout>
  )
}
