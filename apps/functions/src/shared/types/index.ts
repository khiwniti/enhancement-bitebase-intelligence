/**
 * Shared Types for Firebase Functions
 * 
 * Common type definitions used across all functions
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  cuisine_type?: string;
  rating?: number;
  price_range?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface AnalyticsData {
  metric: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MarketReport {
  id: string;
  location: Location;
  restaurants: Restaurant[];
  analytics: AnalyticsData[];
  insights: string[];
  generated_at: string;
}
