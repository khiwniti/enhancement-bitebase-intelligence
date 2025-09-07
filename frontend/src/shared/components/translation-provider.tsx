'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { Locale, localeDirections } from '@/shared/lib/i18n-config'
import { preloadTranslations } from '@/shared/hooks/use-translation'

interface TranslationContextType {
  locale: Locale
  isLoading: boolean
  isReady: boolean
  direction: 'ltr' | 'rtl'
  loadedNamespaces: Set<string>
  preloadNamespaces: (namespaces: string[]) => Promise<void>
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: ReactNode
  initialNamespaces?: string[]
  enableAI?: boolean
  fallbackLocale?: Locale
}

export function TranslationProvider({ 
  children, 
  initialNamespaces = ['common', 'dashboard', 'navigation'],
  enableAI = true,
  fallbackLocale = 'en'
}: TranslationProviderProps) {
  const params = useParams()
  const locale = (params?.locale as Locale) || fallbackLocale
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [loadedNamespaces, setLoadedNamespaces] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true)
      try {
        await preloadTranslations(locale, initialNamespaces)
        setLoadedNamespaces(new Set(initialNamespaces))
        setIsReady(true)
      } catch (error) {
        console.error('Failed to load translations:', error)
        // Try fallback locale
        if (locale !== fallbackLocale) {
          try {
            await preloadTranslations(fallbackLocale, initialNamespaces)
            setLoadedNamespaces(new Set(initialNamespaces))
            setIsReady(true)
          } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError)
            setIsReady(true) // Set ready to prevent infinite loading
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [locale, initialNamespaces, fallbackLocale])

  // Set document direction and lang attribute
  useEffect(() => {
    const direction = localeDirections[locale]
    document.documentElement.dir = direction
    document.documentElement.lang = locale
    
    // Update body class for styling
    document.body.className = document.body.className.replace(/\b(rtl|ltr)\b/g, '')
    document.body.classList.add(direction)
  }, [locale])

  const preloadNamespaces = async (additionalNamespaces: string[]) => {
    try {
      await preloadTranslations(locale, additionalNamespaces)
      setLoadedNamespaces(prev => {
        const newSet = new Set(prev)
        additionalNamespaces.forEach(ns => newSet.add(ns))
        return newSet
      })
    } catch (error) {
      console.error('Failed to preload additional namespaces:', error)
    }
  }

  const contextValue: TranslationContextType = {
    locale,
    isLoading,
    isReady,
    direction: localeDirections[locale],
    loadedNamespaces,
    preloadNamespaces
  }

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslationContext() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider')
  }
  return context
}

// HOC to wrap components with translation loading
export function withTranslation<T extends object>(
  Component: React.ComponentType<T>,
  namespaces: string[] = ['common']
) {
  return function WrappedComponent(props: T) {
    const { isReady } = useTranslationContext()
    
    if (!isReady) {
      return <TranslationLoadingFallback />
    }
    
    return <Component {...props} />
  }
}

// Loading fallback component
function TranslationLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="text-sm text-gray-500">Loading translations...</p>
      </div>
    </div>
  )
}

// Hook to dynamically load translations for specific components
export function useDynamicTranslation(namespace: string) {
  const { locale, preloadNamespaces } = useTranslationContext()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadNamespace = async () => {
      try {
        await preloadNamespaces([namespace])
        setIsLoaded(true)
      } catch (error) {
        console.error(`Failed to load namespace ${namespace}:`, error)
      }
    }

    loadNamespace()
  }, [namespace, preloadNamespaces])

  return { isLoaded, locale }
}
