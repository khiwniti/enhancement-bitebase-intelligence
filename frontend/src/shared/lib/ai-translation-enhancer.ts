'use client'

import { Locale } from './i18n-config'

// AI Translation Enhancement Service
export class AITranslationEnhancer {
  private cache = new Map<string, string>()
  private apiKey: string | null = null
  private baseUrl = 'https://api.openai.com/v1/chat/completions'

  constructor() {
    // Try to get API key from environment
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || null
  }

  // Generate natural, context-aware translations
  async enhanceTranslation(
    text: string,
    targetLocale: Locale,
    context: {
      domain?: 'business' | 'technical' | 'casual' | 'formal' | 'marketing'
      audience?: 'general' | 'professional' | 'technical' | 'young' | 'mature'
      tone?: 'friendly' | 'formal' | 'enthusiastic' | 'professional' | 'conversational'
      category?: 'ui' | 'content' | 'error' | 'success' | 'navigation'
    } = {}
  ): Promise<string> {
    const cacheKey = `${text}-${targetLocale}-${JSON.stringify(context)}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // Fallback to direct translation if no API key
    if (!this.apiKey) {
      return this.fallbackTranslation(text, targetLocale)
    }

    try {
      const enhancedTranslation = await this.generateNaturalTranslation(text, targetLocale, context)
      this.cache.set(cacheKey, enhancedTranslation)
      return enhancedTranslation
    } catch (error) {
      console.warn('AI translation failed, using fallback:', error)
      return this.fallbackTranslation(text, targetLocale)
    }
  }

  private async generateNaturalTranslation(
    text: string,
    targetLocale: Locale,
    context: any
  ): Promise<string> {
    const prompt = this.buildPrompt(text, targetLocale, context)
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(targetLocale)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content?.trim() || text
  }

  private getSystemPrompt(locale: Locale): string {
    const prompts = {
      th: `คุณเป็นนักแปลภาษาไทยมืออาชีพที่มีความเชี่ยวชาญในการสร้างเนื้อหาที่ฟังดูธรรมชาติและเป็นมิตรกับผู้ใช้ไทย คุณต้อง:
- ใช้ภาษาไทยที่สุภาพและเป็นธรรมชาติ
- หลีกเลี่ยงการแปลตรงตัวที่ฟังดูแปลก
- ใช้คำศัพท์ที่คนไทยใช้ในชีวิตประจำวัน
- รักษาความหมายเดิมแต่ปรับให้เข้ากับบริบททางวัฒนธรรมไทย
- ใช้น้ำเสียงที่เหมาะสมกับผู้ใช้งานระบบธุรกิจ`,

      en: `You are a professional English translator specializing in creating natural, user-friendly content. You should:
- Use clear, professional English
- Avoid overly technical jargon unless necessary
- Make the content accessible to business users
- Maintain the original meaning while improving clarity
- Use appropriate tone for business applications`,

      es: `Eres un traductor profesional de español especializado en crear contenido natural y amigable. Debes:
- Usar español claro y profesional
- Evitar jerga técnica innecesaria
- Hacer el contenido accesible para usuarios de negocios
- Mantener el significado original mejorando la claridad
- Usar el tono apropiado para aplicaciones empresariales`,

      fr: `Vous êtes un traducteur français professionnel spécialisé dans la création de contenu naturel et convivial. Vous devez:
- Utiliser un français clair et professionnel
- Éviter le jargon technique inutile
- Rendre le contenu accessible aux utilisateurs professionnels
- Maintenir le sens original tout en améliorant la clarté
- Utiliser le ton approprié pour les applications d'entreprise`,

      de: `Sie sind ein professioneller deutscher Übersetzer, der sich auf die Erstellung natürlicher, benutzerfreundlicher Inhalte spezialisiert hat. Sie sollten:
- Klares, professionelles Deutsch verwenden
- Unnötigen Fachjargon vermeiden
- Den Inhalt für Geschäftsbenutzer zugänglich machen
- Die ursprüngliche Bedeutung beibehalten und gleichzeitig die Klarheit verbessern
- Den angemessenen Ton für Geschäftsanwendungen verwenden`
    }

