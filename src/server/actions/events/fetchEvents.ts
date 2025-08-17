'use server';

import * as Sentry from '@sentry/nextjs';
import type { Event } from '@/types/Event';
import { eventConverter } from '../../lib/converters/eventConverter';
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

      // Convert all documents from Firestore format to Event
      const events = snapshot.docs.map((doc) => {
        return eventConverter.fromFirestore(
          doc.id,
          doc.data() as EventDocument,
        );
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
