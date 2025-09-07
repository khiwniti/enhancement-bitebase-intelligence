import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, ApiError } from '@/shared/types'

// API Configuration
// Use Cloudflare Workers backend (deployed or local development)
const API_BASE_URL = process.env.NEXT_PUBLIC_WORKERS_API_URL || 'http://localhost:8787'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp for debugging
    ;(config as any).metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development') {
      const endTime = new Date()
      const startTime = (response.config as any).metadata?.startTime
      if (startTime) {
        const duration = endTime.getTime() - startTime.getTime()
        console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`)
      }
    }
    
    return response
  },
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/auth/login'
      }
    }
    
    // Transform error to consistent format
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.code || error.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details || {}
    }
    
    return Promise.reject(apiError)
  }
)

// Generic API methods
class ApiService {
  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(url, config)
    return response.data
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  /**
   * Upload file
   */
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response = await apiClient.post<ApiResponse<T>>(url, formData, config)
    return response.data
  }

  /**
   * Download file
   */
  async download(url: string, filename?: string): Promise<void> {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    })

    // Create blob link to download
    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(link.href)
  }
}

// Create API service instance
export const api = new ApiService()

// Specific API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  signup: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  updateProfile: (data: any) =>
    api.patch('/auth/me', data),
}

export const dashboardApi = {
  getDashboard: () =>
    api.get('/analytics/dashboard'),
  
  getMetrics: (params?: any) =>
    api.get('/analytics/dashboard', { params }),
}

export const analyticsApi = {
  getDashboard: (params?: any) =>
    api.get('/analytics/dashboard', { params }),
  
  getMetrics: (params?: any) =>
    api.get('/analytics/metrics', { params }),
  
  getRevenue: (params?: any) =>
    api.get('/analytics/revenue', { params }),
  
  getLocations: (params?: any) =>
    api.get('/analytics/locations', { params }),
  
  getCuisine: (params?: any) =>
    api.get('/analytics/cuisine', { params }),
  
  getPerformance: (params?: any) =>
    api.get('/analytics/performance', { params }),
  
  getRealtime: () =>
    api.get('/analytics/realtime'),
  
  exportData: (params: any) =>
    api.get('/analytics/export', { params }),
}

export const nlQueryApi = {
  processQuery: (query: string, context?: any) =>
    api.post('/ai/nl-query', { query, context }),
  
  getSuggestions: (partial: string) =>
    api.get('/ai/suggestions', { params: { q: partial } }),
  
  getHistory: (limit?: number) =>
    api.get('/ai/query-history', { params: { limit } }),
}

export const insightsApi = {
  getInsights: (params?: any) =>
    api.get('/ai/insights', { params }),
  
  generateInsights: (params?: any) =>
    api.post('/ai/insights/generate', params),
  
  getRecommendations: (params?: any) =>
    api.get('/ai/recommendations', { params }),
  
  getMetrics: () =>
    api.get('/ai/insights/metrics'),
}

export const fourPApi = {
  getProductIntelligence: (params?: any) =>
    api.get('/4p/product', { params }),
  
  getPlaceIntelligence: (params?: any) =>
    api.get('/4p/place', { params }),
  
  getPriceIntelligence: (params?: any) =>
    api.get('/4p/price', { params }),
  
  getPromotionIntelligence: (params?: any) =>
    api.get('/4p/promotion', { params }),
  
  getComprehensiveAnalysis: (params?: any) =>
    api.get('/4p/analysis', { params }),
}

export const managementApi = {
  getRestaurants: (params?: any) =>
    api.get('/management/restaurants', { params }),
  
  createRestaurant: (data: any) =>
    api.post('/management/restaurants', data),
  
  updateRestaurant: (id: string, data: any) =>
    api.put(`/management/restaurants/${id}`, data),
  
  deleteRestaurant: (id: string) =>
    api.delete(`/management/restaurants/${id}`),
  
  getCampaigns: (params?: any) =>
    api.get('/management/campaigns', { params }),
  
  createCampaign: (data: any) =>
    api.post('/management/campaigns', data),
  
  updateCampaign: (id: string, data: any) =>
    api.put(`/management/campaigns/${id}`, data),
  
  deleteCampaign: (id: string) =>
    api.delete(`/management/campaigns/${id}`),
}

export const integrationsApi = {
  // POS Integrations
  getPOSIntegrations: () =>
    api.get('/integrations/pos'),
  
  createPOSIntegration: (data: any) =>
    api.post('/integrations/pos', data),
  
  updatePOSIntegration: (id: string, data: any) =>
    api.put(`/integrations/pos/${id}`, data),
  
  deletePOSIntegration: (id: string) =>
    api.delete(`/integrations/pos/${id}`),
  
  testPOSConnection: (id: string) =>
    api.post(`/integrations/pos/${id}/test`),
  
  syncPOSData: (id: string) =>
    api.post(`/integrations/pos/${id}/sync`),
  
  // Connectors
  getConnectors: (params?: any) =>
    api.get('/integrations/connectors', { params }),
  
  createConnector: (data: any) =>
    api.post('/integrations/connectors', data),
  
  updateConnector: (id: string, data: any) =>
    api.put(`/integrations/connectors/${id}`, data),
  
  deleteConnector: (id: string) =>
    api.delete(`/integrations/connectors/${id}`),
  
  testConnector: (id: string) =>
    api.post(`/integrations/connectors/${id}/test`),
  
  // Webhooks
  getWebhooks: (params?: any) =>
    api.get('/integrations/webhooks', { params }),
  
  createWebhook: (data: any) =>
    api.post('/integrations/webhooks', data),
  
  updateWebhook: (id: string, data: any) =>
    api.put(`/integrations/webhooks/${id}`, data),
  
  deleteWebhook: (id: string) =>
    api.delete(`/integrations/webhooks/${id}`),
  
  testWebhook: (id: string) =>
    api.post(`/integrations/webhooks/${id}/test`),
  
  // API Proxy
  proxyRequest: (target: string, data: any) =>
    api.post('/integrations/proxy', { target, ...data }),
}

// Export the axios instance for direct use if needed
export { apiClient }
export default api
