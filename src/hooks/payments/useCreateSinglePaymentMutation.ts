import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSinglePayment } from '@/server/actions/payments/createSinglePayment';
import type { BudgetCategory } from '@/types/BudgetCategory';
import type { Event as AppEvent } from '@/types/Event';
import type { Expense } from '@/types/Expense';
import type { PaymentMethod } from '@/types/Payment';

interface CreateSinglePaymentMutationData {
  userId: string;
  eventId: string;
  expenseId: string;
  name: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidDate: Date;
  notes?: string;
  attachments?: string[];
}

interface UseCreateSinglePaymentMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateSinglePaymentMutation(
  options: UseCreateSinglePaymentMutationOptions = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSinglePaymentMutationData) =>
      createSinglePayment(data),
    onSuccess: (_, variables) => {
      // Invalidate expenses query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      // Invalidate categories query to update category spent amounts
      queryClient.invalidateQueries({
        queryKey: ['categories', variables.eventId],
      });

      // Invalidate events list to update event totals in list view
      queryClient.invalidateQueries({
        queryKey: ['fetchEvents', variables.userId],
      });

      options.onSuccess?.();
    },
    onMutate: async (variables) => {
      const { userId, eventId, expenseId, amount } = variables;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['expenses', userId, eventId],
      });
      await queryClient.cancelQueries({ queryKey: ['categories', eventId] });
      await queryClient.cancelQueries({ queryKey: ['fetchEvents', userId] });

      // Snapshot previous values
      const previousExpenses = queryClient.getQueryData<Expense[]>([
        'expenses',
        userId,
        eventId,
      ]);
      const previousCategories = queryClient.getQueryData<BudgetCategory[]>([
        'categories',
        eventId,
      ]);
      const previousEvents = queryClient.getQueryData<AppEvent[]>([
        'fetchEvents',
        userId,
      ]);

      let categoryId = '';

      if (previousExpenses) {
        const expense = previousExpenses.find((e) => e.id === expenseId);
        if (expense) {
          categoryId = expense.category.id;
        }
      }

      // Optimistically update categories
      if (previousCategories && categoryId) {
        queryClient.setQueryData<BudgetCategory[]>(
          ['categories', eventId],
          (old) => {
            if (!old) return [];
            return old.map((cat) => {
              if (cat.id === categoryId) {
                return {
                  ...cat,
                  spentAmount: (cat.spentAmount || 0) + amount,
                  scheduledAmount: Math.max(
                    0,
                    (cat.scheduledAmount || 0) - amount,
                  ),
                };
              }
              return cat;
            });
          },
        );
      }

      // Optimistically update events
      if (previousEvents) {
        queryClient.setQueryData<AppEvent[]>(['fetchEvents', userId], (old) => {
          if (!old) return [];
          return old.map((evt) => {
            if (evt.id === eventId) {
              return {
                ...evt,
                totalSpentAmount: (evt.totalSpentAmount || 0) + amount,
                totalScheduledAmount: Math.max(
                  0,
                  (evt.totalScheduledAmount || 0) - amount,
                ),
              };
            }
            return evt;
          });
        });
      }

      return { previousExpenses, previousCategories, previousEvents };
    },
    onError: (error, variables, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(
          ['expenses', variables.userId, variables.eventId],
          context.previousExpenses,
        );
      }
      if (context?.previousCategories) {
        queryClient.setQueryData(
          ['categories', variables.eventId],
          context.previousCategories,
        );
      }
      if (context?.previousEvents) {
        queryClient.setQueryData(
          ['fetchEvents', variables.userId],
          context.previousEvents,
        );
      }
      options.onError?.(error);
    },
  });
}
