// Core application types

// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  permissions: Permission[]
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer'

export interface Permission {
  resource: string
  actions: string[]
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationSettings
  dashboard: DashboardPreferences
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  insights: boolean
  reports: boolean
  alerts: boolean
}

export interface DashboardPreferences {
  defaultView: string
  autoRefresh: boolean
  refreshInterval: number
  compactMode: boolean
}

// Authentication Types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignupData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: UserRole
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
}

// Dashboard Types
export interface Dashboard {
  id: string
  name: string
  description?: string
  layout: DashboardLayout
  widgets: Widget[]
  filters: DashboardFilter[]
  isPublic: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface DashboardLayout {
  columns: number
  rows: number
  gap: number
}

export interface Widget {
  id: string
  type: WidgetType
  title: string
  description?: string
  position: WidgetPosition
  size: WidgetSize
  config: WidgetConfig
  data?: any
}

export type WidgetType = 
  | 'metric' 
  | 'chart' 
  | 'table' 
  | 'map' 
  | 'text' 
  | 'image' 
  | 'iframe'

export interface WidgetPosition {
  x: number
  y: number
}

export interface WidgetSize {
  width: number
  height: number
}

export interface WidgetConfig {
  [key: string]: any
}

export interface DashboardFilter {
  id: string
  name: string
  type: FilterType
  field: string
  value: any
  operator: FilterOperator
}

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'multiselect'
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between'

// Analytics Types
export interface Metric {
  id: string
  name: string
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'stable'
  format: MetricFormat
  unit?: string
}

export type MetricFormat = 'number' | 'currency' | 'percentage' | 'duration'

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
}

export interface ChartConfig {
  type: ChartType
  options: ChartOptions
}

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter'

export interface ChartOptions {
  responsive: boolean
  maintainAspectRatio: boolean
  plugins?: {
    legend?: {
      display: boolean
      position?: 'top' | 'bottom' | 'left' | 'right'
    }
    tooltip?: {
      enabled: boolean
    }
  }
  scales?: {
    x?: {
      display: boolean
      title?: {
        display: boolean
        text: string
      }
    }
    y?: {
      display: boolean
      title?: {
        display: boolean
        text: string
      }
    }
  }
}

// Insights Types
export interface Insight {
  id: string
  title: string
  description: string
  type: InsightType
  severity: InsightSeverity
  confidence: number
  category: string
  tags: string[]
  data: any
  recommendations: Recommendation[]
  createdAt: string
  updatedAt: string
  status: InsightStatus
}

export type InsightType = 
  | 'anomaly' 
  | 'trend' 
  | 'correlation' 
  | 'prediction' 
  | 'opportunity' 
  | 'risk'

export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical'
export type InsightStatus = 'new' | 'viewed' | 'acknowledged' | 'resolved' | 'dismissed'

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  impact: string
  effort: string
  actions: RecommendationAction[]
}

export interface RecommendationAction {
  id: string
  title: string
  description: string
  type: 'manual' | 'automated'
  url?: string
}

// Query Types
export interface QueryRequest {
  query: string
  context?: QueryContext
  filters?: Record<string, any>
  limit?: number
  offset?: number
}

export interface QueryContext {
  userId: string
  dashboardId?: string
  timeRange?: TimeRange
  filters?: DashboardFilter[]
}

export interface QueryResponse {
  id: string
  query: string
  results: QueryResult[]
  suggestions: string[]
  confidence: number
  executionTime: number
  createdAt: string
}

export interface QueryResult {
  type: 'chart' | 'table' | 'metric' | 'text'
  title: string
  description?: string
  data: any
  config?: any
}

// Time Range Types
export interface TimeRange {
  start: string
  end: string
  preset?: TimeRangePreset
}

export type TimeRangePreset = 
  | 'today' 
  | 'yesterday' 
  | 'last7days' 
  | 'last30days' 
  | 'last90days' 
  | 'thisMonth' 
  | 'lastMonth' 
  | 'thisQuarter' 
  | 'lastQuarter' 
  | 'thisYear' 
  | 'lastYear'

// Location Types
export interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  coordinates: {
    lat: number
    lng: number
  }
  timezone: string
}

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  read: boolean
  actionUrl?: string
  actionLabel?: string
  createdAt: string
  expiresAt?: string
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'insight'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

// Form Types
export interface FormField {
  name: string
  label: string
  type: FormFieldType
  required?: boolean
  placeholder?: string
  options?: FormFieldOption[]
  validation?: FormFieldValidation
}

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'date' 
  | 'datetime'

export interface FormFieldOption {
  label: string
  value: string | number
}

export interface FormFieldValidation {
  min?: number
  max?: number
  pattern?: string
  message?: string
}

// Utility Types
export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  query: string
  filters?: Record<string, any>
  pagination?: PaginationParams
}
