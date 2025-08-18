'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchEvent } from '@/server/actions/events';

/**
 * React Query hook for fetching a single event by ID
 *
 * @example
 * ```tsx
 * const { data: event, isLoading, error } = useFetchEvent(userId, eventId);
 * ```
 */
export function useFetchEvent(userId: string, eventId: string) {
  return useQuery({
    queryKey: ['fetchEvent', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) return Promise.resolve(null);
      return await fetchEvent(userId, eventId);
    },
    enabled: !!userId && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
