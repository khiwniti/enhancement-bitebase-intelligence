'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import type { 
  SupportedLocale, 
  TranslationNamespace, 
  TranslationError,
  TranslationLoadResult 
} from './types';
import { getTextDirection } from './config';
import { lazyLoader } from './lazy-loader';
import { errorMonitor } from './fallback-handler';

/**
 * Enhanced translation hook with error handling and lazy loading support
 */
export function useEnhancedTranslations(namespace: TranslationNamespace) {
  const t = useTranslations(namespace);
  const locale = useLocale() as SupportedLocale;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TranslationError | null>(null);

  // Safe translation function with fallback handling
  const tSafe = useCallback((key: string, params?: Record<string, any>): string => {
    try {
      return t(key, params);
    } catch (translationError) {
      console.warn(`Translation key missing: ${namespace}.${key} for ${locale}`);
      
      // Log error for monitoring
      errorMonitor.logError({
        type: 'key_missing' as any,
        message: `Missing translation key: ${namespace}.${key}`,
        locale,
        namespace,
        key,
        timestamp: Date.now()
      });

      // Return the key as fallback
      return key;
    }
  }, [t, namespace, locale]);

  return {
    t: tSafe,
    locale,
    direction: getTextDirection(locale),
    loading,
    error,
    namespace
  };
}

/**
 * Hook for dynamic namespace loading
 */
export function useNamespaceLoader() {
  const locale = useLocale() as SupportedLocale;
  const [loadingNamespaces, setLoadingNamespaces] = useState<Set<TranslationNamespace>>(new Set());
  const [errors, setErrors] = useState<Map<TranslationNamespace, TranslationError>>(new Map());

  const loadNamespace = useCallback(async (namespace: TranslationNamespace): Promise<TranslationLoadResult> => {
    setLoadingNamespaces(prev => new Set(prev).add(namespace));
    setErrors(prev => new Map(prev).set(namespace, undefined as any));

    try {
      const result = await lazyLoader.loadNamespace(locale, namespace);
      
      if (!result.success && result.error) {
        setErrors(prev => new Map(prev).set(namespace, result.error!));
      }

      return result;
    } catch (error) {
      const translationError: TranslationError = {
        type: 'network_error' as any,
        message: error instanceof Error ? error.message : 'Unknown error',
        locale,
        namespace,
        timestamp: Date.now()
      };
      
      setErrors(prev => new Map(prev).set(namespace, translationError));
      
      return {
        success: false,
        error: translationError
      };
    } finally {
      setLoadingNamespaces(prev => {
        const next = new Set(prev);
        next.delete(namespace);
        return next;
      });
    }
  }, [locale]);

  return {
    loadNamespace,
    loadingNamespaces: Array.from(loadingNamespaces),
    errors: Object.fromEntries(errors.entries()),
    isLoading: (namespace: TranslationNamespace) => loadingNamespaces.has(namespace),
    getError: (namespace: TranslationNamespace) => errors.get(namespace)
  };
}

/**
 * Hook for route-based namespace preloading
 */
export function useRouteNamespaces(pathname: string) {
  const locale = useLocale() as SupportedLocale;
  const [preloaded, setPreloaded] = useState(false);
  const [requiredNamespaces, setRequiredNamespaces] = useState<TranslationNamespace[]>([]);

  useEffect(() => {
    const namespaces = lazyLoader.getRouteNamespaces(pathname);
    setRequiredNamespaces(namespaces);
    
    // Preload namespaces for this route
    lazyLoader.preloadRouteNamespaces(locale, pathname)
      .then(() => setPreloaded(true))
      .catch(error => console.warn('Failed to preload route namespaces:', error));
  }, [pathname, locale]);

  return {
    requiredNamespaces,
    preloaded,
    locale,
    pathname
  };
}

/**
 * Hook for language switching with preloading
 */
export function useLanguageSwitcher() {
  const locale = useLocale() as SupportedLocale;
  const [switching, setSwitching] = useState(false);

  const switchLanguage = useCallback(async (newLocale: SupportedLocale, pathname?: string) => {
    setSwitching(true);
    
    try {
      // Preload global namespaces for the new locale
      await lazyLoader.preloadGlobalNamespaces(newLocale);
      
      // If pathname provided, preload route-specific namespaces
      if (pathname) {
        await lazyLoader.preloadRouteNamespaces(newLocale, pathname);
      }
      
      // Redirect to new locale (client-side navigation)
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${newLocale}`);
      window.location.href = newPath;
    } catch (error) {
      console.error('Failed to switch language:', error);
      // Fallback - direct navigation without preloading
      window.location.href = `/${newLocale}${pathname || ''}`;
    } finally {
      setSwitching(false);
    }
  }, []);

  return {
    currentLocale: locale,
    switching,
    switchLanguage,
    direction: getTextDirection(locale)
  };
}

/**
 * Hook for translation cache management
 */
export function useTranslationCache() {
  const [stats, setStats] = useState(lazyLoader.getCacheStats());

  const refreshStats = useCallback(() => {
    setStats(lazyLoader.getCacheStats());
  }, []);

  const clearCache = useCallback(() => {
    lazyLoader.clearCache();
    refreshStats();
  }, [refreshStats]);

  const clearExpired = useCallback(() => {
    lazyLoader.clearExpiredCache();
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    // Refresh stats every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
    clearCache,
    clearExpired
  };
}

/**
 * Hook for translation error monitoring
 */
export function useTranslationErrors() {
  const [errorStats, setErrorStats] = useState(errorMonitor.getErrorStats());

  const refreshErrorStats = useCallback(() => {
    setErrorStats(errorMonitor.getErrorStats());
  }, []);

  const clearErrors = useCallback(() => {
    errorMonitor.clearErrors();
    refreshErrorStats();
  }, [refreshErrorStats]);

  useEffect(() => {
    // Refresh error stats every minute
    const interval = setInterval(refreshErrorStats, 60000);
    return () => clearInterval(interval);
  }, [refreshErrorStats]);

  return {
    errorStats,
    refreshErrorStats,
    clearErrors,
    hasErrors: errorStats.total > 0
  };
}