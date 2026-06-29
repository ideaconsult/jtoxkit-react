import { useEffect, useMemo, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'
import {
  panelsForStudy,
  primaryDoseAxis,
  toPlotSeries,
  classifyControl,
  seriesLabel,
} from '../jsambit/index.js'
import { buildStudyColumns, buildRepresentativeStudy } from '../utils/buildStudyColumns.js'
import { renderCellHtml } from './DataCell.jsx'
import { Html } from '../utils/Html.jsx'

// Dose-response chart, structured to mirror how pyambit converts AMBIT → NeXus
// (nexus_writer.process_pa / effectarray2data):
//
//   document_uuid (protocol application)  → NXentry   → the selectable unit (never merged)
//   endpointtype                          → NXprocess → a grouping level within the study
//   one EffectArray (endpoint+unit+axis)  → NXdata    → one panel = one Plot
//     primary signal (loValue) + shared axes; arrays that share the same axes/units are
//     overlaid as series (Treatment / time / cell line …), controls drawn as reference
//     lines — the "same plot vs separate" decision follows shared axes, like a NeXus
//     primary signal vs auxiliary signals.
//
// panelsForStudy() keys panels by (endpoint, endpointtype, signal unit, dose-axis unit),
// so units are never mixed on an axis and different endpointtypes stay separate.

// Header fields are sourced from the SAME study config that drives the table (so the
// display is consistent): the config defines e.cell_type → "Cell type", e.exposure_time →
// "Exposure time", e.method → "Method" (bao.js/npo.js/exposure.js). We build the category's
// columns with buildStudyColumns and pick those by their config title, then render their
// values with the config's own render() — identical to the table cell.
const HEADER_TITLE_RE = /cell[\s_]?type|exposure[\s_]?time|(^|[^a-z])method([^a-z]|$)/i

// Render one header column's value for a study using the config render. Per-effect columns
// (conditions like cell type / exposure time) are rendered across all effects and de-duped,
// so a study with several values shows them all.
function renderHeaderValue(col, study) {
  if (col.perEffect && typeof col.renderEffect === 'function') {
    const seen = new Set()
    for (const e of study.effects || []) {
      let h = ''
      try { h = col.renderEffect(e) } catch { h = '' }
      h = String(h ?? '').trim()
      if (h && h !== '-') seen.add(h)
    }
    return [...seen].join(', ')
  }
  const h = renderCellHtml(col, study)
  const s = String(h ?? '').trim()
  return s === '-' ? '' : s
}

// The config-defined context columns (cell type / exposure time / method) for the selected
// raw study, rendered exactly as the table renders them. Returns [{ title, html }].
function configHeaderColumns(study, category, columns) {
  if (!study || !category || !columns) return []
  let cols
  try {
    cols = buildStudyColumns(buildRepresentativeStudy([study]), category, columns)
  } catch {
    return []
  }
  const out = []
  for (const col of cols) {
    if (!HEADER_TITLE_RE.test(String(col.title || ''))) continue
    const html = renderHeaderValue(col, study)
    if (html) out.push({ title: col.title, html })
  }
  return out
}

// Concise dropdown label: owner · protocol/guideline · endpoint(s) (year). Cell type and
// exposure time go in the header above the plot (see provenance), not here.
function studyLabel(study) {
  const c = study.citation || {}
  const p = study.protocol || {}
  const owner = c.owner || study.substance?.ownerName || '?'
  const guide = Array.isArray(p.guideline) ? p.guideline.filter(Boolean).join(', ') : p.guideline || ''
  const proto = guide || p.endpoint || p.category?.title || ''
  const eps = [...new Set((study.arrays || []).map((a) => a.endpoint).filter(Boolean))]
  const epStr = eps.slice(0, 2).join(', ') + (eps.length > 2 ? '…' : '')
  return [owner, proto, epStr].filter(Boolean).join(' · ') + (c.year ? ` (${c.year})` : '')
}

function panelTitle(panel) {
  const et = panel.endpointtype ? ` · ${panel.endpointtype}` : ''
  return `${panel.endpoint || 'response'}${et}`
}

// Build marks-ready data for one panel (one NXdata-equivalent) at a given logX.
function panelData(panel, logX) {
  const points = []
  const lines = []
  const controlMeans = []
  for (const arr of panel.arrays) {
    const isCtl = classifyControl(arr.conditions) !== 'test'
    const series = seriesLabel(arr) // full conditions: Treatment / time / cell line / …
    const pts = toPlotSeries(arr, { logX }).map((p) => ({ ...p, series }))
    if (!pts.length) continue
    points.push(...pts)
    if (isCtl) {
      const mean = pts.reduce((s, p) => s + p.y, 0) / pts.length
      controlMeans.push({ series, y: mean })
    } else {
      lines.push(...pts)
    }
  }
  lines.sort((a, b) => a.x - b.x)
  const axis = primaryDoseAxis(panel.arrays[0]) || {}
  return {
    points,
    lines,
    controlMeans,
    errorPoints: points.filter((p) => p.ylo != null && p.yhi != null),
    xLabel: `Concentration${axis.unit ? ` (${axis.unit})` : ''}`,
    yLabel: `${panel.endpoint || 'response'}${panel.yUnit ? ` (${panel.yUnit})` : ''}`,
  }
}

// One panel = one Plot figure (own ref so multiple panels coexist within a study).
function Panel({ panel, logX }) {
  const ref = useRef(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    const d = panelData(panel, logX)
    const plot = Plot.plot({
      width: host.clientWidth || 640,
      height: 320,
      marginLeft: 56,
      marginBottom: 42,
      grid: true,
      color: { legend: true },
      x: { type: logX ? 'log' : 'linear', label: d.xLabel },
      y: { label: d.yLabel },
      marks: [
        Plot.ruleY([0], { stroke: '#ddd' }),
        Plot.ruleX(d.errorPoints, { x: 'x', y1: 'ylo', y2: 'yhi', stroke: 'series', strokeOpacity: 0.5 }),
        Plot.line(d.lines, { x: 'x', y: 'y', stroke: 'series' }),
        Plot.dot(d.points, { x: 'x', y: 'y', stroke: 'series', fill: 'white', strokeWidth: 1.5, r: 3.5, tip: true }),
        Plot.ruleY(d.controlMeans, { y: 'y', stroke: 'series', strokeDasharray: '4 3', strokeOpacity: 0.85 }),
      ],
    })
    host.append(plot)
    return () => plot.remove()
  }, [panel, logX])
  return (
    <figure className="jtox-dr-panel">
      <figcaption className="jtox-dr-panel-title">{panelTitle(panel)}</figcaption>
      <div className="jtox-dr-plot" ref={ref} />
    </figure>
  )
}

