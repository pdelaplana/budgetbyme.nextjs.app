'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import {
  getCategoryIdFromExpense,
  subtractFromCategorySpentAmount,
} from '@/server/lib/categoryUtils';
import { db } from '@/server/lib/firebase-admin';
import { withSentryServerAction } from '@/server/lib/sentryServerAction';
import type { PaymentDocument } from '@/server/types/PaymentDocument';

export const clearAllPayments = withSentryServerAction(
  'clearAllPayments',
  async (userId: string, eventId: string, expenseId: string): Promise<void> => {
    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Add breadcrumb for tracking action flow
    Sentry.addBreadcrumb({
      category: 'payment.clear',
      message: 'Clearing all payments from expense',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
      },
    });

    if (!userId || !eventId || !expenseId) {
      throw new Error('Missing required parameters');
    }

    const now = Timestamp.now();

    // Get expense reference
    const expenseRef = db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId)
      .collection('expenses')
      .doc(expenseId);

    // Get current expense data to calculate total paid amount before clearing
    const expenseDoc = await expenseRef.get();
    if (!expenseDoc.exists) {
      throw new Error('Expense not found');
    }

    const expenseData = expenseDoc.data();
    if (!expenseData) {
      throw new Error('Expense document data not found');
    }

    let totalPaidAmount = 0;

    // Calculate total paid amount that will be lost
    if (expenseData.hasPaymentSchedule && expenseData.paymentSchedule) {
      totalPaidAmount = expenseData.paymentSchedule
        .filter((payment: PaymentDocument) => payment.isPaid)
        .reduce(
          (sum: number, payment: PaymentDocument) => sum + payment.amount,
          0,
        );
    } else if (expenseData.oneOffPayment?.isPaid) {
      totalPaidAmount = expenseData.oneOffPayment.amount;
    }

    // Clear all payment data
    await expenseRef.update({
      hasPaymentSchedule: false,
      paymentSchedule: null,
      oneOffPayment: null,
      _updatedDate: now,
      _updatedBy: userId,
    });

    // Update category spentAmount to subtract the paid amounts that were cleared
    if (totalPaidAmount > 0) {
      const categoryId = await getCategoryIdFromExpense(
        userId,
        eventId,
        expenseId,
      );
      if (categoryId) {
        await subtractFromCategorySpentAmount(
          userId,
          eventId,
          categoryId,
          totalPaidAmount,
        );
      }
    }

    // Add success breadcrumb
    Sentry.addBreadcrumb({
      category: 'payment.clear',
      message: 'All payments cleared successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        totalPaidAmountCleared: totalPaidAmount,
      },
    });
  },
);
