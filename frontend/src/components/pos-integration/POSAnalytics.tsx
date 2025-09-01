'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Database,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Zap
} from 'lucide-react';

interface ProviderPerformance {
  provider: string;
  providerName: string;
  logo: string;
  totalSyncs: number;
  successfulSyncs: number;
  averageDuration: number;
  errorRate: number;
  lastSync: string;
  dataVolume: number;
}

interface SyncTrend {
  date: string;
  successful: number;
  failed: number;
  total: number;
}

interface DataTypeMetrics {
  dataType: string;
  label: string;
  syncs: number;
  records: number;
  averageDuration: number;
  successRate: number;
}

export default function POSAnalytics() {
  const [providerPerformance, setProviderPerformance] = useState<ProviderPerformance[]>([]);
  const [syncTrends, setSyncTrends] = useState<SyncTrend[]>([]);
  const [dataTypeMetrics, setDataTypeMetrics] = useState<DataTypeMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockProviderPerformance: ProviderPerformance[] = [
        {
          provider: 'square',
          providerName: 'Square POS',
          logo: '🟦',
          totalSyncs: 245,
          successfulSyncs: 242,
          averageDuration: 42.5,
          errorRate: 1.2,
          lastSync: '2024-01-15T10:30:00Z',
          dataVolume: 125000
        },
        {
          provider: 'toast',
          providerName: 'Toast POS',
          logo: '🍞',
          totalSyncs: 156,
          successfulSyncs: 154,
          averageDuration: 38.2,
          errorRate: 1.3,
          lastSync: '2024-01-15T10:25:00Z',
          dataVolume: 89000
        },
        {
          provider: 'clover',
          providerName: 'Clover',
          logo: '🍀',
          totalSyncs: 89,
          successfulSyncs: 84,
          averageDuration: 55.1,
          errorRate: 5.6,
          lastSync: '2024-01-14T15:20:00Z',
          dataVolume: 45000
        },
        {
          provider: 'lightspeed',
          providerName: 'Lightspeed',
          logo: '⚡',
          totalSyncs: 67,
          successfulSyncs: 65,
          averageDuration: 48.3,
          errorRate: 3.0,
          lastSync: '2024-01-15T09:15:00Z',
          dataVolume: 32000
        }
      ];

      const mockSyncTrends: SyncTrend[] = [
        { date: '2024-01-09', successful: 45, failed: 2, total: 47 },
        { date: '2024-01-10', successful: 52, failed: 3, total: 55 },
        { date: '2024-01-11', successful: 48, failed: 1, total: 49 },
        { date: '2024-01-12', successful: 61, failed: 4, total: 65 },
        { date: '2024-01-13', successful: 58, failed: 2, total: 60 },
        { date: '2024-01-14', successful: 55, failed: 5, total: 60 },
        { date: '2024-01-15', successful: 67, failed: 3, total: 70 }
      ];

      const mockDataTypeMetrics: DataTypeMetrics[] = [
        {
          dataType: 'sales',
          label: 'Sales Data',
          syncs: 156,
          records: 125000,
          averageDuration: 45.2,
          successRate: 98.7
        },
        {
          dataType: 'menu_items',
          label: 'Menu Items',
          syncs: 89,
          records: 3400,
          averageDuration: 28.5,
          successRate: 99.1
        },
        {
          dataType: 'inventory',
          label: 'Inventory',
          syncs: 134,
          records: 45600,
          averageDuration: 52.1,
          successRate: 96.3
        },
        {
          dataType: 'customers',
          label: 'Customers',
          syncs: 67,
          records: 23400,
          averageDuration: 38.7,
          successRate: 97.8
        },
        {
          dataType: 'orders',
          label: 'Orders',
          syncs: 123,
          records: 89000,
          averageDuration: 41.3,
          successRate: 98.4
        }
      ];

      setProviderPerformance(mockProviderPerformance);
      setSyncTrends(mockSyncTrends);
      setDataTypeMetrics(mockDataTypeMetrics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 98) return 'text-[#74C365]';
    if (rate >= 95) return 'text-[#F4C431]';
    return 'text-[#E23D28]';
  };

  const getErrorRateColor = (rate: number) => {
    if (rate <= 2) return 'text-[#74C365]';
    if (rate <= 5) return 'text-[#F4C431]';
    return 'text-[#E23D28]';
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const totalSyncs = providerPerformance.reduce((sum, p) => sum + p.totalSyncs, 0);
  const totalSuccessful = providerPerformance.reduce((sum, p) => sum + p.successfulSyncs, 0);
  const overallSuccessRate = totalSyncs > 0 ? (totalSuccessful / totalSyncs) * 100 : 0;
  const totalDataVolume = providerPerformance.reduce((sum, p) => sum + p.dataVolume, 0);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 font-mono">Performance Analytics</h3>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-[#74C365] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#74C365]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Syncs</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{totalSyncs}</p>
              </div>
              <Database className="w-8 h-8 text-[#74C365]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F4C431]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{overallSuccessRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-[#F4C431]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Volume</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{formatNumber(totalDataVolume)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#E23D28]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">
                  {formatDuration(providerPerformance.reduce((sum, p) => sum + p.averageDuration, 0) / providerPerformance.length || 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-[#E23D28]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 font-mono">
            <Activity className="w-5 h-5 mr-2 text-[#74C365]" />
            Provider Performance
          </CardTitle>
          <CardDescription>
            Sync performance metrics by POS provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providerPerformance.map((provider) => {
              const successRate = (provider.successfulSyncs / provider.totalSyncs) * 100;
              return (
                <div key={provider.provider} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{provider.logo}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 font-mono">{provider.providerName}</h4>
                        <p className="text-sm text-gray-600">{provider.totalSyncs} total syncs</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getSuccessRateColor(successRate)} border-current`}
                    >
                      {successRate.toFixed(1)}% success
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Duration</span>
                      <p className="font-mono font-semibold text-gray-900">
                        {formatDuration(provider.averageDuration)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Error Rate</span>
                      <p className={`font-mono font-semibold ${getErrorRateColor(provider.errorRate)}`}>
                        {provider.errorRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Data Volume</span>
                      <p className="font-mono font-semibold text-gray-900">
                        {formatNumber(provider.dataVolume)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Sync</span>
                      <p className="font-mono font-semibold text-gray-900">
                        {new Date(provider.lastSync).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 font-mono">
            <BarChart3 className="w-5 h-5 mr-2 text-[#F4C431]" />
            Data Type Performance
          </CardTitle>
          <CardDescription>
            Sync performance metrics by data type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dataTypeMetrics.map((metric) => (
              <div key={metric.dataType} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 font-mono">{metric.label}</h4>
                  <Badge 
                    variant="outline" 
                    className={`${getSuccessRateColor(metric.successRate)} border-current`}
                  >
                    {metric.successRate.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Syncs</span>
                    <p className="font-mono font-semibold text-gray-900">{metric.syncs}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Records</span>
                    <p className="font-mono font-semibold text-gray-900">
                      {formatNumber(metric.records)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Time</span>
                    <p className="font-mono font-semibold text-gray-900">
                      {formatDuration(metric.averageDuration)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 font-mono">
            <TrendingUp className="w-5 h-5 mr-2 text-[#E23D28]" />
            Sync Trends
          </CardTitle>
          <CardDescription>
            Daily sync activity over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncTrends.map((trend, index) => {
              const successRate = (trend.successful / trend.total) * 100;
              const isIncreasing = index > 0 && trend.total > syncTrends[index - 1].total;
              
              return (
                <div key={trend.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(trend.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {isIncreasing ? (
                        <TrendingUp className="w-4 h-4 text-[#74C365]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[#E23D28]" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-mono font-semibold text-gray-900">{trend.total}</p>
                      <p className="text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono font-semibold text-[#74C365]">{trend.successful}</p>
                      <p className="text-gray-600">Success</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono font-semibold text-[#E23D28]">{trend.failed}</p>
                      <p className="text-gray-600">Failed</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-mono font-semibold ${getSuccessRateColor(successRate)}`}>
                        {successRate.toFixed(1)}%
                      </p>
                      <p className="text-gray-600">Rate</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
