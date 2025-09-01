'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  DollarSign,
  Activity,
  MapPin,
  Brain,
  BarChart3,
  Zap,
  Target,
  Globe,
  Eye,
  RefreshCw,
  Download,
  Plus,
  ArrowRight
} from 'lucide-react'

interface MetricCard {
  id: string
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const metrics: MetricCard[] = [
  {
    id: 'total-restaurants',
    title: 'Total Restaurants',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive',
    icon: Building,
    description: 'Active restaurants in database'
  },
  {
    id: 'market-coverage',
    title: 'Market Coverage',
    value: '89.2%',
    change: '+3.1%',
    changeType: 'positive',
    icon: Globe,
    description: 'Geographic coverage percentage'
  },
  {
    id: 'avg-revenue',
    title: 'Avg. Revenue',
    value: '฿45,230',
    change: '-2.3%',
    changeType: 'negative',
    icon: DollarSign,
    description: 'Average monthly revenue'
  },
  {
    id: 'active-users',
    title: 'Active Users',
    value: '1,234',
    change: '+8.7%',
    changeType: 'positive',
    icon: Users,
    description: 'Monthly active users'
  }
]

const quickActions = [
  {
    id: 'create-dashboard',
    title: 'Create Dashboard',
    description: 'Build custom analytics dashboard',
    icon: BarChart3,
    href: '/dashboard/builder',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'location-analysis',
    title: 'Location Analysis',
    description: 'Analyze market opportunities',
    icon: MapPin,
    href: '/location-intelligence',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'ai-research',
    title: 'AI Research',
    description: 'Get intelligent insights',
    icon: Brain,
    href: '/research-agent',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create comprehensive report',
    icon: Download,
    href: '/reports',
    color: 'from-orange-500 to-orange-600'
  }
]

const recentInsights = [
  {
    id: '1',
    title: 'High-Growth Areas Identified',
    description: 'Sukhumvit and Silom districts show 23% growth potential',
    timestamp: '2 hours ago',
    type: 'location',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Competitor Analysis Complete',
    description: 'New Thai cuisine trends detected in Thonglor area',
    timestamp: '4 hours ago',
    type: 'market',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Revenue Optimization Opportunity',
    description: 'Delivery timing optimization could increase revenue by 15%',
    timestamp: '6 hours ago',
    type: 'revenue',
    priority: 'high'
  }
]

export function DashboardOverview() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here's what's happening with your restaurant intelligence platform.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.id} className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'default' : 'secondary'}
                    className={`
                      ${metric.changeType === 'positive' 
                        ? 'bg-green-100 text-green-700' 
                        : metric.changeType === 'negative'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-700'
                      }
                    `}
                  >
                    {metric.changeType === 'positive' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : metric.changeType === 'negative' ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : (
                      <Activity className="w-3 h-3 mr-1" />
                    )}
                    {metric.change}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">{metric.value}</CardTitle>
                <CardDescription className="text-sm">{metric.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">{metric.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Insights */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Recent Insights</h2>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="space-y-3">
          {recentInsights.map((insight) => (
            <Card key={insight.id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    insight.priority === 'high' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{insight.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                    <p className="text-xs text-slate-500 mt-2">{insight.timestamp}</p>
                  </div>
                  <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                    {insight.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
