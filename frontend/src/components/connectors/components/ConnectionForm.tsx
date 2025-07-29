/**
 * BiteBase Intelligence Connection Form
 * Form component for configuring data source connection details
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Info,
  Lock,
  Globe,
  Database,
  Key
} from 'lucide-react'
import type { ConnectorTemplate, ConnectorFormData, AuthenticationType } from '../types/connectorTypes'

interface ConnectionFormProps {
  template: ConnectorTemplate
  formData: Partial<ConnectorFormData>
  onChange: (updates: Partial<ConnectorFormData>) => void
  error?: string | null
  className?: string
}

interface FormFieldProps {
  label: string
  name: keyof ConnectorFormData
  type?: string
  placeholder?: string
  required?: boolean
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  value: string | number | undefined
  onChange: (value: any) => void
  error?: string
}

function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  description,
  icon: Icon,
  value,
  onChange,
  error
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      </div>
      
      <div className="relative">
        <Input
          type={inputType}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            isPassword && 'pr-10'
          )}
        />
        
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground flex items-start space-x-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{description}</span>
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive flex items-start space-x-1">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export function ConnectionForm({
  template,
  formData,
  onChange,
  error,
  className
}: ConnectionFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleFieldChange = useCallback((field: keyof ConnectorFormData, value: any) => {
    onChange({ [field]: value })
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [onChange, fieldErrors])

  const validateField = useCallback((field: string, value: any): string | undefined => {
    if (template.requiredFields.includes(field) && (!value || value.toString().trim() === '')) {
      return `${field.replace('_', ' ')} is required`
    }
    
    if (field === 'port' && value && (isNaN(value) || value < 1 || value > 65535)) {
      return 'Port must be a number between 1 and 65535'
    }
    
    if (field === 'host' && value && !value.match(/^[a-zA-Z0-9.-]+$/)) {
      return 'Invalid host format'
    }
    
    return undefined
  }, [template.requiredFields])

  // Get field configuration based on template and connector type
  const getFieldConfig = (field: string) => {
    const configs: Record<string, Partial<FormFieldProps>> = {
      name: {
        label: 'Connection Name',
        placeholder: 'My Database Connection',
        description: 'A friendly name for this connection',
        icon: Database,
        required: true
      },
      description: {
        label: 'Description',
        placeholder: 'Optional description of this connection',
        description: 'Help others understand what this connection is for'
      },
      host: {
        label: 'Host',
        placeholder: 'localhost or database.example.com',
        description: 'The hostname or IP address of your database server',
        icon: Globe,
        required: template.requiredFields.includes('host')
      },
      port: {
        label: 'Port',
        type: 'number',
        placeholder: template.defaultConfig.port?.toString() || '5432',
        description: `Default port is ${template.defaultConfig.port || 'not specified'}`,
        required: template.requiredFields.includes('port')
      },
      database: {
        label: 'Database Name',
        placeholder: 'my_database',
        description: 'The name of the database to connect to',
        icon: Database,
        required: template.requiredFields.includes('database')
      },
      username: {
        label: 'Username',
        placeholder: 'database_user',
        description: 'Username for database authentication',
        required: template.requiredFields.includes('username')
      },
      password: {
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
        description: 'Password for database authentication',
        icon: Lock,
        required: template.requiredFields.includes('password')
      },
      api_key: {
        label: 'API Key',
        type: 'password',
        placeholder: 'your-api-key-here',
        description: 'API key for authentication',
        icon: Key,
        required: template.requiredFields.includes('api_key')
      },
      token: {
        label: 'Access Token',
        type: 'password',
        placeholder: 'your-access-token',
        description: 'Bearer token for authentication',
        icon: Key,
        required: template.requiredFields.includes('token')
      }
    }
    
    return configs[field] || {
      label: field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      placeholder: `Enter ${field.replace('_', ' ')}`,
      required: template.requiredFields.includes(field)
    }
  }

  // Determine which fields to show based on template
  const fieldsToShow = [
    'name',
    'description',
    ...(template.category === 'database' ? ['host', 'port', 'database'] : []),
    ...(template.category === 'api' ? ['host'] : []),
    ...(template.defaultConfig.auth_type === 'basic' ? ['username', 'password'] : []),
    ...(template.defaultConfig.auth_type === 'api_key' ? ['api_key'] : []),
    ...(template.defaultConfig.auth_type === 'jwt' ? ['token'] : []),
  ].filter((field, index, arr) => arr.indexOf(field) === index) // Remove duplicates

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Configure {template.name} Connection</h3>
        <p className="text-muted-foreground">
          Enter the connection details for your {template.name} data source
        </p>
      </div>

      {/* Connection template info */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{template.name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {template.difficulty}
            </Badge>
          </div>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground">
            Authentication: <span className="font-medium">{template.defaultConfig.auth_type}</span>
          </div>
        </CardContent>
      </Card>

      {/* Global error */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fieldsToShow.map(field => {
          const config = getFieldConfig(field)
          const fieldError = validateField(field, formData[field as keyof ConnectorFormData])
          
          return (
            <FormField
              key={field}
              name={field as keyof ConnectorFormData}
              value={typeof formData[field as keyof ConnectorFormData] === 'object' ?
                '' : formData[field as keyof ConnectorFormData] as string | number | undefined}
              onChange={(value) => handleFieldChange(field as keyof ConnectorFormData, value)}
              error={fieldError}
              label={config.label || field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              type={config.type}
              placeholder={config.placeholder}
              required={config.required}
              description={config.description}
              icon={config.icon}
            />
          )
        })}
      </div>

      {/* Advanced settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced Settings</CardTitle>
          <CardDescription>
            Optional configuration for connection pooling and timeouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Pool Size"
              name="pool_size"
              type="number"
              placeholder="5"
              description="Number of connections to maintain in the pool"
              value={formData.pool_size}
              onChange={(value) => handleFieldChange('pool_size', parseInt(value) || 5)}
            />
            
            <FormField
              label="Connection Timeout (s)"
              name="connection_timeout"
              type="number"
              placeholder="30"
              description="Timeout for establishing connections"
              value={formData.connection_timeout}
              onChange={(value) => handleFieldChange('connection_timeout', parseInt(value) || 30)}
            />
            
            <FormField
              label="Query Timeout (s)"
              name="query_timeout"
              type="number"
              placeholder="300"
              description="Timeout for query execution"
              value={formData.query_timeout}
              onChange={(value) => handleFieldChange('query_timeout', parseInt(value) || 300)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="use_ssl"
              checked={formData.use_ssl || false}
              onChange={(e) => handleFieldChange('use_ssl', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="use_ssl" className="text-sm font-medium">
              Use SSL/TLS encryption
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Required fields summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Fields</h4>
        <div className="flex flex-wrap gap-2">
          {template.requiredFields.map(field => {
            const hasValue = formData[field as keyof ConnectorFormData]
            return (
              <Badge
                key={field}
                variant={hasValue ? "default" : "outline"}
                className={cn(
                  'text-xs',
                  hasValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                )}
              >
                {field.replace('_', ' ')}
                {hasValue && ' ✓'}
              </Badge>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ConnectionForm