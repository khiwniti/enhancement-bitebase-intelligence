'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Locale, localeNames, locales } from '@/lib/i18n-config'

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const redirectToLocale = (locale: Locale) => {
    if (!pathname) return

    const segments = pathname.split('/')
    segments[1] = locale
    const newPath = segments.join('/')
    
    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`
    
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="w-5 h-5 text-lg">🌐</span>
        <span>{localeNames[currentLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => redirectToLocale(locale)}
                  className={`flex w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    currentLocale === locale
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="flex-1">{localeNames[locale]}</span>
                  {currentLocale === locale && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}