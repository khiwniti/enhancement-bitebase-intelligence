'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import EnhancedBiteBaseAI from './EnhancedBiteBaseAI'
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  MapPin,
  Users
} from 'lucide-react'

export default function AIResearchAgentPage() {
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze market trends and customer behavior"
    },
    {
      icon: TrendingUp,
      title: "Predictive Insights",
      description: "Forecast future trends and identify growth opportunities before your competitors"
    },
    {
      icon: Target,
      title: "Strategic Recommendations",
      description: "Get actionable recommendations tailored to your restaurant's specific needs"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Deep dive into your business metrics with comprehensive analytics"
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Understand your market position and identify expansion opportunities"
    },
    {
      icon: Users,
      title: "Customer Intelligence",
      description: "Gain insights into customer preferences and behavior patterns"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Brain className="h-8 w-8 text-white" />
          </div>
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900 mb-2">
          AI Research Agent
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl mx-auto">
          Harness the power of artificial intelligence to gain deep insights into your restaurant business,
          market trends, and customer behavior.
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced AI Assistant */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="w-full"
      >
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">Business Intelligence Assistant</CardTitle>
            </div>
            <CardDescription>
              Ask questions about your restaurant business and get AI-powered insights with detailed analytics,
              recommendations, and actionable strategies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedBiteBaseAI
              title="BiteBase AI Research Agent"
              placeholder="Ask me about sales trends, customer insights, operational efficiency, marketing strategies, or any business question..."
              className="border-0 shadow-none bg-transparent"
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
