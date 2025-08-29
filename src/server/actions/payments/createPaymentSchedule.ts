'use server';

import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/server/lib/firebase-admin';
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

export async function createPaymentSchedule(
  dto: CreatePaymentScheduleDto,
): Promise<void> {
  try {
    const { userId, eventId, expenseId, payments } = dto;

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

    console.log(
      `Payment schedule created successfully with ${payments.length} payments for expense:`,
      expenseId,
    );
  } catch (error) {
    console.error('Error creating payment schedule:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to create payment schedule',
    );
  }
}
