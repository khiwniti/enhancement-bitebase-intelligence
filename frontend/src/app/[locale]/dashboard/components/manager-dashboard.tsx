'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

// Enhanced Manager Dashboard - Command Center for Restaurant Operations
export default function ManagerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Update every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/operations/dashboard/rest_001')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        setAlerts(data.critical_alerts || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading command center...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Time & Status */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manager Command Center</h1>
            <p className="text-slate-300">Live operational oversight and control</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-white">
              {new Date().toLocaleTimeString()}
            </div>
            <div className="text-slate-300">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 bg-red-900/20 border border-red-700/50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-300 mb-4 flex items-center">
              <span className="mr-2">🚨</span>
              Critical Alerts
            </h2>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="bg-red-900/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-red-200">{alert.message}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      alert.type === 'warning' ? 'bg-yellow-900 text-yellow-200' : 'bg-red-900 text-red-200'
                    }`}>
                      {alert.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live KPIs Grid */}
        {dashboardData?.live_kpis && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Live Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-300 text-sm font-medium mb-2">Labor Cost %</h3>
                <div className={`text-4xl font-bold mb-2 ${
                  dashboardData.live_kpis.labor_cost_percentage > 35 ? 'text-red-400' : 
                  dashboardData.live_kpis.labor_cost_percentage > 30 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {dashboardData.live_kpis.labor_cost_percentage}%
                </div>
                <div className="text-slate-400 text-sm">
                  Target: 33%
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-300 text-sm font-medium mb-2">Sales Pace</h3>
                <div className={`text-4xl font-bold mb-2 ${
                  dashboardData.live_kpis.sales_vs_forecast >= 95 ? 'text-green-400' : 
                  dashboardData.live_kpis.sales_vs_forecast >= 80 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {dashboardData.live_kpis.sales_vs_forecast}%
                </div>
                <div className="text-slate-400 text-sm">
                  ${dashboardData.live_kpis.total_sales_today.toLocaleString()} / ${dashboardData.live_kpis.forecasted_sales.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-300 text-sm font-medium mb-2">Current Covers</h3>
                <div className="text-4xl font-bold mb-2 text-blue-400">
                  {dashboardData.live_kpis.current_covers}
                </div>
                <div className="text-slate-400 text-sm">
                  Forecast: {dashboardData.live_kpis.forecasted_covers}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <h3 className="text-slate-300 text-sm font-medium mb-2">Avg Ticket Time</h3>
                <div className={`text-4xl font-bold mb-2 ${
                  (dashboardData.live_kpis.kitchen_ticket_time || 0) > 15 ? 'text-red-400' : 
                  (dashboardData.live_kpis.kitchen_ticket_time || 0) > 12 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {dashboardData.live_kpis.kitchen_ticket_time || 0}m
                </div>
                <div className="text-slate-400 text-sm">
                  Target: &lt; 12m
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operational Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Shift Progress */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Shift Readiness</h3>
            
            {dashboardData?.checklist_progress?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.checklist_progress.map((progress: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium capitalize">
                        {progress.phase.replace('_', ' ')}
                      </span>
                      <span className="text-slate-300">
                        {progress.completion}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          progress.completion === 100 ? 'bg-green-500' :
                          progress.completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${progress.completion}%` }}
                      ></div>
                    </div>
                    <div className="text-slate-400 text-sm mt-1">
                      {progress.total_tasks} total tasks
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">No active checklists</p>
                <Link 
                  href="/operations"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-block"
                >
                  Assign Checklists
                </Link>
              </div>
            )}
          </div>

          {/* Team Communications */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Team Communications</h3>
            
            <div className="space-y-3 mb-4">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-300 text-sm">Kitchen → FOH • 2m ago</div>
                <div className="text-white">Prime rib special is ready to push</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-300 text-sm">Server → Kitchen • 5m ago</div>
                <div className="text-white">Table 8 has severe nut allergy</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-300 text-sm">Manager → All • 15m ago</div>
                <div className="text-white">Pre-shift meeting in 15 minutes</div>
              </div>
            </div>

            <Link 
              href="/operations"
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors block text-center"
            >
              View All Communications
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-left">
                <div className="font-medium">📋 Assign Opening Checklist</div>
                <div className="text-sm text-blue-200">Get team ready for service</div>
              </button>
              
              <button className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-left">
                <div className="font-medium">📊 Generate Live Report</div>
                <div className="text-sm text-green-200">Current shift performance</div>
              </button>
              
              <button className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-left">
                <div className="font-medium">🔔 Send Team Alert</div>
                <div className="text-sm text-orange-200">Broadcast to all staff</div>
              </button>
              
              <Link 
                href="/operations"
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors block"
              >
                <div className="font-medium">🎛️ Full Operations Center</div>
                <div className="text-sm text-purple-200">Complete operational control</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        {dashboardData?.shift_summary && (
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Today's Shift Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {dashboardData.shift_summary.covers_served}
                </div>
                <div className="text-slate-300">Covers Served</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {dashboardData.shift_summary.avg_ticket_time}m
                </div>
                <div className="text-slate-300">Avg Ticket Time</div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  dashboardData.shift_summary.sales_pace === 'On Track' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {dashboardData.shift_summary.sales_pace}
                </div>
                <div className="text-slate-300">Sales Pace</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {dashboardData.recent_communications}
                </div>
                <div className="text-slate-300">Team Messages</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}