'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, MapPin } from 'lucide-react'
import { api, AnalyticsOverview, RevenueAnalytics, Restaurant } from '@/services/api'

interface DashboardStats {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: React.ElementType
}

export function AnalyticsDashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [overviewRes, revenueRes, restaurantsRes] = await Promise.all([
        api.analytics.overview(),
        api.analytics.revenue(selectedPeriod),
        api.restaurants.list({ limit: 10 })
      ])

      setOverview(overviewRes.data)
      setRevenueData(revenueRes.data)
      setRestaurants(restaurantsRes.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const stats: DashboardStats[] = overview ? [
    {
      title: 'Total Revenue',
      value: `$${overview.revenue.total.toLocaleString()}`,
      change: `+${overview.revenue.monthly_growth}%`,
      changeType: 'increase',
      icon: DollarSign
    },
    {
      title: 'Total Customers',
      value: overview.customers.total.toLocaleString(),
      change: `+${overview.customers.growth_rate}%`,
      changeType: 'increase',
      icon: Users
    },
    {
      title: 'Total Orders',
      value: overview.orders.total.toLocaleString(),
      change: `$${overview.orders.average_order_value}`,
      changeType: 'increase',
      icon: ShoppingCart
    },
    {
      title: 'Active Restaurants',
      value: restaurants.filter(r => r.is_active).length.toString(),
      change: `${restaurants.length} total`,
      changeType: 'increase',
      icon: MapPin
    }
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time insights from BiteBase Intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadDashboardData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm flex items-center gap-1 ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>
              {revenueData?.period} revenue analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${revenueData.total_revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-green-600">+{revenueData.growth_rate.toFixed(1)}%</p>
                  </div>
                </div>
                
                {/* Simple Bar Chart Visualization */}
                <div className="space-y-2">
                  {revenueData.time_series.slice(-7).map((item, index) => {
                    const maxRevenue = Math.max(...revenueData.time_series.map(d => d.revenue))
                    const width = (item.revenue / maxRevenue) * 100
                    
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-gray-600">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(width, 10)}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              ${item.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Revenue by week breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {overview && (
              <div className="space-y-4">
                {overview.revenue.weekly_data.map((week, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{week.week}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${week.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restaurant List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Restaurants</CardTitle>
          <CardDescription>Top performing restaurants in your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {restaurants.slice(0, 5).map((restaurant) => (
              <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">{restaurant.address}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {restaurant.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {restaurant.cuisine_types.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{restaurant.average_rating || 'N/A'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{restaurant.total_reviews} reviews</p>
                  <p className="text-xs text-green-600 font-medium">
                    ${restaurant.estimated_revenue?.toLocaleString() || 'N/A'} revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
            <CardDescription>Busiest times for customer activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overview.orders.peak_hours.map((hour, index) => (
                <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{hour}</p>
                  <p className="text-sm text-gray-600">Peak Hour</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AnalyticsDashboard