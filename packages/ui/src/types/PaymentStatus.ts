/**
 * Minimal payment status shape consumed by presentational components
 * (e.g. PaymentSummaryCard). Structurally compatible with, but not
 * imported from, the app's `PaymentStatus` in `src/lib/paymentCalculations.ts`.
 */
export interface PaymentStatus {
  totalScheduled: number;
  totalPaid: number;
  remainingBalance: number;
}
