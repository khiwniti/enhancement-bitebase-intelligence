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

// Analytics validation schemas
const AnalyticsQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  restaurant_id: z.string().optional(),
  metric_type: z.enum(['revenue', 'orders', 'customers', 'ratings', 'all']).optional(),
  granularity: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional()
})

const analytics = new Hono<{ Bindings: Env }>()

// Get dashboard overview analytics
analytics.get('/dashboard', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, start_date, end_date } = AnalyticsQuerySchema.parse(query)
    
    // Basic analytics from restaurants table
    const restaurantCondition = restaurant_id ? `WHERE id = ?` : ''
    const params = restaurant_id ? [restaurant_id] : []
    
    const [restaurantStats, revenueStats] = await Promise.all([
      c.env.DB.prepare(`
        SELECT 
          COUNT(*) as total_restaurants,
          AVG(average_rating) as avg_rating,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_restaurants
        FROM restaurants ${restaurantCondition}
      `).bind(...params).first(),
      
      c.env.DB.prepare(`
        SELECT 
          SUM(estimated_revenue) as total_revenue,
          AVG(estimated_revenue) as avg_revenue,
          COUNT(*) as restaurants_with_revenue
        FROM restaurants 
        WHERE estimated_revenue IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
      `).bind(...(restaurant_id ? [restaurant_id] : [])).first()
    ])
    
    return c.json({
      success: true,
      data: {
        overview: {
          total_restaurants: restaurantStats?.total_restaurants || 0,
          active_restaurants: restaurantStats?.active_restaurants || 0,
          average_rating: parseFloat(restaurantStats?.avg_rating || '0').toFixed(2),
          total_revenue: revenueStats?.total_revenue || 0,
          average_revenue: parseFloat(revenueStats?.avg_revenue || '0').toFixed(2)
        },
        period: {
          start_date: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: end_date || new Date().toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch dashboard analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get revenue analytics
analytics.get('/revenue', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, granularity = 'daily' } = AnalyticsQuerySchema.parse(query)
    
    const groupBy = granularity === 'monthly' ? "strftime('%Y-%m', created_at)" : "date(created_at)"
    const restaurantCondition = restaurant_id ? `WHERE id = ?` : ''
    const params = restaurant_id ? [restaurant_id] : []
    
    const revenueData = await c.env.DB.prepare(`
      SELECT 
        ${groupBy} as period,
        SUM(estimated_revenue) as revenue,
        COUNT(*) as restaurant_count,
        AVG(estimated_revenue) as avg_revenue
      FROM restaurants 
      ${restaurantCondition}
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT 30
    `).bind(...params).all()
    
    return c.json({
      success: true,
      data: {
        revenue_data: revenueData.results || [],
        granularity,
        total_periods: revenueData.results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching revenue analytics:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch revenue analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get location analytics
analytics.get('/locations', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id } = AnalyticsQuerySchema.parse(query)
    
    const restaurantCondition = restaurant_id ? `WHERE id = ?` : ''
    const params = restaurant_id ? [restaurant_id] : []
    
    const locationData = await c.env.DB.prepare(`
      SELECT 
        city,
        COUNT(*) as restaurant_count,
        AVG(average_rating) as avg_rating,
        SUM(estimated_revenue) as total_revenue,
        AVG(estimated_revenue) as avg_revenue
      FROM restaurants 
      ${restaurantCondition}
      GROUP BY city
      ORDER BY restaurant_count DESC
      LIMIT 20
    `).bind(...params).all()
    
    return c.json({
      success: true,
      data: {
        locations: locationData.results || [],
        total_cities: locationData.results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching location analytics:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch location analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get cuisine analytics
analytics.get('/cuisine', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id } = AnalyticsQuerySchema.parse(query)
    
    const restaurantCondition = restaurant_id ? `WHERE id = ?` : ''
    const params = restaurant_id ? [restaurant_id] : []
    
    const cuisineData = await c.env.DB.prepare(`
      SELECT 
        cuisine_type,
        COUNT(*) as restaurant_count,
        AVG(average_rating) as avg_rating,
        SUM(estimated_revenue) as total_revenue
      FROM restaurants 
      WHERE cuisine_type IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
      GROUP BY cuisine_type
      ORDER BY restaurant_count DESC
      LIMIT 15
    `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
    
    return c.json({
      success: true,
      data: {
        cuisines: cuisineData.results || [],
        total_cuisine_types: cuisineData.results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching cuisine analytics:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch cuisine analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get performance analytics
analytics.get('/performance', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id } = AnalyticsQuerySchema.parse(query)
    
    const restaurantCondition = restaurant_id ? `WHERE id = ?` : ''
    const params = restaurant_id ? [restaurant_id] : []
    
    const performanceData = await c.env.DB.prepare(`
      SELECT 
        price_range,
        COUNT(*) as restaurant_count,
        AVG(average_rating) as avg_rating,
        AVG(total_reviews) as avg_reviews,
        SUM(estimated_revenue) as total_revenue,
        AVG(estimated_revenue) as avg_revenue
      FROM restaurants 
      WHERE price_range IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
      GROUP BY price_range
      ORDER BY 
        CASE price_range 
          WHEN '$' THEN 1 
          WHEN '$$' THEN 2 
          WHEN '$$$' THEN 3 
          WHEN '$$$$' THEN 4 
          ELSE 5 
        END
    `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
    
    return c.json({
      success: true,
      data: {
        performance_by_price: performanceData.results || [],
        total_price_ranges: performanceData.results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching performance analytics:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch performance analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get real-time metrics (cached data)
analytics.get('/realtime', async (c) => {
  try {
    const cacheKey = 'realtime_metrics'
    let metrics = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!metrics) {
      // Generate real-time metrics and cache them
      const [activeRestaurants, todayStats] = await Promise.all([
        c.env.DB.prepare(`
          SELECT COUNT(*) as count FROM restaurants WHERE is_active = 1
        `).first(),
        
        c.env.DB.prepare(`
          SELECT 
            COUNT(*) as restaurants_added_today,
            AVG(average_rating) as avg_rating_today
          FROM restaurants 
          WHERE date(created_at) = date('now')
        `).first()
      ])
      
      metrics = {
        active_restaurants: activeRestaurants?.count || 0,
        restaurants_added_today: todayStats?.restaurants_added_today || 0,
        average_rating_today: parseFloat(todayStats?.avg_rating_today || '0').toFixed(2),
        last_updated: new Date().toISOString()
      }
      
      // Cache for 5 minutes
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(metrics), { expirationTtl: 300 })
    }
    
    return c.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Error fetching real-time analytics:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch real-time analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Export analytics data
analytics.get('/export', async (c) => {
  try {
    const query = c.req.query()
    const { format = 'json', restaurant_id } = query
    
    const restaurantCondition = restaurant_id ? `WHERE id = ?` : ''
    const params = restaurant_id ? [restaurant_id] : []
    
    const exportData = await c.env.DB.prepare(`
      SELECT 
        id, name, brand, city, cuisine_type, price_range,
        average_rating, total_reviews, estimated_revenue,
        latitude, longitude, is_active, created_at
      FROM restaurants 
      ${restaurantCondition}
      ORDER BY created_at DESC
    `).bind(...params).all()
    
    if (format === 'csv') {
      // Simple CSV conversion
      const headers = ['id', 'name', 'brand', 'city', 'cuisine_type', 'price_range', 'average_rating', 'total_reviews', 'estimated_revenue', 'latitude', 'longitude', 'is_active', 'created_at']
      const csvContent = [
        headers.join(','),
        ...(exportData.results || []).map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n')
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="restaurant_analytics.csv"'
        }
      })
    }
    
    return c.json({
      success: true,
      data: exportData.results || [],
      total_records: exportData.results?.length || 0,
      exported_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error exporting analytics data:', error)
    return c.json({
      success: false,
      error: 'Failed to export analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { analytics }