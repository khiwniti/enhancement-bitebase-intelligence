'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { LocalizedLink, LocalizedButtonLink } from '@/components/localized-link'
import { useEnhancedThaiTranslation } from '@/shared/hooks/use-enhanced-thai-translation'
import { 
  Menu, 
  X, 
  Sparkles, 
  BarChart3, 
  MapPin, 
  Brain,
  ChevronDown
} from 'lucide-react'

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, isThaiLocale } = useEnhancedThaiTranslation('landing')

  const navigationItems = [
    { key: 'features', href: '#features', icon: Sparkles },
    { key: 'analytics', href: '#analytics', icon: BarChart3 },
    { key: 'locations', href: '#locations', icon: MapPin },
    { key: 'ai', href: '#ai', icon: Brain }
  ]

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <LocalizedLink href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className={`font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${isThaiLocale ? 'font-medium' : ''}`}>
              {t('navbar.brand')}
            </span>
          </LocalizedLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map(({ key, href, icon: Icon }) => (
              <LocalizedLink
                key={key}
                href={href}
                className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors group"
              >
                <Icon className="h-4 w-4 group-hover:text-purple-600 transition-colors" />
                <span className={isThaiLocale ? 'text-sm' : ''}>{t(`navbar.navigation.${key}`)}</span>
              </LocalizedLink>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSwitcher variant="compact" />
            
            <LocalizedLink
              href="/auth/signin"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('navbar.actions.sign_in')}
            </LocalizedLink>
            
            <LocalizedButtonLink
              href="/auth/signup"
              variant="primary"
              size="sm"
              className={isThaiLocale ? 'text-sm px-6' : ''}
            >
              {t('navbar.actions.get_started')}
            </LocalizedButtonLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 lg:hidden">
            <LanguageSwitcher variant="compact" showIcon={false} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden border-t border-gray-200 bg-white"
        >
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              {navigationItems.map(({ key, href, icon: Icon }) => (
                <LocalizedLink
                  key={key}
                  href={href}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className={isThaiLocale ? 'text-base' : ''}>{t(`navbar.navigation.${key}`)}</span>
                </LocalizedLink>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <LocalizedButtonLink
                href="/auth/signin"
                variant="outline"
                className="w-full justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.actions.sign_in')}
              </LocalizedButtonLink>
              
              <LocalizedButtonLink
                href="/auth/signup"
                variant="primary"
                className="w-full justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.actions.get_started')}
              </LocalizedButtonLink>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

// Enhanced dashboard navbar for logged-in users
export function DashboardNavbar() {
  const { t, isThaiLocale } = useEnhancedThaiTranslation('navigation')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const navigationItems = [
    { key: 'dashboard', href: '/dashboard' },
    { key: 'analytics', href: '/analytics' },
    { key: 'restaurants', href: '/restaurants' },
    { key: 'ai_assistant', href: '/ai-assistant' },
    { key: 'reports', href: '/reports' }
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <LocalizedLink href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className={`font-bold text-xl text-gray-900 ${isThaiLocale ? 'font-medium' : ''}`}>
              BiteBase
            </span>
          </LocalizedLink>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map(({ key, href }) => (
              <LocalizedLink
                key={key}
                href={href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t(key)}
              </LocalizedLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher variant="compact" />
            
            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-600">U</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>

              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <LocalizedLink
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {t('settings')}
                  </LocalizedLink>
                  <LocalizedLink
                    href="/auth/logout"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {t('logout')}
                  </LocalizedLink>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
