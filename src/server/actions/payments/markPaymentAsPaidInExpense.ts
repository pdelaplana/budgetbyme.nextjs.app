'use server';

import { db } from '@/server/lib/firebase-admin';
import { getCategoryIdFromExpense } from '@/server/lib/categoryUtils';
import type { MarkPaymentAsPaidDto } from '@/types/Payment';
import { Timestamp } from 'firebase-admin/firestore';
import { addToEventTotals } from '@/server/lib/eventAggregation';

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
      _updatedDate: now,
      _updatedBy: userId,
    };

    let paymentAmount = 0;
    let paymentSchedule: any[] | undefined;
    let updatedPayment: any | undefined;

    if (hasPaymentSchedule && expenseData.paymentSchedule) {
      // Update payment in schedule array
      paymentSchedule = [...expenseData.paymentSchedule];
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
    } else if (expenseData.oneOffPayment) {
      // Get payment amount before marking as paid
      paymentAmount = expenseData.oneOffPayment.amount;

      // Mark one-off payment as paid
      updatedPayment = {
        ...expenseData.oneOffPayment,
        ...paymentUpdateFields,
      };
    } else {
      throw new Error('Payment not found');
    }

    // Update expense, category spentAmount and event totals atomically
    const categoryId = await getCategoryIdFromExpense(userId, eventId, expenseId);
    if (categoryId && paymentAmount > 0) {
      // Start batch transaction for all updates
      const batch = db.batch();

      // Update expense with payment status
      if (paymentSchedule) {
        batch.update(expenseRef, {
          paymentSchedule,
          _updatedDate: now,
          _updatedBy: userId,
        });
      } else if (updatedPayment) {
        batch.update(expenseRef, {
          oneOffPayment: updatedPayment,
          _updatedDate: now,
          _updatedBy: userId,
        });
      }

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
        const categoryData = categoryDoc.data()!;
        const newSpentAmount = (categoryData.spentAmount || 0) + paymentAmount;

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
        const eventData = eventDoc.data()!;
        const newTotalSpentAmount = (eventData.totalSpentAmount || 0) + paymentAmount;

        batch.update(eventRef, {
          totalSpentAmount: newTotalSpentAmount,
          _updatedDate: now,
          _updatedBy: userId,
        });
      }

      // Commit the batch - all updates happen atomically
      await batch.commit();
    } else {
      // If no category found or payment amount is 0, still need to update the expense
      if (paymentSchedule) {
        await expenseRef.update({
          paymentSchedule,
          _updatedDate: now,
          _updatedBy: userId,
        });
      } else if (updatedPayment) {
        await expenseRef.update({
          oneOffPayment: updatedPayment,
          _updatedDate: now,
          _updatedBy: userId,
        });
      }
    }

    console.log('Payment marked as paid successfully:', paymentId);
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to mark payment as paid');
  }
}