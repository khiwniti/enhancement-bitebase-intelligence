"use client";

import { useState, useEffect } from 'react';

// Types for dashboard data
export interface DashboardStats {
  marketAnalyses: number;
  locationsAnalyzed: number;
  aiInsights: number;
  subscription: string;
}

export interface MarketAnalysis {
  id: string;
  location: string;
  marketScore: number;
  competitorCount: number;
  recommendations: string[];
  createdAt: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend';
  confidence: number;
  createdAt: string;
}

export interface AnalyticsData {
  revenue: number;
  growth: number;
  customers: number;
  orders: number;
  charts: any[];
}

export interface LocationData {
  locations: any[];
  heatmapData: any[];
  insights: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  location: string;
  distance: number;
}

// Hook for dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    marketAnalyses: 0,
    locationsAnalyzed: 0,
    aiInsights: 0,
    subscription: 'Pro'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        marketAnalyses: 24,
        locationsAnalyzed: 156,
        aiInsights: 89,
        subscription: 'Pro'
      });
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

// Hook for market analyses
export function useMarketAnalyses() {
  const [analyses, setAnalyses] = useState<MarketAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnalyses([
        {
          id: '1',
          location: 'Sukhumvit, Bangkok',
          marketScore: 8.5,
          competitorCount: 23,
          recommendations: ['High foot traffic', 'Tourist area', 'Premium pricing'],
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          location: 'Silom, Bangkok',
          marketScore: 7.2,
          competitorCount: 31,
          recommendations: ['Business district', 'Lunch crowd', 'Delivery focus'],
          createdAt: '2024-01-14'
        }
      ]);
      setError(null);
    } catch (err) {
      setError('Failed to load market analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  return { analyses, loading, error, refetch: fetchAnalyses };
}

// Hook for AI insights
export function useAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setInsights([
        {
          id: '1',
          title: 'Peak Hours Opportunity',
          description: 'Consider extending lunch hours to capture 15% more customers',
          type: 'opportunity',
          confidence: 0.92,
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Menu Optimization',
          description: 'Thai curry dishes show 23% higher profit margins',
          type: 'recommendation',
          confidence: 0.87,
          createdAt: '2024-01-15'
        },
        {
          id: '3',
          title: 'Seasonal Trend Alert',
          description: 'Spicy food demand increases 18% during cool season',
          type: 'trend',
          confidence: 0.94,
          createdAt: '2024-01-14'
        }
      ]);
      setError(null);
    } catch (err) {
      setError('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return { insights, loading, error, refetch: fetchInsights };
}

// Hook for analytics data
export function useAnalyticsData() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setAnalytics({
        revenue: 125000,
        growth: 12.5,
        customers: 1250,
        orders: 3400,
        charts: []
      });
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

// Hook for location intelligence
export function useLocationIntelligence() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 900));
      
      setLocationData({
        locations: [],
        heatmapData: [],
        insights: ['High density area', 'Good transport links', 'Growing population']
      });
      setError(null);
    } catch (err) {
      setError('Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  return { locationData, loading, error, refetch: fetchLocationData };
}

// Hook for restaurant explorer
export function useRestaurantExplorer() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setRestaurants([
        {
          id: '1',
          name: 'Thai Garden',
          cuisine: 'Thai',
          rating: 4.5,
          location: 'Sukhumvit',
          distance: 0.5
        },
        {
          id: '2',
          name: 'Spice Route',
          cuisine: 'Thai',
          rating: 4.2,
          location: 'Silom',
          distance: 1.2
        }
      ]);
      setError(null);
    } catch (err) {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return { restaurants, loading, error, refetch: fetchRestaurants };
}
