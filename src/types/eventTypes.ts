import type { Currency } from './currencies';
import type { Entity } from './Entity';

export type EventType =
  | 'wedding'
  | 'graduation'
  | 'birthday'
  | 'anniversary'
  | 'baby-shower'
  | 'retirement'
  | 'other';

export type EventStatus =
  | 'on-track'
  | 'over-budget'
  | 'under-budget'
  | 'completed';

export interface Event extends Entity {
  id: string;
  name: string;
  type: EventType;
  description?: string;
  eventDate: string;
  totalBudgetedAmount: number;
  totalSpentAmount: number;
  spentPercentage: number;
  status: EventStatus;
}

export interface Budget extends Entity {
  name: string;
  budgetedAmount: number;
  spentAmount: number;
  color: string;
}

export interface Expense extends Entity {
  name: string;
  description: string;
  budget: { id: string; name: string; color: string };
  date: Date;
  tags: string[];
  amount: number;
  currency: Currency;

  vendor: { name: string; address: string; website: string };

  hasPaymentSchedule: true;
  paymentSchedule: Payment[];
  oneOffPayment?: Payment;
}

export type PaymentMethod =
  | 'credit-card'
  | 'debit-card'
  | 'paypal'
  | 'bank-transfer'
  | 'cash';

export interface Payment extends Entity {
  name: string;
  description: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  paidDate?: Date;
  paymentMethod: PaymentMethod;
  notes?: string;
  attachmentUrls?: string[];
}
