import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type DeleteExpenseDto,
  deleteExpense,
} from '@/server/actions/expenses/deleteExpense';
import type { BudgetCategory } from '@/types/BudgetCategory';
import type { Event as AppEvent } from '@/types/Event';
import type { Expense } from '@/types/Expense';

interface UseDeleteExpenseMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteExpenseMutation = (
  options?: UseDeleteExpenseMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deleteExpenseDto: DeleteExpenseDto) => {
      return deleteExpense(deleteExpenseDto);
    },

    onMutate: async (deleteExpenseDto) => {
      const { userId, eventId, expenseId } = deleteExpenseDto;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['expenses', userId, eventId],
      });
      await queryClient.cancelQueries({ queryKey: ['categories', eventId] });
      await queryClient.cancelQueries({ queryKey: ['fetchEvents', userId] });

      // Snapshot the previous values
      const previousExpenses = queryClient.getQueryData<Expense[]>([
        'expenses',
        userId,
        eventId,
      ]);
      const previousCategories = queryClient.getQueryData<BudgetCategory[]>([
        'categories',
        eventId,
      ]);

      // Find the expense being deleted to get its amount and category
      const expenseToDelete = previousExpenses?.find(
        (expense) => expense.id === expenseId,
      );

      // Optimistically remove expense from the list
      if (previousExpenses) {
        const filteredExpenses = previousExpenses.filter(
          (expense) => expense.id !== expenseId,
        );
        queryClient.setQueryData<Expense[]>(
          ['expenses', userId, eventId],
          filteredExpenses,
        );
      }

      // Optimistically update categories list (subtract from scheduledAmount)
      if (previousCategories && expenseToDelete) {
        const updatedCategories = previousCategories.map((category) => {
          if (category.id === expenseToDelete.category.id) {
            return {
              ...category,
              scheduledAmount: Math.max(
                0,
                (category.scheduledAmount || 0) - expenseToDelete.amount,
              ),
            };
          }
          return category;
        });

        queryClient.setQueryData<BudgetCategory[]>(
          ['categories', eventId],
          updatedCategories,
        );
      }

      // Optimistically update events list (subtract from totalScheduledAmount)
      const previousEvents = queryClient.getQueryData<AppEvent[]>(['fetchEvents', userId]);
      if (previousEvents && expenseToDelete) {
        const updatedEvents = previousEvents.map((event) => {
          if (event.id === eventId) {
            return {
              ...event,
              totalScheduledAmount: Math.max(0, (event.totalScheduledAmount || 0) - expenseToDelete.amount),
            };
          }
          return event;
        });

        queryClient.setQueryData<AppEvent[]>(['fetchEvents', userId], updatedEvents);
      }

      // Return a context object with the snapshotted values
      return { previousExpenses, previousCategories, previousEvents };
    },

    onError: (error, { userId, eventId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousExpenses) {
        queryClient.setQueryData(
          ['expenses', userId, eventId],
          context.previousExpenses,
        );
      }
      if (context?.previousCategories) {
        queryClient.setQueryData(
          ['categories', eventId],
          context.previousCategories,
        );
      }
      if (context?.previousEvents) {
        queryClient.setQueryData(
          ['fetchEvents', userId],
          context.previousEvents,
        );
      }

      console.error('Failed to delete expense:', error);
      options?.onError?.(error);
    },

    onSuccess: (_, { userId, eventId }) => {
      // Invalidate and refetch expenses and categories (spent amounts will be updated)
      queryClient.invalidateQueries({
        queryKey: ['expenses', userId, eventId],
      });
      queryClient.invalidateQueries({ queryKey: ['categories', eventId] });
      queryClient.invalidateQueries({ queryKey: ['fetchEvents', userId] });

      options?.onSuccess?.();
    },
  });
};
