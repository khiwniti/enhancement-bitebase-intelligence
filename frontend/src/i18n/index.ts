// Core configuration and types
export * from './config';
export * from './types';

// Enhanced request configuration
export { default as request } from './request';

// Lazy loading and error handling
export * from './lazy-loader';
export * from './fallback-handler';

// Enhanced React hooks
export * from './hooks';

// Translation validation utilities
export * from './validation';

// Components are available for direct import from './components/LanguageSwitcher'
// Not exported here to avoid JSX compilation issues in TypeScript checking

// Utility functions
export {
  getAvailableNamespaces,
  preloadRouteNamespaces
} from './request';

// Re-export commonly used next-intl functions with type safety
export { 
  useTranslations,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useFormatter
} from 'next-intl';

// Type-safe translation function for server components
export { getTranslations } from 'next-intl/server';

/**
 * Main initialization function for the i18n system
 * Should be called once during app startup
 */
export async function initializeI18n(locale: string) {
  const { lazyLoader } = await import('./lazy-loader');
  const { fallbackHandler } = await import('./fallback-handler');
  
  // Preload global namespaces for the initial locale
  await fallbackHandler.preloadCriticalNamespaces(locale as any);
  
  // Set up cache cleanup interval (every 30 minutes)
  if (typeof window !== 'undefined') {
    setInterval(() => {
      lazyLoader.clearExpiredCache();
    }, 1800000); // 30 minutes
  }
}

/**
 * Get the current i18n system status
 */
export async function getI18nStatus() {
  const { lazyLoader } = await import('./lazy-loader');
  const { errorMonitor } = await import('./fallback-handler');
  
  return {
    cache: lazyLoader.getCacheStats(),
    errors: errorMonitor.getErrorStats(),
    timestamp: new Date().toISOString()
  };
}