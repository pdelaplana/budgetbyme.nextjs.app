'use client';

import React from 'react';
import TabbedCharts from '@/components/dashboard/TabbedCharts';
import type { BudgetCategory } from '@/types/BudgetCategory';
import type { Event } from '@/types/Event';
import type { Expense } from '@/types/Expense';

interface BudgetOverviewProps {
  event: Event;
  categories: BudgetCategory[];
  expenses: Expense[];
}

// Generate timeline data based on actual payment schedules
const generateTimelineData = (event: Event, expenses: Expense[]) => {
  const eventDate = new Date(event.eventDate);

  // Determine the date range for the chart
  // Start from the earliest payment or 3 months ago, whichever is earlier
  // End at the event date or 3 months from now, whichever is later
  let startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  let endDate = new Date(eventDate);
  if (endDate < new Date()) {
    endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);
  }

  // Find the true range based on expenses
  expenses.forEach((expense) => {
    // Check scheduled payments
    if (expense.paymentSchedule) {
      expense.paymentSchedule.forEach((payment) => {
        const dueDate = new Date(payment.dueDate);
        if (dueDate < startDate) startDate = dueDate;
        if (dueDate > endDate) endDate = dueDate;

        if (payment.paidDate) {
          const paidDate = new Date(payment.paidDate);
          if (paidDate < startDate) startDate = paidDate;
          if (paidDate > endDate) endDate = paidDate;
        }
      });
    } else if (expense.oneOffPayment) {
      const dueDate = new Date(expense.oneOffPayment.dueDate);
      if (dueDate < startDate) startDate = dueDate;
      if (dueDate > endDate) endDate = dueDate;

      if (expense.oneOffPayment.paidDate) {
        const paidDate = new Date(expense.oneOffPayment.paidDate);
        if (paidDate < startDate) startDate = paidDate;
        if (paidDate > endDate) endDate = paidDate;
      }
    } else {
      // No payment schedule, use expense date or event date
      // For budgeting purposes, if no date is set, we might assume it's due by the event
      // But let's stick to explicit dates if possible.
    }
  });

  // Normalize start date to the first day of the month
  startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  // Create a map of month key (YYYY-MM) to data
  const timelineMap = new Map<
    string,
    {
      date: string;
      budgeted: number;
      actual: number;
      expenses: { name: string; amount: number }[];
    }
  >();

  // Initialize the map with all months in the range
  const tempDate = new Date(startDate);
  // Add a buffer of 1 month at the end
  const finalDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);

  while (tempDate <= finalDate) {
    const monthKey = tempDate.toISOString().slice(0, 7);
    timelineMap.set(monthKey, {
      date: monthKey,
      budgeted: 0,
      actual: 0,
      expenses: [],
    });
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  // Populate data from expenses
  expenses.forEach((expense) => {
    const processPayment = (
      amount: number,
      dueDate: Date,
      isPaid: boolean,
      paidDate?: Date,
    ) => {
      // Add to budgeted amount in the due month
      const dueMonthKey = new Date(dueDate).toISOString().slice(0, 7);
      const dueData = timelineMap.get(dueMonthKey);
      if (dueData) {
        dueData.budgeted += amount;
        dueData.expenses.push({ name: expense.name, amount });
      }

      // Add to actual amount in the paid month (if paid)
      if (isPaid && paidDate) {
        const paidMonthKey = new Date(paidDate).toISOString().slice(0, 7);
        const paidData = timelineMap.get(paidMonthKey);
        if (paidData) {
          paidData.actual += amount;
        }
      }
    };

    if (expense.paymentSchedule && expense.paymentSchedule.length > 0) {
      expense.paymentSchedule.forEach((payment) => {
        processPayment(
          payment.amount,
          payment.dueDate,
          payment.isPaid,
          payment.paidDate,
        );
      });
    } else if (expense.oneOffPayment) {
      processPayment(
        expense.oneOffPayment.amount,
        expense.oneOffPayment.dueDate,
        expense.oneOffPayment.isPaid,
        expense.oneOffPayment.paidDate,
      );
    } else {
      // For expenses without specific payments, we can consider them "budgeted" for the event date
      const targetDate = expense.date || eventDate;
      const monthKey = new Date(targetDate).toISOString().slice(0, 7);
      const data = timelineMap.get(monthKey);
      if (data) {
        data.budgeted += expense.amount;
        data.expenses.push({ name: expense.name, amount: expense.amount });
      }
    }
  });

  // Convert map to array and sort
  return Array.from(timelineMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
};

function BudgetOverview({ event, categories, expenses }: BudgetOverviewProps) {
  // Transform BudgetCategory data to CategoryData format expected by charts
  const transformedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    budgeted: category.budgetedAmount || 0,
    spent: category.spentAmount || 0,
    percentage: 0, // Will be calculated in the chart component
    color: category.color || '#3B82F6', // Default blue color if none provided
  }));

  return (
    <div className='mb-6 sm:mb-8'>
      <TabbedCharts
        budgetData={{
          totalBudget: event.totalBudgetedAmount,
          totalSpent: event.totalSpentAmount,
          totalScheduled: event.totalScheduledAmount,
          percentage: event.spentPercentage,
          status:
            event.status === 'completed'
              ? 'on-track'
              : event.status === 'under-budget'
                ? 'under-budget'
                : event.status || 'on-track',
        }}
        timelineData={generateTimelineData(event, expenses)}
        categoryData={transformedCategories}
        quickStatsData={{
          totalBudget: event.totalBudgetedAmount,
          totalSpent: event.totalSpentAmount,
          categories: categories.length,
          paymentsDue: 0, // Will be updated when expense system is implemented
          eventDate: event.eventDate.toISOString(),
        }}
      />
    </div>
  );
}

export default React.memo(BudgetOverview);
