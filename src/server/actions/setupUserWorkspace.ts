'use server';

import * as Sentry from '@sentry/nextjs';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/server/lib/firebase-admin';
import type { UserWorkspace } from '@/types/UserWorkspace';
import { withSentryServerAction } from '../lib/sentryServerAction';
import {
  convertUserWorkspaceFromFirestore,
  type UserWorkspaceDocument,
} from '../types/UserWorkspaceDocument';

interface AddUserWorkspaceDto {
  userId: string;
  email: string;
  name: string;
  preferences: {
    language: string;
    currency: string;
  };
}

/**
 * Server action to create a setup the user workspace in Firestore
 * Wrapped with Sentry monitoring
 */
export const setupUserWorkspace = withSentryServerAction(
  'setupUserWorkspace',
  async (addUserWorkspaceDto: AddUserWorkspaceDto): Promise<UserWorkspace> => {
    // Implementation for setting up user workspace
    console.log(
      'Setting up user workspace for user:',
      addUserWorkspaceDto.userId,
    );

    if (!addUserWorkspaceDto.userId) throw new Error('User ID is required');

    try {
      // Set user context for debugging
      Sentry.setUser({ id: addUserWorkspaceDto.userId });

      // Add debug info to Sentry
      Sentry.addBreadcrumb({
        category: 'debug',
        message: 'Starting workspace setup',
        level: 'debug',
        data: addUserWorkspaceDto,
      });

      // Check if user document already exists
      const workspaceRef = db
        .collection('workspaces')
        .doc(addUserWorkspaceDto.userId);

      console.log('User workspace reference:', workspaceRef);

      try {
        const workspaceDoc = await workspaceRef.get();
        if (workspaceDoc.exists) {
          console.log(
            'User workspace already exists:',
            addUserWorkspaceDto.userId,
          );
          const workspace = convertUserWorkspaceFromFirestore(
            workspaceDoc.id,
            workspaceDoc.data() as UserWorkspaceDocument,
          );

          // Add success breadcrumb
          Sentry.addBreadcrumb({
            category: 'workspace',
            message: 'Existing workspace retrieved successfully',
            level: 'info',
            data: { userId: addUserWorkspaceDto.userId },
          });

          return workspace;
        }
      } catch {
        console.error(
          'Error checking existing workspace for user:',
          addUserWorkspaceDto.userId,
        );
        throw new Error('Failed to check existing workspace for user');
      }

      // Create a new workspace document
      console.log(
        'Creating new workspace for user:',
        addUserWorkspaceDto.userId,
      );

      const now = new Date();
      const newWorkspace: UserWorkspaceDocument = {
        email: addUserWorkspaceDto.email,
        name: addUserWorkspaceDto.name,
        preferences: addUserWorkspaceDto.preferences,
        _createdDate: Timestamp.fromDate(now),
        _createdBy: addUserWorkspaceDto.userId,
        _updatedDate: Timestamp.fromDate(now),
        _updatedBy: addUserWorkspaceDto.userId,
      };

      // Validate the new workspace before saving
      /*
      if (
        !newWorkspace.email ||
        !newWorkspace.name ||
        !newWorkspace.preferences
      ) {
        throw new Error('Invalid workspace data: missing required fields');
      }
      */
      await workspaceRef.set(newWorkspace);

      // Add breadcrumb for successful workspace creation
      Sentry.addBreadcrumb({
        category: 'workspace',
        message: 'User workspace created successfully',
        level: 'info',
        data: {
          userId: addUserWorkspaceDto.userId,
        },
      });

      // Convert to UserWorkspace type and return
      try {
        const workspace = convertUserWorkspaceFromFirestore(
          workspaceRef.id,
          newWorkspace,
        );
        console.log(
          'Workspace creation completed:',
          addUserWorkspaceDto.userId,
        );
        return workspace;
      } catch (conversionError) {
        console.error(
          'Error converting newly created workspace:',
          conversionError,
        );

        // Log conversion error to Sentry
        Sentry.captureException(conversionError, {
          tags: {
            action: 'setupUserWorkspace',
            error_type: 'new_workspace_conversion_error',
          },
          extra: {
            userId: addUserWorkspaceDto.userId,
            newWorkspace,
          },
        });

        throw new Error('Failed to process newly created workspace');
      }
    } catch (error) {
      console.error('Error setting up user workspace:', error);

      // Log detailed error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'setupUserWorkspace',
          userId: addUserWorkspaceDto.userId,
        },
        extra: {
          userInput: addUserWorkspaceDto,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw new Error('Failed to set up user workspace');
    }
  },
);
