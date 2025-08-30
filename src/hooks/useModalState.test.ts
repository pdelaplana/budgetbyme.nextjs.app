import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useModalState } from './useModalState';
import type { Payment } from '@/types/Payment';

const mockPayment: Payment = {
  id: 'payment-1',
  name: 'Test Payment',
  description: 'Test Description',
  amount: 100,
  dueDate: new Date(),
  paid: false,
  _createdDate: new Date(),
};

describe('useModalState', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useModalState());
    
    expect(result.current.state.paymentSchedule).toEqual({
      isOpen: false,
      mode: 'create',
    });
    expect(result.current.state.markAsPaid.isOpen).toBe(false);
    expect(result.current.state.markPaymentAsPaid).toEqual({
      isOpen: false,
      paymentId: null,
      selectedPayment: null,
    });
    expect(result.current.state.editExpense.isOpen).toBe(false);
    expect(result.current.state.actionDropdown.isOpen).toBe(false);
    expect(result.current.state.confirmDialogs).toEqual({
      deletePayments: { isOpen: false, isLoading: false },
      deleteExpense: { isOpen: false, isLoading: false },
    });
  });

  describe('payment schedule modal actions', () => {
    it('should open payment schedule modal with create mode', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openPaymentSchedule('create');
      });
      
      expect(result.current.state.paymentSchedule).toEqual({
        isOpen: true,
        mode: 'create',
      });
    });

    it('should open payment schedule modal with edit mode', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openPaymentSchedule('edit');
      });
      
      expect(result.current.state.paymentSchedule).toEqual({
        isOpen: true,
        mode: 'edit',
      });
    });

    it('should close payment schedule modal', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openPaymentSchedule('create');
      });
      
      expect(result.current.state.paymentSchedule.isOpen).toBe(true);
      
      act(() => {
        result.current.actions.closePaymentSchedule();
      });
      
      expect(result.current.state.paymentSchedule.isOpen).toBe(false);
    });
  });

  describe('mark as paid modal actions', () => {
    it('should open mark as paid modal', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openMarkAsPaid();
      });
      
      expect(result.current.state.markAsPaid.isOpen).toBe(true);
    });

    it('should close mark as paid modal', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openMarkAsPaid();
      });
      
      expect(result.current.state.markAsPaid.isOpen).toBe(true);
      
      act(() => {
        result.current.actions.closeMarkAsPaid();
      });
      
      expect(result.current.state.markAsPaid.isOpen).toBe(false);
    });
  });

  describe('mark payment as paid modal actions', () => {
    it('should open mark payment as paid modal with payment data', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openMarkPaymentAsPaid(mockPayment);
      });
      
      expect(result.current.state.markPaymentAsPaid).toEqual({
        isOpen: true,
        paymentId: 'payment-1',
        selectedPayment: mockPayment,
      });
    });

    it('should close mark payment as paid modal and clear data', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openMarkPaymentAsPaid(mockPayment);
      });
      
      expect(result.current.state.markPaymentAsPaid.isOpen).toBe(true);
      
      act(() => {
        result.current.actions.closeMarkPaymentAsPaid();
      });
      
      expect(result.current.state.markPaymentAsPaid).toEqual({
        isOpen: false,
        paymentId: null,
        selectedPayment: null,
      });
    });
  });

  describe('edit expense modal actions', () => {
    it('should open edit expense modal', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openEditExpense();
      });
      
      expect(result.current.state.editExpense.isOpen).toBe(true);
    });

    it('should close edit expense modal', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openEditExpense();
      });
      
      expect(result.current.state.editExpense.isOpen).toBe(true);
      
      act(() => {
        result.current.actions.closeEditExpense();
      });
      
      expect(result.current.state.editExpense.isOpen).toBe(false);
    });
  });

  describe('action dropdown actions', () => {
    it('should toggle action dropdown', () => {
      const { result } = renderHook(() => useModalState());
      
      expect(result.current.state.actionDropdown.isOpen).toBe(false);
      
      act(() => {
        result.current.actions.toggleActionDropdown();
      });
      
      expect(result.current.state.actionDropdown.isOpen).toBe(true);
      
      act(() => {
        result.current.actions.toggleActionDropdown();
      });
      
      expect(result.current.state.actionDropdown.isOpen).toBe(false);
    });

    it('should close action dropdown', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.toggleActionDropdown();
      });
      
      expect(result.current.state.actionDropdown.isOpen).toBe(true);
      
      act(() => {
        result.current.actions.closeActionDropdown();
      });
      
      expect(result.current.state.actionDropdown.isOpen).toBe(false);
    });
  });

  describe('delete payments confirmation dialog actions', () => {
    it('should open delete payments confirmation', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openDeletePaymentsConfirm();
      });
      
      expect(result.current.state.confirmDialogs.deletePayments.isOpen).toBe(true);
      expect(result.current.state.confirmDialogs.deletePayments.isLoading).toBe(false);
    });

    it('should close delete payments confirmation', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openDeletePaymentsConfirm();
      });
      
      expect(result.current.state.confirmDialogs.deletePayments.isOpen).toBe(true);
      
      act(() => {
        result.current.actions.closeDeletePaymentsConfirm();
      });
      
      expect(result.current.state.confirmDialogs.deletePayments).toEqual({
        isOpen: false,
        isLoading: false,
      });
    });

    it('should set delete payments loading state', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.setDeletePaymentsLoading(true);
      });
      
      expect(result.current.state.confirmDialogs.deletePayments.isLoading).toBe(true);
      
      act(() => {
        result.current.actions.setDeletePaymentsLoading(false);
      });
      
      expect(result.current.state.confirmDialogs.deletePayments.isLoading).toBe(false);
    });
  });

  describe('delete expense confirmation dialog actions', () => {
    it('should open delete expense confirmation', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openDeleteExpenseConfirm();
      });
      
      expect(result.current.state.confirmDialogs.deleteExpense.isOpen).toBe(true);
      expect(result.current.state.confirmDialogs.deleteExpense.isLoading).toBe(false);
    });

    it('should close delete expense confirmation', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.openDeleteExpenseConfirm();
      });
      
      expect(result.current.state.confirmDialogs.deleteExpense.isOpen).toBe(true);
      
      act(() => {
        result.current.actions.closeDeleteExpenseConfirm();
      });
      
      expect(result.current.state.confirmDialogs.deleteExpense).toEqual({
        isOpen: false,
        isLoading: false,
      });
    });

    it('should set delete expense loading state', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.actions.setDeleteExpenseLoading(true);
      });
      
      expect(result.current.state.confirmDialogs.deleteExpense.isLoading).toBe(true);
      
      act(() => {
        result.current.actions.setDeleteExpenseLoading(false);
      });
      
      expect(result.current.state.confirmDialogs.deleteExpense.isLoading).toBe(false);
    });
  });

  describe('multiple modal interactions', () => {
    it('should handle multiple modals being opened and closed independently', () => {
      const { result } = renderHook(() => useModalState());
      
      // Open multiple modals
      act(() => {
        result.current.actions.openPaymentSchedule('create');
        result.current.actions.openMarkAsPaid();
        result.current.actions.toggleActionDropdown();
      });
      
      expect(result.current.state.paymentSchedule.isOpen).toBe(true);
      expect(result.current.state.markAsPaid.isOpen).toBe(true);
      expect(result.current.state.actionDropdown.isOpen).toBe(true);
      
      // Close one modal, others should remain open
      act(() => {
        result.current.actions.closePaymentSchedule();
      });
      
      expect(result.current.state.paymentSchedule.isOpen).toBe(false);
      expect(result.current.state.markAsPaid.isOpen).toBe(true);
      expect(result.current.state.actionDropdown.isOpen).toBe(true);
    });
  });
});