import type { 
  SupportedLocale, 
  TranslationNamespace, 
  TranslationMessages, 
  TranslationLoadResult,
  TranslationCache,
  LazyLoadConfig,
  RouteNamespaceRequirement
} from './types';
import { ROUTE_NAMESPACE_MAP, DEFAULT_LOCALE } from './config';
import { fallbackHandler, withTranslationErrorBoundary } from './fallback-handler';

// Default lazy loading configuration
const DEFAULT_LAZY_CONFIG: LazyLoadConfig = {
  preloadGlobal: true,
  cacheTimeout: 1000 * 60 * 30, // 30 minutes
  maxRetries: 3,
  retryDelay: 1000 // 1 second
};

export class TranslationLazyLoader {
  private static instance: TranslationLazyLoader;
  private cache: TranslationCache = {};
  private loadingPromises: Map<string, Promise<TranslationLoadResult>> = new Map();
  private config: LazyLoadConfig;

  private constructor(config: Partial<LazyLoadConfig> = {}) {
    this.config = { ...DEFAULT_LAZY_CONFIG, ...config };
  }

  static getInstance(config?: Partial<LazyLoadConfig>): TranslationLazyLoader {
    if (!TranslationLazyLoader.instance) {
      TranslationLazyLoader.instance = new TranslationLazyLoader(config);
    }
    return TranslationLazyLoader.instance;
  }

  /**
   * Load a single namespace for a locale with caching and fallback
   */
  async loadNamespace(
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    retryCount = 0
  ): Promise<TranslationLoadResult> {
    const cacheKey = `${locale}:${namespace}`;
    
    // Check if we're already loading this namespace
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Check cache first
    const cached = this.getCachedNamespace(locale, namespace);
    if (cached) {
      return {
        success: true,
        messages: cached.messages,
        fromCache: true
      };
    }

    // Create loading promise
    const loadingPromise = this.performNamespaceLoad(locale, namespace, retryCount);
    this.loadingPromises.set(cacheKey, loadingPromise);

    // Clean up loading promise when done
    loadingPromise.finally(() => {
      this.loadingPromises.delete(cacheKey);
    });

    return loadingPromise;
  }

