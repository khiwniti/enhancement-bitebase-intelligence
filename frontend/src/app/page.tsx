import { redirect } from 'next/navigation'

// Root redirect to default locale
export default function RootPage() {
  // Redirect to default locale (English) for SEO and proper i18n routing
  redirect('/en')
}