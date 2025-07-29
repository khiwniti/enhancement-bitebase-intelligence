'use client'

// Doughnut Chart Component - Basic Chart.js Doughnut Chart
// BiteBase Intelligence 2.0 - Advanced Chart Library

import React, { forwardRef } from 'react'
import { BaseChart, ChartRef } from '../core/BaseChart'
import { BaseChartProps } from '../types/chartTypes'

// Doughnut Chart specific props
interface DoughnutChartProps extends Omit<BaseChartProps, 'type'> {
  showLabels?: boolean
  showPercentages?: boolean
  showValues?: boolean
  cutout?: number | string
  rotation?: number
  circumference?: number
  borderWidth?: number
  centerText?: string
  centerValue?: string | number
}

// Doughnut Chart Component
export const DoughnutChart = forwardRef<ChartRef, DoughnutChartProps>(({
  showLabels = true,
  showPercentages = true,
  showValues = false,
  cutout = '60%',
  rotation = 0,
  circumference = 360,
  borderWidth = 2,
  centerText,
  centerValue,
  data,
  options = {},
  ...props
}, ref) => {
  // Prepare doughnut chart specific data
  const doughnutData = {
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
  const total = doughnutData.datasets?.[0]?.data?.reduce((sum: number, value: number) => sum + value, 0) || 0

  // Center text plugin
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart: any) => {
      if (!centerText && !centerValue) return

      const { ctx, chartArea: { top, bottom, left, right } } = chart
      const centerX = (left + right) / 2
      const centerY = (top + bottom) / 2

      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (centerText) {
        ctx.font = 'bold 14px Inter'
        ctx.fillStyle = '#6b7280'
        ctx.fillText(centerText, centerX, centerY - 10)
      }

      if (centerValue) {
        ctx.font = 'bold 24px Inter'
        ctx.fillStyle = '#111827'
        ctx.fillText(centerValue.toString(), centerX, centerY + (centerText ? 15 : 0))
      }

      ctx.restore()
    }
  }

  // Doughnut chart specific options
  const doughnutOptions = {
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
      type="doughnut"
      data={doughnutData}
      options={doughnutOptions as any}
      {...props}
    />
  )
})

DoughnutChart.displayName = 'DoughnutChart'

export default DoughnutChart
