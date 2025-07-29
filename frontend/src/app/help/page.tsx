'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  BookOpen,
  Video,
  Code,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  Users,
  Zap,
  Shield,
  BarChart3,
  Map,
  Brain,
  Database,
  FileText,
  Settings,
  Play,
  Download,
  Copy,
  Check
} from 'lucide-react'

interface HelpCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  articles: HelpArticle[]
  color: string
}

interface HelpArticle {
  id: string
  title: string
  description: string
  content: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readTime: number
  lastUpdated: string
  popular: boolean
}

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: number
  thumbnail: string
  category: string
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  response: string
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of BiteBase Intelligence',
    icon: BookOpen,
    color: 'blue',
    articles: [
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        description: 'Get up and running with BiteBase Intelligence in 5 minutes',
        content: 'Welcome to BiteBase Intelligence! This guide will help you get started...',
        tags: ['basics', 'setup', 'onboarding'],
        difficulty: 'beginner',
        readTime: 5,
        lastUpdated: '2024-01-15',
        popular: true
      },
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Understanding your main dashboard and key metrics',
        content: 'The dashboard is your central hub for monitoring restaurant performance...',
        tags: ['dashboard', 'metrics', 'overview'],
        difficulty: 'beginner',
        readTime: 8,
        lastUpdated: '2024-01-14',
        popular: true
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    description: 'Master data analysis and reporting features',
    icon: BarChart3,
    color: 'green',
    articles: [
      {
        id: 'creating-reports',
        title: 'Creating Custom Reports',
        description: 'Build and customize reports for your business needs',
        content: 'Custom reports allow you to analyze specific aspects of your business...',
        tags: ['reports', 'analytics', 'customization'],
        difficulty: 'intermediate',
        readTime: 12,
        lastUpdated: '2024-01-13',
        popular: false
      },
      {
        id: 'kpi-tracking',
        title: 'KPI Tracking & Monitoring',
        description: 'Set up and monitor key performance indicators',
        content: 'Key Performance Indicators (KPIs) help you track business success...',
        tags: ['kpi', 'monitoring', 'performance'],
        difficulty: 'intermediate',
        readTime: 10,
        lastUpdated: '2024-01-12',
        popular: true
      }
    ]
  },
  {
    id: 'location-intelligence',
    title: 'Location Intelligence',
    description: 'Leverage geospatial data and mapping features',
    icon: Map,
    color: 'purple',
    articles: [
      {
        id: 'map-analysis',
        title: 'Map-Based Analysis',
        description: 'Analyze location data using interactive maps',
        content: 'Location intelligence helps you understand geographic patterns...',
        tags: ['maps', 'geospatial', 'analysis'],
        difficulty: 'intermediate',
        readTime: 15,
        lastUpdated: '2024-01-11',
        popular: true
      }
    ]
  },
  {
    id: 'ai-features',
    title: 'AI & Research Agent',
    description: 'Harness AI-powered insights and automation',
    icon: Brain,
    color: 'orange',
    articles: [
      {
        id: 'ai-research',
        title: 'AI Research Agent',
        description: 'Use AI to automate market research and insights',
        content: 'The AI Research Agent can help you discover market trends...',
        tags: ['ai', 'research', 'automation'],
        difficulty: 'advanced',
        readTime: 20,
        lastUpdated: '2024-01-10',
        popular: true
      }
    ]
  }
]

const tutorials: Tutorial[] = [
  {
    id: 'setup-first-dashboard',
    title: 'Setting Up Your First Dashboard',
    description: 'Learn how to create and customize your first dashboard with widgets and charts',
    duration: '8 min',
    difficulty: 'beginner',
    steps: 6,
    thumbnail: '/api/placeholder/300/200',
    category: 'Getting Started'
  },
  {
    id: 'location-analysis',
    title: 'Location Analysis Walkthrough',
    description: 'Discover how to analyze restaurant locations and market opportunities',
    duration: '12 min',
    difficulty: 'intermediate',
    steps: 8,
    thumbnail: '/api/placeholder/300/200',
    category: 'Location Intelligence'
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Market Insights',
    description: 'Leverage AI to generate automated market research and competitive analysis',
    duration: '15 min',
    difficulty: 'advanced',
    steps: 10,
    thumbnail: '/api/placeholder/300/200',
    category: 'AI Features'
  }
]

const apiEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/analytics/metrics',
    description: 'Retrieve key performance metrics',
    parameters: [
      { name: 'timeframe', type: 'string', required: false, description: 'Time period for metrics (7d, 30d, 90d)' },
      { name: 'location_id', type: 'string', required: false, description: 'Filter by specific location' }
    ],
    response: '{ "metrics": { "revenue": 125000, "orders": 1250, "growth": 15.2 } }'
  },
  {
    method: 'POST',
    path: '/api/v1/reports/generate',
    description: 'Generate a custom report',
    parameters: [
      { name: 'template_id', type: 'string', required: true, description: 'Report template identifier' },
      { name: 'parameters', type: 'object', required: true, description: 'Report configuration parameters' }
    ],
    response: '{ "report_id": "rpt_123", "status": "generating", "estimated_completion": "2024-01-15T10:30:00Z" }'
  },
  {
    method: 'GET',
    path: '/api/v1/locations/analyze',
    description: 'Analyze location data and market opportunities',
    parameters: [
      { name: 'lat', type: 'number', required: true, description: 'Latitude coordinate' },
      { name: 'lng', type: 'number', required: true, description: 'Longitude coordinate' },
      { name: 'radius', type: 'number', required: false, description: 'Analysis radius in meters (default: 1000)' }
    ],
    response: '{ "analysis": { "market_score": 8.5, "competition_level": "medium", "foot_traffic": "high" } }'
  }
]

