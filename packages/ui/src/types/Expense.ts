/**
 * Minimal, package-local Expense type shapes consumed by presentational
 * components (ExpenseListItem, ExpenseBasicInfo, VendorInformation,
 * ExpenseHeader).
 *
 * This is a structurally-compatible subset of the app's `Expense` in
 * `src/types/Expense.ts` — not imported/re-exported from it — so the
 * package has no runtime coupling to the app's full domain model.
 */

export interface ExpenseCategory {
  name: string;
  color: string;
  id?: string;
  icon?: string;
}

export interface ExpenseVendor {
  name: string;
  address: string;
  website: string;
  email: string;
}

export interface ExpensePaymentScheduleItem {
  id: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  description?: string;
}

export interface Expense {
  id: string;
  name: string;
  description: string;
  amount: number;
  date: Date;
  notes: string;
  category: ExpenseCategory;
  vendor: ExpenseVendor;
  hasPaymentSchedule: boolean;
  paymentSchedule?: ExpensePaymentScheduleItem[];
  oneOffPayment?: ExpensePaymentScheduleItem;
}
