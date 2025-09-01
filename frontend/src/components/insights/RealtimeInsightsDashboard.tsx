/**
 * BiteBase Intelligence Real-time Insights Dashboard 2.0
 * Enhanced with food delivery theme and advanced AI-powered insights
 * Main dashboard component for displaying and managing automated insights
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Filter, 
  Download, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Brain,
  ChefHat,
  Utensils,
  Target,
  Zap,
  Eye,
  BarChart3
} from 'lucide-react'

import {
  AnimatedButton,
  AnimatedCard,
  FloatingFoodIcons,
  staggerContainer,
  dashboardWidgetVariants
} from '@/components/animations'

import InsightCard from './components/InsightCard'
import useRealtimeInsights from './hooks/useRealtimeInsights'
import type { 
  RealtimeInsightsDashboardProps,
  InsightSearchParams,
  InsightFeedbackCreate,
  InsightResponse,
  InsightSeverityEnum,
  InsightStatusEnum,
  InsightTypeEnum
} from './types/insightsTypes'

const RealtimeInsightsDashboard: React.FC<RealtimeInsightsDashboardProps> = ({
  userId = 'current-user',
  restaurantId,
  autoRefresh = true,
  refreshInterval = 30000,
  showFilters = true,
  showMetrics = true,
  compact = false
}) => {
  // Hooks
  const {
    insights,
    isLoading,
    error,
    isConnected,
    connectionStatus,
    metrics,
    fetchInsights,
    updateInsight,
    submitFeedback,
    generateInsights,
    getMetrics,
    subscribeToRestaurant,
    clearError
  } = useRealtimeInsights(userId)

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Partial<InsightSearchParams>>({
    limit: 20,
    sort_by: 'detected_at',
    sort_order: 'desc'
  })
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectedInsights, setSelectedInsights] = useState<Set<string>>(new Set())

  // Filter insights based on search query
  const filteredInsights = insights.filter(insight => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      insight.title.toLowerCase().includes(query) ||
      insight.description.toLowerCase().includes(query) ||
      insight.explanation.toLowerCase().includes(query)
    )
  })

  // Group insights by severity for display
  const insightsBySeverity = filteredInsights.reduce((acc, insight) => {
    if (!acc[insight.severity]) {
      acc[insight.severity] = []
    }
    acc[insight.severity].push(insight)
    return acc
  }, {} as Record<InsightSeverityEnum, InsightResponse[]>)

  // Calculate summary statistics
  const summaryStats = {
    total: filteredInsights.length,
    active: filteredInsights.filter(i => i.status === 'active').length,
    critical: filteredInsights.filter(i => i.severity === 'critical').length,
    avgConfidence: filteredInsights.length > 0 
      ? filteredInsights.reduce((sum, i) => sum + i.confidence_score, 0) / filteredInsights.length 
      : 0
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await fetchInsights({
        ...filters,
        restaurant_id: restaurantId
      })
      
      if (showMetrics) {
        await getMetrics()
      }
    }

    loadData()
  }, [fetchInsights, getMetrics, showMetrics, restaurantId, filters])

  // Subscribe to restaurant updates
  useEffect(() => {
    if (restaurantId && isConnected) {
      subscribeToRestaurant(restaurantId)
    }
  }, [restaurantId, isConnected, subscribeToRestaurant])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      await fetchInsights({
        ...filters,
        restaurant_id: restaurantId
      })
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchInsights, filters, restaurantId])

  // Handle insight actions
  const handleAcknowledge = useCallback(async (insightId: string) => {
    try {
      await updateInsight(insightId, {
        status: 'acknowledged',
        acknowledged_by: userId
      })
    } catch (error) {
      console.error('Failed to acknowledge insight:', error)
    }
  }, [updateInsight, userId])

  const handleResolve = useCallback(async (insightId: string) => {
    try {
      await updateInsight(insightId, {
        status: 'resolved',
        resolved_by: userId
      })
    } catch (error) {
      console.error('Failed to resolve insight:', error)
    }
  }, [updateInsight, userId])

  const handleDismiss = useCallback(async (insightId: string) => {
    try {
      await updateInsight(insightId, {
        status: 'dismissed'
      })
    } catch (error) {
      console.error('Failed to dismiss insight:', error)
    }
  }, [updateInsight])

  const handleFeedback = useCallback(async (insightId: string, feedback: InsightFeedbackCreate) => {
    try {
      await submitFeedback(insightId, {
        ...feedback,
        user_id: userId
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }, [submitFeedback, userId])

  const handleGenerateInsights = useCallback(async () => {
    try {
      await generateInsights({
        restaurant_ids: restaurantId ? [restaurantId] : undefined,
        force_regenerate: true
      })
    } catch (error) {
      console.error('Failed to generate insights:', error)
    }
  }, [generateInsights, restaurantId])

  const handleRefresh = useCallback(async () => {
    await fetchInsights({
      ...filters,
      restaurant_id: restaurantId
    })
  }, [fetchInsights, filters, restaurantId])

  // Enhanced connection status indicator with food theme
  const ConnectionStatus = () => (
    <motion.div 
      className="flex items-center space-x-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className={`w-3 h-3 rounded-full shadow-md ${
          connectionStatus === 'connected' ? 'bg-food-green' : 
          connectionStatus === 'connecting' ? 'bg-food-yellow' : 
          'bg-food-red'
        }`}
        animate={{
          scale: connectionStatus === 'connecting' ? [1, 1.3, 1] : [1],
          opacity: connectionStatus === 'connecting' ? [1, 0.6, 1] : [1]
        }}
        transition={{
          duration: 1,
          repeat: connectionStatus === 'connecting' ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      <motion.span 
        className="text-xs font-medium capitalize flex items-center gap-1"
        style={{
          color: connectionStatus === 'connected' ? '#10B981' : 
                 connectionStatus === 'connecting' ? '#F59E0B' : 
                 '#EF4444'
        }}
        animate={{ opacity: [1, 0.8, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {connectionStatus === 'connected' ? '🟢' : 
         connectionStatus === 'connecting' ? '🟡' : '🔴'} 
        {connectionStatus === 'connected' ? 'AI Connected' :
         connectionStatus === 'connecting' ? 'Connecting...' :
         'Disconnected'}
      </motion.span>
    </motion.div>
  )

  return (
    <motion.div 
      className="space-y-6 relative"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Floating Food Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingFoodIcons className="opacity-5" />
      </div>

      {/* Enhanced Header */}
      <motion.div 
        className="flex items-center justify-between relative z-10"
        variants={dashboardWidgetVariants}
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="h-8 w-8 text-bitebase-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-bitebase-primary via-food-orange to-food-red bg-clip-text text-transparent">
              🧠 Real-time Food Intelligence
            </h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <ChefHat className="h-8 w-8 text-food-orange" />
            </motion.div>
          </motion.div>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            🤖 Automated <span className="text-bitebase-primary font-semibold">restaurant intelligence</span> and 
            <span className="text-food-orange font-semibold"> culinary anomaly detection</span> 🍽️
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ConnectionStatus />
          
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            animationType="bounce"
            leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
            className="bg-gradient-to-r from-bitebase-primary/10 to-food-orange/10 border-bitebase-primary/30"
          >
            🔄 Refresh
          </AnimatedButton>
          
          <AnimatedButton
            variant="delivery"
            size="sm"
            onClick={handleGenerateInsights}
            disabled={isLoading}
            animationType="delivery"
            leftIcon={<Zap className="h-4 w-4" />}
            className="bg-gradient-to-r from-food-orange to-food-red"
          >
            ⚡ Generate
          </AnimatedButton>
        </motion.div>
      </motion.div>

      {/* Enhanced Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <AnimatedCard
              variant="default"
              className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 overflow-hidden"
            >
              {/* Animated error background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-transparent"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <CardContent className="p-4 relative z-10">
                <motion.div 
                  className="flex items-center justify-between"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </motion.div>
                    <div>
                      <motion.p 
                        className="text-red-800 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        🚨 Intelligence System Alert
                      </motion.p>
                      <motion.span 
                        className="text-red-700 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {error}
                      </motion.span>
                    </div>
                  </div>
                  <AnimatedButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearError}
                    animationType="scale"
                    className="text-red-600 hover:text-red-700"
                  >
                    ✕
                  </AnimatedButton>
                </motion.div>
              </CardContent>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Summary Metrics */}
      <AnimatePresence>
        {showMetrics && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Total Insights Card */}
            <motion.div variants={dashboardWidgetVariants}>
              <AnimatedCard
                variant="dashboard"
                className="bg-gradient-to-br from-bitebase-primary/5 to-bitebase-primary/10 border-bitebase-primary/20 hover:border-bitebase-primary/40"
              >
                <CardContent className="p-4">
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="p-2 bg-bitebase-primary/10 rounded-lg"
                    >
                      <BarChart3 className="h-5 w-5 text-bitebase-primary" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        📊 Total Insights
                      </p>
                      <motion.p 
                        className="text-2xl font-bold text-bitebase-primary"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {summaryStats.total}
                      </motion.p>
                    </div>
                  </motion.div>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            {/* Active Insights Card */}
            <motion.div variants={dashboardWidgetVariants}>
              <AnimatedCard
                variant="dashboard"
                className="bg-gradient-to-br from-food-yellow/5 to-food-yellow/10 border-food-yellow/20 hover:border-food-yellow/40"
              >
                <CardContent className="p-4">
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="p-2 bg-food-yellow/10 rounded-lg"
                    >
                      <Clock className="h-5 w-5 text-food-yellow" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        ⏰ Active Insights
                      </p>
                      <motion.p 
                        className="text-2xl font-bold text-food-yellow"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        {summaryStats.active}
                      </motion.p>
                    </div>
                  </motion.div>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            {/* Critical Insights Card */}
            <motion.div variants={dashboardWidgetVariants}>
              <AnimatedCard
                variant="dashboard"
                className="bg-gradient-to-br from-food-red/5 to-food-red/10 border-food-red/20 hover:border-food-red/40"
              >
                <CardContent className="p-4">
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: summaryStats.critical > 0 ? [1, 1.2, 1] : [1],
                        rotate: summaryStats.critical > 0 ? [0, -10, 10, 0] : [0]
                      }}
                      transition={{ duration: 1, repeat: summaryStats.critical > 0 ? Infinity : 0 }}
                      className="p-2 bg-food-red/10 rounded-lg"
                    >
                      <AlertTriangle className="h-5 w-5 text-food-red" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        🚨 Critical Issues
                      </p>
                      <motion.p 
                        className="text-2xl font-bold text-food-red"
                        animate={{ 
                          scale: summaryStats.critical > 0 ? [1, 1.1, 1] : [1],
                        }}
                        transition={{ duration: 1.5, repeat: summaryStats.critical > 0 ? Infinity : 0 }}
                      >
                        {summaryStats.critical}
                      </motion.p>
                    </div>
                  </motion.div>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            {/* Confidence Score Card */}
            <motion.div variants={dashboardWidgetVariants}>
              <AnimatedCard
                variant="dashboard"
                className="bg-gradient-to-br from-food-green/5 to-food-green/10 border-food-green/20 hover:border-food-green/40"
              >
                <CardContent className="p-4">
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        y: [0, -2, 0]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="p-2 bg-food-green/10 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-food-green" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        🎯 AI Confidence
                      </p>
                      <motion.p 
                        className="text-2xl font-bold text-food-green"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                      >
                        {Math.round(summaryStats.avgConfidence * 100)}%
                      </motion.p>
                    </div>
                  </motion.div>
                </CardContent>
              </AnimatedCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Search and Filters */}
      <motion.div 
        className="flex items-center space-x-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div 
          className="flex-1 relative"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            animate={{
              x: [0, 2, -2, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-bitebase-primary" />
          </motion.div>
          <Input
            placeholder="🔍 Search food intelligence insights... (e.g., pizza trends, delivery metrics)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg border-2 border-bitebase-primary/30 focus:border-bitebase-primary transition-all duration-300 bg-gradient-to-r from-white to-bitebase-primary/5"
          />
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                animationType="scale"
              >
                ✕
              </AnimatedButton>
            </motion.div>
          )}
        </motion.div>
        
        {showFilters && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              animationType="bounce"
              leftIcon={<Filter className="h-4 w-4" />}
              className={`bg-gradient-to-r from-bitebase-primary/10 to-food-orange/10 border-bitebase-primary/30 ${
                showFiltersPanel ? 'border-bitebase-primary bg-bitebase-primary/20' : ''
              }`}
            >
              🎛️ {showFiltersPanel ? 'Hide' : 'Show'} Filters
            </AnimatedButton>
          </motion.div>
        )}

        {/* Search suggestions indicator */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-muted-foreground flex items-center gap-1"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔍
            </motion.div>
            Searching...
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <AnimatedCard 
              variant="dashboard"
              className="bg-gradient-to-br from-bitebase-primary/5 to-food-orange/5 border-bitebase-primary/20"
            >
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <CardTitle className="text-lg flex items-center gap-2 text-bitebase-primary">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      🎛️
                    </motion.div>
                    Food Intelligence Filters
                  </CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Severity Filter */}
                  <motion.div variants={dashboardWidgetVariants}>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      🚨 Severity Level
                    </label>
                    <motion.select
                      value={filters.severity || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        severity: e.target.value as InsightSeverityEnum || undefined
                      }))}
                      className="w-full p-3 border-2 border-bitebase-primary/30 focus:border-bitebase-primary rounded-lg bg-gradient-to-r from-white to-bitebase-primary/5 transition-all duration-300"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <option value="">🌟 All Severities</option>
                      <option value="critical">🔥 Critical</option>
                      <option value="high">⚠️ High</option>
                      <option value="medium">📊 Medium</option>
                      <option value="low">💡 Low</option>
                    </motion.select>
                  </motion.div>

                  {/* Status Filter */}
                  <motion.div variants={dashboardWidgetVariants}>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      📋 Status Type
                    </label>
                    <motion.select
                      value={filters.status || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        status: e.target.value as InsightStatusEnum || undefined
                      }))}
                      className="w-full p-3 border-2 border-bitebase-primary/30 focus:border-bitebase-primary rounded-lg bg-gradient-to-r from-white to-bitebase-primary/5 transition-all duration-300"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <option value="">📝 All Statuses</option>
                      <option value="active">⚡ Active</option>
                      <option value="acknowledged">👀 Acknowledged</option>
                      <option value="resolved">✅ Resolved</option>
                      <option value="dismissed">🚫 Dismissed</option>
                    </motion.select>
                  </motion.div>

                  {/* Type Filter */}
                  <motion.div variants={dashboardWidgetVariants}>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      🍽️ Insight Category
                    </label>
                    <motion.select
                      value={filters.insight_type || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        insight_type: e.target.value as InsightTypeEnum || undefined
                      }))}
                      className="w-full p-3 border-2 border-bitebase-primary/30 focus:border-bitebase-primary rounded-lg bg-gradient-to-r from-white to-bitebase-primary/5 transition-all duration-300"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <option value="">🎯 All Categories</option>
                      <option value="revenue_anomaly">💰 Revenue Anomaly</option>
                      <option value="customer_pattern_change">👥 Customer Patterns</option>
                      <option value="menu_performance">🍽️ Menu Performance</option>
                      <option value="seasonal_trend">📅 Seasonal Trends</option>
                      <option value="location_comparison">📍 Location Insights</option>
                      <option value="operational_insight">⚙️ Operations</option>
                    </motion.select>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="flex items-center justify-between mt-6 pt-4 border-t border-bitebase-primary/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({
                      limit: 20,
                      sort_by: 'detected_at',
                      sort_order: 'desc'
                    })}
                    animationType="bounce"
                    leftIcon="🧹"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All Filters
                  </AnimatedButton>
                  
                  <AnimatedButton
                    variant="delivery"
                    size="sm"
                    onClick={() => {
                      fetchInsights({
                        ...filters,
                        restaurant_id: restaurantId
                      })
                      setShowFiltersPanel(false)
                    }}
                    animationType="delivery"
                    leftIcon="🎯"
                    className="bg-gradient-to-r from-bitebase-primary to-food-orange"
                  >
                    Apply Filters
                  </AnimatedButton>
                </motion.div>
              </CardContent>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Insights List */}
      <motion.div 
        className="space-y-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {isLoading && filteredInsights.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <Brain className="h-12 w-12 text-bitebase-primary" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center"
            >
              <h3 className="text-xl font-semibold text-bitebase-primary mb-2">
                🧠 AI Brain Processing...
              </h3>
              <p className="text-muted-foreground">
                Analyzing your <span className="text-food-orange font-medium">food delivery data</span> for intelligent insights
              </p>
              <motion.div 
                className="flex justify-center items-center gap-2 mt-4"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {['🍕', '🍔', '🥗'].map((emoji, index) => (
                  <motion.span
                    key={emoji}
                    className="text-2xl"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        ) : filteredInsights.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedCard
              variant="default"
              className="bg-gradient-to-br from-bitebase-primary/5 to-food-orange/5 border-2 border-dashed border-bitebase-primary/30"
            >
              <CardContent className="p-16 text-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-6"
                >
                  <Eye className="h-16 w-16 text-bitebase-primary mx-auto" />
                </motion.div>
                
                <motion.h3 
                  className="text-2xl font-bold text-bitebase-primary mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  🔍 No Food Intelligence Found
                </motion.h3>
                
                <motion.p 
                  className="text-lg text-muted-foreground mb-6 max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {searchQuery 
                    ? (
                      <>
                        🎯 Try adjusting your search <span className="text-food-orange font-medium">"{searchQuery}"</span> or filters to find relevant insights
                      </>
                    ) : (
                      <>
                        🤖 Ready to generate <span className="text-bitebase-primary font-medium">AI-powered insights</span> for your restaurant data
                      </>
                    )}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <AnimatedButton 
                    onClick={handleGenerateInsights} 
                    disabled={isLoading}
                    variant="delivery"
                    size="lg"
                    animationType="delivery"
                    leftIcon={<Zap className="h-5 w-5" />}
                    className="bg-gradient-to-r from-bitebase-primary to-food-orange text-white px-8 py-3"
                  >
                    ⚡ Generate Food Intelligence
                  </AnimatedButton>
                </motion.div>
                
                {/* Food category suggestions */}
                <motion.div 
                  className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {[
                    { emoji: '🍕', label: 'Pizza Analytics' },
                    { emoji: '🚚', label: 'Delivery Trends' },
                    { emoji: '📊', label: 'Revenue Insights' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="p-3 bg-white/50 rounded-lg border border-bitebase-primary/20 text-center"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                        ease: "easeInOut"
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </AnimatedCard>
          </motion.div>
        ) : (
          // Enhanced Grouped Insights Display
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {Object.entries(insightsBySeverity)
              .sort(([a], [b]) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                return severityOrder[a as InsightSeverityEnum] - severityOrder[b as InsightSeverityEnum]
              })
              .map(([severity, severityInsights]) => (
                <motion.div 
                  key={severity}
                  variants={dashboardWidgetVariants}
                  className="space-y-4"
                >
                  {/* Enhanced Severity Header */}
                  <motion.div 
                    className="flex items-center space-x-3 mb-4"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: severity === 'critical' ? [1, 1.1, 1] : [1],
                        rotate: severity === 'critical' ? [0, -5, 5, 0] : [0]
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: severity === 'critical' ? Infinity : 0,
                        ease: "easeInOut" 
                      }}
                    >
                      <Badge className={`text-lg px-4 py-2 font-bold shadow-md ${
                        severity === 'critical' ? 'bg-gradient-to-r from-food-red to-red-600 text-white animate-pulse' :
                        severity === 'high' ? 'bg-gradient-to-r from-food-orange to-orange-600 text-white' :
                        severity === 'medium' ? 'bg-gradient-to-r from-food-yellow to-yellow-600 text-black' :
                        'bg-gradient-to-r from-bitebase-primary to-blue-600 text-white'
                      }`}>
                        {severity === 'critical' ? '🔥' : 
                         severity === 'high' ? '⚠️' : 
                         severity === 'medium' ? '📊' : '💡'} {severity.toUpperCase()} ({severityInsights.length})
                      </Badge>
                    </motion.div>
                    
                    {severity === 'critical' && severityInsights.length > 0 && (
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-sm text-food-red font-medium"
                      >
                        🚨 Requires immediate attention
                      </motion.div>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {severityInsights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } }
                        }}
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <InsightCard
                          insight={insight}
                          onAcknowledge={handleAcknowledge}
                          onResolve={handleResolve}
                          onDismiss={handleDismiss}
                          onFeedback={handleFeedback}
                          compact={compact}
                          showActions={true}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Load More */}
      <AnimatePresence>
        {filteredInsights.length >= (filters.limit || 20) && (
          <motion.div 
            className="text-center relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedButton
              variant="secondary"
              size="lg"
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  limit: (prev.limit || 20) + 20
                }))
              }}
              disabled={isLoading}
              animationType="bounce"
              leftIcon={isLoading ? undefined : "📈"}
              className="bg-gradient-to-r from-bitebase-primary/10 to-food-orange/10 border-bitebase-primary/30 hover:border-bitebase-primary px-8 py-4"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-5 w-5" />
                  Loading More Intelligence...
                </motion.div>
              ) : (
                '📊 Load More Food Insights'
              )}
            </AnimatedButton>
            
            {/* Load more hint */}
            <motion.p 
              className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-1"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🍽️
              </motion.span>
              Discover more culinary insights from your data
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating food decorations */}
      <motion.div 
        className="fixed bottom-6 left-6 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-4xl"
        >
          🧠
        </motion.div>
      </motion.div>

      <motion.div 
        className="fixed bottom-6 right-6 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5 }}
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-3xl"
        >
          📊
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default RealtimeInsightsDashboard