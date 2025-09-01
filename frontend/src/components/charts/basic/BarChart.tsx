'use client'

// Bar Chart Component - Basic Chart.js Bar Chart
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { forwardRef } from 'react'
import { BaseChart, ChartRef } from '../core/BaseChart'
import { BaseChartProps } from '../types/chartTypes'

// Bar Chart specific props
interface BarChartProps extends Omit<BaseChartProps, 'type'> {
  horizontal?: boolean
  stacked?: boolean
  grouped?: boolean
  barThickness?: number
  maxBarThickness?: number
  categoryPercentage?: number
  barPercentage?: number
}

// Bar Chart Component
export const BarChart = forwardRef<ChartRef, BarChartProps>(({
  horizontal = false,
  stacked = false,
  grouped = true,
  barThickness,
  maxBarThickness,
  categoryPercentage = 0.8,
  barPercentage = 0.9,
  data,
  options = {},
  ...props
}, ref) => {
  // Prepare bar chart specific data
  const barData = {
    ...data,
    datasets: data.datasets?.map((dataset: any) => ({
      ...dataset,
      barThickness: dataset.barThickness || barThickness,
      maxBarThickness: dataset.maxBarThickness || maxBarThickness,
      categoryPercentage: dataset.categoryPercentage || categoryPercentage,
      barPercentage: dataset.barPercentage || barPercentage,
      borderWidth: dataset.borderWidth || 1,
      borderRadius: dataset.borderRadius || 4,
      borderSkipped: dataset.borderSkipped || false
    }))
  }

  // Bar chart specific options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
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
            const label = (context.dataset as any)?.label || ''
            const value = horizontal ? (context.parsed as any)?.x : (context.parsed as any)?.y
            return `${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        stacked: stacked,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value: unknown) {
            return typeof value === 'number' ? value.toLocaleString() : value
          }
        }
      },
      y: {
        display: true,
        stacked: stacked,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value: unknown) {
            return typeof value === 'number' ? value.toLocaleString() : value
          }
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    ...options
  }

  return (
    <BaseChart
      ref={ref}
      type="bar"
      data={barData}
      options={barOptions as any}
      {...props}
    />
  )
})

BarChart.displayName = 'BarChart'

export default BarChart
