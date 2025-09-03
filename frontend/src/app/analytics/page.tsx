'use client'

import React from 'react'
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function Analytics() {
  return (
    <DashboardLayout>
      <AnalyticsPage />
    </DashboardLayout>
  )
}
