# Spike: Next.js 16.x + TypeScript 7.x viability for NI Play

Date: 2026-07-08
Worktree: `.claude/worktrees/agent-adc9aaaa2fe51cdc5` (disposable, no commits made)

## Resolved versions

| Package | Before | After `npm install ...@latest` |
|---|---|---|
| next | ^14.1.0 (installed 14.2.35) | **16.2.10** |
| react / react-dom | ^18.2.0 (18.3.1) | **19.2.7** |
| typescript | ^5.3.0 (installed 5.9.3) | **7.0.2** |
| @types/node | ^20.11.0 | ^26.1.1 |
| @types/react | ^18.2.0 | ^19.2.17 |
| @types/react-dom | ^18.2.0 | ^19.2.3 |

Note: the actual repo `package.json` pins were `next ^14.1.0` / `typescript ^5.3.0` (resolving to 14.2.35 / 5.9.3 respectively) at spike start, not the 15.5.20/5.9.3 mentioned in the task brief — doesn't change the experiment, just noting the discrepancy for the record.

Installing `typescript@latest` and `@types/*@latest` required `--legacy-peer-deps` (or an `.npmrc` with `legacy-peer-deps=true`): `@typescript-eslint/eslint-plugin@8.56.0` / `@typescript-eslint/parser@8.56.0` declare `peer typescript@">=4.8.4 <6.0.0"`, so a plain `npm install` hard-fails with `ERESOLVE` against TS 7.0.2. This is a real, unavoidable friction point of adopting TS 7 today — the entire `@typescript-eslint` ecosystem does not yet declare TS 7 support.

## Baseline sanity check (Next 14 / TS 5) — PASS

- `npm install` — clean (only routine deprecation warnings).
- `npm run build` — succeeded. Static export generated for all 5 routes (`/`, `/beat`, `/dashboard`, `/studio`, `/_not-found`). One harmless warning: `ESLint: Plugin "@next/next" was conflicted between ...` (pre-existing, unrelated to this spike).
- `npm run typecheck` (`tsc --noEmit`, TS 5.9.3) — clean, zero errors.

Baseline confirmed healthy before touching anything.

## Hypothesis 1: "Tone.js is dynamic-only, so the webpack alias is unnecessary under Turbopack" — CONFIRMED TRUE

Removed the entire custom `webpack(config, { isServer }) {...}` block from `next.config.js` (the `tone` → `tone/build/esm/index.js` alias). Confirmed via `grep` on `src/audio/tone.ts` that Tone is only ever loaded via `await import('tone')` inside `loadTone()`, never a static/top-level import, so this is a fair test of Turbopack's default resolution.

Result: **Turbopack resolves and bundles Tone.js correctly with zero custom config.** Verified two ways:
1. The build completed successfully end-to-end (see below) with `▲ Next.js 16.2.10 (Turbopack)` as the active bundler.
2. Grepped the built output chunks (`out/_next/static/chunks/*.js`) for Tone.js class names (`AMSynth`, `MembraneSynth`) — found present in bundled, minified output, confirming the dynamic `import('tone')` was actually resolved and code-split correctly, not silently dropped.

**No Turbopack-specific config was needed for Tone.js at all.** Hypothesis 1 is fully validated.

## Hypothesis 2: "A correct tsconfig fixes TS 7's `@/`-alias resolution" — the premise is false; TS 7 alias resolution was never broken for this project

Applied the requested tsconfig change (`lib: ["dom","dom.iterable","es2025"]`, confirmed `module: "esnext"` / `moduleResolution: "bundler"` already present) and ran `tsc --noEmit` (now TS 7.0.2, invoked via the `tsc` CLI binary as `npm run typecheck` does):

```
> ni-play@0.1.0 typecheck
> tsc --noEmit

(no output, exit code 0)
```

Zero errors, clean pass, including all `@/`-aliased imports across the app (e.g. `src/app/studio/page.tsx` imports `@/components/Layout/AppShell`, `@/components/Grid/StepGrid`, `@/stores/useGridStore`, etc. — all resolved).

