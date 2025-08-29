'use server';

import { Timestamp } from 'firebase-admin/firestore';
import { getCategoryIdFromExpense } from '@/server/lib/categoryUtils';
import { db } from '@/server/lib/firebase-admin';

export async function deletePaymentFromExpense(
  userId: string,
  eventId: string,
  expenseId: string,
  paymentId: string,
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
    let deletedPaymentAmount = 0;
    let paymentWasPaid = false;

    // Find and prepare to delete the payment, tracking if it was paid
    if (hasPaymentSchedule && expenseData.paymentSchedule) {
      // Find payment in schedule array
      const paymentToDelete = expenseData.paymentSchedule.find(
        (payment: any) =>
          payment._createdDate.toMillis().toString() === paymentId,
      );

      if (!paymentToDelete) {
        throw new Error('Payment not found in schedule');
      }

      // Track payment amount if it was paid
      if (paymentToDelete.isPaid) {
        deletedPaymentAmount = paymentToDelete.amount || 0;
        paymentWasPaid = true;
      }

      // Remove payment from schedule array
      const paymentSchedule = expenseData.paymentSchedule.filter(
        (payment: any) =>
          payment._createdDate.toMillis().toString() !== paymentId,
      );

      // Update category and event totals if payment was paid
      const categoryId = await getCategoryIdFromExpense(
        userId,
        eventId,
        expenseId,
      );
      if (paymentWasPaid && categoryId && deletedPaymentAmount > 0) {
        // Start batch transaction for all updates
        const batch = db.batch();

        // Update expense - remove payment
        if (paymentSchedule.length === 0) {
          batch.update(expenseRef, {
            hasPaymentSchedule: false,
            paymentSchedule: null,
            oneOffPayment: null,
            _updatedDate: now,
            _updatedBy: userId,
          });
        } else {
          batch.update(expenseRef, {
            paymentSchedule,
            _updatedDate: now,
            _updatedBy: userId,
          });
        }

        // Update category spentAmount (subtract deleted payment)
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
          const newSpentAmount = Math.max(
            0,
            (categoryData.spentAmount || 0) - deletedPaymentAmount,
          );

          batch.update(categoryRef, {
            spentAmount: newSpentAmount,
            _updatedDate: now,
            _updatedBy: userId,
          });
        }

        // Update event totalSpentAmount (subtract deleted payment)
        const eventRef = db
          .collection('workspaces')
          .doc(userId)
          .collection('events')
          .doc(eventId);

        const eventDoc = await eventRef.get();
        if (eventDoc.exists) {
          const eventData = eventDoc.data()!;
          const newTotalSpentAmount = Math.max(
            0,
            (eventData.totalSpentAmount || 0) - deletedPaymentAmount,
          );

          batch.update(eventRef, {
            totalSpentAmount: newTotalSpentAmount,
            _updatedDate: now,
            _updatedBy: userId,
          });
        }

        // Commit all updates atomically
        await batch.commit();
      } else {
        // Payment wasn't paid or no category, just update expense
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
      }
    } else if (expenseData.oneOffPayment) {
      // Remove one-off payment
      const oneOffPaymentId = expenseData.oneOffPayment._createdDate
        .toMillis()
        .toString();
      if (oneOffPaymentId !== paymentId) {
        throw new Error('Payment not found');
      }

      // Track payment amount if it was paid
      if (expenseData.oneOffPayment.isPaid) {
        deletedPaymentAmount = expenseData.oneOffPayment.amount || 0;
        paymentWasPaid = true;
      }

      // Update category and event totals if payment was paid
      const categoryId = await getCategoryIdFromExpense(
        userId,
        eventId,
        expenseId,
      );
      if (paymentWasPaid && categoryId && deletedPaymentAmount > 0) {
        // Start batch transaction for all updates
        const batch = db.batch();

        // Update expense - remove one-off payment
        batch.update(expenseRef, {
          hasPaymentSchedule: false,
          oneOffPayment: null,
          _updatedDate: now,
          _updatedBy: userId,
        });

        // Update category spentAmount (subtract deleted payment)
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
          const newSpentAmount = Math.max(
            0,
            (categoryData.spentAmount || 0) - deletedPaymentAmount,
          );

          batch.update(categoryRef, {
            spentAmount: newSpentAmount,
            _updatedDate: now,
            _updatedBy: userId,
          });
        }

        // Update event totalSpentAmount (subtract deleted payment)
        const eventRef = db
          .collection('workspaces')
          .doc(userId)
          .collection('events')
          .doc(eventId);

        const eventDoc = await eventRef.get();
        if (eventDoc.exists) {
          const eventData = eventDoc.data()!;
          const newTotalSpentAmount = Math.max(
            0,
            (eventData.totalSpentAmount || 0) - deletedPaymentAmount,
          );

          batch.update(eventRef, {
            totalSpentAmount: newTotalSpentAmount,
            _updatedDate: now,
            _updatedBy: userId,
          });
        }

        // Commit all updates atomically
        await batch.commit();
      } else {
        // Payment wasn't paid, just update expense
        await expenseRef.update({
          hasPaymentSchedule: false,
          oneOffPayment: null,
          _updatedDate: now,
          _updatedBy: userId,
        });
      }
    } else {
      throw new Error('Payment not found');
    }

    console.log('Payment deleted successfully:', paymentId);
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to delete payment',
    );
  }
}
