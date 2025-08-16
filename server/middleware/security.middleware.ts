import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(rateLimitStore).forEach(ip => {
      if (rateLimitStore[ip].resetTime < now) {
        delete rateLimitStore[ip];
      }
    });
    
    // Check current client
    if (!rateLimitStore[clientIp]) {
      rateLimitStore[clientIp] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      rateLimitStore[clientIp].count++;
    }
    
    const clientData = rateLimitStore[clientIp];
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - clientData.count).toString(),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
    });
    
    if (clientData.count > maxRequests) {
      logger.warn('Rate limit exceeded', { 
        clientIp, 
        path: req.path, 
        userAgent: req.get('User-Agent') 
      });
      
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  
  next();
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic input sanitization
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().slice(0, 10000); // Limit string length
    }
    if (Array.isArray(obj)) {
      return obj.slice(0, 100).map(sanitize); // Limit array length
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      const keys = Object.keys(obj).slice(0, 50); // Limit object keys
      for (const key of keys) {
        if (key.length <= 100) { // Limit key length
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
};