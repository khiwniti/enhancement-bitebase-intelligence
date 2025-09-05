'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getDictionary } from './get-dictionary'
import { Locale } from './i18n-config'

type TranslationDict = Record<string, any>

export function useTranslation(locale?: Locale) {
  const pathname = usePathname()
  const [dict, setDict] = useState<TranslationDict>({})
  const [isLoading, setIsLoading] = useState(true)
  
  // Extract locale from pathname if not provided
  const currentLocale: Locale = locale || (pathname.split('/')[1] as Locale) || 'th'
  
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true)
        const translations = await getDictionary(currentLocale)
        setDict(translations)
      } catch (error) {
        console.error('Failed to load translations:', error)
        // Fallback to English
        if (currentLocale !== 'en') {
          try {
            const fallbackTranslations = await getDictionary('en')
            setDict(fallbackTranslations)
          } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTranslations()
  }, [currentLocale])
  
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.')
    let value: any = dict
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }
    
    return typeof value === 'string' ? value : (fallback || key)
  }
  
  return { 
    t, 
    dict, 
    isLoading, 
    locale: currentLocale 
  }
}