'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchEvent } from '@/server/actions/events';
import { eventConverter } from '@/server/lib/converters/eventConverter';

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
      const { id, document } = await fetchEvent(userId, eventId);
      return eventConverter.fromFirestore(id, document);
    },
    enabled: !!userId && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
