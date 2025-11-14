/**
 * Event-Level Budget Aggregation Utilities
 *
 * This module provides functions to maintain accurate event-level totals
 * (totalBudgetedAmount, totalScheduledAmount, totalSpentAmount) whenever
 * categories, expenses, or payments change.
 */

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import type { EventStatus } from '@/types/Event';
import { db } from './firebase-admin';

export interface EventAggregationAmounts {
  budgeted?: number;
  scheduled?: number;
  spent?: number;
}

export interface EventTotals {
  totalBudgetedAmount: number;
  totalScheduledAmount: number;
  totalSpentAmount: number;
  spentPercentage: number;
  status: EventStatus;
}

/**
 * Calculates event status based on budget and spending
 */
export function calculateEventStatus(
  totalBudgeted: number,
  totalSpent: number,
): EventStatus {
  if (totalBudgeted === 0) return 'on-track';

  const spentPercentage = (totalSpent / totalBudgeted) * 100;

  if (spentPercentage > 100) return 'over-budget';
  if (spentPercentage < 80) return 'under-budget';
  return 'on-track';
}

/**
 * Calculates spent percentage with proper rounding
 */
export function calculateSpentPercentage(
  totalBudgeted: number,
  totalSpent: number,
): number {
  if (totalBudgeted === 0) return 0;
  return Math.round((totalSpent / totalBudgeted) * 100);
}

/**
 * Recalculates all event totals from scratch by aggregating category data
 * This is more expensive but ensures accuracy - use for data migration/repair
 */
