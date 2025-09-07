'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Locale } from '@/shared/lib/i18n-config'

// Simple translation cache
const translationCache = new Map<string, Record<string, any>>()

export function useSimpleTranslation(namespace: string = 'common') {
  const params = useParams()
  const locale = (params?.locale as Locale) || 'en'
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      const cacheKey = `${locale}-${namespace}`

      // Check cache first
      if (translationCache.has(cacheKey)) {
        setTranslations(translationCache.get(cacheKey)!)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/locales/${locale}/${namespace}.json`)
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }
        const data = await response.json()

        // Cache the translations
        translationCache.set(cacheKey, data)
        setTranslations(data)
      } catch (error) {
        console.error(`Failed to load translations for ${cacheKey}:`, error)

        // Try fallback to English
        if (locale !== 'en') {
          try {
            const fallbackResponse = await fetch(`/locales/en/${namespace}.json`)
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json()
              translationCache.set(cacheKey, fallbackData)
              setTranslations(fallbackData)
            }
          } catch (fallbackError) {
            console.error(`Failed to load fallback translations:`, fallbackError)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [locale, namespace])

  const t = (key: string, replacements?: Record<string, string | number>) => {
    const keys = key.split('.')
    let value = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return key if not found
      }
    }

    let result = typeof value === 'string' ? value : key

    // Handle replacements
    if (replacements && typeof result === 'string') {
      Object.entries(replacements).forEach(([placeholder, replacement]) => {
        result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacement))
      })
    }

    return result
  }

  return {
    t,
    locale,
    isLoading,
    isReady: !isLoading
  }
}
