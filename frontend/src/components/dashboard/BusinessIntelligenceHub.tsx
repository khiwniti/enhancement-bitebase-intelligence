import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  BarChart3,
  Globe,
  Calendar,
  Users,
  TrendingUp,
  Utensils,
  MapPin,
  Info,
  DollarSign,
  Activity,
  Star,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  description 
}) => {
  const cardId = `metric-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const changeAriaLabel = change ? `${change} compared to previous period` : undefined;
  
  return (
    <Card className="transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-ring">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle 
          className="text-sm font-medium text-gray-600"
          id={`${cardId}-title`}
        >
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div 
          className="text-2xl font-bold"
          aria-labelledby={`${cardId}-title`}
          role="text"
        >
          {value}
        </div>
        {change && (
          <p 
            className={cn(
              "text-xs flex items-center mt-1",
              changeType === 'positive' && "text-green-600",
              changeType === 'negative' && "text-red-600",
              changeType === 'neutral' && "text-gray-600"
            )}
            aria-label={changeAriaLabel}
          >
            {changeType === 'positive' && (
              <TrendingUp 
                className="h-3 w-3 mr-1" 
                aria-hidden="true"
              />
            )}
            <span>{change}</span>
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface InsightCardProps {
  title: string;
  description: string;
  category: 'opportunity' | 'warning' | 'positive' | 'info';
  priority: 'high' | 'medium' | 'low';
}

const InsightCard: React.FC<InsightCardProps> = ({ title, description, category, priority }) => {
  const getCategoryIcon = () => {
    const iconProps = { className: "h-4 w-4", 'aria-hidden': 'true' as const };
    switch (category) {
      case 'opportunity': return <Target {...iconProps} />;
      case 'warning': return <Info {...iconProps} />;
      case 'positive': return <Star {...iconProps} />;
      default: return <Activity {...iconProps} />;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'opportunity': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'opportunity': return 'Business opportunity';
      case 'warning': return 'Warning alert';
      case 'positive': return 'Positive insight';
      default: return 'Information';
    }
  };

  const cardId = `insight-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Card 
      className={cn("border-l-4 focus-within:ring-2 focus-within:ring-ring", getCategoryColor())}
      role="article"
      aria-labelledby={`${cardId}-title`}
      aria-describedby={`${cardId}-description`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          {getCategoryIcon()}
          <CardTitle 
            id={`${cardId}-title`}
            className="text-sm font-medium"
          >
            {title}
          </CardTitle>
          <span 
            className={cn(
              "px-2 py-1 text-xs rounded-full",
              priority === 'high' && "bg-red-100 text-red-800",
              priority === 'medium' && "bg-yellow-100 text-yellow-800",
              priority === 'low' && "bg-green-100 text-green-800"
            )}
            aria-label={`${priority} priority ${getCategoryLabel()}`}
          >
            {priority}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p 
          id={`${cardId}-description`}
          className="text-sm text-gray-600"
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

interface BusinessIntelligenceHubProps {
  userId?: string;
  locationId?: string;
  className?: string;
}

export default function BusinessIntelligenceHub({
  userId,
  locationId,
  className,
}: BusinessIntelligenceHubProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "quarter" | "year">("month");

  // Sample data - in a real app, this would come from an API
  const metrics = [
    {
      title: "Total Revenue",
      value: "$48,539",
      change: "+12.5% from last month",
      changeType: 'positive' as const,
      icon: DollarSign,
      description: "Monthly revenue performance"
    },
    {
      title: "Orders",
      value: "1,429",
      change: "+8.2% from last month",
      changeType: 'positive' as const,
      icon: Utensils,
      description: "Total orders this month"
    },
    {
      title: "Avg Order Value",
      value: "$33.95",
      change: "+2.1% from last month",
      changeType: 'positive' as const,
      icon: BarChart3,
      description: "Average customer spend"
    },
    {
      title: "Customer Satisfaction",
      value: "4.7/5",
      change: "Stable performance",
      changeType: 'neutral' as const,
      icon: Star,
      description: "Based on 284 reviews"
    }
  ];

  const insights = [
    {
      title: "Peak Hours Optimization",
      description: "Consider extending staff during 7-9 PM when order volume increases by 40%",
      category: 'opportunity' as const,
      priority: 'high' as const
    },
    {
      title: "Menu Performance",
      description: "Pasta dishes are outperforming expectations with 25% higher margins",
      category: 'positive' as const,
      priority: 'medium' as const
    },
    {
      title: "Delivery Time Alert",
      description: "Average delivery time has increased to 38 minutes, consider additional drivers",
      category: 'warning' as const,
      priority: 'high' as const
    },
    {
      title: "Customer Retention",
      description: "Repeat customer rate has improved to 68% this month",
      category: 'positive' as const,
      priority: 'low' as const
    }
  ];

  const timeRangeOptions = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>
          <p className="text-gray-600 mt-1">
            Real-time insights and analytics for your restaurant
          </p>
        </div>
        <div 
          className="flex items-center space-x-2"
          role="group"
          aria-label="Time range filter"
        >
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(option.value as any)}
              className="min-w-0"
              aria-pressed={timeRange === option.value}
              aria-label={`Show data for ${option.label.toLowerCase()}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Grid */}
          <section aria-labelledby="metrics-heading">
            <h2 id="metrics-heading" className="sr-only">
              Key Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric, index) => (
                <MetricCard key={`${metric.title}-${index}`} {...metric} />
              ))}
            </div>
          </section>

          {/* Quick Insights */}
          <section aria-labelledby="insights-heading">
            <Card>
              <CardHeader>
                <CardTitle 
                  id="insights-heading"
                  className="flex items-center space-x-2"
                >
                  <Activity className="h-5 w-5" aria-hidden="true" />
                  <span>Quick Insights</span>
                </CardTitle>
                <CardDescription>
                  AI-powered insights from your restaurant data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {insights.slice(0, 4).map((insight, index) => (
                    <InsightCard key={`${insight.title}-${index}`} {...insight} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Flow</CardTitle>
                <CardDescription>Hourly customer traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Traffic chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <InsightCard key={index} {...insight} />
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
              <CardDescription>Industry insights and competitive analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Market trends analysis would go here</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Competitive insights, market positioning, and industry benchmarks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}