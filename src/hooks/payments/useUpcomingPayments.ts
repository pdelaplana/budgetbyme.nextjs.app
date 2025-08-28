import { useMemo } from 'react';
import type { Expense } from '@/types/Expense';
import type { Payment } from '@/types/Payment';

export interface UpcomingPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  expenseId: string;
  expenseName: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  status: 'overdue' | 'due-soon' | 'upcoming';
  paymentType: 'schedule' | 'one-off';
}

const getPaymentStatus = (dueDate: Date): 'overdue' | 'due-soon' | 'upcoming' => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDateStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const daysDifference = Math.ceil((dueDateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDifference < 0) return 'overdue';
  if (daysDifference <= 7) return 'due-soon';
  return 'upcoming';
};

export const useUpcomingPayments = (expenses: Expense[]): UpcomingPayment[] => {
  return useMemo(() => {
    const upcomingPayments: UpcomingPayment[] = [];

    expenses.forEach((expense) => {
      // Process payment schedule payments
      if (expense.hasPaymentSchedule && expense.paymentSchedule) {
        expense.paymentSchedule.forEach((payment: Payment) => {
          if (!payment.isPaid) {
            upcomingPayments.push({
              id: payment.id,
              name: payment.name,
              amount: payment.amount,
              dueDate: new Date(payment.dueDate),
              expenseId: expense.id,
              expenseName: expense.name,
              categoryName: expense.category.name,
              categoryColor: expense.category.color,
              categoryIcon: expense.category.icon,
              status: getPaymentStatus(new Date(payment.dueDate)),
              paymentType: 'schedule',
            });
          }
        });
      }

      // Process one-off payment
      if (!expense.hasPaymentSchedule && expense.oneOffPayment && !expense.oneOffPayment.isPaid) {
        upcomingPayments.push({
          id: expense.oneOffPayment.id,
          name: expense.oneOffPayment.name,
          amount: expense.oneOffPayment.amount,
          dueDate: new Date(expense.oneOffPayment.dueDate),
          expenseId: expense.id,
          expenseName: expense.name,
          categoryName: expense.category.name,
          categoryColor: expense.category.color,
          categoryIcon: expense.category.icon,
          status: getPaymentStatus(new Date(expense.oneOffPayment.dueDate)),
          paymentType: 'one-off',
        });
      }
    });

    // Sort by due date (ascending) - overdue first, then by date
    return upcomingPayments.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }, [expenses]);
};