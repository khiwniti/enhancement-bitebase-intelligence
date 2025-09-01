'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/AppLayout'
import {
  Shield,
  Database,
  Monitor,
  Settings,
  HelpCircle,
  Users,
  Activity,
  TrendingUp,
  ArrowRight,
  Eye,
  FileText,
  Zap,
  Bell,
  Gauge,
  Lock
} from 'lucide-react'

interface AdminTool {
  id: string
  name: string
  description: string
  href: string
  icon: React.ComponentType<any>
  category: 'security' | 'monitoring' | 'data' | 'settings' | 'support'
  features: string[]
  color: string
  status: 'healthy' | 'warning' | 'critical' | 'maintenance'
  stats?: {
    label: string
    value: string
  }
}

const adminTools: AdminTool[] = [
  {
    id: 'security-dashboard',
    name: 'Security Dashboard',
    description: 'Comprehensive security monitoring and access control management',
    href: '/security',
    icon: Shield,
    category: 'security',
    color: 'from-red-500 to-pink-500',
    status: 'healthy',
    features: [
      'Access control',
      'Threat monitoring',
      'Audit logs',
      'Compliance reporting'
    ],
    stats: { label: 'Security score', value: '94%' }
  },
  {
    id: 'api-monitoring',
    name: 'API Monitoring',
    description: 'Real-time API performance tracking and rate limiting management',
    href: '/api-monitoring',
    icon: Monitor,
    category: 'monitoring',
    color: 'from-blue-500 to-cyan-500',
    status: 'healthy',
    features: [
      'Performance metrics',
      'Rate limiting',
      'Error tracking',
      'Uptime monitoring'
    ],
    stats: { label: 'Uptime', value: '99.9%' }
  },
  {
    id: 'data-sources',
    name: 'Data Sources',
    description: 'Manage all data connections and integration configurations',
    href: '/data-sources',
    icon: Database,
    category: 'data',
    color: 'from-green-500 to-emerald-500',
    status: 'warning',
    features: [
      'Connection management',
      'Data sync status',
      'Integration health',
      'Schema validation'
    ],
    stats: { label: 'Active sources', value: '12' }
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    description: 'Global system configuration and platform customization',
    href: '/settings',
    icon: Settings,
    category: 'settings',
    color: 'from-purple-500 to-indigo-500',
    status: 'healthy',
    features: [
      'Global configuration',
      'Feature toggles',
      'Customization',
      'Preferences'
    ],
    stats: { label: 'Configurations', value: '47' }
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Manage user accounts, roles, and permissions across the platform',
    href: '/admin/users',
    icon: Users,
    category: 'security',
    color: 'from-orange-500 to-yellow-500',
    status: 'healthy',
    features: [
      'User accounts',
      'Role management',
      'Permission control',
      'Team administration'
    ],
    stats: { label: 'Active users', value: '142' }
  },
  {
    id: 'help-center',
    name: 'Help & Support',
    description: 'Documentation, tutorials, and support ticket management',
    href: '/help',
    icon: HelpCircle,
    category: 'support',
    color: 'from-teal-500 to-blue-500',
    status: 'healthy',
    features: [
      'Documentation',
      'Video tutorials',
      'Support tickets',
      'Knowledge base'
    ],
    stats: { label: 'Articles', value: '89' }
  }
]

const systemAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'High API usage detected',
    description: 'Current usage at 85% of rate limit for external APIs',
    severity: 'medium',
    time: '5 minutes ago',
    icon: Activity,
    color: 'text-orange-500'
  },
  {
    id: 2,
    type: 'success',
    title: 'Security scan completed',
    description: 'Weekly security audit completed successfully with no issues',
    severity: 'low',
    time: '2 hours ago',
    icon: Shield,
    color: 'text-green-500'
  },
  {
    id: 3,
    type: 'info',
    title: 'System maintenance scheduled',
    description: 'Routine maintenance window scheduled for this weekend',
    severity: 'low',
    time: '6 hours ago',
    icon: Settings,
    color: 'text-blue-500'
  }
]

const systemMetrics = [
  { label: 'System Health', value: '96%', change: '+2%', trend: 'up', icon: Gauge },
  { label: 'Active Sessions', value: '847', change: '+12%', trend: 'up', icon: Users },
  { label: 'Data Processed', value: '2.4TB', change: '+18%', trend: 'up', icon: Database },
  { label: 'Security Score', value: '94%', change: '+1%', trend: 'up', icon: Shield }
]

export default function AdminCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredTools = selectedCategory === 'all' 
    ? adminTools 
    : adminTools.filter(tool => tool.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All Tools', icon: Shield },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'monitoring', name: 'Monitoring', icon: Monitor },
    { id: 'data', name: 'Data', icon: Database },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'support', name: 'Support', icon: HelpCircle }
  ]

  const getStatusColor = (status: AdminTool['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-orange-500'
      case 'critical': return 'text-red-500'
      case 'maintenance': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: AdminTool['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-700'
      case 'warning': return 'bg-orange-100 text-orange-700'
      case 'critical': return 'bg-red-100 text-red-700'
      case 'maintenance': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

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
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Center</h1>
                <p className="text-gray-600">Manage and monitor your BiteBase Intelligence platform</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                System Report
              </Button>
              <Button className="bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white">
                <Zap className="h-4 w-4 mr-2" />
                Quick Actions
              </Button>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {systemMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-sm text-gray-600">{metric.label}</div>
                      <div className={`text-xs flex items-center mt-1 ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                        {metric.change}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <metric.icon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter & System Alerts */}
          <div className="lg:col-span-1 space-y-6">
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
                          ? 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-600 border border-gray-200'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* System Alerts */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 text-gray-500 mr-2" />
                  System Alerts
                </h3>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          alert.type === 'warning' ? 'bg-orange-100' :
                          alert.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <alert.icon className={`h-4 w-4 ${alert.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{alert.description}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{alert.time}</span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                                alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Alerts
                </Button>
              </Card>
            </motion.div>
          </div>

          {/* Admin Tools Grid */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCategory === 'all' ? 'All Admin Tools' : `${categories.find(c => c.id === selectedCategory)?.name} Tools`}
                </h2>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
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
                    <Card className="p-6 h-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                      {/* Tool Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center`}>
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(tool.status)}`}></div>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusBg(tool.status)}`}
                            >
                              {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                            </Badge>
                          </div>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

                        {/* Features */}
                        <div className="space-y-2">
                          {tool.features.slice(0, 3).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        <Link href={tool.href}>
                          <Button 
                            className="w-full bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white"
                            size="sm"
                          >
                            <span>Open Tool</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* System Status Overview */}
              <div className="mt-8">
                <Card className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status Overview</h3>
                      <p className="text-gray-600 text-sm">Monitor system health, manage configurations, and ensure optimal platform performance.</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button className="bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white">
                        <Eye className="h-4 w-4 mr-2" />
                        View Dashboard
                      </Button>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
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