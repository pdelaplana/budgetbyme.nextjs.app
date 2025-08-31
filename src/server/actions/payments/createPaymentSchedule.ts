'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/server/lib/firebase-admin';
import { withSentryServerAction } from '@/server/lib/sentryServerAction';
import type { PaymentDocument } from '@/server/types/PaymentDocument';
import type { PaymentMethod } from '@/types/Payment';

interface CreatePaymentScheduleDto {
  userId: string;
  eventId: string;
  expenseId: string;
  payments: Array<{
    name: string;
    description: string;
    amount: number;
    paymentMethod: PaymentMethod;
    dueDate: Date;
    notes?: string;
  }>;
}

export const createPaymentSchedule = withSentryServerAction(
  'createPaymentSchedule',
  async (dto: CreatePaymentScheduleDto): Promise<void> => {
    const { userId, eventId, expenseId, payments } = dto;

    // Set user context for debugging
    Sentry.setUser({ id: userId });

    // Add breadcrumb for tracking action flow
    Sentry.addBreadcrumb({
      category: 'payment.schedule.create',
      message: 'Creating payment schedule for expense',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        paymentCount: payments?.length || 0,
      },
    });

    // Validate required fields
    if (!userId || !eventId || !expenseId) {
      throw new Error('Missing required fields: userId, eventId, or expenseId');
    }

    if (!payments || payments.length === 0) {
      throw new Error(
        'At least one payment is required for a payment schedule',
      );
    }

    const now = Timestamp.now();

    // Convert all payments to PaymentDocument format
    const paymentSchedule: PaymentDocument[] = payments.map(
      (payment, index) => ({
        name: payment.name,
        description: payment.description,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        dueDate: Timestamp.fromDate(payment.dueDate),
        isPaid: false,
        notes: payment.notes || '',
        _createdDate: Timestamp.fromMillis(now.toMillis() + index), // Ensure unique timestamps
        _createdBy: userId,
        _updatedDate: Timestamp.fromMillis(now.toMillis() + index),
        _updatedBy: userId,
      }),
    );

    // Get expense reference
    const expenseRef = db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId)
      .collection('expenses')
      .doc(expenseId);

    // Update expense with payment schedule
    await expenseRef.update({
      hasPaymentSchedule: true,
      paymentSchedule: paymentSchedule,
      oneOffPayment: null, // Clear any existing single payment
      _updatedDate: now,
      _updatedBy: userId,
    });

    // Add success breadcrumb
    Sentry.addBreadcrumb({
      category: 'payment.schedule.create',
      message: 'Payment schedule created successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        expenseId,
        paymentCount: payments.length,
        totalAmount: paymentSchedule.reduce((sum, p) => sum + p.amount, 0),
      },
    });
  },
);
