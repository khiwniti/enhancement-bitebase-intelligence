'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { AIResearchAgentMVP } from '@/components/ai/AIResearchAgentMVP'

export default function AIResearchAgentPage() {
  return (
    <DashboardLayout>
      <AIResearchAgentMVP />
    </DashboardLayout>
  )
}
