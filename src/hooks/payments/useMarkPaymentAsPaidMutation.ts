import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markPaymentAsPaidInExpense } from '@/server/actions/payments/markPaymentAsPaidInExpense';
import type { MarkPaymentAsPaidDto } from '@/types/Payment';
import type { Event as AppEvent } from '@/types/Event';
import type { BudgetCategory } from '@/types/BudgetCategory';
import type { Expense } from '@/types/Expense';

interface MarkPaymentAsPaidVariables {
  userId: string;
  eventId: string;
  expenseId: string;
  paymentId: string;
  markAsPaidData: MarkPaymentAsPaidDto;
}

interface UseMarkPaymentAsPaidMutationOptions {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
}

export const useMarkPaymentAsPaidMutation = (
  options?: UseMarkPaymentAsPaidMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      eventId,
      expenseId,
      paymentId,
      markAsPaidData,
    }: MarkPaymentAsPaidVariables) =>
      markPaymentAsPaidInExpense(
        userId,
        eventId,
        expenseId,
        paymentId,
        markAsPaidData,
      ),
    onSuccess: (_, variables) => {
      // Invalidate expenses query to update expense data with payment marked as paid
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      // Invalidate categories query to update category spent amounts
      queryClient.invalidateQueries({
        queryKey: ['categories', variables.eventId],
      });

      // Invalidate event query to update event totals
      queryClient.invalidateQueries({
        queryKey: ['event', variables.eventId],
      });

      // Invalidate events list to update event totals in list view
      queryClient.invalidateQueries({
        queryKey: ['fetchEvents', variables.userId],
      });

      options?.onSuccess?.(variables.paymentId);
    },
    onMutate: async (variables) => {
      const { userId, eventId, expenseId, paymentId } = variables;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['expenses', userId, eventId] });
      await queryClient.cancelQueries({ queryKey: ['categories', eventId] });
      await queryClient.cancelQueries({ queryKey: ['fetchEvents', userId] });

      // Snapshot previous values
      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses', userId, eventId]);
      const previousCategories = queryClient.getQueryData<BudgetCategory[]>(['categories', eventId]);
      const previousEvents = queryClient.getQueryData<AppEvent[]>(['fetchEvents', userId]);

      // Calculate amount to add
      let amountToAdd = 0;
      let categoryId = '';

      if (previousExpenses) {
        const expense = previousExpenses.find((e) => e.id === expenseId);
        if (expense) {
            categoryId = expense.category.id;
            const payment = expense.paymentSchedule?.find((p) => p.id === paymentId);
            if (payment) {
                amountToAdd = payment.amount;
            }
        }
      }

      // Optimistically update categories
        if (previousCategories && categoryId && amountToAdd > 0) {
            queryClient.setQueryData<BudgetCategory[]>(['categories', eventId], (old) => {
                if (!old) return [];
                return old.map((cat) => {
                    if (cat.id === categoryId) {
                        return {
                            ...cat,
                            spentAmount: (cat.spentAmount || 0) + amountToAdd,
                        };
                    }
                    return cat;
                });
            });
        }

       // Optimistically update events
       if (previousEvents && amountToAdd > 0) {
        queryClient.setQueryData<AppEvent[]>(['fetchEvents', userId], (old) => {
            if (!old) return [];
            return old.map((evt) => {
                if (evt.id === eventId) {
                    return {
                        ...evt,
                        totalSpentAmount: (evt.totalSpentAmount || 0) + amountToAdd,
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
            queryClient.setQueryData(['expenses', variables.userId, variables.eventId], context.previousExpenses);
        }
        if (context?.previousCategories) {
            queryClient.setQueryData(['categories', variables.eventId], context.previousCategories);
        }
        if (context?.previousEvents) {
            queryClient.setQueryData(['fetchEvents', variables.userId], context.previousEvents);
        }
      options?.onError?.(error);
    },
  });
};
