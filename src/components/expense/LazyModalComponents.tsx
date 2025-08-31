'use client';

import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load modal components for better bundle splitting
const AddOrEditExpenseModal = lazy(
  () => import('@/components/modals/AddOrEditExpenseModal'),
);
const PaymentScheduleModal = lazy(
  () => import('@/components/modals/AddPaymentScheduleModal'),
);
const MarkAsPaidModal = lazy(
  () => import('@/components/modals/MarkAsPaidModal'),
);
const ConfirmDialog = lazy(() => import('@/components/modals/ConfirmDialog'));

// Wrapper components with loading states
interface LazyModalWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function LazyModalWrapper({ children, fallback }: LazyModalWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>{children}</Suspense>
  );
}

// Re-export lazy components with proper suspense wrappers
export function LazyAddOrEditExpenseModal(
  props: React.ComponentProps<typeof AddOrEditExpenseModal>,
) {
  return (
    <LazyModalWrapper>
      <AddOrEditExpenseModal {...props} />
    </LazyModalWrapper>
  );
}

export function LazyPaymentScheduleModal(
  props: React.ComponentProps<typeof PaymentScheduleModal>,
) {
  return (
    <LazyModalWrapper>
      <PaymentScheduleModal {...props} />
    </LazyModalWrapper>
  );
}

export function LazyMarkAsPaidModal(
  props: React.ComponentProps<typeof MarkAsPaidModal>,
) {
  return (
    <LazyModalWrapper>
      <MarkAsPaidModal {...props} />
    </LazyModalWrapper>
  );
}

export function LazyConfirmDialog(
  props: React.ComponentProps<typeof ConfirmDialog>,
) {
  return (
    <LazyModalWrapper>
      <ConfirmDialog {...props} />
    </LazyModalWrapper>
  );
}

// For components that need custom loading states
export interface LazyModalComponentsProps {
  loadingFallback?: React.ReactNode;
}

export const LazyModalComponents = {
  AddOrEditExpenseModal: LazyAddOrEditExpenseModal,
  PaymentScheduleModal: LazyPaymentScheduleModal,
  MarkAsPaidModal: LazyMarkAsPaidModal,
  ConfirmDialog: LazyConfirmDialog,
};

export default LazyModalComponents;
