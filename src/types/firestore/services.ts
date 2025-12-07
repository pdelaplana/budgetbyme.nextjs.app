import {
  addDoc,
  type CollectionReference,
  collection,
  type DocumentReference,
  type DocumentSnapshot,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  type QueryConstraint,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { EventDocument as ServerEventDocument } from '@/server/types/EventDocument';
import type { Event as ServerEvent } from '@/types/Event';
import {
  addCreateMetadata,
  addUpdateMetadata,
  budgetCategoryFromFirestore,
  eventFromFirestore,
} from '../../server/types/converters';
import type {
  BudgetCategory,
  BudgetCategoryDocument,
  CreateBudgetCategoryData,
  UpdateBudgetCategoryData,
} from './BudgetCategory';
import type { CreateEventData, UpdateEventData } from './Event';

// Helper to get document data from snapshot (client-side version)
const getDocumentData = <T>(
  snapshot: DocumentSnapshot,
  converter: (data: { id: string; [key: string]: unknown }) => T,
): T | null => {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (!data) return null;
  return converter({ id: snapshot.id, ...data });
};

// Generic CRUD operations
class FirestoreService<TDoc, TClient, TCreate, TUpdate> {
  constructor(
    private collectionPath: string,
    private fromFirestore: (doc: TDoc & { id: string }) => TClient,
  ) {}

  // Get collection reference
  private getCollection(): CollectionReference {
    return collection(db, this.collectionPath);
  }

  // Get document reference
  private getDocRef(id: string): DocumentReference {
    return doc(db, this.collectionPath, id);
  }

  // Create a new document
  async create(data: TCreate, userId: string): Promise<string> {
    const docData = addCreateMetadata(data as Record<string, unknown>, userId);
    const docRef = await addDoc(this.getCollection(), docData);
    return docRef.id;
  }

  // Get a document by ID
  async getById(id: string): Promise<TClient | null> {
    const snapshot = await getDoc(this.getDocRef(id));
    return getDocumentData(snapshot, (data) =>
      this.fromFirestore(data as TDoc & { id: string }),
    );
  }

  // Update a document
  async update(id: string, data: TUpdate): Promise<void> {
    const updateData = addUpdateMetadata(data as Record<string, unknown>);
    await updateDoc(this.getDocRef(id), updateData);
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }

  // Get all documents with optional query
  async getAll(constraints: QueryConstraint[] = []): Promise<TClient[]> {
    const q =
      constraints.length > 0
        ? query(this.getCollection(), ...constraints)
        : this.getCollection();

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) =>
      this.fromFirestore({ id: doc.id, ...doc.data() } as TDoc & {
        id: string;
      }),
    );
  }
}

// Event service
export const eventService = new FirestoreService<
  ServerEventDocument,
  ServerEvent,
  CreateEventData,
  UpdateEventData
>('events', (data) => {
  const { id, ...docData } = data;
  return eventFromFirestore(id, docData as ServerEventDocument);
});

// Budget category service
export const budgetCategoryService = new FirestoreService<
  BudgetCategoryDocument,
  BudgetCategory,
  CreateBudgetCategoryData,
  UpdateBudgetCategoryData
>('budgetCategories', (data) => {
  const { id, ...docData } = data;
  return budgetCategoryFromFirestore(id, docData as BudgetCategoryDocument);
});

// Specialized query methods
export const eventQueries = {
  async getByOwner(ownerId: string): Promise<ServerEvent[]> {
    return eventService.getAll([where('ownerId', '==', ownerId)]);
  },

  async getUpcoming(ownerId: string): Promise<ServerEvent[]> {
    return eventService.getAll([
      where('ownerId', '==', ownerId),
      where('eventDate', '>', new Date()),
      orderBy('eventDate', 'asc'),
      limit(10),
    ]);
  },

  async getByStatus(ownerId: string, status: string): Promise<ServerEvent[]> {
    return eventService.getAll([
      where('ownerId', '==', ownerId),
      where('status', '==', status),
    ]);
  },
};

export const budgetCategoryQueries = {
  async getByEvent(eventId: string): Promise<BudgetCategory[]> {
    return budgetCategoryService.getAll([where('eventId', '==', eventId)]);
  },
};
