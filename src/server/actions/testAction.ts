'use server';

import * as Sentry from '@sentry/nextjs';

export async function testServerAction(message: string) {
  console.log('🧪 Test server action called with:', message);

  Sentry.addBreadcrumb({
    category: 'test',
    message: 'Test server action called',
    level: 'info',
    data: { message },
  });

  return { success: true, message: `Server processed: ${message}` };
}
