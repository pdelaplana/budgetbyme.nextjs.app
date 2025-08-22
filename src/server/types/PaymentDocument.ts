import type { Timestamp } from 'firebase-admin/firestore';

export interface PaymentDocument {
  name: string;
  description: string;
  amount: number;
  paymentMethod: string;
  dueDate: Timestamp;
  isPaid: boolean;
  paidDate?: Timestamp; // When payment was actually made
  notes?: string;
  attachments?: string[]; // Array of attachment URLs
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}
