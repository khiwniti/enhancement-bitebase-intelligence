/**
 * Real Data Service
 * Integrates Backend API data with AI-enhanced insights
 */

import { backendAPIService, type BackendRestaurant } from '../api/backend-api-service'
import { geminiAI, type RestaurantAnalysis } from '../ai/gemini-service'

// Legacy types for compatibility
export interface RestaurantData {
  id: string
  name: string
  address: string
  location: { lat: number; lng: number }
  rating: number
  reviews: number
  priceLevel?: number
  cuisine: string
  businessStatus: string
  category?: string
  area?: string
  city?: string
  country?: string
  phone?: string
  website?: string
  estimatedRevenue?: number
  employeeCount?: number
  dataQualityScore?: number
  distance?: number
}

export interface LocationData {
  address: string
  coordinates: { lat: number; lng: number }
  populationDensity: number
  averageIncome: number
  footTraffic: string
  competitors: RestaurantData[]
  demographics: {
    ageGroups: Record<string, number>
    incomeDistribution: Record<string, number>
  }
}

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
      // Try to parse location as city name (e.g., "Bangkok")
      let restaurants: BackendRestaurant[] = []
      
      // First try to get restaurants by city
      const response = await backendAPIService.getRestaurants({ 
        city: location, 
        limit,
        is_active: true 
      })
      
      restaurants = response.restaurants
      
      // If no restaurants found by city, try searching nearby coordinates
      if (restaurants.length === 0 && location.includes(',')) {
        const coords = location.split(',').map(s => parseFloat(s.trim()))
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const nearbyResponse = await backendAPIService.getNearbyRestaurants({
            latitude: coords[0],
            longitude: coords[1],
            limit,
            radius_km: 5
          })
          restaurants = nearbyResponse.restaurants
        }
      }

      // Transform and enhance with AI insights
      const enhancedRestaurants = await Promise.all(
        restaurants.slice(0, limit).map(async (restaurant) => {
          // Transform backend data to frontend format
          const transformedData = backendAPIService.transformRestaurantData(restaurant)
          
          const performanceMetrics = this.generatePerformanceMetrics(transformedData)
          const marketPosition = this.calculateMarketPosition(transformedData, restaurants.map(r => 
            backendAPIService.transformRestaurantData(r)
          ))
          
          // Get AI insights for top restaurants
          let aiInsights: RestaurantAnalysis | undefined
          if (transformedData.rating > 4.0) {
            try {
              aiInsights = await geminiAI.analyzeRestaurantData({
                ...transformedData,
                ...performanceMetrics
              })
            } catch (error) {
              console.warn('AI analysis failed for restaurant:', transformedData.name)
            }
          }

          return {
            ...transformedData,
            aiInsights: aiInsights || {
              strengths: ['Limited data available'],
              weaknesses: ['Analysis pending'],
              opportunities: ['Market analysis needed'],
              recommendations: ['Data collection required']
            },
            performanceMetrics,
            marketPosition
          }
        })
      )

      return enhancedRestaurants
    } catch (error) {
      console.error('Error getting enhanced restaurants from backend:', error)
      return this.getMockEnhancedRestaurants(location)
    }
  }

  /**
   * Get market intelligence for a location
   */
  async getMarketIntelligence(location: string): Promise<MarketIntelligence> {
    try {
      // Use backend API to get market analytics
      const analytics = await backendAPIService.getMarketAnalytics(location)
      
      // Generate AI-powered market trends and opportunities
      const marketContext = {
        location,
        totalRestaurants: analytics.totalRestaurants,
        averageRating: analytics.averageRating,
        topCuisines: Object.keys(analytics.cuisinePopularity).slice(0, 5)
      }

      const trendsResponse = await geminiAI.generateResponse(
        `Analyze the restaurant market in ${location} with ${analytics.totalRestaurants} restaurants, average rating ${analytics.averageRating.toFixed(1)}, and popular cuisines: ${marketContext.topCuisines.join(', ')}. Provide market trends and opportunities.`,
        'market_analysis'
      )

      return {
        totalRestaurants: analytics.totalRestaurants,
        averageRating: analytics.averageRating,
        priceDistribution: analytics.priceDistribution,
        cuisinePopularity: analytics.cuisinePopularity,
        marketTrends: this.extractTrends(trendsResponse.text),
        opportunities: this.extractOpportunities(trendsResponse.text)
      }
    } catch (error) {
      console.error('Error getting market intelligence from backend:', error)
      return this.getMockMarketIntelligence()
    }
  }

  /**
   * Get location intelligence with AI insights (fallback to demo data)
   */
  async getLocationIntelligence(address: string): Promise<LocationData & { aiInsights: string }> {
    try {
      // For now, use mock location data as we don't have location intelligence endpoints
      // In the future, this could connect to location analysis services
      const locationData: LocationData = {
        address,
        coordinates: { lat: 13.7563, lng: 100.5018 }, // Bangkok default
        populationDensity: 5300,
        averageIncome: 12000,
        footTraffic: 'High',
        competitors: [],
        demographics: {
          ageGroups: { '25-34': 0.3, '35-44': 0.25, '45-54': 0.2, 'Other': 0.25 },
          incomeDistribution: { '$10k-$15k': 0.3, '$15k-$25k': 0.25, 'Other': 0.45 }
        }
      }
      
      // Get nearby restaurants for competitive analysis
      try {
        const nearbyResponse = await backendAPIService.getNearbyRestaurants({
          latitude: locationData.coordinates.lat,
          longitude: locationData.coordinates.lng,
          limit: 10,
          radius_km: 1
        })
        
        locationData.competitors = nearbyResponse.restaurants.map(r => 
          backendAPIService.transformRestaurantData(r)
        )
      } catch (error) {
        console.warn('Could not fetch nearby competitors:', error)
      }
      
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
        coordinates: { lat: 13.7563, lng: 100.5018 },
        populationDensity: 5300,
        averageIncome: 12000,
        footTraffic: 'Medium',
        competitors: [],
        demographics: {
          ageGroups: { '25-34': 0.3, '35-44': 0.25, '45-54': 0.2, 'Other': 0.25 },
          incomeDistribution: { '$10k-$15k': 0.3, '$15k-$25k': 0.25, 'Other': 0.45 }
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
