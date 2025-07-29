/**
 * BiteBase Intelligence Reports System Types
 * Comprehensive type definitions for the reporting system
 */

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'analytics' | 'operations' | 'marketing' | 'financial'
  icon: string
  preview: string
  dataRequirements: string[]
  estimatedTime: string
  popularity: number
  tags: string[]
}

export interface CustomReport {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: Date
  lastModified: Date
  isPublic: boolean
  config: ReportConfig
  status: 'draft' | 'published' | 'archived'
}

export interface ReportConfig {
  dataSources: DataSource[]
  visualizations: Visualization[]
  filters: ReportFilter[]
  layout: LayoutConfig
  styling: StylingConfig
}

export interface DataSource {
  id: string
  type: 'analytics' | 'insights' | 'location' | 'external'
  endpoint: string
  parameters: Record<string, any>
  refreshInterval?: number
}

export interface Visualization {
  id: string
  type: 'chart' | 'table' | 'metric' | 'text' | 'image'
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap'
  dataSource: string
  config: Record<string, any>
  position: { x: number; y: number; width: number; height: number }
}

export interface ReportFilter {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in'
  value: any
  label: string
}

export interface LayoutConfig {
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margins: { top: number; right: number; bottom: number; left: number }
  columns: number
  spacing: number
}

export interface StylingConfig {
  theme: 'light' | 'dark' | 'brand'
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  fontSize: number
  showLogo: boolean
  showWatermark: boolean
}

export interface ScheduledReport {
  id: string
  reportId: string
  name: string
  schedule: ScheduleConfig
  recipients: string[]
  format: 'pdf' | 'excel' | 'powerpoint'
  isActive: boolean
  lastRun?: Date
  nextRun: Date
  createdBy: string
  createdAt: Date
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time: string // HH:MM format
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  timezone: string
}

export interface ReportExecution {
  id: string
  reportId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt: Date
  completedAt?: Date
  fileUrl?: string
  fileSize?: number
  error?: string
  requestedBy: string
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'powerpoint' | 'json'
  quality: 'low' | 'medium' | 'high'
  includeCharts: boolean
  includeData: boolean
  includeInsights: boolean
  watermark?: string
  password?: string
}

export interface ReportMetrics {
  totalReports: number
  reportsThisMonth: number
  scheduledReports: number
  averageGenerationTime: number
  popularTemplates: string[]
  exportFormats: Record<string, number>
}

export interface ReportShare {
  id: string
  reportId: string
  sharedBy: string
  sharedWith: string[]
  permissions: 'view' | 'edit' | 'admin'
  expiresAt?: Date
  shareUrl: string
  isPublic: boolean
}

// Hook return types
export interface UseReportsReturn {
  reports: CustomReport[]
  templates: ReportTemplate[]
  scheduledReports: ScheduledReport[]
  executions: ReportExecution[]
  metrics: ReportMetrics
  isLoading: boolean
  error: string | null
  createReport: (config: ReportConfig) => Promise<CustomReport>
  updateReport: (id: string, config: Partial<ReportConfig>) => Promise<void>
  deleteReport: (id: string) => Promise<void>
  generateReport: (id: string, options?: ExportOptions) => Promise<ReportExecution>
  scheduleReport: (reportId: string, schedule: ScheduleConfig) => Promise<ScheduledReport>
  shareReport: (reportId: string, options: Partial<ReportShare>) => Promise<ReportShare>
}

export interface UseReportExportReturn {
  isExporting: boolean
  progress: number
  error: string | null
  exportReport: (reportId: string, options: ExportOptions) => Promise<string>
  downloadReport: (executionId: string) => Promise<void>
  getExportStatus: (executionId: string) => Promise<ReportExecution>
}

// Component props
export interface ReportsPageProps {
  initialTab?: 'templates' | 'custom' | 'scheduled' | 'history'
}

export interface ReportTemplatesProps {
  templates: ReportTemplate[]
  onSelectTemplate: (template: ReportTemplate) => void
  isLoading?: boolean
}

export interface CustomReportBuilderProps {
  report?: CustomReport
  onSave: (config: ReportConfig) => void
  onCancel: () => void
}

export interface ScheduledReportsProps {
  scheduledReports: ScheduledReport[]
  onCreateSchedule: (reportId: string, schedule: ScheduleConfig) => void
  onUpdateSchedule: (id: string, schedule: ScheduleConfig) => void
  onDeleteSchedule: (id: string) => void
}

export interface ReportHistoryProps {
  executions: ReportExecution[]
  onDownload: (executionId: string) => void
  onRegenerate: (reportId: string) => void
  onDelete: (executionId: string) => void
}

export interface ReportPreviewProps {
  report: CustomReport
  data?: any
  isLoading?: boolean
}

export interface ExportOptionsProps {
  onExport: (options: ExportOptions) => void
  isExporting?: boolean
  progress?: number
}
