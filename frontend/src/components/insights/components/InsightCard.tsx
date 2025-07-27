/**
 * BiteBase Intelligence Insight Card Component
 * Displays individual insights with actions and feedback
 */

import React, { useState } from 'react'
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
  Settings
} from 'lucide-react'
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

  // Get insight type icon
  const getTypeIcon = (type: InsightTypeEnum) => {
    switch (type) {
      case 'revenue_anomaly':
        return DollarSign
      case 'customer_pattern_change':
        return Users
      case 'menu_performance':
        return BarChart3
      case 'seasonal_trend':
        return Calendar
      case 'location_comparison':
        return MapPin
      case 'operational_insight':
        return Settings
      default:
        return BarChart3
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
    <Card className={`transition-all duration-200 hover:shadow-md ${compact ? 'p-2' : 'p-4'}`}>
      <CardHeader className={`${compact ? 'pb-2' : 'pb-4'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${severityConfig.color}`}>
              <SeverityIcon className={`h-4 w-4 ${severityConfig.iconColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <TypeIcon className="h-4 w-4 text-gray-500" />
                <CardTitle className={`${compact ? 'text-sm' : 'text-base'} font-semibold truncate`}>
                  {insight.title}
                </CardTitle>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={severityConfig.color}>
                  {insight.severity.toUpperCase()}
                </Badge>
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDate(insight.detected_at)}
                </span>
              </div>
              
              {!compact && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {insight.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {insight.views_count > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Eye className="h-3 w-3" />
                <span>{insight.views_count}</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleView}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!compact && (
          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
            <div className="flex items-center space-x-1">
              <span>Confidence:</span>
              <span className="font-medium">{formatScore(insight.confidence_score)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Impact:</span>
              <span className="font-medium">{formatScore(insight.impact_score)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Urgency:</span>
              <span className="font-medium">{formatScore(insight.urgency_score)}</span>
            </div>
          </div>
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

      {/* Actions */}
      {showActions && insight.status === 'active' && (
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-2 pt-2 border-t">
            {onAcknowledge && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(() => onAcknowledge(insight.id))}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Acknowledge</span>
              </Button>
            )}
            
            {onResolve && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(() => onResolve(insight.id))}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Resolve</span>
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(() => onDismiss(insight.id))}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <XCircle className="h-3 w-3" />
                <span>Dismiss</span>
              </Button>
            )}
            
            {onFeedback && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFeedback(insight.id, {
                  insight_id: insight.id,
                  user_id: 'current-user', // This would come from auth context
                  rating: 5,
                  feedback_text: ''
                })}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Feedback</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Status indicators for non-active insights */}
      {insight.status !== 'active' && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {insight.acknowledged_at && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Acknowledged {formatDate(insight.acknowledged_at)}</span>
                </div>
              )}
              {insight.resolved_at && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Resolved {formatDate(insight.resolved_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default InsightCard