"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "../ui/button"
import {
  BarChart2,
  MapPin,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Search,
  Bell,
  User,
  Menu,
  X,
  FileText,
  Home,
  LayoutDashboard,
  ChevronRight,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
  Brain,
  Database,
  PieChart,
  Activity
} from 'lucide-react'
import BiteBaseLogo from '../BiteBaseLogo'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { WebTour, useTour } from '../tour/WebTour'
import { TourTrigger, WelcomeBanner } from '../tour/TourTrigger'
import { UserMenu } from '../auth/UserMenu'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils';

// Type definitions for navigation
interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description?: string;
  badge?: string;
}

interface NavigationSection {
  name: string;
  items: NavigationItem[];
}

// Function to generate navigation structure with translations
const getNavigationStructure = (t: (key: string) => string): NavigationSection[] => [
  {
    name: t('nav.dashboard'),
    items: [
      {
        name: t('nav.dashboard'),
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Main dashboard overview"
      },
    ]
  },
  {
    name: "Intelligence",
    items: [
      {
        name: t('nav.locationIntelligence'),
        href: "/location-intelligence",
        icon: MapPin,
        description: "Interactive maps and location analysis"
      },
      {
        name: t('nav.researchAgent'),
        href: "/research-agent",
        icon: Brain,
        description: "AI-powered market research"
      },
      {
        name: t('nav.analytics'),
        href: "/analytics",
        icon: BarChart2,
        description: "Business analytics and insights"
      },
      {
        name: "Integrated Analytics",
        href: "/analytics/integrated",
        icon: Activity,
        description: "Comprehensive business intelligence across all systems"
      },
    ]
  },
  {
    name: "Management",
    items: [
      {
        name: "Restaurant Management",
        href: "/restaurant-management",
        icon: Users,
        description: "Staff, inventory, tables, and operations"
      },
      {
        name: "Campaign Management",
        href: "/campaign-management",
        icon: TrendingUp,
        description: "Marketing campaigns and A/B testing"
      },
      {
        name: "POS Integration",
        href: "/pos-integration",
        icon: DollarSign,
        description: "Point of sale system integrations"
      },
    ]
  },
  {
    name: "Data & Reports",
    items: [
      {
        name: t('nav.dataSources'),
        href: "/data-sources",
        icon: Database,
        description: "Manage data connections"
      },
      {
        name: t('nav.reports'),
        href: "/reports",
        icon: FileText,
        description: "Generate and manage reports"
      },
    ]
  },
  {
    name: t('nav.settings'),
    items: [
      {
        name: t('nav.settings'),
        href: "/settings",
        icon: Settings,
        description: "Application settings"
      },
      {
        name: t('nav.help'),
        href: "/help",
        icon: HelpCircle,
        description: "Documentation and support"
      },
    ]
  }
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  // Language and tour systems
  const { t } = useLanguage();
  const { isTourOpen, isFirstTimeUser, startTour, closeTour, completeTour } = useTour();

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Apply dark mode class to document
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Check if current path matches navigation item
  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`min-h-screen bg-background font-secondary`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 border-r border-border`}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <BiteBaseLogo size="sm" variant="default" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {getNavigationStructure(t).map((section) => (
            <div key={section.name}>
              <h3 className="px-3 text-xs font-primary font-semibold text-muted-foreground uppercase tracking-wider">
                {section.name}
              </h3>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      data-tour={
                        item.href === '/dashboard' ? 'dashboard' :
                        item.href === '/location-intelligence' ? 'map-analysis' :
                        item.href === '/research-agent' ? 'ai-chat' :
                        item.href === '/reports' ? 'reports' :
                        undefined
                      }
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors font-secondary ${
                        isActive
                          ? 'bg-bitebase-primary/10 text-bitebase-primary border-l-2 border-bitebase-primary'
                          : 'text-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-bitebase-primary' : 'text-muted-foreground group-hover:text-foreground'
                      }`} />
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto inline-block py-0.5 px-2 text-xs font-primary font-medium bg-bitebase-primary/10 text-bitebase-primary rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>

        {/* Top bar */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">

            {/* Left side */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 text-foreground hover:bg-muted"
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-bitebase-primary focus:border-transparent font-secondary"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">

              {/* Dark mode toggle - Hidden for now since we're using light theme */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="hidden text-foreground hover:bg-muted"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

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
        <main className="p-6 bg-background">
          {/* Welcome banner for new users */}
          <WelcomeBanner onStartTour={startTour} />

          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Tour component */}
      <WebTour
        isOpen={isTourOpen}
        onClose={closeTour}
        onComplete={completeTour}
        isFirstTimeUser={isFirstTimeUser}
      />
    </div>
  );
}