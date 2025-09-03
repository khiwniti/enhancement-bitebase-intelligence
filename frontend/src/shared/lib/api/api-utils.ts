import { apiClient } from '../api-client'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: any
}

/**
 * Generic API utility for handling common API operations
 */
export class ApiUtils {
  /**
   * Make a safe API call with error handling
   */
  static async safeApiCall<T>(
    apiCall: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    try {
      return await apiCall()
    } catch (error) {
      console.error('API call failed:', error)
      if (fallback !== undefined) {
        return fallback
      }
      throw error
    }
  }

  /**
   * Format query parameters for API requests
   */
  static formatQueryParams(params: Record<string, any>): Record<string, any> {
    const formatted: Record<string, any> = {}
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formatted[key] = value
      }
    })
    
    return formatted
  }

  /**
   * Handle paginated API responses
   */
  static async getPaginatedData<T>(
    endpoint: string,
    params: PaginationParams & SortParams & FilterParams = {}
  ): Promise<{
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const queryParams = this.formatQueryParams({
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy,
      order: params.order,
      ...params
    })

    const response = await apiClient.get(endpoint, { params: queryParams })
    return response.data
  }

  /**
   * Retry an API call with exponential backoff
   */
  static async retryApiCall<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          break
        }
        
        const delay = initialDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }

  /**
   * Cache API responses in session storage
   */
  static cacheResponse<T>(key: string, data: T, ttlMinutes: number = 5): void {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    }
    
    try {
      sessionStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheItem))
    } catch (error) {
      console.warn('Failed to cache API response:', error)
    }
  }

  /**
   * Get cached API response
   */
  static getCachedResponse<T>(key: string): T | null {
    try {
      const cached = sessionStorage.getItem(`api_cache_${key}`)
      if (!cached) return null
      
      const cacheItem = JSON.parse(cached)
      const now = Date.now()
      
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        sessionStorage.removeItem(`api_cache_${key}`)
        return null
      }
      
      return cacheItem.data
    } catch (error) {
      console.warn('Failed to get cached API response:', error)
      return null
    }
  }

  /**
   * Clear all cached API responses
   */
  static clearCache(): void {
    try {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith('api_cache_')) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear API cache:', error)
    }
  }
}

/**
 * Specific API utility functions for common operations
 */
export const apiUtils = {
  /**
   * Fetch restaurants with caching and error handling
   */
  async getRestaurants(params: {
    city?: string
    cuisine?: string
    rating?: number
    page?: number
    limit?: number
  } = {}) {
    const cacheKey = `restaurants_${JSON.stringify(params)}`
    const cached = ApiUtils.getCachedResponse(cacheKey)
    
    if (cached) {
      return cached
    }
    
    return ApiUtils.safeApiCall(async () => {
      const data = await ApiUtils.getPaginatedData('/restaurants', params)
      ApiUtils.cacheResponse(cacheKey, data, 10) // Cache for 10 minutes
      return data
    })
  },

  /**
   * Fetch analytics data with retry logic
   */
  async getAnalytics(params: { timeRange?: string } = {}) {
    return ApiUtils.retryApiCall(async () => {
      const response = await apiClient.get('/analytics/metrics', { params })
      return response.data
    })
  },

  /**
   * Get user profile with error handling
   */
  async getUserProfile() {
    return ApiUtils.safeApiCall(async () => {
      const response = await apiClient.get('/auth/me')
      return response.data
    })
  },

  /**
   * Upload file with progress tracking
   */
  async uploadFile(
    file: File,
    endpoint: string = '/upload',
    onProgress?: (progress: number) => void
  ) {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  },

  /**
   * Bulk operations utility
   */
  async bulkOperation<T>(
    items: T[],
    operation: (item: T) => Promise<any>,
    batchSize: number = 5
  ): Promise<any[]> {
    const results: any[] = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchPromises = batch.map(operation)
      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)
    }
    
    return results
  }
}