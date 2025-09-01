'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  MapPin,
  Building,
  Target,
  Globe,
  Users,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Map,
  BarChart3,
  Clock,
  Star,
  Navigation,
  Compass,
  Route,
  Camera,
  Zap,
  Eye,
  Settings,
  Plus,
  Download,
  RefreshCw,
  MessageSquare,
  Brain,
  Lightbulb
} from 'lucide-react'

interface GrowthTool {
  id: string
  name: string
  description: string
  category: 'market-research' | 'site-selection' | 'expansion-planning' | 'performance-analysis'
  features: string[]
  color: string
  stats?: {
    label: string
    value: string
  }
  href?: string
}

interface MarketInsight {
  id: string
  title: string
  description: string
  location: string
  score: number
  icon: React.ComponentType<any>
  color: string
  actionable: boolean
}

const growthTools: GrowthTool[] = [
  {
    id: 'ai-market-research',
    name: 'AI Market Research Agent',
    description: 'AI-powered market analysis and competitive intelligence',
    category: 'market-research',
    color: 'from-purple-500 to-pink-500',
    features: [
      'Natural language queries',
      'Automated market reports',
      'Competitive landscape analysis',
      'Demographic profiling'
    ],
    stats: { label: 'Reports generated', value: '2,847' },
    href: '/research-agent'
  },
  {
    id: 'location-scoring',
    name: 'AI Location Scoring',
    description: 'Intelligent site selection with proprietary scoring algorithm',
    category: 'site-selection',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Click-to-analyze maps',
      'Demographic overlays',
      'Traffic pattern analysis',
      'Proximity scoring'
    ],
    stats: { label: 'Locations scored', value: '12,450' }
  },
  {
    id: 'expansion-planner',
    name: 'Market Expansion Planner',
    description: 'Strategic planning tools for multi-location growth',
    category: 'expansion-planning',
    color: 'from-green-500 to-emerald-500',
    features: [
      'Territory optimization',
      'Cannibalization analysis',
      'ROI projections',
      'Risk assessment'
    ],
    stats: { label: 'Markets analyzed', value: '156' }
  },
  {
    id: 'competitor-intelligence',
    name: 'Competitor Intelligence',
    description: 'Real-time competitive analysis and monitoring',
    category: 'market-research',
    color: 'from-orange-500 to-red-500',
    features: [
      'Competitor mapping',
      'Price monitoring',
      'Market share analysis',
      'Trend identification'
    ],
    stats: { label: 'Competitors tracked', value: '892' }
  },
  {
    id: 'performance-benchmarking',
    name: 'Performance Benchmarking',
    description: 'Compare location performance against market standards',
    category: 'performance-analysis',
    color: 'from-indigo-500 to-purple-500',
    features: [
      'Cross-location comparison',
      'Industry benchmarks',
      'Performance gaps',
      'Improvement recommendations'
    ],
    stats: { label: 'Locations benchmarked', value: '47' }
  },
  {
    id: 'customer-flow-analysis',
    name: 'Customer Flow Analytics',
    description: 'Understand foot traffic patterns and customer behavior',
    category: 'performance-analysis',
    color: 'from-teal-500 to-blue-500',
    features: [
      'Heat map visualization',
      'Flow pattern analysis',
      'Peak time identification',
      'Capacity optimization'
    ],
    stats: { label: 'Flow patterns mapped', value: '23,451' }
  }
]

const marketInsights: MarketInsight[] = [
  {
    id: '1',
    title: 'High-Growth Market Identified',
    description: 'Downtown tech district shows 85% location viability score with growing demographic',
    location: 'Downtown Financial District',
    score: 85,
    icon: Target,
    color: 'text-green-500',
    actionable: true
  },
  {
    id: '2',
    title: 'Competitive Threat Alert',
    description: 'New premium competitor opened 0.3 miles from your highest-performing location',
    location: 'Main Street Location',
    score: 72,
    icon: Users,
    color: 'text-orange-500',
    actionable: true
  },
  {
    id: '3',
    title: 'Market Saturation Warning',
    description: 'Suburban mall area approaching optimal restaurant density threshold',
    location: 'Westfield Shopping Center',
    score: 61,
    icon: Building,
    color: 'text-red-500',
    actionable: false
  },
  {
    id: '4',
    title: 'Expansion Opportunity',
    description: 'University district shows strong demand-supply gap for healthy food options',
    location: 'University Campus Area',
    score: 78,
    icon: Lightbulb,
    color: 'text-blue-500',
    actionable: true
  }
]

const performanceMetrics = [
  { label: 'Market Coverage', value: '84%', change: '+5%', trend: 'up', icon: Globe },
  { label: 'Avg Location Score', value: '78.5', change: '+2.3', trend: 'up', icon: Star },
  { label: 'Expansion ROI', value: '23.4%', change: '+1.8%', trend: 'up', icon: TrendingUp },
  { label: 'Competitive Strength', value: '7.2/10', change: '+0.4', trend: 'up', icon: Target }
]

interface GrowthIntelligenceStudioProps {
  userRole?: string
  defaultView?: 'overview' | 'research' | 'planning' | 'analysis'
}

