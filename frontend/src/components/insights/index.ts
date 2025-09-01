/**
 * BiteBase Intelligence Insights Components
 * Export all insights-related components and hooks
 */

export { default as RealtimeInsightsDashboard } from './RealtimeInsightsDashboard'
export { default as InsightCard } from './components/InsightCard'
export { default as useRealtimeInsights } from './hooks/useRealtimeInsights'

// Export types
export type {
  InsightResponse,
  InsightListResponse,
  InsightSearchParams,
  InsightFeedbackCreate,
  InsightGenerationRequest,
  RealtimeInsightUpdate,
  InsightCardProps,
  RealtimeInsightsDashboardProps,
  UseRealtimeInsightsReturn,
  InsightTypeEnum,
  InsightSeverityEnum,
  InsightStatusEnum,
  AnomalyResponse,
  AnomalyTypeEnum
} from './types/insightsTypes'

// Export constants
export {
  INSIGHT_TYPE_OPTIONS,
  INSIGHT_SEVERITY_OPTIONS,
  INSIGHT_STATUS_OPTIONS,
  SORT_OPTIONS
} from './types/insightsTypes'