'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import EnterpriseSecurityDashboard from "@/components/security/EnterpriseSecurityDashboard"

export default function SecurityPage() {
  return (
    <DashboardLayout>
      <EnterpriseSecurityDashboard />
    </DashboardLayout>
  )
}