export function GrowthIntelligenceStudio({ 
  userRole = 'marketing-manager',
  defaultView = 'overview'
}: GrowthIntelligenceStudioProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'planning' | 'analysis'>(defaultView)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredTools = selectedCategory === 'all' 
    ? growthTools 
    : growthTools.filter(tool => tool.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All Tools', icon: MapPin },
    { id: 'market-research', name: 'Market Research', icon: Brain },
    { id: 'site-selection', name: 'Site Selection', icon: Compass },
    { id: 'expansion-planning', name: 'Expansion Planning', icon: Building },
    { id: 'performance-analysis', name: 'Performance Analysis', icon: BarChart3 }
  ]

  const filteredInsights = searchQuery 
    ? marketInsights.filter(insight => 
        insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : marketInsights

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Growth Intelligence Studio
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Market research, site selection, and expansion planning platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-[#74C365] text-white border-[#74C365]">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - Always visible */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {performanceMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.value}
                        </p>
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <metric.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">🎯 Market Overview</TabsTrigger>
            <TabsTrigger value="research">🧠 AI Research Agent</TabsTrigger>
            <TabsTrigger value="planning">📋 Expansion Planning</TabsTrigger>
            <TabsTrigger value="analysis">📊 Performance Analysis</TabsTrigger>
          </TabsList>

          {/* Market Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-[#74C365]" />
                    Market Insights
                  </CardTitle>
                  <CardDescription>
                    AI-generated insights from your market analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search insights..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    {filteredInsights.map((insight) => (
                      <div key={insight.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <insight.icon className={`h-5 w-5 ${insight.color}`} />
                            <div>
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                {insight.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {insight.location}
                              </p>
                            </div>
                          </div>
                          <Badge variant={insight.score >= 80 ? 'default' : insight.score >= 60 ? 'secondary' : 'outline'}>
                            {insight.score}/100
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#74C365]" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common growth intelligence tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-[#74C365] hover:bg-[#5ea54f]">
                    <Brain className="h-4 w-4 mr-2" />
                    Ask AI Research Agent
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Analyze New Location
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="h-4 w-4 mr-2" />
                    Compare Locations
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Generate Market Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Expansion Opportunities
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Research Agent Tab */}
          <TabsContent value="research" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#74C365]" />
                  AI Market Research Agent
                </CardTitle>
                <CardDescription>
                  Ask questions in natural language and get comprehensive market analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask anything about your market... e.g., 'What's the best location for a new store in downtown?'"
                      className="flex-1"
                    />
                    <Button className="bg-[#74C365] hover:bg-[#5ea54f]">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask AI
                    </Button>
                  </div>
                  
                  {/* Sample queries */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sample Questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "What's the market potential for downtown expansion?",
                        "How do my competitors price their menu items?",
                        "Which demographic segments should I target?",
                        "What are the best delivery zones for my restaurant?"
                      ].map((query) => (
                        <Button key={query} variant="outline" size="sm" className="text-xs">
                          {query}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Recent AI Reports */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                    <h4 className="font-medium text-sm mb-3">Recent AI Reports</h4>
                    <div className="space-y-2">
                      {[
                        { title: "Downtown Market Analysis", date: "2 hours ago", status: "completed" },
                        { title: "Competitor Price Analysis", date: "1 day ago", status: "completed" },
                        { title: "Demographic Study - University Area", date: "3 days ago", status: "completed" }
                      ].map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <p className="text-sm font-medium">{report.title}</p>
                            <p className="text-xs text-gray-500">{report.date}</p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expansion Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Market Expansion Planner
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Strategic planning tools for multi-location growth
                  </p>
                </div>
                <Button className="bg-[#74C365] hover:bg-[#5ea54f]">
                  <Plus className="h-4 w-4 mr-2" />
                  New Expansion Plan
                </Button>
              </div>

              {/* Expansion Planning Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Territory Optimization", desc: "Optimize delivery zones and service areas", icon: Route },
                  { title: "Cannibalization Analysis", desc: "Assess impact on existing locations", icon: Target },
                  { title: "ROI Projections", desc: "Financial modeling for new locations", icon: TrendingUp },
                  { title: "Risk Assessment", desc: "Identify and mitigate expansion risks", icon: Globe },
                  { title: "Market Sizing", desc: "Estimate market opportunity and potential", icon: BarChart3 },
                  { title: "Location Scoring", desc: "AI-powered site evaluation and ranking", icon: Star }
                ].map((tool, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#74C365] bg-opacity-10 rounded-lg">
                          <tool.icon className="h-5 w-5 text-[#74C365]" />
                        </div>
                        <h3 className="font-medium text-sm">{tool.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500">{tool.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Performance Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color} opacity-90 group-hover:opacity-100 transition-opacity`}>
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        {tool.stats && (
                          <Badge variant="secondary" className="text-xs">
                            {tool.stats.label}: {tool.stats.value}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-[#74C365] transition-colors">
                        {tool.name}
                      </CardTitle>
                      <CardDescription>
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {tool.features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {tool.features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{tool.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-4">
                          <Badge variant="outline" className="capitalize">
                            {tool.category.replace('-', ' ')}
                          </Badge>
                          <Button size="sm" className="bg-[#74C365] hover:bg-[#5ea54f]">
                            Open Tool
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default GrowthIntelligenceStudio