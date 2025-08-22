import type { Currency } from './currencies';
import type { Entity } from './Entity';
import type { Payment } from './Payment';

export interface Expense extends Entity {
  name: string;
  description: string;
  amount: number;
  currency: Currency;

  date: Date;
  notes: string;
  tags: string[];
  attachments: string[];

  category: { id: string; name: string; color: string; icon: string };
  vendor: { name: string; address: string; website: string; email: string };

  hasPaymentSchedule: boolean;
  paymentSchedule?: Payment[];
  oneOffPayment?: Payment;
}
