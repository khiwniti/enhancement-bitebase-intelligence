import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense, lazy } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ToastProvider from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
// CopilotKit provider and UI
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import CopilotRegistrations from "@/components/ai/CopilotRegistrations";

// Lazy load AI widget for better initial page load
const PersistentAIWidget = lazy(() => import("@/components/ai/PersistentAIWidget"));

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "BiteBase Intelligence",
    template: "%s | BiteBase Intelligence"
  },
  description: "AI-Powered Business Intelligence Platform for Restaurant & Cafe Industry - Drive growth with real-time analytics, market insights, and intelligent recommendations",
  keywords: ["restaurant analytics", "business intelligence", "food industry", "AI insights", "restaurant management"],
  authors: [{ name: "BiteBase Intelligence Team" }],
  creator: "BiteBase Intelligence",
  publisher: "BiteBase Intelligence",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://intelligence.bitebase.app",
    siteName: "BiteBase Intelligence",
    title: "BiteBase Intelligence - AI-Powered Restaurant Analytics",
    description: "Transform your restaurant business with AI-driven insights, real-time analytics, and intelligent recommendations",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BiteBase Intelligence Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BiteBase Intelligence - AI-Powered Restaurant Analytics",
    description: "Transform your restaurant business with AI-driven insights",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.openai.com" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
      </head>
      <body
        className={`${inter.variable} font-secondary antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <LanguageProvider>
                <ToastProvider>
                  <CopilotKit runtimeUrl="/api/copilotkit">
                    <CopilotSidebar
                      defaultOpen={false}
                      labels={{
                        title: "BiteBase AI Assistant",
                        initial:
                          "👋 Hi! I can help you analyze your restaurant data, track performance, and discover insights. What would you like to know?",
                      }}
                      clickOutsideToClose={false}
                    >
                      <div id="app-root" className="min-h-screen">
                        {children}
                      </div>
                      {/* Register Copilot readable state and actions globally */}
                      <CopilotRegistrations />
                    </CopilotSidebar>
                  </CopilotKit>
                  <Suspense fallback={<LoadingSpinner />}>
                    <PersistentAIWidget />
                  </Suspense>
                </ToastProvider>
              </LanguageProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
        
        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
              
              // Core Web Vitals monitoring
              function vitals() {
                if (typeof window !== 'undefined' && window.performance) {
                  const navigation = performance.getEntriesByType('navigation')[0];
                  console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
                }
              }
              
              if (document.readyState === 'complete') {
                vitals();
              } else {
                window.addEventListener('load', vitals);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
