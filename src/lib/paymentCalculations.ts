/**
 * Payment calculation utilities for expenses with payment schedules
 *
 * These utilities provide consistent payment status calculations across
 * expense detail pages, category pages, and other components that need
 * to display payment information.
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
  today.setHours(23, 59, 59, 999); // End of today for comparison

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

/**
 * Calculates payment statistics for a category or event
 */
export function calculateCategoryPaymentStats(expenses: ExpenseWithPayments[]) {
  const results = expenses.map(calculatePaymentStatus);

  const totalExpenses = expenses.length;
  const fullyPaidExpenses = results.filter((r) => r.isFullyPaid).length;
  const overdueExpenses = results.filter(
    (r) => r.overduePayments.length > 0,
  ).length;
  const pendingExpenses = totalExpenses - fullyPaidExpenses;

  const totalScheduled = results.reduce((sum, r) => sum + r.totalScheduled, 0);
  const totalPaid = results.reduce((sum, r) => sum + r.totalPaid, 0);
  const totalRemaining = totalScheduled - totalPaid;

  return {
    totalExpenses,
    fullyPaidExpenses,
    overdueExpenses,
    pendingExpenses,
    totalScheduled,
    totalPaid,
    totalRemaining,
    overallProgress:
      totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0,
  };
}
