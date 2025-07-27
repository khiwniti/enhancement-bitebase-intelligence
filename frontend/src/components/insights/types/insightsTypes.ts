/**
 * BiteBase Intelligence Insights Types
 * TypeScript definitions for the insights system
 */

// Base insight types
export interface InsightResponse {
  id: string
  title: string
  description: string
  insight_type: InsightTypeEnum
  severity: InsightSeverityEnum
  status: InsightStatusEnum
  restaurant_id?: string
  
  confidence_score: number
  impact_score: number
  urgency_score: number
  
  data_points: Record<string, any>
  context?: Record<string, any>
  explanation: string
  recommendations?: string[]
  
  views_count: number
  acknowledged_at?: string
  acknowledged_by?: string
  resolved_at?: string
  resolved_by?: string
  
  user_rating?: number
  user_feedback?: string
  false_positive: boolean
  
  detected_at: string
  created_at: string
  updated_at: string
  
  anomalies?: AnomalyResponse[]
}

export interface AnomalyResponse {
  id: string
  insight_id: string
  restaurant_id?: string
  anomaly_type: AnomalyTypeEnum
  metric_name: string
  metric_value: number
  expected_value?: number
  deviation_score: number
  z_score?: number
  isolation_score?: number
  statistical_significance?: number
  data_timestamp: string
  detection_algorithm: string
  contributing_factors?: Record<string, any>
  related_metrics?: Record<string, any>
  detected_at: string
  created_at: string
  updated_at: string
}

// Enums
export enum InsightTypeEnum {
  REVENUE_ANOMALY = "revenue_anomaly",
  CUSTOMER_PATTERN_CHANGE = "customer_pattern_change",
  MENU_PERFORMANCE = "menu_performance",
  SEASONAL_TREND = "seasonal_trend",
  LOCATION_COMPARISON = "location_comparison",
  OPERATIONAL_INSIGHT = "operational_insight"
}

export enum InsightSeverityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum InsightStatusEnum {
  ACTIVE = "active",
  ACKNOWLEDGED = "acknowledged",
  RESOLVED = "resolved",
  DISMISSED = "dismissed"
}

export enum AnomalyTypeEnum {
  STATISTICAL_OUTLIER = "statistical_outlier",
  TREND_DEVIATION = "trend_deviation",
  SEASONAL_ANOMALY = "seasonal_anomaly",
  CORRELATION_BREAK = "correlation_break"
}

// Request/Response types
export interface InsightSearchParams {
  insight_type?: InsightTypeEnum
  severity?: InsightSeverityEnum
  status?: InsightStatusEnum
  restaurant_id?: string
  min_confidence?: number
  min_impact?: number
  date_from?: Date
  date_to?: Date
  skip?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface InsightListResponse {
  insights: InsightResponse[]
  total: number
  skip: number
  limit: number
  has_more: boolean
}

export interface InsightFeedbackCreate {
  insight_id: string
  user_id: string
  rating: number
  feedback_text?: string
  accuracy_rating?: number
  usefulness_rating?: number
  timeliness_rating?: number
  action_taken?: string
  action_result?: string
  is_false_positive?: boolean
  is_duplicate?: boolean
  suggested_improvements?: string[]
}

export interface InsightFeedbackResponse extends InsightFeedbackCreate {
  id: string
  created_at: string
  updated_at: string
}

export interface InsightGenerationRequest {
  restaurant_ids?: string[]
  insight_types?: InsightTypeEnum[]
  date_range?: {
    start: Date
    end: Date
  }
  force_regenerate?: boolean
}

export interface InsightGenerationResponse {
  job_id: string
  status: string
  insights_generated: number
  processing_time_ms: number
  errors: string[]
}

export interface InsightMetricsResponse {
  date: string
  period_type: string
  insights_generated: number
  insights_by_type: Record<string, number>
  insights_by_severity: Record<string, number>
  avg_processing_time_ms?: number
  avg_confidence_score?: number
  false_positive_rate?: number
  insights_viewed: number
  insights_acknowledged: number
  insights_resolved: number
  insights_dismissed: number
  avg_user_rating?: number
  total_feedback_count: number
  data_points_processed: number
  anomalies_detected: number
  notifications_sent: number
}

export interface RealtimeInsightUpdate {
  event_type: 'new_insight' | 'insight_updated' | 'insight_deleted' | 'metrics_updated'
  insight?: InsightResponse
  insight_id?: string
  anomaly?: AnomalyResponse
  metrics?: InsightMetricsResponse
  timestamp: string
}

// Component prop types
export interface InsightCardProps {
  insight: InsightResponse
  onAcknowledge?: (insightId: string) => void
  onResolve?: (insightId: string) => void
  onDismiss?: (insightId: string) => void
  onFeedback?: (insightId: string, feedback: InsightFeedbackCreate) => void
  onView?: (insightId: string) => void
  compact?: boolean
  showActions?: boolean
}

export interface InsightFiltersProps {
  filters: Partial<InsightSearchParams>
  onFiltersChange: (filters: Partial<InsightSearchParams>) => void
  onClear: () => void
  restaurantOptions?: Array<{ id: string; name: string }>
}

export interface InsightNotificationsProps {
  insights: InsightResponse[]
  onMarkAsRead?: (insightId: string) => void
  onDismiss?: (insightId: string) => void
  maxItems?: number
}

export interface RealtimeInsightsDashboardProps {
  userId?: string
  restaurantId?: string
  autoRefresh?: boolean
  refreshInterval?: number
  showFilters?: boolean
  showMetrics?: boolean
  compact?: boolean
}

export interface InsightFeedbackModalProps {
  insight: InsightResponse
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: InsightFeedbackCreate) => void
}

