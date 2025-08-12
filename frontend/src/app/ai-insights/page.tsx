'use client'

import React from 'react'
import { motion } from 'framer-motion'
import MainLayout from '@/components/layout/MainLayout'
import { AIInsightsDashboard } from '@/components/ai/AIInsightsDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function AIInsightsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                AI Business Intelligence
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Harness the power of artificial intelligence to unlock actionable insights, 
              predict trends, and optimize your restaurant's performance with data-driven recommendations.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900">Smart Insights</h3>
                </div>
                <p className="text-sm text-gray-600">
                  AI-powered analysis identifies opportunities and risks in real-time
                </p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">Automated</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Predictive Analytics</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Forecast revenue, customer behavior, and market trends with 85%+ accuracy
                </p>
                <Badge className="mt-2 bg-green-100 text-green-800">ML-Powered</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Action Plans</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Get specific, actionable recommendations with clear implementation steps
                </p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Actionable</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="h-6 w-6 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">Real-time Updates</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Insights update continuously as new data flows through your systems
                </p>
                <Badge className="mt-2 bg-orange-100 text-orange-800">Live</Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Capabilities Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <span>AI Engine Capabilities</span>
                </CardTitle>
                <CardDescription>
                  Our advanced machine learning algorithms analyze multiple data streams to provide comprehensive business intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Revenue Optimization</span>
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Menu pricing optimization</li>
                      <li>• Demand forecasting</li>
                      <li>• Seasonal trend analysis</li>
                      <li>• Profit margin enhancement</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>Risk Detection</span>
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Customer churn prediction</li>
                      <li>• Cost overrun alerts</li>
                      <li>• Performance decline warnings</li>
                      <li>• Market threat identification</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Growth Opportunities</span>
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Market expansion analysis</li>
                      <li>• Customer acquisition strategies</li>
                      <li>• Operational efficiency gains</li>
                      <li>• Competitive advantage insights</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main AI Insights Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AIInsightsDashboard restaurantId="demo-restaurant-123" />
          </motion.div>

          {/* AI Technology Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle>Powered by Advanced AI Technology</CardTitle>
                <CardDescription>
                  Our AI engine leverages cutting-edge machine learning algorithms and industry best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">Neural Networks</div>
                    <p className="text-sm text-gray-600">Deep learning for pattern recognition and prediction</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">Time Series</div>
                    <p className="text-sm text-gray-600">ARIMA and Prophet models for forecasting</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">NLP Processing</div>
                    <p className="text-sm text-gray-600">Natural language analysis of customer feedback</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">Real-time ML</div>
                    <p className="text-sm text-gray-600">Continuous learning and model adaptation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Success Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Proven Results</h3>
                  <p className="text-purple-100">
                    Our AI insights have helped restaurants achieve measurable improvements
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">87%</div>
                    <p className="text-sm text-purple-100">Forecast Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">23%</div>
                    <p className="text-sm text-purple-100">Revenue Increase</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">31%</div>
                    <p className="text-sm text-purple-100">Cost Reduction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">45%</div>
                    <p className="text-sm text-purple-100">Faster Decisions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}
