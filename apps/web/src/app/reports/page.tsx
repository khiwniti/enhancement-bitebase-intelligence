'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Share,
  Clock,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Target,
  RefreshCw,
  Settings
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import Link from 'next/link'

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateRange, setDateRange] = useState('last-30-days')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const reportCategories = [
    { id: 'all', name: 'All Reports', count: 24 },
    { id: 'sales', name: 'Sales', count: 8 },
    { id: 'operations', name: 'Operations', count: 6 },
    { id: 'customer', name: 'Customer', count: 5 },
    { id: 'financial', name: 'Financial', count: 5 }
  ]

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/v1/reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Mock reports data as fallback (keeping for reference)
  const mockReports = [
    {
      id: '1',
      title: 'Monthly Sales Performance',
      description: 'Comprehensive sales analysis for January 2024',
      category: 'sales',
      type: 'Automated',
      status: 'completed',
      generatedAt: '2024-01-31 23:59',
      size: '2.4 MB',
      format: 'PDF',
      downloads: 45,
      author: 'System',
      schedule: 'Monthly'
    },
    {
      id: '2',
      title: 'Customer Behavior Analysis',
      description: 'Deep dive into customer patterns and preferences',
      category: 'customer',
      type: 'Custom',
      status: 'completed',
      generatedAt: '2024-01-30 14:30',
      size: '1.8 MB',
      format: 'Excel',
      downloads: 23,
      author: 'Analytics Team',
      schedule: 'On-demand'
    },
    {
      id: '3',
      title: 'Operational Efficiency Report',
      description: 'Kitchen performance and service metrics',
      category: 'operations',
      type: 'Automated',
      status: 'processing',
      generatedAt: '2024-01-31 18:45',
      size: '3.1 MB',
      format: 'PDF',
      downloads: 0,
      author: 'System',
      schedule: 'Weekly'
    },
    {
      id: '4',
      title: 'Financial Summary Q4 2023',
      description: 'Quarterly financial performance and projections',
      category: 'financial',
      type: 'Custom',
      status: 'completed',
      generatedAt: '2024-01-15 09:00',
      size: '4.2 MB',
      format: 'PDF',
      downloads: 67,
      author: 'Finance Team',
      schedule: 'Quarterly'
    },
    {
      id: '5',
      title: 'Location Performance Comparison',
      description: 'Multi-location analysis and benchmarking',
      category: 'operations',
      type: 'Automated',
      status: 'scheduled',
      generatedAt: '2024-02-01 08:00',
      size: 'TBD',
      format: 'Excel',
      downloads: 0,
      author: 'System',
      schedule: 'Bi-weekly'
    },
    {
      id: '6',
      title: 'Marketing Campaign ROI',
      description: 'Campaign effectiveness and return on investment',
      category: 'sales',
      type: 'Custom',
      status: 'completed',
      generatedAt: '2024-01-28 16:20',
      size: '1.5 MB',
      format: 'PowerPoint',
      downloads: 34,
      author: 'Marketing Team',
      schedule: 'Monthly'
    }
  ]

  const reportStats = [
    {
      title: 'Total Reports',
      value: '247',
      change: '+12 this month',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Automated Reports',
      value: '156',
      change: '63% automated',
      icon: RefreshCw,
      color: 'text-green-600'
    },
    {
      title: 'Downloads',
      value: '1,234',
      change: '+23% this month',
      icon: Download,
      color: 'text-purple-600'
    },
    {
      title: 'Scheduled',
      value: '18',
      change: 'Next 7 days',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-700">Scheduled</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Automated':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Automated</Badge>
      case 'Custom':
        return <Badge variant="outline" className="text-purple-600 border-purple-200">Custom</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(report => report.category === selectedCategory)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600">
                  Generate, manage, and analyze business reports
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search reports..." 
                  className="pl-10 w-64"
                />
              </div>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-90-days">Last 90 days</option>
                <option value="last-year">Last year</option>
              </select>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500">
                <Plus className="w-4 h-4 mr-2" />
                New Report
              </Button>
            </div>
          </motion.div>

          {/* Report Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {reportStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-indigo-500 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCategory === category.id
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium text-sm">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reports List */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-indigo-500" />
                      <span>Reports ({filteredReports.length})</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{report.title}</h4>
                              {getStatusBadge(report.status)}
                              {getTypeBadge(report.type)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{report.generatedAt}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>{report.format}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Download className="h-3 w-3" />
                                <span>{report.size}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {report.status === 'completed' ? (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/reports/${report.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {report.status === 'completed' ? (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/reports/${report.id}`}>
                                  <Download className="h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {report.status === 'completed' ? (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/reports/${report.id}`}>
                                  <Share className="h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <Share className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500">Author</p>
                            <p className="font-medium text-sm">{report.author}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Schedule</p>
                            <p className="font-medium text-sm">{report.schedule}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Downloads</p>
                            <p className="font-medium text-sm">{report.downloads}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
