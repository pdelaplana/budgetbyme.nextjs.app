'use server';

import { db } from '@/server/lib/firebase-admin';
import { addToCategorySpentAmount, getCategoryIdFromExpense } from '@/server/lib/categoryUtils';
import type { MarkPaymentAsPaidDto } from '@/types/Payment';
import { Timestamp } from 'firebase-admin/firestore';

export async function markPaymentAsPaidInExpense(
  userId: string,
  eventId: string,
  expenseId: string,
  paymentId: string,
  markAsPaidData: MarkPaymentAsPaidDto
): Promise<void> {
  try {
    if (!userId || !eventId || !expenseId || !paymentId) {
      throw new Error('Missing required parameters');
    }

    if (!markAsPaidData.paidDate || !markAsPaidData.paymentMethod) {
      throw new Error('Paid date and payment method are required');
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

    const paymentUpdateFields = {
      isPaid: true,
      paidDate: Timestamp.fromDate(markAsPaidData.paidDate),
      paymentMethod: markAsPaidData.paymentMethod,
      notes: markAsPaidData.notes || '',
      attachments: markAsPaidData.attachments || [],
      _updatedDate: now,
      _updatedBy: userId,
    };

    let paymentAmount = 0;

    if (hasPaymentSchedule && expenseData.paymentSchedule) {
      // Update payment in schedule array
      const paymentSchedule = [...expenseData.paymentSchedule];
      const paymentIndex = paymentSchedule.findIndex(
        payment => payment._createdDate.toMillis().toString() === paymentId
      );
      
      if (paymentIndex === -1) {
        throw new Error('Payment not found in schedule');
      }

      // Get payment amount before marking as paid
      paymentAmount = paymentSchedule[paymentIndex].amount;

      // Mark the payment as paid
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
      // Get payment amount before marking as paid
      paymentAmount = expenseData.oneOffPayment.amount;

      // Mark one-off payment as paid
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

    // Update category spentAmount
    const categoryId = await getCategoryIdFromExpense(userId, eventId, expenseId);
    if (categoryId && paymentAmount > 0) {
      await addToCategorySpentAmount(userId, eventId, categoryId, paymentAmount);
    }

    console.log('Payment marked as paid successfully:', paymentId);
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to mark payment as paid');
  }
}