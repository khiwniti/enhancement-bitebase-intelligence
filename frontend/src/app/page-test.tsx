'use client'

import React from 'react'
import { LanguageProvider, useTranslation } from '@/shared/hooks/use-global-translation'

function TestContent() {
  const { t } = useTranslation('landing')

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          {t('hero.title.part1')} {t('hero.title.part2')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('hero.subtitle.part1')} {t('hero.subtitle.ai')} {t('hero.subtitle.part2')}
        </p>
      </div>
    </div>
  )
}

export default function TestPage() {
  return (
    <LanguageProvider>
      <TestContent />
    </LanguageProvider>
  )
}
