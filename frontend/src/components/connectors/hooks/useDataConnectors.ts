/**
 * BiteBase Intelligence Data Connectors Hook
 * Custom React hook for managing data connector state and API integration
 */

import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Connector,
  ConnectorConfig,
  ConnectorFormData,
  ConnectorListResponse,
  ConnectorResponse,
  CreateConnectorResponse,
  ConnectionResult,
  TestResult,
  UseConnectorReturn,
  ConnectorType,
  AuthenticationType
} from '../types/connectorTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface APIError extends Error {
  status?: number
  statusText?: string
}

class ConnectorAPIError extends Error implements APIError {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'ConnectorAPIError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ConnectorAPIError(
      errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText
    )
  }
  
  return response.json()
}

// API client for connector operations
const connectorAPI = {
  // List all connectors
  list: async (params?: {
    connector_type?: string
    include_disconnected?: boolean
  }): Promise<Connector[]> => {
    const searchParams = new URLSearchParams()
    if (params?.connector_type) searchParams.set('connector_type', params.connector_type)
    if (params?.include_disconnected !== undefined) {
      searchParams.set('include_disconnected', params.include_disconnected.toString())
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/connectors?${searchParams}`
    )
    return handleResponse<Connector[]>(response)
  },

  // Get a specific connector
  get: async (id: string): Promise<Connector> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/${id}`)
    return handleResponse<Connector>(response)
  },

  // Create a new connector
  create: async (config: ConnectorConfig): Promise<CreateConnectorResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    return handleResponse<CreateConnectorResponse>(response)
  },

  // Delete a connector
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/${id}`, {
      method: 'DELETE',
    })
    return handleResponse<{ message: string }>(response)
  },

  // Connect to a data source
  connect: async (id: string): Promise<ConnectionResult> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/${id}/connect`, {
      method: 'POST',
    })
    return handleResponse<ConnectionResult>(response)
  },

  // Disconnect from a data source
  disconnect: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/${id}/disconnect`, {
      method: 'POST',
    })
    return handleResponse<{ message: string }>(response)
  },

  // Test connection
  test: async (id: string): Promise<TestResult> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/${id}/test`, {
      method: 'POST',
    })
    return handleResponse<TestResult>(response)
  },

  // Get supported connector types
  getSupportedTypes: async (): Promise<{
    supported_types: string[]
    auth_types: string[]
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/types`)
    return handleResponse<{
      supported_types: string[]
      auth_types: string[]
    }>(response)
  },

  // Get registry stats
  getRegistryStats: async (): Promise<{
    total_connectors: number
    connected_connectors: number
    disconnected_connectors: number
    connector_types: Record<string, number>
    supported_types: string[]
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/registry/stats`)
    return handleResponse<{
      total_connectors: number
      connected_connectors: number
      disconnected_connectors: number
      connector_types: Record<string, number>
      supported_types: string[]
    }>(response)
  }
}

// Helper function to convert form data to connector config
function formDataToConfig(formData: ConnectorFormData): ConnectorConfig {
  return {
    connector_type: formData.connector_type,
    name: formData.name,
    description: formData.description,
    host: formData.host || undefined,
    port: formData.port ? parseInt(formData.port) : undefined,
    database: formData.database || undefined,
    username: formData.username || undefined,
    password: formData.password || undefined,
    auth_type: formData.auth_type,
    api_key: formData.api_key || undefined,
    token: formData.token || undefined,
    pool_size: formData.pool_size || 5,
    max_overflow: 10,
    pool_timeout: 30,
    connection_timeout: formData.connection_timeout || 30,
    query_timeout: formData.query_timeout || 300,
    use_ssl: formData.use_ssl || false,
    extra_params: formData.extra_params || {}
  }
}

