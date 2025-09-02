'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import {
  Search,
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  Users,
  MapPin,
  Clock,
  Star,
  BookOpen,
  Zap,
  Filter,
  Download,
  Share,
  Play,
  Pause,
  RefreshCw,
  Eye
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

interface ResearchProject {
  id: string
  title: string
  description: string
  category: string
  status: string
  progress: number
  estimatedTime: string
  priority: string
  insights: number
  lastUpdated: string
  sources: number
  startDate: string
  agent: string
}

export default function ResearchAgentPage() {
  const [activeResearch, setActiveResearch] = useState('market-trends')
  const [searchQuery, setSearchQuery] = useState('')
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([])
  const [loading, setLoading] = useState(true)

  const researchCategories = [
    { id: 'market-trends', name: 'Market Trends', count: 12, icon: TrendingUp },
    { id: 'competitor-analysis', name: 'Competitor Analysis', count: 8, icon: Target },
    { id: 'customer-insights', name: 'Customer Insights', count: 15, icon: Users },
    { id: 'location-research', name: 'Location Research', count: 6, icon: MapPin },
    { id: 'industry-reports', name: 'Industry Reports', count: 9, icon: BookOpen }
  ]

  // Fetch research projects from backend
  const fetchResearchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/v1/research/projects')
      const data = await response.json()
      setResearchProjects(data)
    } catch (error) {
      console.error('Error fetching research projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResearchProjects()
  }, [])

  // Mock research projects as fallback (keeping for reference)
  const mockResearchProjects = [
    {
      id: '1',
      title: 'Thai Food Market Trends 2024',
      description: 'Comprehensive analysis of emerging trends in Thai cuisine market',
      category: 'market-trends',
      status: 'completed',
      progress: 100,
      insights: 24,
      sources: 156,
      startDate: '2024-01-15',
      completedDate: '2024-01-28',
      priority: 'high',
      agent: 'Market Intelligence AI'
    },
    {
      id: '2',
      title: 'Competitor Pricing Strategy Analysis',
      description: 'Deep dive into competitor pricing models and strategies',
      category: 'competitor-analysis',
      status: 'in-progress',
      progress: 65,
      insights: 18,
      sources: 89,
      startDate: '2024-01-20',
      completedDate: null,
      priority: 'high',
      agent: 'Competition AI'
    },
    {
      id: '3',
      title: 'Customer Behavior Post-Pandemic',
      description: 'Analysis of changing customer preferences and behaviors',
      category: 'customer-insights',
      status: 'completed',
      progress: 100,
      insights: 31,
      sources: 203,
      startDate: '2024-01-10',
      completedDate: '2024-01-25',
      priority: 'medium',
      agent: 'Customer Intelligence AI'
    },
    {
      id: '4',
      title: 'Bangkok Restaurant Location Hotspots',
      description: 'Identifying prime locations for new restaurant openings',
      category: 'location-research',
      status: 'scheduled',
      progress: 0,
      insights: 0,
      sources: 0,
      startDate: '2024-02-01',
      completedDate: null,
      priority: 'medium',
      agent: 'Location Intelligence AI'
    }
  ]

  const researchStats = [
    {
      title: 'Active Research',
      value: '8',
      change: '+3 this week',
      icon: Brain,
      color: 'text-blue-600'
    },
    {
      title: 'Insights Generated',
      value: '247',
      change: '+45 this week',
      icon: Lightbulb,
      color: 'text-yellow-600'
    },
    {
      title: 'Data Sources',
      value: '1,234',
      change: '+89 this week',
      icon: Search,
      color: 'text-green-600'
    },
    {
      title: 'Completed Projects',
      value: '156',
      change: '+12 this month',
      icon: Target,
      color: 'text-purple-600'
    }
  ]

  const recentInsights = [
    {
      id: '1',
      title: 'Plant-based menu items show 45% growth',
      category: 'Market Trends',
      confidence: 94,
      impact: 'High',
      source: 'Industry Reports'
    },
    {
      id: '2',
      title: 'Delivery orders peak at 7-8 PM on weekdays',
      category: 'Customer Behavior',
      confidence: 87,
      impact: 'Medium',
      source: 'Order Data Analysis'
    },
    {
      id: '3',
      title: 'Competitors reducing portion sizes by 15%',
      category: 'Competition',
      confidence: 91,
      impact: 'High',
      source: 'Menu Analysis'
    },
    {
      id: '4',
      title: 'Social media engagement highest on weekends',
      category: 'Marketing',
      confidence: 89,
      impact: 'Medium',
      source: 'Social Analytics'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-700">Scheduled</Badge>
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-700">Paused</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-xs">Medium</Badge>
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>
    }
  }

  const filteredProjects = activeResearch === 'all' 
    ? researchProjects 
    : researchProjects.filter(project => project.category === activeResearch)

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
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Research Agent</h1>
                <p className="text-gray-600">
                  AI-powered market research and business intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search research..." 
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                <Brain className="w-4 h-4 mr-2" />
                New Research
              </Button>
            </div>
          </motion.div>

          {/* Research Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {researchStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-cyan-500 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <motion.div
              className="lg:col-span-1 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Research Categories */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Research Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveResearch('all')}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                        activeResearch === 'all'
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium text-sm">All Research</span>
                      <Badge variant="secondary" className="text-xs">
                        {researchProjects.length}
                      </Badge>
                    </button>
                    {researchCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveResearch(category.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                          activeResearch === category.id
                            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <category.icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Insights */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>Recent Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentInsights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="font-medium text-sm text-gray-900 mb-1">{insight.title}</h4>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                          <Badge 
                            variant={insight.impact === 'High' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {insight.impact}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{insight.confidence}% confidence</span>
                          <span>{insight.source}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Research Projects */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-cyan-500" />
                    <span>Research Projects ({filteredProjects.length})</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered research projects and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{project.title}</h4>
                              {getStatusBadge(project.status)}
                              {getPriorityBadge(project.priority)}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            
                            {/* Progress Bar */}
                            {project.status !== 'scheduled' && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      project.status === 'completed' ? 'bg-green-500' :
                                      project.status === 'in-progress' ? 'bg-cyan-500' : 'bg-gray-400'
                                    }`}
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Insights:</span>
                                <p className="font-medium text-cyan-600">{project.insights}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Sources:</span>
                                <p className="font-medium">{project.sources}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Started:</span>
                                <p className="font-medium">{project.startDate}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Agent:</span>
                                <p className="font-medium">{project.agent}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {project.status === 'in-progress' ? (
                              <Button variant="outline" size="sm">
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                            ) : project.status === 'scheduled' ? (
                              <Button variant="outline" size="sm">
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/reports">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
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
