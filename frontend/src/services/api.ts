/**
 * BiteBase Intelligence API Service
 * Comprehensive API client for all backend communication
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface Restaurant {
  id: string;
  name: string;
  brand: string;
  cuisine_types: string[];
  category: 'fast-food' | 'casual-dining' | 'fine-dining' | 'cafe';
  price_range: '$' | '$$' | '$$$' | '$$$$';
  address: string;
  city: string;
  area: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  average_rating?: number;
  total_reviews: number;
  estimated_revenue?: number;
  employee_count?: number;
  is_active: boolean;
  distance_meters?: number;
}

export interface AnalyticsOverview {
  revenue: {
    total: number;
    monthly_growth: number;
    weekly_data: Array<{
      week: string;
      revenue: number;
    }>;
  };
  customers: {
    total: number;
    growth_rate: number;
    new_customers: number;
    returning_customers: number;
  };
  orders: {
    total: number;
    average_order_value: number;
    peak_hours: string[];
  };
}

export interface RevenueAnalytics {
  period: string;
  total_revenue: number;
  total_orders: number;
  growth_rate: number;
  time_series: Array<{
    date: string;
    revenue: number;
    orders: number;
    avg_order_value: number;
  }>;
}

export interface MarketInsights {
  market_trends: Array<{
    trend: string;
    growth: number;
    description: string;
  }>;
  competitive_analysis: {
    market_position: string;
    competitive_score: number;
    opportunities: string[];
  };
  recommendations: string[];
}

export interface AIRecommendations {
  menu_optimization: Array<{
    item: string;
    recommendation: string;
    reasoning: string;
    potential_impact: string;
  }>;
  operational_insights: Array<{
    area: string;
    recommendation: string;
    impact: string;
  }>;
  marketing_suggestions: Array<{
    channel: string;
    action: string;
    expected_roi: string;
  }>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface SearchResponse {
  query: string;
  results: Restaurant[];
  total_found: number;
}

export interface NearbyLocationsResponse {
  restaurants: Restaurant[];
  search_center: { lat: number; lon: number };
  radius_meters: number;
  total_found: number;
}

// API Client Class
class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          // Redirect to login if needed
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Restaurant API
  async getRestaurants(params?: {
    limit?: number;
    offset?: number;
    city?: string;
    cuisine?: string;
    category?: string;
  }): Promise<APIResponse<Restaurant[]>> {
    const response = await this.client.get('/api/v1/restaurants', { params });
    return response.data;
  }

  async getRestaurant(id: string): Promise<APIResponse<Restaurant>> {
    const response = await this.client.get(`/api/v1/restaurants/${id}`);
    return response.data;
  }

  async searchRestaurants(query: string, limit?: number): Promise<APIResponse<SearchResponse>> {
    const response = await this.client.get('/api/v1/search', {
      params: { q: query, limit }
    });
    return response.data;
  }

  async getNearbyRestaurants(
    lat: number,
    lon: number,
    radius?: number
  ): Promise<APIResponse<NearbyLocationsResponse>> {
    const response = await this.client.get('/api/v1/location/nearby', {
      params: { lat, lon, radius }
    });
    return response.data;
  }

  // Analytics API
  async getAnalyticsOverview(): Promise<APIResponse<AnalyticsOverview>> {
    const response = await this.client.get('/api/v1/analytics/overview');
    return response.data;
  }

  async getRevenueAnalytics(period?: string): Promise<APIResponse<RevenueAnalytics>> {
    const response = await this.client.get('/api/v1/analytics/revenue', {
      params: { period }
    });
    return response.data;
  }

  // Insights API
  async getMarketInsights(): Promise<APIResponse<MarketInsights>> {
    const response = await this.client.get('/api/v1/insights/market');
    return response.data;
  }

  async getAIRecommendations(): Promise<APIResponse<AIRecommendations>> {
    const response = await this.client.get('/api/v1/ai/recommendations');
    return response.data;
  }

  // Generic API call method
  async call<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any): Promise<T> {
    const response = await this.client.request({
      method,
      url: endpoint,
      data,
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export convenience methods
export const api = {
  // Health
  health: () => apiClient.healthCheck(),

  // Restaurants
  restaurants: {
    list: (params?: Parameters<typeof apiClient.getRestaurants>[0]) =>
      apiClient.getRestaurants(params),
    get: (id: string) => apiClient.getRestaurant(id),
    search: (query: string, limit?: number) =>
      apiClient.searchRestaurants(query, limit),
    nearby: (lat: number, lon: number, radius?: number) =>
      apiClient.getNearbyRestaurants(lat, lon, radius),
  },

  // Analytics
  analytics: {
    overview: () => apiClient.getAnalyticsOverview(),
    revenue: (period?: string) => apiClient.getRevenueAnalytics(period),
  },

  // Insights
  insights: {
    market: () => apiClient.getMarketInsights(),
    ai: () => apiClient.getAIRecommendations(),
  },

  // Auth
  auth: {
    setToken: (token: string) => apiClient.setAuthToken(token),
    clearToken: () => apiClient['clearAuthToken'](),
  },

  // Generic
  call: <T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any) =>
    apiClient.call<T>(method, endpoint, data),
};

export default api;