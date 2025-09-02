'use client'

import React from 'react'
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function Analytics() {
  return (
    <DashboardLayout>
      <AnalyticsPage />
    </DashboardLayout>
  )
}
