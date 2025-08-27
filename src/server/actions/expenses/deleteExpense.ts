'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import { deleteExpenseAttachment } from './deleteExpenseAttachment';
import { subtractFromEventTotals } from '../../lib/eventAggregation';

export interface DeleteExpenseDto {
  userId: string;
  eventId: string;
  expenseId: string;
}

/**
 * Server action to delete an expense from Firestore
 * Expense is deleted from: /workspaces/{userId}/events/{eventId}/expenses/{expenseId}
 * Also deletes all associated attachments from Firebase Storage
 * Also updates category amounts (scheduledAmount, spentAmount) and event totals atomically
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
      const attachments = expenseData?.attachments || [];

      // Calculate how much was actually spent (paid) for this expense
      let totalSpentAmount = 0;
      
      if (expenseData?.hasPaymentSchedule && expenseData?.paymentSchedule && expenseData.paymentSchedule.length > 0) {
        // Calculate from payment schedule - sum all paid payments
        totalSpentAmount = expenseData.paymentSchedule
          .filter((payment: any) => payment.isPaid)
          .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
      } else if (expenseData?.oneOffPayment) {
        // Calculate from single payment - use amount if paid
        totalSpentAmount = expenseData.oneOffPayment.isPaid ? (expenseData.oneOffPayment.amount || 0) : 0;
      }
      // If no payment schedule and no oneOffPayment, totalSpentAmount remains 0

      // Delete all attachments from Firebase Storage before deleting the expense
      if (attachments && attachments.length > 0) {
        Sentry.addBreadcrumb({
          category: 'expense.delete',
          message: `Deleting ${attachments.length} attachments`,
          level: 'info',
          data: {
            attachmentCount: attachments.length,
          },
        });

        // Delete attachments in parallel for better performance
        const attachmentDeletions = attachments.map(async (attachmentUrl: string) => {
          try {
            await deleteExpenseAttachment(deleteExpenseDto.userId, attachmentUrl);
          } catch (error) {
            console.warn(`Failed to delete attachment ${attachmentUrl}:`, error);
            // Don't throw here - we want to continue with expense deletion even if some attachments fail
          }
        });

        // Wait for all attachment deletions to complete
        await Promise.allSettled(attachmentDeletions);
      }

      // Start a batch write to delete expense and update category
      const batch = db.batch();

      // Delete the expense
      batch.delete(expenseRef);

      // Update category amounts (subtract both scheduled and spent amounts)
      if (categoryId && (expenseAmount > 0 || totalSpentAmount > 0)) {
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
          const currentScheduledAmount = categoryData?.scheduledAmount || 0;
          const currentSpentAmount = categoryData?.spentAmount || 0;
          
          const newScheduledAmount = Math.max(0, currentScheduledAmount - expenseAmount);
          const newSpentAmount = Math.max(0, currentSpentAmount - totalSpentAmount);

          batch.update(categoryRef, {
            scheduledAmount: newScheduledAmount,
            spentAmount: newSpentAmount,
            _updatedDate: Timestamp.now(),
            _updatedBy: deleteExpenseDto.userId,
          });
        }
      }

      // Update event totals (subtract scheduled and spent amounts)
      if (expenseAmount > 0 || totalSpentAmount > 0) {
        const eventRef = db
          .collection('workspaces')
          .doc(deleteExpenseDto.userId)
          .collection('events')
          .doc(deleteExpenseDto.eventId);

        const eventDoc = await eventRef.get();
        if (eventDoc.exists) {
          const eventData = eventDoc.data()!;
          
          const newEventScheduledAmount = Math.max(0, (eventData.totalScheduledAmount || 0) - expenseAmount);
          const newEventSpentAmount = Math.max(0, (eventData.totalSpentAmount || 0) - totalSpentAmount);

          batch.update(eventRef, {
            totalScheduledAmount: newEventScheduledAmount,
            totalSpentAmount: newEventSpentAmount,
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
          deletedScheduledAmount: expenseAmount,
          deletedSpentAmount: totalSpentAmount,
          categoryId: categoryId,
          deletedAttachmentsCount: attachments?.length || 0,
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