    return (prompts as Record<string, string>)[locale] || prompts.en
  }

  private buildPrompt(text: string, locale: Locale, context: any): string {
    const { domain = 'business', audience = 'professional', tone = 'professional', category = 'ui' } = context

    return `Please translate and enhance this text to ${this.getLocaleName(locale)}:

Original text: "${text}"

Context:
- Domain: ${domain}
- Target audience: ${audience}
- Desired tone: ${tone}
- Content category: ${category}

Requirements:
1. Make it sound natural and native-like
2. Adapt to local cultural context
3. Use appropriate terminology for the business domain
4. Ensure clarity and user-friendliness
5. Maintain professional tone while being approachable

Please provide ONLY the enhanced translation without explanations.`
  }

  private getLocaleName(locale: Locale): string {
    const names = {
      th: 'Thai (ไทย)',
      en: 'English',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      it: 'Italian (Italiano)',
      pt: 'Portuguese (Português)',
      zh: 'Chinese (中文)',
      ja: 'Japanese (日本語)',
      ko: 'Korean (한국어)',
      ar: 'Arabic (العربية)'
    }
    return names[locale] || 'the target language'
  }

  private fallbackTranslation(text: string, locale: Locale): string {
    // Simple fallback rules for Thai
    if (locale === 'th') {
      const commonTranslations: Record<string, string> = {
        'Dashboard': 'แดชบอร์ด',
        'Analytics': 'การวิเคราะห์',
        'Restaurants': 'ร้านอาหาร',
        'Reports': 'รายงาน',
        'Settings': 'การตั้งค่า',
        'Login': 'เข้าสู่ระบบ',
        'Logout': 'ออกจากระบบ',
        'Save': 'บันทึก',
        'Cancel': 'ยกเลิก',
        'Delete': 'ลบ',
        'Edit': 'แก้ไข',
        'Add': 'เพิ่ม',
        'Search': 'ค้นหา',
        'Loading': 'กำลังโหลด...',
        'Success': 'สำเร็จ',
        'Error': 'ข้อผิดพลาด',
        'Welcome': 'ยินดีต้อนรับ',
        'Profile': 'โปรไฟล์',
        'Password': 'รหัสผ่าน',
        'Email': 'อีเมล',
        'Name': 'ชื่อ',
        'Phone': 'โทรศัพท์',
        'Address': 'ที่อยู่',
        'Date': 'วันที่',
        'Time': 'เวลา',
        'Status': 'สถานะ',
        'Active': 'ใช้งานอยู่',
        'Inactive': 'ไม่ใช้งาน'
      }

      return commonTranslations[text] || text
    }

    return text
  }

  // Batch translation for better performance
  async enhanceMultipleTranslations(
    translations: Array<{
      key: string
      text: string
      context?: any
    }>,
    targetLocale: Locale
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {}
    
    // Process in batches to avoid API limits
    const batchSize = 10
    for (let i = 0; i < translations.length; i += batchSize) {
      const batch = translations.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async ({ key, text, context }) => {
          results[key] = await this.enhanceTranslation(text, targetLocale, context)
        })
      )
    }

    return results
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Singleton instance
export const aiTranslationEnhancer = new AITranslationEnhancer()

// Hook for using AI translation enhancement
export function useAITranslation() {
  return {
    enhanceTranslation: aiTranslationEnhancer.enhanceTranslation.bind(aiTranslationEnhancer),
    enhanceMultiple: aiTranslationEnhancer.enhanceMultipleTranslations.bind(aiTranslationEnhancer),
    clearCache: aiTranslationEnhancer.clearCache.bind(aiTranslationEnhancer)
  }
}
