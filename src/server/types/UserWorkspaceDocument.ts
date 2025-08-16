import { Timestamp } from 'firebase-admin/firestore';
import type { UserWorkspace } from '@/types/UserWorkspace';

export interface UserWorkspaceDocument {
  name: string;
  email: string;
  preferences: {
    language: string;
    currency: string;
  };
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}

export const convertUserWorkspaceToFirestore = (
  workspace: UserWorkspace,
): { id: string; document: UserWorkspaceDocument } => {
  const { _createdDate, _updatedDate, id, ...rest } = workspace;

  const document: UserWorkspaceDocument = {
    ...rest,
    // Convert Dates to Timestamps
    _createdDate: Timestamp.fromDate(_createdDate),
    _updatedDate: Timestamp.fromDate(_updatedDate),
  };

  return { id, document };
};

export const convertUserWorkspaceFromFirestore = (
  id: string,
  workspace: UserWorkspaceDocument,
): UserWorkspace => {
  const { _createdDate, _updatedDate, ...rest } = workspace;

  return {
    ...rest,
    id,
    // Convert Dates to Timestamps
    _createdDate: _createdDate?.toDate(),
    _updatedDate: _updatedDate?.toDate(),
  } as UserWorkspace;
};
