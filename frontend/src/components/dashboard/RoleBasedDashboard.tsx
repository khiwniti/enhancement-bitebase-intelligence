'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target, 
  MapPin, 
  Brain,
  DollarSign,
  ArrowRight,
  Eye,
  Zap,
  Calendar,
  Star,
  Globe,
  Activity,
  PieChart,
  FileText,
  Settings
} from 'lucide-react'

interface DashboardWidget {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  data: any
  size: 'small' | 'medium' | 'large'
  priority: number
}

interface RoleBasedDashboardProps {
  userRole: 'restaurant-owner' | 'marketing-manager' | 'data-analyst'
  userName?: string
}

const getWidgetsForRole = (role: string): DashboardWidget[] => {
  const baseWidgets = {
    'restaurant-owner': [
      {
        id: 'daily-sales',
        title: 'Today\'s Sales',
        description: 'Current day revenue and orders',
        icon: DollarSign,
        data: { value: '$2,847', change: '+12%', orders: 47 },
        size: 'medium' as const,
        priority: 1
      },
      {
        id: 'live-orders',
        title: 'Live Orders',
        description: 'Orders in progress right now',
        icon: Activity,
        data: { active: 8, pending: 3, completed: 36 },
        size: 'small' as const,
        priority: 2
      },
      {
        id: 'customer-satisfaction',
        title: 'Customer Satisfaction',
        description: 'Recent rating and feedback',
        icon: Star,
        data: { rating: 4.8, reviews: 127, trending: 'up' },
        size: 'small' as const,
        priority: 3
      },
      {
        id: 'staff-overview',
        title: 'Staff Overview',
        description: 'Current shift and labor costs',
        icon: Users,
        data: { onShift: 6, laborCost: '$247', efficiency: '92%' },
        size: 'medium' as const,
        priority: 4
      },
      {
        id: 'inventory-alerts',
        title: 'Inventory Alerts',
        description: 'Low stock and reorder alerts',
        icon: Building,
        data: { lowStock: 3, criticalItems: ['Tomatoes', 'Bread', 'Cheese'] },
        size: 'medium' as const,
        priority: 5
      },
      {
        id: 'weekly-performance',
        title: 'Weekly Performance',
        description: 'This week vs last week metrics',
        icon: TrendingUp,
        data: { revenue: '+8%', orders: '+15%', avgOrder: '-2%' },
        size: 'large' as const,
        priority: 6
      }
    ],
    'marketing-manager': [
      {
        id: 'campaign-performance',
        title: 'Campaign Performance',
        description: 'Active marketing campaign metrics',
        icon: Target,
        data: { activeCampaigns: 3, totalReach: '12.4K', roi: '340%' },
        size: 'large' as const,
        priority: 1
      },
      {
        id: 'market-insights',
        title: 'Market Insights',
        description: 'AI-generated market intelligence',
        icon: Brain,
        data: { newInsights: 5, opportunities: 2, threats: 1 },
        size: 'medium' as const,
        priority: 2
      },
      {
        id: 'location-scoring',
        title: 'Location Intelligence',
        description: 'Site performance and expansion opportunities',
        icon: MapPin,
        data: { topLocation: 'Downtown', score: 89, expansion: 3 },
        size: 'medium' as const,
        priority: 3
      },
      {
        id: 'customer-segments',
        title: 'Customer Segments',
        description: 'Demographic analysis and targeting',
        icon: Users,
        data: { segments: 5, fastestGrowing: 'Young Professionals', growth: '+24%' },
        size: 'medium' as const,
        priority: 4
      },
      {
        id: 'competitive-analysis',
        title: 'Competitive Analysis',
        description: 'Competitor monitoring and benchmarks',
        icon: BarChart3,
        data: { competitors: 12, marketShare: '18.5%', ranking: '#2' },
        size: 'medium' as const,
        priority: 5
      },
      {
        id: 'roi-tracker',
        title: 'Marketing ROI',
        description: 'Return on investment by channel',
        icon: TrendingUp,
        data: { totalROI: '285%', bestChannel: 'Social Media', worstChannel: 'Radio' },
        size: 'large' as const,
        priority: 6
      }
    ],
    'data-analyst': [
      {
        id: 'data-health',
        title: 'Data Health Monitor',
        description: 'Data quality and integration status',
        icon: Activity,
        data: { sources: 12, healthScore: 94, lastSync: '2 min ago' },
        size: 'medium' as const,
        priority: 1
      },
      {
        id: 'advanced-analytics',
        title: 'Advanced Analytics',
        description: 'Custom models and predictions',
        icon: Brain,
        data: { models: 7, accuracy: '94.2%', predictions: 156 },
        size: 'medium' as const,
        priority: 2
      },
      {
        id: 'query-builder',
        title: 'Quick Query Builder',
        description: 'Recent queries and saved reports',
        icon: BarChart3,
        data: { recentQueries: 23, savedReports: 45, scheduled: 12 },
        size: 'large' as const,
        priority: 3
      },
      {
        id: 'data-exports',
        title: 'Data Exports',
        description: 'Export status and download links',
        icon: FileText,
        data: { pending: 2, completed: 8, totalSize: '2.4GB' },
        size: 'small' as const,
        priority: 4
      },
      {
        id: 'performance-metrics',
        title: 'Performance Metrics',
        description: 'System and query performance',
        icon: Zap,
        data: { avgQueryTime: '1.2s', systemLoad: '67%', uptime: '99.9%' },
        size: 'small' as const,
        priority: 5
      },
      {
        id: 'insights-pipeline',
        title: 'Insights Pipeline',
        description: 'AI insights generation and validation',
        icon: Target,
        data: { generated: 47, validated: 41, actionable: 23 },
        size: 'medium' as const,
        priority: 6
      }
    ]
  }

  return baseWidgets[role as keyof typeof baseWidgets] || []
}

