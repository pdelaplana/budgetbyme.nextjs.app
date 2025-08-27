'use server';

import * as Sentry from '@sentry/nextjs';
import type { Currency } from '@/types/currencies';
import type { Event, EventStatus, EventType } from '@/types/Event';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { EventDocument } from '../../types/EventDocument';

/**
 * Server action to fetch a single event by ID from Firestore
 * Wrapped with Sentry monitoring
 */
export const fetchEvent = withSentryServerAction(
  'fetchEvent',
  async (userId: string, eventId: string): Promise<Event> => {
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

      const data = eventDoc.data() as EventDocument;

      // Calculate spent percentage
      const spentPercentage =
        data.totalBudgetedAmount > 0
          ? Math.round((data.totalSpentAmount / data.totalBudgetedAmount) * 100)
          : 0;

      return {
        id: eventDoc.id,
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
