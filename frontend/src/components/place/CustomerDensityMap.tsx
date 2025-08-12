'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MapPin,
  Users,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Settings,
  Navigation,
  Thermometer,
  Activity
} from 'lucide-react'
import { InteractiveHeatmap } from '@/components/maps/InteractiveHeatmap'
import { MapboxHeatmap } from '@/components/maps/MapboxHeatmap'

interface HeatmapData {
  coordinates: {
    lat: number
    lng: number
  }
  intensity: number
  customer_count: number
  time_period: string
  demographic_info?: {
    age_group: string
    income_level: string
    visit_frequency: number
  }
}

interface DensityMetrics {
  total_customers: number
  peak_hours: string[]
  average_density: number
  hotspot_count: number
  coverage_radius_km: number
  demographic_breakdown: {
    age_groups: Record<string, number>
    income_levels: Record<string, number>
  }
}

interface CustomerDensityMapProps {
  restaurantId: string
}

export function CustomerDensityMap({ restaurantId }: CustomerDensityMapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [metrics, setMetrics] = useState<DensityMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('today')
  const [viewMode, setViewMode] = useState<'heatmap' | 'demographics' | 'trends'>('heatmap')

  useEffect(() => {
    loadDensityData()
  }, [restaurantId, selectedTimeframe])

  const loadDensityData = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'
      const response = await fetch(
        `${API_BASE_URL}/api/v1/place-intelligence/customer-density/${restaurantId}?timeframe=${selectedTimeframe}`
      )
      const result = await response.json()
      
      if (result.success) {
        setHeatmapData(result.data.heatmap_data || [])
        setMetrics(result.data.metrics || null)
      } else {
        // Mock data for demo
        generateMockData()
      }
    } catch (error) {
      console.error('Failed to load density data:', error)
      generateMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockData = () => {
    // Generate mock heatmap data
    const mockHeatmap: HeatmapData[] = []
    const baseCoords = { lat: 40.7128, lng: -74.0060 } // NYC example
    
    for (let i = 0; i < 50; i++) {
      mockHeatmap.push({
        coordinates: {
          lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
          lng: baseCoords.lng + (Math.random() - 0.5) * 0.02
        },
        intensity: Math.random() * 100,
        customer_count: Math.floor(Math.random() * 50) + 5,
        time_period: `${Math.floor(Math.random() * 24)}:00`,
        demographic_info: {
          age_group: ['18-25', '26-35', '36-45', '46-55', '55+'][Math.floor(Math.random() * 5)],
          income_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          visit_frequency: Math.random() * 10 + 1
        }
      })
    }

    const mockMetrics: DensityMetrics = {
      total_customers: 1247,
      peak_hours: ['12:00', '13:00', '18:00', '19:00'],
      average_density: 67.3,
      hotspot_count: 8,
      coverage_radius_km: 2.5,
      demographic_breakdown: {
        age_groups: {
          '18-25': 23,
          '26-35': 34,
          '36-45': 28,
          '46-55': 12,
          '55+': 3
        },
        income_levels: {
          'Low': 15,
          'Medium': 52,
          'High': 33
        }
      }
    }

    setHeatmapData(mockHeatmap)
    setMetrics(mockMetrics)
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'bg-red-500'
    if (intensity >= 60) return 'bg-orange-500'
    if (intensity >= 40) return 'bg-yellow-500'
    if (intensity >= 20) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 80) return 'Very High'
    if (intensity >= 60) return 'High'
    if (intensity >= 40) return 'Medium'
    if (intensity >= 20) return 'Low'
    return 'Very Low'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Density Heatmap</h3>
          <p className="text-gray-600">Real-time customer distribution and demographic insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDensityData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_customers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Density</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.average_density.toFixed(1)}%</p>
                </div>
                <Thermometer className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hotspots</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.hotspot_count}</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coverage</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.coverage_radius_km}km</p>
                </div>
                <Navigation className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="heatmap">Heatmap View</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <MapboxHeatmap
            restaurantLocation={{ lat: 40.7128, lng: -74.0060 }}
            heatmapData={heatmapData.map(point => ({
              id: `point_${Math.random().toString(36).substr(2, 9)}`,
              lat: point.coordinates.lat,
              lng: point.coordinates.lng,
              intensity: point.intensity,
              customer_count: point.customer_count,
              time_period: point.time_period,
              demographic_info: point.demographic_info
            }))}
            height={600}
          />
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(metrics.demographic_breakdown.age_groups).map(([age, percentage]) => (
                      <div key={age} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{age}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Income Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(metrics.demographic_breakdown.income_levels).map(([income, percentage]) => (
                      <div key={income} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{income}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Density Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Trend analysis charts will be implemented here</p>
                <p className="text-sm text-gray-400 mt-2">
                  Historical density patterns, peak time analysis, and seasonal trends
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
