import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  // esbuild strips "use client" directives when bundling multiple modules
  // together. Every component in this package is a client component, so
  // re-add the directive at the top of the bundle output.
  banner: { js: "'use client';" },
});
