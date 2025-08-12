"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Home,
  Brain,
  MapPin,
  FileText,
  BarChart3,
  Users,
  DollarSign,
  Settings,
  Search,
  Bell,
  User,
  Menu,
  X,
  HelpCircle,
  Sun,
  Moon,
  Activity,
  ChefHat,
  Megaphone,
  Database,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  Globe,
  Shield,
  Layout,
  PlusCircle,
  Filter,
  Calendar,
  Mail
} from 'lucide-react'
import BiteBaseLogo from '../BiteBaseLogo'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { WebTour, useTour } from '../tour/WebTour'
import { TourTrigger, WelcomeBanner } from '../tour/TourTrigger'
import { UserMenu } from '../auth/UserMenu'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: any
  description?: string
  badge?: string
  isNew?: boolean
  category?: 'core' | 'intelligence' | 'management' | 'tools'
}

interface NavigationSection {
  name: string
  items: NavigationItem[]
  isCollapsible?: boolean
  defaultOpen?: boolean
}

// Enhanced navigation structure with workspace-centric approach
const getWorkspaceNavigation = (t: (key: string) => string): NavigationSection[] => [
  {
    name: 'Workspace',
    items: [
      {
        name: 'Home',
        href: "/workspace",
        icon: Home,
        description: "Your intelligent workspace portal",
        category: 'core'
      },
    ],
    defaultOpen: true
  },
  {
    name: 'Core Intelligence',
    items: [
      {
        name: 'AI Research Agent',
        href: "/research-agent/enhanced",
        icon: Brain,
        description: "Natural language market research",
        category: 'core',
        badge: 'AI'
      },
      {
        name: 'Location Studio',
        href: "/location-intelligence/studio",
        icon: MapPin,
        description: "Interactive mapping and analysis",
        category: 'core'
      },
      {
        name: 'Report Builder',
        href: "/reports/builder",
        icon: FileText,
        description: "Drag & drop report creation",
        category: 'core',
        isNew: true
      },
    ],
    defaultOpen: true
  },
  {
    name: 'Business Intelligence',
    items: [
      {
        name: 'Analytics Dashboard',
        href: "/dashboard",
        icon: BarChart3,
        description: "KPIs and performance metrics"
      },
      {
        name: 'Market Intelligence',
        href: "/analytics/integrated",
        icon: Activity,
        description: "Comprehensive business intelligence"
      },
      {
        name: 'AI Insights',
        href: "/ai-insights",
        icon: Sparkles,
        description: "Machine learning predictions",
        badge: 'AI'
      },
    ],
    isCollapsible: true,
    defaultOpen: true
  },
  {
    name: '4P Framework',
    items: [
      {
        name: 'Product Intelligence',
        href: "/product-intelligence",
        icon: ChefHat,
        description: "Menu optimization and analysis"
      },
      {
        name: 'Place Intelligence',
        href: "/place-intelligence",
        icon: Target,
        description: "Location and market analysis"
      },
      {
        name: 'Price Intelligence',
        href: "/price-intelligence",
        icon: DollarSign,
        description: "Pricing strategy and optimization"
      },
      {
        name: 'Promotion Intelligence',
        href: "/promotion-intelligence",
        icon: Megaphone,
        description: "Marketing and campaign analytics"
      },
    ],
    isCollapsible: true,
    defaultOpen: false
  },
  {
    name: 'Operations',
    items: [
      {
        name: 'Restaurant Management',
        href: "/restaurant-management",
        icon: Users,
        description: "Staff, inventory, operations"
      },
      {
        name: 'Campaign Management',
        href: "/campaign-management",
        icon: TrendingUp,
        description: "Marketing campaigns and A/B testing"
      },
      {
        name: 'POS Integration',
        href: "/pos-integration",
        icon: Activity,
        description: "Point of sale system connections"
      },
    ],
    isCollapsible: true,
    defaultOpen: false
  },
  {
    name: 'Data & Tools',
    items: [
      {
        name: 'Data Sources',
        href: "/data-sources",
        icon: Database,
        description: "Manage integrations and connections"
      },
      {
        name: 'Reports Library',
        href: "/reports",
        icon: FileText,
        description: "Browse and manage reports"
      },
    ],
    isCollapsible: true,
    defaultOpen: false
  },
  {
    name: 'Settings',
    items: [
      {
        name: 'Workspace Settings',
        href: "/settings",
        icon: Settings,
        description: "Preferences and configuration"
      },
      {
        name: 'Help & Support',
        href: "/help",
        icon: HelpCircle,
        description: "Documentation and assistance"
      },
    ],
    isCollapsible: true,
    defaultOpen: false
  }
]

