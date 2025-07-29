'use client'

import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard'

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-primary font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground font-secondary">
            Welcome to your BiteBase Intelligence dashboard
          </p>
        </div>
        <EnhancedDashboard />
      </div>
    </MainLayout>
  )
}