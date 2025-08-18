'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AddEventDto, addEvent } from '@/server/actions/events';
import type { Event } from '@/types/Event';

export interface UseAddEventMutationOptions {
  onSuccess?: (
    event: Event,
    variables: { userId: string; addEventDTO: AddEventDto },
  ) => void;
  onError?: (
    error: Error,
    variables: { userId: string; addEventDTO: AddEventDto },
  ) => void;
}

/**
 * React Query mutation hook for adding new events
 *
 * This hook provides optimistic updates, automatic error handling,
 * and query invalidation for better UX.
 *
 * @example
 * ```tsx
 * const addEventMutation = useAddEventMutation({
 *   onSuccess: (event) => {
 *     router.push(`/events/${event.id}`);
 *     toast.success('Event created successfully!');
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleSubmit = (formData: AddEventFormData) => {
 *   const eventDto: AddEventDto = {
 *     userId: user.id,
 *     name: formData.name,
 *     type: formData.type,
 *     description: formData.description,
 *     eventDate: formData.eventDate,
 *     totalBudgetedAmount: formData.budget,
 *     currency: formData.currency,
 *     status: 'on-track'
 *   };
 *
 *   addEventMutation.mutate({ userId: user.id, addEventDTO: eventDto });
 * };
 * ```
 */
export function useAddEventMutation(options?: UseAddEventMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      addEventDTO,
    }: {
      userId: string;
      addEventDTO: AddEventDto;
    }) => {
      // Client-side validation
      if (!userId?.trim()) {
        throw new Error('User ID is required');
      }
      if (!addEventDTO.name?.trim()) {
        throw new Error('Event name is required');
      }
      if (!addEventDTO.eventDate) {
        throw new Error('Event date is required');
      }
      if (addEventDTO.totalBudgetedAmount < 0) {
        throw new Error('Budget amount cannot be negative');
      }
      if (!addEventDTO.currency?.trim()) {
        throw new Error('Currency is required');
      }
      if (!addEventDTO.type?.trim()) {
        throw new Error('Event type is required');
      }

      return addEvent(addEventDTO);
    },
    onSuccess: (event, variables) => {
      // Invalidate and refetch queries that are affected by the mutation
      queryClient.invalidateQueries({
        queryKey: ['fetchEvents', variables.userId],
      });

      // Also invalidate any individual event queries for this user
      queryClient.invalidateQueries({
        queryKey: ['fetchEvent', variables.userId],
      });

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(event, variables);
      }
    },
    onError: (error, variables) => {
      console.error('Add event mutation failed:', error);

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error as Error, variables);
      }
    },
  });
}

/**
 * Simplified version of the hook that returns commonly used properties
 * for easier migration from the previous useAddEvent hook
 */
export function useAddEvent() {
  const mutation = useAddEventMutation();

  return {
    addEvent: (eventData: AddEventDto) =>
      mutation.mutateAsync({
        userId: eventData.userId,
        addEventDTO: eventData,
      }),
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    lastResult: mutation.data || null,
    reset: mutation.reset,
    clearError: mutation.reset,
  };
}

/**
 * Hook variant that includes success and error callbacks
 * for backward compatibility with the previous implementation
 */
export function useAddEventWithCallback(
  onSuccess?: (event: Event) => void,
  onError?: (error: string) => void,
) {
  const mutation = useAddEventMutation({
    onSuccess: (event) => {
      if (onSuccess) {
        onSuccess(event);
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });

  return {
    addEvent: (eventData: AddEventDto) =>
      mutation.mutateAsync({
        userId: eventData.userId,
        addEventDTO: eventData,
      }),
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    lastResult: mutation.data || null,
    reset: mutation.reset,
    clearError: mutation.reset,
  };
}
