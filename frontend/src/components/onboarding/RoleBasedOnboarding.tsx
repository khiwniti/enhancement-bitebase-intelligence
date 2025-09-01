'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target, 
  MapPin, 
  Brain,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react'

interface UserPersona {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  primaryGoals: string[]
  recommendedFeatures: string[]
  dashboardType: 'operational' | 'growth' | 'analytical'
  complexity: 'simple' | 'moderate' | 'advanced'
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
}

const userPersonas: UserPersona[] = [
  {
    id: 'restaurant-owner',
    title: 'Restaurant Owner',
    description: 'Single or small chain owner focused on daily operations and profitability',
    icon: Building,
    color: 'from-blue-500 to-cyan-500',
    primaryGoals: [
      'Monitor daily sales and KPIs',
      'Understand customer patterns',
      'Optimize menu and pricing',
      'Track financial performance'
    ],
    recommendedFeatures: [
      'Business Command Center',
      'Real-time Analytics',
      'POS Integration',
      'Financial Tracking'
    ],
    dashboardType: 'operational',
    complexity: 'simple'
  },
  {
    id: 'marketing-manager',
    title: 'Marketing Manager',
    description: 'Growth-focused professional managing campaigns and expansion strategy',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    primaryGoals: [
      'Analyze campaign performance',
      'Identify target demographics',
      'Plan location expansion',
      'Track marketing ROI'
    ],
    recommendedFeatures: [
      'Growth Intelligence Studio',
      'AI Market Research Agent',
      'Campaign Management',
      'Location Intelligence'
    ],
    dashboardType: 'growth',
    complexity: 'moderate'
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Technical professional focused on deep analysis and custom reporting',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
    primaryGoals: [
      'Create custom reports and dashboards',
      'Perform deep-dive analysis',
      'Build predictive models',
      'Export data for analysis'
    ],
    recommendedFeatures: [
      'Analytics Workbench',
      'Custom Dashboard Builder',
      'Data Integration Hub',
      'Advanced Modeling Tools'
    ],
    dashboardType: 'analytical',
    complexity: 'advanced'
  }
]

interface RoleBasedOnboardingProps {
  onComplete: (selectedRole: string, preferences: any) => void
  onSkip: () => void
}

