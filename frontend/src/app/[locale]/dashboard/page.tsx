'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import AnalyticsDashboard from '@/components/dashboard/analytics-dashboard'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// Mock data for dashboard
const mockStats = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    title: "Orders Today",
    value: "1,234",
    change: "+15.3%",
    trend: "up", 
    icon: ShoppingCart,
    color: "text-blue-600"
  },
  {
    title: "Active Customers",
    value: "2,345",
    change: "+7.2%",
    trend: "up",
    icon: Users,
    color: "text-purple-600"
  },
  {
    title: "Avg Order Value",
    value: "$36.50",
    change: "-2.4%",
    trend: "down",
    icon: TrendingUp,
    color: "text-orange-600"
  }
]

const recentOrders = [
  { id: "#12345", customer: "John Doe", amount: "$45.99", status: "completed", time: "2 min ago" },
  { id: "#12346", customer: "Jane Smith", amount: "$32.50", status: "preparing", time: "5 min ago" },
  { id: "#12347", customer: "Mike Johnson", amount: "$67.25", status: "delivered", time: "8 min ago" },
  { id: "#12348", customer: "Sarah Wilson", amount: "$28.75", status: "pending", time: "12 min ago" },
]

const topItems = [
  { name: "Margherita Pizza", orders: 45, revenue: "$675.00", trend: "up" },
  { name: "Caesar Salad", orders: 32, revenue: "$384.00", trend: "up" },
  { name: "Chicken Burger", orders: 28, revenue: "$420.00", trend: "down" },
  { name: "Pasta Carbonara", orders: 24, revenue: "$360.00", trend: "up" },
]

export default function DashboardPage() {
  const [bufferRadius, setBufferRadius] = useState(1000) // meters
  const [userLocation, setUserLocation] = useState({ lat: 13.7563, lng: 100.5018 }) // Bangkok default
  const [analysisData, setAnalysisData] = useState({
    totalRestaurants: 0,
    competitorCount: 0,
    averageRating: 0,
    marketDensity: 'Medium' as 'High' | 'Medium' | 'Low',
    topCuisines: [] as { cuisine: string; count: number }[],
    priceRange: { min: 0, max: 0 },
    peakHours: [] as string[]
  })

  // Fetch location analytics from backend
  const fetchLocationAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/analytics/location?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${bufferRadius}`)
      const data = await response.json()

      setAnalysisData({
        totalRestaurants: data.totalRestaurants,
        competitorCount: data.competitorCount,
        averageRating: data.averageRating,
        marketDensity: data.marketDensity,
        topCuisines: data.topCuisines,
        priceRange: data.priceRange,
        peakHours: data.peakHours
      })
    } catch (error) {
      console.error('Error fetching location analytics:', error)
    }
  }

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lng2-lng1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  // Fetch and analyze restaurants within buffer radius
  useEffect(() => {
    fetchLocationAnalytics()
  }, [bufferRadius, userLocation])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <motion.header 
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BiteBase Intelligence</h1>
                <p className="text-sm text-gray-600">Restaurant Analytics Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/analytics">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Location-Based Analysis Section */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 border-b border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Intelligence</h2>
            <p className="text-gray-600">
              Restaurant analysis within your selected area - Buffer Radius: {bufferRadius}m
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Buffer Radius:</label>
              <select
                value={bufferRadius}
                onChange={(e) => setBufferRadius(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={500}>500m</option>
                <option value={1000}>1km</option>
                <option value={2000}>2km</option>
                <option value={5000}>5km</option>
              </select>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/location-intelligence">
                <MapPin className="h-4 w-4 mr-2" />
                Update Location
              </Link>
            </Button>
          </div>
        </div>

        {/* Location Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                  <p className="text-2xl font-bold text-gray-900">{analysisData.totalRestaurants}</p>
                  <p className="text-xs text-gray-500">Within {bufferRadius}m radius</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Competitors</p>
                  <p className="text-2xl font-bold text-gray-900">{analysisData.competitorCount}</p>
                  <p className="text-xs text-gray-500">Direct competition</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{analysisData.averageRating}</p>
                  <p className="text-xs text-gray-500">Market standard</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Market Density</p>
                  <p className="text-2xl font-bold text-gray-900">{analysisData.marketDensity}</p>
                  <p className="text-xs text-gray-500">Competition level</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-orange-500" />
                <span>Top Cuisines in Area</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.topCuisines.map((item, index) => (
                  <div key={item.cuisine} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{item.cuisine}</span>
                    </div>
                    <span className="text-sm text-gray-500">{item.count} restaurants</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span>Price Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Price Range:</span>
                  <span className="font-bold text-gray-900">
                    ฿{analysisData.priceRange.min} - ฿{analysisData.priceRange.max}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Average Price:</span>
                  <span className="font-bold text-gray-900">
                    ฿{Math.round((analysisData.priceRange.min + analysisData.priceRange.max) / 2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Peak Hours:</span>
                  <div className="flex space-x-2">
                    {analysisData.peakHours.map((hour, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {hour}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back! 👋
              </h2>
              <p className="text-gray-600">
                Here's what's happening with your restaurant today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link href="/reports">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/analytics">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Link>
              </Button>
              <Button asChild>
                <Link href="/analytics-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {mockStats.map((stat, index) => (
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
                  <div className="flex items-center text-sm">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Orders
                  <Badge variant="secondary">Live</Badge>
                </CardTitle>
                <CardDescription>
                  Latest orders from your restaurant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.customer}</p>
                          <p className="text-sm text-gray-500">{order.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{order.amount}</p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                          <span className="text-xs text-gray-500">{order.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Items */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>
                  Best performing menu items today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.revenue}</p>
                        <div className="flex items-center">
                          {item.trend === 'up' ? (
                            <ArrowUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: BarChart3, label: "View Analytics", color: "from-blue-500 to-cyan-500", href: "/analytics" },
                  { icon: MapPin, label: "Location Insights", color: "from-purple-500 to-pink-500", href: "/location-intelligence" },
                  { icon: Brain, label: "AI Predictions", color: "from-green-500 to-emerald-500", href: "/ai-assistant" },
                  { icon: Activity, label: "Performance", color: "from-orange-500 to-red-500", href: "/reports" },
                ].map((action, index) => (
                  <Link key={action.label} href={action.href}>
                    <motion.button
                      className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 text-center group w-full"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    </motion.button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      </div>
    </DashboardLayout>
  )
}
