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

  // Action: analyze revenue
  useCopilotAction({
    name: "analyzeRevenue",
    description: "Analyze revenue trends with detailed breakdowns",
    parameters: [
      { name: "timeframe", type: "string", description: "Time period (e.g., 'last 30 days')", required: true },
      { name: "groupBy", type: "string", description: "Grouping dimension", enum: ["location", "category", "day", "hour"] },
    ],
    handler: async ({ timeframe, groupBy }) => {
      // Placeholder: integrate with backend analytics service
      return {
        summary: `Revenue analysis for ${timeframe}`,
        data: { groupBy, points: 30 },
        insights: ["Strong weekend performance", "Lunch hours driving growth"],
      };
    },
  });

  // Action: generate forecast
  useCopilotAction({
    name: "generateForecast",
    description: "Generate AI-powered forecasts for business metrics",
    parameters: [
      { name: "metric", type: "string", description: "Metric to forecast", enum: ["revenue", "customers", "inventory", "staffing-needs"] },
      { name: "horizon", type: "number", description: "Forecast horizon in days" },
    ],
    handler: async ({ metric, horizon }) => {
      return {
        forecast: Array.from({ length: Math.max(1, Number(horizon) || 7) }, (_, i) => ({ day: i + 1, value: Math.random() * 100 })),
        confidence: 0.9,
        influencingFactors: ["seasonality", "promotions"],
      };
    },
  });

  // Ensure hook runs client-side only
  useEffect(() => {}, []);
  return null;
}
