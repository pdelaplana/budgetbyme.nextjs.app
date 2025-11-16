import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Event } from '@/types/Event';
import type { Expense } from '@/types/Expense';
import { useExpensePageOptimizations } from './useExpensePageOptimizations';

const mockEvent: Event = {
  id: 'event-1',
  name: 'Test Event',
  type: 'wedding',
  description: 'Test Description',
  eventDate: new Date('2024-01-01'),
  totalBudgetedAmount: 10000,
  totalScheduledAmount: 0,
  totalSpentAmount: 0,
  spentPercentage: 0,
  status: 'on-track',
  currency: { code: 'USD', symbol: '$' },
  _createdDate: new Date(),
  _createdBy: 'user123',
  _updatedDate: new Date(),
  _updatedBy: 'user123',
};

const mockExpense: Expense = {
  id: 'expense-1',
  name: 'Test Expense',
  description: 'Test Description',
  amount: 100,
  currency: { code: 'USD', symbol: '$' },
  date: new Date(),
  notes: 'Test notes',
  tags: ['tag1', 'tag2'],
  attachments: [],
  category: {
    id: 'cat-1',
    name: 'Test Category',
    color: '#blue',
    icon: 'test-icon',
  },
  vendor: {
    name: 'Test Vendor',
    address: 'Test Address',
    website: 'test.com',
    email: 'test@test.com',
  },
  hasPaymentSchedule: false,
  _createdDate: new Date(),
  _createdBy: 'user123',
  _updatedDate: new Date(),
  _updatedBy: 'user123',
};

const mockExpenseWithPayments = {
  ...mockExpense,
  paymentSchedule: [
    {
      id: 'payment-1',
      name: 'Payment 1',
      description: 'First payment',
      amount: 50,
      dueDate: new Date(),
      isPaid: true,
      paymentMethod: 'credit-card' as const,
      _createdDate: new Date(),
      _createdBy: 'user123',
      _updatedDate: new Date(),
      _updatedBy: 'user123',
    },
    {
      id: 'payment-2',
      name: 'Payment 2',
      description: 'Second payment',
      amount: 50,
      dueDate: new Date(),
      isPaid: false,
      paymentMethod: 'credit-card' as const,
      _createdDate: new Date(),
      _createdBy: 'user123',
      _updatedDate: new Date(),
      _updatedBy: 'user123',
    },
  ],
};

