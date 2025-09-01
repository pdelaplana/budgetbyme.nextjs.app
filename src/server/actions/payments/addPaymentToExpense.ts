'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/server/lib/firebase-admin';
import { withSentryServerAction } from '@/server/lib/sentryServerAction';
import type { PaymentDocument } from '@/server/types/PaymentDocument';
import type { AddPaymentDto } from '@/types/Payment';

export const addPaymentToExpense = withSentryServerAction(
  'addPaymentToExpense',
  async (addPaymentDto: AddPaymentDto): Promise<string> => {
    const { userId, eventId, expenseId, ...paymentData } = addPaymentDto;

    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Add breadcrumb for tracking action flow
    Sentry.addBreadcrumb({
      category: 'payment.add',
      message: 'Adding payment to expense',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        amount: paymentData.amount,
      },
    });

    // Validate required fields
    if (!userId || !eventId || !expenseId) {
      throw new Error('Missing required fields: userId, eventId, or expenseId');
    }

    if (
      !paymentData.name ||
      !paymentData.description ||
      !paymentData.amount ||
      paymentData.amount <= 0
    ) {
      throw new Error(
        'Payment name, description and valid amount are required',
      );
    }

    if (!paymentData.dueDate) {
      throw new Error('Due date is required');
    }

    const now = Timestamp.now();

    // Create payment document
    const paymentDoc: PaymentDocument = {
      name: paymentData.name,
      description: paymentData.description,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      dueDate: Timestamp.fromDate(paymentData.dueDate),
      isPaid: false,
      notes: paymentData.notes || '',
      _createdDate: now,
      _createdBy: userId,
      _updatedDate: now,
      _updatedBy: userId,
    };

    // Get expense reference
    const expenseRef = db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId)
      .collection('expenses')
      .doc(expenseId);

    // Get current expense to update payment schedule
    const expenseDoc = await expenseRef.get();
    if (!expenseDoc.exists) {
      throw new Error('Expense not found');
    }

    const expenseData = expenseDoc.data();
    const hasPaymentSchedule = expenseData?.hasPaymentSchedule || false;

    if (hasPaymentSchedule) {
      // Check if we have existing payments to determine structure
      if (
        expenseData?.paymentSchedule &&
        Array.isArray(expenseData.paymentSchedule)
      ) {
        // Add to existing payment schedule array
        const currentSchedule = expenseData.paymentSchedule;
        await expenseRef.update({
          paymentSchedule: [...currentSchedule, paymentDoc],
          _updatedDate: now,
          _updatedBy: userId,
        });
      } else if (expenseData?.oneOffPayment) {
        // Convert oneOffPayment to paymentSchedule array with both payments
        await expenseRef.update({
          paymentSchedule: [expenseData.oneOffPayment, paymentDoc],
          oneOffPayment: null, // Remove the single payment
          _updatedDate: now,
          _updatedBy: userId,
        });
      } else {
        // This is the first payment in a schedule, create array
        await expenseRef.update({
          paymentSchedule: [paymentDoc],
          _updatedDate: now,
          _updatedBy: userId,
        });
      }
    } else {
      // Set as one-off payment and mark as having payment schedule
      await expenseRef.update({
        hasPaymentSchedule: true,
        oneOffPayment: paymentDoc,
        _updatedDate: now,
        _updatedBy: userId,
      });
    }

    const paymentId = now.toMillis().toString(); // Use timestamp as ID

    // Add success breadcrumb
    Sentry.addBreadcrumb({
      category: 'payment.add',
      message: 'Payment added to expense successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        paymentId,
        amount: paymentData.amount,
      },
    });

    return paymentId;
  },
);
