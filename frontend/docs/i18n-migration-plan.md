# BiteBase Intelligence i18n - Migration Implementation Plan

## Migration Overview

This document provides step-by-step implementation instructions for migrating from the current dual-source translation structure to the comprehensive unified i18n architecture.

## Phase 1: Infrastructure Setup (Week 1-2)

### Step 1.1: Create New Directory Structure
```bash
# Create new unified structure
mkdir -p frontend/src/i18n/locales
mkdir -p frontend/src/i18n/locales/{en,zh,es,fr,de,th,ar,it,pt,ja,ko}
```

### Step 1.2: Create Core Configuration Files

**`frontend/src/i18n/config.ts`**
```typescript
export const SUPPORTED_LOCALES = ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'] as const;
export const DEFAULT_LOCALE = 'en';
export const RTL_LOCALES = ['ar'] as const;

export const NAMESPACE_DEFINITIONS = [
  'common', 'navigation', 'auth', 'dashboard', 
  'analytics', 'ai', 'insights', 'location', 
  'reports', 'restaurants', 'errors',
  'landing', 'landing-new', 'landing-old'
] as const;

export const ROUTE_NAMESPACE_MAP = {
  '/dashboard': ['common', 'navigation', 'dashboard'],
  '/analytics': ['common', 'navigation', 'analytics'],
  '/ai-assistant': ['common', 'navigation', 'ai'],
  '/ai-center': ['common', 'navigation', 'ai'],
  '/restaurant-management': ['common', 'navigation', 'restaurants'],
  '/location-intelligence': ['common', 'navigation', 'location'],
  '/reports': ['common', 'navigation', 'reports'],
  '/auth/*': ['common', 'auth'],
  '/': ['common', 'navigation', 'landing']
} as const;
```

**`frontend/src/i18n/types.ts`**
```typescript
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export type NamespaceKey = typeof NAMESPACE_DEFINITIONS[number];
export type TranslationKey = string;

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export interface LocaleData {
  [namespace: string]: TranslationNamespace;
}
```

### Step 1.3: Implementation Priority Matrix
```
Priority | Languages | Completion Target | Timeline
---------|-----------|------------------|----------
Tier 1   | zh,es,fr,de | 100% of 18 namespaces | Week 3-8
Tier 2   | th,ar      | 100% of 18 namespaces | Week 9-12
Tier 3   | it,pt,ja,ko | 100% of 18 namespaces | Week 13-16
```

## Phase 2: Data Migration (Week 2-3)

### Step 2.1: Automated Migration Script
```typescript
// scripts/migrate-translations.ts
import * as fs from 'fs';
import * as path from 'path';

const MIGRATION_CONFIG = {
  source: 'src/messages',
  destination: 'src/i18n/locales',
  publicSource: 'public/locales', // To be removed after validation
  backupDir: 'migration-backup'
};

async function migrateTranslations() {
  // 1. Create backup of existing translations
  // 2. Copy from src/messages to src/i18n/locales
  // 3. Validate file structure consistency
  // 4. Generate migration report
  // 5. Update import paths
}
```

### Step 2.2: Translation Validation
```typescript
// scripts/validate-translations.ts
interface ValidationResult {
  missingKeys: string[];
  extraKeys: string[];
  malformedJson: string[];
  completeness: number;
}

function validateTranslationCompleteness(
  referenceLocale: string = 'en',
  targetLocale: string
): ValidationResult {
  // Compare target locale against reference
  // Identify missing/extra keys
  // Check JSON syntax
  // Calculate completion percentage
}
```

## Phase 3: Lazy Loading Implementation (Week 3-4)

### Step 3.1: Create Lazy Loader
**`frontend/src/i18n/lazy-loader.ts`**
```typescript
import { ROUTE_NAMESPACE_MAP, NAMESPACE_DEFINITIONS } from './config';

interface LoadedNamespace {
  [locale: string]: {
    [namespace: string]: any;
  };
}

class TranslationLazyLoader {
  private loadedNamespaces: LoadedNamespace = {};
  private loadingPromises: Map<string, Promise<any>> = new Map();

  async loadNamespacesForRoute(
    locale: string, 
    pathname: string
  ): Promise<any> {
    const requiredNamespaces = this.getRequiredNamespaces(pathname);
    const messages: Record<string, any> = {};

    for (const namespace of requiredNamespaces) {
      const namespaceData = await this.loadNamespace(locale, namespace);
      messages[namespace] = namespaceData;
    }

    return messages;
  }

  private getRequiredNamespaces(pathname: string): string[] {
    // Match route patterns and return required namespaces
    for (const [route, namespaces] of Object.entries(ROUTE_NAMESPACE_MAP)) {
      if (this.matchesRoute(pathname, route)) {
        return namespaces;
      }
    }
    return ['common', 'navigation']; // Default fallback
  }

  private async loadNamespace(locale: string, namespace: string) {
    const cacheKey = `${locale}-${namespace}`;
    
    if (this.loadedNamespaces[locale]?.[namespace]) {
      return this.loadedNamespaces[locale][namespace];
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadPromise = this.fetchNamespace(locale, namespace);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.cacheNamespace(locale, namespace, data);
      return data;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }
}
```

### Step 3.2: Update Request Configuration
**`frontend/src/i18n/request.ts`** (Updated)
```typescript
import { getRequestConfig } from 'next-intl/server';
import { TranslationLazyLoader } from './lazy-loader';

const lazyLoader = new TranslationLazyLoader();

export default getRequestConfig(async ({ locale, pathname }) => {
  try {
    const messages = await lazyLoader.loadNamespacesForRoute(
      locale || 'en', 
      pathname || '/'
    );

    return {
      locale: locale || 'en',
      messages,
      timeZone: 'UTC'
    };
  } catch (error) {
    // Fallback error handling
    return {
      locale: 'en',
      messages: await lazyLoader.loadNamespacesForRoute('en', '/'),
      timeZone: 'UTC'
    };
  }
});
```

## Phase 4: Error Handling & Fallbacks (Week 4-5)

### Step 4.1: Comprehensive Error Handler
**`frontend/src/i18n/fallback-handler.ts`**
```typescript
export enum TranslationErrorType {
  NAMESPACE_MISSING = 'namespace_missing',
  KEY_MISSING = 'key_missing',
  LOCALE_MISSING = 'locale_missing',
  NETWORK_ERROR = 'network_error',
  PARSE_ERROR = 'parse_error'
}

export class TranslationFallbackHandler {
  private errorLogger: (error: TranslationError) => void;
  
  async handleMissingTranslation(
    locale: string,
    namespace: string,
    key: string,
    errorType: TranslationErrorType
  ): Promise<string> {
    this.logError({ locale, namespace, key, errorType });

    // Multi-level fallback strategy
    return await this.executeFallbackChain(locale, namespace, key);
  }

  private async executeFallbackChain(
    locale: string,
    namespace: string,
    key: string
  ): Promise<string> {
    const fallbackChain = [
      () => this.tryUserSecondLanguage(locale, namespace, key),
      () => this.tryEnglishNamespace(namespace, key),
      () => this.tryEnglishKey(key),
      () => this.returnKeyPath(key)
    ];

    for (const fallback of fallbackChain) {
      try {
        const result = await fallback();
        if (result) return result;
      } catch (error) {
        continue; // Try next fallback
      }
    }

    return key; // Ultimate fallback
  }
}
```

### Step 4.2: Production Error Monitoring
```typescript
// Integrate with your monitoring solution (Sentry, DataDog, etc.)
export const trackTranslationError = (error: TranslationError) => {
  // Log to monitoring service
  // Update translation health metrics
  // Alert if error rate exceeds threshold
};
```

## Phase 5: Translation Management Workflow (Week 5-6)

### Step 5.1: CLI Tools for Translation Management
**`frontend/scripts/translation-cli.ts`**
```typescript
import { Command } from 'commander';

const program = new Command();

program
  .command('extract')
  .description('Extract new translation keys from codebase')
  .action(extractNewKeys);

program
  .command('validate')
  .description('Validate translation completeness')
  .option('-l, --locale <locale>', 'specific locale to validate')
  .action(validateTranslations);

program
  .command('sync')
  .description('Sync keys across all languages')
  .action(syncTranslationKeys);

program
  .command('audit')
  .description('Generate comprehensive translation audit report')
  .action(generateAuditReport);

async function extractNewKeys() {
  // Scan codebase for new useTranslations() calls
  // Extract keys not present in reference language
  // Generate task list for translators
}

async function validateTranslations(options: { locale?: string }) {
  // Check completeness, consistency, format
  // Generate validation report
  // Exit with error code if validation fails
}
```

### Step 5.2: Translation Workflow Management
```typescript
interface TranslationTask {
  id: string;
  locale: string;
  namespace: string;
  keys: string[];
  status: 'pending' | 'in_progress' | 'review' | 'approved';
  assignedTo: string;
  createdAt: Date;
  dueDate: Date;
}

class TranslationWorkflowManager {
  async createTranslationTasks(newKeys: string[]): Promise<TranslationTask[]> {
    // Create tasks for each locale requiring the new keys
    // Assign based on translator specialization
    // Set appropriate due dates based on priority
  }

  async reviewTranslation(taskId: string, approved: boolean): Promise<void> {
    // Update task status
    // Notify translator of feedback
    // Merge approved translations
  }
}
```

## Phase 6: Testing Framework Implementation (Week 6-7)

### Step 6.1: Automated Testing Setup
**`frontend/tests/i18n/translation.test.ts`**
```typescript
import { describe, it, expect } from '@jest/globals';
import { validateTranslationCompleteness } from '../scripts/validate-translations';
import { SUPPORTED_LOCALES, NAMESPACE_DEFINITIONS } from '../src/i18n/config';

describe('Translation Completeness', () => {
  SUPPORTED_LOCALES.forEach(locale => {
    if (locale === 'en') return; // Skip reference language

    describe(`${locale} translations`, () => {
      NAMESPACE_DEFINITIONS.forEach(namespace => {
        it(`should have complete ${namespace} namespace`, async () => {
          const result = await validateTranslationCompleteness('en', locale);
          expect(result.completeness).toBeGreaterThanOrEqual(0.95); // 95% completion
        });
      });
    });
  });
});
```

