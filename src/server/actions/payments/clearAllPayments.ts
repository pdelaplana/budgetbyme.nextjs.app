'use server';

import { db } from '@/server/lib/firebase-admin';
import { subtractFromCategorySpentAmount, getCategoryIdFromExpense } from '@/server/lib/categoryUtils';
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

    // Get current expense data to calculate total paid amount before clearing
    const expenseDoc = await expenseRef.get();
    if (!expenseDoc.exists) {
      throw new Error('Expense not found');
    }

    const expenseData = expenseDoc.data();
    let totalPaidAmount = 0;

    // Calculate total paid amount that will be lost
    if (expenseData.hasPaymentSchedule && expenseData.paymentSchedule) {
      totalPaidAmount = expenseData.paymentSchedule
        .filter((payment: any) => payment.isPaid)
        .reduce((sum: number, payment: any) => sum + payment.amount, 0);
    } else if (expenseData.oneOffPayment && expenseData.oneOffPayment.isPaid) {
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
      const categoryId = await getCategoryIdFromExpense(userId, eventId, expenseId);
      if (categoryId) {
        await subtractFromCategorySpentAmount(userId, eventId, categoryId, totalPaidAmount);
      }
    }

    console.log('All payments cleared for expense:', expenseId);
  } catch (error) {
    console.error('Error clearing payments:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to clear payments');
  }
}