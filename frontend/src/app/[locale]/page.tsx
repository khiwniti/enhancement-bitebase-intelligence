'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/lib/i18n-config'
import LanguageSwitcher from '@/shared/components/LanguageSwitcher'
import { Brain, ArrowRight, BarChart3, TrendingUp, Users, MapPin, Search, Menu as MenuIcon } from 'lucide-react'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default function BilingualLandingPage({ params }: PageProps) {
  const [dict, setDict] = useState<any>(null)
  const [landingDict, setLandingDict] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState<Locale | null>(null)

  useEffect(() => {
    const initializeParams = async () => {
      const { locale: resolvedLocale } = await params
      setLocale(resolvedLocale)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (!locale) return
    
    const loadDictionaries = async () => {
      try {
        const [commonDict, landingTranslations] = await Promise.all([
          getDictionary(locale),
          fetch(`/locales/${locale}/landing.json`).then(res => res.json())
        ])
        setDict(commonDict)
        setLandingDict(landingTranslations)
      } catch (error) {
        console.error('Error loading translations:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDictionaries()
  }, [locale])

  if (!locale || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="absolute inset-x-0 top-0 z-50">
        <div className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href={`/${locale}`} className="-m-1.5 p-1.5 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {landingDict?.navbar?.brand || 'BiteBase Intelligence'}
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <div className="hidden lg:flex lg:gap-x-6">
              <Link
                href={`/${locale}/dashboard`}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-purple-600 transition-colors"
              >
                {landingDict?.navbar?.actions?.sign_in || 'Sign in'}
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-colors"
              >
                {landingDict?.navbar?.actions?.get_started || 'Get started'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-400 to-blue-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center gap-x-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                {landingDict?.hero?.badge || 'AI-Powered Restaurant Intelligence'}
                <span className="inline-flex items-center gap-x-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {landingDict?.hero?.status || 'LIVE'}
                </span>
              </span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {landingDict?.hero?.title_line1 || 'BiteBase'}
              </span>
              <br />
              {landingDict?.hero?.title_line2 || 'Intelligence'}
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              {landingDict?.hero?.subtitle || 'Harness the power of AI to optimize operations, boost profits, and delight customers.'}
            </p>
            
            <p className="mt-4 text-sm text-gray-500">
              {landingDict?.hero?.description || 'Join 5,000+ restaurants already transforming their business with BiteBase Intelligence.'}
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href={`/${locale}/dashboard`}
                className="group relative rounded-md bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-all duration-200 hover:scale-105"
              >
                {landingDict?.hero?.cta_primary || 'Start Free Trial'}
                <ArrowRight className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="text-sm font-semibold leading-6 text-gray-900 hover:text-purple-600 transition-colors">
                {landingDict?.hero?.cta_secondary || 'Watch Demo'}
                <span aria-hidden="true"> →</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-400 to-purple-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {landingDict?.stats?.title || 'Trusted by Leading Restaurants'}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">
              {landingDict?.stats?.restaurants || '5,000+'}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {landingDict?.stats?.restaurants_label || 'Restaurants'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {landingDict?.stats?.revenue_increase || '35%'}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {landingDict?.stats?.revenue_increase_label || 'Average Revenue Increase'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              {landingDict?.stats?.satisfaction || '98%'}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {landingDict?.stats?.satisfaction_label || 'Customer Satisfaction'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">
              {landingDict?.stats?.countries || '25+'}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {landingDict?.stats?.countries_label || 'Countries'}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              {landingDict?.features?.title || 'Powerful Features'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {landingDict?.features?.subtitle || 'Everything you need to run a modern restaurant business'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {landingDict?.features?.items?.map((feature: any, index: number) => {
              const icons = [BarChart3, TrendingUp, Brain, MapPin, Search, MenuIcon]
              const Icon = icons[index] || BarChart3
              
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl border border-gray-200 p-8 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="mb-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            }) || []}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {landingDict?.cta?.title || 'Ready to Transform Your Restaurant?'}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-purple-100">
              {landingDict?.cta?.subtitle || 'Start using BiteBase Intelligence today and get 30% off for new customers.'}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href={`/${locale}/dashboard`}
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-purple-600 shadow-sm hover:bg-gray-50 transition-all duration-200 hover:scale-105"
              >
                {landingDict?.cta?.primary || 'Start Free 14-Day Trial'}
              </Link>
              <button className="text-sm font-semibold leading-6 text-white hover:text-purple-100 transition-colors">
                {landingDict?.cta?.secondary || 'Request Demo'}
                <span aria-hidden="true"> →</span>
              </button>
            </div>
            <p className="mt-6 text-sm text-purple-100">
              {landingDict?.cta?.note || 'No credit card required • Cancel anytime'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">BiteBase Intelligence</span>
            </div>
            <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
              AI-powered restaurant intelligence platform for optimized operations and increased profitability.
            </p>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
              <span>© 2024 BiteBase Intelligence. All rights reserved.</span>
              <span>•</span>
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}