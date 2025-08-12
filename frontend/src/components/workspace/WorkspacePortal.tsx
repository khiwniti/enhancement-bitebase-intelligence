'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Brain,
  MapPin,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Clock,
  CheckCircle,
  Star,
  Zap,
  PlusCircle,
  Settings,
  Bell,
  Search,
  Globe,
  Target,
  Coffee,
  ChefHat,
  Building
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
  preview?: React.ReactNode
  metrics?: {
    label: string
    value: string
    trend?: 'up' | 'down' | 'neutral'
  }[]
  status?: 'available' | 'beta' | 'coming-soon'
  isNew?: boolean
  gradient: string
  delay?: number
}

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  preview, 
  metrics, 
  status = 'available',
  isNew = false,
  gradient,
  delay = 0
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: delay * 0.1,
        type: "spring",
        stiffness: 100 
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        y: -2,
        transition: { duration: 0.1 }
      }}
      className="group relative touch-manipulation"
    >
      <Card className="relative h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden touch-manipulation cursor-pointer active:shadow-3xl">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Status Badge */}
        {(status !== 'available' || isNew) && (
          <div className="absolute top-4 right-4 z-10">
            {isNew && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                New
              </Badge>
            )}
            {status === 'beta' && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                Beta
              </Badge>
            )}
            {status === 'coming-soon' && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                Coming Soon
              </Badge>
            )}
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Preview Section */}
          {preview && (
            <div className="relative">
              <div className="p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                {preview}
              </div>
            </div>
          )}

          {/* Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center p-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                    {metric.value}
                    {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          <Link href={href} className="block">
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              disabled={status === 'coming-soon'}
            >
              {status === 'coming-soon' ? 'Coming Soon' : 'Open'}
              {status !== 'coming-soon' && (
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              )}
            </Button>
          </Link>
        </CardContent>

        {/* Hover Effects */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />
      </Card>
    </motion.div>
  )
}

interface RecentActivityItem {
  id: string
  type: 'research' | 'report' | 'analysis' | 'integration'
  title: string
  timestamp: Date
  status: 'completed' | 'in_progress' | 'failed'
  description?: string
}

