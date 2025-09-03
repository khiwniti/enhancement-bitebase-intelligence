import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { 
  RefreshCw, 
  Filter, 
  Download, 
  Settings,
  Activity 
} from 'lucide-react'
import type { [FeatureName]HeaderProps } from '../types'

/**
 * Header component for the [FeatureName] feature
 * 
 * This component provides the feature title, controls, and filtering interface.
 * It handles user interactions for refreshing data, applying filters, and 
 * changing view modes.
 */
export const [FeatureName]Header = forwardRef<HTMLDivElement, [FeatureName]HeaderProps>(
  ({ 
    title,
    description,
    filters,
    view,
    onFiltersChange,
    onViewChange,
    onRefresh,
    onExport,
    isLoading = false,
    className,
    ...props 
  }, ref) => {
    const viewOptions = [
      { id: 'grid', label: 'Grid View' },
      { id: 'list', label: 'List View' },
      { id: 'table', label: 'Table View' }
    ]

    return (
      <motion.div
        ref={ref}
        className="space-y-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        {...props}
      >
        {/* Title Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Controls Section */}
        <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {viewOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={view === option.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange?.(option.id)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Filter Controls */}
              <div className="flex items-center space-x-3">
                {/* Active Filters */}
                {filters && Object.keys(filters).length > 0 && (
                  <div className="flex items-center space-x-2">
                    {Object.entries(filters).map(([key, value]) => (
                      value && (
                        <Badge 
                          key={key} 
                          variant="secondary" 
                          className="bg-blue-100 text-blue-800"
                        >
                          {key}: {String(value)}
                        </Badge>
                      )
                    ))}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Trigger filter modal/dropdown
                    // This would typically open a filter interface
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Bar */}
        <motion.div 
          className="flex items-center justify-between bg-white/90 backdrop-blur-xl rounded-lg p-4 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Live Data
          </Badge>
        </motion.div>
      </motion.div>
    )
  }
)

[FeatureName]Header.displayName = '[FeatureName]Header'