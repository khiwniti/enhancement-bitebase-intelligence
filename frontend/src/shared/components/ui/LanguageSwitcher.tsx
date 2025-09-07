'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { locales, Locale } from '@/shared/lib/i18n-config'
import { 
  GlobeAltIcon, 
  CheckIcon, 
  ChevronDownIcon 
} from '@heroicons/react/24/outline'

interface LanguageOption {
  code: Locale
  name: string
  nativeName: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
]

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('common.language')

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (newLocale: Locale) => {
    setIsOpen(false)
    
    // Remove the current locale from the pathname if it exists
    const segments = pathname.split('/').filter(Boolean)
    if (locales.includes(segments[0] as Locale)) {
      segments.shift()
    }
    
    // Create new path with the new locale
    const newPath = `/${newLocale}${segments.length > 0 ? '/' + segments.join('/') : ''}`
    
    router.push(newPath)
    router.refresh()
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded="true"
        aria-haspopup="true"
      >
        <GlobeAltIcon className="w-4 h-4 mr-2" />
        <span className="mr-2">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.nativeName}</span>
        <ChevronDownIcon 
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-72 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
            <div className="font-medium">{t('select')}</div>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`group flex items-center w-full px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
                  language.code === locale 
                    ? 'bg-purple-50 text-purple-700' 
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg mr-3">{language.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-gray-500">{language.name}</div>
                </div>
                {language.code === locale && (
                  <CheckIcon className="w-4 h-4 text-purple-600 ml-2" />
                )}
              </button>
            ))}
          </div>
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
            {t('auto_detect')}
          </div>
        </div>
      )}
    </div>
  )
}