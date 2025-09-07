import type { TranslationErrorType, SupportedLocale, TranslationNamespace } from './config';

// Re-export core types for convenience
export type { SupportedLocale, TranslationNamespace } from './config';

// Translation message structure types
export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

// Namespace-specific message interfaces
export interface CommonMessages extends TranslationMessages {
  navigation: {
    dashboard: string;
    analytics: string;
    restaurants: string;
    ai_assistant: string;
    reports: string;
    settings: string;
    logout: string;
    features: string;
    pricing: string;
    about: string;
    contact: string;
  };
  actions: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    refresh: string;
    loading: string;
    submit: string;
    confirm: string;
    close: string;
    sign_in: string;
    get_started: string;
    learnMore: string;
  };
  status: {
    active: string;
    inactive: string;
    pending: string;
    completed: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  time: {
    today: string;
    yesterday: string;
    this_week: string;
    last_week: string;
    this_month: string;
    last_month: string;
    this_year: string;
  };
  language: {
    select: string;
    auto_detect: string;
    english: string;
    spanish: string;
    french: string;
    german: string;
    italian: string;
    portuguese: string;
    chinese: string;
    japanese: string;
    korean: string;
    arabic: string;
    thai?: string;
  };
}

export interface NavigationMessages extends TranslationMessages {
  main: {
    dashboard: string;
    analytics: string;
    restaurants: string;
    ai_assistant: string;
    reports: string;
    settings: string;
    logout: string;
  };
  public: {
    features: string;
    pricing: string;
    about: string;
    contact: string;
    home: string;
  };
  analytics: {
    '4p_analytics': string;
    analytics_center: string;
    analytics_workbench: string;
  };
  location: {
    location_center: string;
    location_intelligence: string;
  };
  market: {
    market_analysis: string;
    market_research: string;
  };
  ai: {
    ai_center: string;
    research_agent: string;
    growth_studio: string;
  };
  auth: {
    login: string;
    register: string;
    forgot_password: string;
  };
}

export interface AuthMessages extends TranslationMessages {
  login: {
    title: string;
    email: string;
    password: string;
    submit: string;
    forgot_password: string;
    no_account: string;
    sign_up: string;
  };
  register: {
    title: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    submit: string;
    have_account: string;
    sign_in: string;
  };
  forgot_password: {
    title: string;
    email: string;
    submit: string;
    back_to_login: string;
  };
}

// Translation loading and error handling types
export interface TranslationError {
  type: TranslationErrorType;
  message: string;
  locale: SupportedLocale;
  namespace?: TranslationNamespace;
  key?: string;
  timestamp: number;
}

export interface TranslationLoadResult {
  success: boolean;
  messages?: TranslationMessages;
  error?: TranslationError;
  fromCache?: boolean;
}

export interface TranslationCache {
  [locale: string]: {
    [namespace: string]: {
      messages: TranslationMessages;
      loadedAt: number;
      ttl: number;
    };
  };
}

// User language preference types
export interface UserLanguagePreference {
  primary: SupportedLocale;
  fallback: SupportedLocale;
  autoDetect: boolean;
  lastUpdated: number;
  source: 'user' | 'auto';
}

// Lazy loading configuration
export interface LazyLoadConfig {
  preloadGlobal: boolean;
  cacheTimeout: number;
  maxRetries: number;
  retryDelay: number;
}

// Translation validation types
export interface TranslationValidationResult {
  locale: SupportedLocale;
  namespace: TranslationNamespace;
  completeness: number; // 0-1
  missingKeys: string[];
  extraKeys: string[];
  isValid: boolean;
}

// Route-based loading types
export type RoutePattern = keyof typeof import('./config').ROUTE_NAMESPACE_MAP;

export interface RouteNamespaceRequirement {
  route: string;
  namespaces: TranslationNamespace[];
  preload?: boolean;
}

// Middleware enhancement types
export interface I18nMiddlewareConfig {
  locales: readonly SupportedLocale[];
  defaultLocale: SupportedLocale;
  localeDetection: boolean;
  pathnames?: {
    [locale: string]: {
      [pathname: string]: string;
    };
  };
}

// Translation context types for React hooks
export interface TranslationContext {
  locale: SupportedLocale;
  direction: 'ltr' | 'rtl';
  loading: boolean;
  error: TranslationError | null;
  availableNamespaces: TranslationNamespace[];
  loadNamespace: (namespace: TranslationNamespace) => Promise<TranslationLoadResult>;
  switchLocale: (locale: SupportedLocale) => void;
}

// Export utility type for getting all translation message types
export type AllTranslationMessages = {
  common: CommonMessages;
  navigation: NavigationMessages;
  auth: AuthMessages;
  dashboard: TranslationMessages;
  analytics: TranslationMessages;
  ai: TranslationMessages;
  insights: TranslationMessages;
  location: TranslationMessages;
  reports: TranslationMessages;
  restaurants: TranslationMessages;
  errors: TranslationMessages;
  landing: TranslationMessages;
  'landing-new': TranslationMessages;
  'landing-old': TranslationMessages;
};