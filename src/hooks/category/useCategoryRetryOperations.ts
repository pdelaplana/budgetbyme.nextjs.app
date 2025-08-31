'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { withRetry, CATEGORY_RETRY_CONFIGS, determineErrorType, createUserFriendlyErrorMessage } from '@/lib/retryUtils';
import { useCategoryPageState, type CategoryPageState } from './useCategoryPageState';

/**
 * Custom hook for handling category operations with retry logic
 */
export function useCategoryRetryOperations() {
  const { state, actions, selectors } = useCategoryPageState();

  /**
   * Execute an operation with retry logic and error handling
   */
  const executeWithRetry = useCallback(async <T>(
    operationName: keyof CategoryPageState['errors'],
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      customRetryConfig?: typeof CATEGORY_RETRY_CONFIGS[keyof typeof CATEGORY_RETRY_CONFIGS];
      contextName?: 'load' | 'update' | 'delete' | 'expenses';
    }
  ): Promise<T | null> => {
    const {
      onSuccess,
      onError,
      customRetryConfig,
      contextName = 'load'
    } = options || {};

    // Clear any existing errors for this operation
    actions.clearError(operationName);
    actions.setRetrying(true);

    try {
      // Get appropriate retry config
      const retryConfig = customRetryConfig || CATEGORY_RETRY_CONFIGS[contextName];
      
      // Execute operation with retry logic
      const result = await withRetry(operation, retryConfig);

      actions.setRetrying(false);

      if (result.success && result.data !== undefined) {
        // Success - clear any previous errors
        actions.clearError(operationName);
        onSuccess?.(result.data);
        return result.data;
      } else {
        // Failed after retries
        const error = result.error || new Error('Operation failed');
        const errorType = determineErrorType(error);
        const userMessage = createUserFriendlyErrorMessage(error, contextName);

        // Set error state
        actions.setError(operationName, error, errorType);
        
        // Show user-friendly error message
        toast.error(userMessage);
        
        onError?.(error);
        return null;
      }
    } catch (error) {
      // Unexpected error outside of retry logic
      actions.setRetrying(false);
      const err = error as Error;
      const errorType = determineErrorType(err);
      
      actions.setError(operationName, err, errorType);
      toast.error(createUserFriendlyErrorMessage(err, contextName));
      
      onError?.(err);
      return null;
    }
  }, [actions]);

  /**
   * Retry a specific operation that previously failed
   */
  const retryOperation = useCallback(async (
    operationName: keyof CategoryPageState['errors'],
    operation: () => Promise<any>,
    contextName: 'load' | 'update' | 'delete' | 'expenses' = 'load'
  ) => {
    if (!selectors.canRetry(operationName)) {
      toast.error('Maximum retry attempts reached. Please refresh the page.');
      return null;
    }

    // Increment retry count
    actions.retryOperation(operationName);
    
    toast.info('Retrying operation...');

    return executeWithRetry(operationName, operation, { contextName });
  }, [actions, selectors, executeWithRetry]);

  /**
   * Category-specific retry operations
   */
  const retryOperations = {
    /**
     * Retry loading category data
     */
    retryLoadCategory: (loadOperation: () => Promise<any>) =>
      retryOperation('categoryLoad', loadOperation, 'load'),

    /**
     * Retry updating category
     */
    retryUpdateCategory: (updateOperation: () => Promise<any>) =>
      retryOperation('categoryUpdate', updateOperation, 'update'),

    /**
     * Retry deleting category
     */
    retryDeleteCategory: (deleteOperation: () => Promise<any>) =>
      retryOperation('categoryDelete', deleteOperation, 'delete'),

    /**
     * Retry loading expenses
     */
    retryLoadExpenses: (loadOperation: () => Promise<any>) =>
      retryOperation('expenseLoad', loadOperation, 'expenses'),
  };

  /**
   * Execute operations with automatic retry
   */
  const operations = {
    /**
     * Execute category loading with retry
     */
    executeLoadCategory: <T>(operation: () => Promise<T>, onSuccess?: (data: T) => void) =>
      executeWithRetry('categoryLoad', operation, { 
        contextName: 'load', 
        onSuccess 
      }),

    /**
     * Execute category update with retry
     */
    executeUpdateCategory: <T>(operation: () => Promise<T>, onSuccess?: (data: T) => void) =>
      executeWithRetry('categoryUpdate', operation, { 
        contextName: 'update', 
        onSuccess,
        onError: (error) => {
          // Additional logging for update failures
          console.error('Category update failed:', error);
        }
      }),

    /**
     * Execute category deletion with retry
     */
    executeDeleteCategory: <T>(operation: () => Promise<T>, onSuccess?: (data: T) => void) =>
      executeWithRetry('categoryDelete', operation, { 
        contextName: 'delete', 
        onSuccess,
        customRetryConfig: CATEGORY_RETRY_CONFIGS.delete
      }),

    /**
     * Execute expense loading with retry
     */
    executeLoadExpenses: <T>(operation: () => Promise<T>, onSuccess?: (data: T) => void) =>
      executeWithRetry('expenseLoad', operation, { 
        contextName: 'expenses', 
        onSuccess 
      }),
  };

  return {
    state,
    actions,
    selectors,
    executeWithRetry,
    retryOperations,
    operations,
    
    // Convenience getters for error states
    hasErrors: selectors.hasAnyError(),
    isRetrying: state.operations.isRetrying,
    
    // Quick access to specific error states
    categoryLoadError: selectors.getError('categoryLoad'),
    categoryUpdateError: selectors.getError('categoryUpdate'),
    categoryDeleteError: selectors.getError('categoryDelete'),
    expenseLoadError: selectors.getError('expenseLoad'),
  };
}