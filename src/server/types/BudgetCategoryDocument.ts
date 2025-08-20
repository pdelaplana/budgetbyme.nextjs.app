import type { Timestamp } from 'firebase-admin/firestore';

export interface BudgetCategoryDocument {
  name: string;
  description: string;
  budgetedAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}
