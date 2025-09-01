'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { getCategoryIdFromExpense } from '@/server/lib/categoryUtils';
import { db } from '@/server/lib/firebase-admin';
import { withSentryServerAction } from '@/server/lib/sentryServerAction';
import type { PaymentDocument } from '@/server/types/PaymentDocument';
import type { PaymentMethod } from '@/types/Payment';

interface CreateSinglePaymentDto {
  userId: string;
  eventId: string;
  expenseId: string;
  name: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidDate: Date;
  notes?: string;
}

export const createSinglePayment = withSentryServerAction(
  'createSinglePayment',
  async (dto: CreateSinglePaymentDto): Promise<string> => {
    const { userId, eventId, expenseId, paidDate, ...paymentData } = dto;

    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Add breadcrumb for tracking action flow
    Sentry.addBreadcrumb({
      category: 'payment.single.create',
      message: 'Creating single payment for expense',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
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

    if (!paidDate) {
      throw new Error('Paid date is required');
    }

    const now = Timestamp.now();

    // Create payment document (already paid)
    const paymentDoc: PaymentDocument = {
      name: paymentData.name,
      description: paymentData.description,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      dueDate: Timestamp.fromDate(paidDate), // Due date = paid date for immediate payment
      isPaid: true,
      paidDate: Timestamp.fromDate(paidDate),
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

    // Update category spentAmount and event totals since this payment is already marked as paid
    const categoryId = await getCategoryIdFromExpense(
      userId,
      eventId,
      expenseId,
    );
    if (categoryId && paymentData.amount > 0) {
      // Start batch transaction for all updates
      const batch = db.batch();

      // Update expense with single payment
      batch.update(expenseRef, {
        hasPaymentSchedule: false, // False for single payment (not a schedule)
        oneOffPayment: paymentDoc,
        paymentSchedule: null, // Clear any existing schedule
        _updatedDate: now,
        _updatedBy: userId,
      });

      // Update category spentAmount
      const categoryRef = db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .doc(eventId)
        .collection('categories')
        .doc(categoryId);

      const categoryDoc = await categoryRef.get();
      if (categoryDoc.exists) {
        const categoryData = categoryDoc.data();
        if (!categoryData) {
          throw new Error('Category document data not found');
        }
        const newSpentAmount =
          (categoryData.spentAmount || 0) + paymentData.amount;

        batch.update(categoryRef, {
          spentAmount: newSpentAmount,
          _updatedDate: now,
          _updatedBy: userId,
        });
      }

      // Update event totalSpentAmount
      const eventRef = db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .doc(eventId);

      const eventDoc = await eventRef.get();
      if (eventDoc.exists) {
        const eventData = eventDoc.data();
        if (!eventData) {
          throw new Error('Event document data not found');
        }
        const newTotalSpentAmount =
          (eventData.totalSpentAmount || 0) + paymentData.amount;

        batch.update(eventRef, {
          totalSpentAmount: newTotalSpentAmount,
          _updatedDate: now,
          _updatedBy: userId,
        });
      }

      // Commit all updates atomically
      await batch.commit();
    } else {
      // If no category found, just update the expense
      await expenseRef.update({
        hasPaymentSchedule: false, // False for single payment (not a schedule)
        oneOffPayment: paymentDoc,
        paymentSchedule: null, // Clear any existing schedule
        _updatedDate: now,
        _updatedBy: userId,
      });
    }

    const paymentId = now.toMillis().toString();

    // Add success breadcrumb
    Sentry.addBreadcrumb({
      category: 'payment.single.create',
      message: 'Single payment created successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        paymentId,
        amount: paymentData.amount,
        isPaid: true,
      },
    });

    return paymentId;
  },
);
