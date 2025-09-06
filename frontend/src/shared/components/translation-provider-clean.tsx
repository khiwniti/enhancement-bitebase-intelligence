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
            setIsReady(false)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [locale, fallbackLocale, initialNamespaces])

  const preloadNamespaces = async (namespaces: string[]) => {
    try {
      await preloadTranslations(locale, namespaces)
      setLoadedNamespaces(prev => new Set([...prev, ...namespaces]))
    } catch (error) {
      console.error('Failed to preload namespaces:', error)
    }
  }

  const value: TranslationContextType = {
    locale,
    isLoading,
    isReady,
    direction: localeDirections[locale] || 'ltr',
    loadedNamespaces,
    preloadNamespaces
  }

  return (
    <TranslationContext.Provider value={value}>
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

// Loading wrapper component for translation-dependent components
export function TranslationGuard({ children, fallback }: {
  children: ReactNode;
  fallback?: ReactNode
}) {
  const { isReady } = useTranslationContext()

  if (!isReady) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 bg-purple-200 rounded-full mx-auto mb-4 animate-bounce"></div>
          <p className="text-gray-500">Loading translations...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
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
