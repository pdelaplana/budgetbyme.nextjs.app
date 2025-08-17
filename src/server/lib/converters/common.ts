import type { FieldValue, Timestamp, WhereFilterOp } from 'firebase/firestore';

// Base entity for Firestore documents
export interface FirestoreEntity {
  id: string;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
}

// Client-side base entity
export interface ClientEntity {
  id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

// Data for creating new documents
export interface CreateEntityData {
  createdBy: string;
  // createdAt and updatedAt will be set by serverTimestamp()
}

// Data for updating documents
export interface UpdateEntityData {
  updatedAt?: FieldValue; // Will be serverTimestamp()
}

// Generic converter type
export type DocumentConverter<TDocument, TClient> = {
  toFirestore: (
    client: Partial<TClient>,
  ) => Partial<{ id: string; document: TDocument }>;
  fromFirestore: (id: string, doc: TDocument) => TClient;
};

// Collection path builder
export type CollectionPath = string;
export type DocumentPath = string;

// Reference types
export interface FirestoreReference {
  id: string;
  path: string;
}

// Query types
export interface QueryOptions {
  limit?: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  where?: { field: string; operator: WhereFilterOp; value: unknown }[];
}

// Helper for subcollection paths
export const buildPath = (...segments: string[]): string => segments.join('/');
