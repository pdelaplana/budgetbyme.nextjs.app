import type { Timestamp } from 'firebase-admin/firestore';

export interface ExpenseDocument {
  description: string;
  amount: number;
  category: {
    id: string; // Reference to BudgetCategory
    name: string; // Category name for easier access
    color: string; // Category color for UI
  };
  date: Timestamp;
  notes: string;
  attachments: string[]; // Array of attachment URLs
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}
