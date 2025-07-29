/**
 * BiteBase Intelligence Insight Card Component 2.0
 * Enhanced with food delivery theme and advanced animations
 * Displays individual insights with actions and feedback
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Clock,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Settings,
  ChefHat,
  Utensils,
  Pizza,
  Truck
} from 'lucide-react'
import {
  AnimatedButton,
  AnimatedCard
} from '@/components/animations'
import type { 
  InsightCardProps, 
  InsightResponse, 
  InsightSeverityEnum, 
  InsightTypeEnum,
  InsightStatusEnum 
} from '../types/insightsTypes'

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onAcknowledge,
  onResolve,
  onDismiss,
  onFeedback,
  onView,
  compact = false,
  showActions = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get severity color and icon
  const getSeverityConfig = (severity: InsightSeverityEnum) => {
    switch (severity) {
      case 'critical':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: AlertTriangle, 
          iconColor: 'text-red-600' 
        }
      case 'high':
        return { 
          color: 'bg-orange-100 text-orange-800 border-orange-200', 
          icon: AlertTriangle, 
          iconColor: 'text-orange-600' 
        }
      case 'medium':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: AlertTriangle, 
          iconColor: 'text-yellow-600' 
        }
      case 'low':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: AlertTriangle, 
          iconColor: 'text-blue-600' 
        }
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: AlertTriangle, 
          iconColor: 'text-gray-600' 
        }
    }
  }

  // Get insight type icon with food theme
  const getTypeIcon = (type: InsightTypeEnum) => {
    switch (type) {
      case 'revenue_anomaly':
        return DollarSign
      case 'customer_pattern_change':
        return Users
      case 'menu_performance':
        return ChefHat
      case 'seasonal_trend':
        return Calendar
      case 'location_comparison':
        return Truck
      case 'operational_insight':
        return Utensils
      default:
        return Pizza
    }
  }

  // Get food-themed emoji for insight type
  const getTypeEmoji = (type: InsightTypeEnum) => {
    switch (type) {
      case 'revenue_anomaly':
        return '💰'
      case 'customer_pattern_change':
        return '👥'
      case 'menu_performance':
        return '🍽️'
      case 'seasonal_trend':
        return '📅'
      case 'location_comparison':
        return '🚚'
      case 'operational_insight':
        return '⚙️'
      default:
        return '🍕'
    }
  }

  // Get status config
  const getStatusConfig = (status: InsightStatusEnum) => {
    switch (status) {
      case 'active':
        return { color: 'bg-blue-100 text-blue-800', label: 'Active' }
      case 'acknowledged':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Acknowledged' }
      case 'resolved':
        return { color: 'bg-green-100 text-green-800', label: 'Resolved' }
      case 'dismissed':
        return { color: 'bg-gray-100 text-gray-800', label: 'Dismissed' }
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' }
    }
  }

  const severityConfig = getSeverityConfig(insight.severity)
  const TypeIcon = getTypeIcon(insight.insight_type)
  const statusConfig = getStatusConfig(insight.status)
  const SeverityIcon = severityConfig.icon

  const handleAction = async (action: () => void) => {
    setIsLoading(true)
    try {
      await action()
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = () => {
    if (onView) {
      onView(insight.id)
    }
    setIsExpanded(!isExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatScore = (score: number) => {
    return `${Math.round(score * 100)}%`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="relative"
    >
      <AnimatedCard 
        variant="dashboard"
        className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
          compact ? 'p-2' : 'p-0'
        } ${
          insight.severity === 'critical' ? 'border-food-red/30 bg-gradient-to-br from-food-red/5 to-red-50' :
          insight.severity === 'high' ? 'border-food-orange/30 bg-gradient-to-br from-food-orange/5 to-orange-50' :
          insight.severity === 'medium' ? 'border-food-yellow/30 bg-gradient-to-br from-food-yellow/5 to-yellow-50' :
          'border-bitebase-primary/30 bg-gradient-to-br from-bitebase-primary/5 to-blue-50'
        }`}
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute top-0 right-0 w-24 h-24 opacity-10"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className={`w-full h-full rounded-full ${
            insight.severity === 'critical' ? 'bg-food-red' :
            insight.severity === 'high' ? 'bg-food-orange' :
            insight.severity === 'medium' ? 'bg-food-yellow' :
            'bg-bitebase-primary'
          }`} />
        </motion.div>

        <CardHeader className={`${compact ? 'pb-2' : 'pb-4'} relative z-10`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {/* Enhanced severity indicator */}
              <motion.div 
                className={`p-3 rounded-xl shadow-md ${severityConfig.color} relative`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{ 
                    scale: insight.severity === 'critical' ? [1, 1.2, 1] : [1],
                    rotate: insight.severity === 'critical' ? [0, -10, 10, 0] : [0]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: insight.severity === 'critical' ? Infinity : 0 
                  }}
                >
                  <SeverityIcon className={`h-5 w-5 ${severityConfig.iconColor}`} />
                </motion.div>
                {insight.severity === 'critical' && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-food-red rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                {/* Enhanced title with food emoji */}
                <motion.div 
                  className="flex items-center space-x-2 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.span
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-lg"
                  >
                    {getTypeEmoji(insight.insight_type)}
                  </motion.span>
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className={`${compact ? 'text-sm' : 'text-base'} font-bold truncate bg-gradient-to-r ${
                    insight.severity === 'critical' ? 'from-food-red to-red-600' :
                    insight.severity === 'high' ? 'from-food-orange to-orange-600' :
                    insight.severity === 'medium' ? 'from-food-yellow to-yellow-600' :
                    'from-bitebase-primary to-blue-600'
                  } bg-clip-text text-transparent`}>
                    {insight.title}
                  </CardTitle>
                </motion.div>
                
                {/* Enhanced badges */}
                <motion.div 
                  className="flex items-center space-x-2 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Badge className={`${severityConfig.color} shadow-sm font-bold`}>
                      {insight.severity === 'critical' ? '🔥' : 
                       insight.severity === 'high' ? '⚠️' : 
                       insight.severity === 'medium' ? '📊' : '💡'} {insight.severity.toUpperCase()}
                    </Badge>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Badge className={`${statusConfig.color} shadow-sm`}>
                      {insight.status === 'active' ? '⚡' :
                       insight.status === 'acknowledged' ? '👀' :
                       insight.status === 'resolved' ? '✅' : '🚫'} {statusConfig.label}
                    </Badge>
                  </motion.div>
                  <motion.span 
                    className="text-xs text-muted-foreground flex items-center gap-1"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🕒 {formatDate(insight.detected_at)}
                  </motion.span>
                </motion.div>
                
                {!compact && (
                  <motion.p 
                    className="text-sm text-muted-foreground line-clamp-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {insight.description}
                  </motion.p>
                )}
              </div>
            </div>

            {!compact && (
              <div>
                {/* Enhanced action area */}
                <motion.div
              className="flex items-center space-x-2 ml-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {insight.views_count > 0 && (
                <motion.div 
                  className="flex items-center space-x-1 text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Eye className="h-3 w-3" />
                  <span className="font-medium">{insight.views_count}</span>
                </motion.div>
              )}
              
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={handleView}
                animationType="scale"
                className="h-10 w-10 p-0 bg-white/70 hover:bg-white/90 shadow-sm"
                title={isExpanded ? "Collapse details" : "View details"}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Eye className="h-4 w-4" />
                </motion.div>
              </AnimatedButton>
                </motion.div>
              </div>
            )}
          </div>

        {!compact && (
          <motion.div 
            className="flex items-center space-x-6 text-xs mt-3 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-muted-foreground">🎯 Confidence:</span>
              <motion.span 
                className="font-bold text-bitebase-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatScore(insight.confidence_score)}
              </motion.span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-muted-foreground">💥 Impact:</span>
              <motion.span 
                className="font-bold text-food-orange"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {formatScore(insight.impact_score)}
              </motion.span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-muted-foreground">⚡ Urgency:</span>
              <motion.span 
                className="font-bold text-food-red"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                {formatScore(insight.urgency_score)}
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Detailed Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </div>

            {/* AI Explanation */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Analysis</h4>
              <p className="text-sm text-gray-600">{insight.explanation}</p>
            </div>

            {/* Recommendations */}
            {insight.recommendations && insight.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {insight.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Points */}
            {insight.data_points && Object.keys(insight.data_points).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(insight.data_points).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anomalies */}
            {insight.anomalies && insight.anomalies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Detected Anomalies</h4>
                <div className="space-y-2">
                  {insight.anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{anomaly.metric_name}</span>
                        <span className="text-red-600">
                          {anomaly.metric_value.toFixed(2)}
                          {anomaly.expected_value && ` (expected: ${anomaly.expected_value.toFixed(2)})`}
                        </span>
                      </div>
                      <div className="text-gray-600 mt-1">
                        Algorithm: {anomaly.detection_algorithm}
                        {anomaly.z_score && ` | Z-score: ${anomaly.z_score.toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Feedback */}
            {insight.user_feedback && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Feedback</h4>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  {insight.user_rating && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span>Rating:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= insight.user_rating! ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-gray-600">{insight.user_feedback}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Enhanced Actions */}
      <AnimatePresence>
        {showActions && insight.status === 'active' && (
          <motion.div 
            className="px-6 pb-6 relative z-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="flex items-center justify-center space-x-3 pt-4 border-t border-bitebase-primary/20"
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { 
                    staggerChildren: 0.1,
                    delayChildren: 0.2
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {onAcknowledge && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 10 },
                    visible: { opacity: 1, scale: 1, y: 0 }
                  }}
                >
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction(() => onAcknowledge(insight.id))}
                    disabled={isLoading}
                    animationType="bounce"
                    leftIcon={<CheckCircle className="h-3 w-3" />}
                    className="bg-gradient-to-r from-food-yellow/20 to-yellow-100 border-food-yellow/40 text-food-yellow hover:bg-food-yellow/30"
                  >
                    👀 Acknowledge
                  </AnimatedButton>
                </motion.div>
              )}
              
              {onResolve && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 10 },
                    visible: { opacity: 1, scale: 1, y: 0 }
                  }}
                >
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction(() => onResolve(insight.id))}
                    disabled={isLoading}
                    animationType="delivery"
                    leftIcon={<CheckCircle className="h-3 w-3" />}
                    className="bg-gradient-to-r from-food-green/20 to-green-100 border-food-green/40 text-food-green hover:bg-food-green/30"
                  >
                    ✅ Resolve
                  </AnimatedButton>
                </motion.div>
              )}
              
              {onDismiss && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 10 },
                    visible: { opacity: 1, scale: 1, y: 0 }
                  }}
                >
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction(() => onDismiss(insight.id))}
                    disabled={isLoading}
                    animationType="scale"
                    leftIcon={<XCircle className="h-3 w-3" />}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 text-gray-600 hover:bg-gray-200"
                  >
                    🚫 Dismiss
                  </AnimatedButton>
                </motion.div>
              )}
              
              {onFeedback && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 10 },
                    visible: { opacity: 1, scale: 1, y: 0 }
                  }}
                >
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => onFeedback(insight.id, {
                      insight_id: insight.id,
                      user_id: 'current-user',
                      rating: 5,
                      feedback_text: ''
                    })}
                    disabled={isLoading}
                    animationType="bounce"
                    leftIcon={<MessageSquare className="h-3 w-3" />}
                    className="bg-gradient-to-r from-bitebase-primary/20 to-blue-100 border-bitebase-primary/40 text-bitebase-primary hover:bg-bitebase-primary/30"
                  >
                    💬 Feedback
                  </AnimatedButton>
                </motion.div>
              )}
            </motion.div>

            {/* Action status indicator */}
            {isLoading && (
              <motion.div
                className="flex items-center justify-center mt-3 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  🔄
                </motion.div>
                Processing action...
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Status indicators for non-active insights */}
      <AnimatePresence>
        {insight.status !== 'active' && (
          <motion.div 
            className="px-6 pb-6 relative z-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="flex items-center justify-between pt-4 border-t border-muted/30 text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="flex items-center space-x-6"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { 
                    opacity: 1,
                    transition: { 
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="visible"
              >
                {insight.acknowledged_at && (
                  <motion.div 
                    className="flex items-center space-x-2 bg-food-yellow/20 px-3 py-2 rounded-lg"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Clock className="h-3 w-3 text-food-yellow" />
                    <span className="text-food-yellow font-medium">
                      👀 Acknowledged {formatDate(insight.acknowledged_at)}
                    </span>
                  </motion.div>
                )}
                {insight.resolved_at && (
                  <motion.div 
                    className="flex items-center space-x-2 bg-food-green/20 px-3 py-2 rounded-lg"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <CheckCircle className="h-3 w-3 text-food-green" />
                    <span className="text-food-green font-medium">
                      ✅ Resolved {formatDate(insight.resolved_at)}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Success celebration for resolved insights */}
              {insight.status === 'resolved' && (
                <motion.div
                  className="text-2xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🎉
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </AnimatedCard>
    </motion.div>
  )
}

export default InsightCard