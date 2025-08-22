import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExpense, type DeleteExpenseDto } from '@/server/actions/expenses/deleteExpense';
import type { Expense } from '@/types/Expense';

interface UseDeleteExpenseMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteExpenseMutation = (options?: UseDeleteExpenseMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deleteExpenseDto: DeleteExpenseDto) => {
      return deleteExpense(deleteExpenseDto);
    },

    onMutate: async (deleteExpenseDto) => {
      const { userId, eventId, expenseId } = deleteExpenseDto;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['expenses', userId, eventId] });
      await queryClient.cancelQueries({ queryKey: ['categories', userId, eventId] });

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses', userId, eventId]);

      // Optimistically remove expense from the list
      if (previousExpenses) {
        const filteredExpenses = previousExpenses.filter(expense => expense.id !== expenseId);
        queryClient.setQueryData<Expense[]>(['expenses', userId, eventId], filteredExpenses);
      }

      // Return a context object with the snapshotted value
      return { previousExpenses };
    },

    onError: (error, { userId, eventId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses', userId, eventId], context.previousExpenses);
      }

      console.error('Failed to delete expense:', error);
      options?.onError?.(error);
    },

    onSuccess: (_, { userId, eventId }) => {
      // Invalidate and refetch expenses and categories (spent amounts will be updated)
      queryClient.invalidateQueries({ queryKey: ['expenses', userId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['categories', userId, eventId] });

      options?.onSuccess?.();
    },
  });
};