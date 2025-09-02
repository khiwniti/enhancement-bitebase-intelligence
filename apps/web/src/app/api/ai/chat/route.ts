import { NextRequest, NextResponse } from 'next/server'
import { geminiAI } from '@/shared/lib/ai/gemini-service'
import { realDataService } from '@/shared/lib/data/real-data-service'

export async function POST(request: NextRequest) {
  try {
    const { message, context, location } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get AI response
    const aiResponse = await geminiAI.generateResponse(message, context || 'general')

    // If location is provided, enhance with real data
    let enhancedData = null
    if (location) {
      try {
        const locationData = await realDataService.getLocationIntelligence(location)
        const restaurants = await realDataService.getEnhancedRestaurants(location, 5)
        enhancedData = {
          locationData,
          restaurants: restaurants.slice(0, 3) // Top 3 for context
        }
      } catch (error) {
        console.warn('Failed to get enhanced data:', error)
      }
    }

    return NextResponse.json({
      response: aiResponse.text,
      confidence: aiResponse.confidence,
      context: aiResponse.context,
      enhancedData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'AI Chat API is running',
    model: 'Google Gemini Pro',
    features: [
      'Natural language processing',
      'Restaurant data analysis',
      'Location intelligence',
      'Market insights'
    ]
  })
}
