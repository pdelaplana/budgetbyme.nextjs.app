/**
 * Category data transformation utilities
 * Centralized functions for transforming category data for different UI components
 */

// Base category interface for data transformations
export interface Category {
  id: string;
  name: string;
  description?: string;
  budgetedAmount?: number;
  scheduledAmount?: number;
  spentAmount?: number;
  color?: string;
  icon?: string;
}

// Interface for category data used in modals
export interface CategoryModalData {
  id: string;
  name: string;
  budgetedAmount: number;
  description: string;
  color: string;
  icon: string;
}

// Interface for expense modal category data
export interface ExpenseModalCategoryData {
  id: string;
  name: string;
  description: string;
  budgetedAmount: number;
  scheduledAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
  _createdDate: Date;
  _createdBy: string;
  _updatedDate: Date;
  _updatedBy: string;
  // Computed properties
  spentPercentage: number;
  remainingAmount: number;
  isOverBudget: boolean;
}

/**
 * Transforms a category for use in the AddOrEditCategoryModal
 * Provides safe defaults for all required fields
 */
export function transformCategoryForModal(
  category: Category,
): CategoryModalData {
  return {
    id: category.id || '',
    name: category.name || '',
    budgetedAmount: category.budgetedAmount ?? 0,
    description: category.description || '',
    color: category.color || '#059669',
    icon: category.icon || '🎉',
  };
}

/**
 * Transforms a category for use in the AddOrEditExpenseModal
 * Includes additional metadata fields required by the expense modal
 */
export function transformCategoryForExpenseModal(
  category: Category,
): ExpenseModalCategoryData {
  const budgetedAmount = category.budgetedAmount ?? 0;
  const spentAmount = category.spentAmount ?? 0;
  const spentPercentage =
    budgetedAmount > 0 ? (spentAmount / budgetedAmount) * 100 : 0;
  const remainingAmount = budgetedAmount - spentAmount;
  const isOverBudget = spentAmount > budgetedAmount;

  return {
    id: category.id,
    name: category.name,
    description: category.description || '',
    budgetedAmount,
    scheduledAmount: category.scheduledAmount ?? 0,
    spentAmount,
    color: category.color || '#059669',
    icon: category.icon || '🎉',
    _createdDate: new Date(),
    _createdBy: '',
    _updatedDate: new Date(),
    _updatedBy: '',
    // Computed properties
    spentPercentage,
    remainingAmount,
    isOverBudget,
  };
}

/**
 * Validates category data for form submission
 * Returns validation result with error messages
 */
export interface ValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    budgetedAmount?: string;
    color?: string;
  };
}

export function validateCategoryData(
  data: Partial<CategoryModalData>,
): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Category name is required';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Category name must be 100 characters or less';
  }

  // Validate budgeted amount
  if (data.budgetedAmount !== undefined) {
    if (data.budgetedAmount < 0) {
      errors.budgetedAmount = 'Budgeted amount cannot be negative';
    } else if (data.budgetedAmount > 1000000) {
      errors.budgetedAmount = 'Budgeted amount cannot exceed $1,000,000';
    }
  }

  // Validate color format (basic hex validation)
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.color = 'Color must be a valid hex color (e.g., #059669)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Creates a safe category object with default values
 * Useful for initializing new categories or handling undefined categories
 */
export function createDefaultCategory(
  overrides: Partial<Category> = {},
): Category {
  return {
    id: '',
    name: '',
    description: '',
    budgetedAmount: 0,
    scheduledAmount: 0,
    spentAmount: 0,
    color: '#059669',
    icon: '🎉',
    ...overrides,
  };
}

/**
 * Calculates the remaining budget for a category
 * Returns the difference between budgeted amount and spent amount
 */
export function calculateRemainingBudget(category: Category): number {
  const budgeted = category.budgetedAmount ?? 0;
  const spent = category.spentAmount ?? 0;
  return Math.max(0, budgeted - spent);
}

/**
 * Calculates the budget utilization percentage
 * Returns a value between 0 and 100 (can exceed 100 if over budget)
 */
export function calculateBudgetUtilization(category: Category): number {
  const budgeted = category.budgetedAmount ?? 0;
  const spent = category.spentAmount ?? 0;

  if (budgeted === 0) return 0;
  return Math.round((spent / budgeted) * 100);
}

/**
 * Determines if a category is over budget
 */
export function isCategoryOverBudget(category: Category): boolean {
  const budgeted = category.budgetedAmount ?? 0;
  const spent = category.spentAmount ?? 0;
  return spent > budgeted;
}
