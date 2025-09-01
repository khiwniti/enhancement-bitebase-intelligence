'use client'

// Pie Chart Component - Basic Chart.js Pie Chart
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { forwardRef } from 'react'
import { BaseChart, ChartRef } from '../core/BaseChart'
import { BaseChartProps } from '../types/chartTypes'

// Pie Chart specific props
interface PieChartProps extends Omit<BaseChartProps, 'type'> {
  showLabels?: boolean
  showPercentages?: boolean
  showValues?: boolean
  cutout?: number
  rotation?: number
  circumference?: number
  borderWidth?: number
}

// Pie Chart Component
export const PieChart = forwardRef<ChartRef, PieChartProps>(({
  showLabels = true,
  showPercentages = true,
  showValues = false,
  cutout = 0,
  rotation = 0,
  circumference = 360,
  borderWidth = 2,
  data,
  options = {},
  ...props
}, ref) => {
  // Prepare pie chart specific data
  const pieData = {
    ...data,
    datasets: data.datasets?.map((dataset: any) => ({
      ...dataset,
      borderWidth: dataset.borderWidth || borderWidth,
      borderColor: dataset.borderColor || '#fff',
      hoverBorderWidth: dataset.hoverBorderWidth || borderWidth + 1,
      hoverBorderColor: dataset.hoverBorderColor || '#fff'
    }))
  }

  // Calculate total for percentage calculation
  const total = pieData.datasets?.[0]?.data?.reduce((sum: number, value: number) => sum + value, 0) || 0

  // Pie chart specific options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: cutout,
    rotation: rotation,
    circumference: circumference,
    plugins: {
      legend: {
        display: showLabels,
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#9ca3af',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          title: (context: Record<string, unknown>[]) => {
            return context[0]?.label || ''
          },
          label: (context: Record<string, unknown>) => {
            const label = context.label || ''
            const value = Number(context.parsed) || 0
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            
            if (showPercentages && showValues) {
              return `${label}: ${value.toLocaleString()} (${percentage}%)`
            } else if (showPercentages) {
              return `${label}: ${percentage}%`
            } else {
              return `${label}: ${value.toLocaleString()}`
            }
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: false,
      duration: 750,
      easing: 'easeInOutQuart'
    },
    elements: {
      arc: {
        borderWidth: borderWidth,
        borderColor: '#fff'
      }
    },
    ...options
  }

  return (
    <BaseChart
      ref={ref}
      type="pie"
      data={pieData}
      options={pieOptions as any}
      {...props}
    />
  )
})

PieChart.displayName = 'PieChart'

export default PieChart
