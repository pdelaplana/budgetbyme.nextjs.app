import type { Currency } from './currencies';
import type { Entity } from './Entity';

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
