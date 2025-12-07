import { HomeIcon } from '@heroicons/react/24/outline';
import { useCallback, useMemo } from 'react';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { ExpenseWithPayments } from '@/lib/paymentCalculations';
import { calculatePaymentStatus } from '@/lib/paymentCalculations';
import { truncateForBreadcrumb } from '@/lib/textUtils';
import type { Event } from '@/types/Event';
import type { Expense } from '@/types/Expense';

interface UseExpensePageOptimizationsProps {
  expense: Expense | null;
  currentEvent: Event | null;
  eventId: string;
}

export function useExpensePageOptimizations({
  expense,
  currentEvent,
  eventId,
}: UseExpensePageOptimizationsProps) {
  // Memoized payment status calculation - expensive operation
  const paymentStatus = useMemo(() => {
    if (!expense) return null;
    return calculatePaymentStatus(expense as ExpenseWithPayments);
  }, [expense]);

  // Memoized breadcrumb items - involves string operations and truncation
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    if (!expense || !currentEvent) return [];

    return [
      {
        label: truncateForBreadcrumb(currentEvent.name, 15),
        href: `/events/${eventId}/dashboard`,
        icon: HomeIcon,
      },
      {
        label: truncateForBreadcrumb(expense.category.name, 12),
        href: `/events/${eventId}/category/${expense.category.id}`,
      },
      {
        label: truncateForBreadcrumb(expense.name, 18),
        current: true,
      },
    ];
  }, [
    currentEvent?.name,
    expense?.category.name,
    expense?.category.id,
    expense?.name,
    eventId,
    currentEvent,
    expense,
  ]);

  // Memoized category ID for navigation
  const categoryId = useMemo(
    () => expense?.category.id || null,
    [expense?.category.id],
  );

  // Event handler callbacks - prevent unnecessary re-renders of child components
  const handleEdit = useCallback(() => {
    // This will be passed to the modal state actions
    console.log('Edit expense:', expense?.id);
  }, [expense?.id]);

  const handleDelete = useCallback(() => {
    // This will be passed to the modal state actions
    console.log('Delete expense:', expense?.id);
  }, [expense?.id]);

  const handleCreatePaymentSchedule = useCallback(() => {
    // This will be passed to the modal state actions
    console.log('Create payment schedule for:', expense?.id);
  }, [expense?.id]);

  const handleMarkAsPaid = useCallback(() => {
    // This will be passed to the modal state actions
    console.log('Mark as paid:', expense?.id);
  }, [expense?.id]);

  const handleEditSchedule = useCallback(() => {
    // This will be passed to the modal state actions
    console.log('Edit schedule for:', expense?.id);
  }, [expense?.id]);

  const handleDeleteAllPayments = useCallback(() => {
    // This will be passed to the modal state actions
    console.log('Delete all payments for:', expense?.id);
  }, [expense?.id]);

  // Tag management callbacks
  const handleTagAdd = useCallback(() => {
    // This will be connected to tag state actions
    console.log('Add tag to expense:', expense?.id);
  }, [expense?.id]);

  const handleTagDelete = useCallback(
    (tag: string) => {
      // This will be connected to tag state actions
      console.log('Delete tag from expense:', expense?.id, tag);
    },
    [expense?.id],
  );

  const handleTagEdit = useCallback(() => {
    // This will be connected to tag state actions
    console.log('Toggle tag editing for expense:', expense?.id);
  }, [expense?.id]);

  const handleNewTagChange = useCallback(
    (tag: string) => {
      // This will be connected to tag state actions
      console.log('Update new tag for expense:', expense?.id, tag);
    },
    [expense?.id],
  );

  const handleTagKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleTagAdd();
      }
      if (e.key === 'Escape') {
        // Reset and stop editing
        console.log('Reset tag editing for expense:', expense?.id);
      }
    },
    [handleTagAdd, expense?.id],
  );

  // Dropdown management callbacks
  const handleToggleActionDropdown = useCallback(() => {
    console.log('Toggle action dropdown for expense:', expense?.id);
  }, [expense?.id]);

  const handleCloseActionDropdown = useCallback(() => {
    console.log('Close action dropdown for expense:', expense?.id);
  }, [expense?.id]);

  return {
    // Memoized values
    paymentStatus,
    breadcrumbItems,
    categoryId,

    // Event handlers
    handleEdit,
    handleDelete,
    handleCreatePaymentSchedule,
    handleMarkAsPaid,
    handleEditSchedule,
    handleDeleteAllPayments,

    // Tag management handlers
    handleTagAdd,
    handleTagDelete,
    handleTagEdit,
    handleNewTagChange,
    handleTagKeyPress,

    // Dropdown handlers
    handleToggleActionDropdown,
    handleCloseActionDropdown,
  };
}

export type ExpensePageOptimizations = ReturnType<
  typeof useExpensePageOptimizations
>;
