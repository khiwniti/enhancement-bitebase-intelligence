'use client'

import { Locale, localeSettings } from '@/shared/lib/i18n-config'

// Currency formatting
export function formatCurrency(
  amount: number, 
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  const settings = localeSettings[locale]
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: settings.currency,
      ...options
    }).format(amount)
  } catch (error) {
    // Fallback to manual formatting
    return `${settings.currencySymbol}${amount.toLocaleString(locale)}`
  }
}

// Number formatting
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  const settings = localeSettings[locale]
  
  try {
    return new Intl.NumberFormat(locale, {
      ...settings.numberFormat,
      ...options
    }).format(value)
  } catch (error) {
    return value.toLocaleString()
  }
}

// Percentage formatting
export function formatPercentage(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
      ...options
    }).format(value / 100)
  } catch (error) {
    return `${value}%`
  }
}

// Date formatting
export function formatDate(
  date: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(dateObj)
  } catch (error) {
    return dateObj.toLocaleDateString()
  }
}

// Time formatting
export function formatTime(
  date: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: locale === 'en',
      ...options
    }).format(dateObj)
  } catch (error) {
    return dateObj.toLocaleTimeString()
  }
}

// Relative time formatting
export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale,
  options?: Intl.RelativeTimeFormatOptions
): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.ceil(diffMs / (1000 * 60))
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
      ...options
    })
    
    if (Math.abs(diffDays) >= 1) {
      return rtf.format(diffDays, 'day')
    } else if (Math.abs(diffHours) >= 1) {
      return rtf.format(diffHours, 'hour')
    } else {
      return rtf.format(diffMinutes, 'minute')
    }
  } catch (error) {
    return formatDate(dateObj, locale)
  }
}

// File size formatting
export function formatFileSize(
  bytes: number,
  locale: Locale,
  decimals: number = 2
): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${formatNumber(
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)), 
    locale
  )} ${sizes[i]}`
}

// Compact number formatting (1.2K, 3.4M, etc.)
export function formatCompactNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
      ...options
    }).format(value)
  } catch (error) {
    // Manual fallback
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }
}

// Duration formatting (for videos, etc.)
export function formatDuration(
  seconds: number,
  locale: Locale,
  showHours: boolean = true
): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (showHours && hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

// Address formatting based on locale
export function formatAddress(
  address: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  },
  locale: Locale
): string {
  const { street, city, state, country, postalCode } = address
  
  // Different address formats for different locales
  switch (locale) {
    case 'en':
      return [street, city, state && postalCode ? `${state} ${postalCode}` : state || postalCode, country]
        .filter(Boolean)
        .join(', ')
    
    case 'th':
      return [street, city, state, postalCode, country]
        .filter(Boolean)
        .join(' ')
    
    case 'de':
    case 'fr':
      return [street, postalCode && city ? `${postalCode} ${city}` : city, state, country]
        .filter(Boolean)
        .join(', ')
    
    case 'ja':
    case 'ko':
      return [country, postalCode, state, city, street]
        .filter(Boolean)
        .join(' ')
    
    default:
      return [street, city, state, postalCode, country]
        .filter(Boolean)
        .join(', ')
  }
}

// Phone number formatting
export function formatPhoneNumber(
  phoneNumber: string,
  locale: Locale
): string {
  // Basic phone number formatting - this could be enhanced with a library like libphonenumber-js
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  switch (locale) {
    case 'th':
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
      }
      break
    case 'en':
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
      }
      break
    // Add more locale-specific formats as needed
  }
  
  return phoneNumber
}

// List formatting
export function formatList(
  items: string[],
  locale: Locale,
  options?: Intl.ListFormatOptions
): string {
  try {
    return new Intl.ListFormat(locale, {
      style: 'long',
      type: 'conjunction',
      ...options
    }).format(items)
  } catch (error) {
    // Fallback
    if (items.length <= 1) return items[0] || ''
    if (items.length === 2) return items.join(' and ')
    return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1]
  }
}
