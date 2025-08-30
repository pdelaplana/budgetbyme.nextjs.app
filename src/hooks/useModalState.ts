import { useReducer, useCallback } from 'react';
import type { Payment } from '@/types/Payment';

// Modal state interfaces
export interface PaymentScheduleModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
}

export interface MarkAsPaidModalState {
  isOpen: boolean;
  paymentId?: string | null;
  selectedPayment?: Payment | null;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  isLoading: boolean;
}

export interface AttachmentDeleteState extends ConfirmDialogState {
  attachmentUrl: string | null;
}

export interface ModalState {
  paymentSchedule: PaymentScheduleModalState;
  markAsPaid: MarkAsPaidModalState;
  markPaymentAsPaid: MarkAsPaidModalState;
  editExpense: { isOpen: boolean };
  actionDropdown: { isOpen: boolean };
  confirmDialogs: {
    deletePayments: ConfirmDialogState;
    deleteExpense: ConfirmDialogState;
    deleteAttachment: AttachmentDeleteState;
  };
}

// Action types
type ModalAction =
  // Payment Schedule Modal
  | { type: 'OPEN_PAYMENT_SCHEDULE'; mode: 'create' | 'edit' }
  | { type: 'CLOSE_PAYMENT_SCHEDULE' }
  
  // Mark as Paid Modals
  | { type: 'OPEN_MARK_AS_PAID' }
  | { type: 'CLOSE_MARK_AS_PAID' }
  | { type: 'OPEN_MARK_PAYMENT_AS_PAID'; payment: Payment }
  | { type: 'CLOSE_MARK_PAYMENT_AS_PAID' }
  
  // Edit Expense Modal
  | { type: 'OPEN_EDIT_EXPENSE' }
  | { type: 'CLOSE_EDIT_EXPENSE' }
  
  // Action Dropdown
  | { type: 'TOGGLE_ACTION_DROPDOWN' }
  | { type: 'CLOSE_ACTION_DROPDOWN' }
  
  // Confirm Dialogs
  | { type: 'OPEN_DELETE_PAYMENTS_CONFIRM' }
  | { type: 'CLOSE_DELETE_PAYMENTS_CONFIRM' }
  | { type: 'SET_DELETE_PAYMENTS_LOADING'; isLoading: boolean }
  
  | { type: 'OPEN_DELETE_EXPENSE_CONFIRM' }
  | { type: 'CLOSE_DELETE_EXPENSE_CONFIRM' }
  | { type: 'SET_DELETE_EXPENSE_LOADING'; isLoading: boolean }
  
  | { type: 'OPEN_DELETE_ATTACHMENT_CONFIRM'; attachmentUrl: string }
  | { type: 'CLOSE_DELETE_ATTACHMENT_CONFIRM' }
  | { type: 'SET_DELETE_ATTACHMENT_LOADING'; isLoading: boolean };

// Initial state
const initialState: ModalState = {
  paymentSchedule: {
    isOpen: false,
    mode: 'create',
  },
  markAsPaid: {
    isOpen: false,
    paymentId: null,
    selectedPayment: null,
  },
  markPaymentAsPaid: {
    isOpen: false,
    paymentId: null,
    selectedPayment: null,
  },
  editExpense: {
    isOpen: false,
  },
  actionDropdown: {
    isOpen: false,
  },
  confirmDialogs: {
    deletePayments: {
      isOpen: false,
      isLoading: false,
    },
    deleteExpense: {
      isOpen: false,
      isLoading: false,
    },
    deleteAttachment: {
      isOpen: false,
      isLoading: false,
      attachmentUrl: null,
    },
  },
};

// Reducer function
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    // Payment Schedule Modal
    case 'OPEN_PAYMENT_SCHEDULE':
      return {
        ...state,
        paymentSchedule: {
          isOpen: true,
          mode: action.mode,
        },
      };
    case 'CLOSE_PAYMENT_SCHEDULE':
      return {
        ...state,
        paymentSchedule: {
          ...state.paymentSchedule,
          isOpen: false,
        },
      };

    // Mark as Paid Modal (Full Expense)
    case 'OPEN_MARK_AS_PAID':
      return {
        ...state,
        markAsPaid: {
          isOpen: true,
          paymentId: null,
          selectedPayment: null,
        },
      };
    case 'CLOSE_MARK_AS_PAID':
      return {
        ...state,
        markAsPaid: {
          isOpen: false,
          paymentId: null,
          selectedPayment: null,
        },
      };

    // Mark Payment as Paid Modal (Individual Payment)
    case 'OPEN_MARK_PAYMENT_AS_PAID':
      return {
        ...state,
        markPaymentAsPaid: {
          isOpen: true,
          paymentId: action.payment.id,
          selectedPayment: action.payment,
        },
      };
    case 'CLOSE_MARK_PAYMENT_AS_PAID':
      return {
        ...state,
        markPaymentAsPaid: {
          isOpen: false,
          paymentId: null,
          selectedPayment: null,
        },
      };

    // Edit Expense Modal
    case 'OPEN_EDIT_EXPENSE':
      return {
        ...state,
        editExpense: {
          isOpen: true,
        },
        actionDropdown: {
          isOpen: false, // Close dropdown when opening edit
        },
      };
    case 'CLOSE_EDIT_EXPENSE':
      return {
        ...state,
        editExpense: {
          isOpen: false,
        },
      };

    // Action Dropdown
    case 'TOGGLE_ACTION_DROPDOWN':
      return {
        ...state,
        actionDropdown: {
          isOpen: !state.actionDropdown.isOpen,
        },
      };
    case 'CLOSE_ACTION_DROPDOWN':
      return {
        ...state,
        actionDropdown: {
          isOpen: false,
        },
      };

    // Delete Payments Confirmation
    case 'OPEN_DELETE_PAYMENTS_CONFIRM':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deletePayments: {
            isOpen: true,
            isLoading: false,
          },
        },
        actionDropdown: {
          isOpen: false, // Close dropdown
        },
      };
    case 'CLOSE_DELETE_PAYMENTS_CONFIRM':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deletePayments: {
            isOpen: false,
            isLoading: false,
          },
        },
      };
    case 'SET_DELETE_PAYMENTS_LOADING':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deletePayments: {
            ...state.confirmDialogs.deletePayments,
            isLoading: action.isLoading,
          },
        },
      };

    // Delete Expense Confirmation
    case 'OPEN_DELETE_EXPENSE_CONFIRM':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deleteExpense: {
            isOpen: true,
            isLoading: false,
          },
        },
        actionDropdown: {
          isOpen: false, // Close dropdown
        },
      };
    case 'CLOSE_DELETE_EXPENSE_CONFIRM':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deleteExpense: {
            isOpen: false,
            isLoading: false,
          },
        },
      };
    case 'SET_DELETE_EXPENSE_LOADING':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deleteExpense: {
            ...state.confirmDialogs.deleteExpense,
            isLoading: action.isLoading,
          },
        },
      };

    // Delete Attachment Confirmation
    case 'OPEN_DELETE_ATTACHMENT_CONFIRM':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deleteAttachment: {
            isOpen: true,
            isLoading: false,
            attachmentUrl: action.attachmentUrl,
          },
        },
      };
    case 'CLOSE_DELETE_ATTACHMENT_CONFIRM':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deleteAttachment: {
            isOpen: false,
            isLoading: false,
            attachmentUrl: null,
          },
        },
      };
    case 'SET_DELETE_ATTACHMENT_LOADING':
      return {
        ...state,
        confirmDialogs: {
          ...state.confirmDialogs,
          deleteAttachment: {
            ...state.confirmDialogs.deleteAttachment,
            isLoading: action.isLoading,
          },
        },
      };

    default:
      return state;
  }
}

