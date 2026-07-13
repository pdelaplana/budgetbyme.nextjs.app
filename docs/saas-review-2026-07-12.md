# SaaS Review: BudgetByMe — Top Issues by Category

_Date: 2026-07-12_

## 🔴 Security

1. **Server actions trust client-supplied `userId` with no session verification (Critical)** — Every server action (`src/server/actions/**`, e.g. `deleteAccount.ts`, `setupUserWorkspace.ts`) takes `userId` as a plain argument and uses the Admin SDK (which bypasses Firestore rules) to act on it. Any client can pass an arbitrary `userId` and read/modify/delete another user's workspace, including deleting their account.
   **Fix:** Verify the Firebase ID token server-side (`auth.verifyIdToken`) in every server action and derive `userId` from the verified token — never trust the argument.

2. **No server-side route protection — auth is client-only** — No `middleware.ts` exists; `AuthContext.tsx` only redirects client-side via `onAuthStateChanged`. Combined with #1, server actions are callable directly with no enforced session boundary.
   **Fix:** Add Next.js middleware verifying a session cookie/ID token on protected routes.

3. **`storage.rules` referenced in `firebase.json` but doesn't exist in the repo (High)** — Storage security policy for receipts/documents is unreviewable and possibly relying on console-managed or default rules.
   **Fix:** Author and commit explicit Storage rules scoped to the owning user, matching the Firestore rules pattern.

4. **Firestore rules missing field validation on `expenses` (update), `paymentSchedules`, `payments` (Medium)** — Only ownership is checked, no schema validation, unlike `categories`. Low risk today since all writes go through Admin SDK, but a gap if client writes are ever added.

5. **PII logged via `console.log` and Sentry breadcrumbs** (e.g. `setupUserWorkspace.ts`) — redact before logging.

## 🟠 Architecture

1. **Every page is `"use client"` — no server components used anywhere**, forfeiting Next 15 SSR/streaming and pushing all data fetching to the client. Worth a deliberate decision (documented) rather than default.
2. **Inconsistent TanStack Query key conventions** (`['expenses', userId, eventId]` vs `['categories', eventId]` vs `['fetchEvents', userId]`) — risks cache bugs. **Fix:** centralized query-key factory.
3. **Stated convention violated:** raw `toLocaleDateString` calls bypass the mandated `formatters.ts` in several components.
4. **God-component pattern re-emerged in modals** (`AddOrEditExpenseModal.tsx` 858 lines, `AddPaymentScheduleModal.tsx` 750 lines) even though the same pattern was successfully fixed on the expense-detail page. Apply the same reducer/hook-extraction refactor.
5. **43 `any`/`as any` usages**, concentrated in the same oversized modals — correlates with the god-component issue.
6. **Test coverage ~12%** (29/260 files), with zero tests on the highest-churn, highest-risk modals.
7. **Orphaned `@playwright/test` dependency** — installed but unwired (no config, no e2e dir, no script). Remove or actually set up e2e.

_(Good news: Firestore access is cleanly centralized through `src/server/actions/*` — no ad-hoc client-side Firestore calls. Keep this pattern as the model when cleaning up the modals.)_

## 🟡 Performance

1. **Expense fetch does two sequential round-trips + no pagination** (`fetchExpenses.ts`) — fetches parent event doc, then the *entire* expenses subcollection unbounded. **Fix:** parallelize the existence check, add `limit()`/pagination for large lists.
2. **`categories` query key omits `userId`**, risking stale/cross-user cache collisions if `eventId` isn't globally unique.
3. **No client-side compression of uploaded receipt photos** (`usePhotoUpload.ts`) — full-res camera photos hit Storage directly, increasing cost/latency.
4. **Recharts pie chart recomputes `pieData`/`totalBudget` on every render**, including hover state changes. **Fix:** wrap in `useMemo`.
5. **Minor:** stray `console.log` on the upload hot path in production.

_(Good news: dashboard/expense-detail refactors and lazy-loaded modals are already done and effective — docs listing them as outstanding are stale.)_

## 🟢 UI/UX

1. **Custom `ActionDropdown` (duplicated in 3 places) lacks accessibility** — no focus trap, arrow-key nav, or Escape handling, using a `fixed inset-0` click-outside hack. HeadlessUI `Menu` is already a dependency and used elsewhere — consolidate onto it.
2. **Sign-in page accessibility work is 0% complete** — no ARIA labels/live regions on errors, no contrast audit, no keyboard-nav pass. Highest-impact, lowest-cost fix available (Phase 1 of the existing plan).
3. **Progress-indicator pattern only applied to 2 of ~10+ destructive-action modals** — inconsistent spinner/disabled-button behavior elsewhere (delete attachment/payment/category, photo removal).
4. **No confirmed centralized form-error/`aria-describedby` convention** — worth auditing where validation errors actually render.
5. **17 files use hardcoded pixel widths** in chart/expense components — worth a targeted responsive pass on dashboard/expense-detail.
6. Minor: `forgot-password-page-conversion.md` is actually done — just needs its checklist updated so it stops looking like open work.

---

**Priority:** The security items (#1–#3) are a live cross-tenant data-access hole, not theoretical, and should be addressed first. Architecture/performance items are worth bundling into the next refactor pass on the large modals (kills god-components, `any` usage, and re-render issues together). UI accessibility work is cheap, well-scoped, and already has a written plan — just needs execution.
