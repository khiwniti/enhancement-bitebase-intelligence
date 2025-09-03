import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { 
  Grid,
  List,
  Table,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react'
import type { [FeatureName]ContentProps } from '../types'

/**
 * Content component for the [FeatureName] feature
 * 
 * This component renders the main content area with data visualization,
 * supporting multiple view modes (grid, list, table) and handling
 * empty states, loading states, and user interactions.
 */
export const [FeatureName]Content = forwardRef<HTMLDivElement, [FeatureName]ContentProps>(
  ({ 
    data,
    filters,
    view = 'grid',
    onDataUpdate,
    onItemSelect,
    onItemAction,
    isLoading = false,
    className,
    ...props 
  }, ref) => {
    // Filter data based on active filters
    const filteredData = data?.filter(item => {
      if (!filters) return true
      
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true
        return item[key]?.toString().toLowerCase().includes(value.toString().toLowerCase())
      })
    }) || []

    // Handle empty state
    if (!isLoading && (!data || data.length === 0)) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          {...props}
        >
          <EmptyState
            title="No [FeatureName] Data"
            description="There's no data to display at the moment. Try refreshing or adjusting your filters."
            action={
              <Button onClick={onDataUpdate}>
                Refresh Data
              </Button>
            }
          />
        </motion.div>
      )
    }

    // Handle filtered empty state
    if (!isLoading && filteredData.length === 0 && data && data.length > 0) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          {...props}
        >
          <EmptyState
            title="No Results Found"
            description="No items match your current filters. Try adjusting your search criteria."
            action={
              <Button variant="outline" onClick={() => {
                // Clear filters logic would go here
              }}>
                Clear Filters
              </Button>
            }
          />
        </motion.div>
      )
    }

    // Render content based on view mode
    const renderContent = () => {
      switch (view) {
        case 'grid':
          return renderGridView()
        case 'list':
          return renderListView()
        case 'table':
          return renderTableView()
        default:
          return renderGridView()
      }
    }

    const renderGridView = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredData.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Card 
              className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-primary-300 transition-all duration-300 cursor-pointer"
              onClick={() => onItemSelect?.(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                    {item.title || item.name || `Item ${index + 1}`}
                  </CardTitle>
                  {item.status && (
                    <Badge 
                      variant={item.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {item.status}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.value && (
                    <div className="text-2xl font-bold text-primary-600">
                      {item.value}
                    </div>
                  )}
                  {item.metadata && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {onItemAction && (
                    <div className="flex justify-end pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onItemAction(item, 'view')
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )

    const renderListView = () => (
      <div className="space-y-4">
        {filteredData.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <Card 
              className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-primary-300 transition-all duration-300 cursor-pointer"
              onClick={() => onItemSelect?.(item)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title || item.name || `Item ${index + 1}`}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.value && (
                      <div className="text-xl font-bold text-primary-600">
                        {item.value}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status && (
                      <Badge 
                        variant={item.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {item.status}
                      </Badge>
                    )}
                    {onItemAction && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onItemAction(item, 'view')
                        }}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )

    const renderTableView = () => (
      <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <motion.tr
                    key={item.id || index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onItemSelect?.(item)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.title || item.name || `Item ${index + 1}`}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status && (
                        <Badge 
                          variant={item.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      {item.value || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {onItemAction && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onItemAction(item, 'view')
                          }}
                        >
                          View
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )

    return (
      <motion.div
        ref={ref}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        {...props}
      >
        {/* Content Stats */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredData.length} of {data?.length || 0} items
          </p>
          
          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <SortAsc className="w-4 h-4 mr-1" />
              Sort
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {renderContent()}
      </motion.div>
    )
  }
)

[FeatureName]Content.displayName = '[FeatureName]Content'