'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: 'up' | 'down' | 'neutral'
    period?: string
  }
  icon?: React.ComponentType<any>
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'
  description?: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  onClick?: () => void
  loading?: boolean
  className?: string
}

const colorVariants = {
  blue: {
    bg: 'from-blue-500 to-cyan-500',
    text: 'text-blue-600',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200'
  },
  green: {
    bg: 'from-green-500 to-emerald-500',
    text: 'text-green-600',
    bgLight: 'bg-green-50',
    border: 'border-green-200'
  },
  orange: {
    bg: 'from-orange-500 to-red-500',
    text: 'text-orange-600',
    bgLight: 'bg-orange-50',
    border: 'border-orange-200'
  },
  red: {
    bg: 'from-red-500 to-pink-500',
    text: 'text-red-600',
    bgLight: 'bg-red-50',
    border: 'border-red-200'
  },
  purple: {
    bg: 'from-purple-500 to-pink-500',
    text: 'text-purple-600',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200'
  },
  gray: {
    bg: 'from-gray-500 to-slate-500',
    text: 'text-gray-600',
    bgLight: 'bg-gray-50',
    border: 'border-gray-200'
  }
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  description,
  badge,
  onClick,
  loading = false,
  className = ''
}: StatsCardProps) {
  const colors = colorVariants[color]

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return TrendingUp
      case 'down':
        return TrendingDown
      case 'neutral':
        return Minus
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'neutral':
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1, y: onClick ? -2 : 0 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`p-6 transition-all duration-200 ${
          onClick ? 'cursor-pointer hover:shadow-lg' : ''
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              {badge && (
                <Badge variant={badge.variant} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>

            {/* Value */}
            <div className="flex items-baseline space-x-2 mb-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change && (
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(change.trend)}`}>
                  {React.createElement(getTrendIcon(change.trend), { className: 'h-4 w-4' })}
                  <span>{change.value}</span>
                </div>
              )}
            </div>

            {/* Description and Period */}
            <div className="space-y-1">
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
              {change?.period && (
                <p className="text-xs text-gray-400">{change.period}</p>
              )}
            </div>
          </div>

          {/* Icon */}
          {Icon && (
            <div className={`w-12 h-12 bg-gradient-to-r ${colors.bg} rounded-xl flex items-center justify-center`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

interface StatsGridProps {
  stats: Omit<StatsCardProps, 'className'>[]
  columns?: 1 | 2 | 3 | 4
  loading?: boolean
  className?: string
}

export function StatsGrid({ 
  stats, 
  columns = 4, 
  loading = false, 
  className = '' 
}: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {loading
        ? Array.from({ length: columns }, (_, index) => (
            <StatsCard
              key={index}
              title=""
              value=""
              loading={true}
            />
          ))
        : stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))
      }
    </div>
  )
}