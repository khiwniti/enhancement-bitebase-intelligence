'use client'

import Head from 'next/head'
import { useParams, usePathname } from 'next/navigation'
import { Locale, localeNames } from '@/shared/lib/i18n-config'
import { useLocalizedUrl } from '@/components/localized-link'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  articleData?: {
    publishedTime?: string
    modifiedTime?: string
    author?: string
    section?: string
    tags?: string[]
  }
  structuredData?: object
}

export function SEOHead({
  title,
  description,
  keywords = [],
  image,
  canonical,
  noindex = false,
  nofollow = false,
  articleData,
  structuredData
}: SEOProps) {
  const params = useParams()
  const pathname = usePathname()
  const { getAllLocalizedUrls, getCurrentUrl } = useLocalizedUrl()
  
  const currentLocale = (params?.locale as Locale) || 'en'
  const localizedUrls = getAllLocalizedUrls(true)
  const currentUrl = getCurrentUrl(currentLocale, true)
  
  // Build title with locale-specific formatting
  const buildTitle = (title?: string) => {
    const baseTitle = 'BiteBase Intelligence'
    if (!title) return baseTitle
    
    // Thai title formatting
    if (currentLocale === 'th') {
      return `${title} | ${baseTitle} - ระบบปัญญาประดิษฐ์สำหรับธุรกิจร้านอาหาร`
    }
    
    return `${title} | ${baseTitle} - AI-Powered Restaurant Intelligence`
  }

  // Build description with locale-specific content
  const buildDescription = (description?: string) => {
    if (description) return description
    
    const defaultDescriptions: Record<Locale, string> = {
      en: 'Transform your restaurant business with AI-powered analytics, insights, and optimization tools. Join 5,000+ successful restaurants using BiteBase Intelligence.',
      th: 'เปลี่ยนแปลงธุรกิจร้านอาหารของคุณด้วยระบบปัญญาประดิษฐ์ เครื่องมือวิเคราะห์ ข้อมูลเชิงลึก และการเพิ่มประสิทธิภาพ ร่วมกับร้านอาหารกว่า 5,000+ แห่งที่ประสบความสำเร็จ',
      es: 'Transforma tu negocio de restaurante con análisis impulsados por IA, insights y herramientas de optimización. Únete a más de 5,000 restaurantes exitosos que usan BiteBase Intelligence.',
      fr: 'Transformez votre entreprise de restauration avec des analyses alimentées par IA, des insights et des outils d\'optimisation. Rejoignez plus de 5,000 restaurants prospères utilisant BiteBase Intelligence.',
      de: 'Verwandeln Sie Ihr Restaurantgeschäft mit KI-gestützten Analysen, Insights und Optimierungstools. Schließen Sie sich über 5,000 erfolgreichen Restaurants an, die BiteBase Intelligence nutzen.',
      it: 'Trasforma il tuo business ristorativo con analisi basate su IA, insights e strumenti di ottimizzazione. Unisciti a oltre 5,000 ristoranti di successo che usano BiteBase Intelligence.',
      pt: 'Transforme seu negócio de restaurante com análises impulsionadas por IA, insights e ferramentas de otimização. Junte-se a mais de 5,000 restaurantes bem-sucedidos usando BiteBase Intelligence.',
      zh: '使用AI驱动的分析、洞察和优化工具改变您的餐厅业务。加入超过5,000家使用BiteBase Intelligence的成功餐厅。',
      ja: 'AI駆動の分析、洞察、最適化ツールでレストランビジネスを変革しましょう。BiteBase Intelligenceを使用する5,000以上の成功したレストランに参加してください。',
      ko: 'AI 기반 분석, 인사이트 및 최적화 도구로 레스토랑 비즈니스를 혁신하세요. BiteBase Intelligence를 사용하는 5,000개 이상의 성공적인 레스토랑에 참여하세요.',
      ar: 'قم بتحويل أعمال مطعمك باستخدام التحليلات المدعومة بالذكاء الاصطناعي والرؤى وأدوات التحسين. انضم إلى أكثر من 5,000 مطعم ناجح يستخدم BiteBase Intelligence.'
    }
    
    return defaultDescriptions[currentLocale] || defaultDescriptions.en
  }

  // Build keywords with locale-specific terms
  const buildKeywords = (keywords: string[]) => {
    const baseKeywords = {
      en: ['restaurant analytics', 'AI restaurant management', 'restaurant intelligence', 'food business insights', 'restaurant data analytics'],
      th: ['ระบบวิเคราะห์ร้านอาหาร', 'ระบบ AI ร้านอาหาร', 'ข้อมูลเชิงลึกธุรกิจอาหาร', 'การวิเคราะห์ข้อมูลร้านอาหาร', 'ระบบปัญญาประดิษฐ์ร้านอาหาร'],
      es: ['análisis de restaurantes', 'gestión de restaurantes con IA', 'inteligencia de restaurantes', 'insights de negocio alimentario'],
      fr: ['analyse de restaurants', 'gestion de restaurants IA', 'intelligence de restaurants', 'insights business alimentaire'],
      de: ['Restaurant-Analytik', 'KI-Restaurant-Management', 'Restaurant-Intelligence', 'Lebensmittelgeschäft Einblicke'],
      it: ['analisi ristoranti', 'gestione ristoranti AI', 'intelligenza ristoranti', 'insights business alimentare'],
      pt: ['análise de restaurantes', 'gestão de restaurantes com IA', 'inteligência de restaurantes', 'insights de negócio alimentar'],
      zh: ['餐厅分析', 'AI餐厅管理', '餐厅智能', '餐饮业务洞察'],
      ja: ['レストラン分析', 'AIレストラン管理', 'レストランインテリジェンス', 'フードビジネス洞察'],
      ko: ['레스토랑 분석', 'AI 레스토랑 관리', '레스토랑 인텔리전스', '음식 비즈니스 인사이트'],
      ar: ['تحليل المطاعم', 'إدارة المطاعم بالذكاء الاصطناعي', 'ذكاء المطاعم', 'رؤى أعمال الطعام']
    }

    const localeKeywords = baseKeywords[currentLocale] || baseKeywords.en
    return [...keywords, ...localeKeywords]
  }

  const finalTitle = buildTitle(title)
  const finalDescription = buildDescription(description)
  const finalKeywords = buildKeywords(keywords)
  const finalCanonical = canonical || currentUrl
  const finalImage = image || '/og-image.png'

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      
      {/* Language and Direction */}
      <html lang={currentLocale} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'} />
      
      {/* Robots */}
      <meta 
        name="robots" 
        content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`} 
      />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />
      
      {/* Hreflang Links */}
      {Object.entries(localizedUrls).map(([locale, url]) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={url}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={localizedUrls.en} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={currentLocale.replace('-', '_')} />
      <meta property="og:site_name" content="BiteBase Intelligence" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Article Data */}
      {articleData && (
        <>
          <meta property="article:published_time" content={articleData.publishedTime} />
          {articleData.modifiedTime && (
            <meta property="article:modified_time" content={articleData.modifiedTime} />
          )}
          {articleData.author && (
            <meta property="article:author" content={articleData.author} />
          )}
          {articleData.section && (
            <meta property="article:section" content={articleData.section} />
          )}
          {articleData.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  )
}

// Hook to generate structured data for different page types
export function useStructuredData() {
  const params = useParams()
  const pathname = usePathname()
  const currentLocale = (params?.locale as Locale) || 'en'
  const { getCurrentUrl } = useLocalizedUrl()

  const getOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BiteBase Intelligence",
    "description": "AI-powered restaurant intelligence platform",
    "url": getCurrentUrl(currentLocale, true),
    "logo": `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-0123",
      "contactType": "customer service",
      "availableLanguage": ["English", "Thai", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean", "Arabic"]
    },
    "sameAs": [
      "https://twitter.com/bitebaseintel",
      "https://linkedin.com/company/bitebase-intelligence"
    ]
  })

  const getWebsiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BiteBase Intelligence",
    "url": getCurrentUrl(currentLocale, true),
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${getCurrentUrl(currentLocale, true)}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  })

  const getSoftwareSchema = () => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BiteBase Intelligence",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1247"
    }
  })

  return {
    getOrganizationSchema,
    getWebsiteSchema,
    getSoftwareSchema
  }
}
