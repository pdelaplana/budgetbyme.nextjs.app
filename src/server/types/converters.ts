import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import type { UserWorkspace } from '@/types/UserWorkspace';
import type {
  BudgetCategory,
  BudgetCategoryDocument,
} from '../../types/firestore/BudgetCategory';
import type { Event, EventDocument } from '../../types/firestore/Event';
import type { UserWorkspaceDocument } from './UserWorkspaceDocument';

// Utility functions for converting between Firestore and client types
export const convertTimestamp = (timestamp: Timestamp): Date =>
  timestamp.toDate();

export const convertDate = (date: Date): Timestamp => Timestamp.fromDate(date);

export const workspaceFromFirestore = (
  id: string,
  doc: UserWorkspaceDocument,
): UserWorkspace => {
  return {
    ...doc,
    id: id,
    _createdDate: convertTimestamp(doc._createdDate),
    _updatedDate: convertTimestamp(doc._updatedDate),
  };
};

export const workspaceToFirestore = (
  userWorkspace: UserWorkspace,
): UserWorkspaceDocument => {
  return {
    ...userWorkspace,
    _createdDate: convertDate(userWorkspace._createdDate),
    _updatedDate: convertDate(userWorkspace._updatedDate),
  };
};

// Event converter functions
export const eventFromFirestore = (doc: EventDocument): Event => {
  const eventDate = convertTimestamp(doc.eventDate);
  const _createdDate = convertTimestamp(doc._createdDate);
  const _updatedDate = convertTimestamp(doc._updatedDate);

  const spentPercentage =
    doc.totalBudgetedAmount > 0
      ? (doc.totalSpentAmount / doc.totalBudgetedAmount) * 100
      : 0;

  const remainingAmount = doc.totalBudgetedAmount - doc.totalSpentAmount;
  const isOverBudget = doc.totalSpentAmount > doc.totalBudgetedAmount;
  const daysUntilEvent = Math.ceil(
    (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return {
    ...doc,
    eventDate,
    _createdDate,
    _updatedDate,
    spentPercentage,
    remainingAmount,
    isOverBudget,
    daysUntilEvent,
  };
};

export const eventToFirestore = (
  event: Partial<Event>,
): Partial<EventDocument> => {
  const doc: Record<string, unknown> = { ...event };

  // Convert Date to Timestamp
  if (event.eventDate) {
    doc.eventDate = convertDate(event.eventDate);
  }

  // Add update timestamp
  doc._updatedDate = Timestamp.now();

  // Remove computed properties
  delete doc.spentPercentage;
  delete doc.remainingAmount;
  delete doc.isOverBudget;
  delete doc.daysUntilEvent;

  return doc as Partial<EventDocument>;
};

// Budget category converter functions
export const budgetCategoryFromFirestore = (
  doc: BudgetCategoryDocument,
): BudgetCategory => {
  const _createdDate = convertTimestamp(doc._createdDate);
  const _updatedDate = convertTimestamp(doc._updatedDate);

  const spentPercentage =
    doc.budgetedAmount > 0 ? (doc.spentAmount / doc.budgetedAmount) * 100 : 0;

  const remainingAmount = doc.budgetedAmount - doc.spentAmount;
  const isOverBudget = doc.spentAmount > doc.budgetedAmount;

  return {
    ...doc,
    _createdDate,
    _updatedDate,
    spentPercentage,
    remainingAmount,
    isOverBudget,
  };
};

export const budgetCategoryToFirestore = (
  category: Partial<BudgetCategory>,
): Partial<BudgetCategoryDocument> => {
  const doc: Record<string, unknown> = { ...category };

  // Add update timestamp
  doc._updatedDate = Timestamp.now();

  // Remove computed properties
  delete doc.remainingAmount;
  delete doc.spentPercentage;
  delete doc.isOverBudget;

  return doc as Partial<BudgetCategoryDocument>;
};

// Helper to add entity metadata when creating documents
export const addCreateMetadata = (
  data: Record<string, unknown>,
  userId: string,
): Record<string, unknown> => ({
  ...data,
  _createdDate: Timestamp.now(),
  _updatedDate: Timestamp.now(),
  _createdBy: userId,
});

// Helper to add update metadata
export const addUpdateMetadata = (
  data: Record<string, unknown>,
): Record<string, unknown> => ({
  ...data,
  _updatedDate: Timestamp.now(),
});

// Generic helper to get document data
export const getDocumentData = <T>(
  snapshot: DocumentSnapshot | QueryDocumentSnapshot,
  converter: (data: { id: string; [key: string]: unknown }) => T,
): T | null => {
  if (!snapshot.exists) return null;
  return converter({ id: snapshot.id, ...snapshot.data() });
};
