"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { HelpCircle, Play, BookOpen, MessageCircle, ExternalLink } from 'lucide-react'

interface TourTriggerProps {
  onStartTour: () => void
}

export function TourTrigger({ onStartTour }: TourTriggerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <HelpCircle className="w-4 h-4 mr-2" />
          Help
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onStartTour} className="cursor-pointer">
          <Play className="w-4 h-4 mr-2 text-primary-600" />
          <div>
            <div className="font-medium">Take a Tour</div>
            <div className="text-xs text-gray-500">Learn how to use BiteBase</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
          <div>
            <div className="font-medium">Documentation</div>
            <div className="text-xs text-gray-500">Detailed guides and tutorials</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2 text-purple-600" />
          <div>
            <div className="font-medium">Contact Support</div>
            <div className="text-xs text-gray-500">Get help from our team</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
          <div>
            <div className="font-medium">What's New</div>
            <div className="text-xs text-gray-500">Latest features and updates</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Welcome Banner for new users
export function WelcomeBanner({ onStartTour }: { onStartTour: () => void }) {
  const [isVisible, setIsVisible] = React.useState(false)
  
  React.useEffect(() => {
    const tourCompleted = localStorage.getItem('bitebase-tour-completed')
    const bannerDismissed = localStorage.getItem('bitebase-welcome-banner-dismissed')
    
    if (!tourCompleted && !bannerDismissed) {
      setIsVisible(true)
    }
  }, [])
  
  const dismissBanner = () => {
    setIsVisible(false)
    localStorage.setItem('bitebase-welcome-banner-dismissed', 'true')
  }
  
  if (!isVisible) return null
  
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-primary-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Play className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Welcome to BiteBase! 🎉</h3>
            <p className="text-sm text-gray-600">
              New to our platform? Take a quick tour to discover how AI can transform your restaurant business.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={dismissBanner}
            className="text-gray-600"
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              onStartTour()
              dismissBanner()
            }}
            size="sm"
            className="bg-primary-600 hover:bg-primary-700"
          >
            Start Tour
          </Button>
        </div>
      </div>
    </div>
  )
}

// Feature Spotlight Component
export function FeatureSpotlight() {
  const features = [
    {
      icon: "🗺️",
      title: "Interactive Maps",
      description: "Click anywhere to analyze restaurant opportunities with AI-powered insights."
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description: "Get instant market research, competitor analysis, and location recommendations."
    },
    {
      icon: "📊",
      title: "Real-time Data",
      description: "Access live restaurant data, demographics, and market trends."
    },
    {
      icon: "📋",
      title: "Smart Reports",
      description: "Generate comprehensive market analysis reports with actionable insights."
    }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
        >
          <div className="text-2xl mb-2">{feature.icon}</div>
          <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}

// Quick Start Guide
export function QuickStartGuide({ onStartTour }: { onStartTour: () => void }) {
  const steps = [
    {
      number: 1,
      title: "Take the Tour",
      description: "Learn the basics with our interactive guide",
      action: "Start Tour",
      onClick: onStartTour
    },
    {
      number: 2,
      title: "Analyze a Location",
      description: "Click on the map to get AI-powered insights",
      action: "Try Map Analysis",
      onClick: () => window.location.href = '/location-intelligence'
    },
    {
      number: 3,
      title: "Chat with AI",
      description: "Ask questions about market opportunities",
      action: "Open Dashboard",
      onClick: () => window.location.href = '/dashboard'
    },
    {
      number: 4,
      title: "Setup Your Restaurant",
      description: "Use our wizard to plan your concept",
      action: "Start Setup",
      onClick: () => window.location.href = '/research-agent'
    }
  ]
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {step.number}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={step.onClick}
              className="hover:border-primary-500 hover:text-primary-600"
            >
              {step.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
