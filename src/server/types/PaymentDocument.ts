import type { Timestamp } from 'firebase-admin/firestore';

export interface PaymentDocument {
  description: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  dueDate: Timestamp;
  notes: string;
  attachments: string[]; // Array of attachment URLs
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}
