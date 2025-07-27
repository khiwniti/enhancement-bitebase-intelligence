// Cross-Filtering Types and Interfaces
// BiteBase Intelligence 2.0 - Advanced Chart Library

// Filter Operation Types
export type FilterOperation = 
  | 'equals' | 'not_equals' | 'greater_than' | 'less_than' 
  | 'greater_equal' | 'less_equal' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'between'
  | 'is_null' | 'is_not_null'

// Filter Value Types
export type FilterValue = string | number | boolean | Date | null | (string | number)[]

// Filter Condition
export interface FilterCondition {
  id: string
  field: string
  operation: FilterOperation
  value: FilterValue
  dataType: 'string' | 'number' | 'boolean' | 'date'
  caseSensitive?: boolean
}

// Filter Group (AND/OR logic)
export interface FilterGroup {
  id: string
  operator: 'AND' | 'OR'
  conditions: FilterCondition[]
  groups?: FilterGroup[]
}

// Chart Filter State
export interface ChartFilterState {
  chartId: string
  isActive: boolean
  filters: FilterGroup[]
  appliedAt: Date
  affectedDataPoints: number
}

// Cross-Filter Configuration
export interface CrossFilterConfig {
  mode: 'automatic' | 'manual'
  bidirectional: boolean
  debounceMs: number
  maxFilters: number
  enableHistory: boolean
  persistFilters: boolean
}

// Filter Event Types
export type FilterEventType = 
  | 'filter_applied' | 'filter_removed' | 'filter_cleared'
  | 'filter_updated' | 'filter_mode_changed'

// Filter Event
export interface FilterEvent {
  type: FilterEventType
  chartId: string
  filterId?: string
  filters: FilterGroup[]
  timestamp: Date
  source: 'user' | 'system' | 'api'
}

// Filter History Entry
export interface FilterHistoryEntry {
  id: string
  event: FilterEvent
  previousState: ChartFilterState[]
  newState: ChartFilterState[]
  canUndo: boolean
  canRedo: boolean
}

// Filter Bridge Configuration
export interface FilterBridgeConfig {
  sourceChartId: string
  targetChartIds: string[]
  fieldMapping: Record<string, string>
  transformFunction?: (value: FilterValue) => FilterValue
  enabled: boolean
}

// Filter Validation Result
export interface FilterValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  affectedCharts: string[]
}

// Filter Performance Metrics
export interface FilterPerformanceMetrics {
  filterId: string
  executionTime: number
  dataPointsProcessed: number
  memoryUsage: number
  cacheHits: number
  cacheMisses: number
}

// Filter Context
export interface FilterContext {
  chartId: string
  datasetId: string
  fieldMetadata: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'date'
    nullable: boolean
    unique: boolean
    min?: number
    max?: number
    options?: string[]
  }>
}

// Filter Suggestion
export interface FilterSuggestion {
  field: string
  operation: FilterOperation
  value: FilterValue
  confidence: number
  reason: string
  preview: {
    totalRecords: number
    filteredRecords: number
    sampleData: any[]
  }
}

// Filter Export/Import
export interface FilterExport {
  version: string
  exportedAt: Date
  filters: FilterGroup[]
  metadata: {
    chartIds: string[]
    datasetIds: string[]
    fieldMappings: Record<string, string>
  }
}

// Filter Manager State
export interface FilterManagerState {
  config: CrossFilterConfig
  activeFilters: Record<string, ChartFilterState>
  history: FilterHistoryEntry[]
  bridges: FilterBridgeConfig[]
  performance: FilterPerformanceMetrics[]
  isProcessing: boolean
  lastUpdate: Date
}

// Filter Hook Return Type
export interface UseFilterReturn {
  filters: FilterGroup[]
  activeFilters: ChartFilterState[]
  isFiltering: boolean
  applyFilter: (chartId: string, filter: FilterGroup) => void
  removeFilter: (chartId: string, filterId: string) => void
  clearFilters: (chartId?: string) => void
  toggleMode: () => void
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  exportFilters: () => FilterExport
  importFilters: (filters: FilterExport) => void
}