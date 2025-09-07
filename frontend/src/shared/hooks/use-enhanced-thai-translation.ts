'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useCurrentLanguage } from '@/components/language-switcher'

// Enhanced Thai translations that sound natural and professional
const thaiEnhancements: Record<string, Record<string, string>> = {
  'landing': {
    'hero.badge': 'ระบบปัญญาประดิษฐ์เพื่อธุรกิจร้านอาหาร',
    'hero.subtitle': 'ใช้ประโยชน์จากเทคโนโลยี AI ล้ำสมัย เพื่อเพิ่มประสิทธิภาพการดำเนินงาน สร้างผลกำไรที่ยั่งยืน และมอบประสบการณ์ที่ประทับใจให้แก่ลูกค้า',
    'hero.description': 'ร่วมเป็นส่วนหนึ่งกับเครือข่ายร้านอาหารกว่า 5,000+ แห่งทั่วประเทศ ที่เชื่อมั่นและใช้ BiteBase Intelligence ในการยกระดับธุรกิจสู่ความสำเร็จ',
    'hero.cta_primary': 'เริ่มต้นทดลองฟรี',
    'features.title': 'ฟีเจอร์ที่ทรงพลัง ครอบคลุมทุกความต้องการ',
    'features.subtitle': 'เครื่องมือที่ครบครันและทันสมัย สำหรับการบริหารจัดการร้านอาหารแบบมืออาชีพ',
    'features.items.0.title': 'แดชบอร์ดแบบอัจฉริยะ',
    'features.items.0.description': 'ระบบวิเคราะห์ข้อมูลอัตโนมัติด้วย AI พร้อมข้อมูลเชิงลึกเพื่อการตัดสินใจที่ชาญฉลาด',
    'features.items.1.description': 'เครื่องมือวิเคราะห์และแสดงผลข้อมูลระดับมืออาชีพ พร้อมรายงานที่ละเอียดครบถ้วน',
    'features.items.2.title': 'ผู้ช่วยอัจฉริยะ AI',
    'features.items.2.description': 'ระบบให้คำแนะนำเชิงธุรกิจและข้อมูลเชิงลึกแบบเรียลไทม์ เพื่อการตัดสินใจที่รวดเร็วแม่นยำ',
    'features.items.3.title': 'ระบบบริหารหลายสาขา',
    'features.items.3.description': 'เปรียบเทียบประสิทธิภาพระหว่างสาขาต่างๆ และบริหารจัดการได้อย่างมีประสิทธิภาพ',
    'features.items.4.title': 'การวิจัยตลาดและคู่แข่ง',
    'features.items.4.description': 'ติดตามแนวโน้มตลาดและวิเคราะห์กลยุทธ์ของคู่แข่ง เพื่อความได้เปรียบทางธุรกิจ'
  },
  'dashboard': {
    'welcome': 'ยินดีต้อนรับเข้าสู่ระบบ',
    'overview': 'ภาพรวมการดำเนินงาน',
    'revenue': 'รายได้',
    'customers': 'ลูกค้า',
    'orders': 'ออร์เดอร์',
    'performance': 'ประสิทธิภาพ',
    'quick_stats': 'สถิติด่วน',
    'recent_activity': 'กิจกรรมล่าสุด',
    'top_products': 'เมนูยอดนิยม',
    'sales_trends': 'แนวโน้มยอดขาย'
  },
  'navigation': {
    'dashboard': 'หน้าหลัก',
    'analytics': 'วิเคราะห์ข้อมูล',
    'restaurants': 'จัดการร้านอาหาร',
    'ai_assistant': 'ผู้ช่วย AI',
    'reports': 'รายงาน',
    'settings': 'ตั้งค่าระบบ',
    'location_center': 'ศูนย์ข้อมูลสาขา',
    'location_intelligence': 'ข้อมูลเชิงลึกทำเลที่ตั้ง'
  },
  'actions': {
    'save': 'บันทึกข้อมูล',
    'cancel': 'ยกเลิก',
    'delete': 'ลบข้อมูล',
    'edit': 'แก้ไข',
    'add': 'เพิ่มรายการ',
    'create': 'สร้างใหม่',
    'update': 'อัปเดต',
    'search': 'ค้นหา',
    'filter': 'กรองข้อมูล',
    'export': 'ส่งออกข้อมูล',
    'import': 'นำเข้าข้อมูล',
    'refresh': 'รีเฟรชข้อมูล',
    'loading': 'กำลังโหลดข้อมูล...',
    'submit': 'ยืนยันการส่ง',
    'confirm': 'ยืนยัน',
    'close': 'ปิด'
  }
}

interface UseEnhancedThaiTranslationOptions {
  enableFallback?: boolean
  logMissing?: boolean
}

