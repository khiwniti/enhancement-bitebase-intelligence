'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage'

export default function Analytics() {
  return (
    <DashboardLayout>
      <AnalyticsPage />
    </DashboardLayout>
  )
}
