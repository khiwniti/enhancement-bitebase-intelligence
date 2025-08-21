'use client'

import React, { Suspense } from 'react'
import { motion } from 'framer-motion'

// Loading spinner component
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </div>
)

// Higher-order component for lazy loading with suspense
export function withLazyLoading<T extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<T>>,
  loadingMessage?: string
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Lazy loading utility for heavy chart components
export function lazyLoadChart<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingMessage = 'Loading chart...'
) {
  const LazyChart = React.lazy(importFn)
  return withLazyLoading(LazyChart, loadingMessage)
}

// Lazy loading utility for dashboard components
export function lazyLoadDashboard<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingMessage = 'Loading dashboard...'
) {
  const LazyDashboard = React.lazy(importFn)
  return withLazyLoading(LazyDashboard, loadingMessage)
}

// Lazy loading utility for AI components
export function lazyLoadAI<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingMessage = 'Loading AI component...'
) {
  const LazyAI = React.lazy(importFn)
  return withLazyLoading(LazyAI, loadingMessage)
}

// Preload utility for critical components
export function preloadComponent(importFn: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    // Preload after initial page load
    setTimeout(() => {
      importFn().catch(() => {
        // Ignore preload errors
      })
    }, 100)
  }
}

export default {
  withLazyLoading,
  lazyLoadChart,
  lazyLoadDashboard,
  lazyLoadAI,
  preloadComponent,
  LoadingSpinner
}