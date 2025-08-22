'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

export interface DeleteExpenseDto {
  userId: string;
  eventId: string;
  expenseId: string;
}

/**
 * Server action to delete an expense from Firestore
 * Expense is deleted from: /workspaces/{userId}/events/{eventId}/expenses/{expenseId}
 * Also updates the category's spentAmount to subtract the deleted expense amount
 * Wrapped with Sentry monitoring
 */
export const deleteExpense = withSentryServerAction(
  'deleteExpense',
  async (deleteExpenseDto: DeleteExpenseDto): Promise<void> => {
    if (!deleteExpenseDto.userId) throw new Error('User ID is required');
    if (!deleteExpenseDto.eventId) throw new Error('Event ID is required');
    if (!deleteExpenseDto.expenseId) throw new Error('Expense ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: deleteExpenseDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'expense.delete',
        message: 'Starting expense deletion',
        level: 'debug',
        data: {
          userId: deleteExpenseDto.userId,
          eventId: deleteExpenseDto.eventId,
          expenseId: deleteExpenseDto.expenseId,
        },
      });

      // Get expense document reference
      const expenseRef = db
        .collection('workspaces')
        .doc(deleteExpenseDto.userId)
        .collection('events')
        .doc(deleteExpenseDto.eventId)
        .collection('expenses')
        .doc(deleteExpenseDto.expenseId);

      // Verify expense exists and get its data
      const expenseDoc = await expenseRef.get();
      if (!expenseDoc.exists) {
        throw new Error('Expense not found. Please ensure the expense exists.');
      }

      const expenseData = expenseDoc.data();
      const expenseAmount = expenseData?.amount || 0;
      const categoryId = expenseData?.category?.id;

      // Start a batch write to delete expense and update category
      const batch = db.batch();

      // Delete the expense
      batch.delete(expenseRef);

      // Update category spent amount (subtract the deleted expense amount)
      if (categoryId && expenseAmount > 0) {
        const categoryRef = db
          .collection('workspaces')
          .doc(deleteExpenseDto.userId)
          .collection('events')
          .doc(deleteExpenseDto.eventId)
          .collection('categories')
          .doc(categoryId);

        const categoryDoc = await categoryRef.get();
        if (categoryDoc.exists) {
          const categoryData = categoryDoc.data();
          const currentSpentAmount = categoryData?.spentAmount || 0;
          const newSpentAmount = Math.max(0, currentSpentAmount - expenseAmount);

          batch.update(categoryRef, {
            spentAmount: newSpentAmount,
            _updatedDate: Timestamp.now(),
            _updatedBy: deleteExpenseDto.userId,
          });
        }
      }

      // Commit the batch
      await batch.commit();

      // Add breadcrumb for successful deletion
      Sentry.addBreadcrumb({
        category: 'expense.delete',
        message: 'Expense deleted successfully',
        level: 'info',
        data: {
          userId: deleteExpenseDto.userId,
          eventId: deleteExpenseDto.eventId,
          expenseId: deleteExpenseDto.expenseId,
          deletedAmount: expenseAmount,
          categoryId: categoryId,
        },
      });
    } catch (error) {
      console.error('Error deleting expense:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'deleteExpense',
          userId: deleteExpenseDto.userId,
          eventId: deleteExpenseDto.eventId,
          expenseId: deleteExpenseDto.expenseId,
        },
        extra: {
          userInput: deleteExpenseDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to delete expense: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);