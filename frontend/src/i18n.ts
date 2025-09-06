import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { locales } from '@/shared/lib/i18n-config'

// Define available namespaces for each route
const namespaceMap: Record<string, string[]> = {
  '/': ['common', 'navigation', 'landing'],
  '/dashboard': ['common', 'navigation', 'dashboard'],
  '/analytics': ['common', 'navigation', 'analytics'],
  '/4p-analytics': ['common', 'navigation', 'analytics'],
  '/analytics-center': ['common', 'navigation', 'analytics'],
  '/analytics-workbench': ['common', 'navigation', 'analytics'],
  '/location-center': ['common', 'navigation', 'location'],
  '/location-intelligence': ['common', 'navigation', 'location'],
  '/market-analysis': ['common', 'navigation', 'market'],
  '/market-research': ['common', 'navigation', 'market'],
  '/restaurant-management': ['common', 'navigation', 'restaurant'],
  '/growth-studio': ['common', 'navigation', 'growth'],
  '/research-agent': ['common', 'navigation', 'research'],
  '/ai-assistant': ['common', 'navigation', 'ai'],
  '/ai-center': ['common', 'navigation', 'ai'],
  '/reports': ['common', 'navigation', 'reports'],
  '/settings': ['common', 'navigation', 'settings'],
  '/auth': ['common', 'auth']
}

async function loadMessages(locale: string, namespaces: string[]) {
  console.log('loadMessages called with locale:', locale, 'typeof:', typeof locale, 'namespaces:', namespaces)
  const messages: Record<string, any> = {}
  
  for (const namespace of namespaces) {
    try {
      const namespaceMessages = (await import(`./i18n/locales/${locale}/${namespace}.json`)).default
      messages[namespace] = namespaceMessages
    } catch (error) {
      console.warn(`Failed to load ${namespace} for ${locale}, trying fallback`)
      
      // Try to load fallback from English
      if (locale !== 'en') {
        try {
          const fallbackMessages = (await import(`./i18n/locales/en/${namespace}.json`)).default
          messages[namespace] = fallbackMessages
        } catch (fallbackError) {
          console.error(`Failed to load fallback for ${namespace}:`, fallbackError)
          messages[namespace] = {}
        }
      } else {
        messages[namespace] = {}
      }
    }
  }
  
  return messages
}

export default getRequestConfig(async ({ locale }) => {
  // Debug the incoming locale parameter
  console.log('i18n getRequestConfig - received locale:', locale, 'typeof:', typeof locale, 'value:', JSON.stringify(locale))
  
  // Validate that the incoming `locale` parameter is valid
  const localeString = String(locale)
  console.log('i18n getRequestConfig - localeString:', localeString, 'typeof:', typeof localeString)
  
  // Temporarily commented out for debugging
  // if (!locales.includes(localeString as any)) notFound()

  // Cast locale as string since we've validated it
  const validLocale = localeString

  console.log('i18n getRequestConfig - validLocale:', validLocale, 'about to loadMessages')

  // Load all available namespaces for comprehensive support
  const namespaces = ['common', 'navigation', 'landing', 'auth', 'dashboard', 'analytics', 'reports', 'settings', 'ai', 'location', 'restaurants', 'insights', 'errors']

  const messages = await loadMessages(validLocale, namespaces)

  return {
    locale: validLocale,
    messages,
    timeZone: 'Asia/Bangkok', // Default timezone
    now: new Date(),
    onError(error) {
      console.error('i18n error:', error)
    },
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join('.')
      
      if (error.code === 'MISSING_MESSAGE') {
        return path + ' (missing translation)'
      }
      
      return `${path} (error: ${error.code})`
    }
  }
})