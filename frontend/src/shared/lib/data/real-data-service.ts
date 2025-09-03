/**
 * Real Data Service
 * Integrates Google Maps API data with AI-enhanced insights
 */

import { googleMapsService, type RestaurantData, type LocationData } from '../maps/google-maps-service'
import { geminiAI, type RestaurantAnalysis } from '../ai/gemini-service'

interface EnhancedRestaurantData extends RestaurantData {
  aiInsights?: RestaurantAnalysis
  performanceMetrics?: {
    monthlyRevenue: number
    avgOrderValue: number
    customerSatisfaction: number
    staffCount: number
    capacity: number
  }
  marketPosition?: {
    competitorRank: number
    marketShare: number
    growthTrend: 'up' | 'down' | 'stable'
  }
}

interface MarketIntelligence {
  totalRestaurants: number
  averageRating: number
  priceDistribution: Record<string, number>
  cuisinePopularity: Record<string, number>
  marketTrends: string[]
  opportunities: string[]
}

class RealDataService {
  /**
   * Get enhanced restaurant data with AI insights
   */
  async getEnhancedRestaurants(location: string, limit: number = 20): Promise<EnhancedRestaurantData[]> {
    try {
      // Fetch real restaurant data from Google Maps
      const restaurants = await googleMapsService.searchRestaurants(location, 5000)
      
      // Enhance with AI insights and mock performance data
      const enhancedRestaurants = await Promise.all(
        restaurants.slice(0, limit).map(async (restaurant) => {
          const performanceMetrics = this.generatePerformanceMetrics(restaurant)
          const marketPosition = this.calculateMarketPosition(restaurant, restaurants)
          
          // Get AI insights for top restaurants
          let aiInsights: RestaurantAnalysis | undefined
          if (restaurant.rating > 4.0) {
            try {
              aiInsights = await geminiAI.analyzeRestaurantData({
                ...restaurant,
                ...performanceMetrics
              })
            } catch (error) {
              console.warn('AI analysis failed for restaurant:', restaurant.name)
            }
          }

          return {
            ...restaurant,
            aiInsights,
            performanceMetrics,
            marketPosition
          }
        })
      )

      return enhancedRestaurants
    } catch (error) {
      console.error('Error getting enhanced restaurants:', error)
      return this.getMockEnhancedRestaurants(location)
    }
  }

  /**
   * Get market intelligence for a location
   */
  async getMarketIntelligence(location: string): Promise<MarketIntelligence> {
    try {
      const restaurants = await googleMapsService.searchRestaurants(location, 10000)
      
      const totalRestaurants = restaurants.length
      const averageRating = restaurants.reduce((sum, r) => sum + r.rating, 0) / totalRestaurants
      
      const priceDistribution = this.calculatePriceDistribution(restaurants)
      const cuisinePopularity = this.calculateCuisinePopularity(restaurants)
      
      // Generate AI-powered market trends and opportunities
      const marketContext = {
        location,
        totalRestaurants,
        averageRating,
        topCuisines: Object.keys(cuisinePopularity).slice(0, 5)
      }

      const trendsResponse = await geminiAI.generateResponse(
        `Analyze the restaurant market in ${location} with ${totalRestaurants} restaurants, average rating ${averageRating.toFixed(1)}, and popular cuisines: ${marketContext.topCuisines.join(', ')}. Provide market trends and opportunities.`,
        'market_analysis'
      )

      return {
        totalRestaurants,
        averageRating,
        priceDistribution,
        cuisinePopularity,
        marketTrends: this.extractTrends(trendsResponse.text),
        opportunities: this.extractOpportunities(trendsResponse.text)
      }
    } catch (error) {
      console.error('Error getting market intelligence:', error)
      return this.getMockMarketIntelligence()
    }
  }

  /**
   * Get location intelligence with AI insights
   */
  async getLocationIntelligence(address: string): Promise<LocationData & { aiInsights: string }> {
    try {
      const locationData = await googleMapsService.getLocationIntelligence(address)
      
      // Get AI insights about the location
      const aiInsights = await geminiAI.generateLocationIntelligence(locationData)
      
      return {
        ...locationData,
        aiInsights: aiInsights.marketAnalysis
      }
    } catch (error) {
      console.error('Error getting location intelligence:', error)
      return {
        address,
        coordinates: { lat: 40.7128, lng: -74.0060 },
        populationDensity: 8500,
        averageIncome: 65000,
        footTraffic: 'Medium',
        competitors: [],
        demographics: {
          ageGroups: { '25-34': 0.3, '35-44': 0.25, '45-54': 0.2, 'Other': 0.25 },
          incomeDistribution: { '$50k-$75k': 0.3, '$75k-$100k': 0.25, 'Other': 0.45 }
        },
        aiInsights: 'Location analysis temporarily unavailable. Please try again later.'
      }
    }
  }

