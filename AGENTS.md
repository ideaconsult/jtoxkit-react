# AGENTS.md

Guidance for AI agents working in **@ideaconsult/jtoxkit-react** — an embeddable React
viewer for eNanoMapper/AMBIT substance, composition and study data. It is a faithful
rewrite of the legacy jQuery [jToxKit](https://github.com/ideaconsult/jToxKit) study/
substance kits, packaged like [`@adma/qubounds-viewer`](../qubounds-viewer). See
[README.md](./README.md) for usage.

## Commands

This is a **Node + Vite** project.

```bash
npm run dev        # standalone dev server → http://localhost:5175/jtoxkit/?substanceUri=...
npm test           # vitest unit tests (run these after any change to utils/config/data)
npm run build      # standalone app build
npm run build:lib  # library build → dist/jtoxkit-react.js + dist/style.css (the deliverable)
```

Verify changes with `npm test` and `npm run build:lib` before declaring done.

## Architecture (where things live)

```
src/
  SubstanceStudyViewer.jsx   public component: providers + ViewerBody (AMBIT load sequence)
  index.js                   package entry (default export + useAuth/useViewerConfig)
  context/                   AuthContext, ViewerConfig, DataSource providers
  data/                      source.js (adapter contract), ambitSource.js (AMBIT REST impl)
  hooks/useAmbit.js          load(uri) + {data,loading,error}, aborts in-flight requests
  components/                SubstanceCard, CompositionView, StudyViewer, StudyTable, DataCell
  config/                    config_study (+ i5/bao/exposure/npo), compositionColumns
  utils/                     format, ambit, tables, buildStudyColumns, Html, legacyGlobals
  styles/viewer.css          design tokens + base, ALL scoped under .jtoxkit-root
```

## Core principle: this is a faithful port

Behavior should match the legacy jToxKit. When unsure how something should render or which
AMBIT field to read, consult the original source at **[`jToxKit`](https://github.com/ideaconsult/jtoxkit)**
(`kits/js/StudyKit.js`, `SubstanceKit.js`, `CompositionKit.js`, `widgets/`, `core/`).

## Conventions & gotchas (read before editing)

- **`src/config/*.js` are verbatim jToxKit configs — do not rewrite them.** `config_study`
  (composed from `i5`/`bao`/`exposure`/`npo`) is copied from
  `nanodata-11ty-develop-kc/assets/js/study/`. They must stay drop-in compatible so a host
  can pass the same object via the `columnConfig` prop. Only change = globals→ESM on line 1.

- **The configs need `legacyGlobals.js`.** Their `render()` callbacks were non-strict
  scripts that use jQuery `$.each` and assign var-less globals (`iuuid`/`auuid`). The shim
  predeclares those; it is imported at the top of `config/studyColumns.js`. Keep that import
  if you touch config loading. If a config uses another legacy global, add it to the shim.

- **`render()` callbacks return HTML strings.** Render them only through `<Html>`
  (`utils/Html.jsx`), which sanitizes via DOMPurify. Never inject a render result with raw
  `dangerouslySetInnerHTML`. `renderCellHtml` (`components/DataCell.jsx`) wraps renders in
  try/catch so a bad data shape degrades to the raw value instead of crashing.

- **Legacy DataTables keys are normalized**, not honored ad hoc: `sTitle→title`,
  `bVisible→visible`, `iOrder→order` (`utils/tables.js` `normalizeColDef`). `inMatrix` is a
  MatrixKit-only flag, intentionally ignored.

- **All backend access goes through the data-source adapter** (`data/source.js`), never
  `fetch` in a component. Use the `useAmbit` hooks. Adapters must return **AMBIT-shaped**
  objects so a future Solr/ramanchada-api adapter (via the `source` prop) keeps configs and
  renderers working unchanged.

- **Styling stays scoped under `.jtoxkit-root`.** Reuse the tokens in `styles/viewer.css`
  (kept consistent with qubounds/spectrasearch). Do not add global/unscoped styles or port
  the old `jtox-kit.css`.

- **Dev CORS**: `.env.development` routes AMBIT calls through the same-origin `/ambit` proxy
  (`vite.config.js`); the data source rewrites the absolute URLs AMBIT returns. This is
  dev-only and absent from the library build.

## Common tasks

- **Customize a study category's columns** → edit/override the relevant section in
  `config/studyColumns.js` (or pass a `columnConfig` prop). Groups: `main`, `parameters`,
  `conditions`, `effects`, `protocol`, `interpretation`; `_` holds defaults.
- **Add a backend** → implement the `data/source.js` interface (see `ambitSource.js`),
  return AMBIT-shaped data, and pass it via the `source` prop.
- **Add a viewer feature** → keep load logic in `hooks/useAmbit.js` + `ViewerBody`; keep
  pure formatting in `utils/` with a vitest test.

## Out of scope / known gaps

- Composition does not yet decode AMBIT `feature`-map values (jToxKit `processEntry`).
- SubstanceCard does not render a structure image from the reference substance.
- The Solr/ramanchada-api `source` adapter (pyambit Solr↔AMBIT mapping) is a follow-on.
