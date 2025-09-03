import { Hono } from 'hono'
import { RestaurantService, RestaurantCreateSchema, RestaurantUpdateSchema, RestaurantQuerySchema } from '../services/restaurants'

export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  SESSIONS: KVNamespace
  ANALYTICS: KVNamespace
  JWT_SECRET: string
  CORS_ORIGINS: string
  ENVIRONMENT: string
}

const restaurants = new Hono<{ Bindings: Env }>()

// Get all restaurants with filtering
restaurants.get('/', async (c) => {
  try {
    const query = c.req.query()
    const validatedQuery = RestaurantQuerySchema.parse(query)
    
    const restaurantService = new RestaurantService(c.env.DB, c.env.CACHE)
    const result = await restaurantService.getRestaurants(validatedQuery)
    
    return c.json({
      success: true,
      data: result.restaurants,
      pagination: {
        page: validatedQuery.page || 1,
        limit: validatedQuery.limit || 10,
        total: result.total,
        total_pages: Math.ceil(result.total / (validatedQuery.limit || 10))
      }
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch restaurants',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get restaurant by ID
restaurants.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const restaurantService = new RestaurantService(c.env.DB, c.env.CACHE)
    const restaurant = await restaurantService.getRestaurantById(id)
    
    if (!restaurant) {
      return c.json({
        success: false,
        error: 'Restaurant not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: restaurant
    })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch restaurant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Create new restaurant
restaurants.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const validatedData = RestaurantCreateSchema.parse(body)
    
    const restaurantService = new RestaurantService(c.env.DB, c.env.CACHE)
    const restaurant = await restaurantService.createRestaurant(validatedData)
    
    return c.json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    }, 201)
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return c.json({
      success: false,
      error: 'Failed to create restaurant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Update restaurant
restaurants.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const validatedData = RestaurantUpdateSchema.parse(body)
    
    const restaurantService = new RestaurantService(c.env.DB, c.env.CACHE)
    const restaurant = await restaurantService.updateRestaurant(id, validatedData)
    
    if (!restaurant) {
      return c.json({
        success: false,
        error: 'Restaurant not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return c.json({
      success: false,
      error: 'Failed to update restaurant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Delete restaurant
restaurants.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const restaurantService = new RestaurantService(c.env.DB, c.env.CACHE)
    const success = await restaurantService.deleteRestaurant(id)
    
    if (!success) {
      return c.json({
        success: false,
        error: 'Restaurant not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      message: 'Restaurant deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return c.json({
      success: false,
      error: 'Failed to delete restaurant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Search restaurants by location
restaurants.get('/search/nearby', async (c) => {
  try {
    const query = c.req.query()
    const { latitude, longitude, radius = '5' } = query
    
    if (!latitude || !longitude) {
      return c.json({
        success: false,
        error: 'Latitude and longitude are required'
      }, 400)
    }
    
    const restaurantService = new RestaurantService(c.env.DB, c.env.CACHE)
    const restaurants = await restaurantService.searchNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius)
    )
    
    return c.json({
      success: true,
      data: restaurants
    })
  } catch (error) {
    console.error('Error searching nearby restaurants:', error)
    return c.json({
      success: false,
      error: 'Failed to search nearby restaurants',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get restaurant statistics
restaurants.get('/stats/overview', async (c) => {
  try {
    const restaurantService = new RestaurantService(c.env.DB, c.env.CACHE)
    const stats = await restaurantService.getRestaurantStats()
    
    return c.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching restaurant stats:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch restaurant statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { restaurants }