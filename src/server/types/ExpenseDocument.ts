import type { Timestamp } from 'firebase-admin/firestore';
import type { PaymentDocument } from './PaymentDocument';

export interface ExpenseDocument {
  name: string;
  description: string;
  amount: number;
  currency: string;
  category: {
    id: string; // Reference to BudgetCategory
    name: string; // Category name for easier access
    color: string; // Category color for UI
    icon: string; // Category icon for UI
  };
  vendor: {
    name: string;
    address: string;
    website: string;
    email: string;
  };

  date: Timestamp;
  notes: string;
  tags: string[];
  attachments: string[]; // Array of attachment URLs

  hasPaymentSchedule: boolean;
  paymentSchedule?: PaymentDocument[];
  oneOffPayment?: PaymentDocument;

  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}