export interface InsightDetailsModalProps {
  insight: InsightResponse
  isOpen: boolean
  onClose: () => void
  onUpdate?: (insightId: string, updates: any) => void
}

// Hook return types
export interface UseRealtimeInsightsReturn {
  // State
  insights: InsightResponse[]
  isLoading: boolean
  error: string | null
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  metrics: InsightMetricsResponse | null

  // Actions
  fetchInsights: (params?: Partial<InsightSearchParams>) => Promise<InsightListResponse | null>
  getInsight: (insightId: string) => Promise<InsightResponse | undefined>
  updateInsight: (insightId: string, updates: any) => Promise<InsightResponse | undefined>
  submitFeedback: (insightId: string, feedback: InsightFeedbackCreate) => Promise<any>
  generateInsights: (request: InsightGenerationRequest) => Promise<any>
  getMetrics: (periodType?: string, daysBack?: number) => Promise<any>
  subscribeToRestaurant: (restaurantId: string) => void
  clearError: () => void
  disconnect: () => void

  // WebSocket
  sendMessage: (message: any) => void
}

// API response wrapper
export interface APIResponse<T> {
  data?: T
  error?: string
  status: number
  message?: string
}

// Utility types
export interface InsightSummary {
  total: number
  by_severity: Record<InsightSeverityEnum, number>
  by_type: Record<InsightTypeEnum, number>
  by_status: Record<InsightStatusEnum, number>
  avg_confidence: number
  avg_impact: number
}

export interface InsightTrend {
  date: string
  count: number
  avg_confidence: number
  avg_impact: number
}

export interface InsightNotification {
  id: string
  insight_id: string
  title: string
  message: string
  severity: InsightSeverityEnum
  timestamp: string
  read: boolean
}

// Chart data types for insights visualization
export interface InsightChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    [key: string]: any
  }>
}

export interface InsightChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter'
  title: string
  description?: string
  options: Record<string, any>
}

// Filter and sort options
export const INSIGHT_TYPE_OPTIONS = [
  { value: InsightTypeEnum.REVENUE_ANOMALY, label: 'Revenue Anomaly' },
  { value: InsightTypeEnum.CUSTOMER_PATTERN_CHANGE, label: 'Customer Pattern Change' },
  { value: InsightTypeEnum.MENU_PERFORMANCE, label: 'Menu Performance' },
  { value: InsightTypeEnum.SEASONAL_TREND, label: 'Seasonal Trend' },
  { value: InsightTypeEnum.LOCATION_COMPARISON, label: 'Location Comparison' },
  { value: InsightTypeEnum.OPERATIONAL_INSIGHT, label: 'Operational Insight' }
]

export const INSIGHT_SEVERITY_OPTIONS = [
  { value: InsightSeverityEnum.LOW, label: 'Low', color: '#10B981' },
  { value: InsightSeverityEnum.MEDIUM, label: 'Medium', color: '#F59E0B' },
  { value: InsightSeverityEnum.HIGH, label: 'High', color: '#EF4444' },
  { value: InsightSeverityEnum.CRITICAL, label: 'Critical', color: '#DC2626' }
]

export const INSIGHT_STATUS_OPTIONS = [
  { value: InsightStatusEnum.ACTIVE, label: 'Active', color: '#3B82F6' },
  { value: InsightStatusEnum.ACKNOWLEDGED, label: 'Acknowledged', color: '#F59E0B' },
  { value: InsightStatusEnum.RESOLVED, label: 'Resolved', color: '#10B981' },
  { value: InsightStatusEnum.DISMISSED, label: 'Dismissed', color: '#6B7280' }
]

export const SORT_OPTIONS = [
  { value: 'detected_at', label: 'Detection Date' },
  { value: 'confidence_score', label: 'Confidence Score' },
  { value: 'impact_score', label: 'Impact Score' },
  { value: 'urgency_score', label: 'Urgency Score' },
  { value: 'views_count', label: 'Views Count' }
]