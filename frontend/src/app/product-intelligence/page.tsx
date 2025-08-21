'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { ProductIntelligenceDashboard } from '@/components/product/ProductIntelligenceDashboard'

export default function ProductIntelligencePage() {
  return (
    <DashboardLayout>
      <ProductIntelligenceDashboard />
    </DashboardLayout>
  )
}
