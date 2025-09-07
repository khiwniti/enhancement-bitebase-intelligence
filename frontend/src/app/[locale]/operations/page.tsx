'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

// Operational Dashboard - The Heart of BiteBase Operations
export default function OperationsPage() {
  const params = useParams()
  const locale = params.locale as string
  const [liveKPIs, setLiveKPIs] = useState<any>(null)
  const [checklists, setChecklists] = useState<any[]>([])
  const [communications, setCommunications] = useState<any[]>([])

  useEffect(() => {
    // Fetch live operational data
    fetchOperationalData()
    // Set up real-time updates
    const interval = setInterval(fetchOperationalData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchOperationalData = async () => {
    try {
      // Live KPIs
      const kpiResponse = await fetch('http://localhost:8000/api/v1/operations/kpis/live/rest_001')
      if (kpiResponse.ok) {
        const kpiData = await kpiResponse.json()
        setLiveKPIs(kpiData)
      }

      // Dashboard data
      const dashboardResponse = await fetch('http://localhost:8000/api/v1/operations/dashboard/rest_001')
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        setChecklists(dashboardData.checklist_progress || [])
      }

      // Communications
      const commResponse = await fetch('http://localhost:8000/api/v1/operations/communications/rest_001')
      if (commResponse.ok) {
        const commData = await commResponse.json()
        setCommunications(commData)
      }
    } catch (error) {
      console.error('Error fetching operational data:', error)
    }
  }

  const assignChecklist = async (userId: string, phase: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/operations/checklists/assign?restaurant_id=rest_001&user_id=${userId}&shift_phase=${phase}`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchOperationalData() // Refresh data
      }
    } catch (error) {
      console.error('Error assigning checklist:', error)
    }
  }

  const sendCommunication = async (message: string, priority: string = 'normal') => {
    try {
      await fetch('http://localhost:8000/api/v1/operations/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: 'manager_001',
          sender_role: 'manager',
          recipient_role: 'chef',
          message_type: 'operational',
          content: message,
          priority
        })
      })
      fetchOperationalData() // Refresh communications
    } catch (error) {
      console.error('Error sending communication:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            BiteBase Operations Command Center
          </h1>
          <p className="text-slate-300">Real-time operational control and team coordination</p>
        </div>

        {/* Live KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {liveKPIs && (
            <>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-300 text-sm font-medium mb-2">Labor Cost %</h3>
                <div className={`text-3xl font-bold ${
                  liveKPIs.labor_cost_percentage > 35 ? 'text-red-400' : 
                  liveKPIs.labor_cost_percentage > 30 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {liveKPIs.labor_cost_percentage}%
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-300 text-sm font-medium mb-2">Sales vs Forecast</h3>
                <div className={`text-3xl font-bold ${
                  liveKPIs.sales_vs_forecast >= 95 ? 'text-green-400' : 
                  liveKPIs.sales_vs_forecast >= 80 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {liveKPIs.sales_vs_forecast}%
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-300 text-sm font-medium mb-2">Current Covers</h3>
                <div className="text-3xl font-bold text-blue-400">
                  {liveKPIs.current_covers}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-300 text-sm font-medium mb-2">Kitchen Ticket Time</h3>
                <div className={`text-3xl font-bold ${
                  (liveKPIs.kitchen_ticket_time || 0) > 15 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {liveKPIs.kitchen_ticket_time || 0}m
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checklist Management */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Shift Management</h2>
            
            <div className="space-y-4 mb-6">
              {checklists.length > 0 ? checklists.map((checklist, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-medium capitalize">
                      {checklist.phase.replace('_', ' ')} Checklist
                    </h3>
                    <span className="text-slate-300">
                      {checklist.completion}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${checklist.completion}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400">No active checklists</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium mb-3">Assign New Checklists:</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => assignChecklist('user_001', 'pre_opening')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Pre-Opening
                </button>
                <button 
                  onClick={() => assignChecklist('user_002', 'service')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Service
                </button>
                <button 
                  onClick={() => assignChecklist('user_003', 'closing')}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Closing
                </button>
              </div>
            </div>
          </div>

          {/* FOH/BOH Communication */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Team Communication</h2>
            
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {communications.slice(-5).map((comm, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-slate-300 capitalize">
                      {comm.sender_role} → {comm.recipient_role}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(comm.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white text-sm">{comm.content}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Send message to kitchen..."
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendCommunication((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Send
                </button>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => sendCommunication('URGENT: Special dietary request at Table 12', 'high')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Allergy Alert
                </button>
                <button 
                  onClick={() => sendCommunication('86 the salmon special - running low', 'high')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  86 Item
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items Row */}
        <div className="mt-8 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Critical Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-white font-medium">Inventory Alerts</h3>
              <div className="space-y-2">
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-red-300">Prime Rib</span>
                    <span className="text-red-400 font-bold">2 left</span>
                  </div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-yellow-300">Salmon</span>
                    <span className="text-yellow-400 font-bold">8 left</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Staff Status</h3>
              <div className="space-y-2">
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                  <span className="text-green-300">All staff clocked in</span>
                </div>
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                  <span className="text-blue-300">Pre-shift meeting at 4:30 PM</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-medium">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Start Pre-Shift Meeting
                </button>
                <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  Generate End-of-Day Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}