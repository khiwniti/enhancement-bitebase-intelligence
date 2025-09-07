'use client'

import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/shared/components/ui/LanguageSwitcher'
import { motion } from 'framer-motion'
import { ChartBarIcon, GlobeAltIcon, CpuChipIcon } from '@heroicons/react/24/outline'

interface HomePageClientProps {
  locale: string
}

export default function HomePageClient({ locale }: HomePageClientProps) {
  const t = useTranslations('common')
  const tNav = useTranslations('common.navigation')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header with Language Switcher */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GlobeAltIcon className="h-8 w-8 text-purple-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                BiteBase Intelligence
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            {tNav('dashboard')} - {t('status.active')}
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Welcome to BiteBase Intelligence. Current locale: <span className="font-semibold text-purple-600">{locale}</span>
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChartBarIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{tNav('analytics')}</h3>
              <p className="text-gray-600">{t('status.active')} analytics dashboard</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <CpuChipIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{tNav('ai_assistant')}</h3>
              <p className="text-gray-600">AI-powered insights</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <GlobeAltIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{tNav('restaurants')}</h3>
              <p className="text-gray-600">Manage your restaurant network</p>
            </motion.div>
          </div>

          {/* Translation Test Section */}
          <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Translation Test</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-purple-600 mb-3">Navigation:</h4>
                <ul className="space-y-2">
                  <li>• {tNav('dashboard')}</li>
                  <li>• {tNav('analytics')}</li>
                  <li>• {tNav('restaurants')}</li>
                  <li>• {tNav('ai_assistant')}</li>
                  <li>• {tNav('reports')}</li>
                  <li>• {tNav('settings')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-600 mb-3">Actions:</h4>
                <ul className="space-y-2">
                  <li>• {t('actions.save')}</li>
                  <li>• {t('actions.delete')}</li>
                  <li>• {t('actions.edit')}</li>
                  <li>• {t('actions.create')}</li>
                  <li>• {t('actions.search')}</li>
                  <li>• {t('actions.export')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Language Switcher Test */}
          <div className="mt-8 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Language: {t('language.select')} | Auto-detect: {t('language.auto_detect')}
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}