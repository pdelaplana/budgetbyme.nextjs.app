import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExpense, type UpdateExpenseDto } from '@/server/actions/expenses/updateExpense';
import type { Expense } from '@/types/Expense';

interface UseUpdateExpenseMutationOptions {
  onSuccess?: (expenseId: string) => void;
  onError?: (error: Error) => void;
}

export const useUpdateExpenseMutation = (options?: UseUpdateExpenseMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateExpenseDto: UpdateExpenseDto) => {
      return updateExpense(updateExpenseDto);
    },

    onMutate: async (updateExpenseDto) => {
      const { userId, eventId, expenseId } = updateExpenseDto;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['expenses', userId, eventId] });
      await queryClient.cancelQueries({ queryKey: ['categories', userId, eventId] });

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses', userId, eventId]);

      // Optimistically update expenses list
      if (previousExpenses) {
        const updatedExpenses = previousExpenses.map(expense => {
          if (expense.id === expenseId) {
            return {
              ...expense,
              // Update only the fields that are provided
              ...(updateExpenseDto.name !== undefined && { name: updateExpenseDto.name }),
              ...(updateExpenseDto.description !== undefined && { description: updateExpenseDto.description }),
              ...(updateExpenseDto.amount !== undefined && { amount: updateExpenseDto.amount }),
              ...(updateExpenseDto.currency !== undefined && { currency: updateExpenseDto.currency as any }),
              ...(updateExpenseDto.categoryId !== undefined && {
                category: {
                  id: updateExpenseDto.categoryId,
                  name: updateExpenseDto.categoryName || expense.category.name,
                  color: updateExpenseDto.categoryColor || expense.category.color,
                  icon: updateExpenseDto.categoryIcon || expense.category.icon,
                }
              }),
              ...(updateExpenseDto.vendor !== undefined && {
                vendor: {
                  ...expense.vendor,
                  ...updateExpenseDto.vendor,
                }
              }),
              ...(updateExpenseDto.date !== undefined && { date: updateExpenseDto.date }),
              ...(updateExpenseDto.notes !== undefined && { notes: updateExpenseDto.notes }),
              ...(updateExpenseDto.tags !== undefined && { tags: updateExpenseDto.tags }),
              ...(updateExpenseDto.attachments !== undefined && { attachments: updateExpenseDto.attachments }),
              _updatedDate: new Date(),
              _updatedBy: updateExpenseDto.userId,
            };
          }
          return expense;
        });

        queryClient.setQueryData<Expense[]>(['expenses', userId, eventId], updatedExpenses);
      }

      // Return a context object with the snapshotted value
      return { previousExpenses };
    },

    onError: (error, { userId, eventId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses', userId, eventId], context.previousExpenses);
      }

      console.error('Failed to update expense:', error);
      options?.onError?.(error);
    },

    onSuccess: (expenseId, { userId, eventId }) => {
      // Invalidate and refetch expenses and categories (in case amounts/categories changed)
      queryClient.invalidateQueries({ queryKey: ['expenses', userId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['categories', userId, eventId] });

      options?.onSuccess?.(expenseId);
    },
  });
};