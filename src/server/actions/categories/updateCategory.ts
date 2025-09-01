'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { BudgetCategoryDocument } from '../../types/BudgetCategoryDocument';

export interface UpdateCategoryDto {
  userId: string;
  eventId: string;
  categoryId: string;
  name?: string;
  description?: string;
  budgetedAmount?: number;
  color?: string;
  icon?: string;
}

/**
 * Server action to update a budget category in Firestore
 * Categories are updated at: /workspaces/{userId}/events/{eventId}/categories/{categoryId}
 * Wrapped with Sentry monitoring
 */
export const updateCategory = withSentryServerAction(
  'updateCategory',
  async (updateCategoryDto: UpdateCategoryDto): Promise<string> => {
    if (!updateCategoryDto.userId) throw new Error('User ID is required');
    if (!updateCategoryDto.eventId) throw new Error('Event ID is required');
    if (!updateCategoryDto.categoryId)
      throw new Error('Category ID is required');

    // Validate that at least one field is being updated
    const hasUpdates =
      updateCategoryDto.name !== undefined ||
      updateCategoryDto.description !== undefined ||
      updateCategoryDto.budgetedAmount !== undefined ||
      updateCategoryDto.color !== undefined ||
      updateCategoryDto.icon !== undefined;

    if (!hasUpdates) {
      throw new Error('At least one field must be provided for update');
    }

    // Validate budget amount if provided
    if (
      updateCategoryDto.budgetedAmount !== undefined &&
      updateCategoryDto.budgetedAmount < 0
    ) {
      throw new Error('Budget amount cannot be negative');
    }

    try {
      // Set user context for debugging
      Sentry.setUser({ id: updateCategoryDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'category.update',
        message: 'Starting category update',
        level: 'debug',
        data: {
          userId: updateCategoryDto.userId,
          eventId: updateCategoryDto.eventId,
          categoryId: updateCategoryDto.categoryId,
        },
      });

      // Get category document reference
      const categoryRef = db
        .collection('workspaces')
        .doc(updateCategoryDto.userId)
        .collection('events')
        .doc(updateCategoryDto.eventId)
        .collection('categories')
        .doc(updateCategoryDto.categoryId);

      // Verify category exists
      const categoryDoc = await categoryRef.get();
      if (!categoryDoc.exists) {
        throw new Error(
          'Category not found. Please ensure the category exists.',
        );
      }

      // Prepare update data
      const updateData: Partial<BudgetCategoryDocument> = {
        _updatedDate: Timestamp.now(),
        _updatedBy: updateCategoryDto.userId,
      };

      if (updateCategoryDto.name !== undefined) {
        if (!updateCategoryDto.name.trim()) {
          throw new Error('Category name cannot be empty');
        }
        updateData.name = updateCategoryDto.name.trim();
      }

      if (updateCategoryDto.description !== undefined) {
        updateData.description = updateCategoryDto.description?.trim() || '';
      }

      if (updateCategoryDto.budgetedAmount !== undefined) {
        updateData.budgetedAmount = updateCategoryDto.budgetedAmount;
      }

      if (updateCategoryDto.color !== undefined) {
        if (!updateCategoryDto.color.trim()) {
          throw new Error('Category color cannot be empty');
        }
        updateData.color = updateCategoryDto.color.trim();
      }

      if (updateCategoryDto.icon !== undefined) {
        if (!updateCategoryDto.icon.trim()) {
          throw new Error('Category icon cannot be empty');
        }
        updateData.icon = updateCategoryDto.icon.trim();
      }

      // Update category in Firestore
      await categoryRef.update(updateData);

      // Add breadcrumb for successful update
      Sentry.addBreadcrumb({
        category: 'category.update',
        message: 'Category updated successfully',
        level: 'info',
        data: {
          userId: updateCategoryDto.userId,
          eventId: updateCategoryDto.eventId,
          categoryId: updateCategoryDto.categoryId,
          updatedFields: Object.keys(updateData).filter(
            (key) => !key.startsWith('_'),
          ),
        },
      });

      return updateCategoryDto.categoryId;
    } catch (error) {
      console.error('Error updating category:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'updateCategory',
          userId: updateCategoryDto.userId,
          eventId: updateCategoryDto.eventId,
          categoryId: updateCategoryDto.categoryId,
        },
        extra: {
          userInput: updateCategoryDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to update category: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
