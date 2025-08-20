'use server';

import * as Sentry from '@sentry/nextjs';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

/**
 * Server action to delete a budget category from Firestore
 * Categories are deleted from: /workspaces/{userId}/events/{eventId}/categories/{categoryId}
 * Wrapped with Sentry monitoring
 * 
 * Note: This performs a hard delete. Consider implementing soft delete in the future
 * if category recovery or audit trail is needed.
 */
export const deleteCategory = withSentryServerAction(
  'deleteCategory',
  async (userId: string, eventId: string, categoryId: string): Promise<void> => {
    if (!userId) throw new Error('User ID is required');
    if (!eventId) throw new Error('Event ID is required');
    if (!categoryId) throw new Error('Category ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'category.delete',
        message: 'Starting category deletion',
        level: 'debug',
        data: {
          userId,
          eventId,
          categoryId,
        },
      });

      // Get category document reference
      const categoryRef = db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .doc(eventId)
        .collection('categories')
        .doc(categoryId);

      // Verify category exists
      const categoryDoc = await categoryRef.get();
      if (!categoryDoc.exists) {
        throw new Error('Category not found. It may have already been deleted.');
      }

      // Get category data for logging
      const categoryData = categoryDoc.data();

      // Check if category is used by any expenses
      const expensesRef = db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .doc(eventId)
        .collection('expenses');

      const expensesWithCategory = await expensesRef
        .where('category.id', '==', categoryId)
        .limit(1)
        .get();

      if (!expensesWithCategory.empty) {
        throw new Error('Cannot delete category because it is used by existing expenses. Please reassign or delete the expenses first.');
      }

      // Delete the category
      await categoryRef.delete();

      // Add breadcrumb for successful deletion
      Sentry.addBreadcrumb({
        category: 'category.delete',
        message: 'Category deleted successfully',
        level: 'info',
        data: {
          userId,
          eventId,
          categoryId,
          categoryName: categoryData?.name || 'Unknown',
        },
      });

    } catch (error) {
      console.error('Error deleting category:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'deleteCategory',
          userId,
          eventId,
          categoryId,
        },
        extra: {
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to delete category: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);