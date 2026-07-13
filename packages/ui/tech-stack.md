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

## Build output

- `npm run build` (in `packages/ui`) runs `tsup`, producing:
  - `dist/index.js` — ESM bundle
  - `dist/index.d.ts` — rolled-up type declarations
- `package.json#exports` points `import`/`types` at these files; `main`/
  `module`/`types` fields are set for broader tool compatibility.
