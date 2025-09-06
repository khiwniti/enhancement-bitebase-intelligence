'use client'

import React, { useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/button'
import { 
  locales, 
  localeNames, 
  localeDirections, 
  Locale 
} from '@/src/i18n/config'
import { useTranslations } from 'next-intl'
import { 
  Globe, 
  Check, 
  ChevronDown 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'compact' | 'full'
  showIcon?: boolean
}

export function LanguageSwitcher({ 
  className = '', 
  variant = 'full',
  showIcon = true 
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('common')
  
  const currentLocale = (params?.locale as Locale) || 'en'
  
  const switchLanguage = (newLocale: Locale) => {
    setIsOpen(false)
    
    // Remove current locale from pathname
    const currentLocaleInPath = locales.find(locale => 
      pathname.startsWith(`/${locale}`)
    )
    
    let newPathname = pathname
    if (currentLocaleInPath) {
      newPathname = pathname.slice(`/${currentLocaleInPath}`.length) || '/'
    }
    
    // Add new locale
    const newUrl = `/${newLocale}${newPathname === '/' ? '' : newPathname}`
    
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale};max-age=31536000;path=/`
    
    router.push(newUrl)
    router.refresh()
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          {showIcon && <Globe className="h-4 w-4" />}
          <span className="uppercase text-xs font-medium">
            {currentLocale}
          </span>
          <ChevronDown 
            className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[150px]"
              onMouseLeave={() => setIsOpen(false)}
            >
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => switchLanguage(locale)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    locale === currentLocale ? 'bg-purple-50 text-purple-600' : 'text-gray-700'
                  }`}
                  dir={localeDirections[locale]}
                >
                  <span>{localeNames[locale]}</span>
                  {locale === currentLocale && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[140px] justify-between"
      >
        <div className="flex items-center space-x-2">
          {showIcon && <Globe className="h-4 w-4" />}
          <span>{localeNames[currentLocale]}</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]"
            >
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                {t('language.select') || 'Select Language'}
              </div>
              
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => switchLanguage(locale)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${
                    locale === currentLocale 
                      ? 'bg-purple-50 text-purple-600 font-medium' 
                      : 'text-gray-700'
                  }`}
                  dir={localeDirections[locale]}
                >
                  <span>{localeNames[locale]}</span>
                  {locale === currentLocale && (
                    <Check className="h-4 w-4 text-purple-600" />
                  )}
                </button>
              ))}
              
              <div className="mt-2 px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
                {t('language.autoDetect') || 'Auto-detect'} {currentLocale.toUpperCase()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook to get current language info
export function useCurrentLanguage() {
  const params = useParams()
  const currentLocale = (params?.locale as Locale) || 'en'
  
  return {
    locale: currentLocale,
    name: localeNames[currentLocale],
    direction: localeDirections[currentLocale],
    isRTL: localeDirections[currentLocale] === 'rtl'
  }
}