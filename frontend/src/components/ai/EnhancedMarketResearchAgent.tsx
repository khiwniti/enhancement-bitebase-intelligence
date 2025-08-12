'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LocationCoordinates, LocationAnalysisResponse } from '@/types'
import { apiClient } from '@/lib/api-client'
import { 
  Brain, 
  MessageSquare, 
  Send, 
  Mic,
  MicOff,
  Loader2,
  Sparkles,
  TrendingUp,
  MapPin,
  Users,
  Building,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Camera,
  Download,
  Share,
  Bookmark,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Zap,
  Globe,
  Coffee,
  ChefHat,
  Utensils,
  Pizza
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isTyping?: boolean
  metadata?: {
    confidence?: number
    sources?: string[]
    visualData?: any
    recommendations?: string[]
    insights?: string[]
  }
}

interface ConversationContext {
  location?: LocationCoordinates
  cuisinePreferences?: string[]
  priceRange?: string
  businessType?: string
  analysisHistory: string[]
}

interface VisualInsight {
  type: 'chart' | 'map' | 'metric' | 'comparison'
  data: any
  title: string
  description: string
}

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 touch-manipulation"
  >
    <div className="flex space-x-1">
      <motion.div
        className="w-2 h-2 bg-orange-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-orange-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-orange-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </div>
    <span className="text-xs sm:text-sm">AI is analyzing your request...</span>
  </motion.div>
)

