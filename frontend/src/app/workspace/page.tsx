'use client'

import React from 'react'
import WorkspaceLayout from '@/components/layout/WorkspaceLayout'
import WorkspacePortal from '@/components/workspace/WorkspacePortal'

export default function WorkspacePage() {
  return (
    <WorkspaceLayout>
      <WorkspacePortal />
    </WorkspaceLayout>
  )
}