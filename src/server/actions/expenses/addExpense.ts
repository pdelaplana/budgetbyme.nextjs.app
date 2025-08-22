'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';
import type { ExpenseDocument } from '../../types/ExpenseDocument';

export interface AddExpenseDto {
  userId: string;
  eventId: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  vendor: {
    name: string;
    address: string;
    website: string;
    email: string;
  };
  date: Date;
  notes: string;
  tags: string[];
  attachments?: string[];
}

/**
 * Server action to create a new expense in Firestore
 * Expenses are stored under the event: /workspaces/{userId}/events/{eventId}/expenses/{expenseId}
 * Also updates the category's spentAmount
 * Wrapped with Sentry monitoring
 */
export const addExpense = withSentryServerAction(
  'addExpense',
  async (addExpenseDto: AddExpenseDto): Promise<string> => {
    if (!addExpenseDto.userId) throw new Error('User ID is required');
    if (!addExpenseDto.eventId) throw new Error('Event ID is required');
    if (!addExpenseDto.name?.trim()) throw new Error('Expense name is required');
    if (addExpenseDto.amount <= 0) throw new Error('Amount must be greater than 0');
    if (!addExpenseDto.categoryId?.trim()) throw new Error('Category is required');
    if (!addExpenseDto.currency?.trim()) throw new Error('Currency is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: addExpenseDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'expense.create',
        message: 'Starting expense creation',
        level: 'debug',
        data: {
          userId: addExpenseDto.userId,
          eventId: addExpenseDto.eventId,
          expenseName: addExpenseDto.name,
          amount: addExpenseDto.amount,
          categoryId: addExpenseDto.categoryId,
        },
      });

      // Verify event exists
      const eventRef = db
        .collection('workspaces')
        .doc(addExpenseDto.userId)
        .collection('events')
        .doc(addExpenseDto.eventId);

      const eventDoc = await eventRef.get();
      if (!eventDoc.exists) {
        throw new Error('Event not found. Please ensure the event exists.');
      }

      // Verify category exists
      const categoryRef = eventRef
        .collection('categories')
        .doc(addExpenseDto.categoryId);

      const categoryDoc = await categoryRef.get();
      if (!categoryDoc.exists) {
        throw new Error('Category not found. Please ensure the category exists.');
      }

      // Create new expense document reference
      const expensesCollectionRef = eventRef.collection('expenses');
      const newExpenseRef = expensesCollectionRef.doc(); // Auto-generate ID

      // Prepare expense data
      const now = Timestamp.now();
      const newExpenseDocument: Partial<ExpenseDocument> = {
        name: addExpenseDto.name.trim(),
        description: addExpenseDto.description?.trim() || '',
        amount: addExpenseDto.amount,
        currency: addExpenseDto.currency.trim(),
        category: {
          id: addExpenseDto.categoryId,
          name: addExpenseDto.categoryName,
          color: addExpenseDto.categoryColor,
          icon: addExpenseDto.categoryIcon,
        },
        vendor: {
          name: addExpenseDto.vendor.name?.trim() || '',
          address: addExpenseDto.vendor.address?.trim() || '',
          website: addExpenseDto.vendor.website?.trim() || '',
          email: addExpenseDto.vendor.email?.trim() || '',
        },
        date: Timestamp.fromDate(addExpenseDto.date),
        notes: addExpenseDto.notes?.trim() || '',
        tags: addExpenseDto.tags || [],
        attachments: addExpenseDto.attachments || [],
        _createdDate: now,
        _createdBy: addExpenseDto.userId,
        _updatedDate: now,
        _updatedBy: addExpenseDto.userId,
      };

      // Start a batch write to update both expense and category
      const batch = db.batch();

      // Add the expense
      batch.set(newExpenseRef, newExpenseDocument);

      // Update category spent amount
      const categoryData = categoryDoc.data();
      const currentSpentAmount = categoryData?.spentAmount || 0;
      const newSpentAmount = currentSpentAmount + addExpenseDto.amount;

      batch.update(categoryRef, {
        spentAmount: newSpentAmount,
        _updatedDate: now,
        _updatedBy: addExpenseDto.userId,
      });

      // Commit the batch
      await batch.commit();

      // Add breadcrumb for successful expense creation
      Sentry.addBreadcrumb({
        category: 'expense.create',
        message: 'Expense created successfully',
        level: 'info',
        data: {
          userId: addExpenseDto.userId,
          eventId: addExpenseDto.eventId,
          expenseId: newExpenseRef.id,
          expenseName: addExpenseDto.name,
          amount: addExpenseDto.amount,
          categoryId: addExpenseDto.categoryId,
          newCategorySpentAmount: newSpentAmount,
        },
      });

      return newExpenseRef.id;
    } catch (error) {
      console.error('Error creating expense:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'addExpense',
          userId: addExpenseDto.userId,
          eventId: addExpenseDto.eventId,
        },
        extra: {
          userInput: addExpenseDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error(
        `Failed to create expense: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);