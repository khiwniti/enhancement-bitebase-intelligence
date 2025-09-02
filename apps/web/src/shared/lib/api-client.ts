import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, ApiError } from '@/shared/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
    api.get('/auth/profile'),
  
  updateProfile: (data: any) =>
    api.patch('/auth/profile', data),
}

export const dashboardApi = {
  getDashboards: (params?: any) =>
    api.get('/dashboards', { params }),
  
  getDashboard: (id: string) =>
    api.get(`/dashboards/${id}`),
  
  createDashboard: (data: any) =>
    api.post('/dashboards', data),
  
  updateDashboard: (id: string, data: any) =>
    api.patch(`/dashboards/${id}`, data),
  
  deleteDashboard: (id: string) =>
    api.delete(`/dashboards/${id}`),
  
  duplicateDashboard: (id: string) =>
    api.post(`/dashboards/${id}/duplicate`),
}

export const analyticsApi = {
  getMetrics: (params?: any) =>
    api.get('/analytics/metrics', { params }),
  
  getChartData: (chartId: string, params?: any) =>
    api.get(`/analytics/charts/${chartId}`, { params }),
  
  executeQuery: (query: string, params?: any) =>
    api.post('/analytics/query', { query, ...params }),
  
  getInsights: (params?: any) =>
    api.get('/analytics/insights', { params }),
  
  generateReport: (config: any) =>
    api.post('/analytics/reports', config),
  
  exportData: (params: any) =>
    api.post('/analytics/export', params),
}

export const nlQueryApi = {
  processQuery: (query: string, context?: any) =>
    api.post('/nl-query/process', { query, context }),
  
  getSuggestions: (partial: string) =>
    api.get('/nl-query/suggestions', { params: { q: partial } }),
  
  getHistory: (limit?: number) =>
    api.get('/nl-query/history', { params: { limit } }),
  
  saveQuery: (query: string, results: any) =>
    api.post('/nl-query/save', { query, results }),
}

export const insightsApi = {
  getInsights: (params?: any) =>
    api.get('/insights', { params }),
  
  getInsight: (id: string) =>
    api.get(`/insights/${id}`),
  
  acknowledgeInsight: (id: string) =>
    api.patch(`/insights/${id}/acknowledge`),
  
  dismissInsight: (id: string) =>
    api.patch(`/insights/${id}/dismiss`),
  
  generateInsights: (params?: any) =>
    api.post('/insights/generate', params),
  
  getInsightMetrics: () =>
    api.get('/insights/metrics'),
}

export const notificationsApi = {
  getNotifications: (params?: any) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  
  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
}

export const settingsApi = {
  getSettings: () =>
    api.get('/settings'),
  
  updateSettings: (data: any) =>
    api.patch('/settings', data),
  
  getIntegrations: () =>
    api.get('/settings/integrations'),
  
  updateIntegration: (id: string, data: any) =>
    api.patch(`/settings/integrations/${id}`, data),
}

// Export the axios instance for direct use if needed
export { apiClient }
export default api