// Custom hook
export function useModalState() {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  // Action creators wrapped in useCallback for performance
  const actions = {
    // Payment Schedule
    openPaymentSchedule: useCallback((mode: 'create' | 'edit' = 'create') => {
      dispatch({ type: 'OPEN_PAYMENT_SCHEDULE', mode });
    }, []),
    closePaymentSchedule: useCallback(() => {
      dispatch({ type: 'CLOSE_PAYMENT_SCHEDULE' });
    }, []),

    // Mark as Paid (Full Expense)
    openMarkAsPaid: useCallback(() => {
      dispatch({ type: 'OPEN_MARK_AS_PAID' });
    }, []),
    closeMarkAsPaid: useCallback(() => {
      dispatch({ type: 'CLOSE_MARK_AS_PAID' });
    }, []),

    // Mark Payment as Paid (Individual Payment)
    openMarkPaymentAsPaid: useCallback((payment: Payment) => {
      dispatch({ type: 'OPEN_MARK_PAYMENT_AS_PAID', payment });
    }, []),
    closeMarkPaymentAsPaid: useCallback(() => {
      dispatch({ type: 'CLOSE_MARK_PAYMENT_AS_PAID' });
    }, []),

    // Edit Expense
    openEditExpense: useCallback(() => {
      dispatch({ type: 'OPEN_EDIT_EXPENSE' });
    }, []),
    closeEditExpense: useCallback(() => {
      dispatch({ type: 'CLOSE_EDIT_EXPENSE' });
    }, []),

    // Action Dropdown
    toggleActionDropdown: useCallback(() => {
      dispatch({ type: 'TOGGLE_ACTION_DROPDOWN' });
    }, []),
    closeActionDropdown: useCallback(() => {
      dispatch({ type: 'CLOSE_ACTION_DROPDOWN' });
    }, []),

    // Confirm Dialogs
    openDeletePaymentsConfirm: useCallback(() => {
      dispatch({ type: 'OPEN_DELETE_PAYMENTS_CONFIRM' });
    }, []),
    closeDeletePaymentsConfirm: useCallback(() => {
      dispatch({ type: 'CLOSE_DELETE_PAYMENTS_CONFIRM' });
    }, []),
    setDeletePaymentsLoading: useCallback((isLoading: boolean) => {
      dispatch({ type: 'SET_DELETE_PAYMENTS_LOADING', isLoading });
    }, []),

    openDeleteExpenseConfirm: useCallback(() => {
      dispatch({ type: 'OPEN_DELETE_EXPENSE_CONFIRM' });
    }, []),
    closeDeleteExpenseConfirm: useCallback(() => {
      dispatch({ type: 'CLOSE_DELETE_EXPENSE_CONFIRM' });
    }, []),
    setDeleteExpenseLoading: useCallback((isLoading: boolean) => {
      dispatch({ type: 'SET_DELETE_EXPENSE_LOADING', isLoading });
    }, []),

    openDeleteAttachmentConfirm: useCallback((attachmentUrl: string) => {
      dispatch({ type: 'OPEN_DELETE_ATTACHMENT_CONFIRM', attachmentUrl });
    }, []),
    closeDeleteAttachmentConfirm: useCallback(() => {
      dispatch({ type: 'CLOSE_DELETE_ATTACHMENT_CONFIRM' });
    }, []),
    setDeleteAttachmentLoading: useCallback((isLoading: boolean) => {
      dispatch({ type: 'SET_DELETE_ATTACHMENT_LOADING', isLoading });
    }, []),
  };

  return {
    state,
    actions,
  };
}

// Export types for use in components
export type ModalActions = ReturnType<typeof useModalState>['actions'];