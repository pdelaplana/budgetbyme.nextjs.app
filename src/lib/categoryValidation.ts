/**
 * Category deletion validation utilities
 * Centralized functions for validating category deletion operations
 */

export interface CategoryDeletionResult {
  canDelete: boolean;
  message: string;
  expenseCount: number;
  suggestedActions: string[];
  confirmButtonText?: string;
}

export interface DeletionCategory {
  id: string;
  name: string;
}

export interface DeletionExpense {
  id: string;
}

/**
 * Validates whether a category can be deleted and provides appropriate messaging
 * @param category - The category to be deleted
 * @param expenses - The expenses associated with the category
 * @returns CategoryDeletionResult with validation details
 */
export function validateCategoryDeletion(
  category: DeletionCategory,
  expenses: DeletionExpense[]
): CategoryDeletionResult {
  const expenseCount = expenses.length;
  const canDelete = expenseCount === 0;

  if (canDelete) {
    return {
      canDelete: true,
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      expenseCount: 0,
      suggestedActions: ['confirm-delete'],
      confirmButtonText: 'Delete',
    };
  }

  const pluralSuffix = expenseCount === 1 ? '' : 's';
  
  return {
    canDelete: false,
    message: `Cannot delete this category because it contains ${expenseCount} expense${pluralSuffix}. Please delete or reassign the expenses first before deleting this category.`,
    expenseCount,
    suggestedActions: ['reassign-expenses', 'delete-expenses'],
    confirmButtonText: undefined, // No confirm button for blocked deletions
  };
}

/**
 * Creates a human-readable message about category deletion restrictions
 * @param expenseCount - Number of expenses in the category
 * @returns Formatted restriction message
 */
export function createDeletionRestrictionMessage(expenseCount: number): string {
  if (expenseCount === 0) {
    return 'This category can be deleted safely.';
  }

  const pluralSuffix = expenseCount === 1 ? '' : 's';
  return `This category contains ${expenseCount} expense${pluralSuffix} and cannot be deleted until they are removed or reassigned.`;
}

/**
 * Gets suggested actions for category deletion based on expense count
 * @param expenseCount - Number of expenses in the category
 * @returns Array of suggested action identifiers
 */
export function getSuggestedDeletionActions(expenseCount: number): string[] {
  if (expenseCount === 0) {
    return ['confirm-delete'];
  }

  return ['reassign-expenses', 'delete-expenses'];
}

/**
 * Determines if category deletion should show a confirmation button
 * @param expenseCount - Number of expenses in the category
 * @returns Whether to show the confirmation button
 */
export function shouldShowDeleteConfirmation(expenseCount: number): boolean {
  return expenseCount === 0;
}

/**
 * Creates a warning message for categories approaching deletion restrictions
 * Useful for preemptive UI warnings
 * @param expenseCount - Number of expenses in the category
 * @returns Warning message or null if no warning needed
 */
export function createDeletionWarning(expenseCount: number): string | null {
  if (expenseCount === 0) {
    return null;
  }

  if (expenseCount === 1) {
    return 'This category has 1 expense. Remove it before deleting the category.';
  }

  return `This category has ${expenseCount} expenses. Remove them before deleting the category.`;
}

/**
 * Validates the required information for category deletion operation
 * @param userId - User ID performing the deletion
 * @param eventId - Event ID containing the category
 * @param categoryId - Category ID to delete
 * @returns Validation result with missing information
 */
export function validateDeletionRequirements(
  userId?: string,
  eventId?: string,
  categoryId?: string
): {
  isValid: boolean;
  missingFields: string[];
  errorMessage?: string;
} {
  const missingFields: string[] = [];

  if (!userId) missingFields.push('userId');
  if (!eventId) missingFields.push('eventId');
  if (!categoryId) missingFields.push('categoryId');

  const isValid = missingFields.length === 0;

  return {
    isValid,
    missingFields,
    errorMessage: isValid 
      ? undefined 
      : `Missing required information: ${missingFields.join(', ')}`,
  };
}