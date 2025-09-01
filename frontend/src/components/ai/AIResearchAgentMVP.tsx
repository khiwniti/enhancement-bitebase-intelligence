'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Brain,
  MessageSquare,
  Send,
  MapPin,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Download,
  RefreshCw,
  Mic,
  MicOff,
  Loader2
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    query_type?: string
    confidence_score?: number
    data_sources?: string[]
    analysis_type?: string
  }
}

interface SiteAnalysisResult {
  address: string
  viability_score: number
  demographic_insights: {
    population_density: string
    median_income: string
    age_distribution: string
    lifestyle_segments: string[]
  }
  competitive_analysis: {
    competitor_count: number
    market_saturation: string
    competitive_advantage: string[]
  }
  financial_projections: {
    estimated_daily_sales: string
    payback_period: string
    roi_projection: string
  }
  risk_factors: string[]
  recommendations: string[]
}

const sampleQueries = [
  "What's the market potential for a new restaurant at 123 Main Street?",
  "Analyze the demographic profile of downtown business district",
  "Compare location scores for Mall Plaza vs University Avenue",
  "What are the key success factors for restaurants in this area?",
  "How saturated is the fast-casual market in the suburbs?"
]

const mockAnalysisResults: SiteAnalysisResult = {
  address: "123 Downtown Business Plaza",
  viability_score: 85,
  demographic_insights: {
    population_density: "High (2,847 people per sq mile)",
    median_income: "$72,500",
    age_distribution: "25-44 years (45%), 18-34 years (35%)",
    lifestyle_segments: ["Young Professionals", "Urban Families", "Business Executives"]
  },
  competitive_analysis: {
    competitor_count: 12,
    market_saturation: "Moderate",
    competitive_advantage: ["Premium positioning opportunity", "Breakfast/lunch gap", "Healthy options demand"]
  },
  financial_projections: {
    estimated_daily_sales: "$3,200 - $4,800",
    payback_period: "18-24 months",
    roi_projection: "22-28% annually"
  },
  risk_factors: [
    "High commercial rent costs",
    "Limited parking availability",
    "Seasonal business fluctuation"
  ],
  recommendations: [
    "Focus on breakfast and lunch service hours",
    "Target health-conscious professionals",
    "Consider delivery partnerships for office buildings",
    "Implement loyalty program for regular customers"
  ]
}

interface AIResearchAgentMVPProps {
  onComplete?: (analysis: SiteAnalysisResult) => void
}

