import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import type { BudgetCategory } from '@/types/BudgetCategory';
import { CurrencyImplementation } from '@/types/currencies';
import type { Event } from '@/types/Event';
import type { UserWorkspace } from '@/types/UserWorkspace';
import type { BudgetCategoryDocument } from './BudgetCategoryDocument';
import type { EventDocument } from './EventDocument';
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
export const eventFromFirestore = (id: string, doc: EventDocument): Event => {
  const eventDate = convertTimestamp(doc.eventDate);
  const _createdDate = convertTimestamp(doc._createdDate);
  const _updatedDate = convertTimestamp(doc._updatedDate);

  const spentPercentage =
    doc.totalBudgetedAmount > 0
      ? (doc.totalSpentAmount / doc.totalBudgetedAmount) * 100
      : 0;

  // Convert currency code string to Currency object
  const currencyImpl =
    CurrencyImplementation.fromCode(doc.currency) || CurrencyImplementation.USD;

  // Convert CurrencyImplementation to plain object for Next.js serialization
  const currency = {
    code: currencyImpl.code,
    symbol: currencyImpl.symbol,
  };

  return {
    id,
    name: doc.name,
    type: doc.type as Event['type'],
    description: doc.description,
    eventDate,
    totalBudgetedAmount: doc.totalBudgetedAmount,
    totalScheduledAmount: doc.totalScheduledAmount,
    totalSpentAmount: doc.totalSpentAmount,
    spentPercentage,
    status: doc.status as Event['status'],
    currency,
    _createdDate,
    _createdBy: doc._createdBy,
    _updatedDate,
    _updatedBy: doc._updatedBy,
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
  id: string,
  doc: BudgetCategoryDocument,
): BudgetCategory => {
  const _createdDate = convertTimestamp(doc._createdDate);
  const _updatedDate = convertTimestamp(doc._updatedDate);

  const spentPercentage =
    doc.budgetedAmount > 0 ? (doc.spentAmount / doc.budgetedAmount) * 100 : 0;

  const remainingAmount = doc.budgetedAmount - doc.spentAmount;
  const isOverBudget = doc.spentAmount > doc.budgetedAmount;

  return {
    id,
    name: doc.name,
    description: doc.description,
    budgetedAmount: doc.budgetedAmount,
    scheduledAmount: doc.scheduledAmount,
    spentAmount: doc.spentAmount,
    color: doc.color,
    icon: doc.icon,
    _createdDate,
    _createdBy: doc._createdBy,
    _updatedDate,
    _updatedBy: doc._updatedBy,
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
  const data = snapshot.data();
  if (!data) return null;
  return converter({ id: snapshot.id, ...data });
};
