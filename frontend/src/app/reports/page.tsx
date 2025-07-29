'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Calendar,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  MapPin,
  Clock,
  Share2,
  Filter,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  FileDown
} from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: React.ReactNode
  estimatedTime: string
  popularity: number
}

interface ScheduledReport {
  id: string
  name: string
  schedule: string
  nextRun: string
  status: 'active' | 'paused'
  format: string
}

interface ReportHistory {
  id: string
  name: string
  generatedAt: string
  format: string
  size: string
  status: 'completed' | 'failed'
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('templates')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis Report',
      description: 'Comprehensive revenue trends, growth metrics, and financial performance analysis',
      category: 'Financial',
      icon: <TrendingUp className="w-6 h-6" />,
      estimatedTime: '5-10 min',
      popularity: 95
    },
    {
      id: 'customer-insights',
      name: 'Customer Insights Report',
      description: 'Customer behavior analysis, segmentation, and satisfaction metrics',
      category: 'Marketing',
      icon: <Users className="w-6 h-6" />,
      estimatedTime: '8-12 min',
      popularity: 88
    },
    {
      id: 'market-performance',
      name: 'Market Performance Report',
      description: 'Market share analysis, competitive positioning, and growth opportunities',
      category: 'Analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      estimatedTime: '10-15 min',
      popularity: 92
    },
    {
      id: 'location-intelligence',
      name: 'Location Intelligence Report',
      description: 'Geographic performance analysis, location-based insights, and expansion opportunities',
      category: 'Operations',
      icon: <MapPin className="w-6 h-6" />,
      estimatedTime: '7-10 min',
      popularity: 85
    },
    {
      id: 'operational-efficiency',
      name: 'Operational Efficiency Report',
      description: 'Delivery performance, operational metrics, and efficiency optimization insights',
      category: 'Operations',
      icon: <Settings className="w-6 h-6" />,
      estimatedTime: '6-8 min',
      popularity: 78
    },
    {
      id: 'competitive-analysis',
      name: 'Competitive Analysis Report',
      description: 'Competitor benchmarking, market positioning, and strategic recommendations',
      category: 'Analytics',
      icon: <PieChart className="w-6 h-6" />,
      estimatedTime: '12-18 min',
      popularity: 82
    }
  ]

  const scheduledReports: ScheduledReport[] = [
    {
      id: '1',
      name: 'Weekly Revenue Summary',
      schedule: 'Every Monday at 9:00 AM',
      nextRun: '2025-01-29 09:00',
      status: 'active',
      format: 'PDF'
    },
    {
      id: '2',
      name: 'Monthly Customer Analysis',
      schedule: 'First day of month at 8:00 AM',
      nextRun: '2025-02-01 08:00',
      status: 'active',
      format: 'Excel'
    },
    {
      id: '3',
      name: 'Daily Operations Report',
      schedule: 'Every day at 6:00 PM',
      nextRun: '2025-01-28 18:00',
      status: 'paused',
      format: 'PDF'
    }
  ]

  const reportHistory: ReportHistory[] = [
    {
      id: '1',
      name: 'Revenue Analysis Report - January 2025',
      generatedAt: '2025-01-27 14:30',
      format: 'PDF',
      size: '2.4 MB',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Customer Insights Report - Q4 2024',
      generatedAt: '2025-01-26 10:15',
      format: 'Excel',
      size: '1.8 MB',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Market Performance Report - December 2024',
      generatedAt: '2025-01-25 16:45',
      format: 'PDF',
      size: '3.1 MB',
      status: 'completed'
    },
    {
      id: '4',
      name: 'Location Intelligence Report - Bangkok',
      generatedAt: '2025-01-24 11:20',
      format: 'PowerPoint',
      size: '4.2 MB',
      status: 'failed'
    }
  ]

  const generateReport = async (templateId: string) => {
    setIsGenerating(true)
    setSelectedTemplate(templateId)

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000))

    setIsGenerating(false)
    setSelectedTemplate(null)

    // In a real implementation, this would trigger the actual report generation
    console.log(`Generating report for template: ${templateId}`)
  }

  const tabs = [
    { id: 'templates', label: 'Report Templates', icon: <FileText className="w-4 h-4" /> },
    { id: 'scheduled', label: 'Scheduled Reports', icon: <Calendar className="w-4 h-4" /> },
    { id: 'history', label: 'Report History', icon: <Clock className="w-4 h-4" /> },
    { id: 'builder', label: 'Custom Builder', icon: <Plus className="w-4 h-4" /> }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-600 mt-1">Generate and manage comprehensive business reports</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg hover:bg-white/90 transition-all duration-200">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg p-1">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Report Templates Tab */}
          {activeTab === 'templates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {reportTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                        {template.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{template.name}</h3>
                        <span className="text-sm text-slate-500">{template.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <span>{template.popularity}%</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {template.estimatedTime}
                    </span>
                    <button
                      onClick={() => generateReport(template.id)}
                      disabled={isGenerating && selectedTemplate === template.id}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {isGenerating && selectedTemplate === template.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Scheduled Reports Tab */}
          {activeTab === 'scheduled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Scheduled Reports</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  Schedule New Report
                </button>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Report Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Schedule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Run</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Format</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {scheduledReports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-slate-900">{report.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {report.schedule}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {report.nextRun}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {report.format}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-slate-400 hover:text-green-600 transition-colors">
                                {report.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              <button className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Report History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Report History</h2>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg hover:bg-white/90 transition-all duration-200">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg hover:bg-white/90 transition-all duration-200">
                    <Download className="w-4 h-4" />
                    Export All
                  </button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Report Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Generated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Format</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {reportHistory.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{report.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {report.generatedAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {report.format}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {report.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-slate-400 hover:text-green-600 transition-colors">
                                <FileDown className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-slate-400 hover:text-purple-600 transition-colors">
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Custom Builder Tab */}
          {activeTab === 'builder' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Plus className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Custom Report Builder</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Create custom reports with drag-and-drop interface, advanced filtering, and personalized layouts
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                    <Plus className="w-5 h-5" />
                    Start Building
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg hover:bg-white/90 transition-all duration-200">
                    <FileText className="w-5 h-5" />
                    Use Template
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">24</div>
                  <div className="text-sm text-slate-600">Total Reports</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">8</div>
                  <div className="text-sm text-slate-600">This Month</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">3</div>
                  <div className="text-sm text-slate-600">Scheduled</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-2">7.2m</div>
                  <div className="text-sm text-slate-600">Avg. Generation</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
