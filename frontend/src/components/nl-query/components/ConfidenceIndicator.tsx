/**
 * BiteBase Intelligence Confidence Indicator Component
 * Displays confidence scoring for natural language query results
 */

'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ConfidenceIndicatorProps } from '../types/nlQueryTypes'

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  showDetails = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails)

  // Get confidence level and color
  const getConfidenceLevel = (score: number) => {
    if (score >= 0.8) return { level: 'High', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (score >= 0.6) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { level: 'Low', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  // Get confidence icon
  const getConfidenceIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (score >= 0.6) return <Info className="h-4 w-4 text-yellow-500" />
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const overallConfidence = getConfidenceLevel(confidence.overall_confidence)

  return (
    <Card className="p-4">
      {/* Overall Confidence Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getConfidenceIcon(confidence.overall_confidence)}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Query Confidence
            </h4>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={`${overallConfidence.bgColor} ${overallConfidence.color}`}
              >
                {overallConfidence.level}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(confidence.overall_confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1"
        >
          <span className="text-xs">Details</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-3">
        <Progress 
          value={confidence.overall_confidence * 100} 
          className="h-2"
        />
      </div>

      {/* Detailed Breakdown */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Individual Confidence Scores */}
          <div className="space-y-3">
            <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Confidence Breakdown
            </h5>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Intent Recognition</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={confidence.intent_confidence * 100} 
                    className="h-1 w-16"
                  />
                  <span className="text-xs text-gray-500 w-8">
                    {Math.round(confidence.intent_confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Entity Extraction</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={confidence.entity_confidence * 100} 
                    className="h-1 w-16"
                  />
                  <span className="text-xs text-gray-500 w-8">
                    {Math.round(confidence.entity_confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">SQL Generation</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={confidence.sql_confidence * 100} 
                    className="h-1 w-16"
                  />
                  <span className="text-xs text-gray-500 w-8">
                    {Math.round(confidence.sql_confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Data Availability</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={confidence.data_availability_confidence * 100} 
                    className="h-1 w-16"
                  />
                  <span className="text-xs text-gray-500 w-8">
                    {Math.round(confidence.data_availability_confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Factors */}
          {confidence.factors.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Contributing Factors
              </h5>
              
              <div className="space-y-2">
                {confidence.factors.map((factor, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {factor.factor.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Weight: {Math.round(factor.weight * 100)}%
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConfidenceLevel(factor.score).color}`}
                        >
                          {Math.round(factor.score * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {factor.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Tips for better results:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Be specific about time periods (e.g., "last month", "Q4 2023")</li>
                  <li>• Include location details when relevant</li>
                  <li>• Use clear metric names (e.g., "revenue", "customer count")</li>
                  <li>• Specify comparison criteria when needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ConfidenceIndicator