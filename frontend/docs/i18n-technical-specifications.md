# BiteBase Intelligence i18n - Technical Specifications

## TypeScript Definitions

### Core Types
```typescript
// src/i18n/types.ts
export const SUPPORTED_LOCALES = ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'] as const;
export const RTL_LOCALES = ['ar'] as const;
export const NAMESPACE_DEFINITIONS = [
  'common', 'navigation', 'auth', 'dashboard', 
  'analytics', 'ai', 'insights', 'location', 
  'reports', 'restaurants', 'errors',
  'landing', 'landing-new', 'landing-old'
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export type RTLLocale = typeof RTL_LOCALES[number];
export type NamespaceKey = typeof NAMESPACE_DEFINITIONS[number];
export type TextDirection = 'ltr' | 'rtl';

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export interface LocaleMessages {
  [namespace: string]: TranslationNamespace;
}

export interface TranslationError {
  locale: string;
  namespace: string;
  key: string;
  errorType: TranslationErrorType;
  timestamp: Date;
  fallbackUsed: string;
}

export interface TranslationLoadResult {
  messages: LocaleMessages;
  loadedNamespaces: string[];
  errors: TranslationError[];
  loadTime: number;
}

export interface UserLanguagePreference {
  primary: SupportedLocale;
  fallback?: SupportedLocale;
  autoDetect: boolean;
  lastUpdated: Date;
  source: 'user_selection' | 'browser_detection' | 'geo_detection';
}
```

### Validation Types
```typescript
// src/i18n/validation/types.ts
export interface ValidationRule {
  name: string;
  description: string;
  validate: (value: string, context: ValidationContext) => ValidationResult;
}

export interface ValidationContext {
  locale: SupportedLocale;
  namespace: NamespaceKey;
  key: string;
  referenceValue?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface TranslationQualityMetrics {
  completeness: number;          // % of keys translated
  consistency: number;           // Translation consistency score
  contextAccuracy: number;       // In-context validation score  
  loadTime: number;             // Average namespace load time
  errorRate: number;            // % of translation errors
  fallbackUsage: number;        // % of fallback usage
}
```

## Implementation Specifications

### 1. Lazy Loading System
```typescript
// src/i18n/lazy-loader.ts
import { ROUTE_NAMESPACE_MAP } from './config';
import { SupportedLocale, NamespaceKey, LocaleMessages } from './types';

export class TranslationLazyLoader {
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();
  private errorHandler: TranslationErrorHandler;

  constructor(errorHandler: TranslationErrorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * Load namespaces required for a specific route
   */
  async loadNamespacesForRoute(
    locale: SupportedLocale, 
    pathname: string
  ): Promise<LocaleMessages> {
    const requiredNamespaces = this.getRequiredNamespaces(pathname);
    const messages: LocaleMessages = {};
    const errors: TranslationError[] = [];

    for (const namespace of requiredNamespaces) {
      try {
        const namespaceData = await this.loadNamespace(locale, namespace);
        messages[namespace] = namespaceData;
      } catch (error) {
        const fallbackData = await this.errorHandler.handleNamespaceError(
          locale, namespace, error
        );
        messages[namespace] = fallbackData;
        errors.push(error as TranslationError);
      }
    }

    return messages;
  }

  /**
   * Determine required namespaces based on route pattern
   */
  private getRequiredNamespaces(pathname: string): NamespaceKey[] {
    // Always load global namespaces
    const globalNamespaces: NamespaceKey[] = ['common', 'navigation', 'errors'];
    
    // Find route-specific namespaces
    for (const [routePattern, namespaces] of Object.entries(ROUTE_NAMESPACE_MAP)) {
      if (this.matchesRoute(pathname, routePattern)) {
        return [...new Set([...globalNamespaces, ...namespaces])];
      }
    }
    
    return globalNamespaces;
  }

  /**
   * Match pathname against route pattern (supports wildcards)
   */
  private matchesRoute(pathname: string, pattern: string): boolean {
    if (pattern.includes('*')) {
      const prefix = pattern.replace('*', '');
      return pathname.startsWith(prefix);
    }
    return pathname === pattern || pathname.startsWith(`${pattern}/`);
  }

  /**
   * Load individual namespace with caching
   */
  private async loadNamespace(locale: SupportedLocale, namespace: NamespaceKey): Promise<TranslationNamespace> {
    const cacheKey = `${locale}-${namespace}`;
    
    // Return cached data if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Create new loading promise
    const loadPromise = this.fetchNamespaceData(locale, namespace);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.cache.set(cacheKey, data);
      return data;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Fetch namespace data from file system
   */
  private async fetchNamespaceData(locale: SupportedLocale, namespace: NamespaceKey): Promise<TranslationNamespace> {
    try {
      const namespaceData = await import(`../locales/${locale}/${namespace}.json`);
      return namespaceData.default;
    } catch (error) {
      throw new TranslationError(
        locale,
        namespace,
        '',
        TranslationErrorType.NAMESPACE_MISSING,
        new Date(),
        ''
      );
    }
  }

  /**
   * Preload namespaces for better performance
   */
  async preloadNamespaces(locale: SupportedLocale, namespaces: NamespaceKey[]): Promise<void> {
    const loadPromises = namespaces.map(namespace => 
      this.loadNamespace(locale, namespace).catch(() => {}) // Ignore errors during preload
    );
    await Promise.allSettled(loadPromises);
  }

  /**
   * Clear cache for specific locale or all cache
   */
  clearCache(locale?: SupportedLocale): void {
    if (locale) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(`${locale}-`));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}
```

