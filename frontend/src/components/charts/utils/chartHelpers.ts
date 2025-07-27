// Chart Helper Utilities
// BiteBase Intelligence 2.0 - Advanced Chart Library

import { ChartType, ChartTheme } from '../types/chartTypes'

// Color utilities
export const colorUtils = {
  // Convert hex to rgba
  hexToRgba(hex: string, alpha: number = 1): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  },

  // Generate color palette
  generatePalette(baseColor: string, count: number): string[] {
    const colors: string[] = []
    const hsl = this.hexToHsl(baseColor)
    
    for (let i = 0; i < count; i++) {
      const hue = (hsl.h + (i * 360 / count)) % 360
      colors.push(this.hslToHex(hue, hsl.s, hsl.l))
    }
    
    return colors
  },

  // Convert hex to HSL
  hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  },

  // Convert HSL to hex
  hslToHex(h: number, s: number, l: number): string {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  },

  // Get contrasting text color
  getContrastColor(backgroundColor: string): string {
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }
}

// Data formatting utilities
export const formatUtils = {
  // Format numbers with locale
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat('en-US', options).format(value)
  },

  // Format currency
  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value)
  },

  // Format percentage
  formatPercentage(value: number, decimals: number = 1): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100)
  },

  // Format dates
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', options).format(dateObj)
  },

  // Abbreviate large numbers
  abbreviateNumber(value: number): string {
    const suffixes = ['', 'K', 'M', 'B', 'T']
    const tier = Math.log10(Math.abs(value)) / 3 | 0
    
    if (tier === 0) return value.toString()
    
    const suffix = suffixes[tier]
    const scale = Math.pow(10, tier * 3)
    const scaled = value / scale
    
    return scaled.toFixed(1) + suffix
  }
}

// Chart configuration utilities
export const chartConfigUtils = {
  // Get default options for chart type
  getDefaultOptions(type: ChartType): any {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const
        }
      }
    }

    switch (type) {
      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: { display: true },
            y: { display: true }
          },
          elements: {
            line: { tension: 0.4 },
            point: { radius: 4 }
          }
        }

      case 'bar':
        return {
          ...baseOptions,
          scales: {
            x: { display: true },
            y: { display: true, beginAtZero: true }
          }
        }

      case 'pie':
      case 'doughnut':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              display: true,
              position: 'right' as const
            }
          }
        }

      default:
        return baseOptions
    }
  },

  // Merge chart options
  mergeOptions(defaultOptions: any, customOptions: any): any {
    return this.deepMerge(defaultOptions, customOptions)
  },

  // Deep merge objects
  deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }
}

// Animation utilities
export const animationUtils = {
  // Easing functions
  easing: {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },

  // Create animation configuration
  createAnimation(duration: number = 750, easing: string = 'easeInOutQuart'): any {
    return {
      duration,
      easing,
      delay: 0
    }
  },

  // Stagger animations for multiple elements
  createStaggeredAnimation(count: number, duration: number = 750, staggerDelay: number = 50): any {
    return {
      duration,
      delay: (context: any) => context.dataIndex * staggerDelay
    }
  }
}

// Responsive utilities
export const responsiveUtils = {
  // Get responsive breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },

  // Get current breakpoint
  getCurrentBreakpoint(): string {
    if (typeof window === 'undefined') return 'lg'
    
    const width = window.innerWidth
    
    if (width >= this.breakpoints['2xl']) return '2xl'
    if (width >= this.breakpoints.xl) return 'xl'
    if (width >= this.breakpoints.lg) return 'lg'
    if (width >= this.breakpoints.md) return 'md'
    if (width >= this.breakpoints.sm) return 'sm'
    
    return 'xs'
  },

  // Get responsive chart dimensions
  getResponsiveDimensions(containerWidth: number, containerHeight: number): {
    width: number
    height: number
    aspectRatio: number
  } {
    const breakpoint = this.getCurrentBreakpoint()
    
    // Adjust dimensions based on breakpoint
    let width = containerWidth
    let height = containerHeight
    
    if (breakpoint === 'xs' || breakpoint === 'sm') {
      // Mobile: prioritize height, maintain aspect ratio
      const aspectRatio = 16 / 9
      height = Math.min(containerHeight, containerWidth / aspectRatio)
      width = height * aspectRatio
    } else {
      // Desktop: use container dimensions
      width = containerWidth
      height = containerHeight
    }
    
    return {
      width,
      height,
      aspectRatio: width / height
    }
  }
}

// Performance utilities
export const performanceUtils = {
  // Debounce function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null
    
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Measure performance
  measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  },

  // Check if should use WebGL
  shouldUseWebGL(dataPointCount: number): boolean {
    return dataPointCount > 1000 && this.isWebGLSupported()
  },

  // Check WebGL support
  isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch (e) {
      return false
    }
  }
}

// Export all utilities as default export to avoid conflicts
export default {
  colorUtils,
  formatUtils,
  chartConfigUtils,
  animationUtils,
  responsiveUtils,
  performanceUtils
}