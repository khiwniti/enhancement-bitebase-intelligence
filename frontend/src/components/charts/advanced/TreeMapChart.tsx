'use client'

// TreeMap Chart Component - Advanced hierarchical data visualization
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { forwardRef, useMemo } from 'react'
import { BaseChart, ChartRef } from '../core/BaseChart'
import { BaseChartProps, TreeMapData } from '../types/chartTypes'

// TreeMap Chart specific props
interface TreeMapChartProps extends Omit<BaseChartProps, 'type' | 'data'> {
  data: {
    datasets: Array<{
      label?: string
      tree: TreeMapData[]
      key?: string
      groups?: string[]
      spacing?: number
      borderWidth?: number
      borderColor?: string
      backgroundColor?: string | string[]
      hoverBackgroundColor?: string | string[]
    }>
  }
  colorScheme?: 'sequential' | 'categorical' | 'diverging'
  showLabels?: boolean
  labelPosition?: 'center' | 'top' | 'bottom'
  groupSpacing?: number
  borderRadius?: number
}

// TreeMap Chart Component
export const TreeMapChart = forwardRef<ChartRef, TreeMapChartProps>(({
  data,
  colorScheme = 'categorical',
  showLabels = true,
  labelPosition = 'center',
  groupSpacing = 2,
  borderRadius = 0,
  options = {},
  ...props
}, ref) => {
  // Transform data for TreeMap
  const treeMapData = useMemo(() => {
    return {
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        tree: dataset.tree,
        key: dataset.key || 'value',
        groups: dataset.groups || ['label'],
        spacing: dataset.spacing || groupSpacing,
        borderWidth: dataset.borderWidth || 1,
        borderColor: dataset.borderColor || '#334155',
        backgroundColor: dataset.backgroundColor || generateTreeMapColors(dataset.tree, colorScheme),
        hoverBackgroundColor: dataset.hoverBackgroundColor || dataset.backgroundColor,
        borderRadius: borderRadius,
        captions: {
          align: labelPosition,
          display: showLabels,
          color: '#f8fafc',
          font: {
            size: 12,
            weight: 'normal'
          },
          formatter: (ctx: Record<string, unknown>) => {
            const data = ctx.parsed._data
            return showLabels ? `${data.label}\n${data.value?.toLocaleString() || ''}` : ''
          }
        }
      }))
    }
  }, [data, colorScheme, showLabels, labelPosition, groupSpacing, borderRadius])

  // TreeMap specific options
  const treeMapOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // TreeMaps typically don't need legends
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: (context: Record<string, unknown>[]) => {
            const data = context[0]?.parsed?._data
            return data?.label || ''
          },
          label: (context: Record<string, unknown>) => {
            const data = context.parsed._data
            const value = data.value
            const percentage = data.percentage
            
            const lines = []
            if (value !== undefined) {
              lines.push(`Value: ${typeof value === 'number' ? value.toLocaleString() : value}`)
            }
            if (percentage !== undefined) {
              lines.push(`Percentage: ${percentage.toFixed(1)}%`)
            }
            if (data.children && data.children.length > 0) {
              lines.push(`Children: ${data.children.length}`)
            }
            
            return lines
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    interaction: {
      intersect: true,
      mode: 'point'
    },
    onHover: (event: Record<string, unknown>, elements: Record<string, unknown>[]) => {
      const canvas = event.native?.target
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default'
      }
    },
    ...options
  }

  return (
    <BaseChart
      ref={ref}
      type="treemap"
      data={treeMapData}
      options={treeMapOptions}
      {...props}
    />
  )
})

// Generate colors for TreeMap based on color scheme
function generateTreeMapColors(tree: TreeMapData[], scheme: string): string[] {
  const colors: string[] = []
  
  const colorSchemes = {
    sequential: [
      '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8',
      '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'
    ],
    categorical: [
      '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ],
    diverging: [
      '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2',
      '#f3f4f6', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6'
    ]
  }
  
  const palette = colorSchemes[scheme as keyof typeof colorSchemes] || colorSchemes.categorical
  
  function assignColors(nodes: TreeMapData[], depth = 0) {
    nodes.forEach((node, index) => {
      const colorIndex = (depth * 3 + index) % palette.length
      colors.push(palette[colorIndex])
      
      if (node.children && node.children.length > 0) {
        assignColors(node.children, depth + 1)
      }
    })
  }
  
  assignColors(tree)
  return colors
}

// Calculate TreeMap layout (simplified version)
// Currently unused but kept for future implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateTreeMapLayout(data: TreeMapData[], width: number, height: number) {
  // This would implement a proper treemap algorithm like squarified treemap
  // For now, this is a placeholder that would be replaced with actual implementation
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentX = 0
  const currentY = 0
  
  return data.map(item => {
    const itemWidth = (item.value / total) * width
    const itemHeight = height
    
    const rect = {
      x: currentX,
      y: currentY,
      width: itemWidth,
      height: itemHeight,
      data: item
    }
    
    currentX += itemWidth
    return rect
  })
}

TreeMapChart.displayName = 'TreeMapChart'

export default TreeMapChart