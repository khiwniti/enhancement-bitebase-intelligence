'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedTranslations, useLanguageSwitcher } from '../hooks';
import { SUPPORTED_LOCALES, getTextDirection } from '../config';
import type { SupportedLocale } from '../types';

interface LanguageSwitcherProps {
  className?: string;
  showFlags?: boolean;
  compact?: boolean;
}

// Language display names and flags
const LANGUAGE_CONFIG = {
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  th: { name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  it: { name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  pt: { name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
  zh: { name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  ja: { name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  ko: { name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
  ar: { name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' }
} as const;

export function LanguageSwitcher({ 
  className = '', 
  showFlags = true, 
  compact = false 
}: LanguageSwitcherProps) {
  const { t } = useEnhancedTranslations('common');
  const { currentLocale, switching, switchLanguage, direction } = useLanguageSwitcher();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during hydration to prevent hydration mismatch
    return (
      <div className={`inline-block ${className}`}>
        <div className="px-3 py-2 bg-gray-100 rounded-md animate-pulse">
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currentLanguage = LANGUAGE_CONFIG[currentLocale];
  const isRTL = direction === 'rtl';

  const handleLanguageSelect = async (locale: SupportedLocale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    
    // Get current pathname for preloading
    const pathname = window.location.pathname.replace(/^\/[a-z]{2}/, '') || '/';
    
    await switchLanguage(locale, pathname);
  };

  return (
    <div className={`relative inline-block ${className}`} dir={direction}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 
          bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200
          ${switching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
        aria-label={t('language.select')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {switching ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {showFlags && <span className="text-lg">{currentLanguage.flag}</span>}
            <span className="text-sm font-medium">
              {compact ? currentLocale.toUpperCase() : currentLanguage.nativeName}
            </span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div 
            className={`
              absolute z-50 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg
              min-w-48 max-h-64 overflow-auto
              ${isRTL ? 'right-0' : 'left-0'}
            `}
            role="listbox"
            aria-label={t('language.select')}
          >
            {SUPPORTED_LOCALES.map((locale) => {
              const language = LANGUAGE_CONFIG[locale];
              const isSelected = locale === currentLocale;
              
              return (
                <button
                  key={locale}
                  onClick={() => handleLanguageSelect(locale)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50
                    transition-colors duration-150
                    ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                    ${isRTL ? 'flex-row-reverse text-right' : ''}
                  `}
                  role="option"
                  aria-selected={isSelected}
                  dir={getTextDirection(locale)}
                >
                  {showFlags && <span className="text-lg">{language.flag}</span>}
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    {!compact && (
                      <div className="text-xs text-gray-500">{language.name}</div>
                    )}
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;

// Compact version for mobile/header use
export function CompactLanguageSwitcher(props: Omit<LanguageSwitcherProps, 'compact'>) {
  return <LanguageSwitcher {...props} compact showFlags={false} />;
}

// Full-featured version for settings pages
export function DetailedLanguageSwitcher(props: LanguageSwitcherProps) {
  return <LanguageSwitcher {...props} compact={false} showFlags />;
}