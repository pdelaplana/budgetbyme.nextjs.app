'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/server/lib/firebase-admin';
import { withSentryServerAction } from '@/server/lib/sentryServerAction';
import type { PaymentDocument } from '@/server/types/PaymentDocument';
import type { UpdatePaymentDto } from '@/types/Payment';

export const updatePaymentInExpense = withSentryServerAction(
  'updatePaymentInExpense',
  async (
    userId: string,
    eventId: string,
    expenseId: string,
    paymentId: string,
    updateData: UpdatePaymentDto,
  ): Promise<void> => {
    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Add breadcrumb for tracking action flow
    Sentry.addBreadcrumb({
      category: 'payment.update',
      message: 'Updating payment in expense',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        paymentId,
        updateFields: Object.keys(updateData),
      },
    });

    if (!userId || !eventId || !expenseId || !paymentId) {
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

    // Get current expense data
    const expenseDoc = await expenseRef.get();
    if (!expenseDoc.exists) {
      throw new Error('Expense not found');
    }

    const expenseData = expenseDoc.data();
    if (!expenseData) {
      throw new Error('Expense document data not found');
    }

    const hasPaymentSchedule = expenseData.hasPaymentSchedule || false;

    // Build update fields for payment
    const paymentUpdateFields: Partial<PaymentDocument> = {};
    if (updateData.name !== undefined)
      paymentUpdateFields.name = updateData.name;
    if (updateData.description !== undefined)
      paymentUpdateFields.description = updateData.description;
    if (updateData.amount !== undefined)
      paymentUpdateFields.amount = updateData.amount;
    if (updateData.paymentMethod !== undefined)
      paymentUpdateFields.paymentMethod = updateData.paymentMethod;
    if (updateData.isPaid !== undefined)
      paymentUpdateFields.isPaid = updateData.isPaid;
    if (updateData.dueDate !== undefined)
      paymentUpdateFields.dueDate = Timestamp.fromDate(updateData.dueDate);
    if (updateData.paidDate !== undefined)
      paymentUpdateFields.paidDate = Timestamp.fromDate(updateData.paidDate);
    if (updateData.notes !== undefined)
      paymentUpdateFields.notes = updateData.notes;

    paymentUpdateFields._updatedDate = now;
    paymentUpdateFields._updatedBy = userId;

    if (hasPaymentSchedule && expenseData.paymentSchedule) {
      // Update payment in schedule array
      const paymentSchedule = [...expenseData.paymentSchedule];
      const paymentIndex = paymentSchedule.findIndex(
        (payment) => payment._createdDate.toMillis().toString() === paymentId,
      );

      if (paymentIndex === -1) {
        throw new Error('Payment not found in schedule');
      }

      // Update the payment object
      paymentSchedule[paymentIndex] = {
        ...paymentSchedule[paymentIndex],
        ...paymentUpdateFields,
      };

      await expenseRef.update({
        paymentSchedule,
        _updatedDate: now,
        _updatedBy: userId,
      });
    } else if (expenseData.oneOffPayment) {
      // Update one-off payment
      const updatedPayment = {
        ...expenseData.oneOffPayment,
        ...paymentUpdateFields,
      };

      await expenseRef.update({
        oneOffPayment: updatedPayment,
        _updatedDate: now,
        _updatedBy: userId,
      });
    } else {
      throw new Error('Payment not found');
    }

    // Add success breadcrumb
    Sentry.addBreadcrumb({
      category: 'payment.update',
      message: 'Payment updated successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        paymentId,
        updateFields: Object.keys(updateData),
      },
    });
  },
);
