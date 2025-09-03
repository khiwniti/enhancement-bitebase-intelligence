import { z } from 'zod'

// Restaurant validation schemas
export const RestaurantCreateSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  brand: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().default('Thailand'),
  postal_code: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  cuisine_type: z.string().optional(),
  business_type: z.string().optional(),
  price_range: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
  opening_hours: z.string().optional(),
  capacity: z.number().int().positive().optional(),
})

export const RestaurantUpdateSchema = RestaurantCreateSchema.partial()

export const RestaurantQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).optional(),
  city: z.string().optional(),
  cuisine_type: z.string().optional(),
  business_type: z.string().optional(),
  price_range: z.string().optional(),
  is_active: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
})

export type RestaurantCreate = z.infer<typeof RestaurantCreateSchema>
export type RestaurantUpdate = z.infer<typeof RestaurantUpdateSchema>
export type RestaurantQuery = z.infer<typeof RestaurantQuerySchema>

export interface Restaurant {
  id: string
  name: string
  brand?: string
  address: string
  city: string
  state?: string
  country: string
  postal_code?: string
  latitude?: number
  longitude?: number
  district?: string
  phone?: string
  email?: string
  website?: string
  cuisine_type?: string
  business_type?: string
  price_range?: string
  opening_hours?: string
  capacity?: number
  avg_rating: number
  total_reviews: number
  monthly_revenue: number
  avg_order_value: number
  total_orders: number
  is_active: boolean
  verified_at?: string
  created_at: string
  updated_at: string
}

export class RestaurantService {
  constructor(private db: D1Database, private cache: KVNamespace) {}

  async createRestaurant(data: RestaurantCreate): Promise<Restaurant> {
    const validated = RestaurantCreateSchema.parse(data)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const result = await this.db
      .prepare(`
        INSERT INTO restaurants (
          id, name, brand, address, city, state, country, postal_code,
          latitude, longitude, district, phone, email, website,
          cuisine_type, business_type, price_range, opening_hours, capacity,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id, validated.name, validated.brand, validated.address, validated.city,
        validated.state, validated.country, validated.postal_code,
        validated.latitude, validated.longitude, validated.district,
        validated.phone, validated.email, validated.website,
        validated.cuisine_type, validated.business_type, validated.price_range,
        validated.opening_hours, validated.capacity, now, now
      )
      .run()

    if (!result.success) {
      throw new Error('Failed to create restaurant')
    }

    const restaurant = await this.getRestaurantById(id)
    if (!restaurant) {
      throw new Error('Failed to retrieve created restaurant')
    }

    // Clear cache
    await this.clearRestaurantCache()
    
    return restaurant
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    // Try cache first
    const cacheKey = `restaurant:${id}`
    const cached = await this.cache.get(cacheKey, 'json')
    if (cached) {
      return cached as Restaurant
    }

    const restaurant = await this.db
      .prepare('SELECT * FROM restaurants WHERE id = ?')
      .bind(id)
      .first<Restaurant>()

    if (restaurant) {
      // Cache for 1 hour
      await this.cache.put(cacheKey, JSON.stringify(restaurant), { expirationTtl: 3600 })
    }

    return restaurant || null
  }

  async updateRestaurant(id: string, data: RestaurantUpdate): Promise<Restaurant | null> {
    const validated = RestaurantUpdateSchema.parse(data)
    const updates: string[] = []
    const values: any[] = []

    // Build dynamic UPDATE query
    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`)
        values.push(value)
      }
    })

    if (updates.length === 0) {
      const existing = await this.getRestaurantById(id)
      return existing
    }

    updates.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    const result = await this.db
      .prepare(`UPDATE restaurants SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run()

    if (!result.success) {
      throw new Error('Failed to update restaurant')
    }

    // Clear cache
    await this.clearRestaurantCache()
    await this.cache.delete(`restaurant:${id}`)

    return await this.getRestaurantById(id)
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE restaurants SET is_active = 0, updated_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), id)
      .run()

    if (result.success) {
      await this.clearRestaurantCache()
      await this.cache.delete(`restaurant:${id}`)
    }

    return result.success
  }

  async listRestaurants(query: RestaurantQuery = {}): Promise<{
    restaurants: Restaurant[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const { page = 1, limit = 10, ...filters } = query

    // Build WHERE clause
    const conditions: string[] = ['is_active = 1']
    const values: any[] = []

    if (filters.city) {
      conditions.push('LOWER(city) LIKE ?')
      values.push(`%${filters.city.toLowerCase()}%`)
    }

    if (filters.cuisine_type) {
      conditions.push('LOWER(cuisine_type) LIKE ?')
      values.push(`%${filters.cuisine_type.toLowerCase()}%`)
    }

    if (filters.business_type) {
      conditions.push('LOWER(business_type) LIKE ?')
      values.push(`%${filters.business_type.toLowerCase()}%`)
    }

    if (filters.price_range) {
      conditions.push('price_range = ?')
      values.push(filters.price_range)
    }

    if (filters.search) {
      conditions.push('(LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(address) LIKE ?)')
      const searchTerm = `%${filters.search.toLowerCase()}%`
      values.push(searchTerm, searchTerm, searchTerm)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get total count
    const countResult = await this.db
      .prepare(`SELECT COUNT(*) as count FROM restaurants ${whereClause}`)
      .bind(...values)
      .first<{ count: number }>()

    const total = countResult?.count || 0
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit

    // Get restaurants
    const restaurants = await this.db
      .prepare(`
        SELECT * FROM restaurants 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(...values, limit, offset)
      .all<Restaurant>()

    return {
      restaurants: restaurants.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  }

  async getRestaurantStats(id: string): Promise<{
    revenue: { monthly: number, total: number }
    orders: { total: number, avgValue: number }
    reviews: { total: number, avgRating: number }
    location: { latitude?: number, longitude?: number }
  } | null> {
    const restaurant = await this.getRestaurantById(id)
    if (!restaurant) {
      return null
    }

    return {
      revenue: {
        monthly: restaurant.monthly_revenue,
        total: restaurant.monthly_revenue * 12 // Estimate yearly
      },
      orders: {
        total: restaurant.total_orders,
        avgValue: restaurant.avg_order_value
      },
      reviews: {
        total: restaurant.total_reviews,
        avgRating: restaurant.avg_rating
      },
      location: {
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      }
    }
  }

  private async clearRestaurantCache(): Promise<void> {
    // Clear list cache
    await this.cache.delete('restaurants:list')
  }
}