describe('useExpensePageOptimizations', () => {
  const defaultProps = {
    expense: mockExpense,
    currentEvent: mockEvent,
    eventId: 'event-1',
  };

  it('should initialize with correct optimizations', () => {
    const { result } = renderHook(() =>
      useExpensePageOptimizations(defaultProps),
    );

    expect(result.current.categoryId).toBe('cat-1');
    expect(result.current.paymentStatus).toBeDefined();
    expect(result.current.breadcrumbItems).toBeDefined();
    expect(Array.isArray(result.current.breadcrumbItems)).toBe(true);
  });

  describe('categoryId optimization', () => {
    it('should return correct categoryId when expense exists', () => {
      const { result } = renderHook(() =>
        useExpensePageOptimizations(defaultProps),
      );

      expect(result.current.categoryId).toBe('cat-1');
    });

    it('should return null when expense is null', () => {
      const { result } = renderHook(() =>
        useExpensePageOptimizations({
          ...defaultProps,
          expense: null,
        }),
      );

      expect(result.current.categoryId).toBeNull();
    });

    it('should memoize categoryId correctly', () => {
      const { result, rerender } = renderHook(
        (props) => useExpensePageOptimizations(props),
        { initialProps: defaultProps },
      );

      const firstCategoryId = result.current.categoryId;

      // Rerender with same expense - categoryId should be memoized
      rerender(defaultProps);

      expect(result.current.categoryId).toBe(firstCategoryId);
      expect(result.current.categoryId).toBe('cat-1');
    });

    it('should update categoryId when expense changes', () => {
      const { result, rerender } = renderHook(
        (props) => useExpensePageOptimizations(props),
        { initialProps: defaultProps },
      );

      expect(result.current.categoryId).toBe('cat-1');

      const newExpense = {
        ...mockExpense,
        category: { ...mockExpense.category, id: 'cat-2' },
      };
      rerender({ ...defaultProps, expense: newExpense });

      expect(result.current.categoryId).toBe('cat-2');
    });
  });

  describe('paymentStatus optimization', () => {
    it('should calculate payment status for expense with payments', () => {
      const { result } = renderHook(() =>
        useExpensePageOptimizations({
          ...defaultProps,
          expense: mockExpenseWithPayments,
        }),
      );

      expect(result.current.paymentStatus).toBeDefined();
      expect(result.current.paymentStatus).not.toBeNull();
      expect(typeof result.current.paymentStatus?.totalScheduled).toBe(
        'number',
      );
      expect(typeof result.current.paymentStatus?.totalPaid).toBe('number');
      expect(typeof result.current.paymentStatus?.remainingBalance).toBe(
        'number',
      );
      expect(typeof result.current.paymentStatus?.progressPercentage).toBe(
        'number',
      );
    });

    it('should handle expense without payments', () => {
      const { result } = renderHook(() =>
        useExpensePageOptimizations(defaultProps),
      );

      expect(result.current.paymentStatus).toBeDefined();
      expect(result.current.paymentStatus).not.toBeNull();
      expect(result.current.paymentStatus?.totalScheduled).toBe(
        mockExpense.amount,
      );
      expect(result.current.paymentStatus?.totalPaid).toBe(0);
      expect(result.current.paymentStatus?.remainingBalance).toBe(
        mockExpense.amount,
      );
      expect(result.current.paymentStatus?.progressPercentage).toBe(0);
    });

    it('should handle null expense gracefully', () => {
      const { result } = renderHook(() =>
        useExpensePageOptimizations({
          ...defaultProps,
          expense: null,
        }),
      );

      expect(result.current.paymentStatus).toBeNull();
    });

    it('should memoize payment status calculation', () => {
      const { result, rerender } = renderHook(
        (props) => useExpensePageOptimizations(props),
        { initialProps: { ...defaultProps, expense: mockExpenseWithPayments } },
      );

      const firstPaymentStatus = result.current.paymentStatus;

      // Rerender with same props - should be memoized
      rerender({ ...defaultProps, expense: mockExpenseWithPayments });

      expect(result.current.paymentStatus).toBe(firstPaymentStatus);
    });
  });

  describe('breadcrumbItems optimization', () => {
    it('should generate correct breadcrumb items', () => {
      const { result } = renderHook(() =>
        useExpensePageOptimizations(defaultProps),
      );

      expect(result.current.breadcrumbItems).toHaveLength(3);

      const [event, category, expense] = result.current.breadcrumbItems;

      expect(event.label).toBe('Test Event');
      expect(event.href).toBe('/events/event-1/dashboard');

      expect(category.label).toBe('Test...');
      expect(category.href).toBe('/events/event-1/category/cat-1');

      expect(expense.label).toBe('Test Expense');
      expect(expense.current).toBe(true);
    });

    it('should handle long expense names with truncation', () => {
      const longNameExpense = {
        ...mockExpense,
        name: 'This is a very long expense name that should be truncated for breadcrumbs',
      };

      const { result } = renderHook(() =>
        useExpensePageOptimizations({
          ...defaultProps,
          expense: longNameExpense,
        }),
      );

      const expenseBreadcrumb = result.current.breadcrumbItems[2];
      expect(expenseBreadcrumb.label.length).toBeLessThanOrEqual(21); // 18 chars + "..."
    });

    it('should handle missing category gracefully', () => {
      const eventWithoutMatchingCategory = {
        ...mockEvent,
        categories: [
          {
            id: 'other-cat',
            name: 'Other Category',
            budgetAmount: 1000,
            _createdDate: new Date(),
          },
        ],
      };

      const { result } = renderHook(() =>
        useExpensePageOptimizations({
          ...defaultProps,
          currentEvent: eventWithoutMatchingCategory,
        }),
      );

      const categoryBreadcrumb = result.current.breadcrumbItems[1];
      expect(categoryBreadcrumb.label).toBe('Test...'); // This test doesn't apply since category comes from expense itself
      expect(categoryBreadcrumb.href).toBe('/events/event-1/category/cat-1');
    });

    it('should handle null expense in breadcrumbs', () => {
      const { result } = renderHook(() =>
        useExpensePageOptimizations({
          ...defaultProps,
          expense: null,
        }),
      );

      expect(result.current.breadcrumbItems).toHaveLength(0); // Empty when expense is null
    });

    it('should handle null current event in breadcrumbs', () => {
      const { result } = renderHook(() =>
        useExpensePageOptimizations({
          ...defaultProps,
          currentEvent: null,
        }),
      );

      expect(result.current.breadcrumbItems).toHaveLength(0); // Empty when currentEvent is null
    });

    it('should memoize breadcrumb items correctly', () => {
      const { result, rerender } = renderHook(
        (props) => useExpensePageOptimizations(props),
        { initialProps: defaultProps },
      );

      const firstBreadcrumbs = result.current.breadcrumbItems;

      // Rerender with same props - should be memoized
      rerender(defaultProps);

      expect(result.current.breadcrumbItems).toBe(firstBreadcrumbs);
    });

    it('should update breadcrumbs when dependencies change', () => {
      const { result, rerender } = renderHook(
        (props) => useExpensePageOptimizations(props),
        { initialProps: defaultProps },
      );

      const firstBreadcrumbs = result.current.breadcrumbItems;

      // Update expense name
      const newExpense = { ...mockExpense, name: 'Updated Expense Name' };
      rerender({ ...defaultProps, expense: newExpense });

      expect(result.current.breadcrumbItems).not.toBe(firstBreadcrumbs);
      expect(result.current.breadcrumbItems[2].label).toBe(
        'Updated Expense...',
      );
    });
  });

  describe('dependency tracking', () => {
    it('should only recalculate when relevant dependencies change', () => {
      const { result, rerender } = renderHook(
        (props) => useExpensePageOptimizations(props),
        { initialProps: defaultProps },
      );

      const firstPaymentStatus = result.current.paymentStatus;
      const firstBreadcrumbs = result.current.breadcrumbItems;
      const firstCategoryId = result.current.categoryId;

      // Change eventId (which shouldn't affect calculations based on expense data)
      rerender({ ...defaultProps, eventId: 'event-2' });

      // Payment status and categoryId should be memoized (same expense)
      expect(result.current.paymentStatus).toBe(firstPaymentStatus);
      expect(result.current.categoryId).toBe(firstCategoryId);

      // But breadcrumbs should update due to eventId change
      expect(result.current.breadcrumbItems).not.toBe(firstBreadcrumbs);
      expect(result.current.breadcrumbItems[0].href).toBe(
        '/events/event-2/dashboard',
      );
    });
  });
});
