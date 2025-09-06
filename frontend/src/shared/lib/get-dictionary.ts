import { Locale } from './i18n-config'

type TranslationDictionary = Record<string, any>

const translations: Record<Locale, Record<string, TranslationDictionary>> = {
  en: {},
  th: {},
  es: {},
  fr: {},
  de: {},
  it: {},
  pt: {},
  zh: {},
  ja: {},
  ko: {},
  ar: {}
}

export async function getTranslation(locale: Locale, namespace: string): Promise<TranslationDictionary> {
  if (translations[locale][namespace]) {
    return translations[locale][namespace]
  }

  try {
    const translation = await import(`../../../public/locales/${locale}/${namespace}.json`)
    translations[locale][namespace] = translation.default
    return translation.default
  } catch (error) {
    console.warn(`Failed to load translation for ${locale}/${namespace}:`, error)
    // Fallback to English
    if (locale !== 'en') {
      return getTranslation('en', namespace)
    }
    return {}
  }
}

export async function getDictionary(locale: Locale) {
  const namespaces = ['common', 'dashboard', 'auth', 'analytics', 'restaurants', 'ai', 'errors', 'location', 'insights', 'reports']

  const dict: Record<string, TranslationDictionary> = {}

  await Promise.all(
    namespaces.map(async (namespace) => {
      dict[namespace] = await getTranslation(locale, namespace)
    })
  )

  return dict
}
