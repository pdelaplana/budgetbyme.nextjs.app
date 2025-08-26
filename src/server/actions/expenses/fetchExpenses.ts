'use server';

import * as Sentry from '@sentry/nextjs';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { Expense } from '../../../types/Expense';
import type { ExpenseDocument } from '../../types/ExpenseDocument';

/**
 * Server action to fetch all expenses for an event
 * Expenses are retrieved from: /workspaces/{userId}/events/{eventId}/expenses
 * Wrapped with Sentry monitoring
 */
export const fetchExpenses = withSentryServerAction(
  'fetchExpenses',
  async (userId: string, eventId: string): Promise<Expense[]> => {
    if (!userId) throw new Error('User ID is required');
    if (!eventId) throw new Error('Event ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'expense.fetch',
        message: 'Starting expenses fetch',
        level: 'debug',
        data: {
          userId,
          eventId,
        },
      });

      // Verify event exists
      const eventRef = db
        .collection('workspaces')
        .doc(userId)
        .collection('events')
        .doc(eventId);

      const eventDoc = await eventRef.get();
      if (!eventDoc.exists) {
        throw new Error('Event not found. Please ensure the event exists.');
      }

      // Fetch all expenses for the event
      const expensesSnapshot = await eventRef
        .collection('expenses')
        .orderBy('_createdDate', 'desc')
        .get();

      if (expensesSnapshot.empty) {
        Sentry.addBreadcrumb({
          category: 'expense.fetch',
          message: 'No expenses found for event',
          level: 'info',
          data: {
            userId,
            eventId,
          },
        });
        return [];
      }

      // Convert all documents to Expense objects
      const expenses: Expense[] = expensesSnapshot.docs.map((doc) => {
        const data = doc.data() as ExpenseDocument;

        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          amount: data.amount,
          currency: data.currency as any, // Type assertion for Currency enum
          category: {
            id: data.category.id,
            name: data.category.name,
            color: data.category.color,
            icon: data.category.icon,
          },
          vendor: {
            name: data.vendor.name,
            address: data.vendor.address,
            website: data.vendor.website,
            email: data.vendor.email,
          },
          date: data.date.toDate(),
          notes: data.notes,
          tags: data.tags || [],
          attachments: data.attachments || [],
          hasPaymentSchedule: data.hasPaymentSchedule || false,
          paymentSchedule: data.paymentSchedule?.map(payment => ({
            id: payment._createdDate.toMillis().toString(), // Generate ID from timestamp
            name: payment.name,
            description: payment.description,
            amount: payment.amount,
            dueDate: payment.dueDate.toDate(),
            isPaid: payment.isPaid,
            paidDate: payment.paidDate?.toDate(),
            paymentMethod: payment.paymentMethod as any,
            notes: payment.notes,
            _createdDate: payment._createdDate.toDate(),
            _createdBy: payment._createdBy,
            _updatedDate: payment._updatedDate.toDate(),
            _updatedBy: payment._updatedBy,
          })),
          oneOffPayment: data.oneOffPayment ? {
            id: data.oneOffPayment._createdDate.toMillis().toString(), // Generate ID from timestamp
            name: data.oneOffPayment.name,
            description: data.oneOffPayment.description,
            amount: data.oneOffPayment.amount,
            dueDate: data.oneOffPayment.dueDate.toDate(),
            isPaid: data.oneOffPayment.isPaid,
            paidDate: data.oneOffPayment.paidDate?.toDate(),
            paymentMethod: data.oneOffPayment.paymentMethod as any,
            notes: data.oneOffPayment.notes,
            _createdDate: data.oneOffPayment._createdDate.toDate(),
            _createdBy: data.oneOffPayment._createdBy,
            _updatedDate: data.oneOffPayment._updatedDate.toDate(),
            _updatedBy: data.oneOffPayment._updatedBy,
          } : undefined,
          _createdDate: data._createdDate.toDate(),
          _createdBy: data._createdBy,
          _updatedDate: data._updatedDate.toDate(),
          _updatedBy: data._updatedBy,
        };
      });

      // Add breadcrumb for successful fetch
      Sentry.addBreadcrumb({
        category: 'expense.fetch',
        message: 'Expenses fetched successfully',
        level: 'info',
        data: {
          userId,
          eventId,
          expensesCount: expenses.length,
        },
      });

      return expenses;
    } catch (error) {
      console.error('Error fetching expenses:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'fetchExpenses',
          userId,
          eventId,
        },
        extra: {
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to fetch expenses: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);