/**
 * BiteBase Intelligence Firebase Functions
 * Restaurant Intelligence Platform Backend Services
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

// Initialize Firebase Admin
admin.initializeApp();
const db = getFirestore();
const auth = getAuth();

// Global configuration for cost control
setGlobalOptions({
  maxInstances: 10,
  region: "us-central1"
});

// Import function modules
import "./api/restaurants";
import "./api/locations";
import "./api/reports";

// Health check endpoint
export const healthCheck = onRequest(async (req, res) => {
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
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Main API router
export const api = onRequest({
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
    } else if (path.startsWith("/locations")) {
      // Handle location analysis endpoints
      await handleLocationRoutes(req, res);
    } else if (path.startsWith("/reports")) {
      // Handle market report endpoints
      await handleReportRoutes(req, res);
    } else if (path.startsWith("/analytics")) {
      // Handle analytics endpoints
      await handleAnalyticsRoutes(req, res);
    } else {
      res.status(404).json({ error: "Endpoint not found" });
    }
  } catch (error) {
    logger.error("API Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Authentication middleware
export const authenticateUser = async (req: any): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization header");
  }

  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await auth.verifyIdToken(token);
  return decodedToken;
};

// Placeholder route handlers (to be implemented in separate files)
async function handleRestaurantRoutes(req: any, res: any) {
  res.status(501).json({ error: "Restaurant routes not implemented yet" });
}

async function handleLocationRoutes(req: any, res: any) {
  res.status(501).json({ error: "Location routes not implemented yet" });
}

async function handleReportRoutes(req: any, res: any) {
  res.status(501).json({ error: "Report routes not implemented yet" });
}

async function handleAnalyticsRoutes(req: any, res: any) {
  res.status(501).json({ error: "Analytics routes not implemented yet" });
}
