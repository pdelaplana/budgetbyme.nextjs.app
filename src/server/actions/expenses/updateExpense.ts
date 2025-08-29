'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

export interface UpdateExpenseDto {
  userId: string;
  eventId: string;
  expenseId: string;
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  vendor?: {
    name?: string;
    address?: string;
    website?: string;
    email?: string;
  };
  date?: Date;
  notes?: string;
  tags?: string[];
  attachments?: string[];
}

/**
 * Server action to update an expense in Firestore
 * Expenses are updated at: /workspaces/{userId}/events/{eventId}/expenses/{expenseId}
 * Also updates category spent amounts if amount or category changes
 * Wrapped with Sentry monitoring
 */
export const updateExpense = withSentryServerAction(
  'updateExpense',
  async (updateExpenseDto: UpdateExpenseDto): Promise<string> => {
    if (!updateExpenseDto.userId) throw new Error('User ID is required');
    if (!updateExpenseDto.eventId) throw new Error('Event ID is required');
    if (!updateExpenseDto.expenseId) throw new Error('Expense ID is required');

    // Validate that at least one field is being updated
    const hasUpdates = Object.keys(updateExpenseDto).some(
      (key) =>
        key !== 'userId' &&
        key !== 'eventId' &&
        key !== 'expenseId' &&
        updateExpenseDto[key as keyof UpdateExpenseDto] !== undefined,
    );

    if (!hasUpdates) {
      throw new Error('At least one field must be provided for update');
    }

    // Validate amount if provided
    if (updateExpenseDto.amount !== undefined && updateExpenseDto.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    try {
      // Set user context for debugging
      Sentry.setUser({ id: updateExpenseDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'expense.update',
        message: 'Starting expense update',
        level: 'debug',
        data: {
          userId: updateExpenseDto.userId,
          eventId: updateExpenseDto.eventId,
          expenseId: updateExpenseDto.expenseId,
        },
      });

      // Get expense document reference
      const expenseRef = db
        .collection('workspaces')
        .doc(updateExpenseDto.userId)
        .collection('events')
        .doc(updateExpenseDto.eventId)
        .collection('expenses')
        .doc(updateExpenseDto.expenseId);

      // Verify expense exists and get current data
      const expenseDoc = await expenseRef.get();
      if (!expenseDoc.exists) {
        throw new Error('Expense not found. Please ensure the expense exists.');
      }

      const currentExpenseData = expenseDoc.data();
      const currentAmount = currentExpenseData?.amount || 0;
      const currentCategoryId = currentExpenseData?.category?.id;

      // Prepare update data
      const updateData: Record<string, any> = {
        _updatedDate: Timestamp.now(),
        _updatedBy: updateExpenseDto.userId,
      };

      if (updateExpenseDto.name !== undefined) {
        if (!updateExpenseDto.name.trim()) {
          throw new Error('Expense name cannot be empty');
        }
        updateData.name = updateExpenseDto.name.trim();
      }

      if (updateExpenseDto.description !== undefined) {
        updateData.description = updateExpenseDto.description?.trim() || '';
      }

      if (updateExpenseDto.amount !== undefined) {
        updateData.amount = updateExpenseDto.amount;
      }

      if (updateExpenseDto.currency !== undefined) {
        if (!updateExpenseDto.currency.trim()) {
          throw new Error('Currency cannot be empty');
        }
        updateData.currency = updateExpenseDto.currency.trim();
      }

      if (updateExpenseDto.categoryId !== undefined) {
        if (!updateExpenseDto.categoryId.trim()) {
          throw new Error('Category cannot be empty');
        }
        updateData.category = {
          id: updateExpenseDto.categoryId,
          name:
            updateExpenseDto.categoryName ||
            currentExpenseData?.category?.name ||
            '',
          color:
            updateExpenseDto.categoryColor ||
            currentExpenseData?.category?.color ||
            '',
          icon:
            updateExpenseDto.categoryIcon ||
            currentExpenseData?.category?.icon ||
            '🎉',
        };
      }

      if (updateExpenseDto.vendor !== undefined) {
        updateData.vendor = {
          name:
            updateExpenseDto.vendor.name?.trim() ||
            currentExpenseData?.vendor?.name ||
            '',
          address:
            updateExpenseDto.vendor.address?.trim() ||
            currentExpenseData?.vendor?.address ||
            '',
          website:
            updateExpenseDto.vendor.website?.trim() ||
            currentExpenseData?.vendor?.website ||
            '',
          email:
            updateExpenseDto.vendor.email?.trim() ||
            currentExpenseData?.vendor?.email ||
            '',
        };
      }

      if (updateExpenseDto.date !== undefined) {
        updateData.date = Timestamp.fromDate(updateExpenseDto.date);
      }

      if (updateExpenseDto.notes !== undefined) {
        updateData.notes = updateExpenseDto.notes?.trim() || '';
      }

      if (updateExpenseDto.tags !== undefined) {
        updateData.tags = updateExpenseDto.tags || [];
      }

      if (updateExpenseDto.attachments !== undefined) {
        updateData.attachments = updateExpenseDto.attachments || [];
      }

      // Determine if we need to update category spent amounts
      const newAmount =
        updateExpenseDto.amount !== undefined
          ? updateExpenseDto.amount
          : currentAmount;
      const newCategoryId =
        updateExpenseDto.categoryId !== undefined
          ? updateExpenseDto.categoryId
          : currentCategoryId;
      const amountChanged =
        updateExpenseDto.amount !== undefined &&
        updateExpenseDto.amount !== currentAmount;
      const categoryChanged =
        updateExpenseDto.categoryId !== undefined &&
        updateExpenseDto.categoryId !== currentCategoryId;

      if (amountChanged || categoryChanged) {
        // Start batch write to update expense and category spent amounts
        const batch = db.batch();

        // Update the expense
        batch.update(expenseRef, updateData);

        // Update old category spent amount (subtract old amount)
        if (currentCategoryId) {
          const oldCategoryRef = db
            .collection('workspaces')
            .doc(updateExpenseDto.userId)
            .collection('events')
            .doc(updateExpenseDto.eventId)
            .collection('categories')
            .doc(currentCategoryId);

          const oldCategoryDoc = await oldCategoryRef.get();
          if (oldCategoryDoc.exists) {
            const oldCategoryData = oldCategoryDoc.data();
            const oldCategoryScheduledAmount =
              oldCategoryData?.scheduledAmount || 0;
            const newOldCategoryScheduledAmount = Math.max(
              0,
              oldCategoryScheduledAmount - currentAmount,
            );

            batch.update(oldCategoryRef, {
              scheduledAmount: newOldCategoryScheduledAmount,
              _updatedDate: Timestamp.now(),
              _updatedBy: updateExpenseDto.userId,
            });
          }
        }

        // Update new category spent amount (add new amount)
        if (newCategoryId) {
          const newCategoryRef = db
            .collection('workspaces')
            .doc(updateExpenseDto.userId)
            .collection('events')
            .doc(updateExpenseDto.eventId)
            .collection('categories')
            .doc(newCategoryId);

          const newCategoryDoc = await newCategoryRef.get();
          if (newCategoryDoc.exists) {
            const newCategoryData = newCategoryDoc.data();
            const newCategoryScheduledAmount =
              newCategoryData?.scheduledAmount || 0;
            const updatedNewCategoryScheduledAmount =
              newCategoryScheduledAmount + newAmount;

            batch.update(newCategoryRef, {
              scheduledAmount: updatedNewCategoryScheduledAmount,
              _updatedDate: Timestamp.now(),
              _updatedBy: updateExpenseDto.userId,
            });
          }
        }

        // Update event totalScheduledAmount
        const amountDifference = newAmount - currentAmount;
        if (amountDifference !== 0) {
          const eventRef = db
            .collection('workspaces')
            .doc(updateExpenseDto.userId)
            .collection('events')
            .doc(updateExpenseDto.eventId);

          const eventDoc = await eventRef.get();
          if (eventDoc.exists) {
            const eventData = eventDoc.data()!;
            const newTotalScheduledAmount =
              (eventData.totalScheduledAmount || 0) + amountDifference;

            batch.update(eventRef, {
              totalScheduledAmount: Math.max(0, newTotalScheduledAmount),
              _updatedDate: Timestamp.now(),
              _updatedBy: updateExpenseDto.userId,
            });
          }
        }

        // Commit the batch
        await batch.commit();
      } else {
        // No category changes, just update the expense
        await expenseRef.update(updateData);
      }

      // Add breadcrumb for successful update
      Sentry.addBreadcrumb({
        category: 'expense.update',
        message: 'Expense updated successfully',
        level: 'info',
        data: {
          userId: updateExpenseDto.userId,
          eventId: updateExpenseDto.eventId,
          expenseId: updateExpenseDto.expenseId,
          updatedFields: Object.keys(updateData).filter(
            (key) => !key.startsWith('_'),
          ),
        },
      });

      return updateExpenseDto.expenseId;
    } catch (error) {
      console.error('Error updating expense:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'updateExpense',
          userId: updateExpenseDto.userId,
          eventId: updateExpenseDto.eventId,
          expenseId: updateExpenseDto.expenseId,
        },
        extra: {
          userInput: updateExpenseDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to update expense: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
