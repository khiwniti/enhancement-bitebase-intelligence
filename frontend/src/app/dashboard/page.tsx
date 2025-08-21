'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your BiteBase Intelligence dashboard
          </p>
        </div>
        <EnhancedDashboard />
      </div>
    </DashboardLayout>
  )
}