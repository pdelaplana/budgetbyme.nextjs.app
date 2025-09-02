'use server';

import { withSentryServerAction } from '@/server/lib/sentryServerAction';
import { queueJob } from './queueJob';

export const deleteAccount = withSentryServerAction(
  'deleteAccount',
  async (userId: string): Promise<unknown> => {
    if (!userId) throw new Error('User ID is required');

    return queueJob({
      jobType: 'deleteAccount',
      userId,
      priority: 2,
    });
  },
);