const MessageBubble = ({ message, isUser }: { message: Message; isUser: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "flex items-start gap-2 sm:gap-3 max-w-full sm:max-w-4xl px-2 sm:px-0",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn("h-6 w-6 sm:h-8 sm:w-8 shrink-0", isUser ? "ml-1 sm:ml-2" : "mr-1 sm:mr-2")}>
        <AvatarFallback className={cn(
          isUser 
            ? "bg-blue-500 text-white text-xs" 
            : "bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs"
        )}>
          {isUser ? "U" : <Brain className="h-3 w-3 sm:h-4 sm:w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[85%] sm:max-w-[85%] min-w-0",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm touch-manipulation",
          isUser 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md"
        )}>
          {message.isTyping ? (
            <TypingIndicator />
          ) : (
            <div className="space-y-2">
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              
              {/* Confidence & Sources */}
              {!isUser && message.metadata && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  {message.metadata.confidence && (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {(message.metadata.confidence * 100).toFixed(0)}% Confident
                    </Badge>
                  )}
                  {message.metadata.sources && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      <Globe className="h-3 w-3 mr-1" />
                      {message.metadata.sources.length} Sources
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visual Insights */}
        {!isUser && message.metadata?.visualData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <VisualInsightCard data={message.metadata.visualData} />
          </motion.div>
        )}

        {/* AI Insights & Recommendations */}
        {!isUser && (message.metadata?.insights || message.metadata?.recommendations) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full space-y-2"
          >
            {message.metadata.insights && (
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-purple-500" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {message.metadata.insights.map((insight, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Zap className="h-3 w-3 text-purple-500 mt-0.5 shrink-0" />
                        {insight}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {message.metadata.recommendations && (
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {message.metadata.recommendations.map((rec, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                        {rec}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Timestamp */}
        <div className={cn(
          "text-xs text-gray-500 dark:text-gray-400 px-1",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}

const VisualInsightCard = ({ data }: { data: VisualInsight[] }) => {
  return (
    <div className="grid gap-4">
      {data.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                <div className="flex items-center gap-1">
                  {insight.type === 'chart' && <BarChart3 className="h-4 w-4 text-blue-500" />}
                  {insight.type === 'map' && <MapPin className="h-4 w-4 text-green-500" />}
                  {insight.type === 'metric' && <TrendingUp className="h-4 w-4 text-orange-500" />}
                </div>
              </div>
              <CardDescription className="text-xs">{insight.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <VisualInsightRenderer insight={insight} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

const VisualInsightRenderer = ({ insight }: { insight: VisualInsight }) => {
  switch (insight.type) {
    case 'metric':
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {insight.data.metrics?.map((metric: any, index: number) => (
            <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                {metric.value}
                {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
            </div>
          ))}
        </div>
      )
    
    case 'chart':
      return (
        <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <div className="font-medium text-gray-900 dark:text-gray-100">Interactive Chart</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {insight.data.chartType} • {insight.data.dataPoints} data points
            </div>
          </div>
        </div>
      )
    
    case 'map':
      return (
        <div className="h-48 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <div className="font-medium text-gray-900 dark:text-gray-100">Location Analysis</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {insight.data.locations} locations analyzed
            </div>
          </div>
        </div>
      )
    
    case 'comparison':
      return (
        <div className="space-y-3">
          {insight.data.comparisons?.map((comparison: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: comparison.color }} />
                <span className="font-medium text-gray-900 dark:text-gray-100">{comparison.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-gray-100">{comparison.score}</div>
                <div className="text-xs text-gray-500">{comparison.metric}</div>
              </div>
            </div>
          ))}
        </div>
      )
    
    default:
      return <div className="text-gray-500">Unsupported visualization</div>
  }
}

const QuickSuggestions = ({ onSuggestionClick }: { onSuggestionClick: (suggestion: string) => void }) => {
  const suggestions = [
    { text: "Find the best pizza locations in Manhattan", icon: Pizza },
    { text: "Analyze coffee shop market in Brooklyn", icon: Coffee },
    { text: "Compare restaurant opportunities across NYC boroughs", icon: Building },
    { text: "Evaluate fine dining potential in SoHo", icon: ChefHat },
    { text: "Research breakfast spot opportunities near subway stations", icon: Utensils }
  ]

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Try asking about:
      </h4>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
          >
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 transition-colors">
              <suggestion.icon className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-orange-600 transition-colors" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
              {suggestion.text}
            </span>
            <Send className="h-3 w-3 text-gray-400 ml-auto group-hover:text-orange-500 transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function EnhancedMarketResearchAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Market Research Agent. I can help you analyze restaurant markets, find optimal locations, and provide data-driven insights. What would you like to explore today?",
      timestamp: new Date(),
      metadata: {
        confidence: 1.0
      }
    }
  ])
  
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [context, setContext] = useState<ConversationContext>({
    analysisHistory: []
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))

    // Generate mock visual data
    const visualData: VisualInsight[] = [
      {
        type: 'metric',
        title: 'Market Overview',
        description: 'Key metrics for the analyzed area',
        data: {
          metrics: [
            { label: 'Market Score', value: '8.7/10', trend: 'up' },
            { label: 'Competition', value: 'Moderate' },
            { label: 'Foot Traffic', value: '45K/day', trend: 'up' },
            { label: 'Avg. Rent', value: '$8.5K/mo' }
          ]
        }
      },
      {
        type: 'chart',
        title: 'Revenue Potential Analysis',
        description: 'Projected monthly revenue by restaurant type',
        data: {
          chartType: 'bar',
          dataPoints: 12
        }
      }
    ]

    const insights = [
      "High foot traffic during lunch hours (11AM-2PM) and dinner rush (6PM-9PM)",
      "Strong demographic match for casual dining and fast-casual concepts", 
      "Limited breakfast options present expansion opportunity",
      "Seasonal variation: 20% increase in summer months"
    ]

    const recommendations = [
      "Target lunch-focused menu with quick service options",
      "Consider breakfast/brunch expansion to capture morning traffic",
      "Price points should align with local spending: $12-25 per person",
      "Location within 2 blocks of subway entrance recommended"
    ]

    // Generate contextual response based on user message
    let responseText = ""
    if (userMessage.toLowerCase().includes('pizza')) {
      responseText = "I've analyzed the pizza market in your specified area. The data shows strong potential with moderate competition and high foot traffic. Here's what I found:"
    } else if (userMessage.toLowerCase().includes('coffee')) {
      responseText = "Coffee shop analysis complete! The market shows excellent morning traffic patterns and growing demand for specialty coffee. Key findings below:"
    } else {
      responseText = "I've completed the market research analysis for your query. Based on the data from multiple sources including foot traffic, demographics, and competition analysis, here are the key findings:"
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: responseText,
      timestamp: new Date(),
      metadata: {
        confidence: 0.87 + Math.random() * 0.1,
        sources: ['Google Places API', 'Census Data', 'Foot Traffic Analytics', 'Commercial Real Estate DB'],
        visualData,
        insights,
        recommendations
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    // Add user message
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      // Generate AI response
      const response = await generateResponse(userMessage.content)
      
      // Replace typing indicator with actual response
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(response))
      
      // Update context
      setContext(prev => ({
        ...prev,
        analysisHistory: [...prev.analysisHistory, userMessage.content]
      }))
      
    } catch (error) {
      console.error('Error generating response:', error)
      // Remove typing indicator and show error
      setMessages(prev => prev.filter(m => m.id !== 'typing'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceToggle = () => {
    if (!isVoiceRecording) {
      // Start recording
      setIsVoiceRecording(true)
      // Simulate voice recording - in a real app, you'd use speech recognition API
      setTimeout(() => {
        setInputMessage("Find the best pizza locations in Manhattan")
        setIsVoiceRecording(false)
      }, 3000)
    } else {
      // Stop recording
      setIsVoiceRecording(false)
    }
  }

  const exportConversation = () => {
    const conversationData = {
      messages: messages.filter(m => !m.isTyping),
      timestamp: new Date(),
      context
    }
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `market-research-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar - Quick Actions & Suggestions */}
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">AI Research Agent</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Powered by advanced ML</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Online & Ready</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={exportConversation}>
                <Download className="h-4 w-4 mr-2" />
                Export Analysis
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bookmark className="h-4 w-4 mr-2" />
                Save Session
              </Button>
            </div>
          </div>

          {/* Analysis Stats */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Session Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Queries</span>
                <span className="font-medium">{messages.filter(m => m.type === 'user').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Locations Analyzed</span>
                <span className="font-medium">{context.analysisHistory.length * 12}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg. Confidence</span>
                <span className="font-medium">94%</span>
              </div>
            </div>
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && <QuickSuggestions onSuggestionClick={setInputMessage} />}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Market Research Chat</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask questions in natural language and get comprehensive market analysis
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active Session
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.type === 'user'}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about market opportunities, location analysis, competition..."
                    disabled={isLoading}
                    className="pr-12 min-h-[44px] text-base"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceToggle}
                    className={cn(
                      "absolute right-1 top-1 h-8 w-8 p-0",
                      isVoiceRecording ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {isVoiceRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="h-11 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Input Hints */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>
                {inputMessage.length}/1000
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}