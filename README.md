# @ideaconsult/jtoxkit-react

An embeddable **React** viewer for eNanoMapper/AMBIT **substance**, **composition** and
**study** data. It is a modern rewrite of the study/substance viewers from the legacy
jQuery [jToxKit](https://github.com/ideaconsult/jToxKit) (`StudyKit`, `SubstanceKit`,
`CompositionKit`), packaged like [`@adma/qubounds-viewer`](../qubounds-viewer) so it can be
embedded in React apps (e.g. `spectrasearch-viewers`) or run standalone.

The legacy jToxKit remains in use by static (Eleventy/jQuery) sites; this package targets
React hosts and does **not** replace it there.

## What it shows

Given one substance, it renders the same things the jToxKit study page does:

- **Substance card** — public name, type, owner, UUID, external identifiers.
- **Composition** — ingredient table(s) grouped by composition, with concentrations and
  (optionally) structure diagrams.
- **Studies** — tabs per top category (P‑Chem, Env Fate, Eco Tox, Tox); each tab lazily
  loads its studies and groups them by protocol category into tables with dynamic,
  per‑category columns (parameters, conditions, multi‑effect results, protocol), a filter
  box, and expand/collapse.

## Data backend (AMBIT)

Data is fetched directly from the **AMBIT REST API** — the same calls jToxKit makes
(`/substance/{uuid}`, `/substance/{uuid}/studysummary`, the per‑category study URI, and
`/substance/{uuid}/composition`). All backend access is isolated behind a small
**data‑source adapter** (`src/data/ambitSource.js` implementing the interface in
`src/data/source.js`), so a Solr/ramanchada-api adapter that maps to the same AMBIT shape
can be dropped in later (via the `source` prop) without touching the components.

## Install / embed

```bash
npm run build:lib   # emits dist/jtoxkit-react.js + dist/style.css
```

```jsx
import SubstanceStudyViewer from '@ideaconsult/jtoxkit-react'
import '@ideaconsult/jtoxkit-react/style.css'

<SubstanceStudyViewer
  substanceUri="https://apps.ideaconsult.net/nanoreg1/substance/XXXX-….."
  token={keycloakToken}            // optional; omit for public data
  apiBase="https://apps.ideaconsult.net/nanoreg1/"
  showDiagrams
/>
```

When embedding in another Vite app (as `spectrasearch-viewers` does with qubounds), make
sure React is deduped so hooks share one instance:

```js
// vite.config.js
resolve: { dedupe: ['react', 'react-dom'] }
```

### Props

| Prop | Type | Notes |
| --- | --- | --- |
| `substanceUri` | string | Full AMBIT substance URL. |
| `substanceId` | string | UUID; resolved against `apiBase` if `substanceUri` is absent. |
| `apiBase` | string | AMBIT base URL (defaults to `VITE_AMBIT_URL`). |
| `token` | string | Bearer token; host owns auth. Omit ⇒ standalone reads `?token=`/sessionStorage. |
| `showDiagrams` | bool | Show structure images in the composition table. |
| `columnConfig` | object | Study column config — **accepts the existing jToxKit `config_study` object** (see below). |
| `initialTab` | string | Top category to open first (e.g. `TOX`). |
| `source` | object | Inject a custom data source adapter (defaults to AMBIT). |

## Column configuration (same as jToxKit)

The study tables are driven by the **unchanged** jToxKit study config. The bundled default
(`src/config/studyColumns.js`, i.e. `config_study`, composed from `i5.js`/`bao.js`/
`exposure.js`/`npo.js`) is ported verbatim from
`nanodata-11ty-develop-kc/assets/js/study/`. A host can pass its own object of the same
shape via `columnConfig`.

Both modern (`title`/`visible`/`order`/`render`) and legacy DataTables keys
(`sTitle`/`bVisible`/`iOrder`) are honored, and `render()` callbacks that return **HTML
strings** work as-is — they are sanitized and injected (`src/utils/Html.jsx`). So existing
per-category customizations carry over without changes.

## Develop / test

```bash
npm run dev     # standalone dev server (Vite), e.g.:
#   http://localhost:5175/jtoxkit/?substanceUri=<AMBIT substance URL>
#   http://localhost:5175/jtoxkit/?substanceId=<uuid>&apiBase=<AMBIT base>&showDiagrams=true
npm test        # vitest unit tests (formatters, column config, study columns, AMBIT source)
npm run build   # standalone app build
npm run build:lib  # library (ESM + style.css)
```

To visually check parity, open the same substance in the existing nanodata-11ty study page
(the live jQuery kit) side‑by‑side.

## Architecture

```
src/
  SubstanceStudyViewer.jsx   public component: providers + ViewerBody (load sequence)
  index.js                   package entry (default export + useAuth/useViewerConfig)
  context/                   AuthContext, ViewerConfig, DataSource (providers)
  data/                      source.js (adapter contract), ambitSource.js (AMBIT REST)
  hooks/useAmbit.js          load(uri) + {data,loading,error}, aborts in flight
  components/                SubstanceCard, CompositionView, StudyViewer, StudyTable, DataCell
  config/                    config_study (+ i5/bao/exposure/npo), compositionColumns
  utils/                     format (renderRange/valueAndUnits), ambit (ext ids/diagram),
                             tables (col-def merge/normalize), buildStudyColumns, Html (shim)
  styles/viewer.css          tokens + base, all scoped under .jtoxkit-root
```

## Known limitations / follow-ons

- Composition uses the compound fields returned directly by AMBIT; AMBIT `feature`-map
  decoding (jToxKit `processEntry`) is not yet ported.
- The substance card does not yet render a structure image from the reference substance.
- A Solr/ramanchada-api `source` adapter (pyambit Solr↔AMBIT mapping) is a follow-on.
