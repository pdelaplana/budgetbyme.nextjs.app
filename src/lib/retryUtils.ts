/**
 * Retry utilities for handling failed operations with exponential backoff
 */

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  shouldRetry: (error) => {
    // Retry on network errors, but not on validation or permission errors
    return (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('timeout') ||
      error.message.toLowerCase().includes('connection') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError' // Often thrown by fetch when network is unavailable
    );
  },
};

/**
 * Retry an async operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= mergedConfig.maxRetries; attempt++) {
    try {
      const data = await operation();
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if this is the last attempt
      if (attempt === mergedConfig.maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!mergedConfig.shouldRetry(lastError)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        mergedConfig.baseDelay * Math.pow(mergedConfig.backoffMultiplier, attempt),
        mergedConfig.maxDelay
      );

      // Add some jitter to avoid thundering herd
      const jitter = Math.random() * 0.3; // ±30% jitter
      const delayWithJitter = delay * (1 + jitter - 0.15);

      await new Promise(resolve => setTimeout(resolve, delayWithJitter));
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: mergedConfig.maxRetries + 1,
    totalTime: Date.now() - startTime,
  };
}

/**
 * Category-specific retry configurations
 */
export const CATEGORY_RETRY_CONFIGS = {
  // Loading category data - more aggressive retrying
  load: {
    maxRetries: 3,
    baseDelay: 500,
    maxDelay: 5000,
    shouldRetry: (error: Error) => 
      DEFAULT_RETRY_CONFIG.shouldRetry(error) || 
      error.message.toLowerCase().includes('not found'), // Retry 404s for categories
  },

  // Updating category - less aggressive for data integrity
  update: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 3000,
    shouldRetry: (error: Error) => 
      DEFAULT_RETRY_CONFIG.shouldRetry(error) && 
      !error.message.toLowerCase().includes('validation'), // Don't retry validation errors
  },

  // Deleting category - most conservative
  delete: {
    maxRetries: 1,
    baseDelay: 2000,
    maxDelay: 5000,
    shouldRetry: (error: Error) => 
      DEFAULT_RETRY_CONFIG.shouldRetry(error) && 
      !error.message.toLowerCase().includes('not found'), // Don't retry if already deleted
  },

  // Loading expenses - similar to category loading
  expenses: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 8000,
    shouldRetry: DEFAULT_RETRY_CONFIG.shouldRetry,
  },
} as const;

/**
 * Determine error type based on error characteristics
 */
export function determineErrorType(error: Error): 'network' | 'validation' | 'permission' | 'unknown' {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network-related errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('fetch') ||
    name === 'networkerror' ||
    name === 'typeerror'
  ) {
    return 'network';
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('format') ||
    name === 'validationerror'
  ) {
    return 'validation';
  }

  // Permission errors
  if (
    message.includes('permission') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('access denied') ||
    name === 'permissionerror'
  ) {
    return 'permission';
  }

  return 'unknown';
}

/**
 * Create a user-friendly error message based on error type and context
 */
export function createUserFriendlyErrorMessage(
  error: Error,
  context: 'load' | 'update' | 'delete' | 'expenses'
): string {
  const errorType = determineErrorType(error);
  
  const contextMessages = {
    load: {
      network: 'Unable to load category. Please check your connection and try again.',
      validation: 'Category data is invalid. Please refresh the page.',
      permission: 'You don\'t have permission to view this category.',
      unknown: 'Unable to load category. Please try again later.',
    },
    update: {
      network: 'Unable to save changes. Please check your connection and try again.',
      validation: 'Invalid category data. Please check your inputs and try again.',
      permission: 'You don\'t have permission to edit this category.',
      unknown: 'Unable to save changes. Please try again later.',
    },
    delete: {
      network: 'Unable to delete category. Please check your connection and try again.',
      validation: 'Cannot delete this category. It may have associated expenses.',
      permission: 'You don\'t have permission to delete this category.',
      unknown: 'Unable to delete category. Please try again later.',
    },
    expenses: {
      network: 'Unable to load expenses. Please check your connection and try again.',
      validation: 'Expense data is invalid. Please refresh the page.',
      permission: 'You don\'t have permission to view these expenses.',
      unknown: 'Unable to load expenses. Please try again later.',
    },
  };

  return contextMessages[context][errorType];
}