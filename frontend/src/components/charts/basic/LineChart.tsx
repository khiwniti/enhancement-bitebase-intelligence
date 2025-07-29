'use client'

// Line Chart Component - Basic Chart.js Line Chart
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { forwardRef } from 'react'
import { BaseChart, ChartRef } from '../core/BaseChart'
import { BaseChartProps } from '../types/chartTypes'

// Line Chart specific props
interface LineChartProps extends Omit<BaseChartProps, 'type'> {
  smooth?: boolean
  showPoints?: boolean
  fill?: boolean
  tension?: number
  stepped?: boolean | 'before' | 'after' | 'middle'
}

// Line Chart Component
export const LineChart = forwardRef<ChartRef, LineChartProps>(({
  smooth = true,
  showPoints = true,
  fill = false,
  tension = 0.4,
  stepped = false,
  data,
  options = {},
  ...props
}, ref) => {
  // Prepare line chart specific data
  const lineData = {
    ...data,
    datasets: data.datasets?.map((dataset: any) => ({
      ...dataset,
      tension: smooth ? tension : 0,
      pointRadius: showPoints ? (dataset.pointRadius || 4) : 0,
      pointHoverRadius: showPoints ? (dataset.pointHoverRadius || 6) : 0,
      fill: dataset.fill !== undefined ? dataset.fill : fill,
      stepped: dataset.stepped !== undefined ? dataset.stepped : stepped,
      borderWidth: dataset.borderWidth || 2,
      pointBackgroundColor: dataset.pointBackgroundColor || dataset.borderColor,
      pointBorderColor: dataset.pointBorderColor || dataset.borderColor,
      pointBorderWidth: dataset.pointBorderWidth || 2
    }))
  }

  // Line chart specific options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
            const value = (context.parsed as any)?.y
            return `${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        display: true,
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
    elements: {
      line: {
        tension: smooth ? tension : 0
      },
      point: {
        radius: showPoints ? 4 : 0,
        hoverRadius: showPoints ? 6 : 0
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
      type="line"
      data={lineData}
      options={lineOptions as any}
      {...props}
    />
  )
})

LineChart.displayName = 'LineChart'

export default LineChart