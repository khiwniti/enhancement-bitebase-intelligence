'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  actions?: Array<{ label: string; onClick: () => void }>
  persistent?: boolean
}

interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => string
  removeToast: (id: string) => void
  removeAllToasts: () => void
  success: (message: string, options?: Partial<ToastMessage>) => string
  error: (message: string, options?: Partial<ToastMessage>) => string
  warning: (message: string, options?: Partial<ToastMessage>) => string
  info: (message: string, options?: Partial<ToastMessage>) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right'
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      return updated.slice(0, maxToasts)
    })

    // Auto-remove non-persistent toasts
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const removeAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback((message: string, options?: Partial<ToastMessage>) => {
    return addToast({
      type: 'success',
      message,
      ...options
    })
  }, [addToast])

  const error = useCallback((message: string, options?: Partial<ToastMessage>) => {
    return addToast({
      type: 'error',
      message,
      duration: 7000, // Longer duration for errors
      ...options
    })
  }, [addToast])

  const warning = useCallback((message: string, options?: Partial<ToastMessage>) => {
    return addToast({
      type: 'warning',
      message,
      ...options
    })
  }, [addToast])

  const info = useCallback((message: string, options?: Partial<ToastMessage>) => {
    return addToast({
      type: 'info',
      message,
      ...options
    })
  }, [addToast])

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className={`fixed z-[100] pointer-events-none ${getPositionClasses()}`}>
        <div className="flex flex-col gap-2 max-w-sm w-full">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast, index) => (
              <ToastComponent
                key={toast.id}
                toast={toast}
                onClose={() => removeToast(toast.id)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  )
}

interface ToastComponentProps {
  toast: ToastMessage
  onClose: () => void
  index: number
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onClose, index }) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration! / 50))
          if (newProgress <= 0) {
            clearInterval(interval)
            return 0
          }
          return newProgress
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [toast.duration, toast.persistent])

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />
  }

  const colorClasses = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  }

  const progressColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500"
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { delay: index * 0.1 }
      }}
      exit={{ 
        opacity: 0, 
        y: -50, 
        scale: 0.95,
        transition: { duration: 0.2 }
      }}
      className="pointer-events-auto"
    >
      <div className={`
        relative overflow-hidden rounded-lg border-l-4 bg-white shadow-lg 
        ${colorClasses[toast.type]}
        backdrop-blur-sm border border-opacity-20
      `}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {icons[toast.type]}
            </div>
            <div className="ml-3 w-0 flex-1">
              {toast.title && (
                <motion.p 
                  className="text-sm font-medium text-gray-900"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {toast.title}
                </motion.p>
              )}
              <motion.p 
                className={`text-sm text-gray-700 ${toast.title ? 'mt-1' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                {toast.message}
              </motion.p>
              {toast.actions && toast.actions.length > 0 && (
                <motion.div 
                  className="mt-3 flex space-x-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {toast.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                      onClick={action.onClick}
                    >
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar for timed toasts */}
        {!toast.persistent && toast.duration && toast.duration > 0 && (
          <motion.div
            className={`h-1 ${progressColors[toast.type]}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        )}

        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              'linear-gradient(45deg, transparent 100%, rgba(255,255,255,0.1) 150%, transparent 200%)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}

// Convenience hook for common toast patterns
export const useToastActions = () => {
  const { success, error, warning, info } = useToast()

  const handleAsyncAction = useCallback(async (
    asyncFn: () => Promise<any>,
    options: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      successTitle?: string
      errorTitle?: string
    } = {}
  ) => {
    const {
      loadingMessage = 'Processing...',
      successMessage = 'Operation completed successfully',
      errorMessage = 'An error occurred',
      successTitle,
      errorTitle
    } = options

    const loadingToastId = info(loadingMessage, { persistent: true })

    try {
      const result = await asyncFn()
      success(successMessage, { title: successTitle })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage
      error(message, { title: errorTitle })
      throw err
    } finally {
      // Remove loading toast (would need access to removeToast)
    }
  }, [success, error, info])

  return {
    success,
    error,
    warning,
    info,
    handleAsyncAction
  }
}

export default ToastProvider
