"use strict";
/**
 * Restaurant API Functions
 * Handle restaurant-related operations
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRestaurantReview = exports.getRestaurantDetails = exports.searchRestaurants = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const db = (0, firestore_1.getFirestore)();
const auth = (0, auth_1.getAuth)();
// Search restaurants with filters
exports.searchRestaurants = (0, https_1.onCall)({
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
        const restaurants = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Filter by location if coordinates provided
        let filteredRestaurants = restaurants;
        if (latitude && longitude && radius) {
            filteredRestaurants = restaurants.filter((restaurant) => {
                const distance = calculateDistance(latitude, longitude, restaurant.latitude, restaurant.longitude);
                return distance <= radius;
            });
        }
        // Filter by text query
        if (query) {
            const searchTerm = query.toLowerCase();
            filteredRestaurants = filteredRestaurants.filter((restaurant) => {
                var _a, _b, _c;
                return ((_a = restaurant.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
                    ((_b = restaurant.cuisineType) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm)) ||
                    ((_c = restaurant.description) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchTerm));
            });
        }
        return {
            success: true,
            data: filteredRestaurants,
            total: filteredRestaurants.length
        };
    }
    catch (error) {
        logger.error("Error searching restaurants:", error);
        throw new Error("Failed to search restaurants");
    }
});
// Get restaurant details with reviews
exports.getRestaurantDetails = (0, https_1.onCall)({
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
        const restaurant = Object.assign({ id: restaurantDoc.id }, restaurantDoc.data());
        // Get recent reviews
        const reviewsSnapshot = await db.collection("restaurant_reviews")
            .where("restaurantId", "==", restaurantId)
            .orderBy("createdAt", "desc")
            .limit(20)
            .get();
        const reviews = await Promise.all(reviewsSnapshot.docs.map(async (reviewDoc) => {
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
                }
                catch (error) {
                    logger.warn("Could not fetch user for review:", reviewData.userId);
                }
            }
            return Object.assign(Object.assign({ id: reviewDoc.id }, reviewData), { user });
        }));
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
    }
    catch (error) {
        logger.error("Error getting restaurant details:", error);
        throw new Error("Failed to get restaurant details");
    }
});
// Add restaurant review
exports.addRestaurantReview = (0, https_1.onCall)({
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
            data: Object.assign({ id: reviewRef.id }, reviewData)
        };
    }
    catch (error) {
        logger.error("Error adding restaurant review:", error);
        throw new Error("Failed to add review");
    }
});
// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// Helper function to update restaurant rating
async function updateRestaurantRating(restaurantId) {
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
    }
    catch (error) {
        logger.error("Error updating restaurant rating:", error);
    }
}
//# sourceMappingURL=restaurants.js.map