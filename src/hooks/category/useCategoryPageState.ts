'use client';

import { useReducer } from 'react';

// Error state interface
export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorType: 'network' | 'validation' | 'permission' | 'unknown' | null;
  retryCount: number;
  lastRetryAt: number | null;
  canRetry: boolean;
}

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
    isRetrying: boolean;
  };
  errors: {
    categoryLoad: ErrorState;
    categoryUpdate: ErrorState;
    categoryDelete: ErrorState;
    expenseLoad: ErrorState;
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
  | { type: 'SET_RETRYING'; payload: boolean }
  | { type: 'RESET_MODALS' }
  | {
      type: 'SET_ERROR';
      payload: {
        errorKey: keyof CategoryPageState['errors'];
        error: Error;
        errorType?: ErrorState['errorType'];
      };
    }
  | { type: 'CLEAR_ERROR'; payload: keyof CategoryPageState['errors'] }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'RETRY_OPERATION'; payload: keyof CategoryPageState['errors'] };

// Helper function to create initial error state
const createInitialErrorState = (): ErrorState => ({
  hasError: false,
  error: null,
  errorType: null,
  retryCount: 0,
  lastRetryAt: null,
  canRetry: true,
});

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
    isRetrying: false,
  },
  errors: {
    categoryLoad: createInitialErrorState(),
    categoryUpdate: createInitialErrorState(),
    categoryDelete: createInitialErrorState(),
    expenseLoad: createInitialErrorState(),
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

    case 'SET_RETRYING':
      return {
        ...state,
        operations: { ...state.operations, isRetrying: action.payload },
      };

    case 'SET_ERROR': {
      const { errorKey, error, errorType } = action.payload;
      return {
        ...state,
        errors: {
          ...state.errors,
          [errorKey]: {
            hasError: true,
            error,
            errorType: errorType || 'unknown',
            retryCount: state.errors[errorKey].retryCount,
            lastRetryAt: state.errors[errorKey].lastRetryAt,
            canRetry: state.errors[errorKey].retryCount < 3, // Max 3 retries
          },
        },
      };
    }

    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: createInitialErrorState(),
        },
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {
          categoryLoad: createInitialErrorState(),
          categoryUpdate: createInitialErrorState(),
          categoryDelete: createInitialErrorState(),
          expenseLoad: createInitialErrorState(),
        },
      };

    case 'RETRY_OPERATION': {
      const errorKey2 = action.payload;
      const currentError = state.errors[errorKey2];
      return {
        ...state,
        errors: {
          ...state.errors,
          [errorKey2]: {
            ...currentError,
            retryCount: currentError.retryCount + 1,
            lastRetryAt: Date.now(),
            canRetry: currentError.retryCount + 1 < 3, // Max 3 retries
            hasError: false, // Clear error during retry
          },
        },
        operations: {
          ...state.operations,
          isRetrying: true,
        },
      };
    }

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
    setRetrying: (isRetrying: boolean) =>
      dispatch({ type: 'SET_RETRYING', payload: isRetrying }),

    // Error management
    setError: (
      errorKey: keyof CategoryPageState['errors'],
      error: Error,
      errorType?: ErrorState['errorType'],
    ) =>
      dispatch({ type: 'SET_ERROR', payload: { errorKey, error, errorType } }),
    clearError: (errorKey: keyof CategoryPageState['errors']) =>
      dispatch({ type: 'CLEAR_ERROR', payload: errorKey }),
    clearAllErrors: () => dispatch({ type: 'CLEAR_ALL_ERRORS' }),
    retryOperation: (errorKey: keyof CategoryPageState['errors']) =>
      dispatch({ type: 'RETRY_OPERATION', payload: errorKey }),

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

    // Error selectors
    hasAnyError: () =>
      Object.values(state.errors).some((error) => error.hasError),

    getError: (errorKey: keyof CategoryPageState['errors']) =>
      state.errors[errorKey],

    canRetry: (errorKey: keyof CategoryPageState['errors']) =>
      state.errors[errorKey].canRetry && !state.operations.isRetrying,

    getErrorMessage: (errorKey: keyof CategoryPageState['errors']) => {
      const error = state.errors[errorKey];
      if (!error.hasError || !error.error) return null;

      // Return user-friendly messages based on error type
      switch (error.errorType) {
        case 'network':
          return 'Connection error. Please check your internet connection and try again.';
        case 'validation':
          return error.error.message || 'Invalid data provided.';
        case 'permission':
          return "You don't have permission to perform this action.";
        default:
          return error.error.message || 'An unexpected error occurred.';
      }
    },

    isRetryingOperation: (errorKey: keyof CategoryPageState['errors']) =>
      state.operations.isRetrying &&
      state.errors[errorKey].lastRetryAt !== null,
  };

  return {
    state,
    actions,
    selectors,
    dispatch, // For advanced usage if needed
  };
}
