import type { Entity } from './Entity';

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
  attachments?: string[];
}

export interface AddPaymentDto {
  userId: string;
  eventId: string;
  expenseId: string;
  name: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  dueDate: Date;
  notes?: string;
  attachments?: string[];
}

export interface UpdatePaymentDto {
  name?: string;
  description?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  isPaid?: boolean;
  dueDate?: Date;
  paidDate?: Date;
  notes?: string;
  attachments?: string[];
}

export interface MarkPaymentAsPaidDto {
  paidDate: Date;
  paymentMethod: PaymentMethod;
  notes?: string;
  attachments?: string[];
}
