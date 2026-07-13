/**
 * Minimal, package-local payment calculation utilities consumed by
 * ExpenseListItem.
 *
 * This is a structurally-compatible subset of the app's
 * `src/lib/paymentCalculations.ts` (`calculatePaymentStatus` and
 * `getPaymentStatusText` only) — not imported/re-exported from it — so the
 * package has no runtime coupling to the app's full payment calculation
 * module. The app keeps its own copy for its other consumers
 * (PaymentScheduleSection, PaymentSummaryCard, useModalState, etc.).
 */

export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  description?: string;
}

export interface PaymentCalculationResult {
  hasPayments: boolean;
  totalScheduled: number;
  totalPaid: number;
  remainingBalance: number;
  progressPercentage: number;
  isFullyPaid: boolean;
  allPayments: Payment[];
  nextDuePayment: Payment | null;
  overduePayments: Payment[];
  upcomingPayments: Payment[];
}

export interface ExpenseWithPayments {
  id: string;
  amount: number;
  hasPaymentSchedule?: boolean;
  paymentSchedule?: Payment[];
  oneOffPayment?: Payment;
}

/**
 * Calculates comprehensive payment status for an expense
 */
export function calculatePaymentStatus(
  expense: ExpenseWithPayments,
): PaymentCalculationResult {
  // Determine if expense has any payments configured
  const hasPayments = Boolean(
    (expense.hasPaymentSchedule && expense.paymentSchedule) ||
      expense.oneOffPayment,
  );

  let totalScheduled = 0;
  let totalPaid = 0;
  let allPayments: Payment[] = [];

  if (
    expense.hasPaymentSchedule &&
    expense.paymentSchedule &&
    expense.paymentSchedule.length > 0
  ) {
    // Multiple payments in schedule
    allPayments = expense.paymentSchedule;
    totalScheduled = expense.paymentSchedule.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    totalPaid = expense.paymentSchedule
      .filter((payment) => payment.isPaid)
      .reduce((sum, payment) => sum + payment.amount, 0);
  } else if (expense.oneOffPayment) {
    // Single payment (hasPaymentSchedule can be true or false)
    allPayments = [expense.oneOffPayment];
    totalScheduled = expense.oneOffPayment.amount;
    totalPaid = expense.oneOffPayment.isPaid ? expense.oneOffPayment.amount : 0;
  } else {
    // No payments configured - use expense amount as scheduled
    totalScheduled = expense.amount;
    totalPaid = 0;
    allPayments = [];
  }

  const remainingBalance = totalScheduled - totalPaid;
  const progressPercentage =
    totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0;
  const isFullyPaid = remainingBalance === 0;

  // Find next due payment (earliest unpaid payment)
  const unpaidPayments = allPayments.filter((p) => !p.isPaid);
  const nextDuePayment =
    unpaidPayments.length > 0
      ? unpaidPayments.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        )[0]
      : null;

  // Categorize payments by due date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today for comparison

  const overduePayments = unpaidPayments.filter(
    (p) => new Date(p.dueDate) < today,
  );

  const upcomingPayments = unpaidPayments.filter(
    (p) => new Date(p.dueDate) >= today,
  );

  return {
    hasPayments,
    totalScheduled,
    totalPaid,
    remainingBalance,
    progressPercentage,
    isFullyPaid,
    allPayments,
    nextDuePayment,
    overduePayments,
    upcomingPayments,
  };
}

/**
 * Gets a human-readable payment status for an expense
 */
export function getPaymentStatusText(result: PaymentCalculationResult): {
  text: string;
  variant: 'success' | 'warning' | 'danger' | 'info';
} {
  if (result.isFullyPaid) {
    return {
      text: 'Fully Paid',
      variant: 'success',
    };
  }

  if (result.overduePayments.length > 0) {
    const overdue = result.overduePayments.length;
    return {
      text: `${overdue} payment${overdue === 1 ? '' : 's'} overdue`,
      variant: 'danger',
    };
  }

  if (result.nextDuePayment) {
    return {
      text: `Next due: ${new Date(result.nextDuePayment.dueDate).toLocaleDateString()}`,
      variant: 'warning',
    };
  }

  if (!result.hasPayments) {
    return {
      text: 'Payment Pending',
      variant: 'info',
    };
  }

  return {
    text: 'No pending payments',
    variant: 'info',
  };
}
