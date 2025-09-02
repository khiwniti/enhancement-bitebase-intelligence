"use strict";
/**
 * Shared Utilities for Firebase Functions
 *
 * Common utility functions used across all functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiResponse = createApiResponse;
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
exports.validateRequiredFields = validateRequiredFields;
exports.calculateDistance = calculateDistance;
exports.formatDate = formatDate;
exports.parseCoordinates = parseCoordinates;
/**
 * Create a standardized API response
 */
function createApiResponse(success, data, error, message) {
    return {
        success,
        data,
        error,
        message
    };
}
/**
 * Create a success response
 */
function successResponse(data, message) {
    return createApiResponse(true, data, undefined, message);
}
/**
 * Create an error response
 */
function errorResponse(error, message) {
    return createApiResponse(false, undefined, error, message);
}
/**
 * Validate required fields in request body
 */
function validateRequiredFields(body, requiredFields) {
    for (const field of requiredFields) {
        if (!body[field]) {
            return `Missing required field: ${field}`;
        }
    }
    return null;
}
/**
 * Calculate distance between two coordinates (in kilometers)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * Format date to ISO string
 */
function formatDate(date = new Date()) {
    return date.toISOString();
}
/**
 * Parse and validate coordinates
 */
function parseCoordinates(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
        return null;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return null;
    }
    return { latitude, longitude };
}
//# sourceMappingURL=index.js.map