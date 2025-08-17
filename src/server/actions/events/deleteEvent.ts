'use server';

import * as Sentry from '@sentry/nextjs';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

export interface DeleteEventDto {
  userId: string;
  eventId: string;
}

export interface DeleteEventResult {
  success: boolean;
  eventId: string;
  message: string;
}

/**
 * Server action to delete an event from Firestore
 * Wrapped with Sentry monitoring
 */
export const deleteEvent = withSentryServerAction(
  'deleteEvent',
  async (deleteEventDto: DeleteEventDto): Promise<DeleteEventResult> => {
    if (!deleteEventDto.userId) throw new Error('User ID is required');
    if (!deleteEventDto.eventId) throw new Error('Event ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: deleteEventDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'event.delete',
        message: 'Starting event deletion',
        level: 'debug',
        data: {
          userId: deleteEventDto.userId,
          eventId: deleteEventDto.eventId,
        },
      });

      // Get event reference
      const eventRef = db
        .collection('workspaces')
        .doc(deleteEventDto.userId)
        .collection('events')
        .doc(deleteEventDto.eventId);

      // Check if event exists and user owns it
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        throw new Error(
          'Event not found or you do not have permission to delete it',
        );
      }

      // Check for and delete any subcollections if they exist
      // Note: In a more complex app, you might have categories, expenses, etc.
      // For now, we'll add a placeholder for future subcollection cleanup
      try {
        // Example: Delete related expenses subcollection
        const expensesSnapshot = await eventRef.collection('expenses').get();
        if (!expensesSnapshot.empty) {
          const batch = db.batch();
          expensesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();

          Sentry.addBreadcrumb({
            category: 'event.delete',
            message: `Deleted ${expensesSnapshot.size} related expenses`,
            level: 'info',
          });
        }
      } catch (subcollectionError) {
        // Log but don't fail the main deletion
        console.warn('Could not clean up subcollections:', subcollectionError);
        Sentry.addBreadcrumb({
          category: 'event.delete',
          message: 'Warning: Could not clean up all subcollections',
          level: 'warning',
          data: {
            error:
              subcollectionError instanceof Error
                ? subcollectionError.message
                : 'Unknown error',
          },
        });
      }

      // Get event data for logging before deletion
      const eventData = eventDoc.data();
      const eventName = eventData?.name || 'Unknown Event';

      // Delete the event document
      await eventRef.delete();

      // Add breadcrumb for successful event deletion
      Sentry.addBreadcrumb({
        category: 'event.delete',
        message: 'Event deleted successfully',
        level: 'info',
        data: {
          userId: deleteEventDto.userId,
          eventId: deleteEventDto.eventId,
          eventName: eventName,
        },
      });

      return {
        success: true,
        eventId: deleteEventDto.eventId,
        message: `Event "${eventName}" has been successfully deleted`,
      };
    } catch (error) {
      console.error('Error deleting event:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'deleteEvent',
          userId: deleteEventDto.userId,
          eventId: deleteEventDto.eventId,
        },
        extra: {
          userInput: deleteEventDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to delete event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