const QuickStats = () => {
  const stats = [
    { label: 'Locations Analyzed', value: '1,247', icon: MapPin, color: 'text-blue-500' },
    { label: 'Reports Generated', value: '89', icon: FileText, color: 'text-green-500' },
    { label: 'AI Queries Processed', value: '3,456', icon: Brain, color: 'text-purple-500' },
    { label: 'Active Integrations', value: '12', icon: Activity, color: 'text-orange-500' }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-300 touch-manipulation cursor-pointer"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{stat.label}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const RecentActivity = () => {
  const activities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'research',
      title: 'Market Analysis: Manhattan Pizza Locations',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed',
      description: 'AI analysis of 47 locations with competitive insights'
    },
    {
      id: '2',
      type: 'report',
      title: 'Q4 Performance Report',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'completed',
      description: 'Comprehensive revenue and customer analytics'
    },
    {
      id: '3',
      type: 'analysis',
      title: 'Location Intelligence: Brooklyn Heights',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      status: 'in_progress',
      description: 'Demographic and foot traffic analysis'
    }
  ]

  const getActivityIcon = (type: string, status: string) => {
    const iconProps = { className: "h-4 w-4" }
    
    if (status === 'completed') return <CheckCircle {...iconProps} className="h-4 w-4 text-green-500" />
    if (status === 'in_progress') return <Clock {...iconProps} className="h-4 w-4 text-orange-500" />
    if (status === 'failed') return <Target {...iconProps} className="h-4 w-4 text-red-500" />
    
    switch (type) {
      case 'research': return <Brain {...iconProps} />
      case 'report': return <FileText {...iconProps} />
      case 'analysis': return <BarChart3 {...iconProps} />
      default: return <Activity {...iconProps} />
    }
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Clock className="h-5 w-5 text-orange-500" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest actions and automated processes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                {getActivityIcon(activity.type, activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.title}
                </div>
                {activity.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activity.description}
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {activity.timestamp.toLocaleString()}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  activity.status === 'completed' && "bg-green-50 text-green-600 border-green-200",
                  activity.status === 'in_progress' && "bg-orange-50 text-orange-600 border-orange-200",
                  activity.status === 'failed' && "bg-red-50 text-red-600 border-red-200"
                )}
              >
                {activity.status.replace('_', ' ')}
              </Badge>
            </motion.div>
          ))}
          
          <Link href="/activity" className="block">
            <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50">
              View All Activity
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WorkspacePortal() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userName] = useState('Restaurant Owner') // This would come from auth context

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Core features configuration
  const coreFeatures: FeatureCardProps[] = [
    {
      title: 'AI Marketing Research',
      description: 'Natural language queries for comprehensive market analysis',
      icon: Brain,
      href: '/research-agent/enhanced',
      gradient: 'from-purple-500 to-indigo-600',
      metrics: [
        { label: 'Queries Today', value: '47', trend: 'up' },
        { label: 'Accuracy', value: '94%' }
      ],
      preview: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MessageSquare className="h-3 w-3" />
            <span>"Analyze pizza markets in Manhattan"</span>
          </div>
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            ✓ Found 12 high-opportunity locations with 85% confidence
          </div>
        </div>
      ),
      delay: 0
    },
    {
      title: 'Interactive Map Intelligence',
      description: 'Click-to-analyze mapping with real-time location insights',
      icon: MapPin,
      href: '/location-intelligence/studio',
      gradient: 'from-blue-500 to-cyan-600',
      metrics: [
        { label: 'Locations', value: '1.2K+', trend: 'up' },
        { label: 'Coverage', value: '50 Cities' }
      ],
      preview: (
        <div className="space-y-2">
          <div className="w-full h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded flex items-center justify-center">
            <Globe className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-xs text-blue-600 font-medium">Live: 1,247 locations analyzed</div>
        </div>
      ),
      delay: 1
    },
    {
      title: 'Report Builder',
      description: 'Notion-like drag & drop interface for professional reports',
      icon: FileText,
      href: '/reports/builder',
      gradient: 'from-green-500 to-emerald-600',
      status: 'beta',
      isNew: true,
      metrics: [
        { label: 'Templates', value: '25+' },
        { label: 'Reports', value: '89', trend: 'up' }
      ],
      preview: (
        <div className="space-y-2">
          <div className="flex gap-1">
            <div className="h-2 w-full bg-gray-200 rounded"></div>
            <div className="h-2 w-8 bg-orange-300 rounded"></div>
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-6 bg-blue-300 rounded"></div>
            <div className="h-2 w-full bg-gray-200 rounded"></div>
          </div>
          <div className="text-xs text-green-600 font-medium">Drag & Drop Interface</div>
        </div>
      ),
      delay: 2
    }
  ]

  // Secondary features
  const secondaryFeatures = [
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive business intelligence and KPI tracking',
      icon: BarChart3,
      href: '/dashboard',
      gradient: 'from-orange-500 to-red-600',
      delay: 3
    },
    {
      title: 'POS Integration',
      description: 'Connect your point-of-sale systems for real-time data',
      icon: Activity,
      href: '/pos-integration',
      gradient: 'from-teal-500 to-cyan-600',
      delay: 4
    },
    {
      title: 'Restaurant Management',
      description: 'Streamline operations, staff, inventory, and customer management',
      icon: Users,
      href: '/restaurant-management',
      gradient: 'from-pink-500 to-rose-600',
      delay: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-200/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 sm:space-y-4 px-2"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {currentTime.toLocaleTimeString()} • All Systems Operational
            </span>
          </div>
          
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 px-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome back, <span className="text-orange-500 block sm:inline">{userName}</span>
          </motion.h1>
          
          <motion.p
            className="text-sm sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your intelligent restaurant command center. Analyze markets, optimize locations, and generate insights with AI-powered tools.
          </motion.p>
        </motion.div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Core Features Grid */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center px-4"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Core Intelligence Features
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Powerful AI-driven tools designed to give you the competitive edge in restaurant location intelligence and market analysis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {coreFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>

        {/* Secondary Features & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Secondary Features */}
          <div className="space-y-4 sm:space-y-6">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 px-2"
            >
              Additional Tools
            </motion.h3>
            <div className="space-y-3 sm:space-y-4">
              {secondaryFeatures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="order-first lg:order-last"
          >
            <RecentActivity />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-center space-y-4 sm:space-y-6 py-6 sm:py-8 px-4"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Ready to get started?
          </h3>
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            <Link href="/research-agent/enhanced" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation">
                <Brain className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start AI Research
              </Button>
            </Link>
            <Link href="/location-intelligence/studio" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300 touch-manipulation">
                <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Explore Locations
              </Button>
            </Link>
            <Link href="/reports/builder" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-all duration-300 touch-manipulation">
                <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create Report
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}