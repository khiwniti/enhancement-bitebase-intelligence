'use client'

import React from 'react'
import { 
  DashboardLayout, 
  PageHeader, 
  StatsGrid, 
  LoadingState,
  EmptyState,
  ErrorState 
} from '@/components/common'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CenterPageProps {
  title: string
  subtitle: string
  description?: string
  icon: React.ComponentType<any>
  stats: Array<{
    title: string
    value: string
    change?: { value: string; trend: 'up' | 'down' | 'neutral' }
    icon: React.ComponentType<any>
    color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'
  }>
  tools: Array<{
    id: string
    name: string
    description: string
    href: string
    icon: React.ComponentType<any>
    status: 'available' | 'coming-soon' | 'beta'
    features: string[]
    color: string
    badge?: string
    stats?: { label: string; value: string }
  }>
  sidebarContent?: React.ReactNode
  quickActions?: Array<{
    label: string
    icon: React.ComponentType<any>
    onClick: () => void
    variant?: 'default' | 'outline'
  }>
  loading?: boolean
  error?: string
  breadcrumbBase?: string
}

export function CenterPageTemplate({
  title,
  subtitle,
  description,
  icon: Icon,
  stats,
  tools,
  sidebarContent,
  quickActions,
  loading = false,
  error,
  breadcrumbBase = '/dashboard'
}: CenterPageProps) {
  const breadcrumbs = [
    { label: 'Dashboard', href: breadcrumbBase },
    { label: title, icon: Icon }
  ]

  const headerStats = stats.map(stat => ({
    label: stat.title,
    value: stat.value,
    change: stat.change?.value,
    trend: stat.change?.trend
  }))

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState type="skeleton" />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={title}
        subtitle={subtitle}
        description={description}
        breadcrumbs={breadcrumbs}
        badge={{ text: 'Center', variant: 'secondary' }}
        stats={headerStats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Tools Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Tools</h2>
          
          {tools.length === 0 ? (
            <EmptyState
              title="No tools available"
              description="Tools for this center are coming soon."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map((tool, index) => (
                <Card 
                  key={tool.id}
                  className="p-6 h-full bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  {/* Tool Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center`}>
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge
                        variant={tool.status === 'available' ? 'default' : tool.status === 'beta' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {tool.status === 'available' ? 'Live' : 
                         tool.status === 'beta' ? 'Beta' : 'Coming Soon'}
                      </Badge>
                      {tool.stats && (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{tool.stats.value}</div>
                          <div className="text-xs text-gray-500">{tool.stats.label}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tool Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

                    {/* Features */}
                    <div className="space-y-2">
                      {tool.features.slice(0, 3).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    <Button 
                      className="w-full"
                      variant={tool.status === 'available' || tool.status === 'beta' ? 'default' : 'outline'}
                      disabled={tool.status === 'coming-soon'}
                      onClick={() => window.location.href = tool.href}
                    >
                      {tool.status === 'coming-soon' ? 'Coming Soon' : 'Open Tool'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {quickActions && quickActions.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    className="w-full justify-start"
                    onClick={action.onClick}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Custom Sidebar Content */}
          {sidebarContent}

          {/* Help & Tips */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Explore our comprehensive documentation and tutorials to get the most out of {title.toLowerCase()}.
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                📖 View Documentation
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                🎥 Watch Tutorials
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                💬 Get Support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}