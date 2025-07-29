"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3,
  Plus,
  Calendar,
  Eye,
  MousePointer,
  ShoppingCart
} from 'lucide-react';

// Import campaign management components
import CampaignList from '@/components/campaign-management/CampaignList';
import CampaignCreator from '@/components/campaign-management/CampaignCreator';
import ABTestManager from '@/components/campaign-management/ABTestManager';
import AudienceManager from '@/components/campaign-management/AudienceManager';
import CampaignAnalytics from '@/components/campaign-management/CampaignAnalytics';
import CampaignTemplates from '@/components/campaign-management/CampaignTemplates';

export default function CampaignManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for overview cards
  const overviewStats = {
    activeCampaigns: 12,
    totalReach: 45678,
    conversionRate: 3.2,
    totalSpend: 8450.00,
    roi: 285.5,
    clickThroughRate: 2.8
  };

  const recentCampaigns = [
    {
      id: '1',
      name: 'Summer Menu Launch',
      status: 'active',
      type: 'product_launch',
      reach: 12500,
      conversions: 89,
      spend: 1250.00
    },
    {
      id: '2',
      name: 'Weekend Special Promotion',
      status: 'completed',
      type: 'promotion',
      reach: 8900,
      conversions: 156,
      spend: 890.00
    },
    {
      id: '3',
      name: 'Loyalty Program Boost',
      status: 'scheduled',
      type: 'loyalty',
      reach: 0,
      conversions: 0,
      spend: 0.00
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-bitebase-primary text-white';
      case 'completed': return 'bg-muted-foreground text-white';
      case 'scheduled': return 'bg-bitebase-secondary text-black';
      case 'paused': return 'bg-bitebase-accent text-white';
      default: return 'bg-muted text-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotion': return 'bg-bitebase-accent/10 text-bitebase-accent border-bitebase-accent/20';
      case 'loyalty': return 'bg-bitebase-primary/10 text-bitebase-primary border-bitebase-primary/20';
      case 'product_launch': return 'bg-bitebase-secondary/10 text-bitebase-secondary border-bitebase-secondary/20';
      case 'seasonal': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-primary font-bold text-foreground">
              Campaign Management
            </h1>
            <p className="text-muted-foreground mt-1 font-secondary">
              Create, manage, and analyze your marketing campaigns
            </p>
          </div>
          <Button
            className="bg-bitebase-primary hover:bg-bitebase-primary-hover text-white font-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-6 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-secondary ${
                activeTab === 'overview'
                  ? 'bg-bitebase-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'campaigns'
                  ? 'bg-mantis-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('ab-testing')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'ab-testing'
                  ? 'bg-mantis-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              A/B Testing
            </button>
            <button
              onClick={() => setActiveTab('audiences')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'audiences'
                  ? 'bg-mantis-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Audiences
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-mantis-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'templates'
                  ? 'bg-mantis-green text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Templates
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-mantis-green">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
                  <Megaphone className="h-4 w-4 text-mantis-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {overviewStats.activeCampaigns}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-saffron">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Reach</CardTitle>
                  <Users className="h-4 w-4 text-saffron" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {overviewStats.totalReach.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    +15.2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chili-red">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                  <Target className="h-4 w-4 text-chili-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {overviewStats.conversionRate}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    +0.4% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-mantis-green">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Spend</CardTitle>
                  <DollarSign className="h-4 w-4 text-mantis-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ${overviewStats.totalSpend.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    +8.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-saffron">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">ROI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-saffron" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {overviewStats.roi}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    +12.3% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chili-red">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Click-Through Rate</CardTitle>
                  <MousePointer className="h-4 w-4 text-chili-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {overviewStats.clickThroughRate}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    +0.3% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Recent Campaigns</CardTitle>
                <CardDescription>Your latest marketing campaigns and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {campaign.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline" className={getTypeColor(campaign.type)}>
                              {campaign.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{campaign.reach.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ShoppingCart className="w-4 h-4" />
                          <span>{campaign.conversions}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${campaign.spend.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Other Tabs */}
          {activeTab === 'campaigns' && (
            <div>
              <CampaignList />
            </div>
          )}

          {activeTab === 'ab-testing' && (
            <div>
              <ABTestManager />
            </div>
          )}

          {activeTab === 'audiences' && (
            <div>
              <AudienceManager />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <CampaignAnalytics />
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <CampaignTemplates />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
