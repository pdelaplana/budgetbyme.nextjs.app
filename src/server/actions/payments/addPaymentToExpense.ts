'use server';

import { db } from '@/server/lib/firebase-admin';
import type { AddPaymentDto } from '@/types/Payment';
import type { PaymentDocument } from '@/server/types/PaymentDocument';
import { Timestamp } from 'firebase-admin/firestore';

export async function addPaymentToExpense(addPaymentDto: AddPaymentDto): Promise<string> {
  try {
    const { userId, eventId, expenseId, ...paymentData } = addPaymentDto;

    // Validate required fields
    if (!userId || !eventId || !expenseId) {
      throw new Error('Missing required fields: userId, eventId, or expenseId');
    }

    if (!paymentData.name || !paymentData.description || !paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Payment name, description and valid amount are required');
    }

    if (!paymentData.dueDate) {
      throw new Error('Due date is required');
    }

    const now = Timestamp.now();

    // Create payment document
    const paymentDoc: PaymentDocument = {
      name: paymentData.name,
      description: paymentData.description,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      dueDate: Timestamp.fromDate(paymentData.dueDate),
      isPaid: false,
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

    // Get current expense to update payment schedule
    const expenseDoc = await expenseRef.get();
    if (!expenseDoc.exists) {
      throw new Error('Expense not found');
    }

    const expenseData = expenseDoc.data();
    const hasPaymentSchedule = expenseData?.hasPaymentSchedule || false;

    if (hasPaymentSchedule) {
      // Check if we have existing payments to determine structure
      if (expenseData?.paymentSchedule && Array.isArray(expenseData.paymentSchedule)) {
        // Add to existing payment schedule array
        const currentSchedule = expenseData.paymentSchedule;
        await expenseRef.update({
          paymentSchedule: [...currentSchedule, paymentDoc],
          _updatedDate: now,
          _updatedBy: userId,
        });
      } else if (expenseData?.oneOffPayment) {
        // Convert oneOffPayment to paymentSchedule array with both payments
        await expenseRef.update({
          paymentSchedule: [expenseData.oneOffPayment, paymentDoc],
          oneOffPayment: null, // Remove the single payment
          _updatedDate: now,
          _updatedBy: userId,
        });
      } else {
        // This is the first payment in a schedule, create array
        await expenseRef.update({
          paymentSchedule: [paymentDoc],
          _updatedDate: now,
          _updatedBy: userId,
        });
      }
    } else {
      // Set as one-off payment and mark as having payment schedule
      await expenseRef.update({
        hasPaymentSchedule: true,
        oneOffPayment: paymentDoc,
        _updatedDate: now,
        _updatedBy: userId,
      });
    }

    const paymentId = now.toMillis().toString(); // Use timestamp as ID
    console.log('Payment added to expense successfully:', paymentId);
    return paymentId;
  } catch (error) {
    console.error('Error adding payment to expense:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add payment to expense');
  }
}