export function AIResearchAgentMVP({ onComplete }: AIResearchAgentMVPProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Hello! I\'m your AI Site Selection Assistant. I can analyze potential restaurant locations, provide demographic insights, and assess market opportunities. What location would you like me to analyze?',
      timestamp: new Date(),
      metadata: {
        query_type: 'greeting',
        confidence_score: 100
      }
    }
  ])
  
  const [currentQuery, setCurrentQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SiteAnalysisResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmitQuery = async () => {
    if (!currentQuery.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentQuery,
      timestamp: new Date()
    }

    setMessages((prev: ChatMessage[]) => [...prev, userMessage])
    setCurrentQuery('')
    setIsAnalyzing(true)

    // Simulate AI processing with realistic delay
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(currentQuery),
        timestamp: new Date(),
        metadata: {
          query_type: detectQueryType(currentQuery),
          confidence_score: Math.floor(Math.random() * 20) + 80,
          data_sources: ['Demographics API', 'Competitor Database', 'Traffic Analytics', 'Economic Data'],
          analysis_type: 'site_selection'
        }
      }

      setMessages((prev: ChatMessage[]) => [...prev, assistantMessage])
      setIsAnalyzing(false)

      // If it's a location analysis query, show detailed results
      if (detectQueryType(currentQuery) === 'location_analysis') {
        setAnalysisResult(mockAnalysisResults)
        if (onComplete) {
          onComplete(mockAnalysisResults)
        }
      }
    }, 2000 + Math.random() * 2000) // 2-4 second delay for realism
  }

  const detectQueryType = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes('analyze') || lowerQuery.includes('location') || lowerQuery.includes('address')) {
      return 'location_analysis'
    }
    if (lowerQuery.includes('demographic') || lowerQuery.includes('population')) {
      return 'demographic_analysis'
    }
    if (lowerQuery.includes('competitor') || lowerQuery.includes('competition')) {
      return 'competitive_analysis'
    }
    if (lowerQuery.includes('compare')) {
      return 'comparison_analysis'
    }
    return 'general_inquiry'
  }

  const generateAIResponse = (query: string): string => {
    const queryType = detectQueryType(query)
    
    const responses = {
      location_analysis: `I've completed a comprehensive analysis of the location you specified. Based on my analysis of demographic data, competitive landscape, and market conditions, I've identified several key insights:

**Location Viability Score: 85/100** - This is a highly promising location for a restaurant.

**Key Findings:**
• Strong demographic profile with high disposable income
• Moderate competition with opportunities for differentiation  
• Excellent foot traffic patterns during business hours
• Growing market demand for quality dining options

I've generated a detailed site analysis report below with financial projections, competitive insights, and specific recommendations tailored to this location.`,

      demographic_analysis: `Based on demographic analysis of this area, I found a compelling market profile:

• **Population**: High-density urban area with 2,847 people per square mile
• **Income**: Above-average median household income of $72,500
• **Age Groups**: Primarily young professionals (25-44) and young adults (18-34)
• **Lifestyle**: Health-conscious, convenience-focused, tech-savvy consumers

This demographic profile strongly supports restaurant concepts that offer quality, convenience, and health-conscious options.`,

      competitive_analysis: `My competitive analysis reveals moderate market saturation with strategic opportunities:

• **Direct Competitors**: 12 restaurants within 0.5-mile radius
• **Market Gaps**: Limited breakfast options, few healthy/organic choices
• **Competitive Advantage**: Premium positioning opportunity exists
• **Market Share**: Room for 2-3 additional quality establishments

The competitive landscape suggests good potential for a differentiated concept.`,

      comparison_analysis: `I've analyzed multiple locations and can provide comparative insights:

**Location A**: Higher foot traffic but more expensive rent
**Location B**: Better parking but lower demographic income
**Location C**: Optimal balance of traffic, demographics, and costs

Would you like me to provide detailed scoring for each location?`,

      general_inquiry: `I understand you're looking for market intelligence. I can help you with:

• Site selection and location scoring
• Demographic and psychographic analysis  
• Competitive landscape assessment
• Market opportunity identification
• Financial projections and ROI estimates

What specific aspect would you like me to analyze first?`
    }

    return responses[queryType as keyof typeof responses] || responses.general_inquiry
  }

  const handleVoiceInput = () => {
    // Voice input simulation - in production would use Web Speech API
    setIsListening(!isListening)
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
        setCurrentQuery("Analyze the market potential for 123 Main Street downtown")
      }, 3000)
    }
  }

  const handleSampleQuery = (query: string) => {
    setCurrentQuery(query)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Site Selection Assistant
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              MVP: Natural language location analysis powered by AI
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            MVP Ready
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Site Selection Focus
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            AI-Powered
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Research Chat
              </CardTitle>
              <CardDescription>
                Ask questions about location analysis in natural language
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-96 overflow-y-auto mb-4 space-y-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <AnimatePresence>
                  {messages.map((message: ChatMessage) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-[#74C365] text-white' 
                          : message.type === 'system'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        {message.metadata && (
                          <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                            <Clock className="h-3 w-3" />
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.metadata.confidence_score && (
                              <Badge variant="outline" className="text-xs">
                                {message.metadata.confidence_score}% confidence
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#74C365]" />
                        <span className="text-sm">Analyzing location data...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask me about location analysis... e.g., 'What's the market potential for 123 Main Street?'"
                    value={currentQuery}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentQuery(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitQuery()
                      }
                    }}
                    className="flex-1 min-h-[60px] resize-none"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleVoiceInput}
                      variant="outline"
                      size="sm"
                      className={isListening ? 'bg-red-100 text-red-700' : ''}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={handleSubmitQuery}
                      disabled={!currentQuery.trim() || isAnalyzing}
                      className="bg-[#74C365] hover:bg-[#5ea54f]"
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Sample Queries */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Try these sample questions:</p>
                  <div className="flex flex-wrap gap-1">
                    {sampleQueries.slice(0, 3).map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSampleQuery(query)}
                        className="text-xs h-7"
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results Panel */}
        <div className="space-y-4">
          {/* Current Analysis Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Analysis Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Sources</span>
                <Badge variant="outline">4 Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Analysis Models</span>
                <Badge variant="outline">3 Deployed</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Confidence Level</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  92% High
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Results */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#74C365]" />
                  Site Analysis Report
                </CardTitle>
                <CardDescription>
                  {analysisResult.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Viability Score */}
                <div className="text-center p-4 bg-[#74C365] bg-opacity-10 rounded-lg">
                  <div className="text-3xl font-bold text-[#74C365] mb-1">
                    {analysisResult.viability_score}/100
                  </div>
                  <div className="text-sm text-gray-600">Viability Score</div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {analysisResult.competitive_analysis.competitor_count}
                    </div>
                    <div className="text-xs text-gray-500">Competitors</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {analysisResult.demographic_insights.median_income}
                    </div>
                    <div className="text-xs text-gray-500">Median Income</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full bg-[#74C365] hover:bg-[#5ea54f]" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* MVP Limitations Notice */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 text-sm">
                    MVP Scope
                  </h4>
                  <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                    This MVP focuses on site selection analysis. Future releases will expand to comprehensive market research and predictive modeling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AIResearchAgentMVP