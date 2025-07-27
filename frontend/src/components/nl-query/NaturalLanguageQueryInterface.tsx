/**
 * BiteBase Intelligence Natural Language Query Interface 2.0
 * Enhanced with food delivery theme and advanced animations
 * Main component for natural language query processing and visualization
 */

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, MicOff, Loader2, AlertCircle, CheckCircle, Lightbulb, ChefHat, Utensils, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AnimatedButton,
  AnimatedCard,
  FloatingFoodIcons,
  staggerContainer,
  menuCardVariants
} from '@/components/animations'
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
    <motion.div 
      className={`nl-query-interface space-y-6 relative ${className}`}
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
        className="text-center space-y-4 relative z-10"
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { delay: 0.2 } }
        }}
      >
        <motion.div 
          className="flex items-center justify-center gap-3 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChefHat className="h-8 w-8 text-bitebase-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-bitebase-primary via-food-orange to-food-red bg-clip-text text-transparent">
            🍽️ Ask BiteBase Intelligence
          </h2>
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Utensils className="h-8 w-8 text-food-orange" />
          </motion.div>
        </motion.div>
        
        <motion.p 
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          🤖 Ask questions about your <span className="text-bitebase-primary font-semibold">restaurant data</span>, 
          <span className="text-food-orange font-semibold"> food delivery trends</span>, and 
          <span className="text-food-red font-semibold"> culinary insights</span> in natural language! 🚀
        </motion.p>

        {/* Food category indicators */}
        <motion.div 
          className="flex justify-center items-center gap-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {['🍕', '🍔', '🍜', '🥗', '🍰'].map((emoji, index) => (
            <motion.div
              key={emoji}
              className="text-2xl"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.3, rotate: 360 }}
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Enhanced Main Query Input */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { delay: 0.4 } }
        }}
      >
        <AnimatedCard 
          variant="dashboard" 
          className="p-6 relative overflow-hidden border-2 border-bitebase-primary/20"
        >
          {/* Animated background pattern */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-bitebase-primary/10 to-food-orange/10 rounded-full -translate-y-16 translate-x-16"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Food-themed corner decorations */}
          <motion.div
            className="absolute top-4 right-4 text-3xl"
            animate={{
              y: [0, -5, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🍽️
          </motion.div>
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              <motion.div 
                className="flex items-center space-x-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div 
                  className="relative flex-1"
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1, transition: { delay: 0.1 } }
                  }}
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bitebase-primary h-5 w-5" />
                  </motion.div>
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="🍕 e.g., Show me pizza delivery trends in NYC for Q4 | 🎤 Click mic for voice input"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    className="pl-10 pr-4 py-3 text-lg border-2 border-bitebase-primary/30 focus:border-bitebase-primary transition-all duration-300 bg-gradient-to-r from-white to-bitebase-primary/5"
                    disabled={isLoading}
                  />
                  {isLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-food-orange h-5 w-5" />
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Enhanced Voice Input Button */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1, transition: { delay: 0.2 } }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <VoiceInput
                    onTranscript={handleVoiceInput}
                    isActive={isVoiceActive}
                    onActiveChange={setIsVoiceActive}
                  />
                </motion.div>
                
                {/* Enhanced Submit Button */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1, transition: { delay: 0.3 } }
                  }}
                >
                  <AnimatedButton
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    variant="delivery"
                    size="lg"
                    animationType="delivery"
                    className="px-6 py-3"
                    leftIcon={isLoading ? undefined : <MessageCircle className="h-5 w-5" />}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      '🤖 Ask AI'
                    )}
                  </AnimatedButton>
                </motion.div>
              </motion.div>

              {/* Enhanced Query Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions && suggestions.suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <QuerySuggestions
                      suggestions={suggestions}
                      onSelect={handleSuggestionSelect}
                      onClose={() => setShowSuggestions(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Quick Examples */}
            <AnimatePresence>
              {!query && suggestions?.examples && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.p 
                    className="text-sm text-muted-foreground flex items-center justify-center gap-2"
                    animate={{
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Lightbulb className="h-4 w-4 text-food-yellow" />
                    </motion.div>
                    ✨ Try these food intelligence examples:
                  </motion.p>
                  <motion.div 
                    className="flex flex-wrap gap-3 justify-center"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {suggestions.examples.slice(0, 4).map((example, index) => (
                      <motion.div
                        key={index}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8 },
                          visible: { opacity: 1, scale: 1, transition: { delay: index * 0.1 } }
                        }}
                      >
                        <AnimatedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleExampleSelect(example)}
                          className="text-xs bg-gradient-to-r from-bitebase-primary/5 to-food-orange/5 border-bitebase-primary/30"
                          animationType="bounce"
                          leftIcon={['🍕', '🍔', '📊', '🗺️'][index]}
                        >
                          {example}
                        </AnimatedButton>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Food intelligence categories */}
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {[
                      { icon: '🍕', label: 'Pizza Trends', query: 'Show me pizza delivery trends' },
                      { icon: '🍔', label: 'Burger Analytics', query: 'Analyze burger sales by location' },
                      { icon: '🥗', label: 'Healthy Options', query: 'Healthy food performance metrics' },
                      { icon: '☕', label: 'Beverage Sales', query: 'Coffee and drink revenue analysis' }
                    ].map((category, index) => (
                      <motion.div
                        key={category.label}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0, transition: { delay: 1.0 + index * 0.1 } }
                        }}
                      >
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExampleSelect(category.query)}
                          className="w-full h-auto p-3 flex flex-col items-center gap-2 bg-gradient-to-br from-white to-bitebase-primary/5 border border-bitebase-primary/20 hover:border-bitebase-primary/40"
                          animationType="food"
                        >
                          <span className="text-2xl">{category.icon}</span>
                          <span className="text-xs font-medium">{category.label}</span>
                        </AnimatedButton>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Enhanced Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-lg relative overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Error background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-transparent"
                  animate={{
                    x: [-100, 100],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <motion.div 
                  className="flex items-start space-x-2 relative z-10"
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.p 
                      className="text-sm text-red-700 dark:text-red-400 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      🚨 {error}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={clearError}
                        className="mt-2 text-red-600 hover:text-red-700"
                        animationType="scale"
                        leftIcon="✕"
                      >
                        Dismiss
                      </AnimatedButton>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedCard>
      </motion.div>

      {/* Enhanced Query Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <QueryResults
              result={result}
              onAddToDashboard={onAddToDashboard}
              onRegenerateChart={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Query History Toggle */}
      <motion.div 
        className="flex justify-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <AnimatedButton
          variant="ghost"
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-muted-foreground hover:text-foreground"
          animationType="bounce"
          leftIcon={showHistory ? "📝" : "📚"}
        >
          {showHistory ? '🔽 Hide' : '📜 Show'} Query History
        </AnimatedButton>
      </motion.div>

      {/* Enhanced Query History */}
      <AnimatePresence>
        {showHistory && history && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <QueryHistory
              history={history}
              onQuerySelect={handleExampleSelect}
              onClose={() => setShowHistory(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food-themed success indicators */}
      <motion.div 
        className="fixed bottom-6 right-6 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-4xl"
        >
          🍽️
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default NaturalLanguageQueryInterface