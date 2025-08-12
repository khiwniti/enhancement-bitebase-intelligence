"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedCard, LoadingSkeleton, EnhancedButton } from '@/components/ui/enhanced-interactions';
import { 
  BarChart3, 
  Globe, 
  MapPin, 
  TrendingUp, 
  Utensils, 
  Brain, 
  Users, 
  RefreshCw, 
  AlertCircle,
  Lightbulb,
  AlertTriangle,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import hooks
import { 
  useDashboardStats, 
  useMarketAnalyses, 
  useAIInsights 
} from '@/hooks/useDashboardData';

// Import tab components
import MarketAnalysisTab from './tabs/MarketAnalysisTab';
import LocationIntelligenceTab from './tabs/LocationIntelligenceTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import RestaurantExplorerTab from './tabs/RestaurantExplorerTab';
import AIInsightsTab from './tabs/AIInsightsTab';
import { RealtimeMetricsWidget } from '@/components/realtime/RealtimeMetricsWidget';
import AIEnhancedDashboard from '@/components/ai/AIEnhancedDashboard';

interface EnhancedDashboardProps {
  className?: string;
}

// Helper functions for AI insights
const getInsightIcon = (type: string) => {
  switch (type) {
    case 'opportunity':
      return <Lightbulb className="h-4 w-4 text-bitebase-secondary" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-bitebase-accent" />;
    case 'recommendation':
      return <Target className="h-4 w-4 text-blue-600" />;
    case 'trend':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    default:
      return <Brain className="h-4 w-4 text-gray-600" />;
  }
};

const getInsightBadgeColor = (type: string) => {
  switch (type) {
    case 'opportunity':
      return 'bg-yellow-100 text-yellow-800';
    case 'warning':
      return 'bg-red-100 text-red-800';
    case 'recommendation':
      return 'bg-blue-100 text-blue-800';
    case 'trend':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function EnhancedDashboard({ className }: EnhancedDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load data using hooks
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { analyses: marketAnalyses, loading: analysesLoading, error: analysesError, refetch: refetchAnalyses } = useMarketAnalyses();
  const { insights: aiInsights, loading: insightsLoading, error: insightsError, refetch: refetchInsights } = useAIInsights();

  // Mock user data
  const user = { subscription_tier: 'Pro' };

  const loading = statsLoading || analysesLoading || insightsLoading;
  const error = statsError || analysesError || insightsError;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const loadDashboardData = () => {
    refetchStats();
    refetchAnalyses();
    refetchInsights();
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={loadDashboardData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Refresh Button Only - Header is handled by PageWrapper */}
      <div className="flex justify-end items-center">
        <Button 
          variant="outline" 
          onClick={loadDashboardData}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-muted p-1 rounded-lg border border-border">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-bitebase-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-bitebase-primary/20 transition-all duration-200 font-secondary"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="market-analysis"
            className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-bitebase-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-bitebase-primary/20 transition-all duration-200 font-secondary"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Market</span>
          </TabsTrigger>
          <TabsTrigger
            value="location-intelligence"
            className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-bitebase-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-bitebase-primary/20 transition-all duration-200 font-secondary"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-bitebase-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-bitebase-primary/20 transition-all duration-200 font-secondary"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="restaurant-explorer"
            className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-bitebase-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-bitebase-primary/20 transition-all duration-200 font-secondary"
          >
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Explorer</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai-insights"
            className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-bitebase-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-bitebase-primary/20 transition-all duration-200 font-secondary"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Metrics Widget */}
          <RealtimeMetricsWidget
            restaurantId="demo-restaurant-123"
            showConnectionStatus={true}
            className="mb-6"
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary-500" />
                  Market Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.marketAnalyses}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reports generated</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  Locations Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.locationsAnalyzed}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Areas explored</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aiInsights}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recommendations</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary-500" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 capitalize">
                  {user?.subscription_tier || "Free"}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current plan</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Market Analyses */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary-500" />
                  Recent Market Analyses
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Your latest market research reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketAnalyses.length > 0 ? (
                  marketAnalyses.map((analysis) => (
                    <div key={analysis.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-gray-900 dark:text-white font-medium">{analysis.location}</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Score: {analysis.marketScore}/10
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {analysis.competitorCount} competitors found
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.recommendations.slice(0, 2).map((rec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {rec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No market analyses yet</p>
                    <Button
                      className="mt-4"
                      onClick={() => setActiveTab('market-analysis')}
                    >
                      Start Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights Preview */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary-500" />
                  Latest AI Insights
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  AI-powered recommendations and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-gray-900 dark:text-white font-medium text-sm">{insight.title}</h4>
                          <Badge className={cn("text-xs", getInsightBadgeColor(insight.type))}>
                            {Math.round(insight.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('ai-insights')}
                >
                  View All Insights
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Start Market Analysis</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Analyze market opportunities in your target location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                  onClick={() => setActiveTab('market-analysis')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Analyze Market
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Explore Locations</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Use interactive mapping to find prime locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                  onClick={() => setActiveTab('location-intelligence')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Location Intelligence
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Restaurant Explorer</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Discover and analyze restaurants in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                  onClick={() => setActiveTab('restaurant-explorer')}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Explore Restaurants
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market-analysis" className="space-y-6">
          <MarketAnalysisTab />
        </TabsContent>

        {/* Location Intelligence Tab */}
        <TabsContent value="location-intelligence" className="space-y-6">
          <LocationIntelligenceTab />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab />
        </TabsContent>

        {/* Restaurant Explorer Tab */}
        <TabsContent value="restaurant-explorer" className="space-y-6">
          <RestaurantExplorerTab />
        </TabsContent>

        {/* AI Insights Tab - Enhanced with CopilotKit */}
        <TabsContent value="ai-insights" className="space-y-6">
          <AIEnhancedDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
