"use client";

import { useEffect } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useDashboardStats, useAnalyticsData, useAIInsights } from "@/hooks/useDashboardData";


export default function CopilotRegistrations() {
  const { stats } = useDashboardStats();
  const { analytics } = useAnalyticsData();
  const { insights } = useAIInsights();

  // Expose important state to Copilot
  useCopilotReadable({
    description: "Current dashboard metrics and filters",
    value: {
      currentPeriod: "last_30_days",
      metrics: {
        revenue: analytics?.revenue,
        growth: analytics?.growth,
        customers: analytics?.customers,
        orders: analytics?.orders,
      },
      summary: stats,
      insights: insights?.map((i) => ({ id: i.id, title: i.title, type: i.type, confidence: i.confidence })),
    },
  });

  // Action: analyze revenue with beautiful UI
  useCopilotAction({
    name: "analyzeRevenue",
    description: "Analyze revenue trends with detailed breakdowns and stunning visualizations",
    parameters: [
      { name: "timeframe", type: "string", description: "Time period (e.g., 'last 30 days')", required: true },
      { name: "groupBy", type: "string", description: "Grouping dimension", enum: ["location", "category", "day", "hour"] },
    ],
    handler: async ({ timeframe, groupBy }: { timeframe: string; groupBy?: string }) => {
      // Enhanced mock data for beautiful visualization
      const mockData = {
        summary: {
          totalRevenue: 125000,
          growth: 12.5,
          trend: "increasing",
          topPerformingPeriod: "Weekend evenings",
        },
        breakdown: groupBy === "location"
          ? [
              { name: "Downtown", revenue: 75000, growth: 15.2 },
              { name: "Mall Location", revenue: 50000, growth: 8.7 },
            ]
          : groupBy === "category"
          ? [
              { name: "Burgers", revenue: 45000, growth: 18.3 },
              { name: "Salads", revenue: 35000, growth: 12.1 },
              { name: "Beverages", revenue: 25000, growth: 8.9 },
              { name: "Desserts", revenue: 20000, growth: 22.5 },
            ]
          : [
              { name: "Monday", revenue: 15000, growth: 5.2 },
              { name: "Tuesday", revenue: 16000, growth: 7.1 },
              { name: "Wednesday", revenue: 17000, growth: 9.3 },
              { name: "Thursday", revenue: 18000, growth: 11.2 },
              { name: "Friday", revenue: 22000, growth: 15.8 },
              { name: "Saturday", revenue: 20000, growth: 13.4 },
              { name: "Sunday", revenue: 17000, growth: 8.7 },
            ],
      };

      const insights = [
        "Revenue has increased by 12.5% compared to the previous period",
        "Weekend performance is 35% higher than weekdays",
        "Dessert category shows the highest growth at 22.5%",
        "Peak hours are between 6-8 PM with 40% of daily revenue",
      ];

      return {
        success: true,
        data: mockData,
        insights,
        message: `Revenue analysis for ${timeframe} completed successfully`,
      };
    },

  });

  // Action: generate forecast with stunning visualization
  useCopilotAction({
    name: "generateForecast",
    description: "Generate AI-powered forecasts for business metrics with beautiful visualizations",
    parameters: [
      { name: "metric", type: "string", description: "Metric to forecast", enum: ["revenue", "customers", "inventory", "staffing-needs"] },
      { name: "horizon", type: "number", description: "Forecast horizon in days" },
    ],
    handler: async ({ metric, horizon }: { metric: string; horizon: number }) => {
      const baseValue = metric === "revenue" ? 125000 :
                       metric === "customers" ? 2000 :
                       metric === "inventory" ? 85 : 75;

      const forecast = Array.from({ length: Math.max(1, Number(horizon) || 7) }, (_, i) => {
        const trend = 1 + (Math.sin(i / 7) * 0.1) + (i * 0.002);
        const noise = 1 + (Math.random() - 0.5) * 0.1;
        return Math.round(baseValue * trend * noise);
      });

      const scenarios = {
        optimistic: forecast.map(v => Math.round(v * 1.2)),
        realistic: forecast,
        pessimistic: forecast.map(v => Math.round(v * 0.8)),
      };

      return {
        success: true,
        data: {
          metric,
          horizon,
          forecast: scenarios,
          confidence: 87,
          keyDrivers: [
            { name: "Seasonal trends", impact: 25 },
            { name: "Marketing campaigns", impact: 20 },
            { name: "Weather patterns", impact: 15 },
            { name: "Local events", impact: 10 },
          ],
          recommendations: [
            "Increase staffing during predicted peak periods",
            "Adjust inventory levels based on demand forecast",
            "Plan marketing campaigns for low-demand periods",
          ],
        },
      };
    },

  });

  // Action: analyze customers with beautiful insights
  useCopilotAction({
    name: "analyzeCustomers",
    description: "Analyze customer behavior, segments, and lifetime value with stunning visualizations",
    parameters: [
      { name: "analysisType", type: "string", description: "Type of customer analysis", enum: ["segments", "lifetime-value", "churn-risk", "preferences"], required: true },
      { name: "location", type: "string", description: "Specific location or 'all'" },
    ],
    handler: async ({ analysisType, location }: { analysisType: string; location?: string }) => {
      const mockData = {
        segments: {
          champions: { count: 245, percentage: 12.3, avgSpend: 85 },
          loyalCustomers: { count: 412, percentage: 20.6, avgSpend: 65 },
          potentialLoyalists: { count: 318, percentage: 15.9, avgSpend: 45 },
          newCustomers: { count: 523, percentage: 26.2, avgSpend: 35 },
          atRisk: { count: 298, percentage: 14.9, avgSpend: 25 },
          cannotLoseThem: { count: 204, percentage: 10.2, avgSpend: 95 },
        },
        "lifetime-value": {
          average: 485,
          median: 320,
          top10Percent: 1250,
          distribution: [
            { range: "$0-100", count: 456, percentage: 22.8 },
            { range: "$100-300", count: 612, percentage: 30.6 },
            { range: "$300-500", count: 398, percentage: 19.9 },
            { range: "$500-1000", count: 324, percentage: 16.2 },
            { range: "$1000+", count: 210, percentage: 10.5 },
          ],
        },
        "churn-risk": {
          high: { count: 156, percentage: 7.8 },
          medium: { count: 298, percentage: 14.9 },
          low: { count: 1546, percentage: 77.3 },
        },
        preferences: {
          topCategories: [
            { name: "Burgers", preference: 68 },
            { name: "Salads", preference: 45 },
            { name: "Beverages", preference: 78 },
            { name: "Desserts", preference: 32 },
          ],
        },
      };

      return {
        success: true,
        data: mockData[analysisType as keyof typeof mockData],
        insights: [
          "Champions segment generates 35% of total revenue",
          "Customer lifetime value has increased by 15% this quarter",
          "7.8% of customers are at high churn risk",
          "Beverages have the highest preference score at 78%",
        ],
        recommendations: [
          "Focus retention campaigns on at-risk customers",
          "Expand beverage menu based on high preference scores",
          "Create loyalty program for potential loyalists",
          "Implement personalized offers for champions",
        ],
      };
    },

  });

  // Ensure hook runs client-side only
  useEffect(() => {}, []);
  return null;
}
