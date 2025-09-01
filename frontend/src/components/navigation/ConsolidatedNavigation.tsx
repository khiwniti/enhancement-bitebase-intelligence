'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Building, 
  Target, 
  MapPin, 
  Brain,
  Settings,
  Users,
  Shield,
  FileText,
  Zap,
  ChevronDown,
  Home,
  ArrowRight
} from 'lucide-react'

interface NavigationItem {
  id: string
  title: string
  description: string
  href: string
  icon: React.ComponentType<any>
  badge?: string
  category: 'primary' | 'secondary' | 'admin'
  userRoles: string[]
  isNew?: boolean
  consolidatedFrom?: string[]
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Business Command Center',
    description: 'Role-based dashboard with personalized insights',
    href: '/dashboard',
    icon: Home,
    category: 'primary',
    userRoles: ['restaurant-owner', 'marketing-manager', 'data-analyst'],
    isNew: true
  },
  {
    id: 'growth-studio',
    title: 'Growth Intelligence Studio',
    description: 'Market research, site selection, and expansion planning',
    href: '/growth-studio',
    icon: Target,
    badge: 'AI-Powered',
    category: 'primary',
    userRoles: ['marketing-manager', 'data-analyst'],
    isNew: true,
    consolidatedFrom: ['Location Center', 'Location Intelligence', 'Place Intelligence']
  },
  {
    id: 'analytics-workbench',
    title: 'Analytics Workbench',
    description: 'Unified business intelligence and data analytics platform',
    href: '/analytics-workbench',
    icon: BarChart3,
    badge: 'Unified',
    category: 'primary',
    userRoles: ['data-analyst', 'marketing-manager'],
    isNew: true,
    consolidatedFrom: ['Analytics', 'Analytics Center', 'Integrated Analytics']
  },
  {
    id: 'operations-hub',
    title: 'Operations Hub',
    description: 'Restaurant management and operational tools',
    href: '/operations-center',
    icon: Building,
    category: 'primary',
    userRoles: ['restaurant-owner', 'data-analyst']
  },
  {
    id: 'ai-research',
    title: 'AI Research Agent',
    description: 'Natural language market research and analysis',
    href: '/research-agent',
    icon: Brain,
    badge: 'Beta',
    category: 'secondary',
    userRoles: ['marketing-manager', 'data-analyst'],
    isNew: true
  },
  {
    id: 'campaign-management',
    title: 'Campaign Management',
    description: 'Marketing campaign tools and A/B testing',
    href: '/campaign-management',
    icon: TrendingUp,
    category: 'secondary',
    userRoles: ['marketing-manager']
  },
  {
    id: 'restaurant-management',
    title: 'Restaurant Management',
    description: 'Staff, inventory, and financial management',
    href: '/restaurant-management',
    icon: Users,
    category: 'secondary',
    userRoles: ['restaurant-owner']
  },
  {
    id: 'pos-integration',
    title: 'POS Integration',
    description: 'Point-of-sale system connections and data sync',
    href: '/pos-integration',
    icon: Zap,
    category: 'secondary',
    userRoles: ['restaurant-owner', 'data-analyst']
  },
  {
    id: 'reports',
    title: 'Custom Reports',
    description: 'Generate and schedule custom business reports',
    href: '/reports',
    icon: FileText,
    category: 'secondary',
    userRoles: ['restaurant-owner', 'marketing-manager', 'data-analyst']
  },
  {
    id: 'data-sources',
    title: 'Data Sources',
    description: 'External data connections and integrations',
    href: '/data-sources',
    icon: Settings,
    category: 'admin',
    userRoles: ['data-analyst']
  },
  {
    id: 'security',
    title: 'Security Center',
    description: 'User management and security settings',
    href: '/security',
    icon: Shield,
    category: 'admin',
    userRoles: ['data-analyst']
  }
]

interface ConsolidatedNavigationProps {
  userRole?: string
  onItemSelect?: (item: NavigationItem) => void
  showDeprecationNotices?: boolean
}

export function ConsolidatedNavigation({ 
  userRole = 'restaurant-owner',
  onItemSelect,
  showDeprecationNotices = true
}: ConsolidatedNavigationProps) {
  const pathname = usePathname()
  const [expandedCategory, setExpandedCategory] = useState<string>('primary')

  // Filter items based on user role
  const filteredItems = navigationItems.filter(item => 
    item.userRoles.includes(userRole)
  )

  const primaryItems = filteredItems.filter(item => item.category === 'primary')
  const secondaryItems = filteredItems.filter(item => item.category === 'secondary')
  const adminItems = filteredItems.filter(item => item.category === 'admin')

  const handleItemClick = (item: NavigationItem) => {
    if (onItemSelect) {
      onItemSelect(item)
    }
  }

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = pathname === item.href
    
    return (
      <div key={item.id} className="space-y-2">
        <Link href={item.href} onClick={() => handleItemClick(item)}>
          <div className={`
            flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer
            ${isActive 
              ? 'bg-[#74C365] text-white shadow-md' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}>
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {item.title}
                  </span>
                  {item.isNew && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      New
                    </Badge>
                  )}
                  {item.badge && (
                    <Badge variant="outline" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.description}
                </p>
              </div>
            </div>
            {!isActive && (
              <ArrowRight className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </Link>

        {/* Show consolidation notice for new items */}
        {item.consolidatedFrom && showDeprecationNotices && (
          <div className="ml-8 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Consolidated:</strong> This replaces {item.consolidatedFrom.join(', ')}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Primary Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            Primary Workspace
          </h3>
          <Badge variant="outline" className="text-xs">
            {primaryItems.length} tools
          </Badge>
        </div>
        <div className="space-y-1">
          {primaryItems.map(renderNavigationItem)}
        </div>
      </div>

      {/* Secondary Navigation */}
      {secondaryItems.length > 0 && (
        <div>
          <button
            onClick={() => setExpandedCategory(expandedCategory === 'secondary' ? '' : 'secondary')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Specialized Tools
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {secondaryItems.length} tools
              </Badge>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
                expandedCategory === 'secondary' ? 'rotate-180' : ''
              }`} />
            </div>
          </button>
          {expandedCategory === 'secondary' && (
            <div className="space-y-1">
              {secondaryItems.map(renderNavigationItem)}
            </div>
          )}
        </div>
      )}

      {/* Admin Navigation */}
      {adminItems.length > 0 && (
        <div>
          <button
            onClick={() => setExpandedCategory(expandedCategory === 'admin' ? '' : 'admin')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Administration
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {adminItems.length} tools
              </Badge>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
                expandedCategory === 'admin' ? 'rotate-180' : ''
              }`} />
            </div>
          </button>
          {expandedCategory === 'admin' && (
            <div className="space-y-1">
              {adminItems.map(renderNavigationItem)}
            </div>
          )}
        </div>
      )}

      {/* Consolidation Summary */}
      {showDeprecationNotices && (
        <div className="p-4 bg-gradient-to-r from-[#74C365]/10 to-green-100 dark:from-[#74C365]/20 dark:to-green-900/20 rounded-lg border border-[#74C365]/30">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-[#74C365] mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-[#74C365] mb-1">
                Enhanced Navigation
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                We've consolidated redundant pages into workflow-focused studios for better efficiency.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Analytics tools unified in Analytics Workbench</li>
                <li>• Location features merged into Growth Intelligence Studio</li>
                <li>• Role-based dashboards for personalized experience</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConsolidatedNavigation