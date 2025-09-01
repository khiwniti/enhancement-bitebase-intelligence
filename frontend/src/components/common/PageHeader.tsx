'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<any>
}

interface ActionButton {
  label: string
  onClick?: () => void
  href?: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  icon?: React.ComponentType<any>
  disabled?: boolean
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ActionButton[]
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  backButton?: {
    href: string
    label?: string
  }
  stats?: {
    label: string
    value: string
    change?: string
    trend?: 'up' | 'down' | 'neutral'
  }[]
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
  badge,
  backButton,
  stats,
  className = ''
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${className}`}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {item.href ? (
                <Link href={item.href} className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="flex items-center space-x-1 text-gray-900 font-medium">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
        {/* Title Section */}
        <div className="flex-1">
          {/* Back Button */}
          {backButton && (
            <div className="mb-4">
              <Link href={backButton.href}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backButton.label || 'Back'}
                </Button>
              </Link>
            </div>
          )}

          {/* Title and Badge */}
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {badge && (
              <Badge variant={badge.variant || 'default'} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg text-gray-600 mb-2">{subtitle}</p>
          )}

          {/* Description */}
          {description && (
            <p className="text-gray-500 max-w-2xl">{description}</p>
          )}

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  {stat.change && (
                    <div className={`text-xs mt-1 flex items-center ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {actions.map((action, index) => {
              const ButtonComponent = (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="flex items-center space-x-2"
                >
                  {action.icon && <action.icon className="h-4 w-4" />}
                  <span>{action.label}</span>
                </Button>
              )

              return action.href ? (
                <Link key={index} href={action.href}>
                  {ButtonComponent}
                </Link>
              ) : (
                ButtonComponent
              )
            })}
          </div>
        )}
      </div>

      {/* Separator */}
      <Separator />
    </motion.div>
  )
}