export default function DoseResponseChart({ studies, rawStudies, columns, category }) {
  // Raw AMBIT studies keyed by document_uuid (= study.uuid), for header details the
  // pyambit conversion drops (reliability) or doesn't surface cleanly (cell type / time).
  const rawByUuid = useMemo(() => {
    const m = new Map()
    for (const s of rawStudies || []) if (s.uuid) m.set(s.uuid, s)
    return m
  }, [rawStudies])

  // One option per protocol application (document_uuid).
  const options = useMemo(
    () =>
      (studies || [])
        .filter((s) => s.arrays?.length)
        .map((s) => ({
          study: s,
          raw: rawByUuid.get(s.documentUuid) || null,
          label: studyLabel(s),
          panels: panelsForStudy(s),
        })),
    [studies, rawByUuid]
  )
  const [logX, setLogX] = useState(true)
  const [sel, setSel] = useState(0)

  if (!options.length) return <div className="jtox-empty">No dose-response data for this category.</div>

  const cur = options[Math.min(sel, options.length - 1)]
  const c = cur.study.citation || {}
  const p = cur.study.protocol || {}
  const guideline = Array.isArray(p.guideline) ? p.guideline.filter(Boolean).join(', ') : p.guideline
  // cell type / exposure time / method — rendered from the study config, same as the table
  const headerCols = configHeaderColumns(cur.raw, category, columns)
  const reliability = cur.raw?.reliability?.r_value

  return (
    <div className="jtox-doseresponse">
      <div className="jtox-dr-toolbar">
        {options.length > 1 && (
          <select
            className="jtox-dr-select"
            value={Math.min(sel, options.length - 1)}
            onChange={(e) => setSel(Number(e.target.value))}
            title="Protocol application — one document_uuid = one study"
          >
            {options.map((o, i) => (
              <option key={o.study.documentUuid || i} value={i}>{o.label}</option>
            ))}
          </select>
        )}
        <label className="jtox-dr-logx">
          <input type="checkbox" checked={logX} onChange={(e) => setLogX(e.target.checked)} /> log X
        </label>
      </div>

      {/* provenance of the selected protocol application — makes "what is what" explicit.
          Cell type + exposure time live here (not in the dropdown) so the dropdown stays scannable. */}
      <div className="jtox-dr-provenance">
        {c.owner && <span><strong>Owner:</strong> {c.owner}</span>}
        {guideline && <span><strong>Protocol:</strong> {guideline}</span>}
        {headerCols.map((h, i) => (
          <span key={i}><strong>{h.title}:</strong> <Html html={h.html} /></span>
        ))}
        {reliability && <span><strong>Reliability:</strong> {reliability}</span>}
        {c.title && <span><strong>Citation:</strong> {c.title}{c.year ? ` (${c.year})` : ''}</span>}
        {cur.study.documentUuid && (
          <span className="jtox-mono"><strong>Document:</strong> {cur.study.documentUuid}</span>
        )}
      </div>

      {cur.panels.map((panel, i) => (
        <Panel key={(panel.key || '') + i} panel={panel} logX={logX} />
      ))}
    </div>
  )
}