### 2. Error Handling System
```typescript
// src/i18n/error-handler.ts
export enum TranslationErrorType {
  NAMESPACE_MISSING = 'namespace_missing',
  KEY_MISSING = 'key_missing',
  LOCALE_MISSING = 'locale_missing',
  NETWORK_ERROR = 'network_error',
  PARSE_ERROR = 'parse_error',
  VALIDATION_ERROR = 'validation_error'
}

export class TranslationErrorHandler {
  private errorReporter: ErrorReporter;
  private fallbackLoader: FallbackLoader;

  constructor(errorReporter: ErrorReporter, fallbackLoader: FallbackLoader) {
    this.errorReporter = errorReporter;
    this.fallbackLoader = fallbackLoader;
  }

  /**
   * Handle namespace loading errors
   */
  async handleNamespaceError(
    locale: SupportedLocale,
    namespace: NamespaceKey,
    error: Error
  ): Promise<TranslationNamespace> {
    const translationError = new TranslationError(
      locale,
      namespace,
      '',
      this.determineErrorType(error),
      new Date(),
      ''
    );

    this.errorReporter.reportError(translationError);

    // Execute fallback chain
    return this.executeFallbackChain(locale, namespace);
  }

  /**
   * Execute multi-level fallback strategy
   */
  private async executeFallbackChain(
    locale: SupportedLocale,
    namespace: NamespaceKey
  ): Promise<TranslationNamespace> {
    const fallbackStrategies = [
      () => this.fallbackLoader.loadUserSecondaryLanguage(locale, namespace),
      () => this.fallbackLoader.loadEnglishNamespace(namespace),
      () => this.fallbackLoader.getEmptyNamespace(namespace)
    ];

    for (const strategy of fallbackStrategies) {
      try {
        const result = await strategy();
        if (result && Object.keys(result).length > 0) {
          return result;
        }
      } catch (fallbackError) {
        continue; // Try next strategy
      }
    }

    // Ultimate fallback - return empty namespace
    return {};
  }

  /**
   * Handle missing translation key
   */
  handleMissingKey(
    locale: SupportedLocale,
    namespace: NamespaceKey,
    key: string
  ): string {
    const error = new TranslationError(
      locale,
      namespace,
      key,
      TranslationErrorType.KEY_MISSING,
      new Date(),
      key
    );

    this.errorReporter.reportError(error);

    // Return development-friendly fallback
    return process.env.NODE_ENV === 'development' 
      ? `[${locale}.${namespace}.${key}]`
      : key;
  }

  private determineErrorType(error: Error): TranslationErrorType {
    if (error.message.includes('Cannot resolve module')) {
      return TranslationErrorType.NAMESPACE_MISSING;
    }
    if (error.name === 'SyntaxError') {
      return TranslationErrorType.PARSE_ERROR;
    }
    return TranslationErrorType.NETWORK_ERROR;
  }
}
```

