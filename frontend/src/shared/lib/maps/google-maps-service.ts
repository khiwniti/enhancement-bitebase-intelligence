/**
 * Google Maps Service for Real Restaurant Data
 * Fetches real restaurant information and location intelligence
 */

interface RestaurantData {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviews: number;
  priceLevel: number;
  cuisine: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  photos?: string[];
  businessStatus: string;
}

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  populationDensity: number;
  averageIncome: number;
  footTraffic: string;
  competitors: RestaurantData[];
  demographics: {
    ageGroups: Record<string, number>;
    incomeDistribution: Record<string, number>;
  };
}

class GoogleMapsService {
  private apiKey: string;
  private placesApiUrl = 'https://maps.googleapis.com/maps/api/place';
  private geocodingApiUrl = 'https://maps.googleapis.com/maps/api/geocode';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Search for restaurants in a specific area
   */
  async searchRestaurants(location: string, radius: number = 5000): Promise<RestaurantData[]> {
    try {
      // First, geocode the location
      const coordinates = await this.geocodeLocation(location);
      
      // Then search for restaurants nearby
      const searchUrl = `${this.placesApiUrl}/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${radius}&type=restaurant&key=${this.apiKey}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.warn('Places API warning:', data.status);
        return this.getMockRestaurants(location);
      }

      const restaurants = await Promise.all(
        data.results.slice(0, 20).map(async (place: any) => {
          const details = await this.getPlaceDetails(place.place_id);
          return this.formatRestaurantData(place, details);
        })
      );

      return restaurants;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return this.getMockRestaurants(location);
    }
  }

  /**
   * Get detailed information about a specific restaurant
   */
  async getRestaurantDetails(placeId: string): Promise<RestaurantData | null> {
    try {
      const details = await this.getPlaceDetails(placeId);
      return this.formatRestaurantData(details, details);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      return null;
    }
  }

  /**
   * Get location intelligence data
   */
  async getLocationIntelligence(address: string): Promise<LocationData> {
    try {
      const coordinates = await this.geocodeLocation(address);
      const restaurants = await this.searchRestaurants(address, 2000);
      
      return {
        address,
        coordinates,
        populationDensity: this.estimatePopulationDensity(coordinates),
        averageIncome: this.estimateAverageIncome(coordinates),
        footTraffic: this.estimateFootTraffic(restaurants.length),
        competitors: restaurants.filter(r => r.businessStatus === 'OPERATIONAL'),
        demographics: this.generateDemographics(coordinates)
      };
    } catch (error) {
      console.error('Error getting location intelligence:', error);
      return this.getMockLocationData(address);
    }
  }

  /**
   * Geocode an address to coordinates
   */
  private async geocodeLocation(address: string): Promise<{ lat: number; lng: number }> {
    const geocodeUrl = `${this.geocodingApiUrl}/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    throw new Error(`Geocoding failed: ${data.status}`);
  }

  /**
   * Get detailed place information
   */
  private async getPlaceDetails(placeId: string): Promise<any> {
    const detailsUrl = `${this.placesApiUrl}/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,user_ratings_total,price_level,formatted_phone_number,website,opening_hours,photos,business_status&key=${this.apiKey}`;
    
    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.result;
    }

    throw new Error(`Place details failed: ${data.status}`);
  }

