import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type AddExpenseDto,
  addExpense,
} from '@/server/actions/expenses/addExpense';
import type { BudgetCategory } from '@/types/BudgetCategory';
import type { Expense } from '@/types/Expense';

interface UseAddExpenseMutationOptions {
  onSuccess?: (expenseId: string) => void;
  onError?: (error: Error) => void;
}

export const useAddExpenseMutation = (
  options?: UseAddExpenseMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      eventId: string;
      addExpenseDto: AddExpenseDto;
    }) => {
      const { addExpenseDto } = params;
      return addExpense(addExpenseDto);
    },

    onMutate: async ({ userId, eventId, addExpenseDto }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['expenses', userId, eventId],
      });
      await queryClient.cancelQueries({ queryKey: ['categories', eventId] });

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

      // Optimistically update expenses list
      if (previousExpenses) {
        const optimisticExpense: Expense = {
          id: `temp-${Date.now()}`, // Temporary ID
          name: addExpenseDto.name,
          description: addExpenseDto.description,
          amount: addExpenseDto.amount,
          currency: addExpenseDto.currency as any,
          category: {
            id: addExpenseDto.categoryId,
            name: addExpenseDto.categoryName,
            color: addExpenseDto.categoryColor,
            icon: addExpenseDto.categoryIcon,
          },
          vendor: addExpenseDto.vendor,
          date: addExpenseDto.date,
          notes: addExpenseDto.notes,
          tags: addExpenseDto.tags,
          attachments: addExpenseDto.attachments || [],
          hasPaymentSchedule: false, // Default to false for new expenses
          _createdDate: new Date(),
          _createdBy: addExpenseDto.userId,
          _updatedDate: new Date(),
          _updatedBy: addExpenseDto.userId,
        };

        queryClient.setQueryData<Expense[]>(
          ['expenses', userId, eventId],
          [optimisticExpense, ...previousExpenses],
        );
      }

      // Optimistically update categories list (add to scheduledAmount)
      if (previousCategories) {
        const updatedCategories = previousCategories.map((category) => {
          if (category.id === addExpenseDto.categoryId) {
            return {
              ...category,
              scheduledAmount:
                (category.scheduledAmount || 0) + addExpenseDto.amount,
            };
          }
          return category;
        });

        queryClient.setQueryData<BudgetCategory[]>(
          ['categories', eventId],
          updatedCategories,
        );
      }

      // Return a context object with the snapshotted values
      return { previousExpenses, previousCategories };
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

      console.error('Failed to add expense:', error);
      options?.onError?.(error);
    },

    onSuccess: (expenseId, { userId, eventId }) => {
      // Invalidate and refetch expenses and categories
      queryClient.invalidateQueries({
        queryKey: ['expenses', userId, eventId],
      });
      queryClient.invalidateQueries({ queryKey: ['categories', eventId] });

      options?.onSuccess?.(expenseId);
    },
  });
};
