import type { 
  SupportedLocale, 
  TranslationNamespace, 
  TranslationValidationResult,
  TranslationMessages 
} from './types';
import { SUPPORTED_LOCALES, ALL_NAMESPACES, DEFAULT_LOCALE } from './config';

/**
 * Translation completeness validator
 * Compares translations against the reference English locale
 */
export class TranslationValidator {
  private static instance: TranslationValidator;
  private referenceMessages: Map<TranslationNamespace, TranslationMessages> = new Map();

  private constructor() {}

  static getInstance(): TranslationValidator {
    if (!TranslationValidator.instance) {
      TranslationValidator.instance = new TranslationValidator();
    }
    return TranslationValidator.instance;
  }

  /**
   * Load reference messages (English) for comparison
   */
  async loadReferenceMessages(): Promise<void> {
    for (const namespace of ALL_NAMESPACES) {
      try {
        const messages = await import(`./locales/${DEFAULT_LOCALE}/${namespace}.json`);
        this.referenceMessages.set(namespace, messages.default || messages);
      } catch (error) {
        console.warn(`Failed to load reference ${namespace}:`, error);
        this.referenceMessages.set(namespace, {});
      }
    }
  }

  /**
   * Validate a single namespace for a locale
   */
  async validateNamespace(
    locale: SupportedLocale,
    namespace: TranslationNamespace
  ): Promise<TranslationValidationResult> {
    // Ensure reference messages are loaded
    if (!this.referenceMessages.has(namespace)) {
      await this.loadReferenceMessages();
    }

    const referenceMessages = this.referenceMessages.get(namespace) || {};
    
    try {
      // Load target locale messages
      const targetModule = await import(`./locales/${locale}/${namespace}.json`);
      const targetMessages = targetModule.default || targetModule;

      // Extract all keys from both reference and target
      const referenceKeys = this.extractAllKeys(referenceMessages);
      const targetKeys = this.extractAllKeys(targetMessages);

      // Find missing and extra keys
      const missingKeys = referenceKeys.filter(key => !targetKeys.includes(key));
      const extraKeys = targetKeys.filter(key => !referenceKeys.includes(key));

      // Calculate completeness percentage
      const completeness = referenceKeys.length > 0 
        ? (referenceKeys.length - missingKeys.length) / referenceKeys.length 
        : 1;

      return {
        locale,
        namespace,
        completeness,
        missingKeys,
        extraKeys,
        isValid: missingKeys.length === 0
      };
    } catch (error) {
      // Namespace doesn't exist for this locale
      const referenceKeys = this.extractAllKeys(referenceMessages);
      
      return {
        locale,
        namespace,
        completeness: 0,
        missingKeys: referenceKeys,
        extraKeys: [],
        isValid: false
      };
    }
  }

  /**
   * Validate all namespaces for a locale
   */
  async validateLocale(locale: SupportedLocale): Promise<TranslationValidationResult[]> {
    const results = await Promise.all(
      ALL_NAMESPACES.map(namespace => this.validateNamespace(locale, namespace))
    );

    return results;
  }

  /**
   * Validate all locales and namespaces
   */
  async validateAll(): Promise<Record<SupportedLocale, TranslationValidationResult[]>> {
    await this.loadReferenceMessages();

    const results: Record<string, TranslationValidationResult[]> = {};

    for (const locale of SUPPORTED_LOCALES) {
      if (locale !== DEFAULT_LOCALE) {
        results[locale] = await this.validateLocale(locale);
      }
    }

    return results as Record<SupportedLocale, TranslationValidationResult[]>;
  }

