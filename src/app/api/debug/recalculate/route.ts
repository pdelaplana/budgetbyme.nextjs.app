import { recalculateEventTotals } from '@/server/actions/events/recalculateEventTotals';

// Replace with actual user ID and event ID from context if available, or just run for a known test event
// For this script, we'll try to use a dummy event or rely on the user running it via UI if available.
// However, since we don't have a UI button yet, we can't easily trigger it from the browser.
// But we are in a dev environment. I can try to run a script that imports this.
// Actually, running server actions from a standalone script is hard in Next.js.
// A better way is to expose a temporary UI button or just rely on the user knowing that *future* updates work.
// But I want to fix *existing* data.
// Let's create a temporary API route that triggers it.

export async function POST(request: Request) {
  const { userId, eventId } = await request.json();
  const result = await recalculateEventTotals({ userId, eventId });
  return Response.json(result);
}
