/**
 * BiteBase Intelligence Insights Dashboard Page
 * Main page for the automated insights system
 */

'use client'

import React from 'react'
import { RealtimeInsightsDashboard } from '@/components/insights'

export default function InsightsDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <RealtimeInsightsDashboard
        userId="current-user" // This would come from authentication context
        autoRefresh={true}
        refreshInterval={30000}
        showFilters={true}
        showMetrics={true}
        compact={false}
      />
    </div>
  )
}