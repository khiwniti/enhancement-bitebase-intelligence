"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Target,
  Eye,
  MousePointer,
  ShoppingCart
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  channels: string[];
}

export default function CampaignList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock campaign data
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Summer Menu Launch',
      type: 'product_launch',
      status: 'active',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      budget: 5000,
      spent: 3200,
      impressions: 125000,
      clicks: 3500,
      conversions: 89,
      revenue: 12500,
      channels: ['email', 'social_media', 'google_ads']
    },
    {
      id: '2',
      name: 'Weekend Special Promotion',
      type: 'promotion',
      status: 'completed',
      startDate: '2024-05-15',
      endDate: '2024-05-31',
      budget: 2000,
      spent: 1890,
      impressions: 89000,
      clicks: 2100,
      conversions: 156,
      revenue: 8900,
      channels: ['email', 'sms']
    },
    {
      id: '3',
      name: 'Loyalty Program Boost',
      type: 'loyalty',
      status: 'scheduled',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      budget: 1500,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      channels: ['email', 'push_notification']
    },
    {
      id: '4',
      name: 'Holiday Season Campaign',
      type: 'seasonal',
      status: 'paused',
      startDate: '2024-05-01',
      endDate: '2024-06-30',
      budget: 8000,
      spent: 4500,
      impressions: 200000,
      clicks: 5200,
      conversions: 234,
      revenue: 18900,
      channels: ['facebook_ads', 'instagram', 'email']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-mantis-green text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'scheduled': return 'bg-saffron text-black';
      case 'paused': return 'bg-chili-red text-white';
      case 'draft': return 'bg-gray-300 text-black';
      default: return 'bg-gray-300 text-black';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotion': return 'bg-chili-red/10 text-chili-red border-chili-red/20';
      case 'loyalty': return 'bg-mantis-green/10 text-mantis-green border-mantis-green/20';
      case 'product_launch': return 'bg-saffron/10 text-saffron border-saffron/20';
      case 'seasonal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'retention': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'acquisition': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  };

  const calculateConversionRate = (conversions: number, clicks: number) => {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0.00';
  };

  const calculateROI = (revenue: number, spent: number) => {
    return spent > 0 ? (((revenue - spent) / spent) * 100).toFixed(1) : '0.0';
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Campaign Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage and monitor your marketing campaigns
          </p>
        </div>
        <Button 
          className="bg-mantis-green hover:bg-mantis-green/90 text-white"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="loyalty">Loyalty</SelectItem>
                <SelectItem value="product_launch">Product Launch</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="acquisition">Acquisition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Campaigns ({filteredCampaigns.length})
          </CardTitle>
          <CardDescription>
            Overview of all your marketing campaigns and their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Campaign</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Status</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Type</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Duration</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Budget</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Performance</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>ROI</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {campaign.channels.join(', ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeColor(campaign.type)}>
                        {campaign.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(campaign.endDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                        </div>
                        <div className="text-gray-500">
                          {((campaign.spent / campaign.budget) * 100).toFixed(1)}% used
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span>{campaign.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MousePointer className="w-3 h-3 text-gray-400" />
                          <span>{campaign.clicks.toLocaleString()} ({calculateCTR(campaign.clicks, campaign.impressions)}%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="w-3 h-3 text-gray-400" />
                          <span>{campaign.conversions} ({calculateConversionRate(campaign.conversions, campaign.clicks)}%)</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {calculateROI(campaign.revenue, campaign.spent)}%
                        </div>
                        <div className="text-gray-500">
                          ${campaign.revenue.toLocaleString()} revenue
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {campaign.status === 'active' ? (
                          <Button variant="ghost" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : campaign.status === 'paused' ? (
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="sm" className="text-chili-red hover:text-chili-red">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
