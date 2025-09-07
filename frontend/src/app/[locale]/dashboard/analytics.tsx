'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import AnalyticsDashboard from '@/components/dashboard/analytics-dashboard'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </DashboardLayout>
  )
}