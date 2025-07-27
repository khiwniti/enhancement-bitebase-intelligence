// Dashboard Module Exports
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

// Main Components
export { default as EnhancedDashboardBuilder } from './EnhancedDashboardBuilder'
export { WidgetPalette } from './components/WidgetPalette'
export { GridLayout } from './components/GridLayout'
export { WidgetConfigPanel } from './components/WidgetConfigPanel'
export { DashboardToolbar, CompactDashboardToolbar } from './components/DashboardToolbar'

// Hooks
export { useDashboardBuilder } from './hooks/useDashboardBuilder'
export { useDashboardHistory, useHistoryKeyboardShortcuts } from './hooks/useDashboardHistory'
export { useDashboardAutoSave, useAutoSaveStatus } from './hooks/useDashboardAutoSave'

// Types
export * from './types/dashboardTypes'

// Chart Definitions
export { CHART_DEFINITIONS, CHART_CATEGORIES } from './components/WidgetPalette'

// Styles
export { gridLayoutStyles } from './components/GridLayout'