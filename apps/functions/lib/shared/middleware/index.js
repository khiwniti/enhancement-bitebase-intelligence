"use strict";
/**
 * Shared Middleware for Firebase Functions
 *
 * Common middleware functions for request handling, validation, and error management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = corsMiddleware;
exports.validateRequest = validateRequest;
exports.errorHandler = errorHandler;
exports.requestLogger = requestLogger;
exports.rateLimiter = rateLimiter;
const utils_1 = require("../utils");
/**
 * CORS middleware for Firebase Functions
 */
function corsMiddleware(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    next();
}
/**
 * Request validation middleware
 */
function validateRequest(requiredFields) {
    return (req, res, next) => {
        const validationError = (0, utils_1.validateRequiredFields)(req.body, requiredFields);
        if (validationError) {
            res.status(400).json((0, utils_1.errorResponse)(validationError));
            return;
        }
        next();
    };
}
/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Function error:', err);
    res.status(500).json((0, utils_1.errorResponse)('Internal server error', err.message));
}
/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        timestamp: new Date().toISOString()
    });
    next();
}
/**
 * Rate limiting middleware (basic implementation)
 */
const requestCounts = new Map();
function rateLimiter(maxRequests = 100, windowMs = 60000) {
    return (req, res, next) => {
        const clientId = req.ip || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        let clientData = requestCounts.get(clientId);
        if (!clientData || clientData.resetTime < windowStart) {
            clientData = { count: 1, resetTime: now + windowMs };
            requestCounts.set(clientId, clientData);
            next();
            return;
        }
        if (clientData.count >= maxRequests) {
            res.status(429).json((0, utils_1.errorResponse)('Too many requests'));
            return;
        }
        clientData.count++;
        next();
    };
}
//# sourceMappingURL=index.js.map