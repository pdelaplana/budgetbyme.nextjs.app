'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { getCategoryTemplateById } from '@/lib/categoryTemplates';
import type { Event } from '@/types/Event';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import { eventFromFirestore } from '../../types/converters';
import type { EventDocument } from '../../types/EventDocument';

export interface AddEventDto {
  userId: string;
  name: string;
  type: string;
  description?: string;
  eventDate: string | Date; // Accept both string and Date for flexibility
  totalBudgetedAmount: number;
  currency: string;
  status?: string;
  selectedCategoryTemplates?: string[]; // Optional category template IDs
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
        eventDate: Timestamp.fromDate(
          typeof addEventDto.eventDate === 'string'
            ? new Date(addEventDto.eventDate)
            : addEventDto.eventDate,
        ),
        totalBudgetedAmount: addEventDto.totalBudgetedAmount,
        totalScheduledAmount: 0, // Start with zero scheduled
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

      // Create selected categories if provided
      if (
        addEventDto.selectedCategoryTemplates &&
        addEventDto.selectedCategoryTemplates.length > 0
      ) {
        // Use batch write for atomic operation
        const batch = db.batch();
        const categoriesCollectionRef = newEventRef.collection('categories');

        for (const templateId of addEventDto.selectedCategoryTemplates) {
          const template = getCategoryTemplateById(templateId);

          if (template) {
            const categoryRef = categoriesCollectionRef.doc(); // Auto-generate ID
            const categoryData = {
              name: template.name,
              description: template.description,
              icon: template.icon,
              color: template.color,
              budgetedAmount: 0, // Start with $0 as specified
              scheduledAmount: 0,
              spentAmount: 0,
              _createdDate: now,
              _createdBy: addEventDto.userId,
              _updatedDate: now,
              _updatedBy: addEventDto.userId,
            };

            batch.set(categoryRef, categoryData);
          }
        }

        // Commit all category creates atomically
        await batch.commit();

        // Add breadcrumb for category creation
        Sentry.addBreadcrumb({
          category: 'event.create',
          message: 'Categories created from templates',
          level: 'info',
          data: {
            userId: addEventDto.userId,
            eventId: newEventRef.id,
            categoryCount: addEventDto.selectedCategoryTemplates.length,
          },
        });
      }

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

      // Fetch the created event and convert to Event type
      const createdEventDoc = await newEventRef.get();
      if (!createdEventDoc.exists) {
        throw new Error('Failed to retrieve created event');
      }

      const eventData = createdEventDoc.data() as EventDocument;
      return eventFromFirestore(createdEventDoc.id, eventData);
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