  /**
   * Generate a completeness report
   */
  async generateCompletenessReport(): Promise<{
    overall: number;
    byLocale: Record<SupportedLocale, number>;
    byNamespace: Record<TranslationNamespace, Record<SupportedLocale, number>>;
    summary: {
      totalKeys: number;
      locales: number;
      namespaces: number;
      avgCompleteness: number;
    };
  }> {
    const validationResults = await this.validateAll();
    
    const byLocale: Record<string, number> = {};
    const byNamespace: Record<string, Record<string, number>> = {};
    let totalCompleteness = 0;
    let localeCount = 0;

    // Initialize namespace tracking
    for (const namespace of ALL_NAMESPACES) {
      byNamespace[namespace] = {};
    }

    // Process validation results
    Object.entries(validationResults).forEach(([locale, results]) => {
      const localeCompleteness = results.reduce((sum, result) => sum + result.completeness, 0) / results.length;
      byLocale[locale] = localeCompleteness;
      totalCompleteness += localeCompleteness;
      localeCount++;

      // Track by namespace
      results.forEach(result => {
        byNamespace[result.namespace][locale] = result.completeness;
      });
    });

    // Calculate reference key count
    const totalKeys = Array.from(this.referenceMessages.values())
      .reduce((sum, messages) => sum + this.extractAllKeys(messages).length, 0);

    return {
      overall: totalCompleteness / localeCount,
      byLocale: byLocale as Record<SupportedLocale, number>,
      byNamespace: byNamespace as Record<TranslationNamespace, Record<SupportedLocale, number>>,
      summary: {
        totalKeys,
        locales: localeCount,
        namespaces: ALL_NAMESPACES.length,
        avgCompleteness: totalCompleteness / localeCount
      }
    };
  }

  /**
   * Find untranslated content (keys with English values in non-English locales)
   */
  async findUntranslatedContent(locale: SupportedLocale): Promise<{
    namespace: TranslationNamespace;
    untranslatedKeys: { key: string; value: string }[];
  }[]> {
    if (locale === DEFAULT_LOCALE) {
      return [];
    }

    await this.loadReferenceMessages();
    
    const results = [];

    for (const namespace of ALL_NAMESPACES) {
      try {
        const targetModule = await import(`./locales/${locale}/${namespace}.json`);
        const targetMessages = targetModule.default || targetModule;
        const referenceMessages = this.referenceMessages.get(namespace) || {};

        const untranslatedKeys = this.findUntranslatedKeys(referenceMessages, targetMessages);

        if (untranslatedKeys.length > 0) {
          results.push({
            namespace,
            untranslatedKeys
          });
        }
      } catch (error) {
        // Namespace doesn't exist - all keys are untranslated
        const referenceMessages = this.referenceMessages.get(namespace) || {};
        const allKeys = this.extractAllKeysWithValues(referenceMessages);
        
        if (allKeys.length > 0) {
          results.push({
            namespace,
            untranslatedKeys: allKeys
          });
        }
      }
    }

    return results;
  }

  // Private helper methods

  private extractAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        keys.push(...this.extractAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    });
    
    return keys;
  }

  private extractAllKeysWithValues(obj: any, prefix = ''): { key: string; value: string }[] {
    const keys: { key: string; value: string }[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        keys.push(...this.extractAllKeysWithValues(value, fullKey));
      } else {
        keys.push({ key: fullKey, value: String(value) });
      }
    });
    
    return keys;
  }

  private findUntranslatedKeys(
    reference: any, 
    target: any, 
    prefix = ''
  ): { key: string; value: string }[] {
    const untranslated: { key: string; value: string }[] = [];
    
    Object.entries(reference).forEach(([key, refValue]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const targetValue = target?.[key];
      
      if (typeof refValue === 'object' && refValue !== null) {
        if (typeof targetValue === 'object' && targetValue !== null) {
          untranslated.push(...this.findUntranslatedKeys(refValue, targetValue, fullKey));
        } else {
          // Entire nested object is missing
          untranslated.push(...this.extractAllKeysWithValues(refValue, fullKey));
        }
      } else if (targetValue === refValue && typeof refValue === 'string') {
        // Same value as reference - likely untranslated
        untranslated.push({ key: fullKey, value: String(refValue) });
      }
    });
    
    return untranslated;
  }
}

// Export singleton instance
export const translationValidator = TranslationValidator.getInstance();

/**
 * CLI utility functions for validation
 */
export async function validateTranslations(locale?: SupportedLocale) {
  if (locale) {
    return await translationValidator.validateLocale(locale);
  }
  return await translationValidator.validateAll();
}

export async function generateReport() {
  return await translationValidator.generateCompletenessReport();
}

export async function findUntranslated(locale: SupportedLocale) {
  return await translationValidator.findUntranslatedContent(locale);
}