export async function updateEventTotals(
  userId: string,
  eventId: string,
): Promise<EventTotals> {
  if (!userId) throw new Error('User ID is required');
  if (!eventId) throw new Error('Event ID is required');

  try {
    Sentry.addBreadcrumb({
      category: 'event.aggregation',
      message: 'Starting full event totals recalculation',
      level: 'info',
      data: { userId, eventId },
    });

    // Get all categories and expenses for this event
    const categoriesSnapshot = await db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId)
      .collection('categories')
      .get();

    const expensesSnapshot = await db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId)
      .collection('expenses')
      .get();

    // Calculate category totals from expenses
    const categoryTotals: Record<
      string,
      { budgeted: number; scheduled: number; spent: number }
    > = {};

    // Initialize category totals
    categoriesSnapshot.docs.forEach((categoryDoc) => {
      const categoryId = categoryDoc.id;
      const categoryData = categoryDoc.data();
      categoryTotals[categoryId] = {
        budgeted: categoryData.budgetedAmount || 0, // Keep existing budgeted amount (set manually)
        scheduled: 0,
        spent: 0,
      };
    });

    // Calculate scheduled and spent amounts from expenses
    expensesSnapshot.docs.forEach((expenseDoc) => {
      const expenseData = expenseDoc.data();
      const categoryId = expenseData.category?.id;
      const expenseAmount = expenseData.amount || 0;

      if (categoryId && categoryTotals[categoryId]) {
        // Add to scheduled amount
        categoryTotals[categoryId].scheduled += expenseAmount;

        // Calculate spent amount from payments
        let expenseSpentAmount = 0;
        if (expenseData.hasPaymentSchedule && expenseData.paymentSchedule) {
          // Sum paid payments from schedule
          expenseSpentAmount = expenseData.paymentSchedule
            .filter((payment: any) => payment.isPaid)
            .reduce(
              (sum: number, payment: any) => sum + (payment.amount || 0),
              0,
            );
        } else if (expenseData.oneOffPayment?.isPaid) {
          // Single paid payment
          expenseSpentAmount = expenseData.oneOffPayment.amount || 0;
        }

        categoryTotals[categoryId].spent += expenseSpentAmount;
      }
    });

    // Start batch transaction to update categories and event
    const batch = db.batch();

    // Update each category with recalculated totals
    categoriesSnapshot.docs.forEach((categoryDoc) => {
      const categoryId = categoryDoc.id;
      const totals = categoryTotals[categoryId];

      if (totals) {
        batch.update(categoryDoc.ref, {
          scheduledAmount: totals.scheduled,
          spentAmount: totals.spent,
          // Keep budgetedAmount as-is (manually set)
          _updatedDate: Timestamp.now(),
          _updatedBy: userId,
        });
      }
    });

    // Calculate event totals from recalculated category totals
    let totalBudgetedAmount = 0;
    let totalScheduledAmount = 0;
    let totalSpentAmount = 0;

    Object.values(categoryTotals).forEach((totals) => {
      totalBudgetedAmount += totals.budgeted;
      totalScheduledAmount += totals.scheduled;
      totalSpentAmount += totals.spent;
    });

    // Calculate derived values
    const spentPercentage = calculateSpentPercentage(
      totalBudgetedAmount,
      totalSpentAmount,
    );
    const status = calculateEventStatus(totalBudgetedAmount, totalSpentAmount);

    const eventTotals: EventTotals = {
      totalBudgetedAmount,
      totalScheduledAmount,
      totalSpentAmount,
      spentPercentage,
      status,
    };

    // Update the event document in the same batch
    const eventRef = db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId);

    batch.update(eventRef, {
      totalBudgetedAmount,
      totalScheduledAmount,
      totalSpentAmount,
      spentPercentage,
      status,
      _updatedDate: Timestamp.now(),
      _updatedBy: userId,
    });

    // Commit all updates atomically
    await batch.commit();

    Sentry.addBreadcrumb({
      category: 'event.aggregation',
      message: 'Event totals recalculated successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        totalBudgetedAmount,
        totalScheduledAmount,
        totalSpentAmount,
        spentPercentage,
        status,
      },
    });

    return eventTotals;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        action: 'updateEventTotals',
        userId,
        eventId,
      },
      extra: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw new Error(
      `Failed to update event totals: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Adds amounts to event totals (incremental update)
 * More performant than full recalculation
 */
export async function addToEventTotals(
  userId: string,
  eventId: string,
  amounts: EventAggregationAmounts,
): Promise<EventTotals> {
  if (!userId) throw new Error('User ID is required');
  if (!eventId) throw new Error('Event ID is required');

  // Validate that at least one amount is provided (including 0 as valid)
  if (
    amounts.budgeted === undefined &&
    amounts.scheduled === undefined &&
    amounts.spent === undefined
  ) {
    throw new Error('At least one amount must be provided');
  }

  try {
    Sentry.addBreadcrumb({
      category: 'event.aggregation',
      message: 'Adding to event totals',
      level: 'info',
      data: { userId, eventId, amounts },
    });

    const eventRef = db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId);

    // Get current event data
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const currentData = eventDoc.data()!;

    // Calculate new totals
    const totalBudgetedAmount =
      (currentData.totalBudgetedAmount || 0) + (amounts.budgeted || 0);
    const totalScheduledAmount =
      (currentData.totalScheduledAmount || 0) + (amounts.scheduled || 0);
    const totalSpentAmount =
      (currentData.totalSpentAmount || 0) + (amounts.spent || 0);

    // Calculate derived values
    const spentPercentage = calculateSpentPercentage(
      totalBudgetedAmount,
      totalSpentAmount,
    );
    const status = calculateEventStatus(totalBudgetedAmount, totalSpentAmount);

    const eventTotals: EventTotals = {
      totalBudgetedAmount,
      totalScheduledAmount,
      totalSpentAmount,
      spentPercentage,
      status,
    };

    // Update the event document
    await eventRef.update({
      totalBudgetedAmount,
      totalScheduledAmount,
      totalSpentAmount,
      spentPercentage,
      status,
      _updatedDate: Timestamp.now(),
      _updatedBy: userId,
    });

    Sentry.addBreadcrumb({
      category: 'event.aggregation',
      message: 'Event totals updated successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        amountsAdded: amounts,
        newTotals: eventTotals,
      },
    });

    return eventTotals;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        action: 'addToEventTotals',
        userId,
        eventId,
      },
      extra: {
        amounts,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw new Error(
      `Failed to add to event totals: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Subtracts amounts from event totals (incremental update)
 * More performant than full recalculation
 */
export async function subtractFromEventTotals(
  userId: string,
  eventId: string,
  amounts: EventAggregationAmounts,
): Promise<EventTotals> {
  if (!userId) throw new Error('User ID is required');
  if (!eventId) throw new Error('Event ID is required');

  // Validate that at least one amount is provided (including 0 as valid)
  if (
    amounts.budgeted === undefined &&
    amounts.scheduled === undefined &&
    amounts.spent === undefined
  ) {
    throw new Error('At least one amount must be provided');
  }

  try {
    Sentry.addBreadcrumb({
      category: 'event.aggregation',
      message: 'Subtracting from event totals',
      level: 'info',
      data: { userId, eventId, amounts },
    });

    const eventRef = db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId);

    // Get current event data
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const currentData = eventDoc.data()!;

    // Calculate new totals (ensure no negative values)
    const totalBudgetedAmount = Math.max(
      0,
      (currentData.totalBudgetedAmount || 0) - (amounts.budgeted || 0),
    );
    const totalScheduledAmount = Math.max(
      0,
      (currentData.totalScheduledAmount || 0) - (amounts.scheduled || 0),
    );
    const totalSpentAmount = Math.max(
      0,
      (currentData.totalSpentAmount || 0) - (amounts.spent || 0),
    );

    // Calculate derived values
    const spentPercentage = calculateSpentPercentage(
      totalBudgetedAmount,
      totalSpentAmount,
    );
    const status = calculateEventStatus(totalBudgetedAmount, totalSpentAmount);

    const eventTotals: EventTotals = {
      totalBudgetedAmount,
      totalScheduledAmount,
      totalSpentAmount,
      spentPercentage,
      status,
    };

    // Update the event document
    await eventRef.update({
      totalBudgetedAmount,
      totalScheduledAmount,
      totalSpentAmount,
      spentPercentage,
      status,
      _updatedDate: Timestamp.now(),
      _updatedBy: userId,
    });

    Sentry.addBreadcrumb({
      category: 'event.aggregation',
      message: 'Event totals updated successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        amountsSubtracted: amounts,
        newTotals: eventTotals,
      },
    });

    return eventTotals;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        action: 'subtractFromEventTotals',
        userId,
        eventId,
      },
      extra: {
        amounts,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw new Error(
      `Failed to subtract from event totals: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Handles complex event total updates for operations that affect multiple amounts
 * This is useful for operations like updating an expense that changes both scheduled and spent amounts
 */
export async function updateEventTotalsComplex(
  userId: string,
  eventId: string,
  changes: {
    budgeted?: { add?: number; subtract?: number };
    scheduled?: { add?: number; subtract?: number };
    spent?: { add?: number; subtract?: number };
  },
): Promise<EventTotals> {
  if (!userId) throw new Error('User ID is required');
  if (!eventId) throw new Error('Event ID is required');

  try {
    Sentry.addBreadcrumb({
      category: 'event.aggregation',
      message: 'Complex event totals update',
      level: 'info',
      data: { userId, eventId, changes },
    });

    const eventRef = db
      .collection('workspaces')
      .doc(userId)
      .collection('events')
      .doc(eventId);

    // Get current event data
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const currentData = eventDoc.data()!;

    // Calculate new totals
    let totalBudgetedAmount = currentData.totalBudgetedAmount || 0;
    let totalScheduledAmount = currentData.totalScheduledAmount || 0;
    let totalSpentAmount = currentData.totalSpentAmount || 0;

    // Apply budgeted changes
    if (changes.budgeted) {
      totalBudgetedAmount +=
        (changes.budgeted.add || 0) - (changes.budgeted.subtract || 0);
      totalBudgetedAmount = Math.max(0, totalBudgetedAmount);
    }

    // Apply scheduled changes
    if (changes.scheduled) {
      totalScheduledAmount +=
        (changes.scheduled.add || 0) - (changes.scheduled.subtract || 0);
      totalScheduledAmount = Math.max(0, totalScheduledAmount);
    }

    // Apply spent changes
    if (changes.spent) {
      totalSpentAmount +=
        (changes.spent.add || 0) - (changes.spent.subtract || 0);
      totalSpentAmount = Math.max(0, totalSpentAmount);
    }

    // Calculate derived values
    const spentPercentage = calculateSpentPercentage(
      totalBudgetedAmount,
      totalSpentAmount,
    );
    const status = calculateEventStatus(totalBudgetedAmount, totalSpentAmount);

    const eventTotals: EventTotals = {
      totalBudgetedAmount,
      totalScheduledAmount,
      totalSpentAmount,
      spentPercentage,
      status,
    };

    // Update the event document
    await eventRef.update({
      totalBudgetedAmount,
      totalScheduledAmount,
      totalSpentAmount,
      spentPercentage,
      status,
      _updatedDate: Timestamp.now(),
      _updatedBy: userId,
    });

    Sentry.addBreadcrumb({
      category: 'event.aggregation',
      message: 'Complex event totals updated successfully',
      level: 'info',
      data: {
        userId,
        eventId,
        changes,
        newTotals: eventTotals,
      },
    });

    return eventTotals;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        action: 'updateEventTotalsComplex',
        userId,
        eventId,
      },
      extra: {
        changes,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw new Error(
      `Failed to update event totals: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
