import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExpense, type UpdateExpenseDto } from '@/server/actions/expenses/updateExpense';
import type { Expense } from '@/types/Expense';
import type { BudgetCategory } from '@/types/BudgetCategory';

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
      await queryClient.cancelQueries({ queryKey: ['categories', eventId] });

      // Snapshot the previous values
      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses', userId, eventId]);
      const previousCategories = queryClient.getQueryData<BudgetCategory[]>(['categories', eventId]);

      // Get current expense data to calculate amount changes
      const currentExpense = previousExpenses?.find(exp => exp.id === expenseId);

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

      // Optimistically update categories list (handle scheduledAmount changes)
      if (previousCategories && currentExpense) {
        const oldAmount = currentExpense.amount;
        const newAmount = updateExpenseDto.amount ?? oldAmount;
        const oldCategoryId = currentExpense.category.id;
        const newCategoryId = updateExpenseDto.categoryId ?? oldCategoryId;

        const updatedCategories = previousCategories.map(category => {
          // If category changed, subtract from old and add to new
          if (oldCategoryId !== newCategoryId) {
            if (category.id === oldCategoryId) {
              // Subtract old amount from old category
              return {
                ...category,
                scheduledAmount: Math.max(0, (category.scheduledAmount || 0) - oldAmount),
              };
            } else if (category.id === newCategoryId) {
              // Add new amount to new category
              return {
                ...category,
                scheduledAmount: (category.scheduledAmount || 0) + newAmount,
              };
            }
          }
          // If same category but amount changed
          else if (category.id === oldCategoryId && oldAmount !== newAmount) {
            const amountDifference = newAmount - oldAmount;
            return {
              ...category,
              scheduledAmount: Math.max(0, (category.scheduledAmount || 0) + amountDifference),
            };
          }
          return category;
        });

        queryClient.setQueryData<BudgetCategory[]>(['categories', eventId], updatedCategories);
      }

      // Return a context object with the snapshotted values
      return { previousExpenses, previousCategories };
    },

    onError: (error, { userId, eventId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses', userId, eventId], context.previousExpenses);
      }
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories', eventId], context.previousCategories);
      }

      console.error('Failed to update expense:', error);
      options?.onError?.(error);
    },

    onSuccess: (expenseId, { userId, eventId }) => {
      // Invalidate and refetch expenses and categories (in case amounts/categories changed)
      queryClient.invalidateQueries({ queryKey: ['expenses', userId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['categories', eventId] });

      options?.onSuccess?.(expenseId);
    },
  });
};