  /**
   * Generate realistic performance metrics based on restaurant data
   */
  private generatePerformanceMetrics(restaurant: RestaurantData) {
    const baseRevenue = 50000
    const ratingMultiplier = restaurant.rating / 5
    const reviewsMultiplier = Math.min(restaurant.reviews / 100, 3)
    const priceMultiplier = restaurant.priceLevel || 2

    const monthlyRevenue = Math.round(
      baseRevenue * ratingMultiplier * reviewsMultiplier * priceMultiplier
    )

    return {
      monthlyRevenue,
      avgOrderValue: Math.round(monthlyRevenue / (restaurant.reviews * 0.1) || 45),
      customerSatisfaction: Math.round(restaurant.rating * 20),
      staffCount: Math.round(monthlyRevenue / 15000) + 3,
      capacity: Math.round(monthlyRevenue / 2000) + 20
    }
  }

  /**
   * Calculate market position relative to competitors
   */
  private calculateMarketPosition(restaurant: RestaurantData, allRestaurants: RestaurantData[]) {
    const sortedByRating = allRestaurants
      .filter(r => r.cuisine === restaurant.cuisine)
      .sort((a, b) => b.rating - a.rating)
    
    const competitorRank = sortedByRating.findIndex(r => r.id === restaurant.id) + 1
    const marketShare = Math.round((restaurant.reviews / allRestaurants.reduce((sum, r) => sum + r.reviews, 0)) * 100)
    
    let growthTrend: 'up' | 'down' | 'stable' = 'stable'
    if (restaurant.rating > 4.2) growthTrend = 'up'
    else if (restaurant.rating < 3.5) growthTrend = 'down'

    return {
      competitorRank,
      marketShare,
      growthTrend
    }
  }

  /**
   * Calculate price level distribution
   */
  private calculatePriceDistribution(restaurants: RestaurantData[]): Record<string, number> {
    const distribution = { '$': 0, '$$': 0, '$$$': 0, '$$$$': 0 }
    
    restaurants.forEach(restaurant => {
      const level = restaurant.priceLevel || 2
      if (level === 1) distribution['$']++
      else if (level === 2) distribution['$$']++
      else if (level === 3) distribution['$$$']++
      else distribution['$$$$']++
    })

    const total = restaurants.length
    return {
      '$': Math.round((distribution['$'] / total) * 100),
      '$$': Math.round((distribution['$$'] / total) * 100),
      '$$$': Math.round((distribution['$$$'] / total) * 100),
      '$$$$': Math.round((distribution['$$$$'] / total) * 100)
    }
  }

  /**
   * Calculate cuisine popularity
   */
  private calculateCuisinePopularity(restaurants: RestaurantData[]): Record<string, number> {
    const cuisineCount: Record<string, number> = {}
    
    restaurants.forEach(restaurant => {
      cuisineCount[restaurant.cuisine] = (cuisineCount[restaurant.cuisine] || 0) + 1
    })

    const total = restaurants.length
    const popularity: Record<string, number> = {}
    
    Object.entries(cuisineCount).forEach(([cuisine, count]) => {
      popularity[cuisine] = Math.round((count / total) * 100)
    })

    return popularity
  }

  /**
   * Extract trends from AI response
   */
  private extractTrends(text: string): string[] {
    const trendKeywords = ['trend', 'growing', 'popular', 'emerging', 'increasing']
    const sentences = text.split(/[.!?]+/)
    
    return sentences
      .filter(sentence => 
        trendKeywords.some(keyword => 
          sentence.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 5)
      .map(trend => trend.trim())
      .filter(trend => trend.length > 0)
  }

  /**
   * Extract opportunities from AI response
   */
  private extractOpportunities(text: string): string[] {
    const opportunityKeywords = ['opportunity', 'potential', 'gap', 'underserved', 'demand']
    const sentences = text.split(/[.!?]+/)
    
    return sentences
      .filter(sentence => 
        opportunityKeywords.some(keyword => 
          sentence.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 5)
      .map(opportunity => opportunity.trim())
      .filter(opportunity => opportunity.length > 0)
  }

  /**
   * Mock data fallbacks
   */
  private getMockEnhancedRestaurants(location: string): EnhancedRestaurantData[] {
    return [
      {
        id: 'mock-enhanced-1',
        name: 'The Gourmet Corner',
        address: `123 Main St, ${location}`,
        location: { lat: 40.7128, lng: -74.0060 },
        rating: 4.5,
        reviews: 234,
        priceLevel: 3,
        cuisine: 'American',
        businessStatus: 'OPERATIONAL',
        performanceMetrics: {
          monthlyRevenue: 125000,
          avgOrderValue: 65,
          customerSatisfaction: 90,
          staffCount: 12,
          capacity: 80
        },
        marketPosition: {
          competitorRank: 2,
          marketShare: 15,
          growthTrend: 'up'
        }
      }
    ]
  }

  private getMockMarketIntelligence(): MarketIntelligence {
    return {
      totalRestaurants: 150,
      averageRating: 4.1,
      priceDistribution: { '$': 25, '$$': 45, '$$$': 25, '$$$$': 5 },
      cuisinePopularity: { 'American': 30, 'Italian': 20, 'Asian': 15, 'Mexican': 12, 'Other': 23 },
      marketTrends: [
        'Plant-based options are gaining popularity',
        'Delivery and takeout services are essential',
        'Local sourcing is becoming more important'
      ],
      opportunities: [
        'Underserved breakfast market',
        'Limited healthy fast-casual options',
        'Growing demand for ethnic cuisines'
      ]
    }
  }
}

export const realDataService = new RealDataService()
export type { EnhancedRestaurantData, MarketIntelligence }
