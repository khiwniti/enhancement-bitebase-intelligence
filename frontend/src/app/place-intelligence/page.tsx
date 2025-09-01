import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { PlaceIntelligenceDashboard } from '@/components/place/PlaceIntelligenceDashboard'

export default function PlaceIntelligencePage() {
  return (
    <DashboardLayout>
      <PlaceIntelligenceDashboard />
    </DashboardLayout>
  )
}