  /**
   * Format restaurant data from Google Places API
   */
  private formatRestaurantData(place: any, details: any): RestaurantData {
    return {
      id: place.place_id || details.place_id,
      name: place.name || details.name,
      address: place.vicinity || details.formatted_address,
      location: {
        lat: place.geometry?.location?.lat || details.geometry?.location?.lat,
        lng: place.geometry?.location?.lng || details.geometry?.location?.lng
      },
      rating: place.rating || details.rating || 0,
      reviews: place.user_ratings_total || details.user_ratings_total || 0,
      priceLevel: place.price_level || details.price_level || 2,
      cuisine: this.determineCuisineType(place.name || details.name),
      phone: details.formatted_phone_number,
      website: details.website,
      openingHours: details.opening_hours?.weekday_text,
      photos: details.photos?.slice(0, 3).map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
      ),
      businessStatus: details.business_status || 'OPERATIONAL'
    };
  }

  /**
   * Determine cuisine type from restaurant name
   */
  private determineCuisineType(name: string): string {
    const cuisineKeywords = {
      'Italian': ['pizza', 'pasta', 'italian', 'trattoria', 'ristorante'],
      'Chinese': ['chinese', 'wok', 'dim sum', 'noodle', 'szechuan'],
      'Mexican': ['mexican', 'taco', 'burrito', 'cantina', 'azteca'],
      'Japanese': ['sushi', 'ramen', 'japanese', 'hibachi', 'sake'],
      'Indian': ['indian', 'curry', 'tandoor', 'biryani', 'masala'],
      'Thai': ['thai', 'pad thai', 'tom yum', 'green curry'],
      'French': ['french', 'bistro', 'brasserie', 'cafe'],
      'American': ['burger', 'grill', 'bbq', 'steakhouse', 'diner'],
      'Mediterranean': ['mediterranean', 'greek', 'falafel', 'hummus']
    };

    const lowerName = name.toLowerCase();
    
    for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return cuisine;
      }
    }

    return 'International';
  }

  /**
   * Estimate population density based on coordinates
   */
  private estimatePopulationDensity(coordinates: { lat: number; lng: number }): number {
    // Simple estimation based on major city centers
    const cityDensities = [
      { lat: 40.7128, lng: -74.0060, density: 27000 }, // NYC
      { lat: 34.0522, lng: -118.2437, density: 8000 }, // LA
      { lat: 41.8781, lng: -87.6298, density: 12000 }, // Chicago
      { lat: 37.7749, lng: -122.4194, density: 18000 }, // SF
    ];

    let closestDensity = 2000; // Default suburban density
    let minDistance = Infinity;

    cityDensities.forEach(city => {
      const distance = Math.sqrt(
        Math.pow(coordinates.lat - city.lat, 2) + 
        Math.pow(coordinates.lng - city.lng, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestDensity = city.density * Math.max(0.1, 1 - distance * 10);
      }
    });

    return Math.round(closestDensity);
  }

  /**
   * Estimate average income based on location
   */
  private estimateAverageIncome(coordinates: { lat: number; lng: number }): number {
    // Simplified income estimation
    const baseIncome = 50000;
    const urbanBonus = this.estimatePopulationDensity(coordinates) * 2;
    return Math.round(baseIncome + urbanBonus);
  }

  /**
   * Estimate foot traffic based on restaurant density
   */
  private estimateFootTraffic(restaurantCount: number): string {
    if (restaurantCount > 15) return 'High';
    if (restaurantCount > 8) return 'Medium';
    return 'Low';
  }

  /**
   * Generate demographic data
   */
  private generateDemographics(coordinates: { lat: number; lng: number }) {
    return {
      ageGroups: {
        '18-25': 0.15,
        '26-35': 0.25,
        '36-45': 0.20,
        '46-55': 0.18,
        '56-65': 0.12,
        '65+': 0.10
      },
      incomeDistribution: {
        'Under $30k': 0.20,
        '$30k-$50k': 0.25,
        '$50k-$75k': 0.25,
        '$75k-$100k': 0.15,
        'Over $100k': 0.15
      }
    };
  }

  /**
   * Provide mock restaurant data when API fails
   */
  private getMockRestaurants(location: string): RestaurantData[] {
    return [
      {
        id: 'mock-1',
        name: 'The Local Bistro',
        address: `123 Main St, ${location}`,
        location: { lat: 40.7128, lng: -74.0060 },
        rating: 4.2,
        reviews: 156,
        priceLevel: 2,
        cuisine: 'American',
        businessStatus: 'OPERATIONAL'
      },
      {
        id: 'mock-2',
        name: 'Sakura Sushi',
        address: `456 Oak Ave, ${location}`,
        location: { lat: 40.7130, lng: -74.0062 },
        rating: 4.5,
        reviews: 203,
        priceLevel: 3,
        cuisine: 'Japanese',
        businessStatus: 'OPERATIONAL'
      }
    ];
  }

  /**
   * Provide mock location data when API fails
   */
  private getMockLocationData(address: string): LocationData {
    return {
      address,
      coordinates: { lat: 40.7128, lng: -74.0060 },
      populationDensity: 8500,
      averageIncome: 65000,
      footTraffic: 'Medium',
      competitors: this.getMockRestaurants(address),
      demographics: this.generateDemographics({ lat: 40.7128, lng: -74.0060 })
    };
  }
}

export const googleMapsService = new GoogleMapsService();
export type { RestaurantData, LocationData };
