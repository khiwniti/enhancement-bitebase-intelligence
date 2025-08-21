'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { PriceIntelligenceDashboard } from '@/components/price/PriceIntelligenceDashboard'

export default function PriceIntelligencePage() {
  return (
    <DashboardLayout>
      <PriceIntelligenceDashboard />
    </DashboardLayout>
  )
}