const getQuickActionsForRole = (role: string) => {
  const actions = {
    'restaurant-owner': [
      { title: 'View Today\'s Report', icon: FileText, href: '/reports/daily', color: 'bg-[#74C365]' },
      { title: 'Check Inventory', icon: Building, href: '/inventory', color: 'bg-blue-500' },
      { title: 'Staff Schedule', icon: Users, href: '/staff', color: 'bg-purple-500' },
      { title: 'Customer Feedback', icon: Star, href: '/feedback', color: 'bg-orange-500' }
    ],
    'marketing-manager': [
      { title: 'AI Market Research', icon: Brain, href: '/research-agent', color: 'bg-[#74C365]' },
      { title: 'Create Campaign', icon: Target, href: '/campaign-management', color: 'bg-blue-500' },
      { title: 'Location Analysis', icon: MapPin, href: '/growth-studio', color: 'bg-purple-500' },
      { title: 'Competitor Report', icon: BarChart3, href: '/analytics-workbench', color: 'bg-orange-500' }
    ],
    'data-analyst': [
      { title: 'Analytics Workbench', icon: BarChart3, href: '/analytics-workbench', color: 'bg-[#74C365]' },
      { title: 'Custom Query', icon: FileText, href: '/analytics-workbench?tab=tools', color: 'bg-blue-500' },
      { title: 'Data Integration', icon: Settings, href: '/data-sources', color: 'bg-purple-500' },
      { title: 'Export Data', icon: FileText, href: '/analytics-workbench?tab=reports', color: 'bg-orange-500' }
    ]
  }

  return actions[role as keyof typeof actions] || []
}

const getRoleConfig = (role: string) => {
  const configs = {
    'restaurant-owner': {
      title: 'Business Command Center',
      subtitle: 'Your operational dashboard for daily management',
      icon: Building,
      color: 'from-blue-500 to-cyan-500',
      features: ['Real-time monitoring', 'Operational insights', 'Performance tracking']
    },
    'marketing-manager': {
      title: 'Growth Intelligence Hub',
      subtitle: 'Strategic insights for marketing and expansion',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      features: ['Market analysis', 'Campaign optimization', 'Expansion planning']
    },
    'data-analyst': {
      title: 'Analytics Command Center',
      subtitle: 'Advanced tools for data analysis and modeling',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      features: ['Custom analytics', 'Data modeling', 'Advanced reporting']
    }
  }

  return configs[role as keyof typeof configs] || configs['restaurant-owner']
}

export function RoleBasedDashboard({ userRole, userName = 'User' }: RoleBasedDashboardProps) {
  const widgets = getWidgetsForRole(userRole)
  const quickActions = getQuickActionsForRole(userRole)
  const roleConfig = getRoleConfig(userRole)

  // Sort widgets by priority and group by size
  const sortedWidgets = widgets.sort((a, b) => a.priority - b.priority)
  const smallWidgets = sortedWidgets.filter(w => w.size === 'small')
  const mediumWidgets = sortedWidgets.filter(w => w.size === 'medium')
  const largeWidgets = sortedWidgets.filter(w => w.size === 'large')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${roleConfig.color} opacity-90`}>
                <roleConfig.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {userName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {roleConfig.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {roleConfig.features.map((feature: string) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action: any, index: number) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${action.color} opacity-90 group-hover:opacity-100 transition-opacity`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-sm group-hover:text-[#74C365] transition-colors">
                          {action.title}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {roleConfig.title}
          </h2>

          {/* Small widgets row */}
          {smallWidgets.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {smallWidgets.map((widget, index) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <widget.icon className="h-5 w-5 text-[#74C365]" />
                        <h3 className="font-medium text-sm">{widget.title}</h3>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(widget.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-500 capitalize">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Medium widgets */}
          {mediumWidgets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediumWidgets.map((widget, index) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <widget.icon className="h-5 w-5 text-[#74C365]" />
                        {widget.title}
                      </CardTitle>
                      <CardDescription>
                        {widget.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(widget.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-semibold">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Large widgets */}
          {largeWidgets.length > 0 && (
            <div className="space-y-6">
              {largeWidgets.map((widget, index) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <widget.icon className="h-6 w-6 text-[#74C365]" />
                        {widget.title}
                      </CardTitle>
                      <CardDescription>
                        {widget.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(widget.data).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-2xl font-bold text-[#74C365] mb-1">
                              {Array.isArray(value) ? value.length : String(value)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Role-specific navigation */}
          <Card className="bg-gradient-to-r from-[#74C365] to-[#5ea54f] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Explore {roleConfig.title.split(' ')[0]} Features
                  </h3>
                  <p className="text-sm opacity-90">
                    Access advanced tools designed specifically for your role
                  </p>
                </div>
                <div className="flex gap-3">
                  {userRole === 'restaurant-owner' && (
                    <Link href="/operations-center">
                      <Button variant="secondary">
                        Operations Center
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                  {userRole === 'marketing-manager' && (
                    <Link href="/growth-studio">
                      <Button variant="secondary">
                        Growth Studio
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                  {userRole === 'data-analyst' && (
                    <Link href="/analytics-workbench">
                      <Button variant="secondary">
                        Analytics Workbench
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RoleBasedDashboard