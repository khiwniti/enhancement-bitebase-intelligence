/**
 * Location Analysis API Functions
 * Handle location-based market intelligence
 */

import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getFirestore} from "firebase-admin/firestore";

const db = getFirestore();

// Analyze location for market intelligence
export const analyzeLocation = onCall({
  cors: true,
  timeoutSeconds: 300 // 5 minutes for complex analysis
}, async (request) => {
  try {
    // Verify authentication
    if (!request.auth) {
      throw new Error("Authentication required");
    }
    
    const { 
      latitude, 
      longitude, 
      radius = 1.0, 
      analysisType = "market_opportunity",
      address,
      city,
      state,
      zipCode
    } = request.data;
    
    const userId = request.auth.uid;
    
    if (!latitude || !longitude) {
      throw new Error("Latitude and longitude are required");
    }
    
    logger.info("Starting location analysis:", { latitude, longitude, radius, analysisType });
    
    // Get nearby restaurants
    const nearbyRestaurants = await getNearbyRestaurants(latitude, longitude, radius);
    
    // Perform market analysis
    const marketAnalysis = await performMarketAnalysis(nearbyRestaurants, analysisType);
    
    // Get demographic data (placeholder - would integrate with real demographic APIs)
    const demographicData = await getDemographicData(latitude, longitude);
    
    // Calculate opportunity score
    const opportunityScore = calculateOpportunityScore(marketAnalysis, demographicData);
    
    // Generate insights and recommendations
    const insights = generateInsights(marketAnalysis, demographicData, opportunityScore);
    const recommendations = generateRecommendations(marketAnalysis, demographicData, opportunityScore);
    
    // Save analysis to database
    const analysisData = {
      userId,
      latitude,
      longitude,
      address: address || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      radius,
      analysisType,
      competitorCount: nearbyRestaurants.length,
      averageRating: marketAnalysis.averageRating,
      averagePriceRange: marketAnalysis.averagePriceRange,
      dominantCuisines: marketAnalysis.dominantCuisines,
      marketSaturation: marketAnalysis.saturation,
      opportunityScore,
      populationDensity: demographicData.populationDensity,
      medianIncome: demographicData.medianIncome,
      ageDistribution: demographicData.ageDistribution,
      footTraffic: demographicData.footTraffic,
      confidence: marketAnalysis.confidence,
      dataQuality: "HIGH",
      analysisDate: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      rawData: {
        restaurants: nearbyRestaurants,
        demographics: demographicData
      },
      insights,
      recommendations
    };
    
    const analysisRef = await db.collection("location_analyses").add(analysisData);
    
    return {
      success: true,
      data: {
        id: analysisRef.id,
        ...analysisData,
        rawData: undefined // Don't return raw data in response
      }
    };
    
  } catch (error) {
    logger.error("Error analyzing location:", error);
    throw new Error("Failed to analyze location");
  }
});

// Get location analysis history for user
export const getLocationAnalyses = onCall({
  cors: true
}, async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Authentication required");
    }
    
    const { limit = 20, offset = 0 } = request.data;
    const userId = request.auth.uid;
    
    const snapshot = await db.collection("location_analyses")
      .where("userId", "==", userId)
      .orderBy("analysisDate", "desc")
      .limit(limit)
      .offset(offset)
      .get();
    
    const analyses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      rawData: undefined // Don't include raw data in list
    }));
    
    return {
      success: true,
      data: analyses,
      total: analyses.length
    };
    
  } catch (error) {
    logger.error("Error getting location analyses:", error);
    throw new Error("Failed to get location analyses");
  }
});

// Helper function to get nearby restaurants
async function getNearbyRestaurants(latitude: number, longitude: number, radius: number) {
  try {
    // In a real implementation, you'd use geospatial queries
    // For now, we'll get all restaurants and filter by distance
    const snapshot = await db.collection("restaurants")
      .where("isOpen", "==", true)
      .get();
    
    const restaurants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Filter by distance
    return restaurants.filter((restaurant: any) => {
      const distance = calculateDistance(
        latitude, longitude,
        restaurant.latitude, restaurant.longitude
      );
      return distance <= radius;
    });
    
  } catch (error) {
    logger.error("Error getting nearby restaurants:", error);
    return [];
  }
}

