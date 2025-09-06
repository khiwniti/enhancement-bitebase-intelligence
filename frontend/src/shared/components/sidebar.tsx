'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import {
  BarChart3,
  Brain,
  Building,
  ChevronRight,
  Home,
  MapPin,
  Settings,
  FileText,
  TrendingUp,
  Activity,
  Wrench,
  Target,
  Search,
  Rocket,
  Lightbulb,
  Menu,
  X,
  Zap,
  Database,
  Globe,
  Users
} from 'lucide-react'

interface NavItem {
  id: string
  title: string
  href?: string
  icon: any
  badge?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    children: [
      {
        id: 'analytics-overview',
        title: 'Analytics Overview',
        href: '/analytics',
        icon: Activity
      },
      {
        id: 'analytics-center',
        title: 'Analytics Center',
        href: '/analytics-center',
        icon: Database
      },
      {
        id: 'analytics-workbench',
        title: 'Analytics Workbench',
        href: '/analytics-workbench',
        icon: Wrench
      }
    ]
  },
  {
    id: 'market-research',
    title: 'Market Research',
    icon: Search,
    badge: 'NEW',
    children: [
      {
        id: 'market-research-wizard',
        title: 'Research Wizard',
        href: '/market-research',
        icon: Target
      },
      {
        id: 'market-analysis',
        title: 'Market Analysis',
        href: '/market-analysis',
        icon: BarChart3
      },
      {
        id: '4p-analytics',
        title: '4P Analytics',
        href: '/4p-analytics',
        icon: TrendingUp
      }
    ]
  },
  {
    id: 'location',
    title: 'Location Intelligence',
    icon: MapPin,
    children: [
      {
        id: 'location-intelligence',
        title: 'Location Intelligence',
        href: '/location-intelligence',
        icon: Globe
      },
      {
        id: 'location-center',
        title: 'Location Center',
        href: '/location-center',
        icon: MapPin
      }
    ]
  },
  {
    id: 'ai',
    title: 'AI Intelligence',
    icon: Brain,
    badge: 'AI',
    children: [
      {
        id: 'ai-assistant',
        title: 'AI Assistant',
        href: '/ai-assistant',
        icon: Brain
      },
      {
        id: 'ai-center',
        title: 'AI Center',
        href: '/ai-center',
        icon: Zap
      },
      {
        id: 'research-agent',
        title: 'Research Agent',
        href: '/research-agent',
        icon: Search
      }
    ]
  },
  {
    id: 'restaurant-management',
    title: 'Restaurant Management',
    href: '/restaurant-management',
    icon: Building
  },
  {
    id: 'growth-studio',
    title: 'Growth Studio',
    href: '/growth-studio',
    icon: Rocket
  },
  {
    id: 'reports',
    title: 'Reports',
    href: '/reports',
    icon: FileText
  },
  {
    id: 'settings',
    title: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const [expandedItems, setExpandedItems] = useState<string[]>(['analytics', 'ai', 'market-research'])
  const tCommon = useTranslations('common')
  const tNav = useTranslations('navigation')

  // Function to get the correct translation key based on item ID
  const getTranslationKey = (itemId: string): string => {
    // Map sidebar item IDs to the correct navigation JSON structure
    const keyMap: Record<string, string> = {
      'dashboard': 'main.dashboard',
      'analytics': 'main.analytics',
      '4p-analytics': 'analytics.4p_analytics',
      'analytics-center': 'analytics.analytics_center', 
      'analytics-workbench': 'analytics.analytics_workbench',
      'location': 'location.location_center', // Add mapping for location
      'location-center': 'location.location_center',
      'location-intelligence': 'location.location_intelligence',
      'market-analysis': 'market.market_analysis',
      'market-research': 'market.market_research',
      'market-research-wizard': 'market.market_research', // Add mapping for wizard
      'restaurant-management': 'main.restaurants',
      'growth-studio': 'ai.growth_studio',
      'research-agent': 'ai.research_agent',
      'ai-assistant': 'main.ai_assistant',
      'ai-center': 'ai.ai_center',
      'ai': 'main.ai_assistant', // Add mapping for 'ai' item
      'reports': 'main.reports',
      'settings': 'main.settings'
    }
    return keyMap[itemId] || `main.${itemId}`
  }

  const getItemLabel = (item: NavItem): string => {
    try {
      const key = getTranslationKey(item.id)
      return tNav(key as any) || item.title
    } catch {
      return item.title
    }
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string) => pathname === `/${locale}${href}`
  const isParentActive = (children: NavItem[]) => 
    children.some(child => child.href && isActive(child.href))

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const isItemActive = item.href ? isActive(item.href) : false
    const isParentItemActive = hasChildren ? isParentActive(item.children!) : false

    return (
      <div key={item.id} className="mb-1">
        {item.href ? (
          <Link href={`/${locale}${item.href}`}>
            <motion.div
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isItemActive
                  ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${level > 0 ? 'ml-4' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`h-5 w-5 ${isItemActive ? 'text-orange-600' : 'text-gray-400'}`} />
                <span>{getItemLabel(item)}</span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {tCommon(`status.${item.badge?.toLowerCase()}` as any) || item.badge}
                </Badge>
              )}
            </motion.div>
          </Link>
        ) : (
          <motion.button
            onClick={() => hasChildren && toggleExpanded(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isParentItemActive
                ? 'bg-orange-50 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            } ${level > 0 ? 'ml-4' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <item.icon className={`h-5 w-5 ${isParentItemActive ? 'text-orange-600' : 'text-gray-400'}`} />
              <span>{getItemLabel(item)}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {tCommon(`status.${item.badge?.toLowerCase()}` as any) || item.badge}
                </Badge>
              )}
            </div>
            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            )}
          </motion.button>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 space-y-1"
            >
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-80 lg:flex-shrink-0 lg:flex-col lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">BiteBase</h2>
                <p className="text-xs text-gray-500">Intelligence Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map(item => renderNavItem(item))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Need Help?</p>
                <p className="text-xs text-gray-500">Check our documentation</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          transition: { duration: 0.3, ease: 'easeInOut' }
        }}
        className="fixed left-0 top-0 z-50 h-full w-80 bg-white border-r border-gray-200 shadow-lg lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">BiteBase</h2>
                <p className="text-xs text-gray-500">Intelligence Platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map(item => renderNavItem(item))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Need Help?</p>
                <p className="text-xs text-gray-500">Check our documentation</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

// Mobile Toggle Button
export function SidebarToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-30 bg-white shadow-lg"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
