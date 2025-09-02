/**
 * Restaurant API Functions
 * Handle restaurant-related operations
 */

import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

const db = getFirestore();
const auth = getAuth();

// Search restaurants with filters
export const searchRestaurants = onCall({
  cors: true
}, async (request) => {
  try {
    const { query, latitude, longitude, radius, cuisineType, priceRange, limit = 20 } = request.data;
    
    logger.info("Searching restaurants:", { query, latitude, longitude, radius });
    
    let restaurantsQuery = db.collection("restaurants")
      .where("isOpen", "==", true)
      .limit(limit);
    
    // Add filters
    if (cuisineType) {
      restaurantsQuery = restaurantsQuery.where("cuisineType", "==", cuisineType);
    }
    
    if (priceRange) {
      restaurantsQuery = restaurantsQuery.where("priceRange", "==", priceRange);
    }
    
    const snapshot = await restaurantsQuery.get();
    const restaurants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    // Filter by location if coordinates provided
    let filteredRestaurants = restaurants;
    if (latitude && longitude && radius) {
      filteredRestaurants = restaurants.filter((restaurant: any) => {
        const distance = calculateDistance(
          latitude, longitude,
          restaurant.latitude, restaurant.longitude
        );
        return distance <= radius;
      });
    }
    
    // Filter by text query
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredRestaurants = filteredRestaurants.filter((restaurant: any) =>
        restaurant.name?.toLowerCase().includes(searchTerm) ||
        restaurant.cuisineType?.toLowerCase().includes(searchTerm) ||
        restaurant.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    return {
      success: true,
      data: filteredRestaurants,
      total: filteredRestaurants.length
    };
    
  } catch (error) {
    logger.error("Error searching restaurants:", error);
    throw new Error("Failed to search restaurants");
  }
});

// Get restaurant details with reviews
export const getRestaurantDetails = onCall({
  cors: true
}, async (request) => {
  try {
    const { restaurantId } = request.data;
    
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }
    
    // Get restaurant data
    const restaurantDoc = await db.collection("restaurants").doc(restaurantId).get();
    
    if (!restaurantDoc.exists) {
      throw new Error("Restaurant not found");
    }
    
    const restaurant = {
      id: restaurantDoc.id,
      ...restaurantDoc.data()
    };
    
    // Get recent reviews
    const reviewsSnapshot = await db.collection("restaurant_reviews")
      .where("restaurantId", "==", restaurantId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    
    const reviews = await Promise.all(
      reviewsSnapshot.docs.map(async (reviewDoc) => {
        const reviewData = reviewDoc.data();
        
        // Get user info for each review
        let user = null;
        if (reviewData.userId) {
          try {
            const userRecord = await auth.getUser(reviewData.userId);
            user = {
              id: userRecord.uid,
              displayName: userRecord.displayName,
              photoURL: userRecord.photoURL
            };
          } catch (error) {
            logger.warn("Could not fetch user for review:", reviewData.userId);
          }
        }
        
        return {
          id: reviewDoc.id,
          ...reviewData,
          user
        };
      })
    );
    
    // Get analytics if available
    const analyticsSnapshot = await db.collection("restaurant_analytics")
      .where("restaurantId", "==", restaurantId)
      .orderBy("periodStart", "desc")
      .limit(1)
      .get();
    
    let analytics = null;
    if (!analyticsSnapshot.empty) {
      analytics = analyticsSnapshot.docs[0].data();
    }
    
    return {
      success: true,
      data: {
        restaurant,
        reviews,
        analytics
      }
    };
    
  } catch (error) {
    logger.error("Error getting restaurant details:", error);
    throw new Error("Failed to get restaurant details");
  }
});

// Add restaurant review
export const addRestaurantReview = onCall({
  cors: true
}, async (request) => {
  try {
    // Verify authentication
    if (!request.auth) {
      throw new Error("Authentication required");
    }
    
    const { restaurantId, rating, title, reviewText, visitDate, visitType, partySize } = request.data;
    const userId = request.auth.uid;
    
    if (!restaurantId || !rating) {
      throw new Error("Restaurant ID and rating are required");
    }
    
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    
    // Check if restaurant exists
    const restaurantDoc = await db.collection("restaurants").doc(restaurantId).get();
    if (!restaurantDoc.exists) {
      throw new Error("Restaurant not found");
    }
    
    // Create review
    const reviewData = {
      restaurantId,
      userId,
      rating,
      title: title || "",
      reviewText: reviewText || "",
      visitDate: visitDate || null,
      visitType: visitType || "dine-in",
      partySize: partySize || null,
      isVerified: false,
      helpfulCount: 0,
      reportCount: 0,
      moderationStatus: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const reviewRef = await db.collection("restaurant_reviews").add(reviewData);
    
    // Update restaurant rating
    await updateRestaurantRating(restaurantId);
    
    return {
      success: true,
      data: {
        id: reviewRef.id,
        ...reviewData
      }
    };
    
  } catch (error) {
    logger.error("Error adding restaurant review:", error);
    throw new Error("Failed to add review");
  }
});

// Helper function to calculate distance between two points
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

// Helper function to update restaurant rating
async function updateRestaurantRating(restaurantId: string) {
  try {
    const reviewsSnapshot = await db.collection("restaurant_reviews")
      .where("restaurantId", "==", restaurantId)
      .get();
    
    if (reviewsSnapshot.empty) {
      return;
    }
    
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await db.collection("restaurants").doc(restaurantId).update({
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
      updatedAt: new Date()
    });
    
  } catch (error) {
    logger.error("Error updating restaurant rating:", error);
  }
}
