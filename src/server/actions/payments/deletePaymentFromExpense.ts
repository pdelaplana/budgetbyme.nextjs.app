'use server';

import { db } from '@/server/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function deletePaymentFromExpense(
  userId: string,
  eventId: string,
  expenseId: string,
  paymentId: string
): Promise<void> {
  try {
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
    const hasPaymentSchedule = expenseData?.hasPaymentSchedule || false;

    if (hasPaymentSchedule && expenseData.paymentSchedule) {
      // Remove payment from schedule array
      const paymentSchedule = expenseData.paymentSchedule.filter(
        (payment: any) => payment._createdDate.toMillis().toString() !== paymentId
      );

      if (paymentSchedule.length === expenseData.paymentSchedule.length) {
        throw new Error('Payment not found in schedule');
      }

      // If no payments left, remove payment schedule entirely
      if (paymentSchedule.length === 0) {
        await expenseRef.update({
          hasPaymentSchedule: false,
          paymentSchedule: null,
          oneOffPayment: null,
          _updatedDate: now,
          _updatedBy: userId,
        });
      } else {
        await expenseRef.update({
          paymentSchedule,
          _updatedDate: now,
          _updatedBy: userId,
        });
      }
    } else if (expenseData.oneOffPayment) {
      // Remove one-off payment
      const oneOffPaymentId = expenseData.oneOffPayment._createdDate.toMillis().toString();
      if (oneOffPaymentId !== paymentId) {
        throw new Error('Payment not found');
      }

      await expenseRef.update({
        hasPaymentSchedule: false,
        oneOffPayment: null,
        _updatedDate: now,
        _updatedBy: userId,
      });
    } else {
      throw new Error('Payment not found');
    }

    console.log('Payment deleted successfully:', paymentId);
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete payment');
  }
}