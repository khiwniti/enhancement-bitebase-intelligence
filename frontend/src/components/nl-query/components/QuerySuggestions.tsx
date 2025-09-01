/**
 * BiteBase Intelligence Query Suggestions Component
 * Displays auto-complete suggestions for natural language queries
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { Search, TrendingUp, Users, MapPin, UtensilsCrossed, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { QuerySuggestionsProps } from '../types/nlQueryTypes'

const categoryIcons = {
  revenue: TrendingUp,
  customers: Users,
  location: MapPin,
  menu: UtensilsCrossed,
  general: Search
}

const categoryColors = {
  revenue: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  customers: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  location: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  menu: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export const QuerySuggestions: React.FC<QuerySuggestionsProps> = ({
  suggestions,
  onSelect,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const hasAnySuggestions = suggestions.suggestions.length > 0 || 
    Object.values(suggestions.categories).some(cat => cat.length > 0)

  if (!hasAnySuggestions) {
    return null
  }

  return (
    <Card 
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Query Suggestions
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Recent/Popular Suggestions */}
        {suggestions.suggestions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Popular Queries
            </h4>
            <div className="space-y-1">
              {suggestions.suggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 flex items-center space-x-2"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="flex-1">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categorized Suggestions */}
        {Object.entries(suggestions.categories).map(([category, items]) => {
          if (items.length === 0) return null

          const Icon = categoryIcons[category as keyof typeof categoryIcons] || Search
          const colorClass = categoryColors[category as keyof typeof categoryColors]

          return (
            <div key={category} className="mb-4 last:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className={`${colorClass} text-xs`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              </div>
              <div className="space-y-1 ml-2">
                {items.slice(0, 3).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(item)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {/* Example Queries */}
        {suggestions.examples.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Try These Examples
            </h4>
            <div className="space-y-1">
              {suggestions.examples.slice(0, 3).map((example, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(example)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 text-gray-600 dark:text-gray-400"
                >
                  <span className="italic">&quot;{example}&quot;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>💡 <strong>Tip:</strong> Be specific about time periods and locations</p>
            <p>📊 <strong>Try:</strong> &quot;Compare&quot;, &quot;Show trends&quot;, &quot;Top 10&quot;, &quot;Last month&quot;</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default QuerySuggestions