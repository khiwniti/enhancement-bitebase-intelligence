import { ComponentPropsWithoutRef } from 'react'

/**
 * Core data types for [FeatureName] feature
 */

// Base data structure
export interface [FeatureName]Data {
  id: string
  title?: string
  name?: string
  description?: string
  status: 'active' | 'inactive' | 'pending' | 'archived'
  value?: number | string
  category?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Creation data (without system-generated fields)
export interface [FeatureName]CreateData {
  title?: string
  name?: string
  description?: string
  status?: 'active' | 'inactive' | 'pending'
  value?: number | string
  category?: string
  metadata?: Record<string, any>
}

// Update data (partial fields)
export interface [FeatureName]UpdateData extends Partial<[FeatureName]CreateData> {
  // Any update-specific fields would go here
}

// Filter options
export interface [FeatureName]Filters {
  status?: 'active' | 'inactive' | 'pending' | 'archived'
  category?: string
  search?: string
  dateRange?: {
    start?: Date
    end?: Date
  }
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  limit?: number
}

// View modes
export type [FeatureName]ViewMode = 'grid' | 'list' | 'table' | 'kanban'

// Sort configuration
export interface [FeatureName]SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

// Component prop types
export interface [FeatureName]PageProps extends ComponentPropsWithoutRef<'div'> {
  initialFilters?: [FeatureName]Filters
  initialView?: [FeatureName]ViewMode
}

export interface [FeatureName]HeaderProps extends ComponentPropsWithoutRef<'div'> {
  title: string
  description?: string
  filters?: [FeatureName]Filters
  view?: [FeatureName]ViewMode
  onFiltersChange?: (filters: [FeatureName]Filters) => void
  onViewChange?: (view: [FeatureName]ViewMode) => void
  onRefresh?: () => void
  onExport?: () => void
  isLoading?: boolean
}

export interface [FeatureName]ContentProps extends ComponentPropsWithoutRef<'div'> {
  data?: [FeatureName]Data[]
  filters?: [FeatureName]Filters
  view?: [FeatureName]ViewMode
  onDataUpdate?: () => void
  onItemSelect?: (item: [FeatureName]Data) => void
  onItemAction?: (item: [FeatureName]Data, action: string) => void
  isLoading?: boolean
}

// Action types for state management
export type [FeatureName]ActionType = 
  | 'view'
  | 'edit' 
  | 'delete'
  | 'clone'
  | 'export'
  | 'archive'
  | 'activate'

// API response types
export interface [FeatureName]ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: string
  timestamp: string
}

export interface [FeatureName]ListResponse extends [FeatureName]ApiResponse<[FeatureName]Data[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Event types
export interface [FeatureName]Event {
  type: [FeatureName]ActionType
  data: [FeatureName]Data
  timestamp: Date
  userId?: string
}

// Configuration types
export interface [FeatureName]Config {
  apiEndpoint: string
  refreshInterval: number
  cacheTimeout: number
  defaultView: [FeatureName]ViewMode
  defaultFilters: [FeatureName]Filters
  enableRealTime: boolean
  enableCaching: boolean
}

// Error types
export interface [FeatureName]Error {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Feature state types
export interface [FeatureName]FeatureState {
  isInitialized: boolean
  isLoading: boolean
  error?: [FeatureName]Error
  lastUpdated?: Date
}