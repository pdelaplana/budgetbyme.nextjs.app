import type { Timestamp } from 'firebase/firestore';
import type {
  ClientEntity,
  CreateEntityData,
  FirestoreEntity,
  UpdateEntityData,
} from './common';

// Event types
export type EventType =
  | 'wedding'
  | 'graduation'
  | 'birthday'
  | 'anniversary'
  | 'baby-shower'
  | 'retirement'
  | 'other';

export type EventStatus =
  | 'planning'
  | 'on-track'
  | 'over-budget'
  | 'under-budget'
  | 'completed';

// Firestore document structure
export interface EventDocument extends FirestoreEntity {
  name: string;
  type: EventType;
  description?: string;
  eventDate: Timestamp;
  totalBudgetedAmount: number;
  totalScheduledAmount: number;
  totalSpentAmount: number;
  status: EventStatus;
  ownerId: string; // Reference to user
}

// Client-side model
export interface Event extends ClientEntity {
  name: string;
  type: EventType;
  description?: string;
  eventDate: Date;
  totalBudgetedAmount: number;
  totalScheduledAmount: number;
  totalSpentAmount: number;
  status: EventStatus;
  ownerId: string;

  // Computed properties
  spentPercentage: number;
  remainingAmount: number;
  isOverBudget: boolean;
  daysUntilEvent: number;
}

// Create data
export interface CreateEventData extends CreateEntityData {
  name: string;
  type: EventType;
  description?: string;
  eventDate: Date; // Will be converted to Timestamp
  totalBudgetedAmount: number;
  totalScheduledAmount?: number;
  totalSpentAmount?: number;
  status?: EventStatus;
  ownerId: string;
}

// Update data
export interface UpdateEventData extends UpdateEntityData {
  name?: string;
  type?: EventType;
  description?: string;
  eventDate?: Date;
  totalBudgetedAmount?: number;
  totalScheduledAmount?: number;
  totalSpentAmount?: number;
  status?: EventStatus;
}

// Collection paths
export const EVENTS_COLLECTION = 'events';
export const getEventPath = (eventId: string) => `events/${eventId}`;

// Subcollection paths
export const getEventSubcollection = (eventId: string, subcollection: string) =>
  `events/${eventId}/${subcollection}`;

// Query helpers
export const eventQueries = {
  byOwner: (ownerId: string) => ({
    where: [{ field: 'ownerId', operator: '==', value: ownerId }],
  }),
  byStatus: (status: EventStatus) => ({
    where: [{ field: 'status', operator: '==', value: status }],
  }),
  upcoming: () => ({
    where: [{ field: 'eventDate', operator: '>', value: new Date() }],
    orderBy: [{ field: 'eventDate', direction: 'asc' as const }],
  }),
};