export function useEnhancedThaiTranslation(
  namespace: string = 'common',
  options: UseEnhancedThaiTranslationOptions = {}
) {
  const { locale } = useCurrentLanguage()
  const { t: originalT, isReady } = useTranslation(namespace)
  const [enhancedCache, setEnhancedCache] = useState<Map<string, string>>(new Map())
  
  const { enableFallback = true, logMissing = false } = options

  // Enhanced translation function
  const tEnhanced = (key: string, replacements?: Record<string, string | number>): string => {
    // If not Thai, use original translation
    if (locale !== 'th') {
      return originalT(key, replacements)
    }

    // Check enhanced cache first
    const cacheKey = `${namespace}.${key}`
    if (enhancedCache.has(cacheKey)) {
      const enhanced = enhancedCache.get(cacheKey)!
      return applyReplacements(enhanced, replacements)
    }

    // Look for enhanced Thai translation
    const enhancement = thaiEnhancements[namespace]?.[key]
    if (enhancement) {
      enhancedCache.set(cacheKey, enhancement)
      return applyReplacements(enhancement, replacements)
    }

    // Use original translation as fallback
    const original = originalT(key, replacements)
    
    if (logMissing && original === key) {
      console.warn(`Missing Thai enhancement for: ${namespace}.${key}`)
    }

    return original
  }

  // Apply replacements to enhanced translations
  const applyReplacements = (text: string, replacements?: Record<string, string | number>): string => {
    if (!replacements) return text
    
    return Object.entries(replacements).reduce(
      (str, [placeholder, replacement]) =>
        str.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacement)),
      text
    )
  }

  // Get localized number with Thai formatting
  const formatNumber = (num: number): string => {
    if (locale === 'th') {
      return num.toLocaleString('th-TH')
    }
    return num.toLocaleString()
  }

  // Get localized currency with proper Thai formatting
  const formatCurrency = (amount: number): string => {
    if (locale === 'th') {
      return `฿${amount.toLocaleString('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })}`
    }
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`
  }

  // Get Thai-friendly date format
  const formatDate = (date: Date | string | number): string => {
    const dateObj = date instanceof Date ? date : new Date(date)
    
    if (locale === 'th') {
      return dateObj.toLocaleDateString('th-TH-u-ca-buddhist', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get relative time in Thai
  const formatRelativeTime = (date: Date | string | number): string => {
    const dateObj = date instanceof Date ? date : new Date(date)
    const now = new Date()
    const diffMs = dateObj.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.ceil(diffMs / (1000 * 60))

    if (locale === 'th') {
      if (Math.abs(diffDays) >= 1) {
        return diffDays > 0 ? `อีก ${diffDays} วัน` : `${Math.abs(diffDays)} วันที่แล้ว`
      } else if (Math.abs(diffHours) >= 1) {
        return diffHours > 0 ? `อีก ${diffHours} ชั่วโมง` : `${Math.abs(diffHours)} ชั่วโมงที่แล้ว`
      } else {
        return diffMinutes > 0 ? `อีก ${diffMinutes} นาที` : `${Math.abs(diffMinutes)} นาทีที่แล้ว`
      }
    }

    // English fallback
    if (Math.abs(diffDays) >= 1) {
      return diffDays > 0 ? `in ${diffDays} day${diffDays > 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`
    } else if (Math.abs(diffHours) >= 1) {
      return diffHours > 0 ? `in ${diffHours} hour${diffHours > 1 ? 's' : ''}` : `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`
    } else {
      return diffMinutes > 0 ? `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}` : `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''} ago`
    }
  }

  return {
    t: tEnhanced,
    tOriginal: originalT,
    locale,
    isReady,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    isThaiLocale: locale === 'th'
  }
}

// Hook specifically for business metrics with proper Thai terminology
export function useThaiBusinessTerms() {
  const { locale } = useCurrentLanguage()
  
  const getBusinessTerm = (term: string): string => {
    if (locale !== 'th') return term

    const businessTerms: Record<string, string> = {
      'revenue': 'รายได้',
      'profit': 'กำไร',
      'sales': 'ยอดขาย',
      'customers': 'ลูกค้า',
      'orders': 'คำสั่งซื้อ',
      'transactions': 'รายการ',
      'growth': 'อัตราการเติบโต',
      'performance': 'ประสิทธิภาพ',
      'efficiency': 'ประสิทธิผล',
      'optimization': 'การเพิ่มประสิทธิภาพ',
      'analytics': 'การวิเคราะห์',
      'insights': 'ข้อมูลเชิงลึก',
      'dashboard': 'แดชบอร์ด',
      'overview': 'ภาพรวม',
      'summary': 'สรุป',
      'trends': 'แนวโน้ม',
      'metrics': 'ตัวชี้วัด',
      'kpi': 'ตัวชี้วัดความสำเร็จ',
      'roi': 'ผลตอบแทนการลงทุน',
      'conversion': 'อัตราการแปลง',
      'retention': 'การรักษาลูกค้า',
      'acquisition': 'การหาลูกค้าใหม่',
      'engagement': 'ความมีส่วนร่วม',
      'satisfaction': 'ความพึงพอใจ',
      'feedback': 'ข้อเสนอแนะ',
      'rating': 'คะแนนการให้บริการ',
      'review': 'รีวิว'
    }

    return businessTerms[term.toLowerCase()] || term
  }

  return { getBusinessTerm }
}
