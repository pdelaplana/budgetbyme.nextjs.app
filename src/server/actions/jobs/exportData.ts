'use server';

import { withSentryServerAction } from '@/server/lib/sentryServerAction';
import { queueJob } from './queueJob';

export const exportData = withSentryServerAction(
  'exportData',
  async (userId: string): Promise<unknown> => {
    if (!userId) throw new Error('User ID is required');

    return queueJob({
      jobType: 'exportData',
      userId,
      priority: 1,
    });
  },
);
