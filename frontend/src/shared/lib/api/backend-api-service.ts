/**
 * Backend API Service
 * Connects frontend to BiteBase Intelligence backend API
 */

// Backend API Types (matching backend schemas)
export interface BackendRestaurant {
  id: string
  name: string
  brand?: string
  location: {
    latitude: number
    longitude: number
    address: string
    city: string
    area?: string
    country: string
    postal_code?: string
  }
  cuisine_types: string[]
  category: string
  price_range: string
  phone?: string
  email?: string
  website?: string
  seating_capacity?: number
  is_active: boolean
  average_rating?: number
  total_reviews: number
  estimated_revenue?: number
  employee_count?: number
  data_source?: string
  data_quality_score: number
  created_at: string
  updated_at: string
  distance_km?: number
}

export interface BackendRestaurantListResponse {
  restaurants: BackendRestaurant[]
  total: number
  skip: number
  limit: number
  has_more: boolean
}

export interface BackendMenuItem {
  id: string
  name: string
  description?: string
  category: string
  price: number
  currency: string
  is_available: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  calories?: number
  popularity_score?: number
}

export interface BackendRestaurantReview {
  id: string
  rating: number
  review_text?: string
  reviewer_name?: string
  source_platform: string
  review_date: string
  sentiment_score?: number
  sentiment_label?: string
  is_verified: boolean
  helpful_votes: number
}

// API Service Class
class BackendAPIService {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Restaurant endpoints
  async getRestaurants(params: {
    skip?: number
    limit?: number
    city?: string
    area?: string
    cuisine?: string
    category?: string
    brand?: string
    min_rating?: number
    is_active?: boolean
  } = {}): Promise<BackendRestaurantListResponse> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<BackendRestaurantListResponse>(
      `/api/v1/restaurants/?${searchParams.toString()}`
    )
  }

  async getRestaurant(id: string): Promise<BackendRestaurant> {
    return this.request<BackendRestaurant>(`/api/v1/restaurants/${id}`)
  }

  async getNearbyRestaurants(params: {
    latitude: number
    longitude: number
    radius_km?: number
    limit?: number
    cuisine?: string
    category?: string
    min_rating?: number
  }): Promise<BackendRestaurantListResponse> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<BackendRestaurantListResponse>(
      `/api/v1/restaurants/nearby/?${searchParams.toString()}`
    )
  }

  async getRestaurantMenu(restaurantId: string, category?: string): Promise<BackendMenuItem[]> {
    const searchParams = new URLSearchParams()
    if (category) {
      searchParams.append('category', category)
    }

    return this.request<BackendMenuItem[]>(
      `/api/v1/restaurants/${restaurantId}/menu?${searchParams.toString()}`
    )
  }

  async getRestaurantReviews(
    restaurantId: string,
    params: {
      skip?: number
      limit?: number
      min_rating?: number
      source_platform?: string
    } = {}
  ): Promise<BackendRestaurantReview[]> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<BackendRestaurantReview[]>(
      `/api/v1/restaurants/${restaurantId}/reviews?${searchParams.toString()}`
    )
  }

  async createRestaurant(restaurantData: Partial<BackendRestaurant>): Promise<BackendRestaurant> {
    return this.request<BackendRestaurant>('/api/v1/restaurants/', {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    })
  }

  async updateRestaurant(id: string, restaurantData: Partial<BackendRestaurant>): Promise<BackendRestaurant> {
    return this.request<BackendRestaurant>(`/api/v1/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(restaurantData),
    })
  }

  async deleteRestaurant(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/restaurants/${id}`, {
      method: 'DELETE',
    })
  }

  // Analytics and aggregation methods
  async getMarketAnalytics(city?: string): Promise<{
    totalRestaurants: number
    averageRating: number
    priceDistribution: Record<string, number>
    cuisinePopularity: Record<string, number>
    topPerformers: BackendRestaurant[]
  }> {
    try {
      const restaurants = await this.getRestaurants({ 
        city, 
        limit: 1000,
        is_active: true 
      })

      const totalRestaurants = restaurants.total
      const averageRating = restaurants.restaurants.reduce((sum, r) => 
        sum + (r.average_rating || 0), 0
      ) / restaurants.restaurants.filter(r => r.average_rating).length

      // Calculate price distribution
      const priceDistribution: Record<string, number> = {}
      restaurants.restaurants.forEach(r => {
        priceDistribution[r.price_range] = (priceDistribution[r.price_range] || 0) + 1
      })

      // Calculate cuisine popularity
      const cuisinePopularity: Record<string, number> = {}
      restaurants.restaurants.forEach(r => {
        r.cuisine_types.forEach(cuisine => {
          cuisinePopularity[cuisine] = (cuisinePopularity[cuisine] || 0) + 1
        })
      })

      // Get top performers
      const topPerformers = restaurants.restaurants
        .filter(r => r.average_rating && r.average_rating >= 4.0)
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 10)

      return {
        totalRestaurants,
        averageRating,
        priceDistribution,
        cuisinePopularity,
        topPerformers
      }
    } catch (error) {
      console.error('Error fetching market analytics:', error)
      throw error
    }
  }

  // Transform backend restaurant data to frontend format
  transformRestaurantData(backendRestaurant: BackendRestaurant) {
    return {
      id: backendRestaurant.id,
      name: backendRestaurant.name,
      address: backendRestaurant.location.address,
      location: {
        lat: backendRestaurant.location.latitude,
        lng: backendRestaurant.location.longitude
      },
      rating: backendRestaurant.average_rating || 0,
      reviews: backendRestaurant.total_reviews,
      priceLevel: this.mapPriceRangeToLevel(backendRestaurant.price_range),
      cuisine: backendRestaurant.cuisine_types[0] || 'Restaurant',
      businessStatus: backendRestaurant.is_active ? 'OPERATIONAL' : 'CLOSED',
      category: backendRestaurant.category,
      area: backendRestaurant.location.area,
      city: backendRestaurant.location.city,
      country: backendRestaurant.location.country,
      phone: backendRestaurant.phone,
      website: backendRestaurant.website,
      estimatedRevenue: backendRestaurant.estimated_revenue,
      employeeCount: backendRestaurant.employee_count,
      dataQualityScore: backendRestaurant.data_quality_score,
      distance: backendRestaurant.distance_km
    }
  }

  private mapPriceRangeToLevel(priceRange: string): number {
    switch (priceRange) {
      case '$': return 1
      case '$$': return 2
      case '$$$': return 3
      case '$$$$': return 4
      default: return 2
    }
  }
}

export const backendAPIService = new BackendAPIService()
export type { BackendRestaurant, BackendRestaurantListResponse, BackendMenuItem, BackendRestaurantReview }