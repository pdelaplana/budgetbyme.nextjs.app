import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCategoryPageState } from './useCategoryPageState';

describe('useCategoryPageState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useCategoryPageState());

    expect(result.current.state).toEqual({
      errors: {
        categoryDelete: {
          canRetry: true,
          error: null,
          errorType: null,
          hasError: false,
          lastRetryAt: null,
          retryCount: 0,
        },
        categoryLoad: {
          canRetry: true,
          error: null,
          errorType: null,
          hasError: false,
          lastRetryAt: null,
          retryCount: 0,
        },
        categoryUpdate: {
          canRetry: true,
          error: null,
          errorType: null,
          hasError: false,
          lastRetryAt: null,
          retryCount: 0,
        },
        expenseLoad: {
          canRetry: true,
          error: null,
          errorType: null,
          hasError: false,
          lastRetryAt: null,
          retryCount: 0,
        },
      },
      modals: {
        showAddExpense: false,
        showAddCategoryModal: false,
        showDeleteCategoryConfirm: false,
        isEditCategoryMode: false,
      },
      operations: {
        isDeletingCategory: false,
        isRetrying: false,
      },
    });
  });

  describe('expense modal actions', () => {
    it('shows and hides add expense modal', () => {
      const { result } = renderHook(() => useCategoryPageState());

      act(() => {
        result.current.actions.showAddExpense();
      });

      expect(result.current.state.modals.showAddExpense).toBe(true);

      act(() => {
        result.current.actions.hideAddExpense();
      });

      expect(result.current.state.modals.showAddExpense).toBe(false);
    });
  });

  describe('category modal actions', () => {
    it('shows and hides add category modal', () => {
      const { result } = renderHook(() => useCategoryPageState());

      act(() => {
        result.current.actions.showAddCategoryModal();
      });

      expect(result.current.state.modals.showAddCategoryModal).toBe(true);

      act(() => {
        result.current.actions.hideAddCategoryModal();
      });

      expect(result.current.state.modals.showAddCategoryModal).toBe(false);
    });

    it('resets edit mode when hiding category modal', () => {
      const { result } = renderHook(() => useCategoryPageState());

      // Set edit mode first
      act(() => {
        result.current.actions.setEditCategoryMode(true);
      });

      expect(result.current.state.modals.isEditCategoryMode).toBe(true);
      expect(result.current.state.modals.showAddCategoryModal).toBe(true);

      // Hide modal should reset edit mode
      act(() => {
        result.current.actions.hideAddCategoryModal();
      });

      expect(result.current.state.modals.showAddCategoryModal).toBe(false);
      expect(result.current.state.modals.isEditCategoryMode).toBe(false);
    });
  });

  describe('edit category mode', () => {
    it('enters and exits edit category mode', () => {
      const { result } = renderHook(() => useCategoryPageState());

      act(() => {
        result.current.actions.setEditCategoryMode(true);
      });

      expect(result.current.state.modals.isEditCategoryMode).toBe(true);
      expect(result.current.state.modals.showAddCategoryModal).toBe(true);

      act(() => {
        result.current.actions.setEditCategoryMode(false);
      });

      expect(result.current.state.modals.isEditCategoryMode).toBe(false);
    });
  });

  describe('delete confirmation actions', () => {
    it('shows and hides delete confirmation modal', () => {
      const { result } = renderHook(() => useCategoryPageState());

      act(() => {
        result.current.actions.showDeleteCategoryConfirm();
      });

      expect(result.current.state.modals.showDeleteCategoryConfirm).toBe(true);

      act(() => {
        result.current.actions.hideDeleteCategoryConfirm();
      });

      expect(result.current.state.modals.showDeleteCategoryConfirm).toBe(false);
    });
  });

  describe('operation states', () => {
    it('manages deleting category state', () => {
      const { result } = renderHook(() => useCategoryPageState());

      act(() => {
        result.current.actions.setDeletingCategory(true);
      });

      expect(result.current.state.operations.isDeletingCategory).toBe(true);

      act(() => {
        result.current.actions.setDeletingCategory(false);
      });

      expect(result.current.state.operations.isDeletingCategory).toBe(false);
    });
  });

  describe('utility actions', () => {
    it('resets all modals', () => {
      const { result } = renderHook(() => useCategoryPageState());

      // Set some modal states
      act(() => {
        result.current.actions.showAddExpense();
        result.current.actions.showAddCategoryModal();
        result.current.actions.showDeleteCategoryConfirm();
        result.current.actions.setEditCategoryMode(true);
      });

      // Verify modals are open
      expect(result.current.state.modals.showAddExpense).toBe(true);
      expect(result.current.state.modals.showAddCategoryModal).toBe(true);
      expect(result.current.state.modals.showDeleteCategoryConfirm).toBe(true);
      expect(result.current.state.modals.isEditCategoryMode).toBe(true);

      // Reset all modals
      act(() => {
        result.current.actions.resetModals();
      });

      // Verify all modals are closed
      expect(result.current.state.modals).toEqual({
        showAddExpense: false,
        showAddCategoryModal: false,
        showDeleteCategoryConfirm: false,
        isEditCategoryMode: false,
      });
    });
  });

  describe('selectors', () => {
    it('detects if any modal is open', () => {
      const { result } = renderHook(() => useCategoryPageState());

      // Initially no modals open
      expect(result.current.selectors.isAnyModalOpen()).toBe(false);

      // Open one modal
      act(() => {
        result.current.actions.showAddExpense();
      });

      expect(result.current.selectors.isAnyModalOpen()).toBe(true);

      // Close it and open another
      act(() => {
        result.current.actions.hideAddExpense();
        result.current.actions.showDeleteCategoryConfirm();
      });

      expect(result.current.selectors.isAnyModalOpen()).toBe(true);

      // Close all
      act(() => {
        result.current.actions.hideDeleteCategoryConfirm();
      });

      expect(result.current.selectors.isAnyModalOpen()).toBe(false);
    });

    it('checks specific modal state', () => {
      const { result } = renderHook(() => useCategoryPageState());

      expect(result.current.selectors.isModalOpen('showAddExpense')).toBe(
        false,
      );

      act(() => {
        result.current.actions.showAddExpense();
      });

      expect(result.current.selectors.isModalOpen('showAddExpense')).toBe(true);
      expect(result.current.selectors.isModalOpen('showAddCategoryModal')).toBe(
        false,
      );
    });
  });
});
