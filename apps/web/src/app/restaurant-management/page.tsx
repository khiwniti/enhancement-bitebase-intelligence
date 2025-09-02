'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Building,
  Users,
  ChefHat,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Settings,
  Edit,
  Eye,
  Plus,
  Search,
  Filter,
  Activity,
  Target,
  BarChart3,
  Utensils
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import Link from 'next/link'

export default function RestaurantManagementPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch restaurants from backend
  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/v1/restaurants')
      const data = await response.json()
      setRestaurants(data)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  // Mock restaurants data as fallback (keeping for reference)
  const mockRestaurants = [
    {
      id: '1',
      name: 'Bangkok Bistro Central',
      type: 'Fine Dining',
      cuisine: 'Thai Fusion',
      status: 'active',
      rating: 4.8,
      reviews: 1247,
      address: '123 Sukhumvit Road, Bangkok',
      phone: '+66 2 123 4567',
      email: 'central@bangkokbistro.com',
      manager: 'Somchai Jaidee',
      staff: 24,
      capacity: 120,
      avgOrderValue: 850,
      monthlyRevenue: 2400000,
      openHours: '11:00 - 23:00',
      lastUpdated: '2 minutes ago',
      performance: 'excellent'
    },
    {
      id: '2',
      name: 'Street Food Paradise',
      type: 'Casual Dining',
      cuisine: 'Thai Street Food',
      status: 'active',
      rating: 4.6,
      reviews: 892,
      address: '456 Chatuchak Market, Bangkok',
      phone: '+66 2 234 5678',
      email: 'info@streetfoodparadise.com',
      manager: 'Niran Patel',
      staff: 12,
      capacity: 60,
      avgOrderValue: 320,
      monthlyRevenue: 890000,
      openHours: '10:00 - 22:00',
      lastUpdated: '15 minutes ago',
      performance: 'good'
    },
    {
      id: '3',
      name: 'Siam Spice House',
      type: 'Fast Casual',
      cuisine: 'Thai Traditional',
      status: 'active',
      rating: 4.4,
      reviews: 634,
      address: '789 Siam Square, Bangkok',
      phone: '+66 2 345 6789',
      email: 'contact@siamspice.com',
      manager: 'Apinya Wong',
      staff: 18,
      capacity: 80,
      avgOrderValue: 450,
      monthlyRevenue: 1200000,
      openHours: '09:00 - 21:00',
      lastUpdated: '1 hour ago',
      performance: 'good'
    },
    {
      id: '4',
      name: 'Royal Thai Kitchen',
      type: 'Fine Dining',
      cuisine: 'Royal Thai',
      status: 'planning',
      rating: 0,
      reviews: 0,
      address: '321 Silom Road, Bangkok',
      phone: '+66 2 456 7890',
      email: 'info@royalthai.com',
      manager: 'Kamon Srisuk',
      staff: 0,
      capacity: 150,
      avgOrderValue: 1200,
      monthlyRevenue: 0,
      openHours: 'TBD',
      lastUpdated: 'Planning phase',
      performance: 'projected'
    }
  ]

  const managementStats = [
    {
      title: 'Total Restaurants',
      value: '12',
      change: '+2 this quarter',
      icon: Building,
      color: 'text-blue-600'
    },
    {
      title: 'Active Locations',
      value: '10',
      change: '83% operational',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Total Staff',
      value: '248',
      change: '+15 this month',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Monthly Revenue',
      value: '₿8.2M',
      change: '+18% vs last month',
      icon: DollarSign,
      color: 'text-orange-600'
    }
  ]

  const performanceMetrics = [
    { restaurant: 'Bangkok Bistro Central', revenue: 2400000, rating: 4.8, orders: 1850, trend: 'up' },
    { restaurant: 'Siam Spice House', revenue: 1200000, rating: 4.4, orders: 1200, trend: 'up' },
    { restaurant: 'Street Food Paradise', revenue: 890000, rating: 4.6, orders: 980, trend: 'stable' },
    { restaurant: 'Thai Garden Cafe', revenue: 750000, rating: 4.2, orders: 850, trend: 'down' }
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
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-700">Maintenance</Badge>
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
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
                <p className="text-gray-600">
                  Manage all your restaurant locations and operations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search restaurants..." 
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/analytics">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-red-500 to-pink-500" asChild>
                <Link href="/location-intelligence">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Restaurant
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Management Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {managementStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-red-500 transition-all duration-300">
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
            {/* Restaurant List */}
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
                      <Utensils className="h-5 w-5 text-red-500" />
                      <span>Restaurant Portfolio</span>
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
                  <div className="space-y-6">
                    {restaurants.map((restaurant, index) => (
                      <motion.div
                        key={restaurant.id}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h4>
                              {getStatusBadge(restaurant.status)}
                              {getPerformanceBadge(restaurant.performance)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <ChefHat className="h-4 w-4" />
                                <span>{restaurant.cuisine}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4" />
                                <span>{restaurant.type}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{restaurant.address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{restaurant.openHours}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{restaurant.rating || 'N/A'}</span>
                                <span className="text-gray-500">({restaurant.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{restaurant.staff} staff</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="h-4 w-4 text-green-500" />
                                <span className="font-medium">{restaurant.capacity} seats</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/analytics">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/settings">
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/settings">
                                <Settings className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Monthly Revenue</p>
                            <p className="font-bold text-green-600">
                              ₿{restaurant.monthlyRevenue ? (restaurant.monthlyRevenue / 1000000).toFixed(1) + 'M' : 'TBD'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Avg Order Value</p>
                            <p className="font-bold text-blue-600">₿{restaurant.avgOrderValue || 'TBD'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Manager</p>
                            <p className="font-medium text-gray-900">{restaurant.manager}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{restaurant.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{restaurant.email}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">Updated {restaurant.lastUpdated}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance & Quick Actions */}
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
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Performance Ranking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric, index) => (
                      <motion.div
                        key={metric.restaurant}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{metric.restaurant}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>₿{(metric.revenue / 1000000).toFixed(1)}M</span>
                              <span>•</span>
                              <span>{metric.orders} orders</span>
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
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/location-intelligence">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Restaurant
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/settings">
                        <Users className="h-4 w-4 mr-2" />
                        Staff Management
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/settings">
                        <ChefHat className="h-4 w-4 mr-2" />
                        Menu Management
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/reports">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Performance Report
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Bulk Settings
                      </Link>
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
