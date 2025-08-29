import { describe, expect, it } from 'vitest';
import {
  calculateCategoryPaymentStats,
  calculatePaymentStatus,
  type ExpenseWithPayments,
  getPaymentStatusText,
} from './paymentCalculations';

describe('Payment Calculations', () => {
  describe('calculatePaymentStatus', () => {
    it('should handle expense with no payments', () => {
      const expense: ExpenseWithPayments = {
        id: '1',
        amount: 1000,
      };

      const result = calculatePaymentStatus(expense);

      expect(result).toEqual({
        hasPayments: false,
        totalScheduled: 1000,
        totalPaid: 0,
        remainingBalance: 1000,
        progressPercentage: 0,
        isFullyPaid: false,
        allPayments: [],
        nextDuePayment: null,
        overduePayments: [],
        upcomingPayments: [],
      });
    });

    it('should handle expense with one-off payment (unpaid)', () => {
      const expense: ExpenseWithPayments = {
        id: '1',
        amount: 1000,
        oneOffPayment: {
          id: 'payment1',
          amount: 1000,
          dueDate: '2025-01-15',
          isPaid: false,
        },
      };

      const result = calculatePaymentStatus(expense);

      expect(result.hasPayments).toBe(true);
      expect(result.totalScheduled).toBe(1000);
      expect(result.totalPaid).toBe(0);
      expect(result.remainingBalance).toBe(1000);
      expect(result.progressPercentage).toBe(0);
      expect(result.isFullyPaid).toBe(false);
      expect(result.allPayments).toHaveLength(1);
      expect(result.nextDuePayment?.id).toBe('payment1');
    });

    it('should handle expense with one-off payment (paid)', () => {
      const expense: ExpenseWithPayments = {
        id: '1',
        amount: 1000,
        oneOffPayment: {
          id: 'payment1',
          amount: 1000,
          dueDate: '2025-01-15',
          isPaid: true,
        },
      };

      const result = calculatePaymentStatus(expense);

      expect(result.hasPayments).toBe(true);
      expect(result.totalScheduled).toBe(1000);
      expect(result.totalPaid).toBe(1000);
      expect(result.remainingBalance).toBe(0);
      expect(result.progressPercentage).toBe(100);
      expect(result.isFullyPaid).toBe(true);
      expect(result.nextDuePayment).toBe(null);
    });

    it('should handle expense with payment schedule (mixed paid/unpaid)', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const expense: ExpenseWithPayments = {
        id: '1',
        amount: 1000,
        hasPaymentSchedule: true,
        paymentSchedule: [
          {
            id: 'payment1',
            amount: 300,
            dueDate: yesterday.toISOString(),
            isPaid: false, // overdue
          },
          {
            id: 'payment2',
            amount: 400,
            dueDate: tomorrow.toISOString(),
            isPaid: false, // upcoming
          },
          {
            id: 'payment3',
            amount: 300,
            dueDate: '2025-03-01',
            isPaid: true, // paid
          },
        ],
      };

      const result = calculatePaymentStatus(expense);

      expect(result.hasPayments).toBe(true);
      expect(result.totalScheduled).toBe(1000);
      expect(result.totalPaid).toBe(300);
      expect(result.remainingBalance).toBe(700);
      expect(result.progressPercentage).toBe(30);
      expect(result.isFullyPaid).toBe(false);
      expect(result.allPayments).toHaveLength(3);
      expect(result.overduePayments).toHaveLength(1);
      expect(result.upcomingPayments).toHaveLength(1);
      expect(result.nextDuePayment?.id).toBe('payment1'); // earliest unpaid
    });

    it('should calculate correct progress percentage', () => {
      const expense: ExpenseWithPayments = {
        id: '1',
        amount: 1000,
        hasPaymentSchedule: true,
        paymentSchedule: [
          {
            id: 'payment1',
            amount: 250,
            dueDate: '2025-01-01',
            isPaid: true,
          },
          {
            id: 'payment2',
            amount: 750,
            dueDate: '2025-02-01',
            isPaid: false,
          },
        ],
      };

      const result = calculatePaymentStatus(expense);

      expect(result.progressPercentage).toBe(25); // 250 / 1000 * 100
    });
  });

  describe('getPaymentStatusText', () => {
    it('should return correct text for fully paid', () => {
      const result = {
        isFullyPaid: true,
        overduePayments: [],
        nextDuePayment: null,
        hasPayments: true,
      } as any;

      const status = getPaymentStatusText(result);

      expect(status).toEqual({
        text: 'Fully Paid',
        variant: 'success',
      });
    });

    it('should return correct text for overdue payments', () => {
      const result = {
        isFullyPaid: false,
        overduePayments: [{ id: '1' }, { id: '2' }],
        nextDuePayment: null,
        hasPayments: true,
      } as any;

      const status = getPaymentStatusText(result);

      expect(status).toEqual({
        text: '2 payments overdue',
        variant: 'danger',
      });
    });

    it('should return correct text for next due payment', () => {
      const result = {
        isFullyPaid: false,
        overduePayments: [],
        nextDuePayment: { dueDate: '2025-01-15' },
        hasPayments: true,
      } as any;

      const status = getPaymentStatusText(result);

      expect(status.text).toContain('Next due:');
      expect(status.variant).toBe('warning');
    });
  });

  describe('calculateCategoryPaymentStats', () => {
    it('should calculate stats for multiple expenses', () => {
      const expenses: ExpenseWithPayments[] = [
        {
          id: '1',
          amount: 1000,
          oneOffPayment: {
            id: 'p1',
            amount: 1000,
            dueDate: '2025-12-01',
            isPaid: true,
          },
        },
        {
          id: '2',
          amount: 500,
          oneOffPayment: {
            id: 'p2',
            amount: 500,
            dueDate: '2025-12-01',
            isPaid: false,
          },
        },
      ];

      const stats = calculateCategoryPaymentStats(expenses);

      expect(stats).toEqual({
        totalExpenses: 2,
        fullyPaidExpenses: 1,
        overdueExpenses: 0,
        pendingExpenses: 1,
        totalScheduled: 1500,
        totalPaid: 1000,
        totalRemaining: 500,
        overallProgress: expect.closeTo(66.67, 2),
      });
    });
  });
});