interface WorkspaceLayoutProps {
  children: React.ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const pathname = usePathname()

  // Language and tour systems
  const { t } = useLanguage()
  const { isTourOpen, isFirstTimeUser, startTour, closeTour, completeTour } = useTour()

  // Initialize collapsed sections based on defaults
  useEffect(() => {
    const defaultCollapsed = getWorkspaceNavigation(t)
      .filter(section => section.isCollapsible && !section.defaultOpen)
      .map(section => section.name)
    setCollapsedSections(defaultCollapsed)
  }, [t])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle section collapse
  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  // Check if current path matches navigation item
  const isActiveRoute = (href: string) => {
    if (href === '/workspace') {
      return pathname === '/workspace' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Get navigation items matching search
  const getFilteredNavigation = () => {
    if (!searchQuery) return getWorkspaceNavigation(t)
    
    return getWorkspaceNavigation(t)
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(section => section.items.length > 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-secondary">
      {/* Enhanced Sidebar */}
      <motion.div 
        initial={{ x: sidebarOpen ? 0 : -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 dark:border-gray-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <BiteBaseLogo size="sm" variant="default" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 backdrop-blur-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-gray-200/50 dark:border-gray-700/50 bg-orange-50/50 dark:bg-orange-950/10"
            >
              <div className="p-4 space-y-2">
                <div className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/research-agent/enhanced">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Brain className="h-3 w-3 mr-2" />
                      AI Research
                    </Button>
                  </Link>
                  <Link href="/location-intelligence/studio">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <MapPin className="h-3 w-3 mr-2" />
                      Map Analysis
                    </Button>
                  </Link>
                  <Link href="/reports/builder">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <FileText className="h-3 w-3 mr-2" />
                      New Report
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {getFilteredNavigation().map((section) => (
            <div key={section.name}>
              <div className="flex items-center justify-between group">
                <h3 className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.name}
                </h3>
                {section.isCollapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-gray-400 hover:text-gray-600"
                  >
                    <motion.div
                      animate={{ rotate: collapsedSections.includes(section.name) ? -90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Filter className="h-3 w-3" />
                    </motion.div>
                  </Button>
                )}
              </div>
              
              <AnimatePresence>
                {!collapsedSections.includes(section.name) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const isActive = isActiveRoute(item.href)
                      return (
                        <motion.div
                          key={item.name}
                          whileHover={{ x: 4 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Link
                            href={item.href}
                            data-tour={
                              item.href === '/workspace' ? 'workspace' :
                              item.href === '/location-intelligence/studio' ? 'map-analysis' :
                              item.href === '/research-agent/enhanced' ? 'ai-chat' :
                              item.href === '/reports/builder' ? 'reports' :
                              undefined
                            }
                            className={cn(
                              "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative",
                              isActive
                                ? 'bg-gradient-to-r from-orange-500/10 to-orange-600/10 text-orange-600 dark:text-orange-400 border-l-2 border-orange-500 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                            )}
                          >
                            <item.icon className={cn(
                              "mr-3 h-5 w-5 transition-colors",
                              isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                            )} />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{item.name}</span>
                                {item.isNew && (
                                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs px-1.5 py-0.5">
                                    <Sparkles className="h-2 w-2 mr-1" />
                                    New
                                  </Badge>
                                )}
                                {item.badge && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs px-1.5 py-0.5">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Enhanced Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>System Status: Operational</span>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
              v2.1.0
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Enhanced Top bar */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Home className="h-4 w-4 mr-2" />
                <span>Workspace</span>
                {pathname !== '/workspace' && pathname !== '/' && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Language switcher */}
              <LanguageSwitcher />

              {/* Tour trigger */}
              <TourTrigger onStartTour={startTour} />

              {/* Notifications */}
              <NotificationCenter />

              {/* User menu */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {/* Welcome banner for new users */}
          <WelcomeBanner onStartTour={startTour} />
          
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Tour component */}
      <WebTour
        isOpen={isTourOpen}
        onClose={closeTour}
        onComplete={completeTour}
        isFirstTimeUser={isFirstTimeUser}
      />
    </div>
  )
}