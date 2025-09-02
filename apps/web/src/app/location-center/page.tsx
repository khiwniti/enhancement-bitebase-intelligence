'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  MapPin,
  Building,
  Users,
  Star,
  TrendingUp,
  Navigation,
  Search,
  Filter,
  Plus,
  Eye,
  Settings,
  Activity,
  Target,
  Clock,
  DollarSign
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function LocationCenterPage() {
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  const locations = [
    {
      id: '1',
      name: 'Central Plaza Branch',
      address: '123 Sukhumvit Road, Bangkok',
      type: 'Restaurant',
      status: 'active',
      performance: 'excellent',
      revenue: '₿125K/month',
      customers: '2.3K/month',
      rating: 4.8,
      openHours: '10:00 - 22:00',
      lastUpdated: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Siam Square Outlet',
      address: '456 Rama I Road, Bangkok',
      type: 'Quick Service',
      status: 'active',
      performance: 'good',
      revenue: '₿89K/month',
      customers: '1.8K/month',
      rating: 4.6,
      openHours: '08:00 - 20:00',
      lastUpdated: '5 minutes ago'
    },
    {
      id: '3',
      name: 'Chatuchak Market Stand',
      address: '789 Chatuchak, Bangkok',
      type: 'Food Stall',
      status: 'active',
      performance: 'average',
      revenue: '₿45K/month',
      customers: '950/month',
      rating: 4.3,
      openHours: '06:00 - 18:00',
      lastUpdated: '1 hour ago'
    },
    {
      id: '4',
      name: 'Thonglor Branch',
      address: '321 Thonglor Road, Bangkok',
      type: 'Restaurant',
      status: 'planning',
      performance: 'projected',
      revenue: '₿95K/month',
      customers: '1.5K/month',
      rating: 0,
      openHours: 'TBD',
      lastUpdated: 'Planning phase'
    }
  ]

  const locationStats = [
    {
      title: 'Total Locations',
      value: '12',
      change: '+2 this month',
      icon: Building,
      color: 'text-blue-600'
    },
    {
      title: 'Active Locations',
      value: '10',
      change: '83% uptime',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Avg Performance',
      value: '4.6/5',
      change: '+0.2 this month',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Total Revenue',
      value: '₿1.2M',
      change: '+15% this month',
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ]

  const performanceMetrics = [
    { location: 'Central Plaza', revenue: 125000, customers: 2300, rating: 4.8, trend: 'up' },
    { location: 'Siam Square', revenue: 89000, customers: 1800, rating: 4.6, trend: 'up' },
    { location: 'Chatuchak', revenue: 45000, customers: 950, rating: 4.3, trend: 'stable' },
    { location: 'Silom Branch', revenue: 78000, customers: 1600, rating: 4.5, trend: 'down' }
  ]

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-700">Excellent</Badge>
      case 'good':
        return <Badge className="bg-blue-100 text-blue-700">Good</Badge>
      case 'average':
        return <Badge className="bg-yellow-100 text-yellow-700">Average</Badge>
      case 'projected':
        return <Badge className="bg-gray-100 text-gray-700">Projected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'planning':
        return <Badge className="bg-blue-100 text-blue-700">Planning</Badge>
      case 'closed':
        return <Badge className="bg-red-100 text-red-700">Closed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
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
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Location Center</h1>
                <p className="text-gray-600">
                  Manage and monitor all your business locations
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
                Filter
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
          </motion.div>

          {/* Location Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {locationStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-orange-500 transition-all duration-300">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Locations List */}
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
                      <Building className="h-5 w-5 text-orange-500" />
                      <span>All Locations</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        List
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locations.map((location, index) => (
                      <motion.div
                        key={location.id}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{location.name}</h4>
                              {getStatusBadge(location.status)}
                              {getPerformanceBadge(location.performance)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                            <p className="text-xs text-gray-500">Type: {location.type}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Revenue:</span>
                            <p className="font-medium text-green-600">{location.revenue}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Customers:</span>
                            <p className="font-medium">{location.customers}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Rating:</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <p className="font-medium">{location.rating || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Hours:</span>
                            <p className="font-medium">{location.openHours}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Updated {location.lastUpdated}</span>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Navigation className="h-3 w-3 mr-1" />
                            View on Map
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Overview */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Performance Ranking */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span>Performance Ranking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric, index) => (
                      <motion.div
                        key={metric.location}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{metric.location}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>₿{(metric.revenue / 1000).toFixed(0)}K</span>
                              <span>•</span>
                              <span>{metric.customers} customers</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs font-medium">{metric.rating}</span>
                          </div>
                          <TrendingUp 
                            className={`h-4 w-4 ${
                              metric.trend === 'up' ? 'text-green-500' : 
                              metric.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                            }`} 
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Location
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Navigation className="h-4 w-4 mr-2" />
                      Location Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Performance Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Bulk Settings
                    </Button>
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
