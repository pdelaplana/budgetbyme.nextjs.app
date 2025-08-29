'use client';

import { useReducer } from 'react';

// State interface
export interface CategoryPageState {
  modals: {
    showAddExpense: boolean;
    showAddCategoryModal: boolean;
    showDeleteCategoryConfirm: boolean;
    isEditCategoryMode: boolean;
  };
  operations: {
    isDeletingCategory: boolean;
  };
}

// Action types
export type CategoryPageAction =
  | { type: 'SHOW_ADD_EXPENSE' }
  | { type: 'HIDE_ADD_EXPENSE' }
  | { type: 'SHOW_ADD_CATEGORY_MODAL' }
  | { type: 'HIDE_ADD_CATEGORY_MODAL' }
  | { type: 'SHOW_DELETE_CATEGORY_CONFIRM' }
  | { type: 'HIDE_DELETE_CATEGORY_CONFIRM' }
  | { type: 'SET_EDIT_CATEGORY_MODE'; payload: boolean }
  | { type: 'SET_DELETING_CATEGORY'; payload: boolean }
  | { type: 'RESET_MODALS' };

// Initial state
const initialState: CategoryPageState = {
  modals: {
    showAddExpense: false,
    showAddCategoryModal: false,
    showDeleteCategoryConfirm: false,
    isEditCategoryMode: false,
  },
  operations: {
    isDeletingCategory: false,
  },
};

// Reducer function
function categoryPageReducer(
  state: CategoryPageState,
  action: CategoryPageAction,
): CategoryPageState {
  switch (action.type) {
    case 'SHOW_ADD_EXPENSE':
      return {
        ...state,
        modals: { ...state.modals, showAddExpense: true },
      };

    case 'HIDE_ADD_EXPENSE':
      return {
        ...state,
        modals: { ...state.modals, showAddExpense: false },
      };

    case 'SHOW_ADD_CATEGORY_MODAL':
      return {
        ...state,
        modals: { ...state.modals, showAddCategoryModal: true },
      };

    case 'HIDE_ADD_CATEGORY_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          showAddCategoryModal: false,
          isEditCategoryMode: false, // Reset edit mode when closing modal
        },
      };

    case 'SHOW_DELETE_CATEGORY_CONFIRM':
      return {
        ...state,
        modals: { ...state.modals, showDeleteCategoryConfirm: true },
      };

    case 'HIDE_DELETE_CATEGORY_CONFIRM':
      return {
        ...state,
        modals: { ...state.modals, showDeleteCategoryConfirm: false },
      };

    case 'SET_EDIT_CATEGORY_MODE':
      return {
        ...state,
        modals: {
          ...state.modals,
          isEditCategoryMode: action.payload,
          ...(action.payload && { showAddCategoryModal: true }), // Show modal when entering edit mode
        },
      };

    case 'SET_DELETING_CATEGORY':
      return {
        ...state,
        operations: { ...state.operations, isDeletingCategory: action.payload },
      };

    case 'RESET_MODALS':
      return {
        ...state,
        modals: initialState.modals,
      };

    default:
      return state;
  }
}

// Custom hook
export function useCategoryPageState() {
  const [state, dispatch] = useReducer(categoryPageReducer, initialState);

  // Action creators
  const actions = {
    // Expense modal
    showAddExpense: () => dispatch({ type: 'SHOW_ADD_EXPENSE' }),
    hideAddExpense: () => dispatch({ type: 'HIDE_ADD_EXPENSE' }),

    // Category modal
    showAddCategoryModal: () => dispatch({ type: 'SHOW_ADD_CATEGORY_MODAL' }),
    hideAddCategoryModal: () => dispatch({ type: 'HIDE_ADD_CATEGORY_MODAL' }),

    // Delete confirmation
    showDeleteCategoryConfirm: () =>
      dispatch({ type: 'SHOW_DELETE_CATEGORY_CONFIRM' }),
    hideDeleteCategoryConfirm: () =>
      dispatch({ type: 'HIDE_DELETE_CATEGORY_CONFIRM' }),

    // Edit mode
    setEditCategoryMode: (isEdit: boolean) =>
      dispatch({ type: 'SET_EDIT_CATEGORY_MODE', payload: isEdit }),

    // Operations
    setDeletingCategory: (isDeleting: boolean) =>
      dispatch({ type: 'SET_DELETING_CATEGORY', payload: isDeleting }),

    // Utility actions
    resetModals: () => dispatch({ type: 'RESET_MODALS' }),
  };

  // Convenience getters
  const selectors = {
    isAnyModalOpen: () =>
      state.modals.showAddExpense ||
      state.modals.showAddCategoryModal ||
      state.modals.showDeleteCategoryConfirm,

    isModalOpen: (modalName: keyof CategoryPageState['modals']) =>
      state.modals[modalName],
  };

  return {
    state,
    actions,
    selectors,
    dispatch, // For advanced usage if needed
  };
}
