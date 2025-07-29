"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Download,
  Filter,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Users,
  Target,
  Mail,
  MessageSquare,
  Share2,
  Globe
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalyticsData {
  period: string;
  totalCampaigns: number;
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageConversionRate: number;
  roi: number;
  roas: number;
  channelPerformance: {
    channel: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
  }[];
  campaignTypePerformance: {
    type: string;
    campaigns: number;
    spend: number;
    revenue: number;
    roi: number;
  }[];
  topPerformingCampaigns: {
    name: string;
    type: string;
    impressions: number;
    conversions: number;
    revenue: number;
    roi: number;
  }[];
}

export default function CampaignAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    period: '30d',
    totalCampaigns: 12,
    totalSpend: 8450.00,
    totalRevenue: 24150.00,
    totalImpressions: 456000,
    totalClicks: 13680,
    totalConversions: 892,
    averageCTR: 3.0,
    averageConversionRate: 6.5,
    roi: 185.7,
    roas: 2.86,
    channelPerformance: [
      {
        channel: 'Email',
        impressions: 125000,
        clicks: 3750,
        conversions: 225,
        spend: 1200,
        revenue: 6750,
        ctr: 3.0,
        conversionRate: 6.0
      },
      {
        channel: 'Google Ads',
        impressions: 156000,
        clicks: 4680,
        conversions: 312,
        spend: 3200,
        revenue: 9360,
        ctr: 3.0,
        conversionRate: 6.7
      },
      {
        channel: 'Facebook Ads',
        impressions: 98000,
        clicks: 2940,
        conversions: 176,
        spend: 2100,
        revenue: 5280,
        ctr: 3.0,
        conversionRate: 6.0
      },
      {
        channel: 'SMS',
        impressions: 45000,
        clicks: 1800,
        conversions: 108,
        spend: 890,
        revenue: 3240,
        ctr: 4.0,
        conversionRate: 6.0
      },
      {
        channel: 'Social Media',
        impressions: 32000,
        clicks: 1510,
        conversions: 71,
        spend: 1060,
        revenue: 2520,
        ctr: 4.7,
        conversionRate: 4.7
      }
    ],
    campaignTypePerformance: [
      {
        type: 'Promotion',
        campaigns: 4,
        spend: 3200,
        revenue: 9600,
        roi: 200.0
      },
      {
        type: 'Product Launch',
        campaigns: 3,
        spend: 2800,
        revenue: 7840,
        roi: 180.0
      },
      {
        type: 'Loyalty',
        campaigns: 2,
        spend: 1450,
        revenue: 3770,
        roi: 160.0
      },
      {
        type: 'Seasonal',
        campaigns: 2,
        spend: 800,
        revenue: 2240,
        roi: 180.0
      },
      {
        type: 'Retention',
        campaigns: 1,
        spend: 200,
        revenue: 700,
        roi: 250.0
      }
    ],
    topPerformingCampaigns: [
      {
        name: 'Summer Menu Launch',
        type: 'Product Launch',
        impressions: 125000,
        conversions: 289,
        revenue: 8650,
        roi: 245.7
      },
      {
        name: 'Weekend Special Promotion',
        type: 'Promotion',
        impressions: 89000,
        conversions: 156,
        revenue: 4680,
        roi: 224.8
      },
      {
        name: 'Holiday Season Campaign',
        type: 'Seasonal',
        impressions: 67000,
        conversions: 134,
        revenue: 4020,
        roi: 201.0
      }
    ]
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'google ads': return <Globe className="w-4 h-4" />;
      case 'facebook ads': return <Share2 className="w-4 h-4" />;
      case 'social media': return <Share2 className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'promotion': return 'bg-chili-red/10 text-chili-red border-chili-red/20';
      case 'loyalty': return 'bg-mantis-green/10 text-mantis-green border-mantis-green/20';
      case 'product launch': return 'bg-saffron/10 text-saffron border-saffron/20';
      case 'seasonal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'retention': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Campaign Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Analyze the performance of your marketing campaigns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-mantis-green">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ${analyticsData.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-mantis-green mr-1" />
                  <span className="text-xs text-mantis-green">+15.2%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-mantis-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {analyticsData.roi.toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-saffron mr-1" />
                  <span className="text-xs text-saffron">+8.4%</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-saffron" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chili-red">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {analyticsData.totalConversions.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-chili-red mr-1" />
                  <span className="text-xs text-chili-red">+12.1%</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-chili-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {analyticsData.averageCTR.toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">+0.3%</span>
                </div>
              </div>
              <MousePointer className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Channel Performance</CardTitle>
            <CardDescription>Performance metrics by marketing channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.channelPerformance.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getChannelIcon(channel.channel)}
                    <div>
                      <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {channel.channel}
                      </div>
                      <div className="text-sm text-gray-500">
                        {channel.impressions.toLocaleString()} impressions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ${channel.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {channel.ctr.toFixed(1)}% CTR | {channel.conversionRate.toFixed(1)}% CVR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Campaign Type Performance</CardTitle>
            <CardDescription>ROI and revenue by campaign type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.campaignTypePerformance.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className={getTypeColor(type.type)}>
                      {type.type}
                    </Badge>
                    <div>
                      <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {type.campaigns} campaigns
                      </div>
                      <div className="text-sm text-gray-500">
                        ${type.spend.toLocaleString()} spent
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ${type.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-mantis-green font-medium">
                      {type.roi.toFixed(1)}% ROI
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Top Performing Campaigns</CardTitle>
          <CardDescription>Your best performing campaigns in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topPerformingCampaigns.map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-mantis-green text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {campaign.name}
                    </div>
                    <Badge variant="outline" className={getTypeColor(campaign.type)}>
                      {campaign.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {campaign.impressions.toLocaleString()}
                    </div>
                    <div className="text-gray-500">Impressions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {campaign.conversions}
                    </div>
                    <div className="text-gray-500">Conversions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ${campaign.revenue.toLocaleString()}
                    </div>
                    <div className="text-gray-500">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-mantis-green" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {campaign.roi.toFixed(1)}%
                    </div>
                    <div className="text-gray-500">ROI</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
