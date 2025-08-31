import { describe, expect, it } from 'vitest';
import type { DashboardState } from '@/hooks/dashboard/useDashboardState';
import {
  getDashboardUIState,
  getOpenModals,
  hasOpenModal,
  isInEditingMode,
  isModalOpen,
  selectEditing,
  selectModals,
  selectUI,
} from './dashboardStateUtils';

// Mock dashboard state for testing
const createMockState = (
  overrides: Partial<DashboardState> = {},
): DashboardState => ({
  ui: {
    dropdownOpen: false,
  },
  modals: {
    addExpense: false,
    expenseDetail: false,
    addCategory: false,
    editEvent: false,
    recalculate: false,
    deleteEventConfirm: false,
  },
  editing: {
    selectedExpense: null,
    editingCategory: null,
    isEditCategoryMode: false,
    isDeletingEvent: false,
  },
  ...overrides,
});

describe('dashboardStateUtils', () => {
  describe('hasOpenModal', () => {
    it('should return false when no modals are open', () => {
      const state = createMockState();
      expect(hasOpenModal(state)).toBe(false);
    });

    it('should return true when any modal is open', () => {
      const state = createMockState({
        modals: {
          addExpense: true,
          expenseDetail: false,
          addCategory: false,
          editEvent: false,
          recalculate: false,
          deleteEventConfirm: false,
        },
      });
      expect(hasOpenModal(state)).toBe(true);
    });
  });

  describe('getOpenModals', () => {
    it('should return empty array when no modals are open', () => {
      const state = createMockState();
      expect(getOpenModals(state)).toEqual([]);
    });

    it('should return names of open modals', () => {
      const state = createMockState({
        modals: {
          addExpense: true,
          expenseDetail: false,
          addCategory: true,
          editEvent: false,
          recalculate: false,
          deleteEventConfirm: false,
        },
      });
      expect(getOpenModals(state)).toEqual(['addExpense', 'addCategory']);
    });
  });

  describe('isInEditingMode', () => {
    it('should return false when no editing state is active', () => {
      const state = createMockState();
      expect(isInEditingMode(state)).toBe(false);
    });

    it('should return true when selectedExpense is set', () => {
      const state = createMockState({
        editing: {
          selectedExpense: { id: '1', name: 'Test Expense' } as any,
          editingCategory: null,
          isEditCategoryMode: false,
          isDeletingEvent: false,
        },
      });
      expect(isInEditingMode(state)).toBe(true);
    });

    it('should return true when editingCategory is set', () => {
      const state = createMockState({
        editing: {
          selectedExpense: null,
          editingCategory: { id: '1', name: 'Test Category' } as any,
          isEditCategoryMode: false,
          isDeletingEvent: false,
        },
      });
      expect(isInEditingMode(state)).toBe(true);
    });

    it('should return true when isEditCategoryMode is true', () => {
      const state = createMockState({
        editing: {
          selectedExpense: null,
          editingCategory: null,
          isEditCategoryMode: true,
          isDeletingEvent: false,
        },
      });
      expect(isInEditingMode(state)).toBe(true);
    });

    it('should return true when isDeletingEvent is true', () => {
      const state = createMockState({
        editing: {
          selectedExpense: null,
          editingCategory: null,
          isEditCategoryMode: false,
          isDeletingEvent: true,
        },
      });
      expect(isInEditingMode(state)).toBe(true);
    });
  });

  describe('getDashboardUIState', () => {
    it('should return correct UI state summary', () => {
      const state = createMockState({
        ui: { dropdownOpen: true },
        modals: {
          addExpense: true,
          expenseDetail: false,
          addCategory: false,
          editEvent: false,
          recalculate: false,
          deleteEventConfirm: false,
        },
        editing: {
          selectedExpense: { id: '1', name: 'Test' } as any,
          editingCategory: null,
          isEditCategoryMode: false,
          isDeletingEvent: false,
        },
      });

      const result = getDashboardUIState(state);

      expect(result.hasDropdownOpen).toBe(true);
      expect(result.hasOpenModal).toBe(true);
      expect(result.openModals).toEqual(['addExpense']);
      expect(result.isEditing).toBe(true);
      expect(result.editingType).toBe('expense');
    });

    it('should handle deleting event state', () => {
      const state = createMockState({
        editing: {
          selectedExpense: null,
          editingCategory: null,
          isEditCategoryMode: false,
          isDeletingEvent: true,
        },
      });

      const result = getDashboardUIState(state);
      expect(result.editingType).toBe('deleting-event');
    });

    it('should handle category editing state', () => {
      const state = createMockState({
        editing: {
          selectedExpense: null,
          editingCategory: { id: '1', name: 'Test' } as any,
          isEditCategoryMode: false,
          isDeletingEvent: false,
        },
      });

      const result = getDashboardUIState(state);
      expect(result.editingType).toBe('category');
    });
  });

  describe('isModalOpen', () => {
    it('should return correct modal state', () => {
      const state = createMockState({
        modals: {
          addExpense: true,
          expenseDetail: false,
          addCategory: false,
          editEvent: false,
          recalculate: false,
          deleteEventConfirm: false,
        },
      });

      expect(isModalOpen(state, 'addExpense')).toBe(true);
      expect(isModalOpen(state, 'expenseDetail')).toBe(false);
    });
  });

  describe('selectors', () => {
    it('should extract correct state slices', () => {
      const state = createMockState({
        ui: { dropdownOpen: true },
        modals: {
          addExpense: true,
          expenseDetail: false,
          addCategory: false,
          editEvent: false,
          recalculate: false,
          deleteEventConfirm: false,
        },
        editing: {
          selectedExpense: null,
          editingCategory: null,
          isEditCategoryMode: true,
          isDeletingEvent: false,
        },
      });

      expect(selectUI(state)).toEqual({ dropdownOpen: true });
      expect(selectModals(state).addExpense).toBe(true);
      expect(selectEditing(state).isEditCategoryMode).toBe(true);
    });
  });
});
