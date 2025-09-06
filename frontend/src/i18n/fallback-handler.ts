import type { 
  SupportedLocale, 
  TranslationNamespace, 
  TranslationError, 
  TranslationMessages,
  TranslationLoadResult 
} from './types';
import { TranslationErrorType, DEFAULT_LOCALE, SUPPORTED_LOCALES } from './config';

// Production error monitoring
class TranslationErrorMonitor {
  private errors: TranslationError[] = [];
  private errorCounts: Map<string, number> = new Map();

  logError(error: TranslationError): void {
    this.errors.push(error);
    const errorKey = `${error.type}:${error.locale}:${error.namespace}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // In production, you might want to send these to an analytics service
    if (process.env.NODE_ENV === 'production') {
      console.warn('Translation Error:', {
        type: error.type,
        locale: error.locale,
        namespace: error.namespace,
        key: error.key,
        message: error.message,
        count: this.errorCounts.get(errorKey)
      });
    } else {
      console.error('Translation Error:', error);
    }
  }

  getErrorStats(): { total: number; byType: Record<string, number>; byLocale: Record<string, number> } {
    const byType: Record<string, number> = {};
    const byLocale: Record<string, number> = {};

    this.errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      byLocale[error.locale] = (byLocale[error.locale] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType,
      byLocale
    };
  }

  clearErrors(): void {
    this.errors = [];
    this.errorCounts.clear();
  }
}

export const errorMonitor = new TranslationErrorMonitor();

// Multi-level fallback chain
export class TranslationFallbackHandler {
  private static instance: TranslationFallbackHandler;
  private cache: Map<string, TranslationMessages> = new Map();

  private constructor() {}

  static getInstance(): TranslationFallbackHandler {
    if (!TranslationFallbackHandler.instance) {
      TranslationFallbackHandler.instance = new TranslationFallbackHandler();
    }
    return TranslationFallbackHandler.instance;
  }

  /**
   * Multi-level fallback strategy:
   * 1. Try primary language + namespace
   * 2. Try user's secondary language + namespace (if different)
   * 3. Try English + namespace
   * 4. Return key path as fallback
   */
  async handleTranslationFailure(
    primaryLocale: SupportedLocale,
    namespace: TranslationNamespace,
    key?: string,
    secondaryLocale?: SupportedLocale
  ): Promise<TranslationLoadResult> {
    const cacheKey = `${primaryLocale}:${namespace}`;
    
    // Check if we already have this namespace cached for primary locale
    if (this.cache.has(cacheKey)) {
      return {
        success: true,
        messages: this.cache.get(cacheKey)!,
        fromCache: true
      };
    }

    // Step 1: Try secondary language if provided and different from primary
    if (secondaryLocale && secondaryLocale !== primaryLocale && secondaryLocale !== DEFAULT_LOCALE) {
      try {
        const fallbackMessages = await this.loadNamespaceMessages(secondaryLocale, namespace);
        this.cache.set(cacheKey, fallbackMessages);
        
        errorMonitor.logError({
          type: TranslationErrorType.LOCALE_MISSING,
          message: `Falling back from ${primaryLocale} to ${secondaryLocale} for ${namespace}`,
          locale: primaryLocale,
          namespace,
          key: key || 'unknown',
          timestamp: Date.now()
        });

        return {
          success: true,
          messages: fallbackMessages,
          fromCache: false
        };
      } catch (secondaryError) {
        // Continue to English fallback
      }
    }

    // Step 2: Try English fallback (if not already English)
    if (primaryLocale !== DEFAULT_LOCALE) {
      try {
        const englishMessages = await this.loadNamespaceMessages(DEFAULT_LOCALE, namespace);
        this.cache.set(cacheKey, englishMessages);
        
        errorMonitor.logError({
          type: TranslationErrorType.LOCALE_MISSING,
          message: `Falling back from ${primaryLocale} to English for ${namespace}`,
          locale: primaryLocale,
          namespace,
          key: key || 'unknown',
          timestamp: Date.now()
        });

        return {
          success: true,
          messages: englishMessages,
          fromCache: false
        };
      } catch (englishError) {
        // Continue to ultimate fallback
      }
    }

    // Step 3: Ultimate fallback - return empty object with error
    const error: TranslationError = {
      type: TranslationErrorType.NAMESPACE_MISSING,
      message: `Complete failure loading ${namespace} for ${primaryLocale}`,
      locale: primaryLocale,
      namespace,
      key: key || 'unknown',
      timestamp: Date.now()
    };

    errorMonitor.logError(error);

    return {
      success: false,
      messages: {},
      error
    };
  }

  /**
   * Handle missing translation key with fallback chain
   */
  handleMissingKey(
    locale: SupportedLocale,
    namespace: TranslationNamespace,
    keyPath: string,
    englishMessages?: TranslationMessages
  ): string {
    // Try to get the key from English messages if available
    if (englishMessages) {
      const englishValue = this.getNestedValue(englishMessages, keyPath);
      if (englishValue && typeof englishValue === 'string') {
        errorMonitor.logError({
          type: TranslationErrorType.KEY_MISSING,
          message: `Missing key ${keyPath} in ${locale}, using English fallback`,
          locale,
          namespace,
          key: keyPath,
          timestamp: Date.now()
        });
        return englishValue;
      }
    }

    // Ultimate fallback - return the key path itself
    errorMonitor.logError({
      type: TranslationErrorType.KEY_MISSING,
      message: `Missing key ${keyPath} in ${locale}, returning key path`,
      locale,
      namespace,
      key: keyPath,
      timestamp: Date.now()
    });

    return keyPath;
  }

  /**
   * Load namespace messages from the unified source
   */
  private async loadNamespaceMessages(
    locale: SupportedLocale,
    namespace: TranslationNamespace
  ): Promise<TranslationMessages> {
    try {
      const messages = await import(`./locales/${locale}/${namespace}.json`);
      return messages.default || messages;
    } catch (error) {
      throw new Error(`Failed to load ${namespace} for ${locale}: ${error}`);
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Preload critical namespaces for better performance
   */
  async preloadCriticalNamespaces(locale: SupportedLocale): Promise<void> {
    const criticalNamespaces: TranslationNamespace[] = ['common', 'navigation', 'errors'];
    
    const preloadPromises = criticalNamespaces.map(async (namespace) => {
      try {
        const messages = await this.loadNamespaceMessages(locale, namespace);
        this.cache.set(`${locale}:${namespace}`, messages);
      } catch (error) {
        console.warn(`Failed to preload ${namespace} for ${locale}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Clear cache for memory management
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const fallbackHandler = TranslationFallbackHandler.getInstance();

/**
 * Graceful error boundary for translation loading
 */
export function withTranslationErrorBoundary<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  context: { locale: SupportedLocale; namespace?: TranslationNamespace }
): Promise<T> {
  return operation().catch((error) => {
    errorMonitor.logError({
      type: TranslationErrorType.NETWORK_ERROR,
      message: error.message || 'Unknown translation loading error',
      locale: context.locale,
      namespace: context.namespace || 'common',
      timestamp: Date.now()
    });

    return fallbackValue;
  });
}