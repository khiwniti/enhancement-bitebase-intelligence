import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { Loader2 } from 'lucide-react'
import { use[FeatureName]Data } from '../hooks/use[FeatureName]Data'
import { use[FeatureName]State } from '../hooks/use[FeatureName]State'
import { [FeatureName]Header } from './[FeatureName]Header'
import { [FeatureName]Content } from './[FeatureName]Content'
import type { [FeatureName]PageProps } from '../types'

/**
 * Main page component for the [FeatureName] feature
 * 
 * This component orchestrates the entire feature experience,
 * managing data fetching, state, and layout composition.
 */
export const [FeatureName]Page = forwardRef<HTMLDivElement, [FeatureName]PageProps>(
  ({ className, ...props }, ref) => {
    // Data fetching
    const { 
      data, 
      isLoading, 
      error, 
      refetch 
    } = use[FeatureName]Data()

    // Local state management
    const {
      filters,
      view,
      setFilters,
      setView,
      resetState
    } = use[FeatureName]State()

    // Handle loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading [FeatureName]...</p>
          </div>
        </div>
      )
    }

    // Handle error state
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading [FeatureName]</CardTitle>
              <CardDescription>
                {error.message || 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="w-full"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <motion.div
        ref={ref}
        className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        {...props}
      >
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Feature Header */}
          <[FeatureName]Header 
            title="[FeatureName]"
            description="Feature description goes here"
            filters={filters}
            view={view}
            onFiltersChange={setFilters}
            onViewChange={setView}
            onRefresh={() => refetch()}
          />

          {/* Feature Content */}
          <[FeatureName]Content 
            data={data}
            filters={filters}
            view={view}
            onDataUpdate={() => refetch()}
          />
        </div>
      </motion.div>
    )
  }
)

[FeatureName]Page.displayName = '[FeatureName]Page'