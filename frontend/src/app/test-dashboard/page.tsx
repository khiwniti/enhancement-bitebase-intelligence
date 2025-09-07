'use client'

import React, { useState, useEffect } from 'react'

// Direct API call without the service layer for simplicity
const TestDashboard = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Test health endpoint first
        const healthResponse = await fetch('http://localhost:8000/health')
        if (!healthResponse.ok) {
          throw new Error('Backend not accessible')
        }
        const health = await healthResponse.json()
        console.log('Health check:', health)

        // Test restaurants endpoint
        const restaurantsResponse = await fetch('http://localhost:8000/api/v1/restaurants')
        if (!restaurantsResponse.ok) {
          throw new Error('Failed to fetch restaurants')
        }
        const restaurants = await restaurantsResponse.json()
        console.log('Restaurants:', restaurants)

        // Test analytics endpoint
        const analyticsResponse = await fetch('http://localhost:8000/api/v1/analytics/overview')
        if (!analyticsResponse.ok) {
          throw new Error('Failed to fetch analytics')
        }
        const analytics = await analyticsResponse.json()
        console.log('Analytics:', analytics)

        setData({
          health,
          restaurants: restaurants.data,
          analytics: analytics.data
        })
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🍽️ BiteBase Intelligence Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time restaurant analytics and insights
          </p>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🟢 System Status
          </h2>
          <p className="text-green-600 font-medium">
            ✅ Backend: {data?.health?.status}
          </p>
          <p className="text-sm text-gray-600">
            Service: {data?.health?.service} | 
            Version: {data?.health?.version} | 
            Last check: {data?.health?.timestamp}
          </p>
        </div>

        {/* Analytics Overview */}
        {data?.analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${data.analytics.revenue.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    +{data.analytics.revenue.monthly_growth}% from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  💰
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.analytics.customers.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600">
                    +{data.analytics.customers.growth_rate}% growth rate
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.analytics.orders.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-600">
                    Avg: ${data.analytics.orders.average_order_value}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  🛒
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Revenue */}
        {data?.analytics?.revenue?.weekly_data && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-2">Weekly Revenue Breakdown</h3>
            <p className="text-gray-600 mb-4">Revenue performance by week</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.analytics.revenue.weekly_data.map((week: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">{week.week}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${week.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Peak Hours */}
        {data?.analytics?.orders?.peak_hours && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-2">Peak Hours</h3>
            <p className="text-gray-600 mb-4">Busiest times for orders</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.analytics.orders.peak_hours.map((hour: string, index: number) => (
                <div key={index} className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{hour}</div>
                  <div className="text-sm text-gray-600">Peak Hour</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restaurant List */}
        {data?.restaurants && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-2">Active Restaurants</h3>
            <p className="text-gray-600 mb-4">Your restaurant network ({data.restaurants.length} total)</p>
            <div className="space-y-4">
              {data.restaurants.slice(0, 5).map((restaurant: any) => (
                <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600">{restaurant.address}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {restaurant.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {restaurant.cuisine_types.join(', ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {restaurant.price_range}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-500">⭐</span>
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
          </div>
        )}

        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            🧪 Integration Status
          </h3>
          <p className="text-gray-600 mb-4">Frontend-Backend communication test results</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Backend health check: PASSED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Restaurants API: PASSED ({data?.restaurants?.length || 0} restaurants loaded)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Analytics API: PASSED (Revenue, customers, orders data loaded)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Real-time data rendering: WORKING</span>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 SUCCESS: Frontend and Backend are communicating perfectly!
              </p>
              <p className="text-green-600 text-sm mt-1">
                All API endpoints are responding correctly and data is being displayed in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestDashboard