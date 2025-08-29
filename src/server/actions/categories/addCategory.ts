'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { BudgetCategoryDocument } from '../../types/BudgetCategoryDocument';

export interface AddCategoryDto {
  userId: string;
  eventId: string;
  name: string;
  description?: string;
  budgetedAmount: number;
  color: string;
  icon: string;
}

/**
 * Server action to create a new budget category in Firestore
 * Categories are stored under the event: /workspaces/{userId}/events/{eventId}/categories/{categoryId}
 * Wrapped with Sentry monitoring
 */
export const addCategory = withSentryServerAction(
  'addCategory',
  async (addCategoryDto: AddCategoryDto): Promise<string> => {
    if (!addCategoryDto.userId) throw new Error('User ID is required');
    if (!addCategoryDto.eventId) throw new Error('Event ID is required');
    if (!addCategoryDto.name?.trim())
      throw new Error('Category name is required');
    if (addCategoryDto.budgetedAmount < 0)
      throw new Error('Budget amount cannot be negative');
    if (!addCategoryDto.color?.trim())
      throw new Error('Category color is required');
    if (!addCategoryDto.icon?.trim())
      throw new Error('Category icon is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: addCategoryDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'category.create',
        message: 'Starting category creation',
        level: 'debug',
        data: {
          userId: addCategoryDto.userId,
          eventId: addCategoryDto.eventId,
          categoryName: addCategoryDto.name,
        },
      });

      // Verify event exists
      const eventRef = db
        .collection('workspaces')
        .doc(addCategoryDto.userId)
        .collection('events')
        .doc(addCategoryDto.eventId);

      const eventDoc = await eventRef.get();
      if (!eventDoc.exists) {
        throw new Error('Event not found. Please ensure the event exists.');
      }

      // Create new category document reference
      const categoriesCollectionRef = eventRef.collection('categories');
      const newCategoryRef = categoriesCollectionRef.doc(); // Auto-generate ID

      // Prepare category data
      const now = Timestamp.now();
      const newCategoryDocument: Partial<BudgetCategoryDocument> = {
        name: addCategoryDto.name.trim(),
        description: addCategoryDto.description?.trim() || '',
        budgetedAmount: addCategoryDto.budgetedAmount,
        scheduledAmount: 0, // Start with zero scheduled
        spentAmount: 0, // Start with zero spent
        color: addCategoryDto.color.trim(),
        icon: addCategoryDto.icon.trim(),
        _createdDate: now,
        _createdBy: addCategoryDto.userId,
        _updatedDate: now,
        _updatedBy: addCategoryDto.userId,
      };

      // Save to Firestore
      await newCategoryRef.set(newCategoryDocument);

      // Add breadcrumb for successful category creation
      Sentry.addBreadcrumb({
        category: 'category.create',
        message: 'Category created successfully',
        level: 'info',
        data: {
          userId: addCategoryDto.userId,
          eventId: addCategoryDto.eventId,
          categoryId: newCategoryRef.id,
          categoryName: addCategoryDto.name,
        },
      });

      return newCategoryRef.id;
    } catch (error) {
      console.error('Error creating category:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'addCategory',
          userId: addCategoryDto.userId,
          eventId: addCategoryDto.eventId,
        },
        extra: {
          userInput: addCategoryDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to create category: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
