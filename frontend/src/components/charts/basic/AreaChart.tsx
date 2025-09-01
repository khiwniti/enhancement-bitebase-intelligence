'use client'

// Area Chart Component - Basic Chart.js Area Chart (Line with fill)
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { forwardRef } from 'react'
import { BaseChart, ChartRef } from '../core/BaseChart'
import { BaseChartProps } from '../types/chartTypes'

// Area Chart specific props
interface AreaChartProps extends Omit<BaseChartProps, 'type'> {
  smooth?: boolean
  showPoints?: boolean
  tension?: number
  stepped?: boolean | 'before' | 'after' | 'middle'
  stacked?: boolean
  fillOpacity?: number
}

// Area Chart Component
export const AreaChart = forwardRef<ChartRef, AreaChartProps>(({
  smooth = true,
  showPoints = false,
  tension = 0.4,
  stepped = false,
  stacked = false,
  fillOpacity = 0.3,
  data,
  options = {},
  ...props
}, ref) => {
  // Prepare area chart specific data
  const areaData = {
    ...data,
    datasets: data.datasets?.map((dataset: any, index: number) => ({
      ...dataset,
      fill: dataset.fill !== undefined ? dataset.fill : (stacked ? (index === 0 ? 'origin' : '-1') : 'origin'),
      tension: smooth ? tension : 0,
      pointRadius: showPoints ? (dataset.pointRadius || 3) : 0,
      pointHoverRadius: showPoints ? (dataset.pointHoverRadius || 5) : 0,
      stepped: dataset.stepped !== undefined ? dataset.stepped : stepped,
      borderWidth: dataset.borderWidth || 2,
      pointBackgroundColor: dataset.pointBackgroundColor || dataset.borderColor,
      pointBorderColor: dataset.pointBorderColor || dataset.borderColor,
      pointBorderWidth: dataset.pointBorderWidth || 2,
      backgroundColor: dataset.backgroundColor || 
        (typeof dataset.borderColor === 'string' 
          ? dataset.borderColor.replace('rgb', 'rgba').replace(')', `, ${fillOpacity})`)
          : `rgba(59, 130, 246, ${fillOpacity})`
        )
    }))
  }

  // Area chart specific options
  const areaOptions = {
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
      },
      filler: {
        propagate: false
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
          color: '#9ca3af'
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
    elements: {
      line: {
        tension: smooth ? tension : 0
      },
      point: {
        radius: showPoints ? 3 : 0,
        hoverRadius: showPoints ? 5 : 0
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
      data={areaData}
      options={areaOptions as any}
      {...props}
    />
  )
})

AreaChart.displayName = 'AreaChart'

export default AreaChart
