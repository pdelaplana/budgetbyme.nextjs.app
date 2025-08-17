'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import type { Event } from '@/types/Event';
import { eventConverter } from '../../lib/converters/eventConverter';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { EventDocument } from '../../types/EventDocument';

export interface AddEventDto {
  userId: string;
  name: string;
  type: string;
  description?: string;
  eventDate: Date;
  totalBudgetedAmount: number;
  currency: string;
  status?: string;
}

/**
 * Server action to create a new event in Firestore
 * Wrapped with Sentry monitoring
 */
export const addEvent = withSentryServerAction(
  'addEvent',
  async (addEventDto: AddEventDto): Promise<Event> => {
    if (!addEventDto.userId) throw new Error('User ID is required');
    if (!addEventDto.name?.trim()) throw new Error('Event name is required');
    if (!addEventDto.eventDate) throw new Error('Event date is required');
    if (addEventDto.totalBudgetedAmount < 0)
      throw new Error('Budget amount cannot be negative');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: addEventDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'event.create',
        message: 'Starting event creation',
        level: 'debug',
        data: {
          userId: addEventDto.userId,
          eventName: addEventDto.name,
          eventType: addEventDto.type,
        },
      });

      // Verify user workspace exists
      const workspaceRef = db.collection('workspaces').doc(addEventDto.userId);
      const workspaceDoc = await workspaceRef.get();

      if (!workspaceDoc.exists) {
        throw new Error(
          'User workspace not found. Please set up your account first.',
        );
      }

      // Create new event document reference
      const eventsCollectionRef = workspaceRef.collection('events');
      const newEventRef = eventsCollectionRef.doc(); // Auto-generate ID

      // Prepare event data
      const now = Timestamp.now();
      const newEventDocument: Partial<EventDocument> = {
        name: addEventDto.name.trim(),
        type: addEventDto.type,
        description: addEventDto.description?.trim(),
        eventDate: Timestamp.fromDate(addEventDto.eventDate),
        totalBudgetedAmount: addEventDto.totalBudgetedAmount,
        totalSpentAmount: 0, // Start with zero spent
        status: addEventDto.status, // Default status
        currency: addEventDto.currency,
        _createdDate: now,
        _createdBy: addEventDto.userId,
        _updatedDate: now,
        _updatedBy: addEventDto.userId,
      };

      // Save to Firestore
      await newEventRef.set(newEventDocument);

      // Add breadcrumb for successful event creation
      Sentry.addBreadcrumb({
        category: 'event.create',
        message: 'Event created successfully',
        level: 'info',
        data: {
          userId: addEventDto.userId,
          eventId: newEventRef.id,
          eventName: addEventDto.name,
        },
      });

      // Return the created event
      const createdEvent = eventConverter.fromFirestore(
        newEventRef.id,
        newEventDocument as EventDocument,
      );

      return createdEvent;
    } catch (error) {
      console.error('Error creating event:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'addEvent',
          userId: addEventDto.userId,
        },
        extra: {
          userInput: addEventDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to create event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
