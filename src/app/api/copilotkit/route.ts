/**
 * CopilotKit Runtime API Endpoint
 * Handles AI-powered interactions for BiteBase Intelligence
 */

import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-key",
});

// Create the runtime with OpenAI adapter
const runtime = new CopilotRuntime({
  actions: [
    {
      name: "analyzeRevenue",
      description: "Analyze restaurant revenue trends and patterns",
      parameters: [
        {
          name: "timeframe",
          type: "string",
          description: "Time period for analysis (e.g., 'last 30 days', 'Q4 2024')",
          required: true,
        },
        {
          name: "groupBy",
          type: "string",
          description: "Group analysis by dimension",
          enum: ["location", "category", "day", "hour"],
        },
        {
          name: "includeForecasting",
          type: "boolean",
          description: "Include revenue forecasting in analysis",
        },
      ],
      handler: async ({ timeframe, groupBy, includeForecasting }) => {
        // Simulate revenue analysis
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
          insights: [
            "Revenue has increased by 12.5% compared to the previous period",
            "Weekend performance is 35% higher than weekdays",
            "Dessert category shows the highest growth at 22.5%",
            "Peak hours are between 6-8 PM with 40% of daily revenue",
          ],
          forecast: includeForecasting ? {
            nextMonth: 138000,
            confidence: 87,
            factors: ["Seasonal trends", "Marketing campaigns", "Menu changes"],
          } : null,
        };

        return {
          success: true,
          data: mockData,
          message: `Revenue analysis for ${timeframe} completed successfully`,
        };
      },
    },
    {
      name: "analyzeCustomers",
      description: "Analyze customer behavior, segments, and lifetime value",
      parameters: [
        {
          name: "analysisType",
          type: "string",
          description: "Type of customer analysis to perform",
          enum: ["segments", "lifetime-value", "churn-risk", "preferences", "demographics"],
          required: true,
        },
        {
          name: "location",
          type: "string",
          description: "Specific location or 'all' for all locations",
        },
        {
          name: "timeframe",
          type: "string",
          description: "Analysis timeframe",
        },
      ],
      handler: async ({ analysisType, location, timeframe }) => {
        const mockData = {
          segments: {
            champions: { count: 245, percentage: 12.3, avgSpend: 85 },
            loyalCustomers: { count: 412, percentage: 20.6, avgSpend: 65 },
            potentialLoyalists: { count: 318, percentage: 15.9, avgSpend: 45 },
            newCustomers: { count: 523, percentage: 26.2, avgSpend: 35 },
            atRisk: { count: 298, percentage: 14.9, avgSpend: 25 },
            cannotLoseThem: { count: 204, percentage: 10.2, avgSpend: 95 },
          },
          lifetimeValue: {
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
          churnRisk: {
            high: { count: 156, percentage: 7.8 },
            medium: { count: 298, percentage: 14.9 },
            low: { count: 1546, percentage: 77.3 },
            factors: ["Decreased visit frequency", "Lower order values", "Negative feedback"],
          },
          preferences: {
            topCategories: [
              { name: "Burgers", preference: 68 },
              { name: "Salads", preference: 45 },
              { name: "Beverages", preference: 78 },
              { name: "Desserts", preference: 32 },
            ],
            dietaryPreferences: [
              { name: "No restrictions", percentage: 65 },
              { name: "Vegetarian", percentage: 18 },
              { name: "Vegan", percentage: 8 },
              { name: "Gluten-free", percentage: 9 },
            ],
          },
          demographics: {
            ageGroups: [
              { range: "18-25", percentage: 22 },
              { range: "26-35", percentage: 35 },
              { range: "36-45", percentage: 28 },
              { range: "46-55", percentage: 12 },
              { range: "55+", percentage: 3 },
            ],
            visitPatterns: {
              lunch: 35,
              dinner: 55,
              weekend: 10,
            },
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
    },
    {
      name: "generateForecast",
      description: "Generate AI-powered forecasts for business metrics",
      parameters: [
        {
          name: "metric",
          type: "string",
          description: "Metric to forecast",
          enum: ["revenue", "customers", "orders", "inventory", "staffing"],
          required: true,
        },
        {
          name: "horizon",
          type: "number",
          description: "Forecast horizon in days",
          required: true,
        },
        {
          name: "includeScenarios",
          type: "boolean",
          description: "Include optimistic/pessimistic scenarios",
        },
      ],
      handler: async ({ metric, horizon, includeScenarios }) => {
        const baseValue = metric === "revenue" ? 125000 : 
                         metric === "customers" ? 2000 : 
                         metric === "orders" ? 1500 : 
                         metric === "inventory" ? 85 : 75;

        const forecast = Array.from({ length: horizon }, (_, i) => {
          const trend = 1 + (Math.sin(i / 7) * 0.1) + (i * 0.002);
          const noise = 1 + (Math.random() - 0.5) * 0.1;
          return Math.round(baseValue * trend * noise);
        });

        const scenarios = includeScenarios ? {
          optimistic: forecast.map(v => Math.round(v * 1.2)),
          realistic: forecast,
          pessimistic: forecast.map(v => Math.round(v * 0.8)),
        } : { realistic: forecast };

        return {
          success: true,
          data: {
            metric,
            horizon,
            forecast: scenarios,
            confidence: 85,
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
    },
    {
      name: "optimizeMenu",
      description: "AI-powered menu optimization with pricing and placement suggestions",
      parameters: [
        {
          name: "optimizationType",
          type: "string",
          description: "Type of optimization to perform",
          enum: ["pricing", "placement", "profitability", "popularity"],
          required: true,
        },
        {
          name: "targetMargin",
          type: "number",
          description: "Target profit margin percentage",
        },
      ],
      handler: async ({ optimizationType, targetMargin }) => {
        const mockMenuItems = [
          { id: "1", name: "Classic Burger", currentPrice: 12.99, cost: 4.50, sales: 450, position: 1 },
          { id: "2", name: "Caesar Salad", currentPrice: 9.99, cost: 3.20, sales: 320, position: 5 },
          { id: "3", name: "Grilled Chicken", currentPrice: 15.99, cost: 6.80, sales: 280, position: 3 },
          { id: "4", name: "Fish & Chips", currentPrice: 13.99, cost: 5.20, sales: 180, position: 8 },
          { id: "5", name: "Veggie Wrap", currentPrice: 8.99, cost: 2.80, sales: 220, position: 6 },
        ];

        const optimizations = mockMenuItems.map(item => {
          const currentMargin = ((item.currentPrice - item.cost) / item.currentPrice) * 100;
          const suggestedPrice = targetMargin ? 
            item.cost / (1 - targetMargin / 100) : 
            item.currentPrice * (1 + Math.random() * 0.1 - 0.05);

          return {
            ...item,
            currentMargin: Math.round(currentMargin),
            suggestedPrice: Math.round(suggestedPrice * 100) / 100,
            suggestedPosition: Math.ceil(Math.random() * 8),
            impact: {
              revenueChange: Math.round((suggestedPrice - item.currentPrice) * item.sales),
              marginImprovement: Math.round(((suggestedPrice - item.cost) / suggestedPrice * 100) - currentMargin),
            },
            reasoning: optimizationType === "pricing" ? 
              "Price optimization based on demand elasticity and competitor analysis" :
              optimizationType === "placement" ?
              "Strategic positioning to maximize visibility and sales" :
              "Balanced approach considering profitability and customer satisfaction",
          };
        });

        return {
          success: true,
          data: {
            optimizations,
            summary: {
              totalRevenueImpact: optimizations.reduce((sum, item) => sum + item.impact.revenueChange, 0),
              averageMarginImprovement: optimizations.reduce((sum, item) => sum + item.impact.marginImprovement, 0) / optimizations.length,
              itemsOptimized: optimizations.length,
            },
            recommendations: [
              "Implement price changes gradually to test customer response",
              "Monitor sales data closely after menu updates",
              "Consider A/B testing for high-impact items",
              "Update menu design to highlight profitable items",
            ],
          },
        };
      },
    },
  ],
});

// Configure the service adapter
const serviceAdapter = new OpenAIAdapter({ openai });

export const POST = async (req: NextRequest) => {
  return copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/api/copilotkit",
    runtime,
    serviceAdapter,
  })(req);
};
