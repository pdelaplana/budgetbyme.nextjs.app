'use server';

import * as Sentry from '@sentry/nextjs';
import type { Currency } from '@/types/currencies';
import type { Event, EventStatus, EventType } from '@/types/Event';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { EventDocument } from '../../types/EventDocument';

/**
 * Server action to fetch all events for a user workspace from Firestore
 * Wrapped with Sentry monitoring
 */
export const fetchEvents = withSentryServerAction(
  'fetchEvents',
  async (userId: string): Promise<Event[]> => {
    if (!userId) throw new Error('User ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: userId });

      // Add breadcrumb for tracking action flow
      Sentry.addBreadcrumb({
        category: 'event.fetch',
        message: 'Fetching events for workspace',
        level: 'info',
        data: {
          userId,
        },
      });

      // Get events collection reference
      const eventsRef = db
        .collection('workspaces')
        .doc(userId)
        .collection('events');

      // Order by event date (upcoming events first, then past events in descending order)
      const snapshot = await eventsRef.orderBy('eventDate', 'asc').get();

      if (snapshot.empty) {
        Sentry.addBreadcrumb({
          category: 'event.fetch',
          message: 'No events found for workspace',
          level: 'info',
          data: {
            userId,
          },
        });
        return [];
      }

      // Convert all documents to Event objects with full conversion
      const events: Event[] = snapshot.docs.map((doc) => {
        const data = doc.data() as EventDocument;

        // Calculate spent percentage
        const spentPercentage =
          data.totalBudgetedAmount > 0
            ? Math.round(
                (data.totalSpentAmount / data.totalBudgetedAmount) * 100,
              )
            : 0;

        return {
          id: doc.id,
          name: data.name,
          type: data.type as EventType,
          description: data.description,
          eventDate: data.eventDate.toDate(),
          totalBudgetedAmount: data.totalBudgetedAmount,
          totalScheduledAmount: data.totalScheduledAmount,
          totalSpentAmount: data.totalSpentAmount,
          spentPercentage,
          status: data.status as EventStatus,
          currency: (data.currency || 'AUD') as unknown as Currency,
          _createdDate: data._createdDate.toDate(),
          _createdBy: data._createdBy,
          _updatedDate: data._updatedDate.toDate(),
          _updatedBy: data._updatedBy,
        };
      });

      // Add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'event.fetch',
        message: 'Events fetched successfully',
        level: 'info',
        data: {
          userId,
          eventCount: events.length,
        },
      });

      return events;
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          action: 'fetchEvents',
          userId,
        },
      });
      throw new Error(
        `Failed to fetch events: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