### Step 6.2: E2E Testing for RTL Support
```typescript
import { test, expect } from '@playwright/test';

test.describe('RTL Language Support', () => {
  test('Arabic layout renders correctly', async ({ page }) => {
    await page.goto('/ar/dashboard');
    
    // Check RTL direction
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    
    // Check layout adaptation
    const navigation = page.locator('[data-testid="navigation"]');
    await expect(navigation).toHaveCSS('direction', 'rtl');
  });
});
```

## Phase 7: SEO Optimization (Week 7-8)

### Step 7.1: Dynamic Sitemap Generation
**`frontend/src/app/sitemap.ts`**
```typescript
import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '../i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/dashboard', '/analytics', '/ai-assistant'];
  const sitemap: MetadataRoute.Sitemap = [];

  routes.forEach(route => {
    SUPPORTED_LOCALES.forEach(locale => {
      sitemap.push({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '/' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            SUPPORTED_LOCALES.map(loc => [
              loc,
              `${process.env.NEXT_PUBLIC_BASE_URL}/${loc}${route}`
            ])
          )
        }
      });
    });
  });

  return sitemap;
}
```

### Step 7.2: Hreflang Implementation
```typescript
// Add to layout.tsx or head component
export function generateHreflangTags(locale: string, pathname: string) {
  return SUPPORTED_LOCALES.map(lang => (
    <link
      key={lang}
      rel="alternate"
      hrefLang={lang}
      href={`${BASE_URL}/${lang}${pathname}`}
    />
  ));
}
```

## Phase 8: Performance Optimization (Week 8-9)

### Step 8.1: Bundle Analysis and Optimization
```typescript
// webpack.config.js additions for translation chunking
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        translations: {
          test: /[\\/]i18n[\\/]locales[\\/]/,
          name: 'translations',
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

### Step 8.2: Caching Strategy
```typescript
// Implement service worker for translation caching
const TRANSLATION_CACHE = 'translations-v1';

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/i18n/locales/')) {
    event.respondWith(
      caches.open(TRANSLATION_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

## Phase 9: Production Deployment (Week 9-10)

### Step 9.1: Gradual Rollout Strategy
```typescript
// Feature flag implementation
const TRANSLATION_ROLLOUT_PERCENTAGE = 10; // Start with 10% of users

export function shouldUseNewTranslationSystem(userId: string): boolean {
  const hash = hashString(userId);
  return (hash % 100) < TRANSLATION_ROLLOUT_PERCENTAGE;
}
```

### Step 9.2: Health Monitoring
```typescript
// Monitor translation system health
export const translationHealthMetrics = {
  errorRate: () => {
    // Calculate percentage of translation errors
  },
  loadTime: () => {
    // Average namespace load time
  },
  completeness: () => {
    // Overall translation completeness
  },
  fallbackUsage: () => {
    // How often fallbacks are used
  }
};
```

## Cleanup Phase (Week 11-12)

### Step 10.1: Remove Legacy Code
1. Delete `/frontend/src/messages/` directory
2. Delete `/frontend/public/locales/` directory  
3. Remove old middleware implementation
4. Update all import statements
5. Clean up unused dependencies

### Step 10.2: Final Validation
1. Full regression testing across all languages
2. Performance benchmarking
3. SEO validation
4. Accessibility audit
5. Translation completeness verification

## Success Metrics Validation

### Technical Metrics
- [ ] Bundle size reduction: Target 40% decrease
- [ ] Translation loading time: <200ms per namespace
- [ ] Error rate: <0.1% fallback usage
- [ ] Test coverage: >90% for i18n components

### Business Metrics  
- [ ] Translation completeness: 95%+ for Tier 1 languages
- [ ] User engagement: Improved metrics in non-English markets
- [ ] SEO performance: Organic traffic increase in international markets
- [ ] Maintenance efficiency: Reduced translation management overhead

## Risk Mitigation

### High-Risk Areas
1. **Data Loss**: Comprehensive backup strategy before migration
2. **Performance Regression**: Gradual rollout with monitoring  
3. **SEO Impact**: Maintain URL structure, implement proper redirects
4. **Translation Quality**: Rigorous review process for high-priority languages

### Rollback Plan
1. Feature flag to instantly revert to old system
2. Backup of all original translation files
3. Database rollback procedures
4. Communication plan for users/stakeholders

## Timeline Summary

```
Week 1-2:   Infrastructure Setup
Week 2-3:   Data Migration  
Week 3-4:   Lazy Loading Implementation
Week 4-5:   Error Handling & Fallbacks
Week 5-6:   Translation Management Workflow
Week 6-7:   Testing Framework
Week 7-8:   SEO Optimization
Week 8-9:   Performance Optimization
Week 9-10:  Production Deployment
Week 11-12: Cleanup & Validation
```

This migration plan provides a systematic approach to transforming the BiteBase Intelligence i18n architecture while minimizing risk and ensuring production stability throughout the process.