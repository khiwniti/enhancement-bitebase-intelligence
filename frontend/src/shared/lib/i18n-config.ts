export const locales = ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'] as const
export const defaultLocale = 'en' as const

export type Locale = typeof locales[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย', 
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية'
}

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  th: 'ltr',
  es: 'ltr', 
  fr: 'ltr',
  de: 'ltr',
  it: 'ltr',
  pt: 'ltr',
  zh: 'ltr',
  ja: 'ltr',
  ko: 'ltr',
  ar: 'rtl'
}

export const localeDisplayNames: Record<Locale, string> = {
  en: 'English',
  th: 'ภาษาไทย',
  es: 'Español',
  fr: 'Français', 
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '简体中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية'
}

// Currency and format settings for each locale
export const localeSettings: Record<Locale, {
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}> = {
  en: {
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'h:mm a',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  th: {
    currency: 'THB',
    currencySymbol: '฿',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  es: {
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  fr: {
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  de: {
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  it: {
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  pt: {
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  zh: {
    currency: 'CNY',
    currencySymbol: '¥',
    dateFormat: 'yyyy/MM/dd',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  ja: {
    currency: 'JPY',
    currencySymbol: '¥',
    dateFormat: 'yyyy/MM/dd',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  },
  ko: {
    currency: 'KRW',
    currencySymbol: '₩',
    dateFormat: 'yyyy.MM.dd',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  },
  ar: {
    currency: 'AED',
    currencySymbol: 'د.إ',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  }
}