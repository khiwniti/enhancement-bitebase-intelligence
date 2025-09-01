'use client'

import { useEffect, useRef } from 'react'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Mark performance timing
  mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name)
    }
  }

  // Measure performance between marks
  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const measurement = performance.measure(name, startMark, endMark)
      this.metrics.set(name, measurement.duration)
      return measurement.duration
    }
    return 0
  }

  // Get Core Web Vitals
  observeWebVitals(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      if (lastEntry) {
        this.metrics.set('LCP', lastEntry.startTime)
        console.log('LCP:', lastEntry.startTime)
      }
    })

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', lcpObserver)
    } catch (e) {
      // Browser doesn't support LCP
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.name === 'first-input') {
          const fid = entry.processingStart - entry.startTime
          this.metrics.set('FID', fid)
          console.log('FID:', fid)
        }
      })
    })

    try {
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', fidObserver)
    } catch (e) {
      // Browser doesn't support FID
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          this.metrics.set('CLS', clsValue)
          console.log('CLS:', clsValue)
        }
      })
    })

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('cls', clsObserver)
    } catch (e) {
      // Browser doesn't support CLS
    }
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Clear metrics
  clear(): void {
    this.metrics.clear()
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// React hook for component performance measurement
export function usePerformanceTimer(componentName: string) {
  const startTime = useRef<number>(0)
  const monitor = PerformanceMonitor.getInstance()

  useEffect(() => {
    const markName = `${componentName}-start`
    monitor.mark(markName)
    startTime.current = performance.now()

    return () => {
      const endMarkName = `${componentName}-end`
      monitor.mark(endMarkName)
      const duration = monitor.measure(`${componentName}-render`, markName, endMarkName)

      // Log slow components (>100ms)
      if (duration > 100) {
        console.warn(`Slow component detected: ${componentName} took ${duration.toFixed(2)}ms`)
      }
    }
  }, [componentName, monitor])
}

// Bundle size monitoring
export function logBundleInfo(): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Log navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      console.group('Performance Metrics')
      console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart)
      console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart)
      console.log('DNS Lookup:', navigation.domainLookupEnd - navigation.domainLookupStart)
      console.log('TCP Connection:', navigation.connectEnd - navigation.connectStart)
      console.groupEnd()
    }

    // Log resource timing
    const resources = performance.getEntriesByType('resource')
    const jsResources = resources.filter(r => r.name.includes('.js'))
    const totalJSSize = jsResources.reduce((sum, r: any) => sum + (r.transferSize || 0), 0)

    console.group('Bundle Info')
    console.log(`Total JS Resources: ${jsResources.length}`)
    console.log(`Total JS Transfer Size: ${(totalJSSize / 1024 / 1024).toFixed(2)} MB`)
    console.log('Largest JS Files:',
      jsResources
        .sort((a: any, b: any) => (b.transferSize || 0) - (a.transferSize || 0))
        .slice(0, 5)
        .map((r: any) => ({
          name: r.name.split('/').pop(),
          size: `${((r.transferSize || 0) / 1024).toFixed(1)} KB`
        }))
    )
    console.groupEnd()
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    const memory = (performance as any).memory
    console.group('Memory Usage')
    console.log('Used JS Heap:', `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
    console.log('Total JS Heap:', `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
    console.log('Heap Limit:', `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`)
    console.groupEnd()
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  const monitor = PerformanceMonitor.getInstance()
  monitor.observeWebVitals()

  // Log bundle info after page load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        logBundleInfo()
        monitorMemoryUsage()
      }, 1000)
    })
  }
}
