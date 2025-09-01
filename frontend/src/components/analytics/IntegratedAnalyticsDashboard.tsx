"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Utensils,
  Megaphone,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Activity,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegratedAnalyticsProps {
  restaurantId?: string;
  timePeriod?: 'week' | 'month' | 'quarter' | 'year';
  className?: string;
}

interface AnalyticsData {
  overview: {
    time_period: string;
    start_date: string;
    end_date: string;
    restaurant_id?: string;
  };
  restaurant_metrics: {
    revenue: {
      total_revenue: number;
      transaction_count: number;
      avg_transaction: number;
    };
    orders: {
      total_orders: number;
      avg_order_value: number;
      total_order_value: number;
    };
    staff: {
      total_staff: number;
      active_staff: number;
      utilization_rate: number;
    };
    inventory: {
      total_items: number;
      low_stock_items: number;
      inventory_value: number;
      stock_health: number;
    };
  };
  campaign_metrics: {
    overview: {
      total_campaigns: number;
      active_campaigns: number;
      completed_campaigns: number;
    };
    performance: {
      total_impressions: number;
      total_clicks: number;
      total_conversions: number;
      ctr: number;
      conversion_rate: number;
    };
    financial: {
      total_revenue: number;
      total_cost: number;
      roi: number;
      roas: number;
      profit: number;
    };
  };
  pos_metrics: {
    integrations: {
      total_integrations: number;
      connected_integrations: number;
      error_integrations: number;
      health_score: number;
    };
    sync_performance: {
      total_syncs: number;
      successful_syncs: number;
      failed_syncs: number;
      success_rate: number;
      total_records: number;
      avg_duration: number;
    };
  };
  operational_metrics: {
    table_management: {
      total_tables: number;
      active_tables: number;
      utilization_rate: number;
    };
    efficiency: {
      hours_analyzed: number;
      operational_score: number;
    };
  };
  integrated_insights: Array<{
    type: 'opportunity' | 'warning' | 'operational';
    title: string;
    description: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    recommendations: string[];
  }>;
  correlations: {
    marketing_revenue_correlation: number;
    pos_operational_correlation: number;
    inventory_sales_correlation: number;
    staff_service_correlation: number;
  };
  predictions: {
    revenue_forecast: {
      next_month: number;
      confidence: number;
      factors: string[];
    };
    optimization_opportunities: string[];
  };
  performance_score: number;
}

export default function IntegratedAnalyticsDashboard({ 
  restaurantId, 
  timePeriod = 'month',
  className 
}: IntegratedAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        time_period: timePeriod,
        include_predictions: 'true'
      });
      
      if (restaurantId) {
        params.append('restaurant_id', restaurantId);
      }

      const response = await fetch(`/api/v1/analytics/integrated-dashboard?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, timePeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'operational':
        return <Activity className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data: {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={fetchAnalytics}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Integrated Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive insights across restaurant operations, marketing, and POS systems
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-[#74C365] text-white border-[#74C365]">
            Score: {data.performance_score}
          </Badge>
          <Button 
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="bg-[#74C365] hover:bg-[#5fa854] text-white"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#74C365]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.restaurant_metrics.revenue.total_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.restaurant_metrics.revenue.transaction_count)} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#E23D28]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign ROI</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(data.campaign_metrics.financial.roi)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.campaign_metrics.overview.active_campaigns} active campaigns
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F4C431]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">POS Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(data.pos_metrics.integrations.health_score)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.pos_metrics.integrations.connected_integrations} integrations active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.operational_metrics.efficiency.operational_score}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(data.operational_metrics.table_management.utilization_rate)} table utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="pos">POS Systems</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Correlations */}
          <Card>
            <CardHeader>
              <CardTitle>System Performance Correlations</CardTitle>
              <CardDescription>
                How different systems impact each other
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing → Revenue</span>
                    <Badge variant="outline">
                      {formatPercentage(data.correlations.marketing_revenue_correlation * 100)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">POS → Operations</span>
                    <Badge variant="outline">
                      {formatPercentage(data.correlations.pos_operational_correlation * 100)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inventory → Sales</span>
                    <Badge variant="outline">
                      {formatPercentage(data.correlations.inventory_sales_correlation * 100)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Staff → Service</span>
                    <Badge variant="outline">
                      {formatPercentage(data.correlations.staff_service_correlation * 100)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>
                Predicted performance based on current trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Next Month Forecast</span>
                  <span className="text-2xl font-bold text-[#74C365]">
                    {formatCurrency(data.predictions.revenue_forecast.next_month)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <Badge variant="outline">
                    {formatPercentage(data.predictions.revenue_forecast.confidence * 100)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Key Factors:</span>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {data.predictions.revenue_forecast.factors.map((factor, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#74C365] mr-2">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tab content would be added here */}
        <TabsContent value="restaurant">
          <div className="text-center py-8">
            <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Restaurant analytics details coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="text-center py-8">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Campaign analytics details coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="pos">
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">POS analytics details coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI-Generated Insights */}
          <div className="space-y-4">
            {data.integrated_insights.map((insight, index) => (
              <Card key={index} className={cn(
                "border-l-4",
                insight.type === 'opportunity' && "border-l-yellow-500",
                insight.type === 'warning' && "border-l-red-500",
                insight.type === 'operational' && "border-l-blue-500"
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        insight.impact === 'high' && "bg-red-50 text-red-700",
                        insight.impact === 'medium' && "bg-yellow-50 text-yellow-700",
                        insight.impact === 'low' && "bg-green-50 text-green-700"
                      )}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {formatPercentage(insight.confidence * 100)} confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Recommendations:</span>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {insight.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start">
                          <span className="text-[#74C365] mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Optimization Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Opportunities</CardTitle>
              <CardDescription>
                AI-identified areas for improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.predictions.optimization_opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start">
                    <Target className="h-4 w-4 text-[#74C365] mr-2 mt-0.5" />
                    <span className="text-sm">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
