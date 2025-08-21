'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { PromotionIntelligenceDashboard } from '@/components/promotion/PromotionIntelligenceDashboard'

export default function PromotionIntelligencePage() {
  return (
    <DashboardLayout>
      <PromotionIntelligenceDashboard />
    </DashboardLayout>
  )
}
