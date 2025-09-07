import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { locales, defaultLocale } from './shared/lib/i18n-config';

// Enhanced middleware with pathname forwarding for route-based loading
const intlMiddleware = createMiddleware({
  // Use centralized locale configuration
  locales: [...locales],
  
  // Use centralized default locale
  defaultLocale: defaultLocale,
  
  // Enable locale detection from headers
  localeDetection: true,
  
  // Define localized pathnames if needed
  pathnames: {
    '/': '/',
    '/dashboard': '/dashboard',
    '/analytics': '/analytics',
    '/ai-assistant': '/ai-assistant',
    '/restaurant-management': '/restaurant-management',
    '/location-intelligence': '/location-intelligence',
    '/reports': '/reports'
  }
});

export default function middleware(request: NextRequest) {
  // Forward the pathname to request config for route-based namespace loading
  const response = intlMiddleware(request);
  
  if (response) {
    // Add pathname header for request config
    response.headers.set('x-pathname', request.nextUrl.pathname);
  }
  
  return response;
}

export const config = {
  // Match internationalized pathnames and exclude API routes and static files
  matcher: [
    // Include root and localized paths
    '/',
    '/(en|th|es|fr|de|it|pt|zh|ja|ko|ar)/:path*',
    // Exclude API routes
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};