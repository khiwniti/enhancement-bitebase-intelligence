import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import '../globals.css'
import { locales, Locale, localeDirections } from '@/shared/lib/i18n-config'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    title: {
      default: 'BiteBase Intelligence',
      template: '%s | BiteBase Intelligence'
    },
    description: 'AI-powered business intelligence platform for modern enterprises',
    keywords: [
      'business intelligence',
      'AI analytics',
      'data visualization',
      'dashboard',
      'insights',
      'reporting'
    ],
    authors: [{ name: 'BiteBase Intelligence Team' }],
    creator: 'BiteBase Intelligence',
    publisher: 'BiteBase Intelligence',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'),
    alternates: {
      canonical: `/${locale}`,
      languages: locales.reduce((acc, locale) => {
        acc[locale] = `/${locale}`
        return acc
      }, {} as Record<string, string>)
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: `/${locale}`,
      title: 'BiteBase Intelligence',
      description: 'AI-powered business intelligence platform for modern enterprises',
      siteName: 'BiteBase Intelligence',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'BiteBase Intelligence',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'BiteBase Intelligence',
      description: 'AI-powered business intelligence platform for modern enterprises',
      images: ['/og-image.png'],
    },
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  // Await the params
  const { locale } = await params

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound()
  }

  const direction = localeDirections[locale]
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} dir={direction} className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a855f7" />
        <meta name="color-scheme" content="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className="font-sans antialiased bg-white min-h-screen"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <div className="relative min-h-screen">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
