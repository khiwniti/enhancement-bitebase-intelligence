'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Brain,
  BarChart3,
  MapPin,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  Home,
  Search,
  Bell,
  User,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  Package,
  Megaphone,
  CreditCard,
  Building,
  Monitor,
  HelpCircle,
  LogOut
} from 'lucide-react'
import BiteBaseLogo from '@/components/BiteBaseLogo'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  description?: string
  badge?: string
  subItems?: NavItem[]
}

const navigationHubs: {
  [key: string]: {
    name: string
    icon: React.ComponentType<any>
    color: string
    items: NavItem[]
  }
} = {
  dashboard: {
    name: 'Dashboard Hub',
    icon: Home,
    color: 'from-blue-500 to-cyan-500',
    items: [
      { name: 'Overview', href: '/dashboard', icon: BarChart3, description: 'Main dashboard with key metrics' },
      { name: 'Dashboard Builder', href: '/dashboard/builder', icon: Package, description: 'Create custom dashboards' },
      { name: 'Insights', href: '/dashboard/insights', icon: TrendingUp, description: 'AI-powered insights' }
    ]
  },
  ai: {
    name: 'AI Intelligence Center',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    items: [
      { name: 'AI Center Overview', href: '/ai-center', icon: Brain, description: 'All AI tools in one place' },
      { name: 'Research Agent', href: '/research-agent', icon: Sparkles, description: 'AI-powered market research' },
      { name: 'Natural Language Query', href: '/dashboard/nl-query', icon: Search, description: 'Ask questions in plain English' },
      { name: 'Predictive Analytics', href: '/analytics/predictive', icon: Target, description: 'Future trend predictions' }
    ]
  },
  analytics: {
    name: 'Analytics Center',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
    items: [
      { name: 'Analytics Overview', href: '/analytics-center', icon: BarChart3, description: 'All analytics tools' },
      { name: 'Real-time Analytics', href: '/analytics', icon: TrendingUp, description: 'Live performance metrics' },
      { name: 'Integrated Analytics', href: '/analytics/integrated', icon: BarChart3, description: 'Comprehensive data analysis' },
      { name: 'Custom Reports', href: '/reports', icon: Package, description: 'Generate detailed reports' }
    ]
  },
  location: {
    name: 'Location Center',
    icon: MapPin,
    color: 'from-orange-500 to-red-500',
    items: [
      { name: 'Location Overview', href: '/location-center', icon: MapPin, description: 'All location tools' },
      { name: 'Place Intelligence', href: '/place-intelligence', icon: MapPin, description: 'Location-based insights' },
      { name: 'Multi-Location Management', href: '/multi-location', icon: Building, description: 'Manage multiple locations' },
      { name: 'Location Intelligence', href: '/location-intelligence', icon: Target, description: 'Site selection optimization' }
    ]
  },
  operations: {
    name: 'Operations Center',
    icon: Settings,
    color: 'from-indigo-500 to-purple-500',
    items: [
      { name: 'Operations Overview', href: '/operations-center', icon: Settings, description: 'All operations tools' },
      { name: 'Price Intelligence', href: '/price-intelligence', icon: DollarSign, description: 'Pricing optimization' },
      { name: 'Product Intelligence', href: '/product-intelligence', icon: Package, description: 'Menu and product insights' },
      { name: 'Promotion Intelligence', href: '/promotion-intelligence', icon: Megaphone, description: 'Campaign optimization' },
      { name: 'POS Integration', href: '/pos-integration', icon: CreditCard, description: 'Point of sale connections' },
      { name: 'Campaign Management', href: '/campaign-management', icon: Target, description: 'Marketing campaigns' },
      { name: 'Restaurant Management', href: '/restaurant-management', icon: Building, description: 'Daily operations' }
    ]
  },
  admin: {
    name: 'Admin Center',
    icon: Shield,
    color: 'from-gray-500 to-slate-500',
    items: [
      { name: 'Admin Overview', href: '/admin-center', icon: Shield, description: 'All admin tools' },
      { name: 'Security Dashboard', href: '/security', icon: Shield, description: 'Security monitoring' },
      { name: 'API Monitoring', href: '/api-monitoring', icon: Monitor, description: 'API performance tracking' },
      { name: 'Data Sources', href: '/data-sources', icon: Package, description: 'Manage data connections' },
      { name: 'Settings', href: '/settings', icon: Settings, description: 'System configuration' },
      { name: 'Help Center', href: '/help', icon: HelpCircle, description: 'Documentation and support' }
    ]
  }
}

interface HubNavigationProps {
  isMobile?: boolean
  onClose?: () => void
}

export function HubNavigation({ isMobile = false, onClose }: HubNavigationProps) {
  const pathname = usePathname()
  const [expandedHub, setExpandedHub] = useState<string | null>(
    // Auto-expand the hub that contains the current page
    Object.keys(navigationHubs).find(hubKey =>
      navigationHubs[hubKey].items.some(item => pathname.startsWith(item.href))
    ) || null
  )

  const toggleHub = (hubKey: string) => {
    setExpandedHub(expandedHub === hubKey ? null : hubKey)
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={`${isMobile ? 'p-4' : 'p-6'} space-y-2`}>
      {Object.entries(navigationHubs).map(([hubKey, hub]) => {
        const isExpanded = expandedHub === hubKey
        const hasActiveItem = hub.items.some(item => isActive(item.href))

        return (
          <div key={hubKey} className="space-y-1">
            {/* Hub Header */}
            <motion.button
              onClick={() => toggleHub(hubKey)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                hasActiveItem || isExpanded
                  ? 'bg-orange-50 border border-orange-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${hub.color} flex items-center justify-center`}>
                  <hub.icon className="h-4 w-4 text-white" />
                </div>
                <span className={`font-medium ${hasActiveItem ? 'text-orange-600' : 'text-gray-700'}`}>
                  {hub.name}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </motion.div>
            </motion.button>

            {/* Hub Items */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4 space-y-1 overflow-hidden"
                >
                  {hub.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link key={item.href} href={item.href} onClick={onClose}>
                        <motion.div
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                            active
                              ? 'bg-orange-500 text-white shadow-lg'
                              : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                          }`}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <item.icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${active ? 'text-white' : ''}`}>
                              {item.name}
                            </div>
                            {item.description && (
                              <div className={`text-xs ${active ? 'text-orange-100' : 'text-gray-500'}`}>
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.badge && (
                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      </Link>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )
}

interface MainNavigationProps {
  children: React.ReactNode
}

export default function MainNavigation({ children }: MainNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-center p-6 border-b border-gray-200">
            <BiteBaseLogo />
          </div>

          {/* Navigation */}
          <div className="flex-1">
            <HubNavigation />
          </div>

          {/* User Profile */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700">John Doe</div>
                <div className="text-xs text-gray-500">Restaurant Owner</div>
              </div>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <BiteBaseLogo />
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-80 bg-white z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <BiteBaseLogo />
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <HubNavigation isMobile onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-80">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}