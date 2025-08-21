"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, ArrowRight, ArrowLeft, MapPin, Bot, BarChart3, FileText, Sparkles } from 'lucide-react'
import { markTourCompleted, markTourSkipped, shouldShowTour, isFirstTimeUser } from '@/utils/tourUtils'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  icon: React.ReactNode
  action?: string
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BiteBase! 🍽️',
    description: 'Your AI-powered restaurant business intelligence platform. Let\'s take a quick tour to show you around.',
    target: 'body',
    position: 'bottom',
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 'dashboard',
    title: 'Market Intelligence Dashboard',
    description: 'Get real-time insights about market opportunities, competition levels, and revenue potential for your restaurant concept.',
    target: '[data-tour="dashboard"]',
    position: 'right',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: 'map-analysis',
    title: 'Interactive Location Analysis',
    description: 'Click anywhere on the map to analyze restaurant opportunities. Our AI will provide detailed market research for any location.',
    target: '[data-tour="map-analysis"]',
    position: 'right',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'ai-assistant',
    title: 'AI Market Assistant',
    description: 'Chat with our AI to get instant insights about demographics, competitor analysis, pricing strategies, and market opportunities.',
    target: '[data-tour="ai-chat"]',
    position: 'left',
    icon: <Bot className="w-5 h-5" />
  },
  {
    id: 'reports',
    title: 'Generate Detailed Reports',
    description: 'Create comprehensive market analysis reports with AI-powered insights, competitor data, and location recommendations.',
    target: '[data-tour="reports"]',
    position: 'right',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'restaurant-setup',
    title: 'Restaurant Setup Wizard',
    description: 'Use our step-by-step wizard to plan your restaurant concept, analyze locations, and get AI recommendations.',
    target: '[data-tour="restaurant-setup"]',
    position: 'bottom',
    icon: <Sparkles className="w-5 h-5" />,
    action: 'Try the Restaurant Setup'
  }
]

interface WebTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  isFirstTimeUser?: boolean
}

export function WebTour({ isOpen, onClose, onComplete, isFirstTimeUser = false }: WebTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tourPosition, setTourPosition] = useState({ top: 0, left: 0 })
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      const targetElement = document.querySelector(tourSteps[currentStep].target)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        const position = calculatePosition(rect, tourSteps[currentStep].position)
        setTourPosition(position)

        // Scroll element into view
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

        // Add highlight effect
        targetElement.classList.add('tour-highlight')

        return () => {
          targetElement.classList.remove('tour-highlight')
        }
      }
    }
  }, [currentStep, isOpen])

  const calculatePosition = (rect: DOMRect, position: string) => {
    const offset = 20
    const cardWidth = 320 // Approximate card width
    const cardHeight = 300 // Approximate card height
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let top = 0
    let left = 0
    
    switch (position) {
      case 'top':
        top = Math.max(offset, rect.top - cardHeight - offset)
        left = Math.max(offset, Math.min(viewportWidth - cardWidth - offset, rect.left + rect.width / 2 - cardWidth / 2))
        break
      case 'bottom':
        top = Math.min(viewportHeight - cardHeight - offset, rect.bottom + offset)
        left = Math.max(offset, Math.min(viewportWidth - cardWidth - offset, rect.left + rect.width / 2 - cardWidth / 2))
        break
      case 'left':
        top = Math.max(offset, Math.min(viewportHeight - cardHeight - offset, rect.top + rect.height / 2 - cardHeight / 2))
        left = Math.max(offset, rect.left - cardWidth - offset)
        break
      case 'right':
        top = Math.max(offset, Math.min(viewportHeight - cardHeight - offset, rect.top + rect.height / 2 - cardHeight / 2))
        left = Math.min(viewportWidth - cardWidth - offset, rect.right + offset)
        break
      default:
        top = Math.min(viewportHeight - cardHeight - offset, rect.bottom + offset)
        left = Math.max(offset, Math.min(viewportWidth - cardWidth - offset, rect.left))
    }
    
    return { top, left }
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    onComplete()
    onClose()
    // Mark tour as completed using utility function
    markTourCompleted(dontShowAgain)
  }

  const skipTour = () => {
    onClose()
    // Mark tour as skipped using utility function
    markTourSkipped(dontShowAgain)
  }

  if (!isOpen) return null

  const step = tourSteps[currentStep]

  return (
    <>
      {/* Overlay - Allow clicks to close tour */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-pointer"
        onClick={onClose}
        title="Click anywhere to close tour"
      />

      {/* Tour Active Indicator */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
        🎯 Interactive Tour Active - Click anywhere to close or use buttons below
      </div>

      {/* Tour Card */}
      <div
        className="fixed z-50 w-80 sm:w-96 pointer-events-auto"
        style={{
          top: `${tourPosition.top}px`,
          left: `${tourPosition.left}px`,
          maxWidth: '90vw',
          maxHeight: '80vh'
        }}
      >
        <Card className="shadow-2xl border-2 border-primary-200 bg-white overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600 flex-shrink-0">
                  {step.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg truncate">{step.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 overflow-hidden">
            <CardDescription className="text-sm leading-relaxed break-words">
              {step.description}
            </CardDescription>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>

            {/* Don't show again checkbox - only for first-time users */}
            {isFirstTimeUser && (
              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="dont-show-again"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label
                  htmlFor="dont-show-again"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Don't show this tour again
                </label>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center justify-center space-x-1 min-w-0"
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex space-x-1 sm:space-x-2 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm px-2 sm:px-3"
                  title="Skip the tour and continue using the dashboard"
                >
                  Skip
                </Button>

                <Button
                  onClick={nextStep}
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 flex items-center space-x-1 px-2 sm:px-3"
                >
                  <span className="text-xs sm:text-sm">
                    {currentStep === tourSteps.length - 1 ? 'Start' : 'Next'}
                  </span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                  title="Close tour"
                >
                  ✕
                </Button>
              </div>
            </div>
            {/* Action Button for final step */}
            {step.action && currentStep === tourSteps.length - 1 && (
              <div className="pt-2 border-t">
                <Button
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  onClick={() => {
                    completeTour()
                    window.location.href = '/restaurant-setup'
                  }}
                >
                  {step.action}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tour Styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3), 0 0 0 8px rgba(34, 197, 94, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .tour-highlight::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid #22c55e;
          border-radius: 8px;
          animation: pulse-border 2s infinite;
        }

        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}

// Hook to manage tour state
export function useTour() {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [isFirstTimeUserState, setIsFirstTimeUserState] = useState(false)

  useEffect(() => {
    // Check if user is new and hasn't seen the tour using utility functions
    const shouldShow = shouldShowTour()
    const isNewUser = isFirstTimeUser()

    // Debug logging

    if (shouldShow) {
      // Delay tour start to let page load
      const timer = setTimeout(() => {
        
        setIsTourOpen(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const startTour = () => {
    
    setIsTourOpen(true)
  }

  const closeTour = () => {
    
    setIsTourOpen(false)
  }

  const completeTour = () => {
    
    localStorage.setItem('bitebase-tour-completed', 'true')
    setIsTourOpen(false)
  }

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isTourOpen) {
        
        closeTour()
      }
    }

    if (isTourOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isTourOpen])

  return {
    isTourOpen,
    isFirstTimeUser: isFirstTimeUserState,
    startTour,
    closeTour,
    completeTour
  }
}
