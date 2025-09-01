'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  Settings,
  LogOut,
  HelpCircle,
  BarChart3,
  Brain,
  MapPin,
  Shield,
  Sparkles
} from 'lucide-react'
import BiteBaseLogo from '@/components/BiteBaseLogo'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  badge?: string
  isActive?: boolean
}

const quickAccessItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'AI Center', href: '/ai-center', icon: Brain, badge: 'AI' },
  { name: 'Analytics', href: '/analytics-center', icon: BarChart3 },
  { name: 'Locations', href: '/location-center', icon: MapPin },
  { name: 'Security', href: '/admin-center', icon: Shield }
]

interface TopNavbarProps {
  onMobileMenuToggle?: () => void
  showMobileMenu?: boolean
}

export function TopNavbar({ onMobileMenuToggle, showMobileMenu = false }: TopNavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname.startsWith(href)

  const notifications = [
    { id: 1, title: 'High demand predicted', message: '35% increase expected this weekend', time: '2h ago', type: 'info' },
    { id: 2, title: 'Low inventory alert', message: 'Chicken breast below threshold', time: '15m ago', type: 'warning' },
    { id: 3, title: 'Campaign performance', message: 'Weekend promotion exceeded target', time: '1h ago', type: 'success' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Section - Logo & Quick Access */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMobileMenuToggle}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BiteBaseLogo />
          </Link>

          {/* Quick Access Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-1">
            {quickAccessItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    isActive(item.href) 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search restaurants, analytics, locations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                  />
                </motion.div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="w-full justify-start text-gray-500 hover:text-gray-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Search...</span>
                  <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'warning' ? 'bg-orange-500' :
                            notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Notifications
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Assistant Quick Access */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Sparkles className="h-4 w-4 text-orange-500" />
          </Button>

          {/* User Profile */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2"
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="hidden md:inline text-sm font-medium">John Doe</span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">John Doe</p>
                        <p className="text-sm text-gray-600">Restaurant Owner</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link href="/settings">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                    <Link href="/help">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help & Support
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}