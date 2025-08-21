'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/AppLayout'
import {
  Settings,
  DollarSign,
  Package,
  Megaphone,
  CreditCard,
  Building,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  Zap,
  Heart,
  Cpu,
  ShoppingCart,
  Utensils
} from 'lucide-react'

interface OperationsTool {
  id: string
  name: string
  description: string
  href: string
  icon: React.ComponentType<any>
  category: 'pricing' | 'product' | 'promotion' | 'payments' | 'campaigns' | 'management'
  features: string[]
  color: string
  status: 'active' | 'pending' | 'setup'
  stats?: {
    label: string
    value: string
  }
}

const operationsTools: OperationsTool[] = [
  {
    id: 'price-intelligence',
    name: 'Price Intelligence',
    description: 'AI-powered pricing optimization and revenue forecasting',
    href: '/price-intelligence',
    icon: DollarSign,
    category: 'pricing',
    color: 'from-green-500 to-emerald-500',
    status: 'active',
    features: [
      'Dynamic pricing',
      'Competitor analysis',
      'Revenue optimization',
      'Price elasticity analysis'
    ],
    stats: { label: 'Revenue increase', value: '+18%' }
  },
  {
    id: 'product-intelligence',
    name: 'Product Intelligence',
    description: 'Menu engineering and product performance optimization',
    href: '/product-intelligence',
    icon: Package,
    category: 'product',
    color: 'from-blue-500 to-cyan-500',
    status: 'active',
    features: [
      'Menu engineering',
      'Cost analysis',
      'Popularity tracking',
      'Profitability optimization'
    ],
    stats: { label: 'Profit margin', value: '+12%' }
  },
  {
    id: 'promotion-intelligence',
    name: 'Promotion Intelligence',
    description: 'Smart promotion campaigns and customer engagement',
    href: '/promotion-intelligence',
    icon: Megaphone,
    category: 'promotion',
    color: 'from-purple-500 to-pink-500',
    status: 'active',
    features: [
      'Campaign automation',
      'Customer segmentation',
      'A/B testing',
      'ROI tracking'
    ],
    stats: { label: 'Campaign success', value: '87%' }
  },
  {
    id: 'pos-integration',
    name: 'POS Integration',
    description: 'Seamless point-of-sale system integrations and data sync',
    href: '/pos-integration',
    icon: CreditCard,
    category: 'payments',
    color: 'from-orange-500 to-red-500',
    status: 'active',
    features: [
      'Real-time sync',
      'Multi-POS support',
      'Transaction analysis',
      'Payment insights'
    ],
    stats: { label: 'Transactions', value: '2.4K/day' }
  },
  {
    id: 'campaign-management',
    name: 'Campaign Management',
    description: 'Comprehensive marketing campaign planning and execution',
    href: '/campaign-management',
    icon: Target,
    category: 'campaigns',
    color: 'from-indigo-500 to-purple-500',
    status: 'active',
    features: [
      'Multi-channel campaigns',
      'Audience targeting',
      'Performance tracking',
      'Budget optimization'
    ],
    stats: { label: 'Active campaigns', value: '12' }
  },
  {
    id: 'restaurant-management',
    name: 'Restaurant Management',
    description: 'Comprehensive restaurant operations and staff management',
    href: '/restaurant-management',
    icon: Building,
    category: 'management',
    color: 'from-teal-500 to-blue-500',
    status: 'setup',
    features: [
      'Staff scheduling',
      'Inventory management',
      'Order processing',
      'Table management'
    ],
    stats: { label: 'Staff efficiency', value: '+15%' }
  }
]

const operationalAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Low inventory alert',
    description: 'Chicken breast inventory below threshold (12% remaining)',
    priority: 'high',
    time: '15 minutes ago',
    icon: Package,
    color: 'text-orange-500'
  },
  {
    id: 2,
    type: 'success',
    title: 'Campaign performance',
    description: 'Weekend promotion exceeded target by 23%',
    priority: 'medium',
    time: '2 hours ago',
    icon: TrendingUp,
    color: 'text-green-500'
  },
  {
    id: 3,
    type: 'info',
    title: 'Staff schedule reminder',
    description: 'Weekend shift schedule requires approval',
    priority: 'low',
    time: '4 hours ago',
    icon: Users,
    color: 'text-blue-500'
  }
]

const quickMetrics = [
  { label: 'Daily Revenue', value: '$8,247', change: '+15%', trend: 'up', icon: DollarSign },
  { label: 'Orders Today', value: '234', change: '+8%', trend: 'up', icon: ShoppingCart },
  { label: 'Active Promotions', value: '5', change: '+2', trend: 'up', icon: Megaphone },
  { label: 'Staff On Duty', value: '18', change: '0', trend: 'stable', icon: Users }
]

export default function OperationsCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredTools = selectedCategory === 'all' 
    ? operationsTools 
    : operationsTools.filter(tool => tool.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All Tools', icon: Settings },
    { id: 'pricing', name: 'Pricing', icon: DollarSign },
    { id: 'product', name: 'Product', icon: Package },
    { id: 'promotion', name: 'Promotion', icon: Megaphone },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'campaigns', name: 'Campaigns', icon: Target },
    { id: 'management', name: 'Management', icon: Building }
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
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Operations Center</h1>
                <p className="text-gray-600">Streamline your restaurant operations with intelligent tools</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                <Zap className="h-4 w-4 mr-2" />
                Quick Setup
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {quickMetrics.map((metric, index) => (
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
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.trend !== 'stable' && (
                          <TrendingUp className={`h-3 w-3 mr-1 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                        )}
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
          {/* Category Filter & Alerts */}
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
                          ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 border border-indigo-200'
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

            {/* Operational Alerts */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-indigo-500 mr-2" />
                  Operations Alerts
                </h3>
                <div className="space-y-4">
                  {operationalAlerts.map((alert) => (
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
                                alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                                alert.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {alert.priority}
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

          {/* Operations Tools Grid */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCategory === 'all' ? 'All Operations Tools' : `${categories.find(c => c.id === selectedCategory)?.name} Tools`}
                </h2>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
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
                    <Card className="p-6 h-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                      {/* Tool Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center`}>
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs mb-2 ${
                              tool.status === 'active' ? 'bg-green-100 text-green-700' :
                              tool.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {tool.status === 'active' ? 'Active' : 
                             tool.status === 'pending' ? 'Pending' : 'Setup Required'}
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

                        {/* Features */}
                        <div className="space-y-2">
                          {tool.features.slice(0, 3).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        <Link href={tool.href}>
                          <Button 
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                            size="sm"
                          >
                            <span>{tool.status === 'setup' ? 'Setup Tool' : 'Open Tool'}</span>
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
                <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimize Your Operations</h3>
                      <p className="text-gray-600 text-sm">Automate workflows, set up intelligent alerts, and streamline your restaurant operations.</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                        <Cpu className="h-4 w-4 mr-2" />
                        Auto Setup
                      </Button>
                      <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Review
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