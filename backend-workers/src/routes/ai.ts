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

// AI/ML validation schemas
const AIQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  context: z.string().optional(),
  restaurant_id: z.string().optional(),
  analysis_type: z.enum(['sentiment', 'trend', 'prediction', 'recommendation']).optional()
})

const InsightRequestSchema = z.object({
  metric: z.enum(['revenue', 'ratings', 'traffic', 'competition']),
  timeframe: z.enum(['7d', '30d', '90d', '1y']).optional(),
  restaurant_id: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    radius: z.number().optional()
  }).optional()
})

const ai = new Hono<{ Bindings: Env }>()

// Natural Language Query Processing
ai.post('/nl-query', async (c) => {
  try {
    const body = await c.req.json()
    const { query, context, restaurant_id } = AIQuerySchema.parse(body)
    
    // Cache key for similar queries
    const cacheKey = `nl_query:${Buffer.from(query).toString('base64').slice(0, 32)}`
    let response = await c.env.CACHE.get(cacheKey, 'json')
    
    if (!response) {
      // Process natural language query (simplified implementation)
      const lowerQuery = query.toLowerCase()
      let sqlQuery = ''
      let queryType = 'general'
      
      if (lowerQuery.includes('revenue') || lowerQuery.includes('sales')) {
        queryType = 'revenue'
        sqlQuery = `
          SELECT 
            SUM(estimated_revenue) as total_revenue,
            AVG(estimated_revenue) as avg_revenue,
            COUNT(*) as restaurant_count
          FROM restaurants 
          WHERE estimated_revenue IS NOT NULL
          ${restaurant_id ? 'AND id = ?' : ''}
        `
      } else if (lowerQuery.includes('rating') || lowerQuery.includes('review')) {
        queryType = 'ratings'
        sqlQuery = `
          SELECT 
            AVG(average_rating) as avg_rating,
            SUM(total_reviews) as total_reviews,
            COUNT(*) as restaurant_count
          FROM restaurants 
          WHERE average_rating IS NOT NULL
          ${restaurant_id ? 'AND id = ?' : ''}
        `
      } else if (lowerQuery.includes('location') || lowerQuery.includes('city')) {
        queryType = 'location'
        sqlQuery = `
          SELECT 
            city,
            COUNT(*) as restaurant_count,
            AVG(average_rating) as avg_rating
          FROM restaurants 
          ${restaurant_id ? 'WHERE id = ?' : ''}
          GROUP BY city
          ORDER BY restaurant_count DESC
          LIMIT 10
        `
      } else {
        queryType = 'general'
        sqlQuery = `
          SELECT 
            COUNT(*) as total_restaurants,
            AVG(average_rating) as avg_rating,
            COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_restaurants
          FROM restaurants
          ${restaurant_id ? 'WHERE id = ?' : ''}
        `
      }
      
      const params = restaurant_id ? [restaurant_id] : []
      const result = await c.env.DB.prepare(sqlQuery).bind(...params).first()
      
      response = {
        query_type: queryType,
        interpretation: `Analyzed query about ${queryType} metrics`,
        data: result,
        confidence: 0.85,
        suggestions: [
          'Try asking about specific time periods',
          'Add location filters for better insights',
          'Compare different restaurant categories'
        ]
      }
      
      // Cache for 30 minutes
      await c.env.CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 1800 })
    }
    
    return c.json({
      success: true,
      data: response
    })
  } catch (error) {
    console.error('Error processing NL query:', error)
    return c.json({
      success: false,
      error: 'Failed to process natural language query',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Generate business insights
ai.post('/insights', async (c) => {
  try {
    const body = await c.req.json()
    const { metric, timeframe = '30d', restaurant_id, location } = InsightRequestSchema.parse(body)
    
    const cacheKey = `insights:${metric}:${timeframe}:${restaurant_id || 'all'}`
    let insights = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!insights) {
      let analysisData
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      switch (metric) {
        case 'revenue':
          analysisData = await c.env.DB.prepare(`
            SELECT 
              SUM(estimated_revenue) as total_revenue,
              AVG(estimated_revenue) as avg_revenue,
              COUNT(*) as restaurant_count,
              city,
              price_range
            FROM restaurants 
            ${restaurantCondition}
            GROUP BY city, price_range
            ORDER BY total_revenue DESC
            LIMIT 20
          `).bind(...params).all()
          break
          
        case 'ratings':
          analysisData = await c.env.DB.prepare(`
            SELECT 
              AVG(average_rating) as avg_rating,
              SUM(total_reviews) as total_reviews,
              cuisine_type,
              city
            FROM restaurants 
            WHERE average_rating IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
            GROUP BY cuisine_type, city
            ORDER BY avg_rating DESC
            LIMIT 20
          `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
          break
          
        default:
          analysisData = { results: [] }
      }
      
      insights = {
        metric,
        timeframe,
        analysis: analysisData.results || [],
        key_findings: [
          `Top performing ${metric} identified`,
          `Trends analysis for ${timeframe} period`,
          'Geographic performance variations detected'
        ],
        recommendations: [
          'Focus on high-performing segments',
          'Optimize underperforming areas',
          'Leverage successful patterns'
        ],
        confidence_score: 0.78,
        generated_at: new Date().toISOString()
      }
      
      // Cache for 1 hour
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(insights), { expirationTtl: 3600 })
    }
    
    return c.json({
      success: true,
      data: insights
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return c.json({
      success: false,
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Sentiment analysis (simplified)
ai.post('/sentiment', async (c) => {
  try {
    const body = await c.req.json()
    const { text, restaurant_id } = body
    
    if (!text) {
      return c.json({
        success: false,
        error: 'Text is required for sentiment analysis'
      }, 400)
    }
    
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'wonderful', 'fantastic']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'poor']
    
    const words = text.toLowerCase().split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.includes(word)).length
    const negativeCount = words.filter(word => negativeWords.includes(word)).length
    
    let sentiment = 'neutral'
    let score = 0
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive'
      score = Math.min(positiveCount / words.length * 10, 1)
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative'
      score = -Math.min(negativeCount / words.length * 10, 1)
    }
    
    return c.json({
      success: true,
      data: {
        sentiment,
        score,
        confidence: Math.abs(score) * 0.8 + 0.2,
        details: {
          positive_indicators: positiveCount,
          negative_indicators: negativeCount,
          total_words: words.length
        }
      }
    })
  } catch (error) {
    console.error('Error in sentiment analysis:', error)
    return c.json({
      success: false,
      error: 'Failed to analyze sentiment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Trend prediction (simplified)
ai.get('/trends/:metric', async (c) => {
  try {
    const metric = c.req.param('metric')
    const { restaurant_id, timeframe = '30d' } = c.req.query()
    
    const cacheKey = `trends:${metric}:${restaurant_id || 'all'}:${timeframe}`
    let trends = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!trends) {
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      let trendData
      
      switch (metric) {
        case 'revenue':
          trendData = await c.env.DB.prepare(`
            SELECT 
              date(created_at) as date,
              SUM(estimated_revenue) as daily_revenue,
              COUNT(*) as restaurant_count
            FROM restaurants 
            ${restaurantCondition}
            GROUP BY date(created_at)
            ORDER BY date DESC
            LIMIT 30
          `).bind(...params).all()
          break
          
        case 'ratings':
          trendData = await c.env.DB.prepare(`
            SELECT 
              date(created_at) as date,
              AVG(average_rating) as avg_rating,
              COUNT(*) as restaurant_count
            FROM restaurants 
            WHERE average_rating IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
            GROUP BY date(created_at)
            ORDER BY date DESC
            LIMIT 30
          `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
          break
          
        default:
          trendData = { results: [] }
      }
      
      const results = trendData.results || []
      
      // Simple trend calculation
      let trendDirection = 'stable'
      if (results.length >= 2) {
        const recent = results.slice(0, 7)
        const older = results.slice(7, 14)
        
        const recentAvg = recent.reduce((sum, item) => sum + (item.daily_revenue || item.avg_rating || 0), 0) / recent.length
        const olderAvg = older.reduce((sum, item) => sum + (item.daily_revenue || item.avg_rating || 0), 0) / older.length
        
        if (recentAvg > olderAvg * 1.05) trendDirection = 'increasing'
        else if (recentAvg < olderAvg * 0.95) trendDirection = 'decreasing'
      }
      
      trends = {
        metric,
        timeframe,
        trend_direction: trendDirection,
        data_points: results,
        prediction: {
          next_period: trendDirection,
          confidence: 0.65,
          factors: ['Historical patterns', 'Seasonal trends', 'Market conditions']
        },
        generated_at: new Date().toISOString()
      }
      
      // Cache for 2 hours
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(trends), { expirationTtl: 7200 })
    }
    
    return c.json({
      success: true,
      data: trends
    })
  } catch (error) {
    console.error('Error analyzing trends:', error)
    return c.json({
      success: false,
      error: 'Failed to analyze trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// AI recommendations
ai.get('/recommendations', async (c) => {
  try {
    const { restaurant_id, category = 'general' } = c.req.query()
    
    const cacheKey = `recommendations:${category}:${restaurant_id || 'all'}`
    let recommendations = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!recommendations) {
      // Get data for recommendations
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      const [performanceData, competitorData] = await Promise.all([
        c.env.DB.prepare(`
          SELECT 
            price_range,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue,
            COUNT(*) as count
          FROM restaurants 
          ${restaurantCondition}
          GROUP BY price_range
        `).bind(...params).all(),
        
        c.env.DB.prepare(`
          SELECT 
            cuisine_type,
            AVG(average_rating) as avg_rating,
            COUNT(*) as count
          FROM restaurants 
          WHERE cuisine_type IS NOT NULL ${restaurant_id ? 'AND id != ?' : ''}
          GROUP BY cuisine_type
          ORDER BY avg_rating DESC
          LIMIT 10
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
      ])
      
      recommendations = {
        category,
        recommendations: [
          {
            type: 'pricing',
            title: 'Optimize Price Range',
            description: 'Consider adjusting pricing strategy based on market performance',
            priority: 'high',
            impact: 'revenue',
            data: performanceData.results || []
          },
          {
            type: 'cuisine',
            title: 'Cuisine Optimization',
            description: 'Explore high-performing cuisine types in your area',
            priority: 'medium',
            impact: 'ratings',
            data: competitorData.results || []
          },
          {
            type: 'location',
            title: 'Location Strategy',
            description: 'Consider expansion to high-performing areas',
            priority: 'low',
            impact: 'growth'
          }
        ],
        confidence: 0.72,
        generated_at: new Date().toISOString()
      }
      
      // Cache for 4 hours
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(recommendations), { expirationTtl: 14400 })
    }
    
    return c.json({
      success: true,
      data: recommendations
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return c.json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { ai }