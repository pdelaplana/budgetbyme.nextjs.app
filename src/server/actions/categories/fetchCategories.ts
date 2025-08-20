'use server';

import * as Sentry from '@sentry/nextjs';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { BudgetCategory } from '../../../types/BudgetCategory';
import type { BudgetCategoryDocument } from '../../types/BudgetCategoryDocument';

/**
 * Server action to fetch all budget categories for an event
 * Categories are retrieved from: /workspaces/{userId}/events/{eventId}/categories
 * Wrapped with Sentry monitoring
 */
export const fetchCategories = withSentryServerAction(
  'fetchCategories',
  async (userId: string, eventId: string): Promise<BudgetCategory[]> => {
    if (!userId) throw new Error('User ID is required');
    if (!eventId) throw new Error('Event ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'category.fetch',
        message: 'Starting categories fetch',
        level: 'debug',
        data: {
          userId,
          eventId,
        },
      });

      // Verify event exists
      const eventRef = db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .doc(eventId);

      const eventDoc = await eventRef.get();
      if (!eventDoc.exists) {
        throw new Error('Event not found. Please ensure the event exists.');
      }

      // Fetch all categories for the event
      const categoriesSnapshot = await eventRef
        .collection('categories')
        .orderBy('_createdDate', 'asc')
        .get();

      if (categoriesSnapshot.empty) {
        Sentry.addBreadcrumb({
          category: 'category.fetch',
          message: 'No categories found for event',
          level: 'info',
          data: {
            userId,
            eventId,
          },
        });
        return [];
      }

      // Convert all documents to BudgetCategory objects
      const categories: BudgetCategory[] = categoriesSnapshot.docs.map((doc) => {
        const data = doc.data() as BudgetCategoryDocument;

        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          budgetedAmount: data.budgetedAmount,
          spentAmount: data.spentAmount,
          color: data.color,
          icon: data.icon || '🎉', // Default icon for existing categories
          _createdDate: data._createdDate.toDate(),
          _createdBy: data._createdBy,
          _updatedDate: data._updatedDate.toDate(),
          _updatedBy: data._updatedBy,
        };
      });

      // Add breadcrumb for successful fetch
      Sentry.addBreadcrumb({
        category: 'category.fetch',
        message: 'Categories fetched successfully',
        level: 'info',
        data: {
          userId,
          eventId,
          categoriesCount: categories.length,
        },
      });

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'fetchCategories',
          userId,
          eventId,
        },
        extra: {
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to fetch categories: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);