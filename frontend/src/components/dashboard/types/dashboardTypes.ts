// Dashboard Builder Types and Interfaces
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

import { ChartType, BaseChartProps } from '@/components/charts/types/chartTypes'
import { ReactNode } from 'react'

// Grid Layout Types
export interface GridPosition {
  x: number
  y: number
  w: number
  h: number
}

export interface ResponsiveBreakpoints {
  sm: number  // 640px
  md: number  // 768px
  lg: number  // 1024px
  xl: number  // 1280px
}

export interface GridLayoutConfig {
  breakpoints: ResponsiveBreakpoints
  cols: Record<keyof ResponsiveBreakpoints, number>
  rowHeight: number
  margin: [number, number]
  containerPadding: [number, number]
  isDraggable: boolean
  isResizable: boolean
  useCSSTransforms: boolean
}

// Widget Types
export interface DashboardWidget {
  id: string
  type: 'chart' | 'text' | 'image' | 'metric' | 'table' | 'custom'
  chartType?: ChartType
  title: string
  description?: string
  position: GridPosition
  config: WidgetConfig
  data?: any
  createdAt: Date
  updatedAt: Date
  version: number
}

export interface WidgetConfig {
  // Chart-specific configuration
  chartProps?: Partial<BaseChartProps>
  
  // Visual configuration
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  padding?: number
  
  // Data configuration
  dataSource?: string
  refreshInterval?: number
  
  // Interaction configuration
  clickable?: boolean
  hoverable?: boolean
  
  // Export configuration
  exportable?: boolean
  
  // Custom properties
  customProps?: Record<string, any>
}

// Dashboard Types
export interface Dashboard {
  id: string
  name: string
  description?: string
  widgets: DashboardWidget[]
  layout: GridLayoutConfig
  theme: DashboardTheme
  settings: DashboardSettings
  createdAt: Date
  updatedAt: Date
  version: number
  isPublic: boolean
  tags: string[]
  author: string
}

export interface DashboardTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    accent: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
  }
}

export interface DashboardSettings {
  autoSave: boolean
  autoSaveInterval: number // in milliseconds
  enableRealTime: boolean
  enableAnimations: boolean
  enableTooltips: boolean
  enableExport: boolean
  enableSharing: boolean
  maxHistorySteps: number
  performanceMode: 'high' | 'balanced' | 'low'
  accessibility: {
    enableKeyboardNavigation: boolean
    enableScreenReader: boolean
    highContrast: boolean
    reducedMotion: boolean
  }
}

// History and Undo/Redo Types
export interface DashboardHistoryState {
  dashboard: Dashboard
  timestamp: Date
  action: DashboardAction
  description: string
}

export interface DashboardAction {
  type: 'ADD_WIDGET' | 'REMOVE_WIDGET' | 'UPDATE_WIDGET' | 'MOVE_WIDGET' | 
        'RESIZE_WIDGET' | 'UPDATE_DASHBOARD' | 'IMPORT_DASHBOARD' | 'CLEAR_DASHBOARD'
  payload: any
  widgetId?: string
}

// Drag and Drop Types
export interface DragItem {
  id: string
  type: 'widget' | 'chart-type'
  chartType?: ChartType
  widget?: DashboardWidget
  sourceIndex?: number
}

export interface DropResult {
  dragId: string
  dropId: string
  position: GridPosition
  action: 'move' | 'copy' | 'create'
}

// Widget Palette Types
export interface WidgetPaletteItem {
  id: string
  type: ChartType
  name: string
  description: string
  icon: ReactNode
  category: 'basic' | 'advanced' | 'custom'
  tags: string[]
  previewImage?: string
  defaultConfig: Partial<WidgetConfig>
  isAdvanced: boolean
  performanceWeight: number
}

export interface WidgetCategory {
  id: string
  name: string
  description: string
  icon: ReactNode
  items: WidgetPaletteItem[]
  collapsed: boolean
}

// Dashboard Builder State Types
export interface DashboardBuilderState {
  dashboard: Dashboard
  selectedWidget: string | null
  draggedWidget: DragItem | null
  isEditing: boolean
  isPreviewMode: boolean
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  zoom: number
  history: DashboardHistoryState[]
  historyIndex: number
  isDirty: boolean
  lastSaved: Date | null
  isLoading: boolean
  error: string | null
}

// API Types
export interface DashboardAPI {
  getDashboard: (id: string) => Promise<Dashboard>
  saveDashboard: (dashboard: Dashboard) => Promise<Dashboard>
  deleteDashboard: (id: string) => Promise<void>
  duplicateDashboard: (id: string, name: string) => Promise<Dashboard>
  exportDashboard: (id: string, format: 'json' | 'pdf' | 'png') => Promise<Blob>
  importDashboard: (file: File) => Promise<Dashboard>
  shareDashboard: (id: string, settings: ShareSettings) => Promise<ShareResult>
}

export interface ShareSettings {
  isPublic: boolean
  allowEdit: boolean
  allowComment: boolean
  expiresAt?: Date
  password?: string
}

export interface ShareResult {
  shareUrl: string
  shareId: string
  qrCode?: string
}

// Event Types
export interface DashboardEvent {
  type: string
  payload: any
  timestamp: Date
  source: 'user' | 'system' | 'api'
}

export interface WidgetEvent extends DashboardEvent {
  widgetId: string
}

// Performance Types
export interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  dataSize: number
  widgetCount: number
  lastUpdate: Date
}

// Export Types
export interface ExportOptions {
  format: 'json' | 'pdf' | 'png' | 'svg'
  quality?: number
  width?: number
  height?: number
  includeData?: boolean
  includeConfig?: boolean
  backgroundColor?: string
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

// Default Configurations
export const DEFAULT_GRID_CONFIG: GridLayoutConfig = {
  breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280 },
  cols: { sm: 2, md: 4, lg: 6, xl: 8 },
  rowHeight: 100,
  margin: [16, 16],
  containerPadding: [16, 16],
  isDraggable: true,
  isResizable: true,
  useCSSTransforms: true
}

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  enableRealTime: true,
  enableAnimations: true,
  enableTooltips: true,
  enableExport: true,
  enableSharing: true,
  maxHistorySteps: 50,
  performanceMode: 'balanced',
  accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    highContrast: false,
    reducedMotion: false
  }
}

export const DEFAULT_DASHBOARD_THEME: DashboardTheme = {
  name: 'Default',
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    background: 'hsl(var(--background))',
    surface: 'hsl(var(--card))',
    text: 'hsl(var(--foreground))',
    textSecondary: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))',
    accent: 'hsl(var(--accent))'
  },
  typography: {
    fontFamily: 'var(--font-sans)',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12
  }
}