export default function Help() {
  const [activeTab, setActiveTab] = useState('documentation')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800'
      case 'POST': return 'bg-green-100 text-green-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  )

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Help & Documentation</h1>
          <p className="text-slate-600 mt-1">Everything you need to master BiteBase Intelligence</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            {[
              { id: 'documentation', label: 'Documentation', icon: BookOpen },
              { id: 'tutorials', label: 'Video Tutorials', icon: Video },
              { id: 'api', label: 'API Reference', icon: Code },
              { id: 'support', label: 'Support', icon: MessageCircle }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'documentation' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-6 h-6" />
                      <h3 className="font-semibold">Quick Start</h3>
                    </div>
                    <p className="text-blue-100 text-sm mb-4">Get started in under 5 minutes</p>
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      Start Guide
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-6 h-6" />
                      <h3 className="font-semibold">Best Practices</h3>
                    </div>
                    <p className="text-green-100 text-sm mb-4">Learn from successful users</p>
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      View Tips
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6" />
                      <h3 className="font-semibold">Security Guide</h3>
                    </div>
                    <p className="text-purple-100 text-sm mb-4">Keep your data secure</p>
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      Learn More
                    </Button>
                  </div>
                </div>

                {/* Documentation Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Categories List */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                      {filteredCategories.map((category) => {
                        const Icon = category.icon
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(
                              selectedCategory === category.id ? null : category.id
                            )}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              selectedCategory === category.id
                                ? 'bg-blue-50 border-blue-200 text-blue-900'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <div className="text-left">
                                <div className="font-medium">{category.title}</div>
                                <div className="text-xs text-slate-500">{category.articles.length} articles</div>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${
                              selectedCategory === category.id ? 'rotate-90' : ''
                            }`} />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Articles */}
                  <div className="lg:col-span-2">
                    {selectedCategory ? (
                      <div>
                        {(() => {
                          const category = helpCategories.find(c => c.id === selectedCategory)
                          if (!category) return null

                          return (
                            <div>
                              <div className="flex items-center gap-3 mb-6">
                                <category.icon className="w-6 h-6 text-blue-600" />
                                <div>
                                  <h3 className="text-xl font-semibold text-slate-900">{category.title}</h3>
                                  <p className="text-slate-600">{category.description}</p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {category.articles.map((article) => (
                                  <div key={article.id} className="bg-white border border-slate-200 rounded-lg">
                                    <button
                                      onClick={() => setExpandedArticle(
                                        expandedArticle === article.id ? null : article.id
                                      )}
                                      className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium text-slate-900">{article.title}</h4>
                                            {article.popular && (
                                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                <Star className="w-3 h-3 mr-1" />
                                                Popular
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-slate-600 mb-3">{article.description}</p>
                                          <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {article.readTime} min read
                                            </div>
                                            <Badge className={getDifficultyColor(article.difficulty)}>
                                              {article.difficulty}
                                            </Badge>
                                            <div>Updated {article.lastUpdated}</div>
                                          </div>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                                          expandedArticle === article.id ? 'rotate-180' : ''
                                        }`} />
                                      </div>
                                    </button>

                                    <AnimatePresence>
                                      {expandedArticle === article.id && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="border-t border-slate-200"
                                        >
                                          <div className="p-4">
                                            <div className="prose prose-sm max-w-none">
                                              <p>{article.content}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                              {article.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                  {tag}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Category</h3>
                        <p className="text-slate-600">Choose a category from the left to view articles and guides</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tutorials' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Video Tutorials</h2>
                  <p className="text-slate-600">Step-by-step video guides to help you master BiteBase Intelligence</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTutorials.map((tutorial) => (
                    <div key={tutorial.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Play className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className={getDifficultyColor(tutorial.difficulty)}>
                            {tutorial.difficulty}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {tutorial.duration}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{tutorial.category}</Badge>
                          <span className="text-xs text-slate-500">{tutorial.steps} steps</span>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">{tutorial.title}</h3>
                        <p className="text-sm text-slate-600 mb-4">{tutorial.description}</p>
                        <Button className="w-full" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Watch Tutorial
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTutorials.length === 0 && (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No tutorials found</h3>
                    <p className="text-slate-600">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">API Reference</h2>
                  <p className="text-slate-600">Complete API documentation for developers</p>
                </div>

                {/* API Overview */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Getting Started</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Base URL</h4>
                      <div className="bg-slate-100 p-3 rounded-lg font-mono text-sm">
                        https://api.bitebase.ai/v1
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Authentication</h4>
                      <p className="text-sm text-slate-600 mb-2">Include your API key in the Authorization header:</p>
                      <div className="bg-slate-100 p-3 rounded-lg font-mono text-sm">
                        Authorization: Bearer YOUR_API_KEY
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Endpoints */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Endpoints</h3>

                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg">
                      <div className="p-4 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="font-mono text-sm">{endpoint.path}</code>
                        </div>
                        <p className="text-sm text-slate-600">{endpoint.description}</p>
                      </div>

                      <div className="p-4 space-y-4">
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div>
                            <h5 className="font-medium text-slate-900 mb-2">Parameters</h5>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param, paramIndex) => (
                                <div key={paramIndex} className="flex items-start gap-3 text-sm">
                                  <code className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">
                                    {param.name}
                                  </code>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-600">{param.type}</span>
                                      {param.required && (
                                        <Badge variant="outline" className="text-xs">required</Badge>
                                      )}
                                    </div>
                                    <p className="text-slate-600 mt-1">{param.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-slate-900">Response</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.response, `response-${index}`)}
                              className="h-6 px-2"
                            >
                              {copiedCode === `response-${index}` ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-slate-100 p-3 rounded-lg">
                            <pre className="font-mono text-xs text-slate-800 overflow-x-auto">
                              {JSON.stringify(JSON.parse(endpoint.response), null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Support & Contact</h2>
                  <p className="text-slate-600">Get help when you need it most</p>
                </div>

                {/* Support Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Live Chat</h3>
                    <p className="text-sm text-slate-600 mb-4">Get instant help from our support team</p>
                    <p className="text-xs text-slate-500 mb-4">Available 24/7</p>
                    <Button className="w-full">
                      Start Chat
                    </Button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
                    <p className="text-sm text-slate-600 mb-4">Send us a detailed message</p>
                    <p className="text-xs text-slate-500 mb-4">Response within 4 hours</p>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Phone Support</h3>
                    <p className="text-sm text-slate-600 mb-4">Speak directly with our experts</p>
                    <p className="text-xs text-slate-500 mb-4">Mon-Fri, 9AM-6PM PST</p>
                    <Button variant="outline" className="w-full">
                      Call Now
                    </Button>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {[
                      {
                        question: "How do I get started with BiteBase Intelligence?",
                        answer: "Follow our Quick Start Guide in the Documentation section to set up your account and create your first dashboard in under 5 minutes."
                      },
                      {
                        question: "Can I integrate with my existing POS system?",
                        answer: "Yes! BiteBase Intelligence supports integration with most major POS systems. Contact our support team for specific integration assistance."
                      },
                      {
                        question: "What data sources can I connect?",
                        answer: "You can connect to major Thai food delivery platforms like Wongnai, FoodPanda, GrabFood, and LINE MAN, as well as your own data sources via API."
                      },
                      {
                        question: "Is my data secure?",
                        answer: "Absolutely. We use enterprise-grade security measures including encryption, secure data centers, and compliance with international data protection standards."
                      }
                    ].map((faq, index) => (
                      <div key={index} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
                        <h4 className="font-medium text-slate-900 mb-2">{faq.question}</h4>
                        <p className="text-sm text-slate-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-slate-900 mb-1">Email</div>
                      <div className="text-slate-600">support@bitebase.ai</div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 mb-1">Phone</div>
                      <div className="text-slate-600">+1 (555) 123-4567</div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 mb-1">Address</div>
                      <div className="text-slate-600">123 Tech Street<br />San Francisco, CA 94105</div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 mb-1">Business Hours</div>
                      <div className="text-slate-600">Mon-Fri: 9AM-6PM PST<br />Sat-Sun: 10AM-4PM PST</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
