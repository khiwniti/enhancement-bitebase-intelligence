import { NextRequest, NextResponse } from 'next/server'
import { realDataService } from '@/shared/lib/data/real-data-service'
import { googleMapsService } from '@/shared/lib/maps/google-maps-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') || 'New York, NY'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get enhanced restaurant data
    const restaurants = await realDataService.getEnhancedRestaurants(location, limit)

    return NextResponse.json({
      success: true,
      data: restaurants,
      location,
      count: restaurants.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Restaurants API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch restaurant data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locations, limit = 10 } = await request.json()

    if (!locations || !Array.isArray(locations)) {
      return NextResponse.json(
        { error: 'Locations array is required' },
        { status: 400 }
      )
    }

    // Get restaurant data for multiple locations
    const results = await Promise.all(
      locations.map(async (location: string) => {
        try {
          const restaurants = await realDataService.getEnhancedRestaurants(location, limit)
          return {
            location,
            restaurants,
            count: restaurants.length
          }
        } catch (error) {
          return {
            location,
            restaurants: [],
            count: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Restaurants Batch API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch restaurant data for multiple locations'
      },
      { status: 500 }
    )
  }
}
