import type { Event } from '@/types/Event';

/**
 * Dashboard state validation utilities for determining component render states
 */

/**
 * Determines if the dashboard should show loading state
 * @param isLoading - Events list loading state
 * @param isEventLoading - Individual event loading state
 * @param currentEvent - Current event object
 * @returns true if loading state should be shown
 */
export const shouldShowLoading = (
  isLoading: boolean,
  isEventLoading: boolean,
  currentEvent: Event | null,
): boolean => {
  // Show loading if events are loading, event is loading, or no current event yet
  return isLoading || isEventLoading || !currentEvent;
};

/**
 * Determines if the dashboard should show error state
 * @param eventError - Error message from event loading
 * @param isLoading - Current loading state
 * @returns true if error state should be shown
 */
export const shouldShowError = (
  eventError: string | null,
  isLoading: boolean,
): boolean => {
  // Show error only if there's an error and we're not currently loading
  return !!eventError && !isLoading;
};

/**
 * Determines if the dashboard should show not found state
 * @param currentEvent - Current event object
 * @param isLoading - Current loading state
 * @param eventsLength - Number of events loaded
 * @returns true if not found state should be shown
 */
export const shouldShowNotFound = (
  currentEvent: Event | null,
  isLoading: boolean,
  eventsLength: number,
): boolean => {
  // Show not found if:
  // - Not currently loading
  // - No current event found
  // - Events have been loaded (eventsLength >= 0 indicates they've been fetched)
  return !isLoading && !currentEvent && eventsLength >= 0;
};
