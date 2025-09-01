'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Calendar,
  Building,
  Download,
  Settings,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Zap,
  Target,
  Users,
  DollarSign,
  Star,
  PieChart,
  Filter,
  Eye,
  FileText
} from 'lucide-react'
import IntegratedAnalyticsDashboard from '@/components/analytics/IntegratedAnalyticsDashboard'

interface AnalyticsTool {
  id: string
  name: string
  description: string
  category: 'real-time' | 'historical' | 'predictive' | 'custom'
  features: string[]
  color: string
  icon: React.ComponentType<any>
  stats?: {
    label: string
    value: string
  }
}

interface UserRole {
  id: string
  name: string
  description: string
  defaultView: 'dashboard' | 'tools' | 'reports'
  permissions: string[]
}

const analyticsTools: AnalyticsTool[] = [
  {
    id: 'real-time-analytics',
    name: 'Real-time Analytics',
    description: 'Live performance metrics and instant insights as they happen',
    category: 'real-time',
    color: 'from-green-500 to-emerald-500',
    icon: Activity,
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
    name: 'Integrated Business Intelligence',
    description: 'Comprehensive business intelligence with unified data views',
    category: 'historical',
    color: 'from-blue-500 to-cyan-500',
    icon: BarChart3,
    features: [
      'Multi-source data integration',
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
    category: 'predictive',
    color: 'from-purple-500 to-pink-500',
    icon: TrendingUp,
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
    name: 'Custom Report Builder',
    description: 'Build and schedule automated reports tailored to your needs',
    category: 'custom',
    color: 'from-orange-500 to-red-500',
    icon: FileText,
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
    category: 'real-time',
    color: 'from-indigo-500 to-purple-500',
    icon: Target,
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
    category: 'historical',
    color: 'from-teal-500 to-blue-500',
    icon: Users,
    features: [
      'Customer segmentation',
      'Behavior analysis',
      'Lifetime value',
      'Churn prediction'
    ],
    stats: { label: 'Customer segments', value: '8' }
  }
]

const userRoles: UserRole[] = [
  {
    id: 'restaurant-owner',
    name: 'Restaurant Owner',
    description: 'Focus on operational KPIs and business performance',
    defaultView: 'dashboard',
    permissions: ['view-analytics', 'export-reports', 'view-real-time']
  },
  {
    id: 'marketing-manager', 
    name: 'Marketing Manager',
    description: 'Campaign performance and customer insights',
    defaultView: 'tools',
    permissions: ['view-analytics', 'create-reports', 'view-campaigns', 'export-data']
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst', 
    description: 'Advanced analytics and custom reporting',
    defaultView: 'tools',
    permissions: ['view-analytics', 'create-reports', 'advanced-tools', 'data-integration', 'predictive-models']
  }
]

const quickStats = [
  { label: 'Total Revenue', value: '$47,293', change: '+12.5%', trend: 'up', icon: DollarSign },
  { label: 'Orders Today', value: '156', change: '+8.2%', trend: 'up', icon: BarChart3 },
  { label: 'Avg Order Value', value: '$24.50', change: '-2.1%', trend: 'down', icon: TrendingUp },
  { label: 'Customer Satisfaction', value: '4.8/5', change: '+0.3', trend: 'up', icon: Star }
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

interface AnalyticsWorkbenchProps {
  userRole?: string
  selectedRestaurant?: string
  timePeriod?: 'week' | 'month' | 'quarter' | 'year'
}

export function AnalyticsWorkbench({ 
  userRole = 'restaurant-owner',
  selectedRestaurant = 'all',
  timePeriod = 'month'
}: AnalyticsWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tools' | 'reports'>('dashboard')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentRole, setCurrentRole] = useState<string>(userRole)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    // Set default tab based on user role
    const role = userRoles.find(r => r.id === currentRole)
    if (role) {
      setActiveTab(role.defaultView)
    }
  }, [currentRole])

  const filteredTools = selectedCategory === 'all' 
    ? analyticsTools 
    : analyticsTools.filter(tool => tool.category === selectedCategory)

  const currentUserRole = userRoles.find(r => r.id === currentRole)

  const categories = [
    { id: 'all', name: 'All Tools', icon: BarChart3 },
    { id: 'real-time', name: 'Real-time', icon: Activity },
    { id: 'historical', name: 'Historical', icon: Calendar },
    { id: 'predictive', name: 'Predictive', icon: TrendingUp },
    { id: 'custom', name: 'Custom', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Analytics Workbench
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unified business intelligence and data analytics platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-[#74C365] text-white border-[#74C365]">
                <Zap className="h-3 w-3 mr-1" />
                Real-time Data
              </Badge>
              <Select value={currentRole} onValueChange={setCurrentRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Role-based Quick Stats - Always visible */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <span className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <stat.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">📊 Integrated Dashboard</TabsTrigger>
            <TabsTrigger value="tools">🔧 Analytics Tools</TabsTrigger>
            <TabsTrigger value="reports">📋 Reports & Exports</TabsTrigger>
          </TabsList>

          {/* Integrated Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Unified Business Intelligence
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Real-time insights across all your business data sources
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedRestaurant}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Restaurants</SelectItem>
                      <SelectItem value="1">Downtown Bistro</SelectItem>
                      <SelectItem value="2">Seaside Cafe</SelectItem>
                      <SelectItem value="3">Urban Kitchen</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              <IntegratedAnalyticsDashboard
                restaurantId={selectedRestaurant === 'all' ? undefined : selectedRestaurant}
                timePeriod={timePeriod}
              />
            </div>
          </TabsContent>

          {/* Analytics Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color} opacity-90 group-hover:opacity-100 transition-opacity`}>
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        {tool.stats && (
                          <Badge variant="secondary" className="text-xs">
                            {tool.stats.label}: {tool.stats.value}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-[#74C365] transition-colors">
                        {tool.name}
                      </CardTitle>
                      <CardDescription>
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {tool.features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {tool.features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{tool.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-4">
                          <Badge variant="outline" className="capitalize">
                            {tool.category.replace('-', ' ')}
                          </Badge>
                          <Button size="sm" className="bg-[#74C365] hover:bg-[#5ea54f]">
                            Open Tool
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Reports
                  </CardTitle>
                  <CardDescription>
                    Recently generated and scheduled reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <report.icon className={`h-5 w-5 ${report.color}`} />
                          <div>
                            <p className="font-medium text-sm">{report.name}</p>
                            <p className="text-xs text-gray-500">{report.type} • {report.date}</p>
                          </div>
                        </div>
                        <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Report Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Quick Report Generator
                  </CardTitle>
                  <CardDescription>
                    Generate common reports with pre-built templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-[#74C365] hover:bg-[#5ea54f]">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Sales Performance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Customer Analytics Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Financial Summary Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Marketing Campaign Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AnalyticsWorkbench