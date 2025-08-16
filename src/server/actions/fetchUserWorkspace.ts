'use server';

import * as Sentry from '@sentry/nextjs';
import type { UserWorkspace } from '@/types/UserWorkspace';
import { db } from '../lib/firebase-admin';
import { withSentryServerAction } from '../lib/sentryServerAction';
import {
  convertUserWorkspaceFromFirestore,
  type UserWorkspaceDocument,
} from '../types/UserWorkspaceDocument';

export const fetchUserWorkspace = withSentryServerAction(
  'fetchUserWorkspace',
  async (userId: string): Promise<UserWorkspace | null> => {
    if (!userId) throw new Error('User ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: userId });

      // Add breadcrumb for tracking action flow
      Sentry.addBreadcrumb({
        category: 'workspace.fetch',
        message: 'Fetching user workspace',
        level: 'info',
      });

      const workspaceDoc = await db.collection('workspaces').doc(userId).get();

      if (!workspaceDoc.exists) {
        Sentry.addBreadcrumb({
          category: 'workspace.fetch',
          message: 'User workspace not found',
          level: 'info',
        });
        return null; // Workspace document doesn't exist yet
      }

      const userWorkspace = convertUserWorkspaceFromFirestore(
        workspaceDoc.id,
        workspaceDoc.data() as UserWorkspaceDocument,
      );

      // Add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'user.fetch',
        message: 'User account fetched successfully',
        level: 'info',
      });

      return userWorkspace;
    } catch (error) {
      Sentry.captureException(error);
      throw new Error(
        `Failed to fetch workspace : ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);
