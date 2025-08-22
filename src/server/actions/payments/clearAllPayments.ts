'use server';

import { db } from '@/server/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function clearAllPayments(
  userId: string,
  eventId: string,
  expenseId: string
): Promise<void> {
  try {
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

    // Clear all payment data
    await expenseRef.update({
      hasPaymentSchedule: false,
      paymentSchedule: null,
      oneOffPayment: null,
      _updatedDate: now,
      _updatedBy: userId,
    });

    console.log('All payments cleared for expense:', expenseId);
  } catch (error) {
    console.error('Error clearing payments:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to clear payments');
  }
}