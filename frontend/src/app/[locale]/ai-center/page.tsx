'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
  Brain,
  Sparkles,
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  Target,
  Lightbulb,
  Zap,
  ArrowLeft,
  MessageSquare,
  Activity,
  Eye,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function AICenterPage() {
  const locale = useLocale()
  const [activeModel, setActiveModel] = useState('gpt-4')

  const aiModels = [
    {
      id: 'gpt-4',
      name: 'GPT-4 Enhanced',
      description: 'Advanced language model for complex analysis',
      status: 'active',
      accuracy: '94%',
      speed: 'Fast',
      cost: 'Premium'
    },
    {
      id: 'claude-3',
      name: 'Claude 3 Sonnet',
      description: 'Balanced performance for business insights',
      status: 'active',
      accuracy: '92%',
      speed: 'Very Fast',
      cost: 'Standard'
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      description: 'Google\'s multimodal AI for data analysis',
      status: 'inactive',
      accuracy: '90%',
      speed: 'Fast',
      cost: 'Standard'
    }
  ]

  const aiCapabilities = [
    {
      id: 'predictive-analytics',
      title: 'Predictive Analytics',
      description: 'Forecast sales, demand, and customer behavior',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      accuracy: '89%',
      usage: '2.3K queries/day'
    },
    {
      id: 'customer-insights',
      title: 'Customer Insights',
      description: 'Deep analysis of customer patterns and preferences',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      accuracy: '92%',
      usage: '1.8K queries/day'
    },
    {
      id: 'revenue-optimization',
      title: 'Revenue Optimization',
      description: 'AI-driven pricing and menu optimization',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      accuracy: '87%',
      usage: '1.2K queries/day'
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Competitive intelligence and market trends',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      accuracy: '85%',
      usage: '950 queries/day'
    }
  ]

  const recentInsights = [
    {
      id: '1',
      title: 'Weekend Revenue Surge Detected',
      description: 'AI identified 34% higher revenue potential on weekends',
      type: 'revenue',
      confidence: '94%',
      impact: 'High',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      title: 'Customer Retention Pattern',
      description: 'New loyalty program could increase retention by 23%',
      type: 'customer',
      confidence: '87%',
      impact: 'Medium',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      title: 'Menu Optimization Opportunity',
      description: 'Removing 3 low-performing items could boost margins by 12%',
      type: 'optimization',
      confidence: '91%',
      impact: 'High',
      timestamp: '6 hours ago'
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
            <Link href={`/${locale}/dashboard`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Center</h1>
              <p className="text-gray-600">
                Manage AI models, capabilities, and intelligent insights
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-700">
              <Activity className="h-3 w-3 mr-1" />
              All Systems Online
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </motion.div>

        {/* AI Models Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <span>AI Models</span>
              </CardTitle>
              <CardDescription>
                Manage and monitor your AI model performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiModels.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="cursor-pointer"
                    onClick={() => setActiveModel(model.id)}
                  >
                    <Card className={`border-2 transition-all duration-300 ${
                      activeModel === model.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                          <Badge 
                            variant={model.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{model.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Accuracy:</span>
                            <span className="font-medium">{model.accuracy}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Speed:</span>
                            <span className="font-medium">{model.speed}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Cost:</span>
                            <span className="font-medium">{model.cost}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          {model.status === 'active' ? (
                            <Button variant="outline" size="sm" className="flex-1">
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="flex-1">
                              <Play className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Capabilities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span>AI Capabilities</span>
                </CardTitle>
                <CardDescription>
                  Active AI-powered business intelligence features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiCapabilities.map((capability, index) => (
                    <motion.div
                      key={capability.id}
                      className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${capability.color} rounded-lg flex items-center justify-center`}>
                          <capability.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{capability.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{capability.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Accuracy: {capability.accuracy}</span>
                            <span>•</span>
                            <span>{capability.usage}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>Recent AI Insights</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>
                  Latest AI-generated business insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInsights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <Badge 
                          variant={insight.impact === 'High' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {insight.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Confidence: {insight.confidence}</span>
                          <span>•</span>
                          <span>{insight.timestamp}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Discuss
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
