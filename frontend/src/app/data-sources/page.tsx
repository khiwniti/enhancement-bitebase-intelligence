'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DataSourcesPage } from '@/components/connectors/DataSourcesPage'

export default function DataSources() {
  return (
    <DashboardLayout>
      <DataSourcesPage />
    </DashboardLayout>
  )
}
