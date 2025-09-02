/**
 * Shared Middleware for Firebase Functions
 * 
 * Common middleware functions for request handling, validation, and error management
 */

import { Request, Response, NextFunction } from 'express';
import { errorResponse, validateRequiredFields } from '../utils';

/**
 * CORS middleware for Firebase Functions
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
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
export function validateRequest(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationError = validateRequiredFields(req.body, requiredFields);
    if (validationError) {
      res.status(400).json(errorResponse(validationError));
      return;
    }
    next();
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Function error:', err);
  res.status(500).json(errorResponse('Internal server error', err.message));
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
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
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
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
      res.status(429).json(errorResponse('Too many requests'));
      return;
    }
    
    clientData.count++;
    next();
  };
}
