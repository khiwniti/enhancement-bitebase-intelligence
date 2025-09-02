'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Lightbulb,
  Zap,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  insights?: {
    type: 'metric' | 'trend' | 'recommendation'
    title: string
    value?: string
    description: string
  }[]
}

const quickActions = [
  {
    id: 'revenue-analysis',
    title: 'Revenue Analysis',
    description: 'Get insights on your revenue trends',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    prompt: 'Analyze my revenue trends for the past month and provide insights'
  },
  {
    id: 'customer-behavior',
    title: 'Customer Behavior',
    description: 'Understand your customer patterns',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    prompt: 'What are the key customer behavior patterns I should know about?'
  },
  {
    id: 'performance-metrics',
    title: 'Performance Metrics',
    description: 'Review key business metrics',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-500',
    prompt: 'Show me my key performance metrics and highlight any concerns'
  },
  {
    id: 'growth-opportunities',
    title: 'Growth Opportunities',
    description: 'Discover new growth potential',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
    prompt: 'What growth opportunities should I focus on based on my data?'
  }
]

const sampleMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hello! I\'m your AI Business Assistant. I can help you analyze your restaurant data, provide insights, and answer questions about your business performance. What would you like to know?',
    timestamp: new Date(Date.now() - 300000),
    suggestions: ['Show revenue trends', 'Analyze customer behavior', 'Review performance metrics']
  }
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim()
    if (!messageContent) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(messageContent),
        timestamp: new Date(),
        insights: generateInsights(messageContent),
        suggestions: ['Tell me more', 'Show related data', 'What should I do next?']
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }

  const generateAIResponse = (prompt: string): string => {
    const responses = {
      revenue: "Based on your revenue data, I can see a 15% increase compared to last month. Your peak hours are between 12-2 PM and 6-8 PM. The weekend performance is particularly strong with Saturday showing the highest revenue.",
      customer: "Your customer analysis shows interesting patterns: 65% are repeat customers, average visit frequency is 2.3 times per month, and customer satisfaction scores are at 4.2/5. I notice a growing trend in takeout orders.",
      performance: "Your key metrics look healthy overall. Revenue is up 15%, customer retention is at 68%, and average order value increased by 8%. However, I notice some opportunities in operational efficiency during peak hours.",
      growth: "I've identified several growth opportunities: expanding your delivery radius could increase revenue by 20%, introducing a loyalty program might boost repeat visits, and optimizing your menu based on popular items could improve margins.",
      default: "I understand you're asking about your restaurant business. I can help analyze your data, identify trends, and provide actionable insights. Could you be more specific about what aspect you'd like to explore?"
    }

    const lowerPrompt = prompt.toLowerCase()
    if (lowerPrompt.includes('revenue') || lowerPrompt.includes('sales')) return responses.revenue
    if (lowerPrompt.includes('customer') || lowerPrompt.includes('behavior')) return responses.customer
    if (lowerPrompt.includes('performance') || lowerPrompt.includes('metric')) return responses.performance
    if (lowerPrompt.includes('growth') || lowerPrompt.includes('opportunity')) return responses.growth
    return responses.default
  }

  const generateInsights = (prompt: string) => {
    const insights = [
      {
        type: 'metric' as const,
        title: 'Revenue Growth',
        value: '+15%',
        description: 'Compared to last month'
      },
      {
        type: 'trend' as const,
        title: 'Peak Hours',
        description: 'Highest activity between 12-2 PM and 6-8 PM'
      },
      {
        type: 'recommendation' as const,
        title: 'Optimization Opportunity',
        description: 'Consider staff scheduling adjustments during peak hours'
      }
    ]
    return insights.slice(0, Math.floor(Math.random() * 3) + 1)
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
  }

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
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Business Assistant</h1>
              <p className="text-gray-600">
                Your personal AI assistant for restaurant operations and decision making
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Online
            </Badge>
            <Badge className="bg-blue-100 text-blue-700">
              <Bot className="h-3 w-3 mr-1" />
              AI Model: GPT-4 Enhanced
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              <Sparkles className="h-3 w-3 mr-1" />
              Context-Aware
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col bg-white/90 backdrop-blur-sm border border-gray-200">
              <CardHeader className="pb-4 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-indigo-500" />
                  <span>Chat with AI Assistant</span>
                </CardTitle>
                <CardDescription>
                  Ask questions about your business data and get intelligent insights
                </CardDescription>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === 'user' 
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}>
                              {message.type === 'user' ? (
                                <User className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className={`rounded-2xl p-4 ${
                              message.type === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <div className="text-xs opacity-70 mt-2">
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>

                          {/* Insights */}
                          {message.insights && message.insights.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.insights.map((insight, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                  <div className="flex items-center space-x-2">
                                    {insight.type === 'metric' && <BarChart3 className="h-4 w-4 text-green-500" />}
                                    {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                                    {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-orange-500" />}
                                    <span className="font-medium text-sm">{insight.title}</span>
                                    {insight.value && (
                                      <Badge variant="secondary" className="text-xs">{insight.value}</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleSendMessage(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl p-4">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your restaurant business..."
                      className="pr-12"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      onClick={toggleVoiceInput}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  <Button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-4 bg-white/90 backdrop-blur-sm border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleSendMessage(action.prompt)}
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span>AI Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time data analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Predictive insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Natural language queries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Actionable recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Voice commands (coming soon)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
