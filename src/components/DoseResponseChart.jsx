import { useEffect, useMemo, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'
import {
  panelsForStudy,
  primaryDoseAxis,
  toPlotSeries,
  classifyControl,
  seriesLabel,
} from '../jsambit/index.js'

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

// Header fields are declared in the SAME study config that drives the table, via an
// `inHeader: true` flag (sibling to the existing `inMatrix`) on the field — e.g. e.cell_type
// → "Cell type", e.exposure_time → "Exposure time", e.method → "Method" (bao.js/npo.js/
// exposure.js). These fields are visible:false (shown inside the Protocol cell, not as their
// own column), so we read the flag straight from the config rather than from built columns.
const HEADER_GROUPS = ['conditions', 'parameters', 'effects', 'protocol', 'main', 'interpretation']

// Collect { key, title, group } for every field flagged inHeader in the category config
// (category overrides the `_` defaults, deduped by group+key).
function configHeaderFields(columns, category) {
  if (!columns) return []
  const found = new Map()
  for (const cat of ['_', category]) {
    const node = columns[cat]
    if (!node) continue
    for (const group of HEADER_GROUPS) {
      const g = node[group]
      if (!g || typeof g !== 'object') continue
      for (const [key, def] of Object.entries(g)) {
        if (def && typeof def === 'object' && def.inHeader === true) {
          found.set(group + '|' + key, { key, title: def.title || key, group })
        }
      }
    }
  }
  return [...found.values()]
}

// Render an AMBIT value (string/number or {loValue,unit,textValue}) with optional companion unit.
function fmtVal(v, unit) {
  if (v == null) return ''
  if (typeof v === 'object') {
    const u = unit || v.unit || ''
    if (v.textValue) return String(v.textValue)
    const lo = v.loValue
    return (lo != null ? String(lo) : '') + (u ? ' ' + u : '')
  }
  return String(v) + (unit ? ' ' + unit : '')
}

// Distinct values of one inHeader field for the selected option, found case-insensitively
// in the raw study (effect conditions / study parameters) and the converted arrays.
function headerFieldValue(field, opt) {
  const lk = field.key.toLowerCase()
  const vals = new Set()
  const collect = (obj) => {
    if (!obj) return
    for (const [k, v] of Object.entries(obj)) {
      if (/ unit$/.test(k) || k.toLowerCase() !== lk || v == null) continue
      const s = fmtVal(v, obj[k + ' unit']).trim()
      if (s && s !== '-') vals.add(s)
    }
  }
  if (field.group === 'parameters' || field.group === 'main') {
    collect(opt.raw?.parameters)
  } else {
    for (const e of opt.raw?.effects || []) collect(e.conditions)
    for (const a of opt.study?.arrays || []) collect(a.conditions)
  }
  return [...vals].join(', ')
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
  // Header context fields declared in the study config via `inHeader` (cell type / exposure
  // time / method / species …) — same config that drives the table, so titles are consistent.
  // (Plain const, not useMemo: this runs after the early return above — Rules of Hooks.)
  const headerItems = configHeaderFields(columns, category)
    .map((f) => ({ title: f.title, value: headerFieldValue(f, cur) }))
    .filter((h) => h.value)
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
        {headerItems.map((h, i) => (
          <span key={i}><strong>{h.title}:</strong> {h.value}</span>
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
