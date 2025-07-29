/**
 * BiteBase Intelligence Connector Wizard
 * Multi-step wizard for setting up new data source connections
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Loader2,
  Database,
  Globe,
  FileText,
  Cloud
} from 'lucide-react'
import {
  ConnectorType,
  AuthenticationType,
  type ConnectorFormData,
  type ConnectorWizardStep,
  type ConnectorWizardState,
  type ConnectorTemplate
} from './types/connectorTypes'
import { useDataConnectors } from './hooks/useDataConnectors'
import { ConnectorTypeSelector } from './components/ConnectorTypeSelector'
import { ConnectionForm } from './components/ConnectionForm'
import { TestConnection } from './components/TestConnection'

interface ConnectorWizardProps {
  onComplete?: (connectorId: string) => void
  onCancel?: () => void
  className?: string
}

// Connector templates with metadata
const CONNECTOR_TEMPLATES: ConnectorTemplate[] = [
  {
    type: ConnectorType.POSTGRESQL,
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases',
    icon: 'database',
    category: 'database',
    difficulty: 'easy',
    defaultConfig: {
      connector_type: ConnectorType.POSTGRESQL,
      auth_type: 'basic' as AuthenticationType,
      port: 5432,
      pool_size: 5,
      connection_timeout: 30,
      query_timeout: 300,
      use_ssl: false,
      extra_params: {}
    },
    requiredFields: ['name', 'host', 'database', 'username', 'password'],
    optionalFields: ['port', 'description']
  },
  {
    type: ConnectorType.MYSQL,
    name: 'MySQL',
    description: 'Connect to MySQL databases',
    icon: 'database',
    category: 'database',
    difficulty: 'easy',
    defaultConfig: {
      connector_type: ConnectorType.MYSQL,
      auth_type: 'basic' as AuthenticationType,
      port: 3306,
      pool_size: 5,
      connection_timeout: 30,
      query_timeout: 300,
      use_ssl: false,
      extra_params: {}
    },
    requiredFields: ['name', 'host', 'database', 'username', 'password'],
    optionalFields: ['port', 'description']
  },
  {
    type: ConnectorType.REST_API,
    name: 'REST API',
    description: 'Connect to REST API endpoints',
    icon: 'globe',
    category: 'api',
    difficulty: 'medium',
    defaultConfig: {
      connector_type: ConnectorType.REST_API,
      auth_type: 'api_key' as AuthenticationType,
      pool_size: 5,
      connection_timeout: 30,
      query_timeout: 300,
      use_ssl: true,
      extra_params: {}
    },
    requiredFields: ['name', 'host'],
    optionalFields: ['api_key', 'token', 'description']
  },
  {
    type: ConnectorType.CSV,
    name: 'CSV File',
    description: 'Connect to CSV data files',
    icon: 'file-text',
    category: 'file',
    difficulty: 'easy',
    defaultConfig: {
      connector_type: ConnectorType.CSV,
      auth_type: 'none' as AuthenticationType,
      pool_size: 1,
      connection_timeout: 10,
      query_timeout: 60,
      use_ssl: false,
      extra_params: {}
    },
    requiredFields: ['name'],
    optionalFields: ['description']
  },
  {
    type: ConnectorType.MONGODB,
    name: 'MongoDB',
    description: 'Connect to MongoDB databases',
    icon: 'database',
    category: 'database',
    difficulty: 'medium',
    defaultConfig: {
      connector_type: ConnectorType.MONGODB,
      auth_type: 'basic' as AuthenticationType,
      port: 27017,
      pool_size: 5,
      connection_timeout: 30,
      query_timeout: 300,
      use_ssl: false,
      extra_params: {}
    },
    requiredFields: ['name', 'host', 'database'],
    optionalFields: ['port', 'username', 'password', 'description']
  }
]

const STEP_ICONS = {
  database: Database,
  globe: Globe,
  'file-text': FileText,
  cloud: Cloud
}

export function ConnectorWizard({ 
  onComplete, 
  onCancel, 
  className 
}: ConnectorWizardProps) {
  const { createConnector, loading, error } = useDataConnectors()
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<ConnectorTemplate | null>(null)
  const [formData, setFormData] = useState<Partial<ConnectorFormData>>({})
  const [testResult, setTestResult] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Define wizard steps
  const steps: ConnectorWizardStep[] = useMemo(() => [
    {
      id: 'select-type',
      title: 'Select Data Source',
      description: 'Choose the type of data source you want to connect to',
      component: ConnectorTypeSelector,
      isValid: !!selectedTemplate,
      isOptional: false
    },
    {
      id: 'configure',
      title: 'Configure Connection',
      description: 'Enter connection details and credentials',
      component: ConnectionForm,
      isValid: selectedTemplate ? 
        selectedTemplate.requiredFields.every(field => 
          formData[field as keyof ConnectorFormData]
        ) : false,
      isOptional: false
    },
    {
      id: 'test',
      title: 'Test Connection',
      description: 'Verify that the connection works correctly',
      component: TestConnection,
      isValid: !!testResult?.success,
      isOptional: true
    }
  ], [selectedTemplate, formData, testResult])

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const canProceed = currentStepData.isValid || currentStepData.isOptional

  // Handle template selection
  const handleTemplateSelect = useCallback((template: ConnectorTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      ...template.defaultConfig,
      port: template.defaultConfig.port ? String(template.defaultConfig.port) : '',
      name: '',
      description: '',
      host: '',
      database: '',
      username: '',
      password: '',
      api_key: '',
      token: '',
      extra_params: {}
    })
  }, [])

  // Handle form data changes
  const handleFormChange = useCallback((updates: Partial<ConnectorFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  // Handle test result
  const handleTestResult = useCallback((result: any) => {
    setTestResult(result)
  }, [])

  // Navigate to next step
  const handleNext = useCallback(() => {
    if (canProceed && !isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }, [canProceed, isLastStep])

  // Navigate to previous step
  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }, [isFirstStep])

  // Submit the wizard
  const handleSubmit = useCallback(async () => {
    if (!selectedTemplate || !formData.name) return

    try {
      setIsSubmitting(true)
      
      const config = {
        connector_type: selectedTemplate.type,
        name: formData.name,
        description: formData.description || '',
        host: formData.host,
        port: formData.port ? parseInt(formData.port as string) : selectedTemplate.defaultConfig.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        auth_type: formData.auth_type || selectedTemplate.defaultConfig.auth_type || AuthenticationType.BASIC,
        api_key: formData.api_key,
        token: formData.token,
        pool_size: formData.pool_size || selectedTemplate.defaultConfig.pool_size || 5,
        max_overflow: 10,
        pool_timeout: 30,
        connection_timeout: formData.connection_timeout || selectedTemplate.defaultConfig.connection_timeout || 30,
        query_timeout: formData.query_timeout || selectedTemplate.defaultConfig.query_timeout || 300,
        use_ssl: formData.use_ssl || selectedTemplate.defaultConfig.use_ssl || false,
        extra_params: formData.extra_params || {}
      }

      const connectorId = await createConnector(config)
      onComplete?.(connectorId)
    } catch (error) {
      console.error('Failed to create connector:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedTemplate, formData, createConnector, onComplete])

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConnectorTypeSelector
            templates={CONNECTOR_TEMPLATES}
            selectedTemplate={selectedTemplate}
            onSelect={handleTemplateSelect}
          />
        )
      case 1:
        return selectedTemplate ? (
          <ConnectionForm
            template={selectedTemplate}
            formData={formData}
            onChange={handleFormChange}
            error={error}
          />
        ) : null
      case 2:
        return selectedTemplate && formData ? (
          <TestConnection
            selectedTemplate={selectedTemplate}
            formData={formData}
            onTestResult={handleTestResult}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Add Data Source</CardTitle>
              <CardDescription>
                Connect to your data sources in a few simple steps
              </CardDescription>
            </div>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex items-center space-x-4 mt-6">
            {steps.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = index < currentStep || step.isValid
              const IconComponent = selectedTemplate && index === 0 ? 
                STEP_ICONS[selectedTemplate.icon as keyof typeof STEP_ICONS] || Database : 
                Database

              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    isActive && 'border-primary bg-primary text-primary-foreground',
                    isCompleted && !isActive && 'border-green-500 bg-green-500 text-white',
                    !isActive && !isCompleted && 'border-muted-foreground bg-background'
                  )}>
                    {isCompleted && !isActive ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="ml-3 min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      isActive && 'text-primary',
                      isCompleted && !isActive && 'text-green-600',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-4 text-muted-foreground" />
                  )}
                </div>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Step content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep || isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {!currentStepData.isValid && !currentStepData.isOptional && (
                <Badge variant="outline" className="text-xs">
                  Required fields missing
                </Badge>
              )}
              
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Connector'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed || loading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConnectorWizard