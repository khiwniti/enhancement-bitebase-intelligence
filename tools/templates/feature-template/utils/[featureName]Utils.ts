import type { [FeatureName]Data, [FeatureName]Filters } from '../types'

/**
 * Utility functions for [FeatureName] feature
 * 
 * This module provides common utility functions for data processing,
 * validation, formatting, and other feature-specific operations.
 */

/**
 * Format [FeatureName] data for display
 */
export function format[FeatureName]Data(data: [FeatureName]Data): [FeatureName]Data {
  return {
    ...data,
    title: data.title || data.name || 'Untitled',
    description: data.description || '',
    value: formatValue(data.value),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  }
}

/**
 * Validate [FeatureName] data
 */
export function validate[FeatureName]Data(data: Partial<[FeatureName]Data>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.title && !data.name) {
    errors.push('Title or name is required')
  }

  if (data.status && !['active', 'inactive', 'pending', 'archived'].includes(data.status)) {
    errors.push('Invalid status value')
  }

  if (data.value && typeof data.value === 'number' && data.value < 0) {
    errors.push('Value cannot be negative')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Filter [FeatureName] data based on filters
 */
export function filter[FeatureName]Data(
  data: [FeatureName]Data[],
  filters: [FeatureName]Filters
): [FeatureName]Data[] {
  let filtered = [...data]

  // Status filter
  if (filters.status) {
    filtered = filtered.filter(item => item.status === filters.status)
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(item => item.category === filters.category)
  }

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(item =>
      (item.title || item.name || '').toLowerCase().includes(searchTerm) ||
      (item.description || '').toLowerCase().includes(searchTerm)
    )
  }

  // Date range filter
  if (filters.dateRange?.start) {
    filtered = filtered.filter(item => item.createdAt >= filters.dateRange!.start!)
  }

  if (filters.dateRange?.end) {
    filtered = filtered.filter(item => item.createdAt <= filters.dateRange!.end!)
  }

  return filtered
}

/**
 * Sort [FeatureName] data
 */
export function sort[FeatureName]Data(
  data: [FeatureName]Data[],
  sortBy: string,
  direction: 'asc' | 'desc' = 'asc'
): [FeatureName]Data[] {
  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortBy)
    const bValue = getNestedValue(b, sortBy)

    if (aValue === bValue) return 0

    const comparison = aValue < bValue ? -1 : 1
    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Group [FeatureName] data by a field
 */
export function group[FeatureName]Data(
  data: [FeatureName]Data[],
  groupBy: keyof [FeatureName]Data
): Record<string, [FeatureName]Data[]> {
  return data.reduce((groups, item) => {
    const key = String(item[groupBy] || 'unknown')
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<string, [FeatureName]Data[]>)
}

/**
 * Calculate statistics for [FeatureName] data
 */
export function calculate[FeatureName]Stats(data: [FeatureName]Data[]) {
  const total = data.length
  const activeCount = data.filter(item => item.status === 'active').length
  const inactiveCount = data.filter(item => item.status === 'inactive').length
  
  const values = data
    .map(item => typeof item.value === 'number' ? item.value : 0)
    .filter(value => value > 0)

  const totalValue = values.reduce((sum, value) => sum + value, 0)
  const averageValue = values.length > 0 ? totalValue / values.length : 0
  const maxValue = values.length > 0 ? Math.max(...values) : 0
  const minValue = values.length > 0 ? Math.min(...values) : 0

  return {
    total,
    activeCount,
    inactiveCount,
    activePercentage: total > 0 ? (activeCount / total) * 100 : 0,
    totalValue,
    averageValue,
    maxValue,
    minValue,
    categories: Object.keys(group[FeatureName]Data(data, 'category')),
  }
}

/**
 * Export [FeatureName] data to various formats
 */
export function export[FeatureName]Data(
  data: [FeatureName]Data[],
  format: 'csv' | 'json' | 'xlsx' = 'csv'
): string | Blob {
  switch (format) {
    case 'csv':
      return exportToCSV(data)
    case 'json':
      return JSON.stringify(data, null, 2)
    case 'xlsx':
      return exportToXLSX(data)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Generate unique ID for [FeatureName] items
 */
export function generateId(): string {
  return `[featureName]_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

/**
 * Debounce function for search/filter operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Helper functions

function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return String(value || '')
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function exportToCSV(data: [FeatureName]Data[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(item =>
    Object.values(item)
      .map(value => `"${String(value).replace(/"/g, '""')}"`)
      .join(',')
  )

  return [headers, ...rows].join('\n')
}

function exportToXLSX(data: [FeatureName]Data[]): Blob {
  // This would require a library like xlsx or exceljs
  // For now, return CSV as blob
  const csv = exportToCSV(data)
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}