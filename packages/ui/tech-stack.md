# @budgetbyme/ui — tech stack decision

## Decision

`packages/ui` is a full standalone npm workspace package, not a same-repo
folder re-exported via a path alias. It has its own `package.json`,
`tsconfig.json`, and a `tsup` build that emits `dist/index.js` (ESM) +
`dist/index.d.ts`. The Next.js app consumes it as an npm workspace
dependency (`"@budgetbyme/ui": "*"`), resolved through `node_modules` like
any other package, not through a TS path alias into `src/`.

## Rationale

- A future design-tooling sync (e.g. design-token/codegen pipelines) needs
  a package with a real build entry point and a publishable shape
  (`dist/`, `package.json#exports`, declaration files) — a folder aliased
  via `tsconfig.json` `paths` would not satisfy that.
- Building with `tsup` (esbuild under the hood) keeps the build fast and
  gives us ESM output + `.d.ts` generation with minimal configuration,
  matching how most small React component libraries are shipped today.
- Consuming via npm workspaces (not `paths`/symlink hacks) proves the
  package resolves and tree-shakes the same way it will once published,
  and lets Next.js/Turbopack treat it as an ordinary external dependency
  rather than app-internal source — this is the scenario most likely to
  break silently, so it's proven early via the `LoadingSpinner` walking
  skeleton before batch-extracting ~20 more components.
- `react` and `react-dom` are declared as `peerDependencies` (not bundled)
  so the package uses the consuming app's React instance — required for
  React 19 (hooks/context identity) and to avoid duplicate React copies.
- Dependencies used by presentational components being migrated
  (`@heroicons/react`, `@headlessui/react`, `recharts`, `react-easy-crop`,
  `sonner`) are declared directly on the package so it can be built and
  typechecked independently of the app.

## Shared utilities and minimal domain types (Task 9)

- `src/lib/formatters.ts` and `src/lib/textUtils.ts` in the app have ~26
  call sites combined (22 + 4) — too many to safely rewrite to import
  from `@budgetbyme/ui` directly in one task. Both files are pure and
  zero-dependency, so they were moved **wholesale** into
  `packages/ui/src/utils/formatters.ts` and `packages/ui/src/utils/textUtils.ts`,
  with their tests ported alongside. The app's original
  `src/lib/formatters.ts` / `src/lib/textUtils.ts` now just
  `export { ... } from '@budgetbyme/ui'`, so all existing app call sites
  (`@/lib/formatters`, `@/lib/textUtils`) keep working unchanged. Both
  are also exported from the package barrel (`src/index.ts`) for future
  consumers.
- Minimal, package-local `Expense`, `EventType`, and `PaymentStatus`
  type shapes live in `packages/ui/src/types/`. These are
  structurally-compatible subsets of the app's full domain types
  (`src/types/Expense.ts`, `src/types/Event.ts`,
  `src/lib/paymentCalculations.ts`), containing only the fields actually
  consumed by the components slated for the next three extraction tasks
  (10/11/12). They are type-only — no runtime import from the app's
  types — to avoid coupling the package to the app's domain model.

## Build output

- `npm run build` (in `packages/ui`) runs `tsup`, producing:
  - `dist/index.js` — ESM bundle
  - `dist/index.d.ts` — rolled-up type declarations
- `package.json#exports` points `import`/`types` at these files; `main`/
  `module`/`types` fields are set for broader tool compatibility.
