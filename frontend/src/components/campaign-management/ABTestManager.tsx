"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Play, 
  Pause, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Eye,
  MousePointer,
  ShoppingCart,
  Trophy,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ABTest {
  id: string;
  campaignName: string;
  testName: string;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  trafficSplit: number;
  confidenceLevel: number;
  variantA: {
    name: string;
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
  };
  variantB: {
    name: string;
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
  };
  isSignificant: boolean;
  winningVariant: 'A' | 'B' | null;
  pValue: number;
  minimumSampleSize: number;
  currentSampleSize: number;
}

export default function ABTestManager() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  // Mock A/B test data
  const abTests: ABTest[] = [
    {
      id: '1',
      campaignName: 'Summer Menu Launch',
      testName: 'Email Subject Line Test',
      status: 'running',
      startDate: '2024-06-15',
      endDate: '2024-07-15',
      trafficSplit: 50,
      confidenceLevel: 95,
      variantA: {
        name: 'Try Our New Summer Menu!',
        impressions: 5000,
        clicks: 250,
        conversions: 45,
        conversionRate: 18.0
      },
      variantB: {
        name: 'Fresh Summer Flavors Await You',
        impressions: 5000,
        clicks: 320,
        conversions: 68,
        conversionRate: 21.25
      },
      isSignificant: true,
      winningVariant: 'B',
      pValue: 0.032,
      minimumSampleSize: 1000,
      currentSampleSize: 10000
    },
    {
      id: '2',
      campaignName: 'Weekend Special Promotion',
      testName: 'CTA Button Color Test',
      status: 'completed',
      startDate: '2024-05-01',
      endDate: '2024-05-31',
      trafficSplit: 50,
      confidenceLevel: 95,
      variantA: {
        name: 'Green Button',
        impressions: 8000,
        clicks: 480,
        conversions: 96,
        conversionRate: 20.0
      },
      variantB: {
        name: 'Red Button',
        impressions: 8000,
        clicks: 520,
        conversions: 88,
        conversionRate: 16.92
      },
      isSignificant: true,
      winningVariant: 'A',
      pValue: 0.018,
      minimumSampleSize: 2000,
      currentSampleSize: 16000
    },
    {
      id: '3',
      campaignName: 'Loyalty Program Boost',
      testName: 'Discount Amount Test',
      status: 'draft',
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      trafficSplit: 50,
      confidenceLevel: 95,
      variantA: {
        name: '10% Discount',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        conversionRate: 0
      },
      variantB: {
        name: '15% Discount',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        conversionRate: 0
      },
      isSignificant: false,
      winningVariant: null,
      pValue: 1.0,
      minimumSampleSize: 1500,
      currentSampleSize: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-mantis-green text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'draft': return 'bg-gray-300 text-black';
      case 'cancelled': return 'bg-chili-red text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const getWinnerIcon = (variant: 'A' | 'B' | null, current: 'A' | 'B') => {
    if (variant === current) {
      return <Trophy className="w-4 h-4 text-saffron" />;
    }
    return null;
  };

  const getSignificanceIcon = (isSignificant: boolean, pValue: number) => {
    if (isSignificant) {
      return <CheckCircle className="w-4 h-4 text-mantis-green" />;
    } else if (pValue < 0.1) {
      return <AlertCircle className="w-4 h-4 text-saffron" />;
    }
    return null;
  };

  const calculateProgress = (current: number, minimum: number) => {
    return Math.min((current / minimum) * 100, 100);
  };

  const formatPValue = (pValue: number) => {
    if (pValue < 0.001) return '< 0.001';
    return pValue.toFixed(3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            A/B Test Manager
          </h2>
          <p className="text-gray-600 mt-1">
            Create and monitor A/B tests for your campaigns
          </p>
        </div>
        <Button 
          className="bg-mantis-green hover:bg-mantis-green/90 text-white"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create A/B Test
        </Button>
      </div>

      {/* A/B Tests Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-mantis-green">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tests</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {abTests.filter(test => test.status === 'running').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-mantis-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {abTests.filter(test => test.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-saffron" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chili-red">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Significant Results</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {abTests.filter(test => test.isSignificant).length}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-chili-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft Tests</p>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {abTests.filter(test => test.status === 'draft').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>A/B Tests</CardTitle>
          <CardDescription>Monitor the performance of your A/B tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Test</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Status</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Progress</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Variant A</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Variant B</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Results</TableHead>
                  <TableHead style={{ fontFamily: 'JetBrains Mono, monospace' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {test.testName}
                        </div>
                        <div className="text-sm text-gray-500">{test.campaignName}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(test.startDate).toLocaleDateString()} - {new Date(test.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Sample Size</span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {test.currentSampleSize.toLocaleString()} / {test.minimumSampleSize.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={calculateProgress(test.currentSampleSize, test.minimumSampleSize)} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {test.variantA.name}
                          </span>
                          {getWinnerIcon(test.winningVariant, 'A')}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{test.variantA.impressions.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MousePointer className="w-3 h-3" />
                              <span>{test.variantA.clicks.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ShoppingCart className="w-3 h-3" />
                              <span>{test.variantA.conversions}</span>
                            </span>
                          </div>
                          <div className="font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            CVR: {test.variantA.conversionRate.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {test.variantB.name}
                          </span>
                          {getWinnerIcon(test.winningVariant, 'B')}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{test.variantB.impressions.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MousePointer className="w-3 h-3" />
                              <span>{test.variantB.clicks.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ShoppingCart className="w-3 h-3" />
                              <span>{test.variantB.conversions}</span>
                            </span>
                          </div>
                          <div className="font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            CVR: {test.variantB.conversionRate.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getSignificanceIcon(test.isSignificant, test.pValue)}
                          <span className="text-sm font-medium">
                            {test.isSignificant ? 'Significant' : 'Not Significant'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>p-value: {formatPValue(test.pValue)}</div>
                          <div>Confidence: {test.confidenceLevel}%</div>
                          {test.winningVariant && (
                            <div className="text-mantis-green font-medium">
                              Winner: Variant {test.winningVariant}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        {test.status === 'running' ? (
                          <Button variant="ghost" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : test.status === 'draft' ? (
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : null}
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
