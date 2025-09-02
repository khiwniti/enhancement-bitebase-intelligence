'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Target,
  Lightbulb,
  Rocket,
  BarChart3,
  Users,
  DollarSign,
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Eye,
  Zap,
  Star,
  Activity,
  Calendar,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function GrowthStudioPage() {
  const [activeExperiment, setActiveExperiment] = useState('pricing')

  const growthMetrics = [
    {
      title: 'Revenue Growth',
      value: '+23.5%',
      period: 'This Quarter',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Customer Acquisition',
      value: '+18.2%',
      period: 'This Month',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Retention Rate',
      value: '87.3%',
      period: 'Current',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Order Value',
      value: '+12.8%',
      period: 'This Month',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  const experiments = [
    {
      id: 'pricing',
      title: 'Dynamic Pricing Strategy',
      description: 'AI-powered pricing optimization based on demand and competition',
      status: 'running',
      progress: 65,
      impact: '+15% Revenue',
      confidence: '94%',
      duration: '14 days',
      type: 'pricing'
    },
    {
      id: 'loyalty',
      title: 'Loyalty Program Enhancement',
      description: 'Gamified loyalty program with personalized rewards',
      status: 'planning',
      progress: 25,
      impact: '+23% Retention',
      confidence: '87%',
      duration: '21 days',
      type: 'retention'
    },
    {
      id: 'menu',
      title: 'Menu Optimization',
      description: 'Data-driven menu restructuring for higher margins',
      status: 'completed',
      progress: 100,
      impact: '+18% Margin',
      confidence: '91%',
      duration: '28 days',
      type: 'optimization'
    }
  ]

  const growthOpportunities = [
    {
      id: '1',
      title: 'Peak Hour Optimization',
      description: 'Increase capacity during high-demand periods',
      potential: '+₿450K/month',
      effort: 'Medium',
      priority: 'High',
      category: 'Operations'
    },
    {
      id: '2',
      title: 'Cross-selling Campaign',
      description: 'Implement AI-driven product recommendations',
      potential: '+₿320K/month',
      effort: 'Low',
      priority: 'High',
      category: 'Marketing'
    }
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
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Growth Studio</h1>
                <p className="text-gray-600">
                  Experiment, optimize, and accelerate business growth
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge className="bg-purple-100 text-purple-700">
                <Activity className="h-3 w-3 mr-1" />
                3 Active Experiments
              </Badge>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Rocket className="w-4 h-4 mr-2" />
                New Experiment
              </Button>
            </div>
          </motion.div>

          {/* Growth Metrics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {growthMetrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-purple-500 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </CardTitle>
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <p className="text-xs text-gray-500">{metric.period}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Experiments */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <span>Growth Experiments</span>
                  </CardTitle>
                  <CardDescription>
                    Active and planned growth optimization experiments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {experiments.map((experiment, index) => (
                      <motion.div
                        key={experiment.id}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{experiment.title}</h4>
                              <Badge 
                                variant={
                                  experiment.status === 'running' ? 'default' :
                                  experiment.status === 'completed' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {experiment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{experiment.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{experiment.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    experiment.status === 'completed' ? 'bg-green-500' :
                                    experiment.status === 'running' ? 'bg-purple-500' : 'bg-gray-400'
                                  }`}
                                  style={{ width: `${experiment.progress}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Expected Impact:</span>
                                <p className="font-medium text-green-600">{experiment.impact}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Confidence:</span>
                                <p className="font-medium">{experiment.confidence}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Duration:</span>
                                <p className="font-medium">{experiment.duration}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {experiment.status === 'running' ? (
                              <Button variant="outline" size="sm">
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                            ) : experiment.status === 'planning' ? (
                              <Button variant="outline" size="sm">
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Results
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Growth Opportunities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>Growth Opportunities</span>
                  </CardTitle>
                  <CardDescription>
                    AI-identified growth potential
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {growthOpportunities.map((opportunity, index) => (
                      <motion.div
                        key={opportunity.id}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-sm">{opportunity.title}</h4>
                          <Badge 
                            variant={opportunity.priority === 'High' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {opportunity.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{opportunity.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Potential:</span>
                            <span className="font-medium text-green-600">{opportunity.potential}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Effort:</span>
                            <span className="font-medium">{opportunity.effort}</span>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="w-full mt-3">
                          <Rocket className="h-4 w-4 mr-2" />
                          Create Experiment
                        </Button>
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
