'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { LocationIntelligencePage } from '@/components/location/LocationIntelligencePage'

export default function LocationIntelligence() {
  return (
    <DashboardLayout>
      <LocationIntelligencePage />
    </DashboardLayout>
  )
}
