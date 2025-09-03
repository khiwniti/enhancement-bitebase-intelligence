import { Hono } from 'hono'
import { z } from 'zod'

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  SESSIONS: KVNamespace
  ANALYTICS: KVNamespace
  JWT_SECRET: string
  CORS_ORIGINS: string
  ENVIRONMENT: string
}

// 4P Framework validation schemas
const FourPQuerySchema = z.object({
  restaurant_id: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    radius: z.number().optional()
  }).optional(),
  analysis_type: z.enum(['competitive', 'market', 'opportunity']).optional(),
  timeframe: z.enum(['7d', '30d', '90d', '1y']).optional()
})

const fourP = new Hono<{ Bindings: Env }>()

// Product Intelligence
fourP.get('/product', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, analysis_type = 'market' } = FourPQuerySchema.parse(query)
    
    const cacheKey = `4p_product:${analysis_type}:${restaurant_id || 'all'}`
    let productIntelligence = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!productIntelligence) {
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      const [cuisineAnalysis, categoryAnalysis, performanceData] = await Promise.all([
        // Cuisine type analysis
        c.env.DB.prepare(`
          SELECT 
            cuisine_type,
            COUNT(*) as restaurant_count,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue,
            SUM(total_reviews) as total_reviews
          FROM restaurants 
          WHERE cuisine_type IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY cuisine_type
          ORDER BY restaurant_count DESC
          LIMIT 15
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all(),
        
        // Business category analysis
        c.env.DB.prepare(`
          SELECT 
            business_type,
            COUNT(*) as restaurant_count,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue
          FROM restaurants 
          WHERE business_type IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY business_type
          ORDER BY avg_rating DESC
          LIMIT 10
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all(),
        
        // Performance by product attributes
        c.env.DB.prepare(`
          SELECT 
            seating_capacity,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue,
            COUNT(*) as restaurant_count
          FROM restaurants 
          WHERE seating_capacity IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY seating_capacity
          ORDER BY seating_capacity
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
      ])
      
      productIntelligence = {
        analysis_type,
        product_insights: {
          cuisine_performance: cuisineAnalysis.results || [],
          category_analysis: categoryAnalysis.results || [],
          capacity_optimization: performanceData.results || []
        },
        recommendations: [
          'Focus on high-performing cuisine types in your market',
          'Optimize seating capacity based on local demand',
          'Consider menu diversification opportunities',
          'Analyze competitor product offerings'
        ],
        market_trends: [
          'Growing demand for healthy options',
          'Increased interest in fusion cuisines',
          'Delivery-optimized menu items gaining popularity'
        ],
        generated_at: new Date().toISOString()
      }
      
      // Cache for 2 hours
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(productIntelligence), { expirationTtl: 7200 })
    }
    
    return c.json({
      success: true,
      data: productIntelligence
    })
  } catch (error) {
    console.error('Error fetching product intelligence:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch product intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Place Intelligence
fourP.get('/place', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, location, analysis_type = 'market' } = FourPQuerySchema.parse(query)
    
    const cacheKey = `4p_place:${analysis_type}:${restaurant_id || 'all'}:${location ? `${location.latitude},${location.longitude}` : 'global'}`
    let placeIntelligence = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!placeIntelligence) {
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      const [locationAnalysis, densityAnalysis, performanceByArea] = await Promise.all([
        // City performance analysis
        c.env.DB.prepare(`
          SELECT 
            city,
            COUNT(*) as restaurant_count,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue,
            SUM(total_reviews) as total_reviews
          FROM restaurants 
          ${restaurantCondition}
          GROUP BY city
          ORDER BY restaurant_count DESC
          LIMIT 20
        `).bind(...params).all(),
        
        // Area density analysis
        c.env.DB.prepare(`
          SELECT 
            area,
            COUNT(*) as restaurant_density,
            AVG(average_rating) as avg_rating,
            city
          FROM restaurants 
          WHERE area IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY area, city
          ORDER BY restaurant_density DESC
          LIMIT 15
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all(),
        
        // Performance by geographic factors
        c.env.DB.prepare(`
          SELECT 
            CASE 
              WHEN latitude BETWEEN 13.0 AND 14.0 THEN 'Central Bangkok'
              WHEN latitude BETWEEN 14.0 AND 15.0 THEN 'North Bangkok'
              WHEN latitude BETWEEN 12.0 AND 13.0 THEN 'South Bangkok'
              ELSE 'Other Areas'
            END as geographic_zone,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue,
            COUNT(*) as restaurant_count
          FROM restaurants 
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY geographic_zone
          ORDER BY restaurant_count DESC
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
      ])
      
      placeIntelligence = {
        analysis_type,
        location_insights: {
          city_performance: locationAnalysis.results || [],
          area_density: densityAnalysis.results || [],
          geographic_zones: performanceByArea.results || []
        },
        competitive_landscape: {
          market_saturation: 'moderate',
          growth_opportunities: ['Emerging districts', 'Underserved areas', 'Transit hubs'],
          risk_factors: ['High competition zones', 'Declining areas', 'Regulatory changes']
        },
        recommendations: [
          'Target underserved high-potential areas',
          'Consider proximity to transport hubs',
          'Analyze foot traffic patterns',
          'Evaluate local demographic alignment'
        ],
        location_score: location ? {
          accessibility: 8.5,
          competition: 6.5,
          demographics: 7.8,
          growth_potential: 8.2
        } : null,
        generated_at: new Date().toISOString()
      }
      
      // Cache for 3 hours
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(placeIntelligence), { expirationTtl: 10800 })
    }
    
    return c.json({
      success: true,
      data: placeIntelligence
    })
  } catch (error) {
    console.error('Error fetching place intelligence:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch place intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Price Intelligence
fourP.get('/price', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, analysis_type = 'competitive' } = FourPQuerySchema.parse(query)
    
    const cacheKey = `4p_price:${analysis_type}:${restaurant_id || 'all'}`
    let priceIntelligence = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!priceIntelligence) {
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      const [priceRangeAnalysis, cityPricing, performanceByPrice] = await Promise.all([
        // Price range distribution
        c.env.DB.prepare(`
          SELECT 
            price_range,
            COUNT(*) as restaurant_count,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue,
            SUM(total_reviews) as total_reviews
          FROM restaurants 
          WHERE price_range IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY price_range
          ORDER BY 
            CASE price_range 
              WHEN '$' THEN 1 
              WHEN '$$' THEN 2 
              WHEN '$$$' THEN 3 
              WHEN '$$$$' THEN 4 
            END
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all(),
        
        // City-wise pricing analysis
        c.env.DB.prepare(`
          SELECT 
            city,
            price_range,
            COUNT(*) as restaurant_count,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue
          FROM restaurants 
          WHERE price_range IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY city, price_range
          ORDER BY city, price_range
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all(),
        
        // Revenue performance by price point
        c.env.DB.prepare(`
          SELECT 
            price_range,
            cuisine_type,
            AVG(estimated_revenue) as avg_revenue,
            AVG(average_rating) as avg_rating,
            COUNT(*) as restaurant_count
          FROM restaurants 
          WHERE price_range IS NOT NULL AND cuisine_type IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY price_range, cuisine_type
          ORDER BY avg_revenue DESC
          LIMIT 20
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
      ])
      
      priceIntelligence = {
        analysis_type,
        pricing_insights: {
          price_distribution: priceRangeAnalysis.results || [],
          market_positioning: cityPricing.results || [],
          revenue_optimization: performanceByPrice.results || []
        },
        competitive_analysis: {
          market_leaders: 'Premium positioning shows higher revenue potential',
          price_gaps: 'Opportunities in mid-range segment',
          value_perception: 'Quality-price alignment critical for success'
        },
        recommendations: [
          'Align pricing with target market expectations',
          'Consider value-based pricing strategies',
          'Monitor competitor pricing changes',
          'Test price elasticity in different segments'
        ],
        price_optimization: {
          current_position: restaurant_id ? 'Based on selected restaurant' : 'Market overview',
          suggested_range: '$$-$$$',
          confidence: 0.75
        },
        generated_at: new Date().toISOString()
      }
      
      // Cache for 2 hours
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(priceIntelligence), { expirationTtl: 7200 })
    }
    
    return c.json({
      success: true,
      data: priceIntelligence
    })
  } catch (error) {
    console.error('Error fetching price intelligence:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch price intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Promotion Intelligence
fourP.get('/promotion', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, timeframe = '30d' } = FourPQuerySchema.parse(query)
    
    const cacheKey = `4p_promotion:${timeframe}:${restaurant_id || 'all'}`
    let promotionIntelligence = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!promotionIntelligence) {
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      const [performanceMetrics, seasonalTrends, channelAnalysis] = await Promise.all([
        // Performance indicators for promotion planning
        c.env.DB.prepare(`
          SELECT 
            AVG(average_rating) as avg_rating,
            AVG(total_reviews) as avg_reviews,
            AVG(estimated_revenue) as avg_revenue,
            COUNT(*) as restaurant_count
          FROM restaurants 
          ${restaurantCondition}
        `).bind(...params).first(),
        
        // Seasonal analysis (based on creation dates as proxy)
        c.env.DB.prepare(`
          SELECT 
            strftime('%m', created_at) as month,
            COUNT(*) as restaurant_openings,
            AVG(average_rating) as avg_rating
          FROM restaurants 
          ${restaurantCondition}
          GROUP BY strftime('%m', created_at)
          ORDER BY month
        `).bind(...params).all(),
        
        // Channel effectiveness (based on available data)
        c.env.DB.prepare(`
          SELECT 
            CASE 
              WHEN website IS NOT NULL THEN 'Digital'
              WHEN phone IS NOT NULL THEN 'Traditional'
              ELSE 'Word of Mouth'
            END as channel,
            COUNT(*) as restaurant_count,
            AVG(average_rating) as avg_rating,
            AVG(total_reviews) as avg_reviews
          FROM restaurants 
          ${restaurantCondition}
          GROUP BY channel
          ORDER BY restaurant_count DESC
        `).bind(...params).all()
      ])
      
      promotionIntelligence = {
        timeframe,
        promotion_insights: {
          performance_baseline: performanceMetrics,
          seasonal_patterns: seasonalTrends.results || [],
          channel_effectiveness: channelAnalysis.results || []
        },
        campaign_opportunities: [
          {
            type: 'Grand Opening',
            target: 'New customers',
            timing: 'First 30 days',
            expected_impact: 'High awareness'
          },
          {
            type: 'Seasonal Promotions',
            target: 'Existing customers',
            timing: 'Holiday seasons',
            expected_impact: 'Increased frequency'
          },
          {
            type: 'Loyalty Programs',
            target: 'Regular customers',
            timing: 'Ongoing',
            expected_impact: 'Higher retention'
          }
        ],
        recommendations: [
          'Leverage digital channels for broader reach',
          'Time promotions with seasonal demand patterns',
          'Focus on customer retention strategies',
          'Monitor competitor promotional activities'
        ],
        kpi_targets: {
          awareness_lift: '25-40%',
          trial_rate: '15-25%',
          conversion_rate: '10-20%',
          retention_improvement: '20-35%'
        },
        generated_at: new Date().toISOString()
      }
      
      // Cache for 4 hours
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(promotionIntelligence), { expirationTtl: 14400 })
    }
    
    return c.json({
      success: true,
      data: promotionIntelligence
    })
  } catch (error) {
    console.error('Error fetching promotion intelligence:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch promotion intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Comprehensive 4P Analysis
fourP.get('/analysis', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, analysis_type = 'comprehensive' } = FourPQuerySchema.parse(query)
    
    const cacheKey = `4p_comprehensive:${analysis_type}:${restaurant_id || 'all'}`
    let comprehensiveAnalysis = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!comprehensiveAnalysis) {
      // This would typically call the individual 4P endpoints and combine results
      const [productData, placeData, priceData] = await Promise.all([
        // Simplified product analysis
        c.env.DB.prepare(`
          SELECT 
            cuisine_type,
            COUNT(*) as count,
            AVG(average_rating) as avg_rating
          FROM restaurants 
          WHERE cuisine_type IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY cuisine_type
          ORDER BY count DESC
          LIMIT 5
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all(),
        
        // Simplified place analysis
        c.env.DB.prepare(`
          SELECT 
            city,
            COUNT(*) as count,
            AVG(average_rating) as avg_rating
          FROM restaurants 
          ${restaurant_id ? 'WHERE id = ?' : ''}
          GROUP BY city
          ORDER BY count DESC
          LIMIT 5
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all(),
        
        // Simplified price analysis
        c.env.DB.prepare(`
          SELECT 
            price_range,
            COUNT(*) as count,
            AVG(estimated_revenue) as avg_revenue
          FROM restaurants 
          WHERE price_range IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY price_range
          ORDER BY count DESC
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
      ])
      
      comprehensiveAnalysis = {
        analysis_type,
        framework_overview: {
          product: {
            top_cuisines: productData.results || [],
            recommendation: 'Focus on market-leading cuisine types'
          },
          place: {
            key_markets: placeData.results || [],
            recommendation: 'Target high-density, high-performance areas'
          },
          price: {
            price_segments: priceData.results || [],
            recommendation: 'Position in profitable price range'
          },
          promotion: {
            channels: ['Digital marketing', 'Social media', 'Local partnerships'],
            recommendation: 'Integrated multi-channel approach'
          }
        },
        strategic_insights: [
          'Market positioning requires balanced 4P alignment',
          'Product differentiation critical in competitive markets',
          'Location-price correlation impacts profitability',
          'Promotional mix should reflect target audience preferences'
        ],
        action_priorities: [
          {
            priority: 1,
            action: 'Optimize product-market fit',
            impact: 'High',
            effort: 'Medium'
          },
          {
            priority: 2,
            action: 'Refine pricing strategy',
            impact: 'High',
            effort: 'Low'
          },
          {
            priority: 3,
            action: 'Enhance promotional mix',
            impact: 'Medium',
            effort: 'Medium'
          }
        ],
        generated_at: new Date().toISOString()
      }
      
      // Cache for 6 hours
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(comprehensiveAnalysis), { expirationTtl: 21600 })
    }
    
    return c.json({
      success: true,
      data: comprehensiveAnalysis
    })
  } catch (error) {
    console.error('Error fetching 4P analysis:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch 4P analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { fourP }