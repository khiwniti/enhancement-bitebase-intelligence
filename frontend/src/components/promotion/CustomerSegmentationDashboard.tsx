'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Crown,
  Heart,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Mail,
  Gift,
  RefreshCw,
  Download,
  Settings,
  PieChart,
  BarChart3
} from 'lucide-react'

interface CustomerSegment {
  segment_id: string
  segment_name: string
  customer_count: number
  percentage: number
  avg_order_value: number
  visit_frequency: number
  lifetime_value: number
  churn_risk: 'low' | 'medium' | 'high'
  recommended_actions: string[]
  characteristics: {
    recency_score: number
    frequency_score: number
    monetary_score: number
  }
}

interface SegmentationMetrics {
  total_customers: number
  active_customers: number
  new_customers_this_month: number
  churn_rate: number
  segments: CustomerSegment[]
  campaign_performance: Array<{
    segment: string
    campaign_name: string
    open_rate: number
    click_rate: number
    conversion_rate: number
    roi: number
  }>
}

interface CustomerSegmentationDashboardProps {
  restaurantId: string
}

export function CustomerSegmentationDashboard({ restaurantId }: CustomerSegmentationDashboardProps) {
  const [segmentationData, setSegmentationData] = useState<SegmentationMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null)
  const [viewMode, setViewMode] = useState<'segments' | 'campaigns' | 'insights'>('segments')

  useEffect(() => {
    loadSegmentationData()
  }, [restaurantId])

  const loadSegmentationData = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'
      const response = await fetch(
        `${API_BASE_URL}/api/v1/promotion-intelligence/customer-segmentation/${restaurantId}`
      )
      const result = await response.json()
      
      if (result.success) {
        setSegmentationData(result.data)
      } else {
        generateMockData()
      }
    } catch (error) {
      console.error('Failed to load segmentation data:', error)
      generateMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockData = () => {
    const mockSegments: CustomerSegment[] = [
      {
        segment_id: 'vip',
        segment_name: 'VIP Champions',
        customer_count: 234,
        percentage: 12.3,
        avg_order_value: 85.50,
        visit_frequency: 8.2,
        lifetime_value: 2450.00,
        churn_risk: 'low',
        recommended_actions: ['Exclusive offers', 'Early access to new menu items', 'Personal chef experiences'],
        characteristics: { recency_score: 9.2, frequency_score: 9.5, monetary_score: 9.8 }
      },
      {
        segment_id: 'loyal',
        segment_name: 'Loyal Regulars',
        customer_count: 567,
        percentage: 29.8,
        avg_order_value: 45.20,
        visit_frequency: 4.1,
        lifetime_value: 890.00,
        churn_risk: 'low',
        recommended_actions: ['Loyalty rewards', 'Birthday specials', 'Referral incentives'],
        characteristics: { recency_score: 8.1, frequency_score: 8.7, monetary_score: 6.5 }
      },
      {
        segment_id: 'potential',
        segment_name: 'Potential Loyalists',
        customer_count: 432,
        percentage: 22.7,
        avg_order_value: 38.90,
        visit_frequency: 2.3,
        lifetime_value: 245.00,
        churn_risk: 'medium',
        recommended_actions: ['Engagement campaigns', 'Personalized recommendations', 'Frequency incentives'],
        characteristics: { recency_score: 6.8, frequency_score: 5.2, monetary_score: 7.1 }
      },
      {
        segment_id: 'at_risk',
        segment_name: 'At Risk',
        customer_count: 298,
        percentage: 15.6,
        avg_order_value: 32.10,
        visit_frequency: 1.2,
        lifetime_value: 156.00,
        churn_risk: 'high',
        recommended_actions: ['Win-back campaigns', 'Special discounts', 'Feedback surveys'],
        characteristics: { recency_score: 3.2, frequency_score: 2.8, monetary_score: 4.5 }
      },
      {
        segment_id: 'new',
        segment_name: 'New Customers',
        customer_count: 378,
        percentage: 19.6,
        avg_order_value: 28.75,
        visit_frequency: 1.0,
        lifetime_value: 28.75,
        churn_risk: 'medium',
        recommended_actions: ['Welcome series', 'First-time discounts', 'Onboarding campaigns'],
        characteristics: { recency_score: 9.0, frequency_score: 1.0, monetary_score: 3.2 }
      }
    ]

    const mockData: SegmentationMetrics = {
      total_customers: 1909,
      active_customers: 1531,
      new_customers_this_month: 378,
      churn_rate: 8.3,
      segments: mockSegments,
      campaign_performance: [
        { segment: 'VIP Champions', campaign_name: 'Exclusive Tasting', open_rate: 78.5, click_rate: 45.2, conversion_rate: 23.1, roi: 340 },
        { segment: 'Loyal Regulars', campaign_name: 'Birthday Special', open_rate: 65.3, click_rate: 32.1, conversion_rate: 18.7, roi: 280 },
        { segment: 'At Risk', campaign_name: 'Win Back Offer', open_rate: 42.1, click_rate: 15.8, conversion_rate: 8.9, roi: 120 }
      ]
    }

    setSegmentationData(mockData)
  }

  const getSegmentIcon = (segmentId: string) => {
    switch (segmentId) {
      case 'vip': return <Crown className="h-6 w-6 text-yellow-500" />
      case 'loyal': return <Heart className="h-6 w-6 text-red-500" />
      case 'potential': return <TrendingUp className="h-6 w-6 text-blue-500" />
      case 'at_risk': return <AlertTriangle className="h-6 w-6 text-orange-500" />
      case 'new': return <UserPlus className="h-6 w-6 text-green-500" />
      default: return <Users className="h-6 w-6 text-gray-500" />
    }
  }

  const getSegmentColor = (segmentId: string) => {
    switch (segmentId) {
      case 'vip': return 'bg-yellow-50 border-yellow-200'
      case 'loyal': return 'bg-red-50 border-red-200'
      case 'potential': return 'bg-blue-50 border-blue-200'
      case 'at_risk': return 'bg-orange-50 border-orange-200'
      case 'new': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getChurnRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (!segmentationData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading customer segmentation...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Segmentation</h3>
          <p className="text-gray-600">RFM analysis and targeted marketing insights</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSegmentationData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{segmentationData.total_customers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">{segmentationData.active_customers.toLocaleString()}</p>
                <p className="text-xs text-green-600">
                  {((segmentationData.active_customers / segmentationData.total_customers) * 100).toFixed(1)}% active
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">{segmentationData.new_customers_this_month.toLocaleString()}</p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">{segmentationData.churn_rate.toFixed(1)}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights & Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segmentationData.segments.map((segment) => (
              <motion.div
                key={segment.segment_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={`${getSegmentColor(segment.segment_id)} border-2 rounded-xl p-6 cursor-pointer transition-all duration-300`}
                onClick={() => setSelectedSegment(segment)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getSegmentIcon(segment.segment_id)}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{segment.segment_name}</h4>
                      <p className="text-sm text-gray-600">{segment.customer_count} customers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{segment.percentage.toFixed(1)}%</div>
                    <Badge className={getChurnRiskBadge(segment.churn_risk)}>
                      {segment.churn_risk} risk
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Order Value:</span>
                    <span className="font-medium">{formatCurrency(segment.avg_order_value)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Visit Frequency:</span>
                    <span className="font-medium">{segment.visit_frequency.toFixed(1)}/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lifetime Value:</span>
                    <span className="font-medium">{formatCurrency(segment.lifetime_value)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{segment.characteristics.recency_score.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">Recency</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{segment.characteristics.frequency_score.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">Frequency</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{segment.characteristics.monetary_score.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">Monetary</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Campaign Performance by Segment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segmentationData.campaign_performance.map((campaign, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{campaign.campaign_name}</h4>
                        <p className="text-sm text-gray-600">Target: {campaign.segment}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {campaign.roi}% ROI
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{campaign.open_rate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">Open Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{campaign.click_rate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">Click Rate</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{campaign.conversion_rate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">Conversion</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Actionable Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">AI-powered insights and recommendations will be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">
                  Automated campaign suggestions, churn prevention strategies, and growth opportunities
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
