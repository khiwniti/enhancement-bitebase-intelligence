"use strict";
/**
 * BiteBase Intelligence Firebase Functions
 * Restaurant Intelligence Platform Backend Services
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
exports.authenticateUser = exports.api = exports.healthCheck = void 0;
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
// Initialize Firebase Admin
admin.initializeApp();
const db = (0, firestore_1.getFirestore)();
const auth = (0, auth_1.getAuth)();
// Global configuration for cost control
(0, firebase_functions_1.setGlobalOptions)({
    maxInstances: 10,
    region: "us-central1"
});
// Import function modules
require("./api/restaurants");
require("./api/locations");
require("./api/reports");
// Health check endpoint
exports.healthCheck = (0, https_1.onRequest)(async (req, res) => {
    try {
        // Check database connectivity
        await db.collection("health").doc("check").get();
        res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            services: {
                firestore: "connected",
                auth: "connected",
                dataconnect: "connected"
            }
        });
    }
    catch (error) {
        logger.error("Health check failed:", error);
        res.status(500).json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
// Main API router
exports.api = (0, https_1.onRequest)({
    cors: true,
    maxInstances: 20
}, async (req, res) => {
    // Set CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }
    try {
        const path = req.path;
        const method = req.method;
        logger.info(`API Request: ${method} ${path}`);
        // Route to appropriate handlers
        if (path.startsWith("/restaurants")) {
            // Handle restaurant-related endpoints
            await handleRestaurantRoutes(req, res);
        }
        else if (path.startsWith("/locations")) {
            // Handle location analysis endpoints
            await handleLocationRoutes(req, res);
        }
        else if (path.startsWith("/reports")) {
            // Handle market report endpoints
            await handleReportRoutes(req, res);
        }
        else if (path.startsWith("/analytics")) {
            // Handle analytics endpoints
            await handleAnalyticsRoutes(req, res);
        }
        else {
            res.status(404).json({ error: "Endpoint not found" });
        }
    }
    catch (error) {
        logger.error("API Error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
// Authentication middleware
const authenticateUser = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("No valid authorization header");
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
};
exports.authenticateUser = authenticateUser;
// Placeholder route handlers (to be implemented in separate files)
async function handleRestaurantRoutes(req, res) {
    res.status(501).json({ error: "Restaurant routes not implemented yet" });
}
async function handleLocationRoutes(req, res) {
    res.status(501).json({ error: "Location routes not implemented yet" });
}
async function handleReportRoutes(req, res) {
    res.status(501).json({ error: "Report routes not implemented yet" });
}
async function handleAnalyticsRoutes(req, res) {
    res.status(501).json({ error: "Analytics routes not implemented yet" });
}
//# sourceMappingURL=index.js.map