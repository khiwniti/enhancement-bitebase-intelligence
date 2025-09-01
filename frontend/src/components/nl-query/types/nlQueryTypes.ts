/**
 * BiteBase Intelligence Natural Language Query Types
 * TypeScript definitions for NL query system
 */

// Base query request structure
export interface NLQueryRequest {
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
}

// Query processing result
export interface NLQueryResponse {
  success: boolean
  query_id: string
  original_query: string
  processed_query: ProcessedQuery
  generated_sql: string
  chart_data?: ChartData
  chart_config?: ChartConfig
  confidence: ConfidenceScore
  execution_time_ms: number
  suggestions: string[]
  errors: string[]
}

// Processed query structure
export interface ProcessedQuery {
  intent: QueryIntent
  entities: QueryEntity[]
  filters: QueryFilter[]
  aggregations: QueryAggregation[]
  time_range?: TimeRange
}

// Query intent classification
export interface QueryIntent {
  intent_type: 'revenue_analysis' | 'customer_metrics' | 'menu_performance' | 
               'location_comparison' | 'trend_analysis' | 'ranking' | 'general'
  confidence: number
  sub_intent?: string
  description: string
}

// Extracted entities
export interface QueryEntity {
  entity_type: 'time_period' | 'location' | 'menu_item' | 'metric' | 'comparison'
  value: string
  confidence: number
  normalized_value?: string
}

// Query filters
export interface QueryFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'like'
  value: unknown
  confidence: number
}

// Query aggregations
export interface QueryAggregation {
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'group_by'
  field: string
  alias?: string
}

// Time range specification
export interface TimeRange {
  start_date?: string
  end_date?: string
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  relative?: string // e.g., 'last_30_days', 'this_quarter'
}

// Chart data structure
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    [key: string]: unknown
  }>
  metadata?: {
    total_records: number
    query_time_ms: number
    data_source: string
  }
}

// Chart configuration
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'treemap' | 'heatmap'
  title: string
  description?: string
  options: {
    responsive?: boolean
    maintainAspectRatio?: boolean
    plugins?: Record<string, unknown>
    scales?: Record<string, unknown>
    [key: string]: unknown
  }
  suggested_alternatives?: string[]
}

// Confidence scoring
export interface ConfidenceScore {
  overall_confidence: number
  intent_confidence: number
  entity_confidence: number
  sql_confidence: number
  data_availability_confidence: number
  factors: Array<{
    factor: string
    score: number
    weight: number
    explanation: string
  }>
}

// Query suggestions response
export interface QuerySuggestionResponse {
  suggestions: string[]
  categories: {
    revenue: string[]
    customers: string[]
    menu: string[]
    location: string[]
    general: string[]
  }
  examples: string[]
}

// Query history response
export interface QueryHistoryResponse {
  queries: Array<{
    id: string
    query: string
    success: boolean
    confidence: number
    chart_type?: string
    created_at: string
    execution_time_ms: number
  }>
  total: number
  success_rate: number
  avg_confidence: number
  popular_patterns: string[]
}

// Query feedback
export interface QueryFeedback {
  query_id: string
  rating: 1 | 2 | 3 | 4 | 5
  feedback_text?: string
  was_helpful: boolean
  suggested_improvements?: string[]
}

// Performance metrics
export interface QueryPerformanceMetrics {
  avg_processing_time: number
  avg_execution_time: number
  success_rate: number
  avg_confidence: number
  total_queries: number
  cache_hit_rate: number
}

// Voice input types
export interface VoiceInputConfig {
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
}

export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

// Component prop types
export interface QuerySuggestionsProps {
  suggestions: QuerySuggestionResponse
  onSelect: (suggestion: string) => void
  onClose: () => void
}

export interface QueryResultsProps {
  result: NLQueryResponse
  onAddToDashboard?: (chartConfig: ChartConfig) => void
  onRegenerateChart?: () => void
}

export interface QueryHistoryProps {
  history: QueryHistoryResponse
  onQuerySelect: (query: string) => void
  onClose: () => void
}

export interface ConfidenceIndicatorProps {
  confidence: ConfidenceScore
  showDetails?: boolean
}

export interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  isActive: boolean
  onActiveChange: (active: boolean) => void
  config?: Partial<VoiceInputConfig>
}

// API response wrapper
export interface APIResponse<T> {
  data?: T
  error?: string
  status: number
  message?: string
}

// Hook return types
export interface UseNLQueryReturn {
  processQuery: (request: NLQueryRequest) => Promise<NLQueryResponse | null>
  validateQuery: (request: NLQueryRequest) => Promise<Record<string, unknown>>
  getSuggestions: (partialQuery?: string) => Promise<void>
  getHistory: () => Promise<void>
  submitFeedback: (feedback: QueryFeedback) => Promise<void>
  isLoading: boolean
  error: string | null
  result: NLQueryResponse | null
  suggestions: QuerySuggestionResponse | null
  history: QueryHistoryResponse | null
  clearError: () => void
  clearResult: () => void
}