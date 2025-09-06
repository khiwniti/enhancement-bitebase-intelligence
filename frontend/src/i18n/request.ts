import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import type { SupportedLocale, TranslationNamespace } from './types';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  ALL_NAMESPACES,
  ROUTE_NAMESPACE_MAP
} from './config';
import { lazyLoader } from './lazy-loader';
import { fallbackHandler, withTranslationErrorBoundary } from './fallback-handler';

/**
 * Enhanced next-intl request configuration with lazy loading support
 * Routes to specific namespaces and provides comprehensive error handling
 */
export default getRequestConfig(async ({ locale }) => {
  // Validate and sanitize locale
  const validLocale = (
    locale && SUPPORTED_LOCALES.includes(locale as SupportedLocale)
      ? locale as SupportedLocale
      : DEFAULT_LOCALE
  );

  if (process.env.NODE_ENV === 'development') {
    console.log('i18n Request config:', {
      requested: locale,
      using: validLocale,
      available: SUPPORTED_LOCALES
    });
  }

  try {
    // Get current pathname for route-based namespace loading
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/';
    
    // Determine required namespaces for this route
    const routeNamespaces = lazyLoader.getRouteNamespaces(pathname);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Route ${pathname} requires namespaces:`, routeNamespaces);
    }

    // Load required namespaces with error boundary
    const namespaceResults = await withTranslationErrorBoundary(
      () => lazyLoader.loadNamespaces(validLocale, routeNamespaces),
      {} as Record<TranslationNamespace, any>,
      { locale: validLocale }
    );

    // Build messages object from successful loads
    const messages: Record<string, any> = {};
    let successfulLoads = 0;

    Object.entries(namespaceResults).forEach(([namespace, result]) => {
      if (result.success && result.messages) {
        messages[namespace] = result.messages;
        successfulLoads++;
      } else if (result.error) {
        // Log namespace loading errors
        console.warn(`Namespace ${namespace} failed:`, result.error.message);
      }
    });

    // Preload global namespaces for next requests
    if (successfulLoads > 0) {
      // Fire and forget - preload for better performance
      fallbackHandler.preloadCriticalNamespaces(validLocale).catch(error => {
        console.warn('Failed to preload critical namespaces:', error);
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Successfully loaded ${successfulLoads}/${routeNamespaces.length} namespaces for ${validLocale}`);
    }

    return {
      locale: validLocale,
      messages,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      now: new Date()
    };

  } catch (error) {
    console.error(`Critical error in request config for ${validLocale}:`, error);
    
    // Ultimate fallback - try to load minimal set
    try {
      const fallbackResult = await fallbackHandler.handleTranslationFailure(
        validLocale,
        'common'
      );

      return {
        locale: fallbackResult.success ? validLocale : DEFAULT_LOCALE,
        messages: {
          common: fallbackResult.messages || {}
        },
        timeZone: 'UTC',
        now: new Date()
      };
    } catch (fallbackError) {
      console.error('Complete fallback failure:', fallbackError);
      
      // Return minimal config to prevent app crash
      return {
        locale: DEFAULT_LOCALE,
        messages: {},
        timeZone: 'UTC',
        now: new Date()
      };
    }
  }
});

/**
 * Utility to get all available namespaces for a locale
 * Used by components that need to check namespace availability
 */
export async function getAvailableNamespaces(locale: SupportedLocale): Promise<TranslationNamespace[]> {
  const available: TranslationNamespace[] = [];
  
  for (const namespace of ALL_NAMESPACES) {
    try {
      await import(`./locales/${locale}/${namespace}.json`);
      available.push(namespace);
    } catch {
      // Namespace not available for this locale
    }
  }
  
  return available;
}

/**
 * Preload namespaces for route navigation
 * Can be called from route components or navigation handlers
 */
export async function preloadRouteNamespaces(
  locale: SupportedLocale,
  pathname: string
): Promise<void> {
  return lazyLoader.preloadRouteNamespaces(locale, pathname);
}