export const locales = ['th', 'en'] as const
export const defaultLocale = 'th' as const

export type Locale = typeof locales[number]

export const localeNames: Record<Locale, string> = {
  th: 'ไทย',
  en: 'English'
}

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  th: 'ltr',
  en: 'ltr'
}

export const localeDisplayNames: Record<Locale, string> = {
  th: 'ภาษาไทย',
  en: 'English'
}

// Currency and format settings for each locale
export const localeSettings: Record<Locale, {
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}> = {
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
  }
}