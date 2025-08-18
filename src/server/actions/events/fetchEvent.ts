'use server';

import * as Sentry from '@sentry/nextjs';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { EventDocument } from '../../types/EventDocument';

/**
 * Server action to fetch a single event by ID from Firestore
 * Wrapped with Sentry monitoring
 */
export const fetchEvent = withSentryServerAction(
  'fetchEvent',
  async (
    userId: string,
    eventId: string,
  ): Promise<{ id: string; document: EventDocument }> => {
    if (!userId) throw new Error('User ID is required');
    if (!eventId) throw new Error('Event ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: userId });

      // Add breadcrumb for tracking action flow
      Sentry.addBreadcrumb({
        category: 'event.fetch',
        message: 'Fetching single event',
        level: 'info',
        data: {
          userId,
          eventId,
        },
      });

      // Get event document reference
      const eventRef = db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .doc(eventId);

      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        Sentry.addBreadcrumb({
          category: 'event.fetch',
          message: 'Event not found',
          level: 'info',
          data: {
            userId,
            eventId,
          },
        });
        throw new Error('Event not found');
      }

      // Add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'event.fetch',
        message: 'Event fetched successfully',
        level: 'info',
        data: {
          userId,
          eventId,
        },
      });

      return {
        id: eventDoc.id,
        document: eventDoc.data() as EventDocument,
      };
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          action: 'fetchEvent',
          userId,
          eventId,
        },
      });
      throw new Error(
        `Failed to fetch event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
