'use server';

import { db } from '@/server/lib/firebase-admin';
import type { PaymentMethod } from '@/types/Payment';
import type { PaymentDocument } from '@/server/types/PaymentDocument';
import { Timestamp } from 'firebase-admin/firestore';

interface CreateSinglePaymentDto {
  userId: string;
  eventId: string;
  expenseId: string;
  name: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidDate: Date;
  notes?: string;
  attachments?: string[];
}

export async function createSinglePayment(dto: CreateSinglePaymentDto): Promise<string> {
  try {
    const { userId, eventId, expenseId, paidDate, ...paymentData } = dto;

    // Validate required fields
    if (!userId || !eventId || !expenseId) {
      throw new Error('Missing required fields: userId, eventId, or expenseId');
    }

    if (!paymentData.name || !paymentData.description || !paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Payment name, description and valid amount are required');
    }

    if (!paidDate) {
      throw new Error('Paid date is required');
    }

    const now = Timestamp.now();

    // Create payment document (already paid)
    const paymentDoc: PaymentDocument = {
      name: paymentData.name,
      description: paymentData.description,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      dueDate: Timestamp.fromDate(paidDate), // Due date = paid date for immediate payment
      isPaid: true,
      paidDate: Timestamp.fromDate(paidDate),
      notes: paymentData.notes || '',
      attachments: paymentData.attachments || [],
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

    // Update expense with single payment
    await expenseRef.update({
      hasPaymentSchedule: false, // False for single payment (not a schedule)
      oneOffPayment: paymentDoc,
      paymentSchedule: null, // Clear any existing schedule
      _updatedDate: now,
      _updatedBy: userId,
    });

    const paymentId = now.toMillis().toString();
    console.log('Single payment created successfully:', paymentId);
    return paymentId;
  } catch (error) {
    console.error('Error creating single payment:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create single payment');
  }
}