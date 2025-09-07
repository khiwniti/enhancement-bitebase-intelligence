export const locales = ['en', 'th'] as const
export const defaultLocale = 'en' as const

export type Locale = typeof locales[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย'
}

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  th: 'ltr'
}

export const localeDisplayNames: Record<Locale, string> = {
  en: 'English',
  th: 'ภาษาไทย'
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
  }
}