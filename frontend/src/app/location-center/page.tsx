'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/AppLayout'
import {
  MapPin,
  Building,
  Target,
  Globe,
  Users,
  TrendingUp,
  ArrowRight,
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
  Settings
} from 'lucide-react'

interface LocationTool {
  id: string
  name: string
  description: string
  href: string
  icon: React.ComponentType<any>
  category: 'intelligence' | 'management' | 'analysis' | 'optimization'
  features: string[]
  color: string
  stats?: {
    label: string
    value: string
  }
}

const locationTools: LocationTool[] = [
  {
    id: 'place-intelligence',
    name: 'Place Intelligence',
    description: 'AI-powered location analytics and site selection optimization',
    href: '/place-intelligence',
    icon: MapPin,
    category: 'intelligence',
    color: 'from-orange-500 to-red-500',
    features: [
      'Site selection analysis',
      'Market penetration',
      'Competitor mapping',
      'Demographic insights'
    ],
    stats: { label: 'Locations analyzed', value: '2,847' }
  },
  {
    id: 'location-intelligence',
    name: 'Location Intelligence',
    description: 'Interactive maps with real-time location-based insights',
    href: '/location-intelligence',
    icon: Compass,
    category: 'intelligence',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Interactive mapping',
      'Heat map analysis',
      'Customer flow tracking',
      'Territory optimization'
    ],
    stats: { label: 'Map views', value: '12.4K' }
  },
  {
    id: 'multi-location',
    name: 'Multi-Location Management',
    description: 'Centralized management and comparison across multiple locations',
    href: '/multi-location',
    icon: Building,
    category: 'management',
    color: 'from-purple-500 to-pink-500',
    features: [
      'Cross-location analytics',
      'Performance comparison',
      'Centralized reporting',
      'Resource allocation'
    ],
    stats: { label: 'Locations managed', value: '47' }
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis',
    description: 'Deep market research and competitive landscape analysis',
    href: '/location/market-analysis',
    icon: Target,
    category: 'analysis',
    color: 'from-green-500 to-emerald-500',
    features: [
      'Market sizing',
      'Competitive analysis',
      'Growth opportunities',
      'Risk assessment'
    ],
    stats: { label: 'Markets analyzed', value: '156' }
  },
  {
    id: 'territory-optimization',
    name: 'Territory Optimization',
    description: 'Optimize delivery zones and service territories for maximum efficiency',
    href: '/location/territory',
    icon: Route,
    category: 'optimization',
    color: 'from-indigo-500 to-purple-500',
    features: [
      'Delivery zone optimization',
      'Service area planning',
      'Cost optimization',
      'Performance tracking'
    ],
    stats: { label: 'Zones optimized', value: '23' }
  },
  {
    id: 'location-scouting',
    name: 'Location Scouting',
    description: 'AI-powered recommendations for new restaurant locations',
    href: '/location/scouting',
    icon: Search,
    category: 'intelligence',
    color: 'from-teal-500 to-blue-500',
    features: [
      'AI location scoring',
      'Investment analysis',
      'Risk evaluation',
      'Market potential'
    ],
    stats: { label: 'Locations scored', value: '892' }
  }
]

const locationInsights = [
  {
    id: 1,
    title: 'High-potential area identified',
    description: 'Downtown district shows 85% location score for new restaurant',
    location: 'Downtown Financial District',
    score: 85,
    icon: Target,
    color: 'text-green-500'
  },
  {
    id: 2,
    title: 'Competitor analysis updated',
    description: 'New competitor opened 0.3 miles from main location',
    location: 'Main Street Location',
    score: 72,
    icon: Users,
    color: 'text-orange-500'
  },
  {
    id: 3,
    title: 'Territory optimization complete',
    description: 'Delivery zones updated for 15% efficiency improvement',
    location: 'West Side Territory',
    score: 92,
    icon: Route,
    color: 'text-blue-500'
  }
]

const performanceMetrics = [
  { label: 'Total Locations', value: '47', change: '+3', trend: 'up', icon: Building },
  { label: 'Avg Location Score', value: '78.5', change: '+2.3', trend: 'up', icon: Star },
  { label: 'Market Coverage', value: '84%', change: '+5%', trend: 'up', icon: Globe },
  { label: 'Territory Efficiency', value: '92%', change: '+7%', trend: 'up', icon: Target }
]

export default function LocationCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredTools = selectedCategory === 'all' 
    ? locationTools 
    : locationTools.filter(tool => tool.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All Tools', icon: MapPin },
    { id: 'intelligence', name: 'Intelligence', icon: Compass },
    { id: 'management', name: 'Management', icon: Building },
    { id: 'analysis', name: 'Analysis', icon: BarChart3 },
    { id: 'optimization', name: 'Optimization', icon: Target }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Location Center</h1>
                <p className="text-gray-600">Optimize your locations with intelligent geographical insights</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Map className="h-4 w-4 mr-2" />
                View Map
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                <Search className="h-4 w-4 mr-2" />
                Find New Location
              </Button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {performanceMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-sm text-gray-600">{metric.label}</div>
                      <div className={`text-xs flex items-center mt-1 ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                        {metric.change}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <metric.icon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter & Insights */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border border-orange-200'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Location Insights */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-5 w-5 text-orange-500 mr-2" />
                  Location Insights
                </h3>
                <div className="space-y-4">
                  {locationInsights.map((insight) => (
                    <div key={insight.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <insight.icon className={`h-4 w-4 ${insight.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{insight.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{insight.description}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{insight.location}</span>
                            <Badge variant="secondary" className="text-xs">
                              Score: {insight.score}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Insights
                </Button>
              </Card>
            </motion.div>
          </div>

          {/* Location Tools Grid */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCategory === 'all' ? 'All Location Tools' : `${categories.find(c => c.id === selectedCategory)?.name} Tools`}
                </h2>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {filteredTools.length} tools
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group cursor-pointer"
                  >
                    <Card className="p-6 h-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                      {/* Tool Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center`}>
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs mb-2 ${
                              tool.category === 'intelligence' ? 'bg-blue-100 text-blue-700' :
                              tool.category === 'management' ? 'bg-purple-100 text-purple-700' :
                              tool.category === 'analysis' ? 'bg-green-100 text-green-700' :
                              'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                          </Badge>
                          {tool.stats && (
                            <div>
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
                        <Link href={tool.href}>
                          <Button 
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                            size="sm"
                          >
                            <span>Open Tool</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Interactive Map Preview */}
              <div className="mt-8">
                <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Location Map</h3>
                      <p className="text-gray-600 text-sm">Visualize all your locations and explore new opportunities on our interactive map.</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Map className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      Open Map
                    </Button>
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                      <Camera className="h-4 w-4 mr-2" />
                      Street View
                    </Button>
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}