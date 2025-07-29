"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Users, 
  Target, 
  Search,
  Edit,
  Trash2,
  Eye,
  MousePointer,
  ShoppingCart,
  TrendingUp,
  MapPin,
  Calendar,
  Heart,
  Star
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Audience {
  id: string;
  name: string;
  description: string;
  estimatedSize: number;
  actualSize: number;
  criteria: {
    ageRange: string;
    gender: string;
    location: string;
    interests: string[];
    behaviors: string[];
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
  };
  campaigns: number;
  lastUsed: string;
  status: 'active' | 'inactive';
}

export default function AudienceManager() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock audience data
  const audiences: Audience[] = [
    {
      id: '1',
      name: 'Young Food Enthusiasts',
      description: 'Young adults interested in trying new cuisines and dining experiences',
      estimatedSize: 15000,
      actualSize: 12500,
      criteria: {
        ageRange: '18-34',
        gender: 'all',
        location: 'New York, NY',
        interests: ['Food & Dining', 'Cooking', 'Travel'],
        behaviors: ['Frequent Diner', 'Social Media Active', 'Reviews Writer']
      },
      performance: {
        impressions: 125000,
        clicks: 3750,
        conversions: 225,
        revenue: 15600,
        ctr: 3.0,
        conversionRate: 6.0
      },
      campaigns: 8,
      lastUsed: '2024-06-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Family Diners',
      description: 'Families with children looking for family-friendly dining options',
      estimatedSize: 8500,
      actualSize: 7200,
      criteria: {
        ageRange: '25-45',
        gender: 'all',
        location: 'Suburban areas',
        interests: ['Family Activities', 'Kids Meals', 'Value Dining'],
        behaviors: ['Weekend Diner', 'Group Orders', 'Loyalty Member']
      },
      performance: {
        impressions: 89000,
        clicks: 2670,
        conversions: 189,
        revenue: 12800,
        ctr: 3.0,
        conversionRate: 7.1
      },
      campaigns: 5,
      lastUsed: '2024-06-10',
      status: 'active'
    },
    {
      id: '3',
      name: 'Business Lunch Crowd',
      description: 'Working professionals seeking quick, quality lunch options',
      estimatedSize: 6000,
      actualSize: 5800,
      criteria: {
        ageRange: '25-55',
        gender: 'all',
        location: 'Business District',
        interests: ['Quick Service', 'Healthy Options', 'Business Dining'],
        behaviors: ['Weekday Lunch', 'Mobile Orders', 'Express Pickup']
      },
      performance: {
        impressions: 67000,
        clicks: 2010,
        conversions: 156,
        revenue: 9800,
        ctr: 3.0,
        conversionRate: 7.8
      },
      campaigns: 3,
      lastUsed: '2024-05-28',
      status: 'active'
    },
    {
      id: '4',
      name: 'Health-Conscious Diners',
      description: 'Customers focused on healthy, organic, and sustainable food options',
      estimatedSize: 4500,
      actualSize: 3900,
      criteria: {
        ageRange: '25-50',
        gender: 'all',
        location: 'Urban areas',
        interests: ['Healthy Eating', 'Organic Food', 'Fitness'],
        behaviors: ['Nutrition Conscious', 'Ingredient Reader', 'Sustainable Choice']
      },
      performance: {
        impressions: 45000,
        clicks: 1800,
        conversions: 108,
        revenue: 8900,
        ctr: 4.0,
        conversionRate: 6.0
      },
      campaigns: 4,
      lastUsed: '2024-06-01',
      status: 'inactive'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-mantis-green text-white';
      case 'inactive': return 'bg-gray-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const filteredAudiences = audiences.filter(audience =>
    audience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audience.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Audience Manager
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage targeted audience segments for your campaigns
          </p>
        </div>
        <Button 
          className="bg-mantis-green hover:bg-mantis-green/90 text-white"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Audience
        </Button>
      </div>

      {/* Audience Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-mantis-green">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Audiences</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {audiences.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-mantis-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Audiences</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {audiences.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-saffron" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chili-red">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {audiences.reduce((sum, a) => sum + a.actualSize, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-chili-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {(audiences.reduce((sum, a) => sum + a.performance.ctr, 0) / audiences.length).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search audiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audiences Table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Audience Segments ({filteredAudiences.length})
          </CardTitle>
          <CardDescription>
            Manage your targeted audience segments and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Audience</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Status</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Size</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Criteria</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Performance</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Usage</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudiences.map((audience) => (
                  <TableRow key={audience.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {audience.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {audience.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(audience.status)}>
                        {audience.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {audience.actualSize.toLocaleString()}
                        </div>
                        <div className="text-gray-500">
                          Est: {audience.estimatedSize.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {((audience.actualSize / audience.estimatedSize) * 100).toFixed(1)}% match
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{audience.criteria.ageRange}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[100px]">{audience.criteria.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {audience.criteria.interests.slice(0, 2).map((interest, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {audience.criteria.interests.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{audience.criteria.interests.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3 text-gray-400" />
                            <span>{audience.performance.impressions.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MousePointer className="w-3 h-3 text-gray-400" />
                            <span>{audience.performance.clicks.toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <ShoppingCart className="w-3 h-3 text-gray-400" />
                            <span>{audience.performance.conversions}</span>
                          </span>
                          <span className="text-mantis-green font-medium">
                            ${audience.performance.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          CTR: {audience.performance.ctr.toFixed(1)}% | 
                          CVR: {audience.performance.conversionRate.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {audience.campaigns} campaigns
                        </div>
                        <div className="text-gray-500">
                          Last used: {new Date(audience.lastUsed).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
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
