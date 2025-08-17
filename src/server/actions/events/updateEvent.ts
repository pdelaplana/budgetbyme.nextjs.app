'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import type { Event } from '@/types/Event';
import { eventConverter } from '../../lib/converters/eventConverter';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { EventDocument } from '../../types/EventDocument';

export interface UpdateEventDto {
  userId: string;
  eventId: string;
  name?: string;
  type?: string;
  description?: string;
  eventDate?: Date;
  totalBudgetedAmount?: number;
  totalSpentAmount?: number;
  currency?: string;
  status?: string;
}

/**
 * Server action to update an existing event in Firestore
 * Wrapped with Sentry monitoring
 */
export const updateEvent = withSentryServerAction(
  'updateEvent',
  async (updateEventDto: UpdateEventDto): Promise<Event> => {
    if (!updateEventDto.userId) throw new Error('User ID is required');
    if (!updateEventDto.eventId) throw new Error('Event ID is required');

    // Validate budget amounts if provided
    if (
      updateEventDto.totalBudgetedAmount !== undefined &&
      updateEventDto.totalBudgetedAmount < 0
    ) {
      throw new Error('Budget amount cannot be negative');
    }
    if (
      updateEventDto.totalSpentAmount !== undefined &&
      updateEventDto.totalSpentAmount < 0
    ) {
      throw new Error('Spent amount cannot be negative');
    }

    try {
      // Set user context for debugging
      Sentry.setUser({ id: updateEventDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'event.update',
        message: 'Starting event update',
        level: 'debug',
        data: {
          userId: updateEventDto.userId,
          eventId: updateEventDto.eventId,
          updateFields: Object.keys(updateEventDto).filter(
            (key) =>
              key !== 'userId' &&
              key !== 'eventId' &&
              updateEventDto[key as keyof UpdateEventDto] !== undefined,
          ),
        },
      });

      // Get event reference
      const eventRef = db
        .collection('workspaces')
        .doc(updateEventDto.userId)
        .collection('events')
        .doc(updateEventDto.eventId);

      // Check if event exists and user owns it
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        throw new Error('Event not found');
      }

      // Prepare update data (only include fields that are provided)
      const eventDocData = eventDoc.data() as EventDocument;
      const updatedEventDocument: Partial<EventDocument> = {
        ...eventDocData, // Keep existing values and override with provided updates
        name: updateEventDto.name?.trim() ?? eventDocData.name,
        type: updateEventDto.type ?? eventDocData.type,
        description:
          updateEventDto.description !== undefined
            ? updateEventDto.description?.trim()
            : eventDocData.description,
        eventDate: updateEventDto.eventDate
          ? Timestamp.fromDate(updateEventDto.eventDate)
          : eventDocData.eventDate,
        totalBudgetedAmount:
          updateEventDto.totalBudgetedAmount ??
          eventDocData.totalBudgetedAmount,
        totalSpentAmount:
          updateEventDto.totalSpentAmount ?? eventDocData.totalSpentAmount,
        currency: updateEventDto.currency ?? eventDocData.currency,
        status: updateEventDto.status ?? eventDocData.status,
        // Update modification info
        _updatedDate: Timestamp.now(),
        _updatedBy: updateEventDto.userId,
      };

      // Update in Firestore
      await eventRef.update({ ...updatedEventDocument });

      // Add breadcrumb for successful event update
      Sentry.addBreadcrumb({
        category: 'event.update',
        message: 'Event updated successfully',
        level: 'info',
        data: {
          userId: updateEventDto.userId,
          eventId: updateEventDto.eventId,
          updatedFields: Object.keys(updateEventDto).filter(
            (key) =>
              key !== 'userId' &&
              key !== 'eventId' &&
              updateEventDto[key as keyof UpdateEventDto] !== undefined,
          ),
        },
      });

      // Return the updated event
      const updatedEvent = eventConverter.fromFirestore(
        eventRef.id,
        updatedEventDocument as EventDocument,
      );

      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'updateEvent',
          userId: updateEventDto.userId,
          eventId: updateEventDto.eventId,
        },
        extra: {
          userInput: updateEventDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to update event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
