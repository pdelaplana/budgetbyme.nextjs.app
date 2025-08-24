import type { Timestamp } from 'firebase-admin/firestore';

export interface BudgetCategoryDocument {
  name: string;
  description: string;
  budgetedAmount: number;
  scheduledAmount: number; // Total amount of all expenses in this category (regardless of payment status)
  spentAmount: number; // Total amount actually paid for expenses in this category
  color: string;
  icon: string;
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}
