'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { GrowthIntelligenceStudio } from '@/components/growth/GrowthIntelligenceStudio'

export default function GrowthIntelligenceStudioPage() {
  return (
    <DashboardLayout>
      <GrowthIntelligenceStudio />
    </DashboardLayout>
  )
}
