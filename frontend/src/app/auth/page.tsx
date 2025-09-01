'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import { AuthLayout } from '@/components/common'
import { 
  FormField, 
  PasswordInput,
  FormActions 
} from '@/components/common/FormComponents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Mail, 
  User, 
  Building, 
  Phone,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Chrome
} from 'lucide-react'
import BiteBaseLogo from '@/components/BiteBaseLogo'

type AuthMode = 'login' | 'register' | 'forgot-password'
type AuthFlow = 'auth' | 'onboarding'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  company: string
}

export default function AuthPage() {
  const [flow, setFlow] = useState<AuthFlow>('auth')
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: ''
  })

  const { signIn, signUp, signInWithGoogle, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
      if (!hasCompletedOnboarding && isNewUser) {
        setFlow('onboarding')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, router, isNewUser])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return false
    }

    if (mode === 'register') {
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required')
        return false
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password)
        router.push('/dashboard')
      } else if (mode === 'register') {
        await signUp(formData.email, formData.password, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          company: formData.company
        })
        setIsNewUser(true)
        setFlow('onboarding')
      } else if (mode === 'forgot-password') {
        // Simulate forgot password
        setSuccess('Password reset instructions have been sent to your email')
        setTimeout(() => setMode('login'), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      // Assume Google sign-in is for existing users
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    router.push('/dashboard')
  }

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back'
      case 'register': return 'Create Account'
      case 'forgot-password': return 'Reset Password'
    }
  }

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your BiteBase Intelligence account'
      case 'register': return 'Join BiteBase Intelligence and unlock powerful insights'
      case 'forgot-password': return 'Enter your email to receive reset instructions'
    }
  }

  // Show onboarding for new users
  if (flow === 'onboarding') {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  return (
    <AuthLayout className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4">
          <span className="text-2xl font-bold text-white">B</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">BiteBase Intelligence</h1>
        <p className="text-gray-600 mt-1">AI-Powered Business Intelligence Platform</p>
      </div>

      <Card className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          <p className="text-gray-600 mt-1">{getSubtitle()}</p>
        </div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <FormField label="Email Address" required>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                placeholder="Enter your email"
                required
              />
            </div>
          </FormField>

          {/* Register Fields */}
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" required>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10"
                      placeholder="First name"
                      required
                    />
                  </div>
                </FormField>
                
                <FormField label="Last Name" required>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </FormField>
              </div>

              <FormField label="Company" help="Optional">
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="pl-10"
                    placeholder="Your company"
                  />
                </div>
              </FormField>

              <FormField label="Phone" help="Optional">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    placeholder="Your phone number"
                  />
                </div>
              </FormField>
            </>
          )}

          {/* Password */}
          {mode !== 'forgot-password' && (
            <FormField label="Password" required>
              <PasswordInput
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                placeholder="Enter your password"
                required
              />
            </FormField>
          )}

          {/* Confirm Password */}
          {mode === 'register' && (
            <FormField label="Confirm Password" required>
              <PasswordInput
                value={formData.confirmPassword}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your password"
                required
              />
            </FormField>
          )}

          {/* Forgot Password Link */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot-password')}
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <FormActions
            onSave={undefined}
            saveLabel={mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
            loading={loading}
            className="pt-4"
          />
        </form>

          {/* Google Sign In */}
          {mode !== 'forgot-password' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-lg hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Chrome className="w-4 h-4" />
                Continue with Google
              </button>
            </>
          )}

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : mode === 'register' ? (
              <p className="text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            )}
          </div>
        </Card>
    </AuthLayout>
  )
}
