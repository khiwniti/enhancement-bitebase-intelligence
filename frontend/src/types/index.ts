// Location and Geographic Types
export interface LocationData {
  latitude: number
  longitude: number
  address: string
  city: string
  area?: string
  country: string
  postal_code?: string
}

export interface LocationCoordinates {
  latitude: number
  longitude: number
  name?: string
}

// Restaurant Types
export interface Restaurant {
  id: string
  name: string
  brand?: string
  location: LocationData
  cuisine_types: string[]
  category: string
  price_range?: string
  phone?: string
  email?: string
  website?: string
  seating_capacity?: number
  is_active: boolean
  average_rating?: number
  total_reviews: number
  estimated_revenue?: number
  employee_count?: number
  data_source?: string
  data_quality_score: number
  created_at: string
  updated_at: string
  distance_km?: number
}

export interface RestaurantListResponse {
  restaurants: Restaurant[]
  total: number
  skip: number
  limit: number
  has_more: boolean
}

export interface RestaurantCreate {
  name: string
  brand?: string
  location: LocationData
  cuisine_types: string[]
  category: string
  price_range?: string
  phone?: string
  email?: string
  website?: string
  seating_capacity?: number
  opening_date?: string
}

// Location Intelligence Types
export interface LocationScore {
  overall_score: number
  demographic_score: number
  competition_score: number
  accessibility_score: number
  market_potential_score: number
  confidence_level: 'low' | 'medium' | 'high'
}

export interface DemographicAnalysis {
  population_density: number
  estimated_population: number
  median_income: number
  income_distribution: {
    low: number
    middle: number
    high: number
  }
  age_distribution: {
    '18-24': number
    '25-34': number
    '35-44': number
    '45-54': number
    '55-64': number
    '65+': number
  }
  household_composition: {
    single: number
    couple: number
    family_with_children: number
    other: number
  }
  education_level: {
    high_school: number
    college: number
    graduate: number
  }
}

export interface CompetitionAnalysis {
  total_competitors: number
  direct_competitors: number
  competition_density: number
  market_saturation: 'low' | 'medium' | 'high'
  average_competitor_rating: number
}

export interface AccessibilityAnalysis {
  overall_accessibility_score: number
  transport_modes: {
    walking: {
      walkability_score: number
      pedestrian_infrastructure: string
      safety_score: number
      nearby_amenities: number
    }
    driving: {
      parking_availability: string
      traffic_congestion: string
      road_accessibility: number
      highway_access: string
    }
    transit: {
      public_transport_score: number
      nearest_station_distance_m: number
      service_frequency: string
      route_connectivity: number
    }
  }
  accessibility_grade: string
}

export interface MarketAnalysis {
  estimated_market_size: number
  purchasing_power: number
  market_diversity: number
  cuisine_opportunities: string[]
}

export interface RiskAssessment {
  risk_level: 'low' | 'medium' | 'high'
  risk_factors: string[]
  mitigation_strategies: string[]
}

export interface LocationAnalysis {
  location_score: LocationScore
  demographic_analysis: DemographicAnalysis
  competition_analysis: CompetitionAnalysis
  accessibility_analysis: AccessibilityAnalysis
  market_analysis: MarketAnalysis
  insights: string[]
  recommendations: string[]
  risk_assessment: RiskAssessment
  analysis_metadata: {
    analysis_date: string
    radius_km: number
    target_cuisine_types?: string[]
    target_category?: string
  }
}

export interface LocationAnalysisResponse {
  location: {
    latitude: number
    longitude: number
    radius_km: number
  }
  analysis: LocationAnalysis
  timestamp: string
}

export interface LocationScoreResponse {
  location: {
    latitude: number
    longitude: number
  }
  target: {
    cuisine_type?: string
    category?: string
  }
  score: LocationScore
}

export interface LocationComparison {
  location_id: number
  coordinates: LocationCoordinates
  analysis: LocationAnalysis
  rank: number
}

export interface LocationComparisonResponse {
  comparison_type: string
  target_cuisine?: string
  locations_analyzed: number
  results: LocationComparison[]
  summary: {
    best_location: LocationComparison
    score_range: {
      highest: number
      lowest: number
    }
  }
}

// Search Types
export interface SearchParams {
  query?: string
  latitude?: number
  longitude?: number
  max_distance_km?: number
  cuisine?: string
  category?: string
  min_rating?: number
  price_range?: string
  skip?: number
  limit?: number
}

// UI State Types
export interface MapViewState {
  center: [number, number]
  zoom: number
  selectedLocation?: LocationCoordinates
  markers: Array<{
    id: string
    position: [number, number]
    type: 'restaurant' | 'analysis' | 'comparison'
    data: any
  }>
}

export interface DashboardState {
  selectedRestaurant?: Restaurant
  selectedLocation?: LocationCoordinates
  analysisResults?: LocationAnalysisResponse
  comparisonResults?: LocationComparisonResponse
  isLoading: boolean
  error?: string
}

// Form Types
export interface LocationAnalysisForm {
  latitude: number
  longitude: number
  radius_km: number
  cuisine_types: string[]
  category?: string
}

export interface LocationComparisonForm {
  locations: LocationCoordinates[]
  target_cuisine?: string
  target_category?: string
  analysis_radius_km: number
}

export interface RestaurantSearchForm {
  query?: string
  location?: LocationCoordinates
  max_distance_km?: number
  cuisine?: string
  category?: string
  min_rating?: number
  price_range?: string
}