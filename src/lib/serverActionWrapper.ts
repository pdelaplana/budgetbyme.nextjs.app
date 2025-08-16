import * as Sentry from '@sentry/nextjs';

/**
 * Wrapper for server actions to handle errors gracefully on the client
 */
export async function withServerActionErrorHandling<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  actionName: string,
) {
  return async (...args: T): Promise<R> => {
    try {
      console.log(`🚀 Calling server action: ${actionName}`, { args });
      const result = await action(...args);
      console.log(`✅ Server action success: ${actionName}`, { result });
      return result;
    } catch (error) {
      console.error(`❌ Server action failed: ${actionName}`, error);

      // Log to Sentry
      Sentry.captureException(error, {
        tags: {
          type: 'server-action-error',
          action: actionName,
        },
        extra: {
          args,
        },
      });

      throw error;
    }
  };
}
