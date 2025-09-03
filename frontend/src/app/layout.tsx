import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
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
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
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
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
