'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console and external service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send to error monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // You can add error monitoring service here
      // e.g., Sentry.captureException(error)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    })
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo } = this.state
      const context = this.props.context || 'Application'

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 bg-white shadow-lg">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
                >
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </motion.div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h1>
                
                <p className="text-gray-600 mb-4">
                  {context} encountered an unexpected error. We apologize for the inconvenience.
                </p>

                {error?.message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                    <p className="text-red-700 text-sm font-mono break-words">
                      {error.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Button
                  onClick={this.handleRetry}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>

                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (error || errorInfo) && (
                <div className="border-t pt-6">
                  <Button
                    onClick={this.toggleDetails}
                    variant="ghost"
                    className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800"
                  >
                    <span>Developer Details</span>
                    {this.state.showDetails ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>

                  {this.state.showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96"
                    >
                      <div className="font-mono text-xs">
                        <div className="mb-4">
                          <h4 className="text-white font-semibold mb-2">Error Stack:</h4>
                          <pre className="whitespace-pre-wrap break-words">
                            {error?.stack}
                          </pre>
                        </div>
                        
                        {errorInfo?.componentStack && (
                          <div>
                            <h4 className="text-white font-semibold mb-2">Component Stack:</h4>
                            <pre className="whitespace-pre-wrap break-words">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="text-center text-sm text-gray-500 mt-6">
                <p>
                  If this problem persists, please{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-orange-600 hover:text-orange-700"
                    onClick={() => {
                      // You can integrate with support chat or feedback system
                      console.log('Contact support clicked')
                    }}
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    contact support
                  </Button>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Async error boundary for handling async errors
export function useAsyncError() {
  const [, setError] = React.useState<Error>()
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}

export default ErrorBoundary