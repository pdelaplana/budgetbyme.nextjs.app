import { Timestamp } from 'firebase-admin/firestore';
import type { EventDocument } from '@/server/types/EventDocument';
import { Currency } from '@/types/currencies';
import type { Event, EventStatus, EventType } from '@/types/Event';
import type { DocumentConverter } from './common';

// Create a document converter following the common.ts pattern
export const eventConverter: DocumentConverter<EventDocument, Event> = {
  toFirestore: (
    event: Partial<Event>,
  ): Partial<{ id: string; document: EventDocument }> => {
    const {
      id,
      _createdDate,
      _updatedDate,
      spentPercentage: _, // Exclude calculated field from storage
      ...firestoreFields
    } = event;

    return {
      id,
      document: {
        ...firestoreFields,
        // Map field name difference
        type: event.type?.toString(),
        status: event.status?.toString(),
        currency: event.currency?.code,
        eventDate: event.eventDate
          ? Timestamp.fromDate(event.eventDate)
          : Timestamp.now(),
        // Convert Dates to Timestamps
        _createdDate: _createdDate
          ? Timestamp.fromDate(_createdDate)
          : Timestamp.now(),
        _updatedDate: _updatedDate
          ? Timestamp.fromDate(_updatedDate)
          : Timestamp.now(),
      } as unknown as EventDocument,
    };
  },

  fromFirestore: (id: string, doc: EventDocument): Event => {
    const { _createdDate, _updatedDate, totalBudgetedAmount, ...rest } = doc;

    // Calculate spent percentage
    const spentPercentage =
      totalBudgetedAmount > 0
        ? Math.round((rest.totalSpentAmount / totalBudgetedAmount) * 100)
        : 0;

    return {
      ...rest,
      id: id,
      // Map field name difference with null safety
      eventDate: rest.eventDate?.toDate() || new Date(),
      currency: Currency.fromCode(rest.currency) || Currency.AUD,
      totalBudgetedAmount,
      spentPercentage,
      // Ensure proper typing
      type: rest.type as EventType,
      status: rest.status as EventStatus,
      _createdDate: _createdDate?.toDate() || new Date(),
      _updatedDate: _updatedDate?.toDate() || new Date(),
    };
  },
};
