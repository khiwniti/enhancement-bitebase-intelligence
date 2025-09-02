import { NextRequest, NextResponse } from 'next/server'
import { realDataService } from '@/shared/lib/data/real-data-service'
import { geminiAI } from '@/shared/lib/ai/gemini-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    // Get location intelligence
    const locationData = await realDataService.getLocationIntelligence(address)
    
    // Get market intelligence
    const marketIntelligence = await realDataService.getMarketIntelligence(address)

    // Get AI insights
    const aiInsights = await geminiAI.generateLocationIntelligence(locationData)

    return NextResponse.json({
      success: true,
      data: {
        location: locationData,
        market: marketIntelligence,
        aiInsights,
        analysis: {
          competitiveIndex: calculateCompetitiveIndex(locationData, marketIntelligence),
          opportunityScore: calculateOpportunityScore(locationData, marketIntelligence),
          riskFactors: identifyRiskFactors(locationData, marketIntelligence)
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Location Intelligence API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze location',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { addresses } = await request.json()

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'Addresses array is required' },
        { status: 400 }
      )
    }

    // Analyze multiple locations
    const results = await Promise.all(
      addresses.map(async (address: string) => {
        try {
          const locationData = await realDataService.getLocationIntelligence(address)
          const marketIntelligence = await realDataService.getMarketIntelligence(address)
          
          return {
            address,
            location: locationData,
            market: marketIntelligence,
            competitiveIndex: calculateCompetitiveIndex(locationData, marketIntelligence),
            opportunityScore: calculateOpportunityScore(locationData, marketIntelligence)
          }
        } catch (error) {
          return {
            address,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: results,
      comparison: generateLocationComparison(results),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Location Batch Analysis API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze multiple locations'
      },
      { status: 500 }
    )
  }
}

// Helper functions for analysis
function calculateCompetitiveIndex(locationData: any, marketData: any): number {
  const competitorDensity = locationData.competitors.length / 10 // Normalize to 0-1
  const averageRating = marketData.averageRating / 5 // Normalize to 0-1
  const totalRestaurants = Math.min(marketData.totalRestaurants / 100, 1) // Cap at 100
  
  // Higher competition = lower index
  return Math.round((1 - (competitorDensity * 0.4 + averageRating * 0.3 + totalRestaurants * 0.3)) * 100)
}

function calculateOpportunityScore(locationData: any, marketData: any): number {
  const populationDensity = Math.min(locationData.populationDensity / 20000, 1) // Normalize
  const averageIncome = Math.min(locationData.averageIncome / 100000, 1) // Normalize
  const footTrafficScore = locationData.footTraffic === 'High' ? 1 : locationData.footTraffic === 'Medium' ? 0.6 : 0.3
  
  return Math.round((populationDensity * 0.3 + averageIncome * 0.4 + footTrafficScore * 0.3) * 100)
}

function identifyRiskFactors(locationData: any, marketData: any): string[] {
  const risks = []
  
  if (locationData.competitors.length > 15) {
    risks.push('High competition density')
  }
  
  if (marketData.averageRating > 4.3) {
    risks.push('High customer expectations')
  }
  
  if (locationData.averageIncome < 40000) {
    risks.push('Lower income demographic')
  }
  
  if (locationData.footTraffic === 'Low') {
    risks.push('Limited foot traffic')
  }
  
  return risks
}

function generateLocationComparison(results: any[]): any {
  const validResults = results.filter(r => !r.error)
  
  if (validResults.length === 0) {
    return { error: 'No valid locations to compare' }
  }
  
  const bestOpportunity = validResults.reduce((best, current) => 
    current.opportunityScore > best.opportunityScore ? current : best
  )
  
  const leastCompetitive = validResults.reduce((least, current) => 
    current.competitiveIndex < least.competitiveIndex ? current : least
  )
  
  return {
    bestOpportunity: bestOpportunity.address,
    leastCompetitive: leastCompetitive.address,
    averageOpportunityScore: Math.round(
      validResults.reduce((sum, r) => sum + r.opportunityScore, 0) / validResults.length
    ),
    averageCompetitiveIndex: Math.round(
      validResults.reduce((sum, r) => sum + r.competitiveIndex, 0) / validResults.length
    )
  }
}
