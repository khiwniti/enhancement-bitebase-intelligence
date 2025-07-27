/**
 * BiteBase Intelligence Natural Language Query Interface
 * Main component for natural language query processing and visualization
 */

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Mic, MicOff, Loader2, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNLQuery } from './hooks/useNLQuery'
import { QuerySuggestions } from './components/QuerySuggestions'
import { QueryResults } from './components/QueryResults'
import { QueryHistory } from './components/QueryHistory'
import { ConfidenceIndicator } from './components/ConfidenceIndicator'
import { VoiceInput } from './components/VoiceInput'
import type { NLQueryRequest, NLQueryResponse } from './types/nlQueryTypes'

interface NaturalLanguageQueryInterfaceProps {
  onChartGenerated?: (chartData: Record<string, unknown>) => void
  onAddToDashboard?: (chartConfig: Record<string, unknown>) => void
  className?: string
}

export const NaturalLanguageQueryInterface: React.FC<NaturalLanguageQueryInterfaceProps> = ({
  onChartGenerated,
  onAddToDashboard,
  className = ''
}) => {
  // State management
  const [query, setQuery] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Custom hook for NL query processing
  const {
    processQuery,
    validateQuery,
    getSuggestions,
    getHistory,
    isLoading,
    error,
    result,
    suggestions,
    history,
    clearError
  } = useNLQuery()

  // Handle query submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    try {
      const request: NLQueryRequest = {
        query: query.trim(),
        context: {
          user_preferences: {},
          dashboard_context: {},
          previous_queries: history?.queries.slice(0, 5) || []
        },
        auto_execute: true,
        include_suggestions: true
      }

      const response = await processQuery(request)
      
      if (response && onChartGenerated) {
        onChartGenerated(response.chart_data)
      }
      
      // Clear query on successful submission
      setQuery('')
      setShowSuggestions(false)
    } catch (err) {
      console.error('Query processing failed:', err)
    }
  }, [query, isLoading, processQuery, onChartGenerated, history])

  // Handle query validation as user types
  const handleQueryChange = useCallback(async (value: string) => {
    setQuery(value)
    
    if (value.length > 3) {
      // Get suggestions for auto-complete
      await getSuggestions(value)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [getSuggestions])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [])

  // Handle voice input
  const handleVoiceInput = useCallback((transcript: string) => {
    setQuery(transcript)
    setIsVoiceActive(false)
  }, [])

  // Handle example query selection
  const handleExampleSelect = useCallback((example: string) => {
    setQuery(example)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [])

  // Load suggestions and history on mount
  useEffect(() => {
    getSuggestions()
    getHistory()
  }, [getSuggestions, getHistory])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className={`nl-query-interface space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ask BiteBase Intelligence
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ask questions about your restaurant data in natural language
        </p>
      </div>

      {/* Main Query Input */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g., Show me revenue trends by location for Q4"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                  disabled={isLoading}
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5 animate-spin" />
                )}
              </div>
              
              {/* Voice Input Button */}
              <VoiceInput
                onTranscript={handleVoiceInput}
                isActive={isVoiceActive}
                onActiveChange={setIsVoiceActive}
              />
              
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="px-6 py-3"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Ask'
                )}
              </Button>
            </div>

            {/* Query Suggestions Dropdown */}
            {showSuggestions && suggestions && suggestions.suggestions.length > 0 && (
              <QuerySuggestions
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </div>

          {/* Quick Examples */}
          {!query && suggestions?.examples && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Lightbulb className="h-4 w-4 mr-1" />
                Try these examples:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.examples.slice(0, 3).map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleSelect(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="mt-2 text-red-600 hover:text-red-700"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Query Results */}
      {result && (
        <QueryResults
          result={result}
          onAddToDashboard={onAddToDashboard}
          onRegenerateChart={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
        />
      )}

      {/* Query History Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {showHistory ? 'Hide' : 'Show'} Query History
        </Button>
      </div>

      {/* Query History */}
      {showHistory && history && (
        <QueryHistory
          history={history}
          onQuerySelect={handleExampleSelect}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}

export default NaturalLanguageQueryInterface