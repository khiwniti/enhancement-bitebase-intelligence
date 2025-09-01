'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  ChefHat,
  MapPin,
  Target,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building,
  Users,
  DollarSign,
  Clock,
  Star
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  component: React.ComponentType<any>
}

const RestaurantSetup = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    type: '',
    locations: '1',
    primaryGoal: ''
  })

  const restaurantTypes = [
    { id: 'quick-service', name: 'Quick Service', icon: '🍔' },
    { id: 'casual-dining', name: 'Casual Dining', icon: '🍽️' },
    { id: 'fine-dining', name: 'Fine Dining', icon: '🥂' },
    { id: 'cafe', name: 'Cafe/Coffee Shop', icon: '☕' },
    { id: 'delivery', name: 'Delivery Only', icon: '🚚' },
    { id: 'food-truck', name: 'Food Truck', icon: '🚛' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="restaurantName">Restaurant Name</Label>
        <Input
          id="restaurantName"
          value={formData.restaurantName}
          onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
          placeholder="Enter your restaurant name"
          className="mt-2"
        />
      </div>

      <div>
        <Label>Restaurant Type</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {restaurantTypes.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, type: type.id })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.type === type.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium">{type.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="locations">Number of Locations</Label>
        <Input
          id="locations"
          type="number"
          value={formData.locations}
          onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
          min="1"
          className="mt-2"
        />
      </div>
    </div>
  )
}

const DataSourcesSetup = () => {
  const [selectedSources, setSelectedSources] = useState<string[]>([])

  const dataSources = [
    { id: 'pos', name: 'POS System', icon: '💳', description: 'Square, Toast, Clover, etc.' },
    { id: 'delivery', name: 'Delivery Platforms', icon: '🚚', description: 'Uber Eats, DoorDash, Grubhub' },
    { id: 'social', name: 'Social Media', icon: '📱', description: 'Instagram, Facebook, TikTok' },
    { id: 'reviews', name: 'Review Platforms', icon: '⭐', description: 'Google, Yelp, TripAdvisor' },
    { id: 'accounting', name: 'Accounting Software', icon: '📊', description: 'QuickBooks, Xero' },
    { id: 'inventory', name: 'Inventory Management', icon: '📦', description: 'Track food costs and waste' }
  ]

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-6">
        Select the data sources you'd like to connect to get the most comprehensive insights.
        You can add more later.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataSources.map((source) => (
          <motion.button
            key={source.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSource(source.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedSources.includes(source.id)
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{source.icon}</div>
              <div>
                <div className="font-medium">{source.name}</div>
                <div className="text-sm text-gray-500">{source.description}</div>
              </div>
              {selectedSources.includes(source.id) && (
                <CheckCircle className="h-5 w-5 text-orange-500 ml-auto" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const GoalSetting = () => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const goals = [
    { id: 'revenue', name: 'Increase Revenue', icon: DollarSign, description: 'Optimize pricing and promotions' },
    { id: 'efficiency', name: 'Improve Efficiency', icon: Clock, description: 'Streamline operations and reduce waste' },
    { id: 'customer', name: 'Enhance Customer Experience', icon: Star, description: 'Improve satisfaction and loyalty' },
    { id: 'expansion', name: 'Location Expansion', icon: Building, description: 'Find optimal new locations' },
    { id: 'marketing', name: 'Better Marketing', icon: Target, description: 'Targeted campaigns and promotions' },
    { id: 'staff', name: 'Staff Management', icon: Users, description: 'Optimize scheduling and training' }
  ]

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-6">
        What are your primary goals? This helps us customize your dashboard and recommendations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <motion.button
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedGoals.includes(goal.id)
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <goal.icon className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <div className="font-medium">{goal.name}</div>
                <div className="text-sm text-gray-500">{goal.description}</div>
              </div>
              {selectedGoals.includes(goal.id) && (
                <CheckCircle className="h-5 w-5 text-orange-500 ml-auto" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const steps: OnboardingStep[] = [
  {
    id: 'restaurant',
    title: 'Restaurant Setup',
    description: 'Tell us about your restaurant',
    icon: ChefHat,
    component: RestaurantSetup
  },
  {
    id: 'datasources',
    title: 'Data Sources',
    description: 'Connect your business data',
    icon: Zap,
    component: DataSourcesSetup
  },
  {
    id: 'goals',
    title: 'Goals & Objectives',
    description: 'Define your success metrics',
    icon: Target,
    component: GoalSetting
  }
]

interface OnboardingWizardProps {
  onComplete: () => void
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    onComplete()
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Welcome to BiteBase Intelligence</h1>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
                initial={false}
                animate={{
                  scale: index === currentStep ? 1.1 : 1,
                  backgroundColor: index <= currentStep ? '#f97316' : '#e5e7eb'
                }}
              >
                <step.icon className="h-5 w-5" />
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>
            <CurrentStepComponent />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={nextStep}
            disabled={isCompleting}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600"
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Setting up...</span>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <span>Complete Setup</span>
                <CheckCircle className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}