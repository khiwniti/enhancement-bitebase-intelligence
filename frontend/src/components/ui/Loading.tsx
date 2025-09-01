'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Base loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'orange' | 'white'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    orange: 'border-orange-500',
    white: 'border-white'
  }

  return (
    <motion.div
      className={cn(
        'border-2 border-t-transparent rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  )
}

// Skeleton loading components
interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export function Skeleton({ className, width, height, rounded = false }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'bg-gray-200 animate-pulse',
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      style={{ width, height }}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// Card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 bg-white rounded-lg border', className)}>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton width={48} height={48} rounded />
          <div className="space-y-2 flex-1">
            <Skeleton height={20} width="60%" />
            <Skeleton height={16} width="40%" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="80%" />
          <Skeleton height={16} width="90%" />
        </div>
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={20} className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height={16} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 bg-white rounded-lg border', className)}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton height={24} width="30%" />
          <Skeleton height={32} width={80} />
        </div>
        <div className="h-64 bg-gray-100 rounded relative overflow-hidden">
          {/* Animated bars */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around p-4 space-x-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-gray-300 rounded-t"
                style={{ width: '20px' }}
                initial={{ height: 0 }}
                animate={{ height: Math.random() * 150 + 50 }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton height={32} width={200} />
          <Skeleton height={16} width={300} />
        </div>
        <Skeleton height={40} width={120} />
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton height={20} width={60} />
                <Skeleton height={16} width={80} />
              </div>
              <Skeleton width={32} height={32} />
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Loading overlay
interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
  children: React.ReactNode
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...', 
  className,
  children 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" color="orange" />
            <p className="text-sm text-gray-600 font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Button loading state
interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  [key: string]: any
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={cn(
        'relative',
        isLoading && 'cursor-not-allowed',
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
          {loadingText && (
            <span className="ml-2 text-sm">{loadingText}</span>
          )}
        </div>
      )}
      <div className={cn(isLoading && 'opacity-0')}>
        {children}
      </div>
    </button>
  )
}

// Progressive loading
interface ProgressiveLoadingProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function ProgressiveLoading({ steps, currentStep, className }: ProgressiveLoadingProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-center">
        <LoadingSpinner size="lg" color="orange" />
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center space-x-3 text-sm',
              index < currentStep && 'text-green-600',
              index === currentStep && 'text-orange-600 font-medium',
              index > currentStep && 'text-gray-400'
            )}
          >
            <div className={cn(
              'w-2 h-2 rounded-full',
              index < currentStep && 'bg-green-600',
              index === currentStep && 'bg-orange-600',
              index > currentStep && 'bg-gray-300'
            )} />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Export all components
export default {
  LoadingSpinner,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  LoadingOverlay,
  LoadingButton,
  ProgressiveLoading
}