**To rule out a false negative** (e.g. tsc silently no-op'ing), we deliberately broke the first `@/` import in `src/app/studio/page.tsx` (`@/components/Layout/AppShell` → `@/components/Layout/AppShellNONEXISTENT`) and reran:

```
src/app/studio/page.tsx(13,22): error TS2307: Cannot find module '@/components/Layout/AppShellNONEXISTENT' or its corresponding type declarations.
```

TS 7 caught it correctly and precisely, at the correct line/column. Restored the file; typecheck went back to clean (exit 0).

**Conclusion: the `tsc` CLI in TypeScript 7.0.2 has no `@/`-alias resolution regression in this project, with or without tsconfig changes.** Whatever the "prior attempt" saw, it's not reproducible via `tsc --noEmit` against this repo's config. The real TS 7 problem is architecturally different (see next section) — it's not a resolution bug, it's an API-surface removal that breaks *tools that embed TypeScript*, not the CLI itself.

## The actual TS 7 blocker: TypeScript 7.0.2 no longer ships a programmatic compiler API

`npm run build` (Next 16, Turbopack, no webpack config) failed on the first attempt:

```
✓ Compiled successfully in 1833ms
  Running TypeScript ...
It looks like you're trying to use TypeScript but do not have the required package(s) installed.
Installing dependencies
...
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
...
Failed to install required TypeScript dependencies, please install them manually to continue:
npm install --save-exact --save-dev typescript
Next.js build worker exited with code: 1 and signal: null
```

Root cause investigation: Next.js's *internal* build-time TypeScript integration (config validation, `next-env.d.ts` generation, type-checking) requires the classic TS compiler API (`require('typescript')` → `ts.createProgram`, etc.), the same way `@typescript-eslint/parser` does. **TypeScript 7.0.2 no longer exposes that API.** Confirmed directly:

```js
// node_modules/typescript/package.json "exports" map:
{
  "./package.json": "./package.json",
  ".": "./lib/version.cjs",              // <- just a version string, not the compiler
  "./unstable/sync": "./dist/api/sync/api.js",
  "./unstable/async": "./dist/api/async/api.js",
  "./unstable/fs": "./dist/api/fs.js",
  "./unstable/proto": "./dist/api/proto.js",
  "./unstable/ast": "./dist/ast/index.js",
  ...
}
```

`node_modules/typescript/lib/` contains only `tsc.js`, `getExePath.js`, `version.cjs` — **no `typescript.js`**, and the `exports` map blocks reaching it even if it existed:
```
$ node -e "require.resolve('typescript/lib/typescript.js')"
Error: Package subpath './lib/typescript.js' is not defined by "exports" in .../node_modules/typescript/package.json
```

This is TypeScript's new native/Go-based compiler rewrite as published to npm — `typescript@7.0.2` is CLI-only (a `tsc` binary) plus an unstable/experimental AST API, with no classic Program/LanguageService JS API. Confirmed this is genuinely `latest`, not an accidental prerelease pull: `npm view typescript dist-tags` → `{ latest: '7.0.2', rc: '7.0.1-rc', next: '7.1.0-dev... }`.

**Consequence: any tool that does `require('typescript')` for the API (not just the `tsc` binary) breaks.** This includes:
- Next.js's own build-time TS integration (config validation + typecheck step).
- `@typescript-eslint/parser` (peer-dep conflict already surfaces this at `npm install` time, see above).
- Presumably any other tool with the same dependency (ts-jest, various codegen tools, etc.) — not tested here, out of scope, but the mechanism is generic.

**What still works fine:** the standalone `tsc` CLI (`tsc --noEmit`), because it only needs the `tsc` binary, not the importable API. This is exactly why `npm run typecheck` (which calls `tsc --noEmit` directly) passed cleanly while Next's internal "Running TypeScript..." build step crashed.

### Minimal fix found

Two changes, both required together, get `next build` to succeed on Next 16 + TS 7:

1. **`.npmrc`** at repo root:
   ```
   legacy-peer-deps=true
   ```
   Lets `npm install typescript` (which Next's build step auto-invokes when it thinks TS isn't "properly installed") succeed despite the `@typescript-eslint` peer conflict, instead of hard-failing with `ERESOLVE`.

2. **`next.config.js`** — add:
   ```js
   typescript: {
     ignoreBuildErrors: true,
   },
   ```
   Skips Next's internal type-*validation* step (which needs the missing Program API and otherwise crashes — see below), while still letting Next auto-normalize `tsconfig.json` (it adds `target: "ES2017"`, forces `jsx: "react-jsx"`, appends `.next/dev/types/**/*.ts` to `include`) and complete the production build.

**Both are necessary — neither alone is sufficient:**
- `ignoreBuildErrors: true` **alone** (without the `.npmrc` fix) still fails: Next still needs to `npm install typescript` internally to do its tsconfig auto-normalization step, and that install itself still ERESOLVE-fails without `legacy-peer-deps`.
- `legacy-peer-deps=true` **alone** (without `ignoreBuildErrors`) lets the install succeed, but then Next actually attempts real type-checking with TS 7 and crashes with a low-level, unrelated-looking runtime error:
  ```
  Running TypeScript ...
  ... (npm install succeeds this time) ...
  The "id" argument must be of type string. Received undefined
  Next.js build worker exited with code: 1 and signal: null
  ```
  This is Next's TS-API-consuming code hitting the same missing-API problem from a different angle — not a resolvable config issue, a hard incompatibility.

With both fixes applied, `next build` succeeds cleanly:
```
▲ Next.js 16.2.10 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 1738ms
  Skipping validation of types
