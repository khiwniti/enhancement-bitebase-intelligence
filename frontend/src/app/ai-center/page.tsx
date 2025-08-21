'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/AppLayout'
import {
  Brain,
  Sparkles,
  Search,
  Target,
  TrendingUp,
  MessageSquare,
  Zap,
  ArrowRight,
  Lightbulb,
  Cpu,
  Star,
  Clock,
  BarChart3,
  Users
} from 'lucide-react'

interface AITool {
  id: string
  name: string
  description: string
  href: string
  icon: React.ComponentType<any>
  status: 'available' | 'coming-soon' | 'beta'
  features: string[]
  color: string
  stats?: {
    label: string
    value: string
  }
}

const aiTools: AITool[] = [
  {
    id: 'research-agent',
    name: 'AI Research Agent',
    description: 'Get intelligent market research and competitive analysis powered by AI',
    href: '/research-agent',
    icon: Sparkles,
    status: 'available',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Market trend analysis',
      'Competitor insights',
      'Customer behavior patterns',
      'Location-based research'
    ],
    stats: { label: 'Reports Generated', value: '1,247' }
  },
  {
    id: 'nl-query',
    name: 'Natural Language Query',
    description: 'Ask questions about your business in plain English and get instant insights',
    href: '/dashboard/nl-query',
    icon: Search,
    status: 'available',
    color: 'from-purple-500 to-pink-500',
    features: [
      'Voice commands',
      'Real-time answers',
      'Smart suggestions',
      'Query history'
    ],
    stats: { label: 'Queries Processed', value: '15.2K' }
  },
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    description: 'AI-powered forecasting for sales, demand, and business trends',
    href: '/analytics/predictive',
    icon: Target,
    status: 'beta',
    color: 'from-green-500 to-emerald-500',
    features: [
      'Sales forecasting',
      'Demand prediction',
      'Seasonal analysis',
      'Risk assessment'
    ],
    stats: { label: 'Accuracy Rate', value: '94%' }
  },
  {
    id: 'smart-insights',
    name: 'Smart Insights Engine',
    description: 'Automated discovery of business insights and anomaly detection',
    href: '/dashboard/insights',
    icon: Lightbulb,
    status: 'available',
    color: 'from-orange-500 to-red-500',
    features: [
      'Automated insights',
      'Anomaly detection',
      'Pattern recognition',
      'Alert system'
    ],
    stats: { label: 'Insights Found', value: '342' }
  },
  {
    id: 'ai-chatbot',
    name: 'AI Business Assistant',
    description: 'Your personal AI assistant for restaurant operations and decision making',
    href: '/ai-assistant',
    icon: MessageSquare,
    status: 'coming-soon',
    color: 'from-indigo-500 to-purple-500',
    features: [
      '24/7 availability',
      'Context-aware responses',
      'Action recommendations',
      'Learning capabilities'
    ]
  },
  {
    id: 'optimization-engine',
    name: 'AI Optimization Engine',
    description: 'Automatically optimize pricing, staffing, and inventory with AI',
    href: '/optimization',
    icon: Cpu,
    status: 'coming-soon',
    color: 'from-teal-500 to-blue-500',
    features: [
      'Price optimization',
      'Staff scheduling',
      'Inventory management',
      'Cost reduction'
    ]
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'insight',
    title: 'High demand predicted for weekend',
    description: 'AI forecasts 35% increase in orders this Saturday',
    time: '2 hours ago',
    icon: TrendingUp,
    color: 'text-green-500'
  },
  {
    id: 2,
    type: 'research',
    title: 'Market analysis completed',
    description: 'New competitive landscape report available',
    time: '4 hours ago',
    icon: Sparkles,
    color: 'text-blue-500'
  },
  {
    id: 3,
    type: 'query',
    title: 'Query: "Best selling items today"',
    description: 'Natural language query processed successfully',
    time: '6 hours ago',
    icon: Search,
    color: 'text-purple-500'
  }
]

export default function AIIntelligenceCenter() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Intelligence Center</h1>
              <p className="text-gray-600">Harness the power of artificial intelligence for your restaurant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'AI Models Active', value: '6', icon: Cpu, color: 'from-blue-500 to-cyan-500' },
              { label: 'Predictions Made', value: '2.4K', icon: Target, color: 'from-green-500 to-emerald-500' },
              { label: 'Insights Generated', value: '342', icon: Lightbulb, color: 'from-orange-500 to-red-500' },
              { label: 'Accuracy Rate', value: '94%', icon: Star, color: 'from-purple-500 to-pink-500' }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                      <metric.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-sm text-gray-600">{metric.label}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Tools Grid */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group cursor-pointer"
                    onMouseEnter={() => setSelectedTool(tool.id)}
                    onMouseLeave={() => setSelectedTool(null)}
                  >
                    <Card className="p-6 h-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                      {/* Tool Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center`}>
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge
                            variant={tool.status === 'available' ? 'default' : tool.status === 'beta' ? 'secondary' : 'outline'}
                            className={`text-xs ${
                              tool.status === 'available' ? 'bg-green-100 text-green-700' :
                              tool.status === 'beta' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {tool.status === 'available' ? 'Live' : tool.status === 'beta' ? 'Beta' : 'Coming Soon'}
                          </Badge>
                          {tool.stats && (
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">{tool.stats.value}</div>
                              <div className="text-xs text-gray-500">{tool.stats.label}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tool Content */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

                        {/* Features */}
                        <div className="space-y-2">
                          {tool.features.slice(0, 3).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        {tool.status === 'available' || tool.status === 'beta' ? (
                          <Link href={tool.href}>
                            <Button 
                              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                              size="sm"
                            >
                              <span>Open Tool</span>
                              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" className="w-full" size="sm" disabled>
                            <Clock className="h-4 w-4 mr-2" />
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent AI Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-5 w-5 text-orange-500 mr-2" />
                  Recent AI Activity
                </h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{activity.description}</div>
                        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Activity
                </Button>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    <Search className="h-4 w-4 mr-2" />
                    Ask AI Question
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Run Prediction
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Analyze Customers
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* AI Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 text-purple-500 mr-2" />
                  AI Tip of the Day
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Use natural language queries like "Show me my best selling items this month" to get instant insights without complex filters.
                </p>
                <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                  Try It Now
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}