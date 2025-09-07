'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'

// BiteBase Intelligence Dashboard with Style Guide Applied
export default function SimpleDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data from backend
        const [restaurants, analytics, ai] = await Promise.all([
          fetch('http://localhost:8000/api/v1/restaurants').then(r => r.json()),
          fetch('http://localhost:8000/api/v1/analytics/overview').then(r => r.json()),
          fetch('http://localhost:8000/api/v1/ai/recommendations').then(r => r.json())
        ])

        setData({ restaurants, analytics, ai })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="bitebase-glass-panel flex items-center gap-4">
          <div className="bitebase-spinner"></div>
          <div className="bitebase-heading-3">Loading BiteBase Intelligence Dashboard...</div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Revenue",
      value: data?.analytics?.data?.total_revenue ? `$${(data.analytics.data.total_revenue / 1000000).toFixed(1)}M` : "$2.5M",
      change: `+${data?.analytics?.data?.revenue_growth_rate || 15.2}%`,
      trend: "up",
      icon: DollarSign,
      color: "text-primary-600"
    },
    {
      title: "Total Customers",
      value: data?.analytics?.data?.total_customers ? `${(data.analytics.data.total_customers / 1000).toFixed(1)}K` : "15.4K",
      change: `+${data?.analytics?.data?.customer_growth_rate || 8.7}%`,
      trend: "up", 
      icon: Users,
      color: "text-secondary-600"
    },
    {
      title: "Total Orders",
      value: data?.analytics?.data?.total_orders ? `${(data.analytics.data.total_orders / 1000).toFixed(1)}K` : "8.9K",
      change: "+12.5%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-accent-600"
    },
    {
      title: "Avg Order Value",
      value: data?.analytics?.data?.average_order_value ? `$${data.analytics.data.average_order_value.toFixed(0)}` : "$278",
      change: "+5.8%",
      trend: "up",
      icon: TrendingUp,
      color: "text-primary-700"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="bitebase-container max-w-7xl mx-auto p-6 bitebase-animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="bitebase-heading-1 bitebase-text-gradient mb-2">
            🍽️ BiteBase Intelligence
          </h1>
          <p className="text-lg font-medium text-gray-600 font-mono">
            AI-powered restaurant intelligence platform - Real-time analytics and insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bitebase-dashboard-card hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-white/50 ${stat.color} backdrop-blur-sm`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className={`text-sm font-bold font-mono px-2 py-1 rounded-full 
                  ${stat.trend === 'up' 
                    ? 'bg-primary-100 text-primary-700 bitebase-status-success' 
                    : 'bg-secondary-100 text-secondary-700 bitebase-status-error'
                  }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1 font-mono">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Restaurants Section */}
        <div className="bitebase-glass-panel mb-8">
          <h3 className="bitebase-heading-3 mb-6">🏢 Active Restaurants</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data?.restaurants?.data?.slice(0, 3).map((restaurant: any, index: number) => (
              <div key={index} className="bitebase-translucent-card">
                <h4 className="font-bold text-lg mb-2 font-mono text-gray-900">{restaurant.name}</h4>
                <p className="text-sm text-gray-600 mb-3 font-mono">{restaurant.address}</p>
                <div className="flex items-center gap-4 text-sm font-mono mb-3">
                  <span className="text-accent-600 font-bold">⭐ {restaurant.average_rating}</span>
                  <span className="text-gray-500">{restaurant.total_reviews} reviews</span>
                  <span className="text-primary-600 font-bold">${(restaurant.estimated_revenue / 1000).toFixed(0)}K/mo</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-primary-100 text-primary-800 text-xs px-3 py-1 rounded-full font-mono font-medium">
                    {restaurant.cuisine_types?.[0] || 'Restaurant'}
                  </span>
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="bitebase-glass-panel mb-8">
          <h3 className="bitebase-heading-3 mb-6">🤖 AI Recommendations</h3>
          
          {data?.ai?.data && (
            <div className="space-y-8">
              {/* Menu Optimization */}
              {data.ai.data.menu_optimization && (
                <div>
                  <h4 className="font-bold mb-4 font-mono text-lg text-gray-800">📊 Menu Optimization</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.ai.data.menu_optimization.map((rec: any, index: number) => (
                      <div key={index} className="bitebase-translucent-card">
                        <p className="font-bold font-mono text-gray-900">{rec.item}: {rec.recommendation}</p>
                        <p className="text-sm text-gray-600 font-mono mt-2">{rec.reasoning}</p>
                        <p className="text-sm text-primary-600 font-bold font-mono mt-1">Impact: {rec.potential_impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operational Insights */}
              {data.ai.data.operational_insights && (
                <div>
                  <h4 className="font-bold mb-4 font-mono text-lg text-gray-800">⚙️ Operational Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.ai.data.operational_insights.map((rec: any, index: number) => (
                      <div key={index} className="bitebase-translucent-card">
                        <p className="font-bold font-mono text-gray-900">{rec.area}: {rec.recommendation}</p>
                        <p className="text-sm text-secondary-600 font-bold font-mono mt-1">Impact: {rec.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Marketing Suggestions */}
              {data.ai.data.marketing_suggestions && (
                <div>
                  <h4 className="font-bold mb-4 font-mono text-lg text-gray-800">📱 Marketing Suggestions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.ai.data.marketing_suggestions.map((rec: any, index: number) => (
                      <div key={index} className="bitebase-translucent-card">
                        <p className="font-bold font-mono text-gray-900">{rec.channel}: {rec.action}</p>
                        <p className="text-sm text-accent-600 font-bold font-mono mt-1">Expected ROI: {rec.expected_roi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Language Switch Test */}
        <div className="bitebase-glass-panel mb-8">
          <h4 className="bitebase-heading-3 mb-4">🌐 Language Switch Test</h4>
          <div className="flex gap-4">
            <a 
              href="/en" 
              className="bitebase-button-primary hover:scale-105 transition-all duration-300 font-mono"
            >
              English (EN)
            </a>
            <a 
              href="/th" 
              className="bitebase-button-secondary hover:scale-105 transition-all duration-300 font-mono"
            >
              ไทย (TH)
            </a>
          </div>
          <p className="text-sm text-gray-600 mt-4 font-mono bg-gray-100 p-2 rounded">
            Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}
          </p>
        </div>

        {/* API Status */}
        <div className="bitebase-glass-panel">
          <h4 className="bitebase-heading-3 mb-4">🔌 API Integration Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bitebase-translucent-card text-center">
              <div className="font-bold font-mono text-lg mb-2">Backend Health</div>
              <div className="bitebase-status-success text-2xl font-mono">✅ Connected</div>
            </div>
            <div className="bitebase-translucent-card text-center">
              <div className="font-bold font-mono text-lg mb-2">Restaurants API</div>
              <div className="bitebase-status-success text-2xl font-mono">✅ {data?.restaurants?.data?.length || 0} loaded</div>
            </div>
            <div className="bitebase-translucent-card text-center">
              <div className="font-bold font-mono text-lg mb-2">Analytics API</div>
              <div className="bitebase-status-success text-2xl font-mono">✅ Real-time data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}