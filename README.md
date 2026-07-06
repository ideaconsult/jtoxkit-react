# @ideaconsult/jtoxkit-react

An embeddable **React** viewer for eNanoMapper/AMBIT **substance**, **composition**, and
**study** data. It is a modern rewrite of the study/substance viewers from the legacy
jQuery [jToxKit](https://github.com/ideaconsult/jToxKit) (`StudyKit`, `SubstanceKit`,
`CompositionKit`) that can be embedded in React apps such as
[`spectrasearch`](https://github.com/h2020charisma/spectrasearch) or run standalone.

The primary target is an embeddable React component. The same component also powers a
standalone `/jtoxkit/` app for development, demos, and direct links.

The legacy jToxKit remains in use by static Eleventy/jQuery sites; this package targets
React hosts and does **not** replace it there.

## What It Shows

Given one substance, it renders the same things the jToxKit study page does:

- **Substance card**: public name, type, owner, UUID, and external identifiers.
- **Composition**: ingredient table(s) grouped by composition, with concentrations and
  optionally structure diagrams.
- **Studies**: tabs per top category (P-Chem, Env Fate, Eco Tox, Tox); each tab lazily
  loads its studies and groups them by protocol category into tables with dynamic,
  per-category columns, a filter box, and expand/collapse.

## Embedding

Consumers should depend on the npm package and import the component and bundled CSS:

```jsx
import SubstanceStudyViewer from '@ideaconsult/jtoxkit-react'
import '@ideaconsult/jtoxkit-react/style.css'

<SubstanceStudyViewer
  substanceUri="https://apps.ideaconsult.net/nanoreg1/substance/XXXX-..."
  token={keycloakToken}
  apiBase="https://apps.ideaconsult.net/nanoreg1/"
  convertBase="https://api.ramanchada.ideaconsult.net/"
  showDiagrams
/>
```

Hosts own authentication and pass a bearer token with the `token` prop when protected
resources are needed. The viewer never starts login or redirect flow and must also render
without a token for public AMBIT data.

When embedding in another Vite app, dedupe React so hooks share one instance:

```js
// vite.config.js
resolve: { dedupe: ['react', 'react-dom'] },
optimizeDeps: { include: ['@ideaconsult/jtoxkit-react'] },
```

Peer dependencies are `react`, `react-dom`, and, only for the dose-response chart,
`@observablehq/plot`. Plot is external and optional so the host can reuse its single
instance; if the host does not provide it, the chart is simply not shown. `dompurify` is a
runtime dependency bundled by the library for sanitizing legacy renderer HTML.

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `substanceUri` | string | Full AMBIT substance URL. |
| `substanceId` | string | UUID; resolved against `apiBase` if `substanceUri` is absent. |
| `apiBase` | string | AMBIT base URL. Embedded hosts should pass this explicitly. |
| `convertBase` | string | Optional ramanchada-api base for dose-response conversion (`/dataset/convert?format=effectarray`). |
| `token` | string | Bearer token; host owns auth. Omit for public data. Standalone mode may read `?token=`, `sessionStorage`, or `postMessage`. |
| `showDiagrams` | bool | Show structure images in the composition table. |
| `columnConfig` | object | Study column config; accepts the existing jToxKit `config_study` object. |
| `initialTab` | string | Top category to open first, for example `TOX`. |
| `source` | object | Inject a custom data source adapter; defaults to AMBIT REST. |

## Standalone App

The standalone app reads URL params and Vite environment variables in `src/App.jsx`, then
passes props to the reusable `SubstanceStudyViewer` component.

Useful standalone URLs:

- `http://localhost:5175/jtoxkit/?substanceUri=<AMBIT substance URL>`
- `http://localhost:5175/jtoxkit/?substanceId=<uuid>&apiBase=<AMBIT base>&showDiagrams=true`
- `http://localhost:5175/jtoxkit/?substanceId=<uuid>&tab=TOX`

Standalone environment variables are documented in `.env.example`. Embedded hosts should
pass equivalent values as component props instead of relying on this package's Vite env.

## Data Backend (AMBIT)

Data is fetched directly from the **AMBIT REST API**, using the same calls jToxKit makes:
`/substance/{uuid}`, `/substance/{uuid}/studysummary`, per-category study URIs, and
`/substance/{uuid}/composition`.

All backend access is isolated behind a data-source adapter
(`src/data/ambitSource.js`, implementing the interface in `src/data/source.js`). A future
Solr/ramanchada-api adapter can map data to the same AMBIT shape and be injected through
the `source` prop without changing components, configs, or renderers.

## Column Configuration

The study tables are driven by the unchanged jToxKit study config. The bundled default
(`src/config/studyColumns.js`, composed from `i5.js`, `bao.js`, `exposure.js`, and
`npo.js`) is ported verbatim from the legacy nanodata study config. A host can pass its own
object of the same shape via `columnConfig`.

Both modern keys (`title`, `visible`, `order`, `render`) and legacy DataTables keys
(`sTitle`, `bVisible`, `iOrder`) are normalized. `render()` callbacks that return HTML
strings work as-is; they are sanitized and injected through `src/utils/Html.jsx`.

## Development

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

Common commands:

```bash
pnpm test        # vitest unit tests
pnpm build       # standalone app build
pnpm build:lib   # library build: dist/jtoxkit-react.js + dist/style.css
pnpm preview     # preview production app build
```

There are currently no lint, formatter, or typecheck scripts. For code changes, run
`pnpm test` and the relevant build command. For packaging changes, also run
`pnpm peers check`, `pnpm build`, `pnpm build:lib`, and `pnpm pack --dry-run`.

To visually check parity, open the same substance in the existing nanodata-11ty study page
(the live jQuery kit) side-by-side.

## Packaging And Release

The package is published as `@ideaconsult/jtoxkit-react` under the `ideaconsult` npm
organization and is licensed under Apache-2.0. The library build emits
`dist/jtoxkit-react.js` and `dist/style.css`; consumers import the package entry and CSS,
never `src/`.

npm publication is handled by `.github/workflows/publish.yml` using npm trusted
publishing/OIDC and the GitHub `npm` environment. Releases do not use long-lived npm
publish tokens. Release tags must match `package.json` exactly as `vX.Y.Z`.

Local `file:` dependencies are acceptable only for development while iterating across
repositories. They are not a release or CI distribution strategy; hosts such as
`spectrasearch` should consume the semver npm package.

## Architecture

```
src/
  SubstanceStudyViewer.jsx   public component: providers + ViewerBody (load sequence)
  App.jsx                    standalone shell: URL params + Vite env -> viewer props
  index.js                   package entry (default export + useAuth/useViewerConfig/jsambit)
  context/                   AuthContext, ViewerConfig, DataSource providers
  data/                      source.js (adapter contract), ambitSource.js (AMBIT REST)
  hooks/useAmbit.js          load(uri) + {data,loading,error}, aborts in flight
  components/                SubstanceCard, CompositionView, StudyViewer, StudyTable, DataCell
  config/                    config_study (+ i5/bao/exposure/npo), compositionColumns
  utils/                     format, ambit, tables, buildStudyColumns, Html, legacyGlobals
  styles/viewer.css          tokens + base, all scoped under .jtoxkit-root
```

## Known Limitations

- Composition uses the compound fields returned directly by AMBIT; AMBIT `feature`-map
  decoding (jToxKit `processEntry`) is not yet ported.
- The substance card does not yet render a structure image from the reference substance.
- A Solr/ramanchada-api `source` adapter (pyambit Solr-to-AMBIT mapping) is a follow-on.
