/**
 * Error Monitoring System
 * Basierend auf Optimierungsbericht für robuste Fehlerbehandlung
 */

interface ErrorReport {
  timestamp: string;
  error: Error;
  context: string;
  userAgent: string;
  url: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stack: string;
  componentStack?: string;
}

class ErrorMonitoringService {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 100;
  private isOnline = navigator.onLine;

  constructor() {
    this.initializeErrorHandlers();
    this.initializeNetworkMonitoring();
  }

  private initializeErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(new Error(event.message), 'global', 'high', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        'promise',
        'critical'
      );
    });

    // React Error Boundary fallback
    if (typeof window !== 'undefined') {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        if (args[0]?.includes?.('React') || args[0]?.includes?.('Warning')) {
          this.captureError(
            new Error(`React Error: ${args.join(' ')}`),
            'react',
            'medium'
          );
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  private initializeNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  public captureError(
    error: Error,
    context: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    additionalData?: Record<string, any>
  ) {
    const errorReport: ErrorReport = {
      timestamp: new Date().toISOString(),
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity,
      stack: error.stack || '',
      ...additionalData
    };

    // Add to queue
    this.errorQueue.push(errorReport);

    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error Captured [${severity.toUpperCase()}]`);
      console.log('Context:', context);
      console.log('Error:', error);
      console.log('Additional Data:', additionalData);
      console.groupEnd();
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0 || !this.isOnline) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to error monitoring service
      if (!import.meta.env.DEV) {
        await fetch('/api/errors/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ errors: errorsToSend }),
        });
      }
    } catch (sendError) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errorsToSend);
      console.warn('Failed to send error reports:', sendError);
    }
  }

  public getErrorStats() {
    const errorCounts = this.errorQueue.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errorQueue.length,
      errorCounts,
      isOnline: this.isOnline,
      lastError: this.errorQueue[this.errorQueue.length - 1]
    };
  }

  public clearErrorQueue() {
    this.errorQueue = [];
  }
}

// API Error Helper
export const handleApiError = (error: Error, endpoint: string) => {
  errorMonitor.captureError(error, `api:${endpoint}`, 'high', {
    endpoint,
    timestamp: Date.now()
  });
};

// Component Error Helper
export const handleComponentError = (error: Error, componentName: string) => {
  errorMonitor.captureError(error, `component:${componentName}`, 'medium', {
    component: componentName,
    timestamp: Date.now()
  });
};

// Simple error reporting functions
export const reportError = (error: Error, context: string) => {
  errorMonitor.captureError(error, context, 'medium');
};

// Global error monitor instance
export const errorMonitor = new ErrorMonitoringService();

// Export React for the Error Boundary
import React from 'react';

// Development-only type checking
declare global {
  interface Window {
    errorMonitor?: ErrorMonitoringService;
  }
}

// Expose error monitor globally in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.errorMonitor = errorMonitor;
}