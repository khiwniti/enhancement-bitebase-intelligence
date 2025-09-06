'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Locale } from '@/shared/lib/i18n-config'
import { aiTranslationEnhancer } from '@/shared/lib/ai-translation-enhancer'

// Translation cache
const translationCache = new Map<string, Record<string, any>>()
const enhancedTranslationCache = new Map<string, Record<string, any>>()

// Global loading state for translations
let isLoading = false
const loadingPromises = new Map<string, Promise<any>>()

export function useTranslation(
  namespace: string = 'common',
  options: {
    enableAI?: boolean
    context?: {
      domain?: 'business' | 'technical' | 'casual' | 'formal' | 'marketing'
      audience?: 'general' | 'professional' | 'technical' | 'young' | 'mature'
      tone?: 'friendly' | 'formal' | 'enthusiastic' | 'professional' | 'conversational'
      category?: 'ui' | 'content' | 'error' | 'success' | 'navigation'
    }
  } = {}
) {
  const params = useParams()
  const locale = (params?.locale as Locale) || 'en'
  const [isEnhancing, setIsEnhancing] = useState(false)

  const { enableAI = true, context = {} } = options

  const t = (key: string, replacements?: Record<string, string | number>) => {
    const cacheKey = `${locale}-${namespace}`
    const enhancedCacheKey = `${cacheKey}-enhanced`

    // Try enhanced translations first if AI is enabled
    if (enableAI && enhancedTranslationCache.has(enhancedCacheKey)) {
      const enhancedTranslations = enhancedTranslationCache.get(enhancedCacheKey)
      const enhancedValue = getNestedValue(enhancedTranslations, key)
      if (enhancedValue) {
        return formatTranslation(enhancedValue, replacements)
      }
    }

    // Fall back to regular translations
    const translations = translationCache.get(cacheKey)
    if (!translations) {
      console.warn(`Translation not loaded for ${cacheKey}:${key}`)
      return key
    }

    const value = getNestedValue(translations, key)
    if (!value) {
      console.warn(`Translation key not found: ${key} in ${cacheKey}`)
      return key
    }

    return formatTranslation(value, replacements)
  }

  // Enhanced translation function with AI
  const tAI = async (key: string, replacements?: Record<string, string | number>) => {
    const originalTranslation = t(key, replacements)

    if (!enableAI || locale === 'en') {
      return originalTranslation
    }

    try {
      setIsEnhancing(true)
      const enhanced = await aiTranslationEnhancer.enhanceTranslation(
        originalTranslation,
        locale,
        {
          domain: context.domain || 'business',
          audience: context.audience || 'professional',
          tone: context.tone || 'professional',
          category: context.category || 'ui'
        }
      )

      // Cache the enhanced translation
      const enhancedCacheKey = `${locale}-${namespace}-enhanced`
      if (!enhancedTranslationCache.has(enhancedCacheKey)) {
        enhancedTranslationCache.set(enhancedCacheKey, {})
      }
      const cache = enhancedTranslationCache.get(enhancedCacheKey)!
      setNestedValue(cache, key, enhanced)

      return enhanced
    } catch (error) {
      console.warn('AI translation enhancement failed:', error)
      return originalTranslation
    } finally {
      setIsEnhancing(false)
    }
  }

  const getNestedValue = (obj: any, key: string) => {
    const keys = key.split('.')
    let value = obj

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return null
      }
    }
    return typeof value === 'string' ? value : null
  }

  const setNestedValue = (obj: any, key: string, value: string) => {
    const keys = key.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }

    current[keys[keys.length - 1]] = value
  }

  const formatTranslation = (value: string, replacements?: Record<string, string | number>) => {
    if (replacements && typeof value === 'string') {
      return Object.entries(replacements).reduce(
        (str, [placeholder, replacement]) =>
          str.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacement)),
        value
      )
    }
    return value
  }

  const loadTranslation = async () => {
    const cacheKey = `${locale}-${namespace}`

    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)
    }

    // Check if already loading
    if (loadingPromises.has(cacheKey)) {
      return await loadingPromises.get(cacheKey)
    }

    const loadingPromise = (async () => {
      try {
        const module = await import(`../../../public/locales/${locale}/${namespace}.json`)
        const translations = module.default
        translationCache.set(cacheKey, translations)

        // Auto-enhance translations if enabled and not English
        if (enableAI && locale !== 'en') {
          enhanceTranslationsInBackground(translations, locale, namespace, context)
        }

        return translations
      } catch (error) {
        console.warn(`Failed to load translation ${cacheKey}:`, error)

        // Fallback to English if not already English
        if (locale !== 'en') {
          try {
            const fallbackModule = await import(`../../../public/locales/en/${namespace}.json`)
            const fallbackTranslations = fallbackModule.default
            translationCache.set(cacheKey, fallbackTranslations)
            return fallbackTranslations
          } catch (fallbackError) {
            console.warn(`Failed to load fallback translation en-${namespace}:`, fallbackError)
          }
        }

        // Return empty object if all fails
        const emptyTranslations = {}
        translationCache.set(cacheKey, emptyTranslations)
        return emptyTranslations
      } finally {
        loadingPromises.delete(cacheKey)
      }
    })()

    loadingPromises.set(cacheKey, loadingPromise)
    return await loadingPromise
  }

  // Background enhancement of translations
  const enhanceTranslationsInBackground = async (
    translations: Record<string, any>,
    locale: Locale,
    namespace: string,
    context: any
  ) => {
    try {
      const flatTranslations = flattenTranslations(translations)
      const translationsToEnhance = Object.entries(flatTranslations).map(([key, value]) => ({
        key,
        text: value,
        context
      }))

      const enhancedTranslations = await aiTranslationEnhancer.enhanceMultipleTranslations(
        translationsToEnhance,
        locale
      )

      // Store enhanced translations
      const enhancedCacheKey = `${locale}-${namespace}-enhanced`
      const enhancedNested = unflattenTranslations(enhancedTranslations)
      enhancedTranslationCache.set(enhancedCacheKey, enhancedNested)
    } catch (error) {
      console.warn('Background translation enhancement failed:', error)
    }
  }

  // Utility to flatten nested translations
  const flattenTranslations = (obj: any, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {}

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'string') {
        result[fullKey] = value
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenTranslations(value, fullKey))
      }
    }

    return result
  }

  // Utility to unflatten translations back to nested structure
  const unflattenTranslations = (flat: Record<string, string>): Record<string, any> => {
    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(flat)) {
      setNestedValue(result, key, value)
    }

    return result
  }

  return {
    t,
    tAI,
    locale,
    loadTranslation,
    isReady: translationCache.has(`${locale}-${namespace}`),
    isEnhancing,
    enableAI
  }
}

// Preload translations for given locale and namespaces
export async function preloadTranslations(locale: Locale, namespaces: string[] = ['common']) {
  await Promise.all(
    namespaces.map(async (namespace) => {
      const cacheKey = `${locale}-${namespace}`
      if (!translationCache.has(cacheKey)) {
        try {
          const module = await import(`../../../public/locales/${locale}/${namespace}.json`)
          translationCache.set(cacheKey, module.default)
        } catch (error) {
          console.warn(`Failed to preload translation ${cacheKey}:`, error)
          // Try fallback to English
          if (locale !== 'en') {
            try {
              const fallbackModule = await import(`../../../public/locales/en/${namespace}.json`)
              translationCache.set(cacheKey, fallbackModule.default)
            } catch (fallbackError) {
              console.warn(`Failed to preload fallback translation en-${namespace}:`, fallbackError)
            }
          }
        }
      }
    })
  )
}

// Clear translation cache (useful for testing or memory management)
export function clearTranslationCache() {
  translationCache.clear()
  loadingPromises.clear()
}

// Get available locales
export function getAvailableLocales() {
  return ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']
}
