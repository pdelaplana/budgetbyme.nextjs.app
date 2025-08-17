import type { Timestamp } from 'firebase-admin/firestore';

export interface EventDocument {
  name: string;
  type: string;
  description?: string;
  eventDate: Timestamp;
  totalBudgetedAmount: number;
  totalSpentAmount: number;
  status: string;
  currency: string;
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}