### 3. Validation System
```typescript
// src/i18n/validation/validator.ts
export class TranslationValidator {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Validate translation completeness
   */
  async validateCompleteness(
    referenceLocale: SupportedLocale = 'en',
    targetLocale: SupportedLocale
  ): Promise<ValidationResult> {
    const referenceMessages = await this.loadAllNamespaces(referenceLocale);
    const targetMessages = await this.loadAllNamespaces(targetLocale);

    const results = {
      missingKeys: [] as string[],
      extraKeys: [] as string[],
      malformedValues: [] as string[],
      completeness: 0,
      errors: [] as ValidationError[],
      warnings: [] as ValidationWarning[]
    };

    // Compare all keys recursively
    this.compareMessages(referenceMessages, targetMessages, '', results);

    // Calculate completion percentage
    const totalKeys = this.countKeys(referenceMessages);
    const presentKeys = totalKeys - results.missingKeys.length;
    results.completeness = totalKeys > 0 ? (presentKeys / totalKeys) * 100 : 100;

    return {
      isValid: results.completeness >= 95 && results.errors.length === 0,
      errors: results.errors,
      warnings: results.warnings
    };
  }

  /**
   * Validate translation quality
   */
  async validateQuality(
    locale: SupportedLocale,
    namespace: NamespaceKey
  ): Promise<TranslationQualityMetrics> {
    const messages = await this.loadNamespace(locale, namespace);
    const referenceMessages = await this.loadNamespace('en', namespace);

    return {
      completeness: this.calculateCompleteness(referenceMessages, messages),
      consistency: await this.calculateConsistency(messages),
      contextAccuracy: await this.validateContextAccuracy(locale, namespace, messages),
      loadTime: await this.measureLoadTime(locale, namespace),
      errorRate: await this.calculateErrorRate(locale, namespace),
      fallbackUsage: await this.calculateFallbackUsage(locale, namespace)
    };
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        name: 'no-empty-values',
        description: 'Translation values should not be empty',
        validate: (value) => ({
          isValid: value.trim().length > 0,
          errors: value.trim().length === 0 ? [{ message: 'Empty translation value' }] : [],
          warnings: []
        })
      },
      {
        name: 'placeholder-consistency',
        description: 'Placeholders should match between reference and target',
        validate: (value, context) => {
          const referencePlaceholders = this.extractPlaceholders(context.referenceValue || '');
          const targetPlaceholders = this.extractPlaceholders(value);
          
          const missing = referencePlaceholders.filter(p => !targetPlaceholders.includes(p));
          const extra = targetPlaceholders.filter(p => !referencePlaceholders.includes(p));

          return {
            isValid: missing.length === 0 && extra.length === 0,
            errors: [
              ...missing.map(p => ({ message: `Missing placeholder: ${p}` })),
              ...extra.map(p => ({ message: `Extra placeholder: ${p}` }))
            ],
            warnings: []
          };
        }
      }
    ];
  }

  private extractPlaceholders(text: string): string[] {
    const matches = text.match(/{[^}]+}/g) || [];
    return matches.map(match => match.slice(1, -1));
  }
}
```

### 4. Performance Monitoring
```typescript
// src/i18n/monitoring/performance-monitor.ts
export class I18nPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();

  /**
   * Track translation loading performance
   */
  trackLoadTime(locale: SupportedLocale, namespace: NamespaceKey, duration: number): void {
    const key = `${locale}-${namespace}`;
    const metrics = this.metrics.get(key) || [];
    
    metrics.push({
      timestamp: Date.now(),
      duration,
      type: 'load_time'
    });

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.metrics.set(key, metrics);
  }

  /**
   * Get performance statistics
   */
  getStats(locale?: SupportedLocale, namespace?: NamespaceKey): PerformanceStats {
    const relevantMetrics = this.getRelevantMetrics(locale, namespace);
    
    if (relevantMetrics.length === 0) {
      return {
        averageLoadTime: 0,
        p95LoadTime: 0,
        errorRate: 0,
        totalRequests: 0
      };
    }

    const durations = relevantMetrics.map(m => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);

    return {
      averageLoadTime: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p95LoadTime: durations[p95Index] || 0,
      errorRate: this.calculateErrorRate(relevantMetrics),
      totalRequests: relevantMetrics.length
    };
  }

  private getRelevantMetrics(locale?: SupportedLocale, namespace?: NamespaceKey): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = [];
    
    for (const [key, metrics] of this.metrics.entries()) {
      if (locale && !key.startsWith(`${locale}-`)) continue;
      if (namespace && !key.endsWith(`-${namespace}`)) continue;
      
      allMetrics.push(...metrics);
    }

    return allMetrics;
  }
}
```

