'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Target,
  Zap,
  Gift,
  Mail,
  TrendingUp,
  Heart,
  Star,
  Calendar,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Activity,
  Award,
  MessageSquare
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface CustomerSegment {
  segment_name: string
  customer_count: number
  percentage: number
  avg_order_value: number
  visit_frequency: number
  characteristics: string[]
  recommended_campaigns: string[]
}

interface AutomatedCampaign {
  campaign_id: string
  campaign_name: string
  target_segment: string
  campaign_type: 'email' | 'sms' | 'push' | 'social'
  status: 'active' | 'scheduled' | 'completed' | 'draft'
  performance: {
    sent: number
    opened: number
    clicked: number
    converted: number
    revenue_generated: number
  }
  next_send_date?: string
}

interface LoyaltyProgram {
  program_name: string
  total_members: number
  active_members: number
  tier_distribution: Array<{
    tier: string
    member_count: number
    benefits: string[]
  }>
  engagement_metrics: {
    avg_points_earned: number
    avg_points_redeemed: number
    retention_rate: number
  }
}

export function PromotionIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [automatedCampaigns, setAutomatedCampaigns] = useState<AutomatedCampaign[]>([])
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState('restaurant-1')

  useEffect(() => {
    loadPromotionIntelligenceData()
  }, [selectedRestaurant])

  const loadPromotionIntelligenceData = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockSegments: CustomerSegment[] = [
        {
          segment_name: 'VIP Customers',
          customer_count: 156,
          percentage: 12.3,
          avg_order_value: 65.50,
          visit_frequency: 8.2,
          characteristics: ['High spending', 'Frequent visits', 'Premium preferences'],
          recommended_campaigns: ['Exclusive menu previews', 'VIP events', 'Personal chef experiences']
        },
        {
          segment_name: 'Regular Diners',
          customer_count: 742,
          percentage: 58.7,
          avg_order_value: 32.75,
          visit_frequency: 3.1,
          characteristics: ['Consistent ordering', 'Price conscious', 'Family oriented'],
          recommended_campaigns: ['Family meal deals', 'Loyalty rewards', 'Birthday specials']
        },
        {
          segment_name: 'Occasional Visitors',
          customer_count: 368,
          percentage: 29.0,
          avg_order_value: 24.25,
          visit_frequency: 1.2,
          characteristics: ['Price sensitive', 'Special occasions', 'Promotion driven'],
          recommended_campaigns: ['Welcome back offers', 'Limited time discounts', 'Referral programs']
        }
      ]

      const mockCampaigns: AutomatedCampaign[] = [
        {
          campaign_id: 'camp_001',
          campaign_name: 'Weekend Warriors',
          target_segment: 'Regular Diners',
          campaign_type: 'email',
          status: 'active',
          performance: {
            sent: 742,
            opened: 445,
            clicked: 178,
            converted: 89,
            revenue_generated: 2847.50
          },
          next_send_date: '2024-01-15'
        },
        {
          campaign_id: 'camp_002',
          campaign_name: 'VIP Exclusive Preview',
          target_segment: 'VIP Customers',
          campaign_type: 'push',
          status: 'scheduled',
          performance: {
            sent: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            revenue_generated: 0
          },
          next_send_date: '2024-01-20'
        },
        {
          campaign_id: 'camp_003',
          campaign_name: 'Win-Back Special',
          target_segment: 'Occasional Visitors',
          campaign_type: 'sms',
          status: 'completed',
          performance: {
            sent: 368,
            opened: 294,
            clicked: 147,
            converted: 73,
            revenue_generated: 1769.25
          }
        }
      ]

      const mockLoyaltyProgram: LoyaltyProgram = {
        program_name: 'BiteBase Rewards',
        total_members: 1266,
        active_members: 892,
        tier_distribution: [
          {
            tier: 'Gold',
            member_count: 89,
            benefits: ['20% off all orders', 'Free delivery', 'Priority reservations']
          },
          {
            tier: 'Silver',
            member_count: 267,
            benefits: ['15% off orders', 'Birthday rewards', 'Early access to new menu']
          },
          {
            tier: 'Bronze',
            member_count: 536,
            benefits: ['10% off orders', 'Points on purchases', 'Member-only promotions']
          }
        ],
        engagement_metrics: {
          avg_points_earned: 245,
          avg_points_redeemed: 189,
          retention_rate: 78.5
        }
      }

      setCustomerSegments(mockSegments)
      setAutomatedCampaigns(mockCampaigns)
      setLoyaltyProgram(mockLoyaltyProgram)
    } catch (error) {
      console.error('Failed to load promotion intelligence data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'push': return <Zap className="h-4 w-4" />
      case 'social': return <Users className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const calculateConversionRate = (campaign: AutomatedCampaign) => {
    return campaign.performance.sent > 0 
      ? ((campaign.performance.converted / campaign.performance.sent) * 100).toFixed(1)
      : '0.0'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Promotion Intelligence</h1>
              <p className="text-gray-600">Customer segmentation, campaign automation, and loyalty analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPromotionIntelligenceData}
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
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {customerSegments.length}
                </div>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active segmentation groups
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {automatedCampaigns.filter(c => c.status === 'active').length}
                </div>
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently running campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Loyalty Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {loyaltyProgram?.total_members.toLocaleString() || 0}
                </div>
                <Heart className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {loyaltyProgram?.active_members || 0} active members
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Retention Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {loyaltyProgram?.engagement_metrics.retention_rate.toFixed(1) || 0}%
                </div>
                <Award className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Customer retention rate
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
              <TabsTrigger value="customer-segments">Customer Segments</TabsTrigger>
              <TabsTrigger value="campaigns">Automated Campaigns</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Customer Segments Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Customer Segmentation Overview</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered customer segments based on behavior and spending patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerSegments.map((segment, index) => (
                      <div key={segment.segment_name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${
                            index === 0 ? 'bg-purple-500' : 
                            index === 1 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}></div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{segment.segment_name}</h4>
                            <div className="text-sm text-gray-500">
                              {segment.customer_count} customers • {segment.percentage}% of total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${segment.avg_order_value.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {segment.visit_frequency.toFixed(1)} visits/month
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Campaign Performance Summary</span>
                  </CardTitle>
                  <CardDescription>
                    Recent automated campaign results and metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {automatedCampaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.campaign_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getCampaignTypeIcon(campaign.campaign_type)}
                          <div>
                            <h4 className="font-medium text-gray-900">{campaign.campaign_name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                              <span className="text-sm text-gray-500">{campaign.target_segment}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {calculateConversionRate(campaign)}%
                          </div>
                          <div className="text-sm text-gray-500">conversion rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer-segments">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Segmentation Analysis</CardTitle>
                  <CardDescription>
                    Detailed customer segments with characteristics and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Detailed segmentation analysis coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Automated Campaign Management</CardTitle>
                  <CardDescription>
                    Create, manage, and analyze automated marketing campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Campaign management interface coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty">
              <Card>
                <CardHeader>
                  <CardTitle>Loyalty Program Analytics</CardTitle>
                  <CardDescription>
                    Track loyalty program performance and member engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loyalty program analytics coming soon</p>
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
