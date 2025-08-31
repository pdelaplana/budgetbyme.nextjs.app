/**
 * Breadcrumb builder utilities
 * Centralized functions for creating consistent breadcrumb navigation
 */

import { HomeIcon } from '@heroicons/react/24/outline';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { truncateForBreadcrumb } from '@/lib/textUtils';

export interface Event {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  name: string;
}

/**
 * Creates breadcrumb items for the category page
 * @param event - The event containing the category
 * @param category - The current category
 * @param eventId - The event ID for URL construction
 * @returns Array of breadcrumb items
 */
export function buildCategoryBreadcrumbs(
  event: Event,
  category: Category,
  eventId: string
): BreadcrumbItem[] {
  return [
    {
      label: truncateForBreadcrumb(event.name, 15),
      href: `/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
    {
      label: truncateForBreadcrumb(category.name, 18),
      current: true,
    },
  ];
}

/**
 * Creates breadcrumb items for the expense page
 * @param event - The event containing the expense
 * @param category - The category containing the expense
 * @param expense - The current expense
 * @param eventId - The event ID for URL construction
 * @returns Array of breadcrumb items
 */
export function buildExpenseBreadcrumbs(
  event: Event,
  category: Category,
  expense: Expense,
  eventId: string
): BreadcrumbItem[] {
  return [
    {
      label: truncateForBreadcrumb(event.name, 12),
      href: `/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
    {
      label: truncateForBreadcrumb(category.name, 15),
      href: `/events/${eventId}/category/${category.id}`,
    },
    {
      label: truncateForBreadcrumb(expense.name, 18),
      current: true,
    },
  ];
}

/**
 * Creates breadcrumb items for the event dashboard
 * @param event - The current event
 * @returns Array of breadcrumb items
 */
export function buildDashboardBreadcrumbs(event: Event): BreadcrumbItem[] {
  return [
    {
      label: truncateForBreadcrumb(event.name, 20),
      current: true,
      icon: HomeIcon,
    },
  ];
}

/**
 * Creates breadcrumb items for nested expense categories
 * Useful for complex navigation hierarchies
 * @param event - The event containing the categories
 * @param categories - Array of categories in hierarchy order (parent to child)
 * @param eventId - The event ID for URL construction
 * @returns Array of breadcrumb items
 */
export function buildNestedCategoryBreadcrumbs(
  event: Event,
  categories: Category[],
  eventId: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: truncateForBreadcrumb(event.name, 12),
      href: `/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
  ];

  // Add each category except the last one as navigable items
  categories.forEach((category, index) => {
    const isLast = index === categories.length - 1;
    const maxLength = isLast ? 18 : 15;

    breadcrumbs.push({
      label: truncateForBreadcrumb(category.name, maxLength),
      href: isLast ? undefined : `/events/${eventId}/category/${category.id}`,
      current: isLast,
    });
  });

  return breadcrumbs;
}

/**
 * Creates breadcrumb items for settings or configuration pages
 * @param event - The event for context
 * @param settingName - The name of the current setting/config page
 * @param eventId - The event ID for URL construction
 * @returns Array of breadcrumb items
 */
export function buildSettingsBreadcrumbs(
  event: Event,
  settingName: string,
  eventId: string
): BreadcrumbItem[] {
  return [
    {
      label: truncateForBreadcrumb(event.name, 12),
      href: `/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
    {
      label: 'Settings',
      href: `/events/${eventId}/settings`,
    },
    {
      label: truncateForBreadcrumb(settingName, 18),
      current: true,
    },
  ];
}

/**
 * Validates breadcrumb data and provides safe defaults
 * @param items - Array of breadcrumb items to validate
 * @returns Validated and sanitized breadcrumb items
 */
export function validateBreadcrumbs(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items
    .filter(item => item.label && item.label.trim().length > 0)
    .map(item => ({
      ...item,
      label: item.label.trim(),
      href: item.current ? undefined : item.href, // Remove href for current items
    }));
}

/**
 * Gets the appropriate truncation length based on breadcrumb position
 * @param position - Position in breadcrumb array (0-based)
 * @param total - Total number of breadcrumb items
 * @returns Recommended truncation length
 */
export function getBreadcrumbTruncationLength(position: number, total: number): number {
  // First item (event) gets shorter length if there are many items
  if (position === 0 && total > 2) {
    return 12;
  }
  
  // Last item (current page) gets the most space
  if (position === total - 1) {
    return 18;
  }
  
  // Middle items get medium space
  return 15;
}

/**
 * Creates a generic breadcrumb item with safe defaults
 * @param label - The display label
 * @param options - Optional configuration
 * @returns BreadcrumbItem with safe defaults
 */
export function createBreadcrumbItem(
  label: string,
  options: {
    href?: string;
    current?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    maxLength?: number;
  } = {}
): BreadcrumbItem {
  const { href, current = false, icon, maxLength = 15 } = options;

  return {
    label: truncateForBreadcrumb(label, maxLength),
    href: current ? undefined : href,
    current,
    icon,
  };
}