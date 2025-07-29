'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import {
  LayoutDashboard,
  Brain,
  MapPin,
  BarChart3,
  Database,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  X,
  Bell,
  User,
  Search,
  ChevronDown,
  Zap,
  Target,
  Globe,
  Building,
  Building2,
  Activity,
  Users,
  TrendingUp,
  DollarSign,
  LogOut,
  UserCircle,
  ChefHat,
  Calculator,
  Heart,
  Shield
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and key metrics'
  },
  {
    id: 'builder',
    label: 'Dashboard Builder',
    href: '/dashboard/builder',
    icon: Building,
    description: 'Create custom dashboards'
  },
  {
    id: 'location-intelligence',
    label: 'Location Intelligence',
    href: '/location-intelligence',
    icon: MapPin,
    description: 'Interactive map analytics'
  },
  {
    id: 'research-agent',
    label: 'AI Research Agent',
    href: '/research-agent',
    icon: Brain,
    badge: 'AI',
    description: 'Intelligent market research'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Data insights and trends'
  },
  {
    id: 'integrated-analytics',
    label: 'Integrated Analytics',
    href: '/analytics/integrated',
    icon: Activity,
    badge: 'New',
    description: 'Comprehensive business intelligence'
  },
  {
    id: 'product-intelligence',
    label: 'Product Intelligence',
    href: '/product-intelligence',
    icon: ChefHat,
    badge: '4P',
    description: 'Menu engineering and cost analysis'
  },
  {
    id: 'place-intelligence',
    label: 'Place Intelligence',
    href: '/place-intelligence',
    icon: MapPin,
    badge: '4P',
    description: 'Location analytics and site selection'
  },
  {
    id: 'price-intelligence',
    label: 'Price Intelligence',
    href: '/price-intelligence',
    icon: Calculator,
    badge: '4P',
    description: 'Revenue forecasting and pricing optimization'
  },
  {
    id: 'promotion-intelligence',
    label: 'Promotion Intelligence',
    href: '/promotion-intelligence',
    icon: Heart,
    badge: '4P',
    description: 'Customer segmentation and campaign automation'
  },
  {
    id: 'multi-location',
    label: 'Multi-Location Management',
    href: '/multi-location',
    icon: Building2,
    description: 'Enterprise multi-location analytics and management'
  },
  {
    id: 'security',
    label: 'Enterprise Security',
    href: '/security',
    icon: Shield,
    badge: 'Enterprise',
    description: 'Security monitoring and access control'
  },
  {
    id: 'api-monitoring',
    label: 'API Monitoring',
    href: '/api-monitoring',
    icon: Activity,
    badge: 'Enterprise',
    description: 'API performance and rate limiting monitoring'
  },
  {
    id: 'restaurant-management',
    label: 'Restaurant Management',
    href: '/restaurant-management',
    icon: Users,
    description: 'Staff, inventory, and operations'
  },
  {
    id: 'campaign-management',
    label: 'Campaign Management',
    href: '/campaign-management',
    icon: TrendingUp,
    description: 'Marketing campaigns and A/B testing'
  },
  {
    id: 'pos-integration',
    label: 'POS Integration',
    href: '/pos-integration',
    icon: DollarSign,
    description: 'Point of sale integrations'
  },
  {
    id: 'data-sources',
    label: 'Data Sources',
    href: '/data-sources',
    icon: Database,
    description: 'Manage data connections'
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Generate and export reports'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration'
  },
  {
    id: 'help',
    label: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    description: 'Documentation and support'
  }
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const sidebarVariants = {
    open: { width: '280px', opacity: 1 },
    closed: { width: '80px', opacity: 0.9 }
  }

  const contentVariants = {
    open: { marginLeft: '280px' },
    closed: { marginLeft: '80px' }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        className="fixed left-0 top-0 h-full bg-white/80 backdrop-blur-xl border-r border-slate-200/50 z-30 shadow-xl"
      >
        <div className="flex flex-col h-full">
          {/* Logo and Brand */}
          <div className="p-6 border-b border-slate-200/50">
            <motion.div
              className="flex items-center space-x-3"
              animate={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col"
                  >
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      BiteBase
                    </span>
                    <span className="text-xs text-slate-500">Intelligence</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{item.label}</span>
                            <span className="text-xs text-slate-500">{item.description}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {item.badge}
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Toggle */}
          <div className="p-4 border-t border-slate-200/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full justify-center"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        variants={contentVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        className="min-h-screen transition-all duration-300"
      >
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-slate-900">
                  Restaurant Intelligence Platform
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <NotificationCenter />

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="hidden md:inline text-sm">
                    {user?.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-sm border border-slate-200/50 rounded-lg shadow-lg z-50"
                    >
                      <div className="p-3 border-b border-slate-200/50">
                        <div className="text-sm font-medium text-slate-900">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-slate-600">{user?.email}</div>
                      </div>

                      <div className="p-1">
                        <Link href="/settings">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                            <Settings className="w-4 h-4" />
                            Settings
                          </button>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </motion.main>
      </div>
    </ProtectedRoute>
  )
}
