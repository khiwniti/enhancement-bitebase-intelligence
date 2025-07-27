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
}