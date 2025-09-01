'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/AppLayout'
import {
  BarChart3,
  TrendingUp,
  Activity,
  FileText,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  Settings,
  Star,
  Target,
  Download,
  Eye,
  PieChart,
  Filter,
  MessageSquare,
  Zap
} from 'lucide-react'

interface AnalyticsTool {
  id: string
  name: string
  description: string
  href: string
  icon: React.ComponentType<any>
  category: 'real-time' | 'historical' | 'predictive' | 'custom'
  features: string[]
  color: string
  stats?: {
    label: string
    value: string
  }
}

const analyticsTools: AnalyticsTool[] = [
  {
    id: 'real-time-analytics',
    name: 'Real-time Analytics',
    description: 'Live performance metrics and instant insights as they happen',
    href: '/analytics',
    icon: Activity,
    category: 'real-time',
    color: 'from-green-500 to-emerald-500',
    features: [
      'Live sales tracking',
      'Real-time customer flow',
      'Instant alerts',
      'Live dashboard updates'
    ],
    stats: { label: 'Updates per minute', value: '120' }
  },
  {
    id: 'integrated-analytics',
    name: 'Integrated Analytics',
    description: 'Comprehensive business intelligence with unified data views',
    href: '/analytics/integrated',
    icon: BarChart3,
    category: 'historical',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Multi-source data',
      'Custom dashboards',
      'Advanced filtering',
      'Export capabilities'
    ],
    stats: { label: 'Data sources', value: '12' }
  },
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    description: 'AI-powered forecasting and trend analysis for strategic planning',
    href: '/analytics/predictive',
    icon: TrendingUp,
    category: 'predictive',
    color: 'from-purple-500 to-pink-500',
    features: [
      'Sales forecasting',
      'Demand prediction',
      'Trend analysis',
      'Risk assessment'
    ],
    stats: { label: 'Forecast accuracy', value: '94%' }
  },
  {
    id: 'custom-reports',
    name: 'Custom Reports',
    description: 'Build and schedule automated reports tailored to your needs',
    href: '/reports',
    icon: FileText,
    category: 'custom',
    color: 'from-orange-500 to-red-500',
    features: [
      'Drag & drop builder',
      'Scheduled delivery',
      'Multiple formats',
      'White-label options'
    ],
    stats: { label: 'Reports created', value: '847' }
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'Key performance indicators and business health monitoring',
    href: '/analytics/performance',
    icon: Target,
    category: 'real-time',
    color: 'from-indigo-500 to-purple-500',
    features: [
      'KPI tracking',
      'Benchmarking',
      'Goal monitoring',
      'Performance alerts'
    ],
    stats: { label: 'KPIs tracked', value: '45' }
  },
  {
    id: 'customer-analytics',
    name: 'Customer Analytics',
    description: 'Deep insights into customer behavior and preferences',
    href: '/analytics/customers',
    icon: Users,
    category: 'historical',
    color: 'from-teal-500 to-blue-500',
    features: [
      'Customer segmentation',
      'Behavior analysis',
      'Lifetime value',
      'Churn prediction'
    ],
    stats: { label: 'Customer segments', value: '8' }
  }
]

const recentReports = [
  {
    id: 1,
    name: 'Weekly Sales Summary',
    type: 'Automated',
    status: 'completed',
    date: '2 hours ago',
    icon: BarChart3,
    color: 'text-green-500'
  },
  {
    id: 2,
    name: 'Customer Satisfaction Analysis',
    type: 'Custom',
    status: 'in-progress',
    date: '4 hours ago',
    icon: Users,
    color: 'text-blue-500'
  },
  {
    id: 3,
    name: 'Monthly Financial Report',
    type: 'Scheduled',
    status: 'pending',
    date: '6 hours ago',
    icon: DollarSign,
    color: 'text-orange-500'
  }
]

const quickStats = [
  { label: 'Total Revenue', value: '$47,293', change: '+12.5%', trend: 'up', icon: DollarSign },
  { label: 'Orders Today', value: '156', change: '+8.2%', trend: 'up', icon: BarChart3 },
  { label: 'Avg Order Value', value: '$24.50', change: '-2.1%', trend: 'down', icon: TrendingUp },
  { label: 'Customer Satisfaction', value: '4.8/5', change: '+0.3', trend: 'up', icon: Star }
]

export default function AnalyticsCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredTools = selectedCategory === 'all' 
    ? analyticsTools 
    : analyticsTools.filter(tool => tool.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All Tools', icon: BarChart3 },
    { id: 'real-time', name: 'Real-time', icon: Activity },
    { id: 'historical', name: 'Historical', icon: Calendar },
    { id: 'predictive', name: 'Predictive', icon: TrendingUp },
    { id: 'custom', name: 'Custom', icon: Settings }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Center</h1>
                <p className="text-gray-600">Transform your data into actionable business insights</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                <Eye className="h-4 w-4 mr-2" />
                View Live Dashboard
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                      <div className={`text-xs flex items-center mt-1 ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                        {stat.change}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <stat.icon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 border border-green-200'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Recent Reports */}
              <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-green-500 mr-2" />
                  Recent Reports
                </h3>
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <report.icon className={`h-4 w-4 ${report.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {report.type} • {report.status}
                        </div>
                        <div className="text-xs text-gray-500">{report.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Reports
                </Button>
              </Card>
            </motion.div>
          </div>

          {/* Analytics Tools Grid */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCategory === 'all' ? 'All Analytics Tools' : `${categories.find(c => c.id === selectedCategory)?.name} Analytics`}
                </h2>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {filteredTools.length} tools
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group cursor-pointer"
                  >
                    <Card className="p-6 h-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                      {/* Tool Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center`}>
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs mb-2 ${
                              tool.category === 'real-time' ? 'bg-green-100 text-green-700' :
                              tool.category === 'historical' ? 'bg-blue-100 text-blue-700' :
                              tool.category === 'predictive' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                          </Badge>
                          {tool.stats && (
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{tool.stats.value}</div>
                              <div className="text-xs text-gray-500">{tool.stats.label}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tool Content */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

                        {/* Features */}
                        <div className="space-y-2">
                          {tool.features.slice(0, 3).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        <Link href={tool.href}>
                          <Button 
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            size="sm"
                          >
                            <span>Open Analytics</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to dive deeper?</h3>
                      <p className="text-gray-600 text-sm">Create custom dashboards and set up automated reports to get the insights you need.</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                        <PieChart className="h-4 w-4 mr-2" />
                        Create Dashboard
                      </Button>
                      <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Report
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}