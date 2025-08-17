import { Timestamp } from 'firebase-admin/firestore';
import type { UserWorkspaceDocument } from '@/server/types/UserWorkspaceDocument';
import type { UserWorkspace } from '@/types/UserWorkspace';
import type { DocumentConverter } from './common';

// Create a document converter following the common.ts pattern
export const userWorkspaceConverter: DocumentConverter<
  UserWorkspaceDocument,
  UserWorkspace
> = {
  toFirestore: (
    userWorkspace: Partial<UserWorkspace>,
  ): Partial<{ id: string; document: UserWorkspaceDocument }> => {
    const { id, _createdDate, _updatedDate, ...rest } = userWorkspace;

    return {
      id,
      document: {
        ...rest,
        // Convert Dates to Timestamps
        _createdDate: _createdDate
          ? Timestamp.fromDate(_createdDate)
          : Timestamp.now(),
        _updatedDate: _updatedDate
          ? Timestamp.fromDate(_updatedDate)
          : Timestamp.now(),
      } as UserWorkspaceDocument,
    };
  },

  fromFirestore: (id: string, doc: UserWorkspaceDocument): UserWorkspace => {
    const { _createdDate, _updatedDate, ...rest } = doc;

    return {
      ...rest,
      id: id,
      _createdDate: _createdDate?.toDate() || new Date(),
      _updatedDate: _updatedDate?.toDate() || new Date(),
    };
  },
};