export function RoleBasedOnboarding({ onComplete, onSkip }: RoleBasedOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'role-selection' | 'customization' | 'confirmation'>('welcome')
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(null)
  const [preferences, setPreferences] = useState({
    notifications: true,
    realTimeUpdates: true,
    darkMode: false,
    autoReports: false
  })

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'role-selection',
      title: 'Select Your Role',
      description: 'Choose the role that best describes your primary responsibilities',
      completed: currentStep !== 'welcome'
    },
    {
      id: 'customization',
      title: 'Customize Experience',
      description: 'Set your preferences for notifications and data updates',
      completed: currentStep === 'confirmation'
    },
    {
      id: 'confirmation',
      title: 'Confirm Setup',
      description: 'Review your selections and complete onboarding',
      completed: false
    }
  ]

  const handlePersonaSelect = (persona: UserPersona) => {
    setSelectedPersona(persona)
    setCurrentStep('customization')
  }

  const handleComplete = () => {
    if (selectedPersona) {
      onComplete(selectedPersona.id, {
        ...preferences,
        dashboardType: selectedPersona.dashboardType,
        complexity: selectedPersona.complexity
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {onboardingSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step.completed ? 'bg-[#74C365] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < onboardingSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step.completed ? 'bg-[#74C365]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center">
              <CardHeader>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4 p-4 bg-[#74C365] rounded-full w-fit"
                >
                  <Zap className="h-8 w-8 text-white" />
                </motion.div>
                <CardTitle className="text-2xl">Welcome to BiteBase Intelligence 2.0</CardTitle>
                <CardDescription className="text-lg">
                  Let's personalize your experience to match your role and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-[#74C365]" />
                    <span>AI-Powered Insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#74C365]" />
                    <span>Location Intelligence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#74C365]" />
                    <span>Real-time Analytics</span>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => setCurrentStep('role-selection')}
                    className="bg-[#74C365] hover:bg-[#5ea54f]"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" onClick={onSkip}>
                    Skip Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Role Selection Step */}
        {currentStep === 'role-selection' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>What describes your role best?</CardTitle>
                <CardDescription>
                  This helps us customize your dashboard and recommend the most relevant features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userPersonas.map((persona) => (
                    <motion.div
                      key={persona.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedPersona?.id === persona.id ? 'ring-2 ring-[#74C365] border-[#74C365]' : ''
                        }`}
                        onClick={() => handlePersonaSelect(persona)}
                      >
                        <CardHeader>
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${persona.color} opacity-90 w-fit mb-2`}>
                            <persona.icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{persona.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {persona.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Primary Goals:</h4>
                              <ul className="space-y-1">
                                {persona.primaryGoals.slice(0, 3).map((goal) => (
                                  <li key={goal} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-[#74C365]" />
                                    {goal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="capitalize text-xs">
                                {persona.complexity}
                              </Badge>
                              {selectedPersona?.id === persona.id && (
                                <CheckCircle className="h-5 w-5 text-[#74C365]" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Customization Step */}
        {currentStep === 'customization' && selectedPersona && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Customize Your Experience</CardTitle>
                <CardDescription>
                  Configure your preferences for the optimal {selectedPersona.title} experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Role Summary */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedPersona.color} opacity-90`}>
                      <selectedPersona.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedPersona.title}</h3>
                      <p className="text-sm text-gray-500">Recommended features for your role</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersona.recommendedFeatures.map((feature: string) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      key: 'notifications', 
                      label: 'Smart Notifications', 
                      desc: 'Get alerts for important insights and updates',
                      icon: Star
                    },
                    { 
                      key: 'realTimeUpdates', 
                      label: 'Real-time Data', 
                      desc: 'Automatically refresh dashboards with live data',
                      icon: Zap
                    },
                    { 
                      key: 'darkMode', 
                      label: 'Dark Mode', 
                      desc: 'Use dark theme for better viewing experience',
                      icon: Building
                    },
                    { 
                      key: 'autoReports', 
                      label: 'Automated Reports', 
                      desc: 'Schedule and receive reports automatically',
                      icon: BarChart3
                    }
                  ].map((pref) => (
                    <Card key={pref.key} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <pref.icon className="h-5 w-5 text-[#74C365] mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">{pref.label}</h4>
                            <p className="text-xs text-gray-500">{pref.desc}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences[pref.key as keyof typeof preferences]}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferences((prev: any) => ({
                            ...prev,
                            [pref.key]: e.target.checked
                          }))}
                          className="h-4 w-4 text-[#74C365] rounded border-gray-300 focus:ring-[#74C365]"
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => setCurrentStep('confirmation')}
                    className="bg-[#74C365] hover:bg-[#5ea54f]"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('role-selection')}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Confirmation Step */}
        {currentStep === 'confirmation' && selectedPersona && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Ready to Launch Your Dashboard</CardTitle>
                <CardDescription>
                  Your personalized BiteBase Intelligence experience is ready
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Setup Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Your Role & Setup</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <selectedPersona.icon className="h-4 w-4 text-[#74C365]" />
                        <span className="text-sm">{selectedPersona.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[#74C365]" />
                        <span className="text-sm capitalize">{selectedPersona.dashboardType} Dashboard</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-[#74C365]" />
                        <span className="text-sm capitalize">{selectedPersona.complexity} Interface</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Enabled Features</h3>
                    <div className="space-y-2">
                      {Object.entries(preferences).filter(([_, enabled]) => enabled).map(([key, _]) => (
                        <div key={key} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-[#74C365]" />
                          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#74C365] bg-opacity-10 border border-[#74C365] border-opacity-30 rounded-lg">
                  <h4 className="font-medium text-[#74C365] mb-2">What happens next?</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Your dashboard will be customized for your role</li>
                    <li>• Recommended features will be highlighted</li>
                    <li>• You'll receive a guided tour of key features</li>
                    <li>• Your preferences will be saved for future sessions</li>
                  </ul>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={handleComplete}
                    className="bg-[#74C365] hover:bg-[#5ea54f]"
                  >
                    Complete Setup
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('customization')}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default RoleBasedOnboarding