'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage'

export default function Analytics() {
  return (
    <DashboardLayout>
      <AnalyticsPage />
    </DashboardLayout>
  )
}
