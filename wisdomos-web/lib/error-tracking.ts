/**
 * Error Tracking and Logging Utilities
 * Simple error tracking system for WisdomOS
 */

interface ErrorContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: string;
  [key: string]: string | undefined;
}

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: ErrorReport[] = [];
  private maxErrors = 1000; // Keep last 1000 errors in memory

  private constructor() {}

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Log an error with context
   */
  captureError(
    error: Error | string,
    context: ErrorContext = {},
    severity: ErrorReport['severity'] = 'medium'
  ): string {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const errorReport: ErrorReport = {
      id: errorId,
      message: errorMessage,
      stack: errorStack,
      context: {
        ...context,
        timestamp
      },
      severity,
      timestamp
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR ${errorId}]`, errorReport);
    }

    // Store in memory (in production, you'd send to external service)
    this.errors.unshift(errorReport);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // In production, you would send to services like:
    // - Sentry
    // - LogRocket
    // - Bugsnag
    // - DataDog
    // - Custom logging service

    return errorId;
  }

  /**
   * Log API errors with request context
   */
  captureAPIError(
    error: Error | string,
    request: Request,
    additionalContext: Record<string, string> = {}
  ): string {
    const context: ErrorContext = {
      endpoint: new URL(request.url).pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ...additionalContext
    };

    return this.captureError(error, context, 'high');
  }

  /**
   * Log authentication errors
   */
  captureAuthError(
    error: Error | string,
    context: ErrorContext = {}
  ): string {
    return this.captureError(error, { ...context, type: 'authentication' }, 'high');
  }

  /**
   * Log database errors
   */
  captureDBError(
    error: Error | string,
    context: ErrorContext = {}
  ): string {
    return this.captureError(error, { ...context, type: 'database' }, 'critical');
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50): ErrorReport[] {
    return this.errors.slice(0, limit);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    last24h: number;
  } {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const last24h = this.errors.filter(error => 
      new Date(error.timestamp).getTime() > twentyFourHoursAgo
    ).length;

    return {
      total: this.errors.length,
      bySeverity,
      last24h
    };
  }

  /**
   * Clear all errors (useful for testing)
   */
  clearErrors(): void {
    this.errors = [];
  }

  private generateErrorId(): string {
    return 'err_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Singleton instance
const errorTracker = ErrorTracker.getInstance();

// Utility functions for easy access
export const captureError = (
  error: Error | string,
  context?: ErrorContext,
  severity?: ErrorReport['severity']
) => errorTracker.captureError(error, context, severity);

export const captureAPIError = (
  error: Error | string,
  request: Request,
  context?: Record<string, string>
) => errorTracker.captureAPIError(error, request, context);

export const captureAuthError = (
  error: Error | string,
  context?: ErrorContext
) => errorTracker.captureAuthError(error, context);

export const captureDBError = (
  error: Error | string,
  context?: ErrorContext
) => errorTracker.captureDBError(error, context);

export const getRecentErrors = (limit?: number) => 
  errorTracker.getRecentErrors(limit);

export const getErrorStats = () => 
  errorTracker.getErrorStats();

export default errorTracker;

// Global error handler setup (optional)
if (typeof window !== 'undefined') {
  // Client-side error handling
  window.addEventListener('error', (event) => {
    captureError(event.error || event.message, {
      type: 'unhandled_error',
      filename: event.filename,
      lineno: event.lineno?.toString(),
      colno: event.colno?.toString()
    }, 'high');
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, {
      type: 'unhandled_promise_rejection'
    }, 'high');
  });
}

// Types for external use
export type { ErrorContext, ErrorReport };