export function useDataConnectors(): UseConnectorReturn {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Query for connectors list
  const {
    data: connectors = [],
    isLoading: loading,
    error: queryError,
    refetch: refreshConnectors
  } = useQuery({
    queryKey: ['connectors'],
    queryFn: () => connectorAPI.list({ include_disconnected: true }),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Create connector mutation
  const createConnectorMutation = useMutation({
    mutationFn: (config: ConnectorConfig) => connectorAPI.create(config),
    onSuccess: (data) => {
      // Invalidate and refetch connectors list
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      // Add the new connector to the cache
      queryClient.setQueryData(['connector', data.connector_id], data.connector)
      setError(null)
    },
    onError: (error: ConnectorAPIError) => {
      setError(error.message)
    }
  })

  // Delete connector mutation
  const deleteConnectorMutation = useMutation({
    mutationFn: (id: string) => connectorAPI.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: ['connector', id] })
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      setError(null)
    },
    onError: (error: ConnectorAPIError) => {
      setError(error.message)
    }
  })

  // Connect connector mutation
  const connectConnectorMutation = useMutation({
    mutationFn: (id: string) => connectorAPI.connect(id),
    onSuccess: (_, id) => {
      // Invalidate connector data to refresh connection status
      queryClient.invalidateQueries({ queryKey: ['connector', id] })
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      setError(null)
    },
    onError: (error: ConnectorAPIError) => {
      setError(error.message)
    }
  })

  // Disconnect connector mutation
  const disconnectConnectorMutation = useMutation({
    mutationFn: (id: string) => connectorAPI.disconnect(id),
    onSuccess: (_, id) => {
      // Invalidate connector data to refresh connection status
      queryClient.invalidateQueries({ queryKey: ['connector', id] })
      queryClient.invalidateQueries({ queryKey: ['connectors'] })
      setError(null)
    },
    onError: (error: ConnectorAPIError) => {
      setError(error.message)
    }
  })

  // Test connector mutation
  const testConnectorMutation = useMutation({
    mutationFn: (id: string) => connectorAPI.test(id),
    onError: (error: ConnectorAPIError) => {
      setError(error.message)
    }
  })

  // Create connector from config
  const createConnector = useCallback(async (config: ConnectorConfig): Promise<string> => {
    try {
      setError(null)
      const result = await createConnectorMutation.mutateAsync(config)
      return result.connector_id
    } catch (error) {
      if (error instanceof ConnectorAPIError) {
        setError(error.message)
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to create connector'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [createConnectorMutation])

  // Delete connector
  const deleteConnector = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await deleteConnectorMutation.mutateAsync(id)
    } catch (error) {
      if (error instanceof ConnectorAPIError) {
        setError(error.message)
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete connector'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [deleteConnectorMutation])

  // Connect connector
  const connectConnector = useCallback(async (id: string): Promise<ConnectionResult> => {
    try {
      setError(null)
      return await connectConnectorMutation.mutateAsync(id)
    } catch (error) {
      if (error instanceof ConnectorAPIError) {
        setError(error.message)
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [connectConnectorMutation])

  // Disconnect connector
  const disconnectConnector = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await disconnectConnectorMutation.mutateAsync(id)
    } catch (error) {
      if (error instanceof ConnectorAPIError) {
        setError(error.message)
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [disconnectConnectorMutation])

  // Test connector
  const testConnector = useCallback(async (id: string): Promise<TestResult> => {
    try {
      setError(null)
      return await testConnectorMutation.mutateAsync(id)
    } catch (error) {
      if (error instanceof ConnectorAPIError) {
        setError(error.message)
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to test connection'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [testConnectorMutation])

  // Refresh connectors list
  const refreshConnectorsList = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      await refreshConnectors()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh connectors'
      setError(errorMessage)
    }
  }, [refreshConnectors])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Determine loading state
  const isLoading = loading || 
    createConnectorMutation.isPending || 
    deleteConnectorMutation.isPending || 
    connectConnectorMutation.isPending || 
    disconnectConnectorMutation.isPending ||
    testConnectorMutation.isPending

  // Determine error state
  const currentError = error ||
    (queryError instanceof Error ? queryError.message : undefined)

  return {
    // State
    connectors,
    loading: isLoading,
    error: currentError,

    // Actions
    createConnector,
    deleteConnector,
    connectConnector,
    disconnectConnector,
    testConnector,
    refreshConnectors: refreshConnectorsList,

  }
}

export default useDataConnectors