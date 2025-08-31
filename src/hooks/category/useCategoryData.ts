/**
 * Custom hook for optimized category data management
 * Provides memoized category and expense filtering with performance optimizations
 */

import { useMemo } from 'react';
import type { BudgetCategory } from '@/types/BudgetCategory';
import type { Expense } from '@/types/Expense';

/**
 * Custom hook for managing category data with optimized filtering
 * @param categories - Array of all categories
 * @param expenses - Array of all expenses
 * @param categoryId - The target category ID
 * @returns Optimized category and expense data
 */
export function useCategoryData(
  categories: BudgetCategory[],
  expenses: Expense[],
  categoryId: string,
) {
  // Find the current category (memoized for performance)
  const category = useMemo(
    () => categories.find((cat) => cat.id === categoryId),
    [categories, categoryId],
  );

  // Filter expenses by current category (memoized for performance)
  const categoryExpenses = useMemo(
    () => expenses.filter((expense) => expense.category.id === categoryId),
    [expenses, categoryId],
  );

  // Calculate category statistics (memoized for performance)
  const categoryStats = useMemo(() => {
    const expenseCount = categoryExpenses.length;
    const hasExpenses = expenseCount > 0;

    return {
      expenseCount,
      hasExpenses,
      isEmpty: expenseCount === 0,
    };
  }, [categoryExpenses.length]);

  // Derived state for common checks
  const isFound = category !== undefined;
  const canDelete = categoryStats.isEmpty;

  return {
    category,
    categoryExpenses,
    categoryStats,
    isFound,
    canDelete,
  };
}

/**
 * Custom hook for optimized expense search within a category
 * Useful for filtering expenses by search terms or other criteria
 */
export function useCategoryExpenseSearch(
  expenses: Expense[],
  categoryId: string,
  searchTerm: string = '',
) {
  const categoryExpenses = useMemo(
    () => expenses.filter((expense) => expense.category.id === categoryId),
    [expenses, categoryId],
  );

  const filteredExpenses = useMemo(() => {
    if (!searchTerm.trim()) {
      return categoryExpenses;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return categoryExpenses.filter((expense) => {
      return (
        expense.name?.toLowerCase().includes(lowerSearchTerm) ||
        expense.description?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [categoryExpenses, searchTerm]);

  return {
    categoryExpenses,
    filteredExpenses,
    searchResultCount: filteredExpenses.length,
    hasSearchResults: filteredExpenses.length > 0,
    isSearching: searchTerm.trim().length > 0,
  };
}

/**
 * Custom hook for category expense pagination
 * Useful for large expense lists that need pagination
 */
export function useCategoryExpensePagination(
  expenses: Expense[],
  categoryId: string,
  pageSize: number = 10,
) {
  const categoryExpenses = useMemo(
    () => expenses.filter((expense) => expense.category.id === categoryId),
    [expenses, categoryId],
  );

  const totalCount = categoryExpenses.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getPaginatedExpenses = useMemo(() => {
    return (currentPage: number = 1) => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return categoryExpenses.slice(startIndex, endIndex);
    };
  }, [categoryExpenses, pageSize]);

  return {
    categoryExpenses,
    totalCount,
    totalPages,
    pageSize,
    getPaginatedExpenses,
  };
}

/**
 * Custom hook for category validation states
 * Provides common validation checks for category operations
 */
export function useCategoryValidation(
  category: BudgetCategory | undefined,
  expenses: Expense[],
) {
  const validationState = useMemo(() => {
    const isFound = category !== undefined;
    const expenseCount = expenses.length;
    const canDelete = expenseCount === 0;
    const hasName = category?.name && category.name.trim().length > 0;
    const hasBudget = (category?.budgetedAmount ?? 0) > 0;

    return {
      isFound,
      canDelete,
      hasName: hasName ?? false,
      hasBudget,
      expenseCount,
      isEmpty: expenseCount === 0,
      isValid: isFound && hasName,
    };
  }, [category, expenses.length]);

  return validationState;
}