  /**
   * Load multiple namespaces in parallel
   */
  async loadNamespaces(
    locale: SupportedLocale,
    namespaces: TranslationNamespace[]
  ): Promise<Record<TranslationNamespace, TranslationLoadResult>> {
    const loadPromises = namespaces.map(namespace => 
      this.loadNamespace(locale, namespace).then(result => [namespace, result] as const)
    );

    const results = await Promise.allSettled(loadPromises);
    const loadResults: Record<string, TranslationLoadResult> = {};

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const [namespace, loadResult] = result.value;
        loadResults[namespace] = loadResult;
      } else {
        console.error('Failed to load namespace:', result.reason);
      }
    });

    return loadResults as Record<TranslationNamespace, TranslationLoadResult>;
  }

  /**
   * Get required namespaces for a route
   */
  getRouteNamespaces(pathname: string): TranslationNamespace[] {
    // Check exact matches first
    if (pathname in ROUTE_NAMESPACE_MAP) {
      return [...ROUTE_NAMESPACE_MAP[pathname as keyof typeof ROUTE_NAMESPACE_MAP]];
    }

    // Check pattern matches
    for (const [pattern, namespaces] of Object.entries(ROUTE_NAMESPACE_MAP)) {
      if (pattern.includes('[') || pattern.includes('*')) {
        // Convert Next.js dynamic routes to regex
        const regexPattern = pattern
          .replace(/\[.*?\]/g, '[^/]+') // Dynamic segments
          .replace(/\*/g, '.*'); // Wildcards
        
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(pathname)) {
          return [...namespaces];
        }
      }
    }

    // Default to global namespaces
    return [...ROUTE_NAMESPACE_MAP.global];
  }

  /**
   * Preload namespaces for a route
   */
  async preloadRouteNamespaces(
    locale: SupportedLocale,
    pathname: string
  ): Promise<void> {
    const namespaces = this.getRouteNamespaces(pathname);
    
    // Load namespaces in parallel but don't wait for all to complete
    const preloadPromises = namespaces.map(namespace =>
      withTranslationErrorBoundary(
        () => this.loadNamespace(locale, namespace),
        { success: false, messages: {} },
        { locale, namespace }
      )
    );

    // Fire and forget - don't block route rendering
    Promise.allSettled(preloadPromises).then((results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Preloaded ${successful}/${namespaces.length} namespaces for ${pathname}`);
    });
  }

  /**
   * Preload global namespaces that are used everywhere
   */
  async preloadGlobalNamespaces(locale: SupportedLocale): Promise<void> {
    if (!this.config.preloadGlobal) return;

    const globalNamespaces = [...ROUTE_NAMESPACE_MAP.global];
    
    try {
      await this.loadNamespaces(locale, globalNamespaces);
      console.log(`Preloaded global namespaces for ${locale}`);
    } catch (error) {
      console.warn(`Failed to preload global namespaces for ${locale}:`, error);
    }
  }

  /**
   * Get all messages for a locale (loads all cached namespaces)
   */
  getAllMessages(locale: SupportedLocale): Record<string, TranslationMessages> {
    const localeCache = this.cache[locale];
    if (!localeCache) return {};

    const messages: Record<string, TranslationMessages> = {};
    
    Object.entries(localeCache).forEach(([namespace, cached]) => {
      if (this.isCacheValid(cached)) {
        messages[namespace] = cached.messages;
      }
    });

    return messages;
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    Object.keys(this.cache).forEach(locale => {
      const localeCache = this.cache[locale];
      if (localeCache) {
        Object.keys(localeCache).forEach(namespace => {
          if (!this.isCacheValid(localeCache[namespace])) {
            delete localeCache[namespace];
          }
        });
        
        // Remove empty locale entries
        if (Object.keys(localeCache).length === 0) {
          delete this.cache[locale];
        }
      }
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    byLocale: Record<string, number>;
    memoryEstimate: number;
  } {
    let totalEntries = 0;
    const byLocale: Record<string, number> = {};
    let memoryEstimate = 0;

    Object.entries(this.cache).forEach(([locale, localeCache]) => {
      const count = Object.keys(localeCache).length;
      byLocale[locale] = count;
      totalEntries += count;
      
      // Rough memory estimate (JSON.stringify for size estimation)
      Object.values(localeCache).forEach(cached => {
        memoryEstimate += JSON.stringify(cached.messages).length * 2; // UTF-16 chars
      });
    });

    return { totalEntries, byLocale, memoryEstimate };
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache = {};
    this.loadingPromises.clear();
  }

  // Private methods

  private async performNamespaceLoad(
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    retryCount: number
  ): Promise<TranslationLoadResult> {
    try {
      // Try to load the namespace messages
      const messages = await import(`./locales/${locale}/${namespace}.json`);
      const translationMessages = messages.default || messages;

      // Cache the successful load
      this.cacheNamespace(locale, namespace, translationMessages);

      return {
        success: true,
        messages: translationMessages,
        fromCache: false
      };
    } catch (error) {
      console.warn(`Failed to load ${namespace} for ${locale}:`, error);

      // Retry logic
      if (retryCount < this.config.maxRetries) {
        await this.delay(this.config.retryDelay);
        return this.performNamespaceLoad(locale, namespace, retryCount + 1);
      }

      // Use fallback handler for ultimate fallback
      return fallbackHandler.handleTranslationFailure(locale, namespace);
    }
  }

  private getCachedNamespace(
    locale: SupportedLocale,
    namespace: TranslationNamespace
  ): { messages: TranslationMessages; loadedAt: number; ttl: number } | null {
    const localeCache = this.cache[locale];
    if (!localeCache) return null;

    const cached = localeCache[namespace];
    if (!cached || !this.isCacheValid(cached)) return null;

    return cached;
  }

  private cacheNamespace(
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    messages: TranslationMessages
  ): void {
    if (!this.cache[locale]) {
      this.cache[locale] = {};
    }

    this.cache[locale][namespace] = {
      messages,
      loadedAt: Date.now(),
      ttl: this.config.cacheTimeout
    };
  }

  private isCacheValid(cached: { loadedAt: number; ttl: number }): boolean {
    return Date.now() - cached.loadedAt < cached.ttl;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const lazyLoader = TranslationLazyLoader.getInstance();

/**
 * Helper function to get route requirements
 */
export function getRouteRequirements(pathname: string): RouteNamespaceRequirement {
  return {
    route: pathname,
    namespaces: lazyLoader.getRouteNamespaces(pathname),
    preload: pathname === '/' || pathname.startsWith('/dashboard')
  };
}