// Helper function to perform market analysis
async function performMarketAnalysis(restaurants: any[], analysisType: string) {
  const totalRestaurants = restaurants.length;
  
  if (totalRestaurants === 0) {
    return {
      averageRating: 0,
      averagePriceRange: "Unknown",
      dominantCuisines: {},
      saturation: 0,
      confidence: 0.1
    };
  }
  
  // Calculate average rating
  const totalRating = restaurants.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = totalRating / totalRestaurants;
  
  // Find dominant cuisines
  const cuisineCounts: { [key: string]: number } = {};
  restaurants.forEach(r => {
    if (r.cuisineType) {
      cuisineCounts[r.cuisineType] = (cuisineCounts[r.cuisineType] || 0) + 1;
    }
  });
  
  // Calculate market saturation (restaurants per square mile)
  const saturation = totalRestaurants / (Math.PI * 1 * 1); // Assuming 1 mile radius
  
  // Determine confidence based on data quality
  const confidence = Math.min(0.9, totalRestaurants / 50); // Higher confidence with more data
  
  return {
    averageRating: Math.round(averageRating * 10) / 10,
    averagePriceRange: getMostCommonPriceRange(restaurants),
    dominantCuisines: cuisineCounts,
    saturation,
    confidence
  };
}

// Helper function to get demographic data (placeholder)
async function getDemographicData(latitude: number, longitude: number) {
  // In a real implementation, this would call demographic APIs
  // For now, return mock data
  return {
    populationDensity: 2500 + Math.random() * 5000,
    medianIncome: 45000 + Math.random() * 50000,
    ageDistribution: {
      "18-24": 15 + Math.random() * 10,
      "25-34": 20 + Math.random() * 15,
      "35-44": 18 + Math.random() * 12,
      "45-54": 16 + Math.random() * 10,
      "55-64": 15 + Math.random() * 8,
      "65+": 16 + Math.random() * 8
    },
    footTraffic: {
      weekday: 1000 + Math.random() * 2000,
      weekend: 1500 + Math.random() * 3000
    }
  };
}

// Helper function to calculate opportunity score
function calculateOpportunityScore(marketAnalysis: any, demographicData: any): number {
  let score = 50; // Base score
  
  // Adjust based on market saturation
  if (marketAnalysis.saturation < 10) {
    score += 20; // Low competition
  } else if (marketAnalysis.saturation > 30) {
    score -= 15; // High competition
  }
  
  // Adjust based on average rating
  if (marketAnalysis.averageRating < 3.5) {
    score += 15; // Room for improvement
  }
  
  // Adjust based on income
  if (demographicData.medianIncome > 60000) {
    score += 10; // Higher income area
  }
  
  // Adjust based on foot traffic
  if (demographicData.footTraffic.weekday > 1500) {
    score += 10; // High foot traffic
  }
  
  return Math.max(0, Math.min(100, score));
}

// Helper function to generate insights
function generateInsights(marketAnalysis: any, demographicData: any, opportunityScore: number) {
  const insights = [];
  
  if (marketAnalysis.saturation < 10) {
    insights.push("Low competition area - good opportunity for new restaurants");
  }
  
  if (marketAnalysis.averageRating < 3.5) {
    insights.push("Below-average restaurant quality - opportunity to provide better service");
  }
  
  if (demographicData.medianIncome > 60000) {
    insights.push("High-income area - potential for upscale dining options");
  }
  
  if (opportunityScore > 70) {
    insights.push("High opportunity score - favorable market conditions");
  }
  
  return insights;
}

// Helper function to generate recommendations
function generateRecommendations(marketAnalysis: any, demographicData: any, opportunityScore: number) {
  const recommendations = [];
  
  if (marketAnalysis.saturation < 15) {
    recommendations.push("Consider opening a restaurant in this underserved area");
  }
  
  const dominantCuisine = Object.keys(marketAnalysis.dominantCuisines)[0];
  if (dominantCuisine) {
    recommendations.push(`Consider offering ${dominantCuisine} cuisine or differentiate with unique options`);
  }
  
  if (demographicData.medianIncome > 70000) {
    recommendations.push("Target premium dining experiences for high-income demographics");
  }
  
  return recommendations;
}

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getMostCommonPriceRange(restaurants: any[]): string {
  const priceCounts: { [key: string]: number } = {};
  restaurants.forEach(r => {
    if (r.priceRange) {
      priceCounts[r.priceRange] = (priceCounts[r.priceRange] || 0) + 1;
    }
  });
  
  let maxCount = 0;
  let mostCommon = "Unknown";
  Object.entries(priceCounts).forEach(([price, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = price;
    }
  });
  
  return mostCommon;
}
