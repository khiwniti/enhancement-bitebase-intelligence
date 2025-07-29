const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bitebase.app'

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new APIError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText
    )
  }
  
  return response.json()
}

export const apiClient = {
  // Restaurant endpoints
  restaurants: {
    list: async (params?: {
      skip?: number
      limit?: number
      city?: string
      cuisine?: string
      category?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.skip) searchParams.set('skip', params.skip.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.city) searchParams.set('city', params.city)
      if (params?.cuisine) searchParams.set('cuisine', params.cuisine)
      if (params?.category) searchParams.set('category', params.category)
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/restaurants/?${searchParams}`
      )
      return handleResponse(response)
    },

    get: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/${id}`)
      return handleResponse(response)
    },

    create: async (data: Record<string, unknown>) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },

    update: async (id: string, data: Record<string, unknown>) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/${id}`, {
        method: 'DELETE',
      })
      return handleResponse(response)
    },

    nearby: async (params: {
      latitude: number
      longitude: number
      radius_km?: number
      limit?: number
      cuisine?: string
      category?: string
      min_rating?: number
    }) => {
      const searchParams = new URLSearchParams({
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
      })
      if (params.radius_km) searchParams.set('radius_km', params.radius_km.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())
      if (params.cuisine) searchParams.set('cuisine', params.cuisine)
      if (params.category) searchParams.set('category', params.category)
      if (params.min_rating) searchParams.set('min_rating', params.min_rating.toString())
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/restaurants/nearby/?${searchParams}`
      )
      return handleResponse(response)
    },
  },

  // Location intelligence endpoints
  locations: {
    analyze: async (params: {
      latitude: number
      longitude: number
      radius_km?: number
      cuisine_types?: string[]
      category?: string
    }) => {
      const searchParams = new URLSearchParams({
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
      })
      if (params.radius_km) searchParams.set('analysis_radius_km', params.radius_km.toString())
      if (params.cuisine_types?.length) {
        params.cuisine_types.forEach(cuisine => 
          searchParams.append('cuisine_types', cuisine)
        )
      }
      if (params.category) searchParams.set('category', params.category)
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/locations/analyze?${searchParams}`,
        { method: 'POST' }
      )
      return handleResponse(response)
    },

    score: async (params: {
      latitude: number
      longitude: number
      cuisine_type?: string
      category?: string
    }) => {
      const searchParams = new URLSearchParams({
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
      })
      if (params.cuisine_type) searchParams.set('cuisine_type', params.cuisine_type)
      if (params.category) searchParams.set('category', params.category)
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/locations/score?${searchParams}`
      )
      return handleResponse(response)
    },

    compare: async (data: {
      locations: Array<{
        latitude: number
        longitude: number
        name: string
      }>
      target_cuisine?: string
      target_category?: string
      analysis_radius_km?: number
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/locations/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },
  },

  // Search endpoints
  search: {
    restaurants: async (params: {
      query?: string
      latitude?: number
      longitude?: number
      max_distance_km?: number
      cuisine?: string
      category?: string
      min_rating?: number
      price_range?: string
      skip?: number
      limit?: number
    }) => {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, value.toString())
        }
      })
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/search/restaurants?${searchParams}`
      )
      return handleResponse(response)
    },
  },

  // AI Research Agent endpoints
  ai: {
    marketAnalysis: async (params: {
      latitude: number
      longitude: number
      businessType: string
      radius: number
      restaurantId?: string
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/market-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      return handleResponse(response)
    },

    chat: async (params: {
      message: string
      context: {
        restaurantId?: string
        conversationId?: string
      }
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      return handleResponse(response)
    },

    predictions: async (params: {
      type: string
      timeHorizon: string
      factors: string[]
      restaurantId?: string
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      return handleResponse(response)
    },

    generateInsights: async (params: {
      dataSource: string
      analysisType: string
      timeRange?: string
      restaurantId?: string
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/insights/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      return handleResponse(response)
    },
  },

  // Natural Language Query endpoints
  nlQuery: {
    process: async (params: {
      query: string
      context?: {
        user_preferences?: Record<string, unknown>
        dashboard_context?: Record<string, unknown>
        previous_queries?: Array<{
          query: string
          success: boolean
          confidence: number
        }>
      }
      auto_execute?: boolean
      include_suggestions?: boolean
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/nl-query/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      return handleResponse(response)
    },

    suggestions: async (params?: {
      partial_query?: string
      category?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.partial_query) searchParams.set('partial_query', params.partial_query)
      if (params?.category) searchParams.set('category', params.category)

      const response = await fetch(
        `${API_BASE_URL}/api/v1/nl-query/suggestions?${searchParams}`
      )
      return handleResponse(response)
    },

    validate: async (params: {
      query: string
      context?: Record<string, unknown>
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/nl-query/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      return handleResponse(response)
    },

    history: async (params?: {
      limit?: number
      offset?: number
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.offset) searchParams.set('offset', params.offset.toString())

      const response = await fetch(
        `${API_BASE_URL}/api/v1/nl-query/history?${searchParams}`
      )
      return handleResponse(response)
    },
  },

  // Data Sources Management endpoints
  dataSources: {
    list: async (params?: {
      status?: string
      type?: string
      search?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.set('status', params.status)
      if (params?.type) searchParams.set('type', params.type)
      if (params?.search) searchParams.set('search', params.search)

      const response = await fetch(
        `${API_BASE_URL}/api/v1/data-sources?${searchParams}`
      )
      return handleResponse(response)
    },

    get: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/${id}`)
      return handleResponse(response)
    },

    create: async (data: {
      name: string
      type: string
      description: string
      apiEndpoint: string
      authType: string
      credentials: Record<string, string>
      syncFrequency: string
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },

    update: async (id: string, data: Record<string, unknown>) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/${id}`, {
        method: 'DELETE',
      })
      return handleResponse(response)
    },

    sync: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/${id}/sync`, {
        method: 'POST',
      })
      return handleResponse(response)
    },

    syncAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/sync-all`, {
        method: 'POST',
      })
      return handleResponse(response)
    },

    testConnection: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/${id}/test`, {
        method: 'POST',
      })
      return handleResponse(response)
    },

    getMetrics: async (id: string, timeRange?: string) => {
      const searchParams = new URLSearchParams()
      if (timeRange) searchParams.set('time_range', timeRange)

      const response = await fetch(
        `${API_BASE_URL}/api/v1/data-sources/${id}/metrics?${searchParams}`
      )
      return handleResponse(response)
    },

    getAvailableIntegrations: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/integrations`)
      return handleResponse(response)
    },
  },

  // Reports endpoints
  reports: {
    // Report Templates
    getTemplates: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/templates`)
      return handleResponse(response)
    },

    // Custom Reports
    list: async (params?: { skip?: number; limit?: number; category?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.skip) searchParams.set('skip', params.skip.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.category) searchParams.set('category', params.category)

      const response = await fetch(`${API_BASE_URL}/api/v1/reports?${searchParams}`)
      return handleResponse(response)
    },

    create: async (config: any) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      return handleResponse(response)
    },

    get: async (reportId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}`)
      return handleResponse(response)
    },

    update: async (reportId: string, config: any) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      return handleResponse(response)
    },

    delete: async (reportId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}`, {
        method: 'DELETE'
      })
      return handleResponse(response)
    },

    // Report Generation
    generate: async (reportId: string, options?: any) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {})
      })
      return handleResponse(response)
    },

    generateFromTemplate: async (templateId: string, options?: any) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/templates/${templateId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {})
      })
      return handleResponse(response)
    },

    // Scheduled Reports
    getScheduled: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/scheduled`)
      return handleResponse(response)
    },

    createSchedule: async (reportId: string, schedule: any) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/scheduled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, ...schedule })
      })
      return handleResponse(response)
    },

    updateSchedule: async (scheduleId: string, schedule: any) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/scheduled/${scheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      })
      return handleResponse(response)
    },

    deleteSchedule: async (scheduleId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/scheduled/${scheduleId}`, {
        method: 'DELETE'
      })
      return handleResponse(response)
    },

    toggleSchedule: async (scheduleId: string, isActive: boolean) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/scheduled/${scheduleId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      return handleResponse(response)
    },

    // Report Executions & History
    getExecutions: async (params?: { reportId?: string; status?: string; limit?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.reportId) searchParams.set('reportId', params.reportId)
      if (params?.status) searchParams.set('status', params.status)
      if (params?.limit) searchParams.set('limit', params.limit.toString())

      const response = await fetch(`${API_BASE_URL}/api/v1/reports/executions?${searchParams}`)
      return handleResponse(response)
    },

    getExecution: async (executionId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/executions/${executionId}`)
      return handleResponse(response)
    },

    downloadReport: async (executionId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/executions/${executionId}/download`)

      if (!response.ok) {
        throw new APIError('Download failed', response.status, response.statusText)
      }

      return response.blob()
    },

    deleteExecution: async (executionId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/executions/${executionId}`, {
        method: 'DELETE'
      })
      return handleResponse(response)
    },

    // Report Sharing
    shareReport: async (reportId: string, shareOptions: any) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareOptions)
      })
      return handleResponse(response)
    },

    getSharedReports: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/shared`)
      return handleResponse(response)
    },

    // Export & Download
    export: async (reportId: string, format: string, options?: any) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, ...options })
      })
      return handleResponse(response)
    },

    // Report Metrics
    getMetrics: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/metrics`)
      return handleResponse(response)
    }
  }
}