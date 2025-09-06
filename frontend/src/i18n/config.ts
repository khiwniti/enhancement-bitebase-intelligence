// Central i18n configuration
export const SUPPORTED_LOCALES = [
  'en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'
] as const;

export const DEFAULT_LOCALE = 'en';

// All 18 translation namespaces as per architecture design
export const ALL_NAMESPACES = [
  'common',
  'navigation', 
  'auth',
  'dashboard',
  'analytics',
  'ai',
  'insights',
  'location',
  'reports',
  'restaurants',
  'errors',
  'landing',
  'landing-new',
  'landing-old'
] as const;

// RTL language configuration
export const RTL_LANGUAGES = ['ar'] as const;
export const LTR_LANGUAGES = ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'] as const;

// Route-based namespace mapping for lazy loading
export const ROUTE_NAMESPACE_MAP = {
  '/dashboard': ['common', 'navigation', 'dashboard'],
  '/analytics': ['common', 'navigation', 'analytics'],
  '/analytics-center': ['common', 'navigation', 'analytics'],
  '/analytics-workbench': ['common', 'navigation', 'analytics'],
  '/4p-analytics': ['common', 'navigation', 'analytics'],
  '/ai-assistant': ['common', 'navigation', 'ai'],
  '/ai-center': ['common', 'navigation', 'ai'],
  '/research-agent': ['common', 'navigation', 'ai'],
  '/growth-studio': ['common', 'navigation', 'ai'],
  '/restaurant-management': ['common', 'navigation', 'restaurants'],
  '/location-intelligence': ['common', 'navigation', 'location'],
  '/location-center': ['common', 'navigation', 'location'],
  '/market-analysis': ['common', 'navigation', 'location'],
  '/market-research': ['common', 'navigation', 'location'],
  '/reports': ['common', 'navigation', 'reports'],
  '/reports/[id]': ['common', 'navigation', 'reports'],
  '/auth/login': ['common', 'auth'],
  '/auth/signup': ['common', 'auth'],
  '/auth/forgot-password': ['common', 'auth'],
  '/': ['common', 'navigation', 'landing'],
  '/landing': ['common', 'navigation', 'landing'],
  // Global namespaces loaded on all routes
  'global': ['common', 'navigation', 'errors']
} as const;

// Text direction helper
export const getTextDirection = (locale: string): 'rtl' | 'ltr' => {
  return RTL_LANGUAGES.includes(locale as any) ? 'rtl' : 'ltr';
};

// Translation error types
export enum TranslationErrorType {
  NAMESPACE_MISSING = 'namespace_missing',
  KEY_MISSING = 'key_missing',
  LOCALE_MISSING = 'locale_missing',
  NETWORK_ERROR = 'network_error',
  PARSE_ERROR = 'parse_error'
}

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export type TranslationNamespace = typeof ALL_NAMESPACES[number];