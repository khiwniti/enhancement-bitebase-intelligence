'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  Database,
  Wifi,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestConnectionProps {
  formData: any
  selectedTemplate: any
  onTestResult: (result: any) => void
  className?: string
}

interface TestResult {
  success: boolean
  message: string
  details?: {
    latency?: number
    version?: string
    tables?: number
    errors?: string[]
  }
}

export function TestConnection({ 
  formData, 
  selectedTemplate, 
  onTestResult, 
  className 
}: TestConnectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const handleTestConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock test result based on form data
      const mockResult: TestResult = {
        success: Math.random() > 0.3, // 70% success rate for demo
        message: Math.random() > 0.3 
          ? 'Connection successful! All systems operational.'
          : 'Connection failed. Please check your credentials.',
        details: {
          latency: Math.floor(Math.random() * 100) + 50,
          version: '14.2.1',
          tables: Math.floor(Math.random() * 50) + 10,
          errors: Math.random() > 0.3 ? [] : ['Authentication failed', 'Network timeout']
        }
      }

      setTestResult(mockResult)
      onTestResult(mockResult)
    } catch (error) {
      const errorResult: TestResult = {
        success: false,
        message: 'Connection test failed due to network error.',
        details: {
          errors: ['Network error', 'Please try again']
        }
      }
      setTestResult(errorResult)
      onTestResult(errorResult)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Test
          </CardTitle>
          <CardDescription>
            Test your connection settings to ensure everything is configured correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Connection Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium">{selectedTemplate?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Host:</span>
                <span className="ml-2 font-medium">{formData?.host || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Database:</span>
                <span className="ml-2 font-medium">{formData?.database || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Port:</span>
                <span className="ml-2 font-medium">{formData?.port || 'Default'}</span>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <Button 
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>

          {/* Test Results */}
          {testResult && (
            <Card className={cn(
              'border-2',
              testResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            )}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={testResult.success ? 'default' : 'destructive'}>
                        {testResult.success ? 'Success' : 'Failed'}
                      </Badge>
                      {testResult.details?.latency && (
                        <Badge variant="outline">
                          {testResult.details.latency}ms
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      'text-sm',
                      testResult.success ? 'text-green-700' : 'text-red-700'
                    )}>
                      {testResult.message}
                    </p>
                    
                    {testResult.details && (
                      <div className="space-y-2">
                        {testResult.success && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {testResult.details.version && (
                              <div>
                                <span className="text-muted-foreground">Version:</span>
                                <span className="ml-1">{testResult.details.version}</span>
                              </div>
                            )}
                            {testResult.details.tables && (
                              <div>
                                <span className="text-muted-foreground">Tables:</span>
                                <span className="ml-1">{testResult.details.tables}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {testResult.details.errors && testResult.details.errors.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Errors:</span>
                            </div>
                            <ul className="text-xs text-red-600 space-y-1 ml-4">
                              {testResult.details.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium">Security Notice</p>
              <p>Your connection credentials are encrypted and stored securely. Test connections are performed over secure channels.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestConnection
