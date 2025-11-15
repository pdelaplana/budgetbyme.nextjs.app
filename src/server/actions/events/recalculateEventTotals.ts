'use server';

import * as Sentry from '@sentry/nextjs';
import { updateEventTotals } from '../../lib/eventAggregation';
import { withSentryServerAction } from '../../lib/sentryServerAction';

export interface RecalculateEventTotalsDto {
  userId: string;
  eventId?: string; // If provided, only recalculate this event. If not, recalculate all user's events
}

export interface RecalculationResult {
  success: boolean;
  eventsProcessed: number;
  errors?: string[];
}

/**
 * Server action to recalculate event totals
 * Can recalculate a single event or all events for a user
 * Wrapped with Sentry monitoring
 */
export const recalculateEventTotals = withSentryServerAction(
  'recalculateEventTotals',
  async (dto: RecalculateEventTotalsDto): Promise<RecalculationResult> => {
    if (!dto.userId) throw new Error('User ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: dto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'event.recalculate',
        message: 'Starting event totals recalculation',
        level: 'debug',
        data: {
          userId: dto.userId,
          eventId: dto.eventId || 'all',
        },
      });

      let eventsProcessed = 0;
      const errors: string[] = [];

      if (dto.eventId) {
        // Recalculate single event
        try {
          await updateEventTotals(dto.userId, dto.eventId);
          eventsProcessed = 1;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push(`Event ${dto.eventId}: ${errorMessage}`);
        }
      } else {
        // Recalculate all events for user - we'll implement this if needed
        throw new Error(
          'Recalculating all events not implemented yet. Please provide an eventId.',
        );
      }

      // Add breadcrumb for successful recalculation
      Sentry.addBreadcrumb({
        category: 'event.recalculate',
        message: 'Event totals recalculation completed',
        level: 'info',
        data: {
          userId: dto.userId,
          eventId: dto.eventId,
          eventsProcessed,
          errorCount: errors.length,
        },
      });

      return {
        success: errors.length === 0,
        eventsProcessed,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Error recalculating event totals:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'recalculateEventTotals',
          userId: dto.userId,
          eventId: dto.eventId || 'all',
        },
        extra: {
          userInput: dto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to recalculate event totals: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
