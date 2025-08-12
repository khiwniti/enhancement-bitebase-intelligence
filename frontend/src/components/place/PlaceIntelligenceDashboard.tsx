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
  TrendingUp,
  Target,
  Navigation,
  Building,
  Car,
  Clock,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { CustomerDensityMap } from './CustomerDensityMap'

interface CustomerDensityData {
  total_customers: number
  peak_hours: Array<{
    hour: number
    customer_count: number
    density_score: number
  }>
  geographic_distribution: Array<{
    area: string
    customer_count: number
    percentage: number
    avg_distance: number
  }>
  heatmap_data: Array<{
    lat: number
    lng: number
    intensity: number
  }>
}

interface SiteAnalysisData {
  current_location: {
    score: number
    demographics_score: number
    competition_score: number
    accessibility_score: number
    foot_traffic_score: number
  }
  recommendations: Array<{
    area: string
    score: number
    reasoning: string[]
    estimated_revenue_lift: number
  }>
}

interface DeliveryHotspotsData {
  hotspots: Array<{
    area: string
    order_density: number
    avg_delivery_time: number
    revenue_potential: number
    optimization_score: number
  }>
  coverage_analysis: {
    total_coverage_area: number
    underserved_areas: number
    optimal_zones: number
  }
}

export function PlaceIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [customerDensity, setCustomerDensity] = useState<CustomerDensityData | null>(null)
  const [siteAnalysis, setSiteAnalysis] = useState<SiteAnalysisData | null>(null)
  const [deliveryHotspots, setDeliveryHotspots] = useState<DeliveryHotspotsData | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState('restaurant-1')

  useEffect(() => {
    loadPlaceIntelligenceData()
  }, [selectedRestaurant])

  const loadPlaceIntelligenceData = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockCustomerDensity: CustomerDensityData = {
        total_customers: 2847,
        peak_hours: [
          { hour: 12, customer_count: 156, density_score: 85 },
          { hour: 13, customer_count: 189, density_score: 92 },
          { hour: 18, customer_count: 234, density_score: 98 },
          { hour: 19, customer_count: 198, density_score: 88 }
        ],
        geographic_distribution: [
          { area: 'Downtown Core', customer_count: 1247, percentage: 43.8, avg_distance: 0.8 },
          { area: 'Business District', customer_count: 892, percentage: 31.3, avg_distance: 1.2 },
          { area: 'Residential North', customer_count: 456, percentage: 16.0, avg_distance: 2.1 },
          { area: 'Suburban South', customer_count: 252, percentage: 8.9, avg_distance: 3.4 }
        ],
        heatmap_data: []
      }

      const mockSiteAnalysis: SiteAnalysisData = {
        current_location: {
          score: 78,
          demographics_score: 85,
          competition_score: 72,
          accessibility_score: 81,
          foot_traffic_score: 76
        },
        recommendations: [
          {
            area: 'Tech District Plaza',
            score: 92,
            reasoning: [
              'High foot traffic during lunch hours',
              'Limited competition in premium dining',
              'Strong demographic match with target customers'
            ],
            estimated_revenue_lift: 35
          },
          {
            area: 'University Quarter',
            score: 87,
            reasoning: [
              'Young demographic with high dining frequency',
              'Growing area with new developments',
              'Good public transportation access'
            ],
            estimated_revenue_lift: 28
          }
        ]
      }

      const mockDeliveryHotspots: DeliveryHotspotsData = {
        hotspots: [
          {
            area: 'Financial District',
            order_density: 45.2,
            avg_delivery_time: 18,
            revenue_potential: 8500,
            optimization_score: 94
          },
          {
            area: 'Medical Center',
            order_density: 38.7,
            avg_delivery_time: 22,
            revenue_potential: 6200,
            optimization_score: 87
          },
          {
            area: 'University Campus',
            order_density: 52.1,
            avg_delivery_time: 15,
            revenue_potential: 7800,
            optimization_score: 91
          }
        ],
        coverage_analysis: {
          total_coverage_area: 15.2,
          underserved_areas: 3,
          optimal_zones: 8
        }
      }

      setCustomerDensity(mockCustomerDensity)
      setSiteAnalysis(mockSiteAnalysis)
      setDeliveryHotspots(mockDeliveryHotspots)
    } catch (error) {
      console.error('Failed to load place intelligence data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 75) return 'bg-yellow-100 text-yellow-800'
    if (score >= 60) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Place Intelligence</h1>
              <p className="text-gray-600">Location analytics, site selection, and delivery optimization</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPlaceIntelligenceData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {customerDensity?.total_customers.toLocaleString() || 0}
                </div>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tracked customer locations
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Location Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {siteAnalysis?.current_location.score || 0}/100
                </div>
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current site performance
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Delivery Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {deliveryHotspots?.coverage_analysis.optimal_zones || 0}
                </div>
                <Navigation className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Optimized delivery areas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Peak Hour Density</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.max(...(customerDensity?.peak_hours.map(h => h.density_score) || [0]))}
                </div>
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum density score
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="customer-density">Customer Density</TabsTrigger>
              <TabsTrigger value="site-analysis">Site Analysis</TabsTrigger>
              <TabsTrigger value="delivery-hotspots">Delivery Hotspots</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Geographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Customer Geographic Distribution</span>
                  </CardTitle>
                  <CardDescription>
                    Where your customers are located and their distance from your restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerDensity?.geographic_distribution.map((area, index) => (
                      <div key={area.area} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-gray-900">{area.area}</div>
                            <div className="text-sm text-gray-500">
                              {area.customer_count} customers • {area.avg_distance} km avg distance
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{area.percentage}%</div>
                          <div className="text-sm text-gray-500">of total</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Site Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Current Location Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of your current location's performance factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'Demographics', score: siteAnalysis?.current_location.demographics_score || 0, icon: Users },
                      { name: 'Competition', score: siteAnalysis?.current_location.competition_score || 0, icon: Building },
                      { name: 'Accessibility', score: siteAnalysis?.current_location.accessibility_score || 0, icon: Car },
                      { name: 'Foot Traffic', score: siteAnalysis?.current_location.foot_traffic_score || 0, icon: Activity }
                    ].map((factor) => (
                      <div key={factor.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <factor.icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{factor.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getScoreBadge(factor.score)}>
                            {factor.score}/100
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer-density">
              <CustomerDensityMap restaurantId={selectedRestaurant} />
            </TabsContent>

            <TabsContent value="site-analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Site Selection Analysis</CardTitle>
                  <CardDescription>
                    AI-powered recommendations for optimal restaurant locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Site analysis component coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivery-hotspots">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Hotspots</CardTitle>
                  <CardDescription>
                    Optimize delivery zones and identify high-potential areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Delivery hotspots analysis coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
