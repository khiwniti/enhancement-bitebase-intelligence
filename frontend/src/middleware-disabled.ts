import { NextRequest, NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']
const defaultLocale = 'en'

function getLocale(request: NextRequest) {
  // Get locale from URL
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Get locale from cookies
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  // Get locale from Accept-Language header
  const acceptedLanguage = request.headers.get('accept-language') ?? undefined
  if (acceptedLanguage) {
    const headers = { 'accept-language': acceptedLanguage }
    const languages = new Negotiator({ headers }).languages()
    return match(languages, locales, defaultLocale)
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Static files
  ) {
    return
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  const locale = getLocale(request) || defaultLocale

  // Create redirect URL with locale
  const redirectUrl = new URL(`/${locale}${pathname}`, request.url)

  // Set locale cookie for future requests
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    httpOnly: false,
    path: '/'
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes (/api)
     * - Static files (/_next/static, /favicon.ico, etc.)
     * - Image files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon|.*\\..*).*)',
  ],
}
