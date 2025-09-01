'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { AnalyticsWorkbench } from '@/components/analytics/AnalyticsWorkbench'

export default function AnalyticsWorkbenchPage() {
  return (
    <DashboardLayout>
      <AnalyticsWorkbench />
    </DashboardLayout>
  )
}
