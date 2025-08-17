'use client';

import * as Sentry from '@sentry/nextjs';
import { useCallback, useState } from 'react';

export interface UseServerActionReturn<T extends unknown[], R> {
  execute: (...args: T) => Promise<R | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  lastResult: R | null;
}

export interface ServerActionConfig {
  actionName: string;
  enableLogging?: boolean;
  enableSentry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Custom hook for executing server actions with state management
 * Provides loading states, error handling, and optional retry logic
 */
export function useServerAction<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  config: ServerActionConfig,
): UseServerActionReturn<T, R> {
  const {
    actionName,
    enableLogging = true,
    enableSentry = true,
    retryCount = 0,
    retryDelay = 1000,
  } = config;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<R | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      setIsLoading(true);
      setError(null);

      let attempts = 0;
      const maxAttempts = retryCount + 1;

      try {
        while (attempts < maxAttempts) {
          try {
            if (enableLogging) {
              console.log(`🚀 Calling server action: ${actionName}`, {
                args,
                attempt: attempts + 1,
                maxAttempts,
              });
            }

            const result = await action(...args);

            if (enableLogging) {
              console.log(`✅ Server action success: ${actionName}`, {
                result,
              });
            }

            setLastResult(result);
            return result;
          } catch (actionError) {
            attempts++;
            const isLastAttempt = attempts >= maxAttempts;

            if (enableLogging) {
              console.error(
                `❌ Server action failed: ${actionName} (attempt ${attempts}/${maxAttempts})`,
                actionError,
              );
            }

            if (enableSentry && isLastAttempt) {
              Sentry.captureException(actionError, {
                tags: {
                  type: 'server-action-error',
                  action: actionName,
                },
                extra: {
                  args,
                  attempts,
                  maxAttempts,
                },
              });
            }

            if (isLastAttempt) {
              const errorMessage =
                actionError instanceof Error
                  ? actionError.message
                  : `Server action failed: ${actionName}`;
              setError(errorMessage);
              return null;
            }

            // Wait before retrying
            if (retryDelay > 0) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
          }
        }
      } finally {
        // Always reset loading state when execution completes
        setIsLoading(false);
      }

      return null;
    },
    [action, actionName, enableLogging, enableSentry, retryCount, retryDelay],
  );

  return {
    execute,
    isLoading,
    error,
    clearError,
    lastResult,
  };
}

/**
 * Simplified version for basic server action usage
 */
export function useSimpleServerAction<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  actionName: string,
): UseServerActionReturn<T, R> {
  return useServerAction(action, {
    actionName,
    enableLogging: true,
    enableSentry: true,
  });
}