It looks like you're trying to use TypeScript but do not have the required package(s) installed.
Installing dependencies
  ... up to date, audited 412 packages ...
  Finished TypeScript config validation in 1346ms ...
  Collecting page data using 7 workers ...
✓ Generating static pages using 7 workers (6/6) in 319ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /beat
├ ○ /dashboard
└ ○ /studio
```
Output verified in `out/`: static HTML/JS for all 5 routes, Tone.js correctly bundled (see Hypothesis 1 section).

Practical implication of `ignoreBuildErrors: true`: **type errors would no longer fail the production build.** `npm run typecheck` (the standalone `tsc --noEmit` CLI) remains the only real type-safety gate — it still works and still catches real errors (verified above) — so this is survivable only if `typecheck` is run as a separate, enforced CI/pre-commit step, not folded into `next build`'s exit code.

### `output: 'export'` variant (step 7)

Tested removing `output: 'export'` entirely (with the two fixes above still applied): **no difference** — build succeeds identically either way. This blocker is unrelated to static export mode; it reproduces on a normal server-mode Next 16 build too.

## Verdict

**Next.js 16 (Turbopack): viable, with one config change.** Removing the custom `webpack()`/Tone alias is not just safe but correct — Turbopack resolves Tone.js's ESM build natively with zero config (confirmed by inspecting bundled output). The `output: 'export'` config doesn't interact with any of this.

**TypeScript 7 (7.0.2, "latest" today): NOT cleanly viable as a `next build`-time dependency, though the `tsc` CLI itself typechecks this codebase perfectly, including all `@/` aliases.** The originally reported "`@/`-alias resolution" blocker does not reproduce — that specific symptom is refuted. The real, load-bearing blocker is structural and upstream of this project: **TypeScript 7.0.2 no longer ships a programmatic compiler API** (`require('typescript')` only exposes a version stub + unstable AST APIs, not `ts.createProgram`/LanguageService), which breaks any tool built against the classic API — concretely, Next.js's own internal build-time type-checking (crashes with `The "id" argument must be of type string. Received undefined`) and the entire currently-installed `@typescript-eslint` toolchain (peer-dep range `<6.0.0`/`<6.1.0`, hard `ERESOLVE` at install time).

**A workaround exists** (`.npmrc` `legacy-peer-deps=true` + `next.config.js` `typescript.ignoreBuildErrors: true`) that gets a clean, working `next build` on Next 16 + TS 7, with `tsc --noEmit` retained as a separate, still-fully-functional type-safety gate. But this is a workaround that disables Next's built-in type-checking outright, not a real fix — it should be treated as "TS 7 is not yet ready for this stack's tooling," not "TS 7 works." Recommend staying on TypeScript 5.9.x until either TypeScript restores/stabilizes a compatible API surface for tool authors, or Next.js and `@typescript-eslint` ship versions built against TS 7's new API.

**Bottom line:** Next 16 alone (on TS 5) would very likely be straightforwardly adoptable — worth a follow-up spike isolating just that upgrade. TS 7 is genuinely not ready for this project's toolchain today, for reasons unrelated to the originally hypothesized `@/`-import bug.
