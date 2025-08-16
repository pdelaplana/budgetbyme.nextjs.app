import * as Sentry from '@sentry/nextjs';

export interface ServerActionWrapperConfig {
  enableLogging?: boolean;
  enableSentry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Simple wrapper for server actions (non-React context)
 * Use this for basic error handling without React state management
 * For React components, prefer useServerAction hook instead
 */
export async function withServerActionErrorHandling<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  actionName: string,
  config: ServerActionWrapperConfig = {},
): Promise<(...args: T) => Promise<R>> {
  const {
    enableLogging = true,
    enableSentry = true,
    retryCount = 0,
    retryDelay = 1000,
  } = config;

  return async (...args: T): Promise<R> => {
    let attempts = 0;
    const maxAttempts = retryCount + 1;

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
          console.log(`✅ Server action success: ${actionName}`, { result });
        }

        return result;
      } catch (error) {
        attempts++;
        const isLastAttempt = attempts >= maxAttempts;

        if (enableLogging) {
          console.error(
            `❌ Server action failed: ${actionName} (attempt ${attempts}/${maxAttempts})`,
            error,
          );
        }

        if (enableSentry && isLastAttempt) {
          Sentry.captureException(error, {
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
          throw error;
        }

        // Wait before retrying
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    // This should never be reached due to the throw above, but TypeScript needs it
    throw new Error(
      `Server action ${actionName} failed after ${maxAttempts} attempts`,
    );
  };
}

/**
 * Simplified wrapper with default configuration
 */
export const wrapServerAction = <T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  actionName: string,
) => {
  return withServerActionErrorHandling(action, actionName, {
    enableLogging: true,
    enableSentry: true,
  });
};
