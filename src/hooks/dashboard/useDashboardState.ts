import { useReducer } from 'react';
import type { BudgetCategory } from '@/types/BudgetCategory';

// ExpenseDetail interface to match ExpenseDetailModal expectations
export interface ExpenseDetail {
  id: string;
  name: string;
  amount: number;
  category: string;
  categoryColor: string;
  date: string;
  description?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  isPaid?: boolean;
  paidDate?: string;
  paymentMethod?: string;
  dueDate?: string;
}

// Dashboard state interfaces
export interface DashboardState {
  ui: {
    dropdownOpen: boolean;
  };
  modals: {
    addExpense: boolean;
    expenseDetail: boolean;
    addCategory: boolean;
    editEvent: boolean;
    recalculate: boolean;
    deleteEventConfirm: boolean;
  };
  editing: {
    selectedExpense: ExpenseDetail | null;
    editingCategory: BudgetCategory | null;
    isEditCategoryMode: boolean;
    isDeletingEvent: boolean;
  };
}

export type DashboardAction =
  | { type: 'TOGGLE_DROPDOWN' }
  | { type: 'CLOSE_DROPDOWN' }
  | { type: 'OPEN_MODAL'; modal: keyof DashboardState['modals'] }
  | { type: 'CLOSE_MODAL'; modal: keyof DashboardState['modals'] }
  | { type: 'SET_SELECTED_EXPENSE'; expense: ExpenseDetail | null }
  | {
      type: 'SET_EDITING_CATEGORY';
      category: BudgetCategory | null;
      isEditMode: boolean;
    }
  | { type: 'SET_DELETING_EVENT'; isDeleting: boolean }
  | { type: 'RESET_EDITING_STATE' };

const initialDashboardState: DashboardState = {
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
};

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case 'TOGGLE_DROPDOWN':
      return {
        ...state,
        ui: { ...state.ui, dropdownOpen: !state.ui.dropdownOpen },
      };
    case 'CLOSE_DROPDOWN':
      return {
        ...state,
        ui: { ...state.ui, dropdownOpen: false },
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.modal]: true },
        ui: { ...state.ui, dropdownOpen: false },
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.modal]: false },
      };
    case 'SET_SELECTED_EXPENSE':
      return {
        ...state,
        editing: { ...state.editing, selectedExpense: action.expense },
      };
    case 'SET_EDITING_CATEGORY':
      return {
        ...state,
        editing: {
          ...state.editing,
          editingCategory: action.category,
          isEditCategoryMode: action.isEditMode,
        },
      };
    case 'SET_DELETING_EVENT':
      return {
        ...state,
        editing: { ...state.editing, isDeletingEvent: action.isDeleting },
      };
    case 'RESET_EDITING_STATE':
      return {
        ...state,
        editing: {
          selectedExpense: null,
          editingCategory: null,
          isEditCategoryMode: false,
          isDeletingEvent: false,
        },
      };
    default:
      return state;
  }
}

export function useDashboardState() {
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  return {
    state,
    dispatch,
  };
}
