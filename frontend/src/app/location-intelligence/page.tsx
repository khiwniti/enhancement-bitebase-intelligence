'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import {
  Globe,
  MapPin,
  Navigation,
  Target,
  TrendingUp,
  Users,
  Building,
  Star,
  DollarSign,
  Activity,
  Search,
  Filter,
  Layers,
  Zap,
  BarChart3,
  Eye
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'
import { realDataService, type EnhancedRestaurantData } from '@/shared/lib/data/real-data-service'
import { googleMapsService, type LocationData } from '@/shared/lib/maps/google-maps-service'
import { geminiAI } from '@/shared/lib/ai/gemini-service'
import { InteractiveMap } from '@/shared/components/interactive-map'

export default function LocationIntelligencePage() {
  const [selectedLocation, setSelectedLocation] = useState('bangkok-central')
  const [mapView, setMapView] = useState<'heatmap' | 'satellite'>('heatmap')

  const locationMetrics = [
    {
      title: 'Market Density',
      value: 'High',
      change: '+12%',
      icon: Building,
      color: 'text-red-600'
    },
    {
      title: 'Foot Traffic',
      value: '15.2K/day',
      change: '+8.5%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Competition Score',
      value: '7.8/10',
      change: '+0.3',
      icon: Target,
      color: 'text-orange-600'
    },
    {
      title: 'Revenue Potential',
      value: '₿2.4M/year',
      change: '+15%',
      icon: DollarSign,
      color: 'text-green-600'
    }
  ]

  const locationAnalysis = [
    {
      id: 'demographics',
      title: 'Demographics Analysis',
      description: 'Age, income, and lifestyle patterns in the area',
      status: 'completed',
      insights: 8,
      lastUpdated: '2 hours ago'
    },
    {
      id: 'competition',
      title: 'Competition Mapping',
      description: 'Competitor locations and market share analysis',
      status: 'completed',
      insights: 12,
      lastUpdated: '1 hour ago'
    },
    {
      id: 'traffic',
      title: 'Traffic Patterns',
      description: 'Foot traffic and vehicle flow analysis',
      status: 'processing',
      insights: 6,
      lastUpdated: '30 minutes ago'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Score',
      description: 'Public transport and parking availability',
      status: 'completed',
      insights: 4,
      lastUpdated: '3 hours ago'
    }
  ]

  const nearbyLocations = [
    {
      id: '1',
      name: 'Siam Square',
      type: 'Shopping District',
      distance: '0.8 km',
      score: 9.2,
      traffic: 'Very High',
      competition: 'High'
    },
    {
      id: '2',
      name: 'Chidlom BTS',
      type: 'Transport Hub',
      distance: '0.5 km',
      score: 8.7,
      traffic: 'High',
      competition: 'Medium'
    },
    {
      id: '3',
      name: 'Central World',
      type: 'Mall',
      distance: '1.2 km',
      score: 8.9,
      traffic: 'Very High',
      competition: 'Very High'
    },
    {
      id: '4',
      name: 'Lumpini Park',
      type: 'Recreation',
      distance: '1.5 km',
      score: 7.4,
      traffic: 'Medium',
      competition: 'Low'
    }
  ]

  const heatmapData = [
    { area: 'Central Business District', intensity: 95, revenue: '₿450K' },
    { area: 'Shopping Areas', intensity: 88, revenue: '₿380K' },
    { area: 'Residential Zones', intensity: 72, revenue: '₿290K' },
    { area: 'Transport Hubs', intensity: 91, revenue: '₿420K' },
    { area: 'Entertainment Districts', intensity: 85, revenue: '₿350K' }
  ]

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
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Location Intelligence</h1>
                <p className="text-gray-600">
                  Geographic analysis and market insights
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search locations..." 
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500">
                <MapPin className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
          </motion.div>

          {/* Location Metrics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {locationMetrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-green-500 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </CardTitle>
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <p className="text-xs text-green-600">{metric.change} from last month</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map View */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Navigation className="h-5 w-5 text-green-500" />
                      <span>Location Map</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={mapView === 'heatmap' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMapView('heatmap')}
                      >
                        <Layers className="h-4 w-4 mr-1" />
                        Heatmap
                      </Button>
                      <Button
                        variant={mapView === 'satellite' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMapView('satellite')}
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Satellite
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <InteractiveMap 
                    location={selectedLocation}
                    mapView={mapView}
                    onLocationChange={(location) => setSelectedLocation(location)}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Location Analysis */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Analysis Modules */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Analysis Modules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationAnalysis.map((analysis, index) => (
                      <motion.div
                        key={analysis.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{analysis.title}</h4>
                          <Badge 
                            variant={analysis.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {analysis.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{analysis.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{analysis.insights} insights</span>
                          <span>{analysis.lastUpdated}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2 text-xs" asChild>
                          <Link href="/analytics">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Link>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Nearby Locations */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <span>Nearby Locations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nearbyLocations.map((location, index) => (
                      <motion.div
                        key={location.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{location.name}</h4>
                            <p className="text-xs text-gray-600">{location.type}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs font-medium">{location.score}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Distance:</span>
                            <p className="font-medium">{location.distance}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Traffic:</span>
                            <p className="font-medium">{location.traffic}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Competition:</span>
                          <Badge 
                            variant={location.competition === 'High' || location.competition === 'Very High' ? 'default' : 'secondary'}
                            className="text-xs ml-2"
                          >
                            {location.competition}
                          </Badge>
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
