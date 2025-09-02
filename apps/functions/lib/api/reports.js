"use strict";
/**
 * Market Reports API Functions
 * Handle AI-powered market report generation
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
exports.deleteMarketReport = exports.getMarketReport = exports.getMarketReports = exports.generateMarketReport = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
// Generate market report using AI
exports.generateMarketReport = (0, https_1.onCall)({
    cors: true,
    timeoutSeconds: 540 // 9 minutes for AI processing
}, async (request) => {
    try {
        // Verify authentication
        if (!request.auth) {
            throw new Error("Authentication required");
        }
        const { title, query, reportType = "market_analysis", targetLocation, analysisRadius = 2.0, coordinates } = request.data;
        const userId = request.auth.uid;
        if (!title || !query) {
            throw new Error("Title and query are required");
        }
        logger.info("Generating market report:", { title, query, reportType });
        // Create initial report record
        const reportData = {
            userId,
            title,
            query,
            status: "PENDING",
            reportType,
            targetLocation: targetLocation || "",
            analysisRadius,
            coordinates: coordinates || null,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isPublic: false
        };
        const reportRef = await db.collection("market_reports").add(reportData);
        // Process report asynchronously
        processMarketReport(reportRef.id, query, targetLocation, coordinates, analysisRadius)
            .catch(error => {
            logger.error("Error processing market report:", error);
            // Update report status to failed
            reportRef.update({
                status: "FAILED",
                completedAt: new Date()
            });
        });
        return {
            success: true,
            data: Object.assign({ id: reportRef.id }, reportData)
        };
    }
    catch (error) {
        logger.error("Error generating market report:", error);
        throw new Error("Failed to generate market report");
    }
});
// Get user's market reports
exports.getMarketReports = (0, https_1.onCall)({
    cors: true
}, async (request) => {
    try {
        if (!request.auth) {
            throw new Error("Authentication required");
        }
        const { status, limit = 20, offset = 0 } = request.data;
        const userId = request.auth.uid;
        let query = db.collection("market_reports")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .offset(offset);
        if (status) {
            query = query.where("status", "==", status);
        }
        const snapshot = await query.get();
        const reports = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        return {
            success: true,
            data: reports,
            total: reports.length
        };
    }
    catch (error) {
        logger.error("Error getting market reports:", error);
        throw new Error("Failed to get market reports");
    }
});
// Get specific market report
exports.getMarketReport = (0, https_1.onCall)({
    cors: true
}, async (request) => {
    try {
        if (!request.auth) {
            throw new Error("Authentication required");
        }
        const { reportId } = request.data;
        const userId = request.auth.uid;
        if (!reportId) {
            throw new Error("Report ID is required");
        }
        const reportDoc = await db.collection("market_reports").doc(reportId).get();
        if (!reportDoc.exists) {
            throw new Error("Report not found");
        }
        const reportData = reportDoc.data();
        // Check if user owns the report or if it's public
        if ((reportData === null || reportData === void 0 ? void 0 : reportData.userId) !== userId && !(reportData === null || reportData === void 0 ? void 0 : reportData.isPublic)) {
            throw new Error("Access denied");
        }
        return {
            success: true,
            data: Object.assign({ id: reportDoc.id }, reportData)
        };
    }
    catch (error) {
        logger.error("Error getting market report:", error);
        throw new Error("Failed to get market report");
    }
});
// Delete market report
exports.deleteMarketReport = (0, https_1.onCall)({
    cors: true
}, async (request) => {
    try {
        if (!request.auth) {
            throw new Error("Authentication required");
        }
        const { reportId } = request.data;
        const userId = request.auth.uid;
        if (!reportId) {
            throw new Error("Report ID is required");
        }
        const reportDoc = await db.collection("market_reports").doc(reportId).get();
        if (!reportDoc.exists) {
            throw new Error("Report not found");
        }
        const reportData = reportDoc.data();
        // Check if user owns the report
        if ((reportData === null || reportData === void 0 ? void 0 : reportData.userId) !== userId) {
            throw new Error("Access denied");
        }
        await reportDoc.ref.delete();
        return {
            success: true,
            message: "Report deleted successfully"
        };
    }
    catch (error) {
        logger.error("Error deleting market report:", error);
        throw new Error("Failed to delete market report");
    }
});
// Process market report (async function)
async function processMarketReport(reportId, query, targetLocation, coordinates, analysisRadius) {
    try {
        logger.info("Processing market report:", reportId);
        const startTime = Date.now();
        // Update status to processing
        await db.collection("market_reports").doc(reportId).update({
            status: "PROCESSING"
        });
        // Gather market data
        const marketData = await gatherMarketData(targetLocation, coordinates, analysisRadius);
        // Generate AI analysis (placeholder - would integrate with actual AI service)
        const analysis = await generateAIAnalysis(query, marketData);
        const processingTime = (Date.now() - startTime) / 1000; // in seconds
        // Update report with results
        await db.collection("market_reports").doc(reportId).update({
            status: "COMPLETED",
            executiveSummary: analysis.executiveSummary,
            marketAnalysis: analysis.marketAnalysis,
            competitorAnalysis: analysis.competitorAnalysis,
            demographicAnalysis: analysis.demographicAnalysis,
            recommendations: analysis.recommendations,
            riskAssessment: analysis.riskAssessment,
            confidence: analysis.confidence,
            dataQuality: analysis.dataQuality,
            processingTime,
            completedAt: new Date()
        });
        logger.info("Market report completed:", reportId);
    }
    catch (error) {
        logger.error("Error processing market report:", error);
        // Update report status to failed
        await db.collection("market_reports").doc(reportId).update({
            status: "FAILED",
            completedAt: new Date()
        });
    }
}
// Gather market data for analysis
async function gatherMarketData(targetLocation, coordinates, analysisRadius) {
    try {
        // Get restaurants in the area
        let restaurants = [];
        if (coordinates && coordinates.latitude && coordinates.longitude) {
            const snapshot = await db.collection("restaurants")
                .where("isOpen", "==", true)
                .get();
            restaurants = snapshot.docs
                .map(doc => (Object.assign({ id: doc.id }, doc.data())))
                .filter((restaurant) => {
                const distance = calculateDistance(coordinates.latitude, coordinates.longitude, restaurant.latitude, restaurant.longitude);
                return distance <= analysisRadius;
            });
        }
        // Get recent location analyses for the area
        const analysesSnapshot = await db.collection("location_analyses")
            .orderBy("analysisDate", "desc")
            .limit(10)
            .get();
        const recentAnalyses = analysesSnapshot.docs.map(doc => doc.data());
        return {
            restaurants,
            recentAnalyses,
            targetLocation,
            analysisRadius
        };
    }
    catch (error) {
        logger.error("Error gathering market data:", error);
        return {
            restaurants: [],
            recentAnalyses: [],
            targetLocation,
            analysisRadius
        };
    }
}
// Generate AI analysis (placeholder)
async function generateAIAnalysis(query, marketData) {
    // In a real implementation, this would call an AI service like OpenAI, Gemini, etc.
    // For now, return structured mock analysis
    const restaurantCount = marketData.restaurants.length;
    const avgRating = marketData.restaurants.length > 0
        ? marketData.restaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / restaurantCount
        : 0;
    return {
        executiveSummary: `Market analysis for "${query}" reveals ${restaurantCount} restaurants in the target area with an average rating of ${avgRating.toFixed(1)}. The market shows ${restaurantCount < 10 ? 'low' : restaurantCount < 25 ? 'moderate' : 'high'} competition levels.`,
        marketAnalysis: {
            totalRestaurants: restaurantCount,
            averageRating: avgRating,
            marketSaturation: restaurantCount / (Math.PI * Math.pow(marketData.analysisRadius, 2)),
            growthPotential: restaurantCount < 15 ? "High" : restaurantCount < 30 ? "Medium" : "Low"
        },
        competitorAnalysis: {
            directCompetitors: Math.floor(restaurantCount * 0.3),
            indirectCompetitors: Math.floor(restaurantCount * 0.7),
            competitiveAdvantages: ["Location", "Service Quality", "Unique Cuisine"],
            threats: restaurantCount > 20 ? ["High Competition", "Market Saturation"] : ["New Entrants"]
        },
        demographicAnalysis: {
            targetDemographic: "Adults 25-45",
            incomeLevel: "Middle to Upper-Middle Class",
            diningPreferences: ["Quality", "Convenience", "Value"]
        },
        recommendations: [
            restaurantCount < 10 ? "Strong opportunity for new restaurant" : "Consider differentiation strategy",
            avgRating < 4.0 ? "Focus on superior service quality" : "Maintain competitive standards",
            "Conduct detailed feasibility study",
            "Analyze foot traffic patterns"
        ],
        riskAssessment: {
            level: restaurantCount > 25 ? "High" : restaurantCount > 15 ? "Medium" : "Low",
            factors: [
                restaurantCount > 20 ? "Market saturation" : "Limited competition",
                "Economic conditions",
                "Regulatory changes"
            ],
            mitigation: [
                "Unique value proposition",
                "Strong marketing strategy",
                "Operational efficiency"
            ]
        },
        confidence: Math.min(0.9, 0.5 + (restaurantCount / 50)),
        dataQuality: restaurantCount > 10 ? "HIGH" : restaurantCount > 5 ? "MEDIUM" : "LOW"
    };
}
// Helper function to calculate distance
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
//# sourceMappingURL=reports.js.map