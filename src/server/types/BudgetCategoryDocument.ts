import type { Timestamp } from 'firebase-admin/firestore';

export interface BudgetCategoryDocument {
  name: string;
  description: string;
  budgettedAmount: number;
  spentAmount: number;
  color: string;
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}