### 5. Translation Management CLI
```typescript
// scripts/translation-cli.ts
#!/usr/bin/env node
import { Command } from 'commander';
import { TranslationExtractor } from './extractors/translation-extractor';
import { TranslationValidator } from '../src/i18n/validation/validator';
import { TranslationSyncer } from './sync/translation-syncer';

const program = new Command();

program
  .name('i18n-cli')
  .description('BiteBase Intelligence Translation Management CLI')
  .version('1.0.0');

program
  .command('extract')
  .description('Extract translation keys from source code')
  .option('-o, --output <path>', 'output file path', './translations-to-add.json')
  .action(async (options) => {
    const extractor = new TranslationExtractor();
    const newKeys = await extractor.extractFromCodebase('./src');
    
    console.log(`Found ${newKeys.length} new translation keys`);
    await extractor.saveToFile(newKeys, options.output);
    console.log(`Keys saved to ${options.output}`);
  });

program
  .command('validate')
  .description('Validate translation files')
  .option('-l, --locale <locale>', 'specific locale to validate')
  .option('-n, --namespace <namespace>', 'specific namespace to validate')
  .option('--fail-on-warnings', 'exit with error code on warnings')
  .action(async (options) => {
    const validator = new TranslationValidator();
    
    if (options.locale) {
      const result = await validator.validateCompleteness('en', options.locale);
      console.log(`Validation result for ${options.locale}:`);
      console.log(`Completeness: ${result.completeness?.toFixed(2)}%`);
      console.log(`Errors: ${result.errors.length}`);
      console.log(`Warnings: ${result.warnings.length}`);
      
      if (!result.isValid || (options.failOnWarnings && result.warnings.length > 0)) {
        process.exit(1);
      }
    } else {
      // Validate all locales
      for (const locale of SUPPORTED_LOCALES) {
        if (locale === 'en') continue;
        
        const result = await validator.validateCompleteness('en', locale);
        console.log(`${locale}: ${result.completeness?.toFixed(1)}% complete`);
      }
    }
  });

program
  .command('sync')
  .description('Sync translation keys across all languages')
  .option('--dry-run', 'show what would be changed without making changes')
  .action(async (options) => {
    const syncer = new TranslationSyncer();
    
    if (options.dryRun) {
      const changes = await syncer.previewSync();
      console.log('Sync preview:', changes);
    } else {
      const result = await syncer.syncAll();
      console.log(`Sync completed: ${result.filesModified} files updated`);
    }
  });

program
  .command('audit')
  .description('Generate comprehensive translation audit report')
  .option('-f, --format <format>', 'output format (json|html|md)', 'md')
  .option('-o, --output <path>', 'output file path')
  .action(async (options) => {
    const auditor = new TranslationAuditor();
    const report = await auditor.generateReport();
    
    const output = await auditor.formatReport(report, options.format);
    
    if (options.output) {
      await fs.writeFile(options.output, output);
      console.log(`Audit report saved to ${options.output}`);
    } else {
      console.log(output);
    }
  });

program.parse();
```

## Configuration Files

### Next.js Configuration
```typescript
// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle analysis for translation optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      // Analyze bundle sizes for translations
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `Build ID: ${buildId}`,
        })
      );
    }

    // Optimize translation loading
    config.optimization.splitChunks.cacheGroups.translations = {
      test: /[\\/]i18n[\\/]locales[\\/]/,
      name: 'translations',
      chunks: 'all',
      enforce: true,
    };

    return config;
  },

  // Environment variables for i18n
  env: {
    NEXT_PUBLIC_SUPPORTED_LOCALES: SUPPORTED_LOCALES.join(','),
    NEXT_PUBLIC_DEFAULT_LOCALE: DEFAULT_LOCALE,
  },

  // Experimental features for better i18n support
  experimental: {
    optimizeCss: true,
  }
};

export default withNextIntl(nextConfig);
```

### TypeScript Configuration
```json
// tsconfig.json additions
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/i18n/*": ["src/i18n/*"],
      "@/locales/*": ["src/i18n/locales/*"]
    }
  },
  "include": [
    "src/i18n/**/*.ts",
    "src/i18n/**/*.d.ts"
  ]
}
```

### Testing Configuration
```typescript
// jest.config.js additions
module.exports = {
  testMatch: [
    '<rootDir>/src/i18n/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/tests/i18n/**/*.{js,jsx,ts,tsx}'
  ],
  moduleNameMapping: {
    '^@/i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^@/locales/(.*)$': '<rootDir>/src/i18n/locales/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/i18n/setup.ts']
};
```

This technical specification provides the complete implementation details for the BiteBase Intelligence i18n architecture, including all TypeScript definitions, core system implementations, CLI tools, and configuration files needed for successful deployment.