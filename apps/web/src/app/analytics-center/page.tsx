'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Database,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  Settings,
  Plus,
  Star,
  Target
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

export default function AnalyticsCenterPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const analyticsModules = [
    {
      id: 'sales',
      title: 'Sales Analytics',
      description: 'Track revenue, orders, and sales performance',
      icon: DollarSign,
      status: 'active',
      lastUpdated: '2 minutes ago',
      metrics: { value: '₿2.4M', change: '+12.5%' }
    },
    {
      id: 'customers',
      title: 'Customer Analytics',
      description: 'Analyze customer behavior and retention',
      icon: Users,
      status: 'active',
      lastUpdated: '5 minutes ago',
      metrics: { value: '15.2K', change: '+8.3%' }
    },
    {
      id: 'operations',
      title: 'Operations Analytics',
      description: 'Monitor operational efficiency and performance',
      icon: Activity,
      status: 'active',
      lastUpdated: '1 minute ago',
      metrics: { value: '94.2%', change: '+2.1%' }
    },
    {
      id: 'marketing',
      title: 'Marketing Analytics',
      description: 'Track campaigns and marketing ROI',
      icon: Target,
      status: 'pending',
      lastUpdated: '10 minutes ago',
      metrics: { value: '3.2x', change: '+15.7%' }
    }
  ]

  const recentReports = [
    {
      id: '1',
      title: 'Weekly Sales Summary',
      type: 'Sales',
      generatedAt: '2024-01-15 14:30',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: '2',
      title: 'Customer Behavior Analysis',
      type: 'Customer',
      generatedAt: '2024-01-15 12:15',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: '3',
      title: 'Marketing Campaign Performance',
      type: 'Marketing',
      generatedAt: '2024-01-15 09:45',
      status: 'processing',
      size: '3.1 MB'
    }
  ]

  const quickStats = [
    { label: 'Total Reports', value: '247', icon: BarChart3, color: 'text-blue-600' },
    { label: 'Active Dashboards', value: '12', icon: Database, color: 'text-green-600' },
    { label: 'Data Sources', value: '8', icon: Activity, color: 'text-purple-600' },
    { label: 'Users', value: '34', icon: Users, color: 'text-orange-600' }
  ]

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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Center</h1>
                <p className="text-gray-600">
                  Centralized analytics management and insights
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search analytics..." 
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/analytics">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500" asChild>
                <Link href="/analytics-workbench">
                  <Plus className="w-4 h-4 mr-2" />
                  New Dashboard
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-blue-500 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <stat.icon className={`h-6 w-6 text-white`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Analytics Modules */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Analytics Modules</span>
                  </CardTitle>
                  <CardDescription>
                    Manage and monitor your analytics dashboards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsModules.map((module, index) => (
                      <motion.div
                        key={module.id}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <module.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{module.title}</h4>
                              <p className="text-sm text-gray-600">{module.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Updated {module.lastUpdated}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{module.metrics.value}</p>
                              <p className="text-sm text-green-600">{module.metrics.change}</p>
                            </div>
                            <Badge 
                              variant={module.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {module.status}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/analytics">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/settings">
                                  <Settings className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Reports */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <span>Recent Reports</span>
                  </CardTitle>
                  <CardDescription>
                    Latest generated analytics reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{report.title}</h4>
                          <Badge 
                            variant={report.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>Type: {report.type}</p>
                          <p>Generated: {report.generatedAt}</p>
                          <p>Size: {report.size}</p>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button variant="outline" size="sm" className="text-xs" asChild>
                            <Link href={`/reports/${report.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs" asChild>
                            <Link href={`/reports/${report.id}`}>
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Link>
                          </Button>
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
