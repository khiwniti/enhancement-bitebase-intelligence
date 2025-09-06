'use client'

import React from 'react'
import Link, { LinkProps } from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Locale } from '@/shared/lib/i18n-config'

interface LocalizedLinkProps extends Omit<LinkProps, 'href'> {
  href: string
  children: React.ReactNode
  locale?: Locale
  className?: string
  preserveLocale?: boolean
  hrefLang?: string
}

/**
 * SEO-optimized Link component that automatically handles locale routing
 * and provides proper hreflang attributes for search engines
 */
export function LocalizedLink({
  href,
  children,
  locale: targetLocale,
  className,
  preserveLocale = true,
  hrefLang,
  ...linkProps
}: LocalizedLinkProps) {
  const params = useParams()
  const pathname = usePathname()
  const currentLocale = (params?.locale as Locale) || 'en'

  // Build the localized href
  const buildLocalizedHref = (href: string, locale?: Locale): string => {
    // If absolute URL or contains protocol, return as-is
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return href
    }

    // If preserveLocale is false, return href as-is
    if (!preserveLocale) {
      return href
    }

    const effectiveLocale = locale || currentLocale

    // If href already starts with a locale, replace it
    const localePattern = /^\/[a-z]{2}(\/|$)/
    if (localePattern.test(href)) {
      return href.replace(localePattern, `/${effectiveLocale}$1`)
    }

    // Add locale prefix
    const cleanHref = href.startsWith('/') ? href : `/${href}`
    return `/${effectiveLocale}${cleanHref === '/' ? '' : cleanHref}`
  }

  const localizedHref = buildLocalizedHref(href, targetLocale)

  return (
    <Link
      href={localizedHref}
      className={className}
      hrefLang={hrefLang || (targetLocale && targetLocale !== currentLocale ? targetLocale : undefined)}
      {...linkProps}
    >
      {children}
    </Link>
  )
}

// Hook to generate localized URLs for SEO purposes
export function useLocalizedUrl() {
  const params = useParams()
  const pathname = usePathname()
  const currentLocale = (params?.locale as Locale) || 'en'

  const getLocalizedUrl = (path: string, locale?: Locale, includeOrigin = false): string => {
    const effectiveLocale = locale || currentLocale
    let localizedPath = path

    // Remove current locale from path if it exists
    const localePattern = /^\/[a-z]{2}(\/|$)/
    if (localePattern.test(localizedPath)) {
      localizedPath = localizedPath.replace(localePattern, '/$1').replace(/\/$/, '') || '/'
    }

    // Add new locale
    const finalPath = `/${effectiveLocale}${localizedPath === '/' ? '' : localizedPath}`

    if (includeOrigin && typeof window !== 'undefined') {
      return `${window.location.origin}${finalPath}`
    }

    return finalPath
  }

  const getCurrentUrl = (locale?: Locale, includeOrigin = false): string => {
    return getLocalizedUrl(pathname, locale, includeOrigin)
  }

  const getAllLocalizedUrls = (includeOrigin = false): Record<Locale, string> => {
    const locales: Locale[] = ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']
    
    return locales.reduce((acc, locale) => {
      acc[locale] = getCurrentUrl(locale, includeOrigin)
      return acc
    }, {} as Record<Locale, string>)
  }

  return {
    getLocalizedUrl,
    getCurrentUrl,
    getAllLocalizedUrls,
    currentLocale
  }
}

// Component for generating SEO hreflang links
export function HrefLangLinks({ canonical }: { canonical?: string }) {
  const { getAllLocalizedUrls } = useLocalizedUrl()
  const localizedUrls = getAllLocalizedUrls(true)

  return (
    <>
      {canonical && (
        <link rel="canonical" href={canonical} />
      )}
      {Object.entries(localizedUrls).map(([locale, url]) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={url}
        />
      ))}
      {/* x-default for international users */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={localizedUrls.en}
      />
    </>
  )
}

// Navigation component with locale-aware active states
interface LocalizedNavLinkProps extends LocalizedLinkProps {
  activeClassName?: string
  exactMatch?: boolean
}

export function LocalizedNavLink({
  href,
  children,
  className = '',
  activeClassName = 'active',
  exactMatch = false,
  ...props
}: LocalizedNavLinkProps) {
  const pathname = usePathname()
  const { getLocalizedUrl } = useLocalizedUrl()
  
  const localizedHref = getLocalizedUrl(href)
  const isActive = exactMatch 
    ? pathname === localizedHref
    : pathname.startsWith(localizedHref)

  const finalClassName = isActive 
    ? `${className} ${activeClassName}`.trim()
    : className

  return (
    <LocalizedLink
      href={href}
      className={finalClassName}
      {...props}
    >
      {children}
    </LocalizedLink>
  )
}

// Button component that works with localized routes
interface LocalizedButtonLinkProps extends LocalizedLinkProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function LocalizedButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: LocalizedButtonLinkProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    secondary: 'bg-purple-100 text-purple-900 hover:bg-purple-200 focus:ring-purple-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const finalClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <LocalizedLink
      href={href}
      className={finalClassName}
      {...props}
    >
      {children}
    </LocalizedLink>
  )
}

// Breadcrumb component with locale support
interface BreadcrumbItem {
  label: string
  href: string
}

interface LocalizedBreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
}

export function LocalizedBreadcrumbs({
  items,
  separator = '/',
  className = ''
}: LocalizedBreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400" aria-hidden="true">
              {separator}
            </span>
          )}
          {index === items.length - 1 ? (
            <span className="font-medium text-gray-900" aria-current="page">
              {item.label}
            </span>
          ) : (
            <LocalizedLink
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </LocalizedLink>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
