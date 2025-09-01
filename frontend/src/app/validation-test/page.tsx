'use client'

import React, { useState } from 'react'
import { AnalyticsWorkbench } from '@/components/analytics/AnalyticsWorkbench'
import { GrowthIntelligenceStudio } from '@/components/growth/GrowthIntelligenceStudio'
import { RoleBasedOnboarding } from '@/components/onboarding/RoleBasedOnboarding'
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard'
import { AIResearchAgentMVP } from '@/components/ai/AIResearchAgentMVP'

type TestView = 'analytics' | 'growth' | 'onboarding' | 'dashboard' | 'ai-research'

export default function ValidationTestPage() {
  const [currentView, setCurrentView] = useState<TestView>('onboarding')

  const renderCurrentView = () => {
    switch (currentView) {
      case 'analytics':
        return <AnalyticsWorkbench />
      case 'growth':
        return <GrowthIntelligenceStudio />
      case 'onboarding':
        return <RoleBasedOnboarding 
          onComplete={(role, preferences) => {
            console.log('Onboarding completed:', { role, preferences })
            setCurrentView('dashboard')
          }}
          onSkip={() => {
            console.log('Onboarding skipped')
            setCurrentView('dashboard')
          }}
        />
      case 'dashboard':
        return <RoleBasedDashboard userRole="restaurant-owner" userName="Test User" />
      case 'ai-research':
        return <AIResearchAgentMVP />
      default:
        return <div>Select a view to test</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Validation Testing - Consolidated Navigation & Role-Based Flows
          </h1>
          <nav className="flex gap-4">
            <button
              onClick={() => setCurrentView('onboarding')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'onboarding'
                  ? 'bg-[#74C365] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Role-Based Onboarding
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[#74C365] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Role-Based Dashboard
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'analytics'
                  ? 'bg-[#74C365] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Analytics Workbench
            </button>
            <button
              onClick={() => setCurrentView('growth')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'growth'
                  ? 'bg-[#74C365] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Growth Intelligence Studio
            </button>
            <button
              onClick={() => setCurrentView('ai-research')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'ai-research'
                  ? 'bg-[#74C365] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AI Research Agent MVP
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {renderCurrentView()}
      </div>

      {/* Validation Status */}
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Validation Status</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Components Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Navigation Consolidated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Role-Based UI Implemented</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>TypeScript Compilation (Issues)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Manual Testing Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}