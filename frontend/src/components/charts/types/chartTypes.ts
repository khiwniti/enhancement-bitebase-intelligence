// Chart Types and Interfaces
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React from 'react'
import type { ChartConfiguration, ChartData, ChartOptions, Chart as ChartJS } from 'chart.js'

// Base Chart Types
export type ChartType = 
  // Basic Chart.js Types
  | 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'bubble' 
  | 'radar' | 'polarArea'
  // Advanced Custom Types
  | 'treemap' | 'sankey' | 'gantt' | 'heatmap' | 'network' | 'funnel' 
  | 'waterfall' | 'boxplot' | 'violin' | 'sunburst' | 'chord' 
  | 'timeline' | 'candlestick' | 'stackedBar' | 'groupedBar'

// Chart Size and Layout
export interface ChartDimensions {
  width?: number
  height?: number
  aspectRatio?: number
  maintainAspectRatio?: boolean
  responsive?: boolean
}

// Chart Theme Configuration
export interface ChartTheme {
  colors: {
    primary: string[]
    secondary: string[]
    background: string
    text: string
    grid: string
    border: string
  }
  fonts: {
    family: string
    size: {
      title: number
      label: number
      legend: number
      tooltip: number
    }
  }
  spacing: {
    padding: number
    margin: number
  }
}

// Performance Configuration
export interface ChartPerformanceConfig {
  enableLazyLoading: boolean
  enableVirtualization: boolean
  maxDataPoints: number
  animationDuration: number
  enableWebGL: boolean
  cacheStrategy: 'memory' | 'localStorage' | 'none'
}

// Accessibility Configuration
export interface ChartAccessibilityConfig {
  enableKeyboardNavigation: boolean
  enableScreenReader: boolean
  ariaLabel?: string
  ariaDescription?: string
  colorBlindFriendly: boolean
  highContrast: boolean
}

// Base Chart Props
export interface BaseChartProps {
  id: string
  type: ChartType
  data: ChartData
  options?: ChartOptions
  dimensions?: ChartDimensions
  theme?: Partial<ChartTheme>
  performance?: Partial<ChartPerformanceConfig>
  accessibility?: Partial<ChartAccessibilityConfig>
  className?: string
  style?: React.CSSProperties
  onChartReady?: (chart: ChartJS) => void
  onDataClick?: (event: any, elements: any[]) => void
  onHover?: (event: any, elements: any[]) => void
  onResize?: (chart: ChartJS, size: { width: number; height: number }) => void
  children?: React.ReactNode
}

// Advanced Chart Data Structures
export interface TreeMapData {
  label: string
  value: number
  color?: string
  children?: TreeMapData[]
}

export interface SankeyData {
  nodes: Array<{
    id: string
    label: string
    color?: string
  }>
  links: Array<{
    source: string
    target: string
    value: number
    color?: string
  }>
}

export interface GanttData {
  tasks: Array<{
    id: string
    name: string
    start: Date
    end: Date
    progress?: number
    dependencies?: string[]
    color?: string
    group?: string
  }>
}

export interface HeatmapData {
  x: string | number
  y: string | number
  value: number
  color?: string
}

export interface NetworkData {
  nodes: Array<{
    id: string
    label: string
    size?: number
    color?: string
    group?: string
  }>
  edges: Array<{
    source: string
    target: string
    weight?: number
    color?: string
    label?: string
  }>
}

export interface TimelineData {
  events: Array<{
    id: string
    title: string
    start: Date
    end?: Date
    description?: string
    color?: string
    group?: string
  }>
}

// Chart Registry Types
export interface ChartRegistryEntry {
  type: ChartType
  component: React.ComponentType<any> | null
  isAdvanced: boolean
  dependencies?: string[]
  performanceWeight: number
}

// Chart Instance Management
export interface ChartInstance {
  id: string
  type: ChartType
  chart: ChartJS | null
  container: HTMLElement | null
  isVisible: boolean
  lastUpdate: Date
  performanceMetrics: {
    renderTime: number
    dataSize: number
    memoryUsage: number
  }
}

// Chart Configuration Presets
export interface ChartPreset {
  name: string
  type: ChartType
  options: ChartOptions
  theme: Partial<ChartTheme>
  description: string
}

// Export Configuration
export interface ChartExportConfig {
  format: 'png' | 'jpg' | 'svg' | 'pdf'
  quality?: number
  width?: number
  height?: number
  backgroundColor?: string
  includeData?: boolean
}

// Animation Configuration
export interface ChartAnimationConfig {
  duration: number
  easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  delay?: number
  loop?: boolean
  onComplete?: () => void
  onProgress?: (progress: number) => void
}

// Real-time Update Configuration
export interface ChartRealTimeConfig {
  enabled: boolean
  updateInterval: number
  maxDataPoints: number
  smoothTransitions: boolean
  bufferSize: number
}