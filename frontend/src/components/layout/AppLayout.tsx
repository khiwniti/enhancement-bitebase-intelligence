'use client'

import React, { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TopNavbar } from './TopNavbar'
import { Footer } from './Footer'
import MainNavigation from '@/components/navigation/MainNavigation'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AppStateProvider } from '@/contexts/AppStateContext'

interface AppLayoutProps {
  children: ReactNode
  showNavigation?: boolean
  showFooter?: boolean
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl'
  className?: string
}

export function AppLayout({ 
  children, 
  showNavigation = true, 
  showFooter = true,
  maxWidth = '7xl',
  className = '' 
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const maxWidthClasses = {
    full: 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
    '4xl': 'max-w-4xl'
  }

  if (showNavigation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation>
          <div className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
            {children}
          </div>
        </MainNavigation>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <TopNavbar 
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        showMobileMenu={mobileMenuOpen}
      />

      {/* Main Content */}
      <main className="flex-1">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
}

export function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  return (
    <AppStateProvider>
      <AppLayout showNavigation={true} showFooter={false} className={className}>
        <ErrorBoundary context="Dashboard">
          {children}
        </ErrorBoundary>
      </AppLayout>
    </AppStateProvider>
  )
}

interface PublicLayoutProps {
  children: ReactNode
  className?: string
}

export function PublicLayout({ children, className = '' }: PublicLayoutProps) {
  return (
    <AppStateProvider>
      <AppLayout showNavigation={false} showFooter={true} className={className}>
        <ErrorBoundary context="Public Page">
          {children}
        </ErrorBoundary>
      </AppLayout>
    </AppStateProvider>
  )
}

interface AuthLayoutProps {
  children: ReactNode
  className?: string
}

export function AuthLayout({ children, className = '' }: AuthLayoutProps) {
  return (
    <AppStateProvider enableGlobalLoading={false}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <ErrorBoundary context="Authentication">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={className}
          >
            {children}
          </motion.div>
        </ErrorBoundary>
      </div>
    </AppStateProvider>
  )
}