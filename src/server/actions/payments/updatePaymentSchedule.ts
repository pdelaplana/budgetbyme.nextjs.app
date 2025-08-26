'use server';
// Server action to update payment schedule

import { revalidateTag } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/server/lib/firebase-admin';
import type { Payment, PaymentMethod } from '@/types/Payment';

interface UpdatePaymentScheduleParams {
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

export async function updatePaymentSchedule({
  userId,
  eventId,
  expenseId,
  payments,
}: UpdatePaymentScheduleParams): Promise<{ success: boolean; error?: string }> {
  try {
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

    // Convert payment data to Firestore document format (matching createPaymentSchedule)
    const now = Timestamp.now();
    const paymentSchedule = payments.map((payment, index) => ({
      name: payment.name.trim(),
      description: payment.description.trim(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      dueDate: Timestamp.fromDate(payment.dueDate),
      isPaid: false,
      notes: payment.notes?.trim() || '', // Always provide a string value, never undefined
      _createdDate: Timestamp.fromMillis(now.toMillis() + index), // Ensure unique timestamps
      _createdBy: userId,
      _updatedDate: Timestamp.fromMillis(now.toMillis() + index),
      _updatedBy: userId,
    }));

    // Update the expense with new payment schedule (matching createPaymentSchedule format)
    await expenseRef.update({
      hasPaymentSchedule: true,
      paymentSchedule: paymentSchedule,
      oneOffPayment: null, // Clear any existing single payment
      _updatedDate: now,
      _updatedBy: userId,
    });

    console.log(`Payment schedule updated successfully with ${paymentSchedule.length} payments for expense: ${expenseId}`);

    // Revalidate cache
    revalidateTag(`expenses-${userId}-${eventId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating payment schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}