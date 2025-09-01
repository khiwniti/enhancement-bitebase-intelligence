"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Building2,
  Target,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface LocationPerformance {
  location_id: string;
  location_name: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  performance_metrics: {
    revenue: {
      total: number;
      daily_average: number;
      growth_rate: number;
    };
    customers: {
      total: number;
      daily_average: number;
      retention_rate: number;
    };
    orders: {
      total: number;
      daily_average: number;
      avg_order_value: number;
    };
    profitability: {
      profit_margin: number;
      revenue_per_customer: number;
      cost_efficiency: number;
    };
    operational: {
      staff_efficiency: number;
      inventory_turnover: number;
      customer_satisfaction: number;
    };
  };
  performance_score: number;
  status: string;
}

interface PerformanceSummary {
  total_locations: number;
  locations: LocationPerformance[];
  comparative_metrics: {
    revenue: {
      total: number;
      average: number;
      highest: number;
      lowest: number;
    };
    performance: {
      average_score: number;
      top_performer: number;
      lowest_performer: number;
      performance_gap: number;
    };
    location_distribution: {
      high_performers: number;
      average_performers: number;
      underperformers: number;
    };
  };
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    affected_locations: string[] | string;
    expected_impact: string;
  }>;
}

const MultiLocationDashboard: React.FC = () => {
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchPerformanceData();
  }, [dateRange]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using mock restaurant ID for demo
      const response = await fetch(`/api/v1/multi-location/performance/550e8400-e29b-41d4-a716-446655440000?date_range_days=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setPerformanceSummary(data.performance);
      } else {
        setError('Failed to fetch performance data');
      }
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'average':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'needs_attention':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: "default",
      good: "secondary",
      average: "outline",
      needs_attention: "destructive",
      poor: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Location Management</h1>
          <p className="text-muted-foreground">
            Enterprise-grade multi-location performance analytics and management
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button 
            onClick={fetchPerformanceData} 
            disabled={loading}
            variant="outline"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {performanceSummary && (
            <>
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceSummary.total_locations}</div>
                    <p className="text-xs text-muted-foreground">
                      Active restaurant locations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(performanceSummary.comparative_metrics.revenue.total)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last {dateRange} days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceSummary.comparative_metrics.performance.average_score.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Performance score
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Performers</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceSummary.comparative_metrics.location_distribution.high_performers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Locations scoring 80+
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                  <CardDescription>
                    Distribution of locations by performance level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">High Performers (80+)</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(performanceSummary.comparative_metrics.location_distribution.high_performers / performanceSummary.total_locations) * 100} 
                          className="w-32" 
                        />
                        <span className="text-sm text-muted-foreground">
                          {performanceSummary.comparative_metrics.location_distribution.high_performers}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Performers (60-79)</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(performanceSummary.comparative_metrics.location_distribution.average_performers / performanceSummary.total_locations) * 100} 
                          className="w-32" 
                        />
                        <span className="text-sm text-muted-foreground">
                          {performanceSummary.comparative_metrics.location_distribution.average_performers}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Underperformers (&lt;60)</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(performanceSummary.comparative_metrics.location_distribution.underperformers / performanceSummary.total_locations) * 100} 
                          className="w-32" 
                        />
                        <span className="text-sm text-muted-foreground">
                          {performanceSummary.comparative_metrics.location_distribution.underperformers}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          {performanceSummary?.locations && (
            <div className="grid gap-4">
              {performanceSummary.locations.map((location) => (
                <Card key={location.location_id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{location.location_name}</h3>
                          {getStatusIcon(location.status)}
                          {getStatusBadge(location.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {location.address}, {location.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{location.performance_score}</div>
                        <p className="text-xs text-muted-foreground">Performance Score</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                      <div className="text-center p-3 bg-muted rounded">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-lg font-bold">
                            {formatCurrency(location.performance_metrics.revenue.total)}
                          </span>
                          {getTrendIcon(location.performance_metrics.revenue.growth_rate)}
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                        <div className="text-xs text-muted-foreground">
                          {location.performance_metrics.revenue.growth_rate > 0 ? '+' : ''}
                          {location.performance_metrics.revenue.growth_rate.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {location.performance_metrics.customers.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Customers</div>
                        <div className="text-xs text-muted-foreground">
                          {location.performance_metrics.customers.retention_rate}% retention
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {formatCurrency(location.performance_metrics.orders.avg_order_value)}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Order Value</div>
                        <div className="text-xs text-muted-foreground">
                          {location.performance_metrics.orders.total} orders
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {location.performance_metrics.profitability.profit_margin.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Profit Margin</div>
                        <div className="text-xs text-muted-foreground">
                          {location.performance_metrics.operational.staff_efficiency.toFixed(0)}% efficiency
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {performanceSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
                <CardDescription>
                  Comparative analysis across all locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Revenue Performance</h4>
                    <div className="grid gap-2 md:grid-cols-4">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {formatCurrency(performanceSummary.comparative_metrics.revenue.highest)}
                        </div>
                        <div className="text-xs text-muted-foreground">Highest</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {formatCurrency(performanceSummary.comparative_metrics.revenue.average)}
                        </div>
                        <div className="text-xs text-muted-foreground">Average</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {formatCurrency(performanceSummary.comparative_metrics.revenue.lowest)}
                        </div>
                        <div className="text-xs text-muted-foreground">Lowest</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {((performanceSummary.comparative_metrics.revenue.highest - performanceSummary.comparative_metrics.revenue.lowest) / performanceSummary.comparative_metrics.revenue.lowest * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Gap</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Performance Scores</h4>
                    <div className="grid gap-2 md:grid-cols-4">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {performanceSummary.comparative_metrics.performance.top_performer.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Top Score</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {performanceSummary.comparative_metrics.performance.average_score.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Average</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {performanceSummary.comparative_metrics.performance.lowest_performer.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Lowest</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">
                          {performanceSummary.comparative_metrics.performance.performance_gap.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Gap</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {performanceSummary?.recommendations && (
            <div className="space-y-4">
              {performanceSummary.recommendations.map((recommendation, index) => (
                <Card key={index} className={`border-l-4 ${getPriorityColor(recommendation.priority)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{recommendation.priority.toUpperCase()}</Badge>
                          <Badge variant="secondary">{recommendation.type.replace('_', ' ').toUpperCase()}</Badge>
                        </div>
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {recommendation.description}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          Expected Impact: {recommendation.expected_impact}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiLocationDashboard;
