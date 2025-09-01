/**
 * BiteBase Intelligence Schema Explorer Hook
 * Custom React hook for managing schema exploration and discovery
 */

import { useState, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  SchemaInfo,
  TableInfo,
  UseSchemaReturn,
  SchemaExplorerState
} from '../types/connectorTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface APIError extends Error {
  status?: number
  statusText?: string
}

class SchemaAPIError extends Error implements APIError {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'SchemaAPIError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new SchemaAPIError(
      errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText
    )
  }
  
  return response.json()
}

// API client for schema operations
const schemaAPI = {
  // Get schema information for a connector
  getSchema: async (connectorId: string): Promise<SchemaInfo> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/${connectorId}/schema`)
    return handleResponse<SchemaInfo>(response)
  },

  // Get list of tables for a connector
  getTables: async (connectorId: string): Promise<TableInfo[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/connectors/${connectorId}/tables`)
    return handleResponse<TableInfo[]>(response)
  }
}

export function useSchemaExplorer(connectorId?: string): UseSchemaReturn {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | undefined>(undefined)
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
  const abortControllerRef = useRef<AbortController | null>(null)

  // Query for schema data
  const {
    data: schema,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['connector-schema', connectorId],
    queryFn: () => connectorId ? schemaAPI.getSchema(connectorId) : Promise.resolve(undefined),
    enabled: !!connectorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })

  // Query for tables list (fallback if schema doesn't include tables)
  const {
    data: tables = [],
    isLoading: tablesLoading
  } = useQuery({
    queryKey: ['connector-tables', connectorId],
    queryFn: () => connectorId ? schemaAPI.getTables(connectorId) : Promise.resolve([]),
    enabled: !!connectorId && !schema?.tables?.length,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })

  // Load schema for a specific connector
  const loadSchema = useCallback(async (newConnectorId: string): Promise<void> => {
    try {
      setError(undefined)
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Clear expanded tables when switching connectors
      setExpandedTables(new Set())

      // Invalidate and refetch schema data
      await queryClient.invalidateQueries({ 
        queryKey: ['connector-schema', newConnectorId] 
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['connector-tables', newConnectorId] 
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load schema'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [queryClient])

  // Refresh current schema
  const refreshSchema = useCallback(async (): Promise<void> => {
    try {
      setError(undefined)
      await refetch()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh schema'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [refetch])

  // Toggle table expansion
  const toggleTableExpansion = useCallback((tableName: string) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tableName)) {
        newSet.delete(tableName)
      } else {
        newSet.add(tableName)
      }
      return newSet
    })
  }, [])

  // Expand all tables
  const expandAllTables = useCallback(() => {
    const allTables = schema?.tables || tables
    const tableNames = allTables.map(table => table.name)
    setExpandedTables(new Set(tableNames))
  }, [schema?.tables, tables])

  // Collapse all tables
  const collapseAllTables = useCallback(() => {
    setExpandedTables(new Set())
  }, [])

  // Check if a table is expanded
  const isTableExpanded = useCallback((tableName: string): boolean => {
    return expandedTables.has(tableName)
  }, [expandedTables])

  // Get table by name
  const getTable = useCallback((tableName: string): TableInfo | undefined => {
    const allTables = schema?.tables || tables
    return allTables.find(table => table.name === tableName)
  }, [schema?.tables, tables])

  // Search tables and columns
  const searchSchema = useCallback((searchTerm: string): {
    tables: TableInfo[]
    columns: Array<{ table: string; column: string; info: any }>
  } => {
    const allTables = schema?.tables || tables
    const searchLower = searchTerm.toLowerCase()
    
    const matchingTables = allTables.filter(table => 
      table.name.toLowerCase().includes(searchLower) ||
      table.description?.toLowerCase().includes(searchLower)
    )

    const matchingColumns: Array<{ table: string; column: string; info: any }> = []
    
    allTables.forEach(table => {
      table.columns.forEach(column => {
        if (
          column.name.toLowerCase().includes(searchLower) ||
          column.description?.toLowerCase().includes(searchLower) ||
          column.data_type.toLowerCase().includes(searchLower)
        ) {
          matchingColumns.push({
            table: table.name,
            column: column.name,
            info: column
          })
        }
      })
    })

    return {
      tables: matchingTables,
      columns: matchingColumns
    }
  }, [schema?.tables, tables])

  // Get schema statistics
  const getSchemaStats = useCallback(() => {
    const allTables = schema?.tables || tables
    
    const totalTables = allTables.length
    const totalColumns = allTables.reduce((sum, table) => sum + table.columns.length, 0)
    const totalRows = allTables.reduce((sum, table) => sum + (table.row_count || 0), 0)
    const totalSize = allTables.reduce((sum, table) => sum + (table.size_bytes || 0), 0)

    const columnTypes = new Map<string, number>()
    allTables.forEach(table => {
      table.columns.forEach(column => {
        const type = column.data_type
        columnTypes.set(type, (columnTypes.get(type) || 0) + 1)
      })
    })

    return {
      totalTables,
      totalColumns,
      totalRows,
      totalSize,
      columnTypes: Object.fromEntries(columnTypes),
      hasViews: schema?.views && schema.views.length > 0
    }
  }, [schema?.tables, schema?.views, tables])

  // Clear error
  const clearError = useCallback(() => {
    setError(undefined)
  }, [])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Determine loading state
  const isLoading = loading || tablesLoading

  // Determine error state
  const currentError = error || 
    (queryError instanceof Error ? queryError.message : undefined)

  // Get all tables (from schema or fallback)
  const allTables = schema?.tables || tables

  return {
    // State
    schema,
    tables: allTables,
    loading: isLoading,
    error: currentError,

    // Actions
    loadSchema,
    refreshSchema
  }
}

export default useSchemaExplorer