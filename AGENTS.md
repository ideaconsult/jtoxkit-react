# AGENTS.md

Guidance for AI agents working in **@ideaconsult/jtoxkit-react** — an embeddable React
viewer for eNanoMapper/AMBIT substance, composition and study data. It is a faithful
rewrite of the legacy jQuery [jToxKit](https://github.com/ideaconsult/jToxKit) study/
substance kits. See [README.md](./README.md) for usage.

## Sources

- Prefer `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `vite.config.js`,
  `vite.lib.config.js`, `vitest.config.js`, `.env.example`, `README.md`, and
  `CONTRIBUTING.md` for current behavior.
- Keep this file, `CONTRIBUTING.md`, and `README.md` updated when commands, entrypoints,
  API routes, URL params, auth behavior, packaging, release flow, or integration contracts
  change.
- The legacy jToxKit source remains important parity context. When unsure how something
  should render or which AMBIT field to read, consult
  [`jToxKit`](https://github.com/ideaconsult/jtoxkit) (`kits/js/StudyKit.js`,
  `SubstanceKit.js`, `CompositionKit.js`, `widgets/`, `core/`).

## Project Shape

- This is a single-package React/Vite project that is both a standalone `/jtoxkit/` app and
  an embeddable viewer library.
- Standalone app entrypoint: `src/main.jsx` -> `src/App.jsx` -> `SubstanceStudyViewer`.
- Library entrypoint: `src/index.js`, exporting `SubstanceStudyViewer`, `useAuth`,
  `useViewerConfig`, and `jsambit`; consumers import the bundled CSS separately.
- Public npm package name: `@ideaconsult/jtoxkit-react`.
- `src/SubstanceStudyViewer.jsx` owns the reusable component API. Avoid putting
  host-specific URL parsing or Vite environment handling there.

## Commands

- Current package manager is pnpm, pinned by `packageManager` in `package.json`; install
  with `pnpm install --frozen-lockfile`.
- Dev server: `pnpm dev`; Vite serves on port `5175` with `base: '/jtoxkit/'`.
- Production app build: `pnpm build`.
- Library build for package consumers: `pnpm build:lib`; it emits
  `dist/jtoxkit-react.js` and `dist/style.css`.
- Preview production app build: `pnpm preview`.
- Test suite: `pnpm test`; watch mode: `pnpm test:watch`.
- There are currently no lint, formatter, or typecheck scripts; use `pnpm test` plus the
  relevant build command as the available verification step for code changes.

Verify changes with `pnpm test` and `pnpm build:lib` before declaring done. For packaging,
also run `pnpm build`, `pnpm peers check`, and `pnpm pack --dry-run`.

## CI And Release

- GitHub Actions workflows live under `.github/workflows/`; Dependabot configuration is
  `.github/dependabot.yml`.
- CI runs on pull requests, pushes to `main`, and manual dispatch. It installs with
  `pnpm install --frozen-lockfile`, checks peers, runs tests, builds the standalone app and
  library, verifies no `import.meta.env`/`VITE_` references leak into `dist/*.js`, and runs
  `pnpm pack --dry-run`.
- npm publication is handled by `.github/workflows/publish.yml` on GitHub Release
  publication, using npm trusted publishing/OIDC and the GitHub `npm` environment.
- Release tags must match `package.json` exactly as `vX.Y.Z`.
- Do not commit generated `dist/` unless a release workflow explicitly requires checked-in
  artifacts.

## Architecture

```
src/
  SubstanceStudyViewer.jsx   public component: providers + ViewerBody (AMBIT load sequence)
  App.jsx                    standalone shell: URL params + Vite env -> viewer props
  index.js                   package entry (default export + useAuth/useViewerConfig/jsambit)
  context/                   AuthContext, ViewerConfig, DataSource providers
  data/                      source.js (adapter contract), ambitSource.js (AMBIT REST impl)
  hooks/useAmbit.js          load(uri) + {data,loading,error}, aborts in-flight requests
  components/                SubstanceCard, CompositionView, StudyViewer, StudyTable, DataCell
  config/                    config_study (+ i5/bao/exposure/npo), compositionColumns
  utils/                     format, ambit, tables, buildStudyColumns, Html, legacyGlobals
  styles/viewer.css          design tokens + base, ALL scoped under .jtoxkit-root
```

## Reusable Library Boundary

- Embedded hosts pass runtime configuration as props: `substanceUri`, `substanceId`,
  `apiBase`, `convertBase`, `token`, `showDiagrams`, `columnConfig`, `initialTab`, and
  `source`.
- Standalone URL parsing belongs in `src/App.jsx` only.
- Standalone Vite environment variables belong in `src/App.jsx` and build-tool config only.
  Reusable library files must receive config through props/context, not `import.meta.env`,
  `VITE_`, or host URL params.
- `src/context/ViewerConfig.jsx` should expose explicit package defaults only.
- The library build externalizes React, ReactDOM, and optional `@observablehq/plot`; keep
  React and ReactDOM as peer dependencies.
- `dompurify` is a runtime dependency used to sanitize legacy renderer HTML.

## Auth And Backend Contract

- Do not add Keycloak login, redirect, or `keycloak.init()` behavior. Auth is passive.
- Embedded hosts pass `token`; standalone mode may read `?token=`, `sessionStorage`, and
  `postMessage` with `{ type: 'keycloak_token', token }`.
- The viewer must render without a token; public AMBIT data should still work and protected
  resources should degrade gracefully.
- All backend access goes through the data-source adapter (`data/source.js`), never raw
  `fetch` in a component. Use the `useAmbit` hooks.
- Adapters must return AMBIT-shaped objects so a future Solr/ramanchada-api adapter can be
  injected through the `source` prop without changing components, configs, or renderers.
- The AMBIT adapter owns AMBIT URL resolution, bearer auth headers, cookie credentials, and
  optional standalone/dev URL rewriting.

## Core Principle: Faithful Port

- Behavior should match the legacy jToxKit unless there is an explicit React/library reason
  to differ.
- `src/config/*.js` are verbatim jToxKit configs; do not rewrite them. `config_study`
  (composed from `i5`/`bao`/`exposure`/`npo`) is copied from legacy nanodata study config
  and must stay drop-in compatible so a host can pass the same object via `columnConfig`.
- The configs need `legacyGlobals.js`. Their `render()` callbacks were non-strict scripts
  that use jQuery `$.each` and assign var-less globals (`iuuid`/`auuid`). Keep the shim
  import if you touch config loading. If a config uses another legacy global, add it to the
  shim.
- `render()` callbacks return HTML strings. Render them only through `<Html>`
  (`utils/Html.jsx`), which sanitizes via DOMPurify. Never inject a render result with raw
  `dangerouslySetInnerHTML`.
- Legacy DataTables keys are normalized, not honored ad hoc: `sTitle -> title`,
  `bVisible -> visible`, `iOrder -> order` (`utils/tables.js` `normalizeColDef`).
  `inMatrix` is a MatrixKit-only flag, intentionally ignored.
- Styling stays scoped under `.jtoxkit-root`. Reuse the tokens in `styles/viewer.css`; do
  not add global/unscoped styles or port the old `jtox-kit.css` wholesale.

## Common Tasks

- Customize a study category's columns: edit/override the relevant section in
  `config/studyColumns.js` or pass a `columnConfig` prop. Groups: `main`, `parameters`,
  `conditions`, `effects`, `protocol`, `interpretation`; `_` holds defaults.
- Add a backend: implement the `data/source.js` interface, return AMBIT-shaped data, and
  pass it via the `source` prop.
- Add a viewer feature: keep load logic in `hooks/useAmbit.js` and `ViewerBody`; keep pure
  formatting in `utils/` with a Vitest test.

## Out Of Scope / Known Gaps

- Composition does not yet decode AMBIT `feature`-map values (jToxKit `processEntry`).
- SubstanceCard does not render a structure image from the reference substance.
- The Solr/ramanchada-api `source` adapter (pyambit Solr-to-AMBIT mapping) is a follow-on.
