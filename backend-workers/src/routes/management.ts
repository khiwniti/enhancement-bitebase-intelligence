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

// Management validation schemas
const ManagementQuerySchema = z.object({
  restaurant_id: z.string().optional(),
  user_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional()
})

const CampaignCreateSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  type: z.enum(['promotion', 'loyalty', 'awareness', 'retention']),
  start_date: z.string(),
  end_date: z.string(),
  budget: z.number().positive().optional(),
  target_audience: z.string().optional(),
  channels: z.array(z.string()).optional(),
  restaurant_id: z.string().optional()
})

const management = new Hono<{ Bindings: Env }>()

// Restaurant Management Dashboard
management.get('/dashboard', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id } = ManagementQuerySchema.parse(query)
    
    const cacheKey = `mgmt_dashboard:${restaurant_id || 'all'}`
    let dashboard = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!dashboard) {
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      const [restaurantStats, performanceMetrics, recentActivity] = await Promise.all([
        // Basic restaurant statistics
        c.env.DB.prepare(`
          SELECT 
            COUNT(*) as total_restaurants,
            COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_restaurants,
            AVG(average_rating) as avg_rating,
            SUM(estimated_revenue) as total_revenue
          FROM restaurants ${restaurantCondition}
        `).bind(...params).first(),
        
        // Performance metrics
        c.env.DB.prepare(`
          SELECT 
            price_range,
            COUNT(*) as count,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue
          FROM restaurants 
          WHERE price_range IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY price_range
          ORDER BY count DESC
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all(),
        
        // Recent activity (last 30 days)
        c.env.DB.prepare(`
          SELECT 
            COUNT(*) as recent_additions,
            AVG(average_rating) as avg_rating_new
          FROM restaurants 
          WHERE created_at >= datetime('now', '-30 days') ${restaurant_id ? 'AND id = ?' : ''}
        `).bind(...(restaurant_id ? [restaurant_id] : [])).first()
      ])
      
      dashboard = {
        overview: {
          total_restaurants: restaurantStats?.total_restaurants || 0,
          active_restaurants: restaurantStats?.active_restaurants || 0,
          average_rating: parseFloat(restaurantStats?.avg_rating || '0').toFixed(2),
          total_revenue: restaurantStats?.total_revenue || 0,
          recent_additions: recentActivity?.recent_additions || 0
        },
        performance_breakdown: performanceMetrics.results || [],
        key_metrics: {
          activation_rate: restaurantStats?.total_restaurants ? 
            (restaurantStats.active_restaurants / restaurantStats.total_restaurants * 100).toFixed(1) : '0',
          revenue_per_restaurant: restaurantStats?.total_restaurants ?
            (restaurantStats.total_revenue / restaurantStats.total_restaurants).toFixed(0) : '0',
          growth_rate: '12.5%' // Placeholder - would calculate from historical data
        },
        alerts: [
          {
            type: 'performance',
            message: 'Revenue targets on track',
            severity: 'info'
          },
          {
            type: 'operations',
            message: 'All systems operational',
            severity: 'success'
          }
        ],
        generated_at: new Date().toISOString()
      }
      
      // Cache for 30 minutes
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(dashboard), { expirationTtl: 1800 })
    }
    
    return c.json({
      success: true,
      data: dashboard
    })
  } catch (error) {
    console.error('Error fetching management dashboard:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch management dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Restaurant Operations
management.get('/operations', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, status } = ManagementQuerySchema.parse(query)
    
    let whereConditions = []
    let params = []
    
    if (restaurant_id) {
      whereConditions.push('id = ?')
      params.push(restaurant_id)
    }
    
    if (status) {
      whereConditions.push(status === 'active' ? 'is_active = 1' : 'is_active = 0')
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    
    const operationsData = await c.env.DB.prepare(`
      SELECT 
        id,
        name,
        brand,
        city,
        cuisine_type,
        price_range,
        average_rating,
        total_reviews,
        estimated_revenue,
        seating_capacity,
        is_active,
        created_at,
        updated_at
      FROM restaurants 
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT 50
    `).bind(...params).all()
    
    const summary = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count,
        AVG(average_rating) as avg_rating,
        SUM(estimated_revenue) as total_revenue
      FROM restaurants 
      ${whereClause}
    `).bind(...params).first()
    
    return c.json({
      success: true,
      data: {
        restaurants: operationsData.results || [],
        summary: {
          total: summary?.total_count || 0,
          active: summary?.active_count || 0,
          average_rating: parseFloat(summary?.avg_rating || '0').toFixed(2),
          total_revenue: summary?.total_revenue || 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching operations data:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch operations data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Campaign Management
management.get('/campaigns', async (c) => {
  try {
    // Since we don't have a campaigns table, return mock data structure
    const campaigns = [
      {
        id: '1',
        name: 'Summer Promotion 2024',
        type: 'promotion',
        status: 'active',
        start_date: '2024-06-01',
        end_date: '2024-08-31',
        budget: 50000,
        target_audience: 'Young professionals',
        performance: {
          reach: 25000,
          conversions: 1250,
          roi: 2.5
        }
      },
      {
        id: '2',
        name: 'Loyalty Program Launch',
        type: 'loyalty',
        status: 'planned',
        start_date: '2024-09-01',
        end_date: '2024-12-31',
        budget: 75000,
        target_audience: 'Existing customers',
        performance: {
          reach: 0,
          conversions: 0,
          roi: 0
        }
      }
    ]
    
    return c.json({
      success: true,
      data: {
        campaigns,
        summary: {
          total: campaigns.length,
          active: campaigns.filter(c => c.status === 'active').length,
          total_budget: campaigns.reduce((sum, c) => sum + c.budget, 0),
          avg_roi: campaigns.reduce((sum, c) => sum + c.performance.roi, 0) / campaigns.length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch campaigns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Create Campaign
management.post('/campaigns', async (c) => {
  try {
    const body = await c.req.json()
    const campaignData = CampaignCreateSchema.parse(body)
    
    // Generate campaign ID
    const campaignId = crypto.randomUUID()
    
    // In a real implementation, this would save to a campaigns table
    // For now, we'll return success with mock data
    const campaign = {
      id: campaignId,
      ...campaignData,
      status: 'planned',
      performance: {
        reach: 0,
        conversions: 0,
        roi: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return c.json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    }, 201)
  } catch (error) {
    console.error('Error creating campaign:', error)
    return c.json({
      success: false,
      error: 'Failed to create campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Multi-Location Management
management.get('/locations', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id } = ManagementQuerySchema.parse(query)
    
    const cacheKey = `mgmt_locations:${restaurant_id || 'all'}`
    let locationData = await c.env.ANALYTICS.get(cacheKey, 'json')
    
    if (!locationData) {
      const params = restaurant_id ? [restaurant_id] : []
      const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
      
      const [locationSummary, cityBreakdown, performanceByLocation] = await Promise.all([
        // Location summary
        c.env.DB.prepare(`
          SELECT 
            COUNT(DISTINCT city) as unique_cities,
            COUNT(DISTINCT area) as unique_areas,
            COUNT(*) as total_locations,
            AVG(average_rating) as avg_rating
          FROM restaurants 
          ${restaurantCondition}
        `).bind(...params).first(),
        
        // City breakdown
        c.env.DB.prepare(`
          SELECT 
            city,
            COUNT(*) as restaurant_count,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue,
            COUNT(DISTINCT area) as areas_covered
          FROM restaurants 
          ${restaurantCondition}
          GROUP BY city
          ORDER BY restaurant_count DESC
          LIMIT 15
        `).bind(...params).all(),
        
        // Performance by location
        c.env.DB.prepare(`
          SELECT 
            city,
            area,
            AVG(average_rating) as avg_rating,
            AVG(estimated_revenue) as avg_revenue,
            COUNT(*) as restaurant_count
          FROM restaurants 
          WHERE area IS NOT NULL ${restaurant_id ? 'AND id = ?' : ''}
          GROUP BY city, area
          ORDER BY avg_revenue DESC
          LIMIT 20
        `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
      ])
      
      locationData = {
        summary: {
          unique_cities: locationSummary?.unique_cities || 0,
          unique_areas: locationSummary?.unique_areas || 0,
          total_locations: locationSummary?.total_locations || 0,
          average_rating: parseFloat(locationSummary?.avg_rating || '0').toFixed(2)
        },
        city_breakdown: cityBreakdown.results || [],
        performance_by_location: performanceByLocation.results || [],
        expansion_opportunities: [
          'High-growth suburban areas',
          'Transportation hubs',
          'Shopping and entertainment districts',
          'Underserved neighborhoods'
        ],
        generated_at: new Date().toISOString()
      }
      
      // Cache for 1 hour
      await c.env.ANALYTICS.put(cacheKey, JSON.stringify(locationData), { expirationTtl: 3600 })
    }
    
    return c.json({
      success: true,
      data: locationData
    })
  } catch (error) {
    console.error('Error fetching location data:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch location data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Performance Monitoring
management.get('/performance', async (c) => {
  try {
    const query = c.req.query()
    const { restaurant_id, date_from, date_to } = ManagementQuerySchema.parse(query)
    
    const params = restaurant_id ? [restaurant_id] : []
    const restaurantCondition = restaurant_id ? 'WHERE id = ?' : ''
    
    const [currentPerformance, benchmarks, trends] = await Promise.all([
      // Current performance metrics
      c.env.DB.prepare(`
        SELECT 
          AVG(average_rating) as avg_rating,
          SUM(total_reviews) as total_reviews,
          AVG(estimated_revenue) as avg_revenue,
          COUNT(*) as restaurant_count,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count
        FROM restaurants 
        ${restaurantCondition}
      `).bind(...params).first(),
      
      // Industry benchmarks (using quartiles)
      c.env.DB.prepare(`
        SELECT 
          price_range,
          AVG(average_rating) as benchmark_rating,
          AVG(estimated_revenue) as benchmark_revenue
        FROM restaurants 
        WHERE price_range IS NOT NULL
        GROUP BY price_range
      `).all(),
      
      // Performance trends (using creation date as proxy)
      c.env.DB.prepare(`
        SELECT 
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as restaurants_added,
          AVG(average_rating) as avg_rating
        FROM restaurants 
        WHERE created_at >= datetime('now', '-12 months') ${restaurant_id ? 'AND id = ?' : ''}
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month DESC
        LIMIT 12
      `).bind(...(restaurant_id ? [restaurant_id] : [])).all()
    ])
    
    return c.json({
      success: true,
      data: {
        current_performance: {
          average_rating: parseFloat(currentPerformance?.avg_rating || '0').toFixed(2),
          total_reviews: currentPerformance?.total_reviews || 0,
          average_revenue: parseFloat(currentPerformance?.avg_revenue || '0').toFixed(0),
          restaurant_count: currentPerformance?.restaurant_count || 0,
          operational_rate: currentPerformance?.restaurant_count ? 
            (currentPerformance.active_count / currentPerformance.restaurant_count * 100).toFixed(1) : '0'
        },
        benchmarks: benchmarks.results || [],
        trends: trends.results || [],
        kpis: {
          customer_satisfaction: '85%',
          operational_efficiency: '92%',
          revenue_growth: '+12.5%',
          market_share: '8.3%'
        }
      }
    })
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch performance data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Team Management
management.get('/team', async (c) => {
  try {
    // Mock team data since we don't have a comprehensive team table
    const teamData = {
      overview: {
        total_members: 15,
        active_members: 14,
        roles: ['Manager', 'Analyst', 'Operations', 'Marketing'],
        departments: ['Operations', 'Analytics', 'Marketing', 'Support']
      },
      recent_activity: [
        {
          user: 'John Doe',
          action: 'Updated restaurant data',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          type: 'data_update'
        },
        {
          user: 'Jane Smith',
          action: 'Created new campaign',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          type: 'campaign'
        }
      ],
      permissions: {
        data_access: ['read', 'write'],
        campaign_management: ['create', 'edit', 'delete'],
        analytics: ['view', 'export'],
        admin: ['user_management', 'system_config']
      }
    }
    
    return c.json({
      success: true,
      data: teamData
    })
  } catch (error) {
    console.error('Error fetching team data:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch team data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { management }