import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Navigation helper utilities for consistent routing patterns across the application
 */

/**
 * Navigates to the events list page
 * @param router - Next.js App Router instance
 */
export const navigateToEvents = (router: AppRouterInstance): void => {
  router.push('/events');
};

/**
 * Navigates to a specific event's dashboard page
 * @param router - Next.js App Router instance
 * @param eventId - ID of the event to navigate to
 */
export const navigateToEventDashboard = (
  router: AppRouterInstance,
  eventId: string,
): void => {
  router.push(`/events/${eventId}/dashboard`);
};

/**
 * Navigates to a specific category page within an event
 * @param router - Next.js App Router instance
 * @param eventId - ID of the event
 * @param categoryId - ID of the category to navigate to
 */
export const navigateToCategory = (
  router: AppRouterInstance,
  eventId: string,
  categoryId: string,
): void => {
  router.push(`/events/${eventId}/category/${categoryId}`);
};

/**
 * Navigates to a specific expense page within an event
 * @param router - Next.js App Router instance
 * @param eventId - ID of the event
 * @param expenseId - ID of the expense to navigate to
 */
export const navigateToExpense = (
  router: AppRouterInstance,
  eventId: string,
  expenseId: string,
): void => {
  router.push(`/events/${eventId}/expense/${expenseId}`);
};

/**
 * Navigates back in the browser history
 * @param router - Next.js App Router instance
 */
export const navigateBack = (router: AppRouterInstance): void => {
  router.back();
};

/**
 * Replaces the current route (no history entry)
 * @param router - Next.js App Router instance
 * @param path - Path to replace current route with
 */
export const replaceRoute = (router: AppRouterInstance, path: string): void => {
  router.replace(path);
};
